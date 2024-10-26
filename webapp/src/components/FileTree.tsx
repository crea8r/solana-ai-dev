// Mock data for file tree

import { VStack, Text, Flex } from '@chakra-ui/react';
import { Bluetooth } from 'lucide-react';
import { useState } from 'react';
import { CiFolderOn, CiFileOn } from "react-icons/ci";
import { FaFolder } from "react-icons/fa6";
import { FaRegFile } from "react-icons/fa";

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
  level: number;
}

const FileTreeItem = ({
  item,
  onSelectFile,
  selectedItem,
  level,
}: FileTreeItemProps) => {
  const [isOpen, setIsOpen] = useState(level === 0); // Always open if root

  const toggleFolder = () => setIsOpen(!isOpen);

  if (item.type === 'directory' || (item.children && item.children.length > 0)) {
    return (
      <VStack align='stretch' ml={2}>
        <Flex alignItems='center' cursor='pointer' onClick={toggleFolder}>
          <FaFolder style={{ color: '#ffd57a' }} />
          <Text ml={2}>{item.name}</Text>
        </Flex>
        {isOpen &&
          item.children?.map((child, index) => (
            <FileTreeItem
              key={child.path || index}
              item={child}
              onSelectFile={onSelectFile}
              selectedItem={selectedItem}
              level={level + 1}
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
        <FaRegFile style={{ color: '#5688e8' }} />
        <Text
          ml={2}
          color={item.path === selectedItem?.path ? 'blue.400' : ''}
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
          level={0}
        />
      )}
    </VStack>
  );
};

export default FileTree;
