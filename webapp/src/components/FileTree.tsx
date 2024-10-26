// Mock data for file tree

import { VStack, Text, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { FaFolder, FaChevronDown, FaRegFile, FaChevronRight } from "react-icons/fa6";

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
          {isOpen ? <FaChevronDown size={10} style={{ color: '#51545c' }}/> : <FaChevronRight size={10} style={{ color: '#51545c', marginRight: 5 }} />}
          <FaFolder style={{ color: '#ffd57a', marginLeft: 5 }} />
          <Text ml={2} fontSize='sm'>{item.name}</Text>
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
        bg={item.path === selectedItem?.path ? 'gray.100' : ''}
        p={1}
        onClick={() => onSelectFile(item)}
      >
        <FaRegFile size={12} style={{ color: '#5688e8' }} />
        <Text
          ml={2}
          fontSize='sm'
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
