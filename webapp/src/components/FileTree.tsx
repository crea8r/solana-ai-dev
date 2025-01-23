import { VStack, Text, Flex, Box } from '@chakra-ui/react';
import React, { useState, memo } from 'react';
import { FaFolder, FaChevronDown, FaRegFile, FaChevronRight } from "react-icons/fa6";
import { FileTreeItemType } from '../interfaces/file';
import ProjectStatus from './ProjectStatus';

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
  onBuild: () => void;
  onDeploy: () => void;
  setIsTaskModalOpen: (isOpen: boolean) => void;
};

const FileTree = ({
  onSelectFile,
  files,
  selectedItem,
  onBuild,
  onDeploy,
  setIsTaskModalOpen,
}: FileTreeProps) => {
  console.log('FileTree props:', { files, selectedItem });

  return (
    <Flex p={6} bg="gray.50" borderWidth="1px" width='100%' height='100%' 
    direction='column'
    justifyContent='flex-start'
    alignItems='flex-start'
    overflowX='hidden'
    >
      <Flex 
        direction="column" 
        width="100%" 
        height="100%"
        border="1px solid" 
        borderColor="gray.200"
        bg="white"
        borderRadius="md"
        overflowX='hidden'
      >
        <ProjectStatus onBuild={onBuild} onDeploy={onDeploy} setIsTaskModalOpen={setIsTaskModalOpen} />
        <Flex align='flex-start' p={4} height='80%' overflowY='auto' overflowX='hidden'>
          {files && (
            <FileTreeItem
              item={files}
              onSelectFile={onSelectFile}
              selectedItem={selectedItem}
              level={0}
            />
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

// Temporarily remove memo for debugging
export default FileTree;
