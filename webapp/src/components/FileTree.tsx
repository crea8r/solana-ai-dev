// Mock data for file tree

import { VStack, Text, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { FaFile, FaFolder } from 'react-icons/fa';

// name, ext, type, path, children
export interface FileTreeItemType {
  name: string;
  ext?: string;
  type: 'directory' | 'file';
  children?: FileTreeItemType[];
  path: string;
}
const mockFileTree = [
  {
    name: 'src',
    type: 'directory',
    path: 'src',
    children: [
      { name: 'main.rs', type: 'file', path: 'src/main.rs', ext: 'rs' },
      { name: 'lib.rs', type: 'file', path: 'src/lib.rs', ext: 'rs' },
    ],
  },
  {
    name: 'tests',
    type: 'folder',
    path: 'tests',
    children: [
      {
        name: 'integration_tests.rs',
        type: 'file',
        ext: 'rs',
        path: 'tests/integration_tests.rs',
      },
    ],
  },
  { name: 'Cargo.toml', type: 'file', path: 'Cargo.toml', ext: 'toml' },
] as FileTreeItemType[];

export interface FileTreeItemProps {
  item: FileTreeItemType;
  onSelectFile: (fileName: string) => void;
}
const FileTreeItem = ({ item, onSelectFile }: FileTreeItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFolder = () => setIsOpen(!isOpen);

  if (item.type === 'directory') {
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
        onClick={() => onSelectFile(item.name)}
      >
        <FaFile color='#87CEFA' />
        <Text ml={2}>{item.name}</Text>
      </Flex>
    );
  }
};

type FileTreeProps = {
  onSelectFile: any;
};

const FileTree = ({ onSelectFile }: FileTreeProps) => {
  return (
    <VStack align='stretch' spacing={2} p={4}>
      <Text fontWeight='bold'>Project Files</Text>
      {mockFileTree.map((item, index) => (
        <FileTreeItem key={index} item={item} onSelectFile={onSelectFile} />
      ))}
    </VStack>
  );
};

export default FileTree;
