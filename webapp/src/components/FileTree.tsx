// Mock data for file tree

import { VStack, Text, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { FaFile, FaFolder } from 'react-icons/fa';

// name, ext, type, path, children
export interface FileTreeItemType {
  name: string;
  ext?: string;
  type?: 'directory' | 'file';
  children?: FileTreeItemType[];
  path?: string;
}
const mockFileTree = {
  name: 'src',
  type: 'directory',
  path: 'src',
  children: [
    { name: 'main.rs', type: 'file', path: 'src/main.rs', ext: 'rs' },
    { name: 'lib.rs', type: 'file', path: 'src/lib.rs', ext: 'rs' },
  ],
} as FileTreeItemType;

export interface FileTreeItemProps {
  item: FileTreeItemType;
  onSelectFile: (item: FileTreeItemType) => void;
  selectedItem?: FileTreeItemType | undefined;
}
const FileTreeItem = ({
  item,
  onSelectFile,
  selectedItem,
}: FileTreeItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFolder = () => setIsOpen(!isOpen);
  if (
    item.type === 'directory' ||
    (item.children && item.children.length > 0)
  ) {
    return (
      <VStack align='stretch' ml={2}>
        <Flex alignItems='center' cursor='pointer' onClick={toggleFolder}>
          <FaFolder color='#F8D775' />
          <Text ml={2}>{item.name}</Text>
        </Flex>
        {isOpen &&
          item.children?.map((child, index) => (
            <FileTreeItem
              key={index}
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
        <FaFile color='#87CEFA' />
        <Text
          ml={2}
          background={item.path === selectedItem?.path ? 'yello.100' : ''}
        >
          {item.name}
        </Text>
      </Flex>
    );
  }
};

type FileTreeProps = {
  onSelectFile: any;
  files?: FileTreeItemType;
  selectedItem?: FileTreeItemType;
};

const FileTree = ({
  onSelectFile,
  files = mockFileTree,
  selectedItem,
}: FileTreeProps) => {
  return (
    <VStack align='stretch' spacing={2} p={4}>
      <Text fontWeight='bold'>Project Files</Text>
      <FileTreeItem
        item={files}
        onSelectFile={onSelectFile}
        selectedItem={selectedItem}
      />
    </VStack>
  );
};

export default FileTree;
