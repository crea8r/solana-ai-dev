import { Dispatch, SetStateAction } from "react";
import { Project } from "../interfaces/project";
import { LogEntry } from "../hooks/useTerminalLogs";
import { InstructionParam } from "../types/uiTypes";

import { Instruction } from "../types/uiTypes";
import { fileApi } from "../api/file";
import { startPollingTaskStatus } from "./codePageUtils";


// ----------------------------
// String utils
// ----------------------------
export const toCamelCase = (str: string): string => {
  const snakeToCamel = str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  return snakeToCamel.charAt(0).toLowerCase() + snakeToCamel.slice(1);
};

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

export const amendTsConfigFile = async (
  projectContext: Project,
  setIsPolling: Dispatch<SetStateAction<boolean>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  addLog: (message: string, type: LogEntry['type']) => void
  ) => {
    const tsConfigPath = '/tsconfig.json';
  
    try {
      const response = await fileApi.getFileContent(projectContext.id, tsConfigPath);
      const { fileContent } = await startPollingTaskStatus(response.taskId, setIsPolling, setIsLoading, addLog);
      if (!fileContent) throw new Error('No tsconfig.json content found');
      const tsConfig = JSON.parse(fileContent);
      tsConfig.compilerOptions = {
        ...tsConfig.compilerOptions,
        resolveJsonModule: true,
      };
      const updatedContent = JSON.stringify(tsConfig, null, 2);
      const res = await fileApi.updateFile(projectContext.id, tsConfigPath, updatedContent);
      const { status } = await startPollingTaskStatus(res.taskId, setIsPolling, setIsLoading, addLog);
      if (status !== 'succeed') throw new Error('Failed to update tsconfig.json');
    } catch (error) { console.error('Error amending tsconfig.json:', error); }  
  };
      