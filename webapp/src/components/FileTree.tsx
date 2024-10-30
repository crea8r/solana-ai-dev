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

  const toggleFolder = () => {
    if (item.type === 'directory') {
      setIsOpen(!isOpen);
    } else {
      onSelectFile(item);
    }
  };

  const hasChildren = item.type === 'directory' || (item.children && item.children.length > 0);

  return (
    <VStack
      align='stretch'
      ml={2}
      pl={2}
      borderLeft={isOpen && hasChildren ? "1px solid #ccc" : "none"}
    >
      <Flex
        alignItems='center'
        cursor='pointer'
        onClick={toggleFolder}
        bg={item.path === selectedItem?.path ? 'gray.100' : ''}
      >
        {hasChildren ? (
          isOpen ? <FaChevronDown size={10} style={{ color: '#51545c' }}/> : <FaChevronRight size={10} style={{ color: '#51545c', marginRight: 5 }} />
        ) : (
          <FaRegFile size={12} style={{ color: '#5688e8', marginRight: 5 }} />
        )}
        {item.type === 'directory' ? (
          <FaFolder style={{ color:'#a8b5e6', marginLeft: 5 }} />
        ) : null}
        <Text ml={2} fontSize='sm'>{item.name}</Text>
      </Flex>
      {isOpen && hasChildren &&
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
