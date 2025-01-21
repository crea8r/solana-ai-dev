import { VStack, Text, Flex, Box } from '@chakra-ui/react';
import React, { useState, memo } from 'react';
import { FaFolder, FaChevronDown, FaRegFile, FaChevronRight } from "react-icons/fa6";
import { FileTreeItemType } from '../interfaces/file';

export interface FileTreeItemProps {
  item: FileTreeItemType;
  onSelectFile: (item: FileTreeItemType) => void;
  selectedItem?: FileTreeItemType;
  level: number;
}

const FileTreeItem = memo(({
  item,
  onSelectFile,
  selectedItem,
  level,
}: FileTreeItemProps) => {
  const [isOpen, setIsOpen] = useState(level === 0);
  //console.log('***FileTreeItem item:', JSON.stringify(item, null, 2));

  const toggleFolder = () => {
    //console.log('Toggling folder:', item.name);
    //console.log('Item type:', item.type);
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
});

type FileTreeProps = {
  onSelectFile: (item: FileTreeItemType) => void;
  files?: FileTreeItemType;
  selectedItem?: FileTreeItemType;
};

const FileTree = memo(({
  onSelectFile,
  files,
  selectedItem,
}: FileTreeProps) => {
  //console.log('***FileTreeComponent files:', JSON.stringify(files, null, 2));
  return (
    <Flex p={6} bg="gray.50" borderRadius="md" borderWidth="1px" maxWidth='20vw' minWidth='20vw' padding="10px">
      <VStack align='stretch' spacing={2} p={4}>
        {files && (
          <FileTreeItem
            item={files}
            onSelectFile={onSelectFile}
            selectedItem={selectedItem}
              level={0}
          />
        )}
      </VStack>
    </Flex>
  );
});

export default React.memo(FileTree);
