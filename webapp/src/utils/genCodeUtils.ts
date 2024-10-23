import { FileTreeItemType } from '../components/FileTree';

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
