// Mock data for file tree

import { VStack, Text, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { CiFolderOn, CiFileOn } from "react-icons/ci";

// name, ext, type, path, children
export interface FileTreeItemType {
  name: string;
  ext?: string;
  type?: 'directory' | 'file';
  children?: FileTreeItemType[];
  path?: string;
}

export interface FileTreeItemProps {
  item: FileTreeItemType;
  onSelectFile: (item: FileTreeItemType) => void;
  selectedItem?: FileTreeItemType;
}

const FileTreeItem = ({
  item,
  onSelectFile,
  selectedItem,
}: FileTreeItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFolder = () => setIsOpen(!isOpen);
  if (item.type === 'directory' || (item.children && item.children.length > 0)) {
    return (
      <VStack align='stretch' ml={2}>
        <Flex alignItems='center' cursor='pointer' onClick={toggleFolder}>
          <CiFolderOn />
          <Text ml={2}>{item.name}</Text>
        </Flex>
        {isOpen &&
          item.children?.map((child, index) => (
            <FileTreeItem
              key={child.path || index}
              item={child}
              onSelectFile={onSelectFile}
              selectedItem={selectedItem}
            />
          ))}
      </VStack>
    );
  } else {
    return (
      <Flex
        alignItems='center'
        ml={2}
        cursor='pointer'
        onClick={() => onSelectFile(item)}
      >
        <CiFileOn />
        <Text
          ml={2}
          background={item.path === selectedItem?.path ? 'yellow.100' : ''}
        >
          {item.name}
        </Text>
      </Flex>
    );
  }
};

type FileTreeProps = {
  onSelectFile: (item: FileTreeItemType) => void;
  files?: FileTreeItemType;
  selectedItem?: FileTreeItemType;
};

const FileTree = ({
  onSelectFile,
  files,
  selectedItem,
}: FileTreeProps) => {
  return (
    <VStack align='stretch' spacing={2} p={4}>
      <Text fontWeight='bold'>Project Files</Text>
      {files && (
        <FileTreeItem
          item={files}
          onSelectFile={onSelectFile}
          selectedItem={selectedItem}
        />
      )}
    </VStack>
  );
};

export default FileTree;
