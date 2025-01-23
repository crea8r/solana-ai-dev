import { FileTreeItemType } from "../interfaces/file";
import { fileApi } from "../api/file";
import { filterFiles, ignoreFiles, mapFileTreeNodeToItemType } from "./codePageUtils";

// returns fileTree, fileNames and filePaths
export async function fetchFileInfo(
    projectId: string,
    rootPath: string,
    projectName: string,
    mapFileTreeNodeToItemType: (node: any) => FileTreeItemType,
    filterFiles: (file: FileTreeItemType) => boolean,
): Promise<{ fileTree: FileTreeItemType, filePaths: Set<string>, fileNames: Set<string> }> {
    try {
        const existingFilesResponse = await fileApi.getDirectoryStructure(rootPath);
        if (!existingFilesResponse) throw new Error("Directory structure not found");

        const mappedFiles = existingFilesResponse
            .map(mapFileTreeNodeToItemType)
            .filter(filterFiles);

        const rootNode: FileTreeItemType = {
            name: projectName,
            path: rootPath,
            type: 'directory',
            children: mappedFiles,
        };

        const traverseFileTree = (
            nodes: FileTreeItemType[],
            filePaths: Set<string>,
            fileNames: Set<string>
        ) => {
            for (const node of nodes) {
                if (node.type === "file" && node.path) {
                    filePaths.add(node.path);
                    fileNames.add(node.name);
                } else if (node.type === "directory" && node.children) {
                    traverseFileTree(node.children, filePaths, fileNames);
                }
            }
        };

        const existingFilePaths = new Set<string>();
        const existingFileNames = new Set<string>();
        traverseFileTree(mappedFiles, existingFilePaths, existingFileNames);

        return { fileTree: rootNode, filePaths: existingFilePaths, fileNames: existingFileNames };
    } catch (error) {
        console.error("Error fetching file tree and paths:", error);
        throw error;
    }
}

export const extractFilePathsAndNames = (
    fileTree: FileTreeItemType,
  ): { filePaths: Set<string>; fileNames: Set<string> } => {
    const filePaths = new Set<string>();
    const fileNames = new Set<string>();
  
    const traverse = (item: FileTreeItemType) => {
      if (item.type === 'directory' && item.children) {
        // If it's a directory, recurse into its children
        item.children.forEach(child => traverse(child));
      } else if (item.type === 'file' && item.path) {
        // If it's a file, add its path and name to the sets
        filePaths.add(item.path);
        fileNames.add(item.name);
      }
    };
  
    traverse(fileTree); // Start traversal from the root fileTree
    return { filePaths, fileNames };
  };