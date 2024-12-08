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
import { InstructionParam } from "../types/uiTypes";
import { uiApi } from "../api/ui";


// String Manipulation Utilities
// -----------------------------
export const pascalToSnake = (pascalStr: string): string => {
  return pascalStr
    .replace(/([A-Z])/g, '_$1') 
    .toLowerCase()             
    .replace(/^_/, '');        
};
export const toLowerCaseFirstLetter = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toLowerCase() + str.slice(1);
};
export const removeSpaces = (str: string): string => { return str.replace(/\s+/g, ''); };
export const removeRunPrefix = (str: string): string => { return str.startsWith("Run") ? str.slice(3) : str; };

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

    const sdkTemplate = await getSdkTemplate(
      _projectClassName, 
      _projectFieldName, 
      projectContext.id, 
      instructions, 
      accounts, 
      instructionNodes,
      aiInstructions,
      _rootPath, 
      _idlPath, 
      _walletPublicKey,
      projectContext,
      setProjectContext,
      setIsPolling,
      setIsLoading,
      addLog,
      user
    );
    //console.log('sdkTemplate', sdkTemplate);
    
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

export const parseIdl = (
  idl: string,
  setProjectContext: Dispatch<SetStateAction<Project>>
): { instructions: Instruction[], accounts: Account[] } | undefined => {
  try {
    if (!idl) throw new Error('IDL content not found');
    const idlObject: Idl = JSON.parse(idl);

    console.log('idlObject', idlObject);

    const instructions = idlObject.instructions.map((inst: any) => ({
      name: inst.name,
      description: inst.docs?.join(' ') || 'No description available',
      params: inst.args.map((arg: any) => ({
        name: arg.name,
        type: typeof arg.type === 'string'
          ? arg.type
          : arg.type?.defined || 'unknown',
        defaultValue: arg.default || null,
        description: arg.docs?.join(' ') || 'No description available',
      })),
      context: {
        accounts: inst.accounts.map((acc: any) => ({
          name: acc.name,
          isSigner: acc.isSigner || false,
          isWritable: acc.isMut || false,
        })),
      },
    }));

    const accounts = idlObject.accounts?.map((acc: any) => ({
      name: acc.name,
      description: acc.docs?.join(' ') || 'No description available',
      fields: acc.type?.fields?.map((field: any) => ({
        name: field.name,
        type: typeof field.type === 'string'
          ? field.type
          : field.type?.defined || 'unknown',
      })) || [],
    })) || [];

    setProjectContext((prev) => ({
      ...prev,
      details: {
        ...prev.details,
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

export const getIdlContents = async (
  projectId: string, 
  projectContext: Project,
  setIsPolling: Dispatch<SetStateAction<boolean>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  addLog: (message: string, type: LogEntry['type']) => void
): Promise<string | undefined> => {
  try {
    const idlPath = `/target/idl/counter_program.json`;
    const response = await fileApi.getFileContent(projectId, idlPath);
    const { fileContent } = await startPollingTaskStatus(response.taskId, setIsPolling, setIsLoading, addLog);
    //console.log('fileContent', fileContent);
    if (!fileContent) throw new Error('No IDL content found');
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
    const idlContent = await getIdlContents(projectId, projectContext, setIsPolling, setIsLoading, addLog);
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