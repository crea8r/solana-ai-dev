import { fileApi } from '../api/file';
import { taskApi } from '../api/task';
import { FileTreeItemType } from '../components/FileTree';
import { parse, stringify } from 'smol-toml'

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
