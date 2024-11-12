import { fileApi } from '../api/file';
import { taskApi } from '../api/task';
import { FileTreeItemType } from '../components/FileTree';
import { parse, stringify } from 'smol-toml'

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

const pollTaskStatus = (taskId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
          try {
              const { task } = await taskApi.getTask(taskId);
              console.log('task', task);

              if (task.status === 'succeed' || task.status === 'warning') {
                  
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
  const oldContentResponse = await fileApi.getFileContent(projectId, filePath);
  const taskId = oldContentResponse.taskId;
  const oldContent = await pollTaskStatus(taskId);

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
  const updatedFileContent = await pollTaskStatus(res.taskId);
  return updatedFileContent;
}

export const removeModFile = async (
  projectId: string,
  programName: string
): Promise<void> => {
  const modFilePath = `programs/${programName}/src/mod.rs`;

  try {
    const fileContentResponse = await fileApi.getFileContent(projectId, modFilePath);
    const taskId = fileContentResponse.taskId;
    const fileExists = await pollTaskStatus(taskId).then(() => true).catch(() => false);

    if (fileExists) {
      await fileApi.deleteFile(projectId, modFilePath);
      console.log(`Removed ${modFilePath} successfully.`);
    } else {
      console.log(`File ${modFilePath} does not exist.`);
    }
  } catch (error) {
    console.error(`Error removing ${modFilePath}:`, error);
  }
};

export const ensureInstructionNaming = async (
  projectId: string,
  aiFilePaths: string[],
  aiProgramDirectoryName: string
): Promise<void> => {
  if (!aiFilePaths) return;

  const instructionPaths = aiFilePaths.filter(
    (filePath) =>
      filePath.startsWith(`programs/${aiProgramDirectoryName}/src/instructions`) &&
      !filePath.endsWith('mod.rs')
  );
  console.log('instructionPaths', instructionPaths);

  for (const filePath of instructionPaths) {
    try {
      console.log('(add run_) processing:', filePath);

      const fileContentResponse = await fileApi.getFileContent(projectId, filePath);
      const taskId = fileContentResponse.taskId;
      const fileContent = await pollTaskStatus(taskId);

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