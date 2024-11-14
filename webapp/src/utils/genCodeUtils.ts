import { fileApi } from '../api/file';
import { taskApi } from '../api/task';
import { FileTreeItemType } from '../components/FileTree';
import { parse, stringify } from 'smol-toml'
import { getLibRsTemplate, getModRsTemplate } from '../data/fileTemplates';
import { useToast, UseToastOptions } from '@chakra-ui/react';

type CargoToml = {
  package?: { name?: string; };
  lib?: { name?: string; };
};

type RootAnchorToml = {
  programs?: {
    localnet?: {
      [key: string]: string;
    };
  };
};

const pollTaskStatus = (taskId: string, pollDesc: string): Promise<string> => {
  return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
          try {
              const { task } = await taskApi.getTask(taskId);
              console.log('task', task);

              if (task.status === 'succeed' || task.status === 'warning') {
                  console.log(`${pollDesc} succeeded.`);
                  clearInterval(interval);
                  if (task.result) {
                    resolve(task.result);
                  } else {
                    reject(new Error('Task result is undefined'));
                  }

              } else if (task.status === 'failed') {
                  clearInterval(interval);
                  reject(new Error('Task failed'));
              }
          } catch (error) {
              console.error('Error fetching task status:', error);
              clearInterval(interval);
              reject(error);
          }
      }, 2000);
  });
};

export function setFileTreePaths(
    item: FileTreeItemType,
    parentPath: string = ''
): void {
    const currentPath = parentPath ? `${parentPath}/${item.name}` : item.name;
    item.path = currentPath;
  
    if (item.children) {
      for (const child of item.children) {
        setFileTreePaths(child, currentPath);
      }
    }
}

export function getFileList(
    item: FileTreeItemType,
    fileList: { name: string; path: string }[] = []
): { name: string; path: string }[] {
    if (item.children && item.children.length > 0) {
        for (const child of item.children) {
            getFileList(child, fileList);
        }
    } else {
        fileList.push({ name: item.name, path: item.path || item.name });
    }
    return fileList;
};

export function extractCodeBlock(text: string): string {
    const lines = text.split('\n');
    let isInCodeBlock = false;
    const codeBlockLines: string[] = [];
  
    for (const line of lines) {
      if (line.trim().startsWith('```')) {
        if (isInCodeBlock) {
          break; // End of code block
        } else {
          isInCodeBlock = true; // Start of code block
          continue; // Skip the opening ```
        }
      }
  
      if (isInCodeBlock) {
        codeBlockLines.push(line);
      }
    }
  
    return codeBlockLines.join('\n');
}

export const amendConfigFile = async (
  projectId: string,
  fileName: string,
  filePath: string,
  programName: string,
): Promise<string> => {
  //const filePath = await fileApi.getFilePath(projectId, fileName);
  console.log('amendConfigFile filePath', filePath);
  let _pollDesc;
  const oldContentResponse = await fileApi.getFileContent(projectId, filePath);
  const taskId = oldContentResponse.taskId;
  _pollDesc = `Getting ${fileName} content to amend content.`;
  const oldContent = await pollTaskStatus(taskId, _pollDesc);

  let parsedToml;
  let updatedToml;

  if (fileName === 'Cargo.toml') {
    parsedToml = parse(oldContent) as CargoToml;
    if (parsedToml.package) parsedToml.package.name = programName;
    if (parsedToml.lib) parsedToml.lib.name = programName;
  } 
  else if (fileName === 'Anchor.toml') {
    parsedToml = parse(oldContent) as RootAnchorToml;

    if (parsedToml.programs?.localnet) {
      const localnet = parsedToml.programs.localnet;
      
      // Get the first key-value pair in localnet (assuming there’s only one entry)
      const [oldKey, address] = Object.entries(localnet)[0];

      // Replace the old key with the new program name, keeping the address
      delete localnet[oldKey];
      localnet[programName] = address;
    }
  }

  updatedToml = stringify(parsedToml);

  const res = await fileApi.updateFile(projectId, filePath, updatedToml);
  _pollDesc = `Updating ${fileName} content.`;
  const updatedFileContent = await pollTaskStatus(res.taskId, _pollDesc);
  return updatedFileContent;
}

export const ensureInstructionNaming = async (
  projectId: string,
  _instructionPaths: string[],
  aiProgramDirectoryName: string
): Promise<void> => {
  if (!_instructionPaths) return;

  const instructionPaths = _instructionPaths.filter(
    (filePath) =>
      !filePath.endsWith('mod.rs')
  );

  for (const filePath of instructionPaths) {
    try {
      const fileContentResponse = await fileApi.getFileContent(projectId, filePath);
      const taskId = fileContentResponse.taskId;
      const pollDesc = `Getting ${filePath} content to change function names.`;
      const fileContent = await pollTaskStatus(taskId, pollDesc);

      const updatedContent = fileContent.replace(
        /pub fn\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
        (match, functionName) => {
          if (!functionName.startsWith('run_')) {
            const newFunctionName = `run_${functionName}`;
            console.log(`Renaming function: ${functionName} to ${newFunctionName}`);
            return `pub fn ${newFunctionName}`;
          }
          return match;
        }
      );

      if (updatedContent !== fileContent) {
        await fileApi.updateFile(projectId, filePath, updatedContent);
        console.log(`Updated function names in ${filePath}`);
      }
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
    }
  }
};

export const sortFilesByPriority = (files: FileTreeItemType[], aiProgramDirectoryName: string): FileTreeItemType[] => {
  return files.sort((a, b) => {
      const getPriority = (file: FileTreeItemType): number => {
        if (file.path?.endsWith('state.rs')) return 1; // Highest priority
        if (file.path?.includes('/instructions/')) return 2; // Medium priority
        if (file.path?.endsWith('lib.rs')) return 3; // Lower priority
        return 4; // Lowest priority
      };

      return getPriority(a) - getPriority(b);
  });
};

export const normalizeName = (name: string): string => {
  if (!name) {
    throw new Error('Name cannot be empty');
  }
  return name
    .trim() // Remove leading and trailing whitespace
    .replace(/([a-z])([A-Z])/g, '$1_$2') // Add underscore before each capital letter
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .toLowerCase() // Convert the entire string to lowercase
    .replace(/[^a-z0-9_]+/g, '') // Remove non-alphanumeric characters except underscores
    .replace(/^_+|_+$/g, ''); // Remove leading or trailing underscores
};


export const getNormalizedInstructionNames = (
  nodes: { type: string; data: { label: string } }[]
): string[] => {
  return nodes
    .filter(node => node.type === 'instruction')
    .map(node => node.data.label)
    .filter(Boolean)
    .map(label => `run_${normalizeName(label)}`);
};

export const snakeToPascal = (snakeStr: string): string => {
  return snakeStr
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

export const insertTemplateFiles = async (
  projectId: string,
  programDirName: string,
  existingFilePaths: Set<string>,
  instructions: string[],
  libRsPath: string,
  modRsPath: string,
  programId: string
) => {
  const libRsContent = getLibRsTemplate(programDirName, programId, instructions);
  const modRsContent = getModRsTemplate(instructions);

  try {
    if (!existingFilePaths.has(libRsPath)) {
      await fileApi.createFile(projectId, libRsPath, libRsContent);
      console.log(`Created template file: ${libRsPath}`);
    } else {
      console.log(`Template file already exists: ${libRsPath}`);
    }
  } catch (error) {
    console.error(`Error creating template file ${libRsPath}:`, error);
  }

  try {
    if (!existingFilePaths.has(modRsPath)) {
      await fileApi.createFile(projectId, modRsPath, modRsContent);
      console.log(`Created template file: ${modRsPath}`);
    } else {
      console.log(`Template file already exists: ${modRsPath}`);
    }
  } catch (error) {
    console.error(`Error creating template file ${modRsPath}:`, error);
  }
};

export const extractProgramIdFromAnchorToml = async (
  projectId: string,
  anchorTomlPath: string,
  programName: string
): Promise<string> => {
  try {
    const anchorTomlContentResponse = await fileApi.getFileContent(projectId, anchorTomlPath);
    const anchorTomlContentTaskId = anchorTomlContentResponse.taskId;
    const pollDesc = `Getting Anchor.toml content.`;
    const anchorTomlContent = await pollTaskStatus(anchorTomlContentTaskId, pollDesc);

    const parsedToml = parse(anchorTomlContent) as RootAnchorToml;

    const programSection = parsedToml.programs?.localnet;
    if (!programSection)  throw new Error('No [programs.localnet] section found in Anchor.toml');

    const programId = programSection[programName];
    if (!programId) throw new Error(`Program ID for "${programName}" not found in Anchor.toml`);

    return programId;
  } catch (error) {
    console.error('Error parsing Anchor.toml:', error);
    throw error;
  }
};