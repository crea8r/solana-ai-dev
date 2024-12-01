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
import { getSdkTemplate } from "../data/fileTemplates";
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

// -----------------------------
// Generate UI
// -----------------------------

export const generateUISpace = async () => {
  
};

export const generateSdk = async (
  projectContext: Project,
  setProjectContext: Dispatch<SetStateAction<Project>>,
  instructions: Instruction[],
  accounts: Account[]
) => {
  const sdkTemplate = getSdkTemplate(projectContext.name, projectContext.id, instructions, accounts);
    
    setProjectContext((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        sdk: { fileName: 'sdk.rs', content: sdkTemplate },
      },
    }));
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
      params: inst.args.map((arg: any) => arg.name),
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
        type: typeof field.type === 'string' ? field.type : 'unknown',
      })) || [],
    })) || [];

    setProjectContext((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        parsed: { instructions, accounts },
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
  user: User,
) => {
  setIsTaskModalOpen(true);
  console.log('handleGenerateUI');
  if (!user) throw new Error('User in auth context not found');
  try {
    const idlContent = await getIdlContents(projectId, projectContext, setIsPolling, setIsLoading, addLog);
    //console.log('idlContent', idlContent);
    if (!idlContent) throw new Error('No IDL content found');
    const parsedIdl = parseIdl(idlContent, setProjectContext);
    if (!parsedIdl) throw new Error('Error parsing IDL');
    const { instructions, accounts } = parsedIdl;
    console.log('instructions', instructions);
    console.log('accounts', accounts);

    await generateSdk(projectContext, setProjectContext, instructions, accounts);
    const generatedUi = await generateUISpace();
    // install packages
      

  } catch (error) { console.error('Error checking directory existence:', error); }



};