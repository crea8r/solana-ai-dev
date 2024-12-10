import { uiPrompt } from "../prompts/genUI";
import { promptAI } from "../services/prompt";
import uiSchema from "../data/ai_schema/uiSchema.json";
import { Idl } from '@coral-xyz/anchor';
import { UseToastOptions } from "@chakra-ui/react";
import { Project } from "../interfaces/project";
import { Dispatch, SetStateAction } from "react";
import { User } from "../contexts/AuthContext"; 
import { fileApi } from "../api/file";
import { projectApi } from "../api/project";
import { getSdkTemplate } from "../data/templates/sdkTemplate";
import { 
  Instruction, 
  InstructionContextAccount, 
  Account, 
  InstructionCard, 
  InstructionCardParamField 
} from "../types/uiTypes";
import path from "path-browserify";
import { startPollingTaskStatus } from "./codePageUtils";
import { LogEntry } from "../hooks/useTerminalLogs";
import { InstructionParam, PDA, PdaInfo } from "../types/uiTypes";
import { uiApi } from "../api/ui";
import { getUser } from "../services/authApi";


// String Manipulation Utilities
// -----------------------------
export const pascalToSnake = (pascalStr: string): string => {
  return pascalStr
    .replace(/([A-Z])/g, '_$1') 
    .toLowerCase()             
    .replace(/^_/, '');        
};
export const toSnakeCase = (str: string): string => {
  return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/\s+/g, '_')
      .toLowerCase();
}
export const toLowerCaseFirstLetter = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toLowerCase() + str.slice(1);
};
export const removeSpaces = (str: string): string => { return str.replace(/\s+/g, ''); };
export const removeRunPrefix = (str: string): string => { return str.startsWith("Run") ? str.slice(3) : str; };

export const toCamelCase = (str: string): string => str.replace(/_([a-zA-Z0-9])/g, (match, letter) => letter.toUpperCase());

// Instruction Utilities
// -----------------------------
export const handleCallInstruction = async (sdkFunction: any, inputs: any) => {
  try {
    const result = await sdkFunction(...inputs);
    console.log("Instruction Result:", result);
  } catch (error) {
    console.error("Error calling instruction:", error);
  }
};
export const handleInputChange = (
  instructionKey: string,
  paramIdx: number,
  value: string,
  setInstructionInputs: React.Dispatch<React.SetStateAction<{ [key: string]: string[] }>>
) => {
  setInstructionInputs((prev) => {
    const prevInputs = prev[instructionKey] || [];
    const newInputs = [...prevInputs];
    newInputs[paramIdx] = value;
    return {
      ...prev,
      [instructionKey]: newInputs,
    };
  });
};

// Generate UI/SDK Utilities
// -----------------------------

export const processInstructions = (
  instructions: Instruction[],
  instructionNodes: { data: { label: string; item?: { description?: string } } }[],
  aiInstructions: { function_name: string; description?: string; params_fields: InstructionParam[] }[]
): Instruction[] => {
  return instructions.map((instruction) => {
    const matchingNode = instructionNodes.find(
      (node) => node.data.label === instruction.name
    );

    const matchingAIInstruction = aiInstructions.find( (aiInstruction) => aiInstruction.function_name === instruction.name );

    return {
      ...instruction,
      description:
        matchingAIInstruction?.description ||
        matchingNode?.data?.item?.description ||
        instruction.description ||
        'No description available',
      params: matchingAIInstruction?.params_fields || instruction.params || [],
    };
  });
};

export const generateSdk = async (
  projectContext: Project,
  setProjectContext: Dispatch<SetStateAction<Project>>,
  instructions: Instruction[],
  accounts: Account[],
  setIsPolling: Dispatch<SetStateAction<boolean>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  addLog: (message: string, type: LogEntry['type']) => void,
  user: User
) => {
  try {
    const _rootPath = projectContext.rootPath;
    const _projectClassName = removeSpaces(projectContext.name);
    const _projectFieldName = toLowerCaseFirstLetter(_projectClassName);
    let _idlPath = pascalToSnake(_projectClassName);
    _idlPath = `/target/idl/${_idlPath}.json`;
    const _walletPublicKey = projectContext.walletPublicKey;

    console.log('instructions', instructions);
    console.log('param names', instructions.map(inst => inst.params.map(param => param.name)));

    const instructionNodes = projectContext.details.nodes;
    const aiInstructions = projectContext.details.aiInstructions;

    if (!projectContext.details.programId) throw new Error('Program ID not found');
    if (!projectContext.details.pdas) throw new Error('PDAs not found');

    console.log('pdas', projectContext.details.pdas);

    const fetchedUser = await getUser();
    console.log('fetchedUser', fetchedUser);
    const _walletPrivateKey = fetchedUser.wallet_private_key;
    console.log('wallet private key- uiutils', _walletPrivateKey);

    const sdkTemplate = await getSdkTemplate(
      _projectClassName, 
      _projectFieldName, 
      projectContext.details.programId, 
      instructions, 
      projectContext.details.pdas,
      accounts, 
      instructionNodes,
      aiInstructions,
      _rootPath, 
      _idlPath, 
      _walletPublicKey,
      _walletPrivateKey,
      projectContext,
      setProjectContext,
      setIsPolling,
      setIsLoading,
      addLog,
      user
    );
    //console.log('sdkTemplate', sdkTemplate);

    await projectApi.installPackages(projectContext.id);
    
    setProjectContext((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        sdk: { fileName: 'index.ts', content: sdkTemplate },
      },
    }));

    const filePath = `/sdk/index.ts`;

    // check if file already exists
    if (projectContext.details.sdk.fileName === 'index.ts') {
      // update file
      const res = await fileApi.updateFile(projectContext.id, filePath, sdkTemplate);
      const { status } = await startPollingTaskStatus(res.taskId, setIsPolling, setIsLoading, addLog);
      console.log('status', status);
      if (status !== 'succeed') throw new Error('Failed to update SDK');
      return;
    } else {
      // create file
      console.log('creating file');
      const res = await fileApi.createFile(projectContext.id, filePath, sdkTemplate);
      const { status } = await startPollingTaskStatus(res.taskId, setIsPolling, setIsLoading, addLog);
      console.log('status', status);
      if (status !== 'succeed') throw new Error('Failed to create SDK');
    }
  } catch (error) { console.error('Error generating SDK:', error); }
} 

export const getIdlContents = async (
  _idlFileName: string,
  projectId: string, 
  setProjectContext: Dispatch<SetStateAction<Project>>,
  setIsPolling: Dispatch<SetStateAction<boolean>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  addLog: (message: string, type: LogEntry['type']) => void
): Promise<string | undefined> => {
  try {
    if (!_idlFileName) throw new Error('No IDL file name found');
    console.log('idlFileName', _idlFileName);
    const idlPath = `/target/idl/${_idlFileName}.json`;
    const response = await fileApi.getFileContent(projectId, idlPath);
    const { fileContent } = await startPollingTaskStatus(response.taskId, setIsPolling, setIsLoading, addLog);
    if (fileContent) {
      setProjectContext((prev) => ({ 
        ...prev, 
        details: { 
          ...prev.details, 
          idl: { 
            ...prev.details.idl, 
            fileName: _idlFileName,
            content: fileContent 
          } 
        } 
      }));
    } else throw new Error('No IDL content found');

    return fileContent;
  } catch (error) { console.error('Error getting IDL contents from server:', error); return undefined; } 
}

export const handleGenerateUI = async (
  projectId: string,
  projectContext: Project,
  setProjectContext: Dispatch<SetStateAction<Project>>,
  setIsPolling: Dispatch<SetStateAction<boolean>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  addLog: (message: string, type: LogEntry['type']) => void,
  setIsTaskModalOpen: Dispatch<SetStateAction<boolean>>,
  user: User
) => {
  setIsTaskModalOpen(true);
  console.log('handleGenerateUI');
  if (!user) throw new Error('User not found');
  try {
    const _idlFileName = projectContext.details.idl.fileName ? projectContext.details.idl.fileName : toSnakeCase(projectContext.name);
    const idlContent = await getIdlContents( _idlFileName, projectId, setProjectContext, setIsPolling, setIsLoading, addLog);
    if (!idlContent) throw new Error('No IDL content found');
    const parsedIdl = parseIdl(idlContent, setProjectContext);
    if (!parsedIdl) throw new Error('Error parsing IDL');

    const { instructions, accounts } = parsedIdl;
    console.log('instructions', instructions);
    console.log('accounts', accounts);

    await generateSdk(projectContext, setProjectContext, instructions, accounts, setIsPolling, setIsLoading, addLog, user);
    setProjectContext((prev) => ({ ...prev, details: { ...prev.details, genUiClicked: true } }));
    console.log('genUiClicked', projectContext.details.genUiClicked);
    await uiApi.compileTsFile(projectId, user.id);

  } catch (error) { console.error('Error checking directory existence:', error); }
};


// IDL Utilities
// -----------------------------

const extractDefinedTypeFields = (typeName: string, idl: Idl): { name: string; type: string }[] => {
  const idlType = idl.types?.find((typeDef: any) => typeDef.name === typeName);
  
  if (!idlType || idlType.type.kind !== 'struct' || !idlType.type.fields) return [];
  
  return idlType.type.fields.map((field: any) => ({
    name: field.name,
    type: typeof field.type === 'string' ? field.type : field.type?.defined || 'unknown',
  }));
};

export const parseIdl = (
  idl: string,
  setProjectContext: Dispatch<SetStateAction<Project>>
): { instructions: Instruction[], accounts: Account[] } | undefined => {
  try {
    if (!idl) throw new Error('IDL content not found');
    const idlObject: Idl = JSON.parse(idl);

    const pdas: PdaInfo[] = [];

    // First Pass: Collect PDAs
    idlObject.instructions.forEach((inst: any) => {
      inst.accounts.forEach((acc: any) => {
        if (acc.pda) {
          pdas.push({
            name: acc.name,
            isInitialized: false, 
            address: null,
            initializerFunction: inst.name,
            seeds: acc.pda.seeds.map((seed: any) => ({
              kind: seed.kind,
              value: seed.value || undefined,
              path: seed.path || undefined,
            }))
          });
        }
      });
    });

    // Second Pass: Parse Instructions and Mark PDAs
    const instructions: Instruction[] = idlObject.instructions.map((inst: any) => {
      const params = inst.args.flatMap((arg: any) => {
        if (typeof arg.type === 'string') {
          return [{
            name: arg.name,
            type: arg.type,
            defaultValue: arg.default || null,
            description: arg.docs?.join(' ') || 'No description available',
          }];
        } else if (typeof arg.type === 'object' && 'defined' in arg.type) {
          const typeName = arg.type.defined;
          const fields = extractDefinedTypeFields(typeName, idlObject);
          return fields.map((field) => ({
            name: field.name,
            type: field.type,
            defaultValue: null,
            description: `Field from defined type ${typeName}`,
          }));
        } else {
          return [{
            name: arg.name,
            type: 'unknown',
            defaultValue: null,
            description: 'No description available',
          }];
        }
      });

      const context = {
        accounts: inst.accounts.map((acc: any) => {
          const pdaInfo = pdas.find((pda) => pda.name === acc.name);
          const isSystemAccount = 
            acc.address === "11111111111111111111111111111111" || 
            ['systemProgram', 'rent', 'clock', 'associatedTokenProgram', 'tokenProgram'].includes(acc.name);
          
          if (pdaInfo) {
            if (inst.name === pdaInfo.initializerFunction) {
              return {
                name: acc.name,
                isSigner: acc.signer || false,
                isWritable: acc.writable || false,
                pda: {
                  seeds: pdaInfo.seeds
                },
                systemAccount: isSystemAccount,
                address: acc.address || null,
              } as InstructionContextAccount;
            }
            return {
              name: acc.name,
              isSigner: acc.signer || false,
              isWritable: acc.writable || false,
              pda: true,
              systemAccount: isSystemAccount,
              address: acc.address || null,
            } as InstructionContextAccount;
          }

          return {
            name: acc.name,
            isSigner: acc.signer || false,
            isWritable: acc.writable || false,
            systemAccount: isSystemAccount,
            address: acc.address || null,
          } as InstructionContextAccount;
        })
      };

      return {
        name: inst.name,
        description: inst.docs?.join(' ') || 'No description available',
        params,
        context,
      } as Instruction;
    });

    // Parse Accounts
    const accounts: Account[] = idlObject.accounts?.map((acc: any) => ({
      name: acc.name,
      description: acc.docs?.join(' ') || 'No description available',
      fields: acc.type?.fields?.map((field: any) => ({
        name: field.name,
        type: typeof field.type === 'string' ? field.type : field.type?.defined || 'unknown',
      })) || [],
    } as Account)) || [];

    setProjectContext((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        pdas: pdas,
        idl: {
          ...prev.details.idl,
          parsed: { instructions, accounts },
        },
      },
    }));

    return { instructions, accounts };
  } catch (error) {
    console.error('Error parsing IDL:', error);
    return undefined;
  }
};

// UI Utilities
// -----------------------------
export const callInstruction = async (
  instruction: Instruction,
  params: { [key: string]: string },
  sdk: any
) => {
  try {
    console.log(`Calling ${instruction.name} with params:`, params);

    const convertedParams = Object.entries(params).reduce((acc, [key, value]) => {
      acc[key] = key === "user" || key === "initializer" ? new sdk.web3.PublicKey(value) : value;
      return acc;
    }, {} as any);

    switch (instruction.name) {
      case "run_initialize_counter":
        await sdk.run_initialize_counter(convertedParams.initializer, sdk.web3.SystemProgram.programId);
        break;
      case "run_increment_counter":
        await sdk.run_increment_counter(convertedParams.user, convertedParams.counterAccount);
        break;
      case "run_reset_counter":
        await sdk.run_reset_counter(convertedParams.counterAccount, convertedParams.initializer);
        break;
      default:
        console.error(`Unsupported instruction: ${instruction.name}`);
    }
  } catch (error) {
    console.error("Error calling instruction:", error);
  }
};



