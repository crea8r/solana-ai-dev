import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Input,
  Box,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import { projectApi } from '../../api/project';
import {
  ListProjectsResponse,
  ProjectListItem,
} from '../../interfaces/project';
import { Trash2 } from 'lucide-react';
import { shortenText } from '../../utils/text';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useToast } from '@chakra-ui/react';

interface ListProjectProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectClick: (projectId: string, projectName: string) => void;
}

const ListProject: React.FC<ListProjectProps> = ({
  isOpen,
  onClose,
  onProjectClick,
}) => {
  const { projectContext, setProjectContext } = useProjectContext();
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const toast = useToast();

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectApi.listProjects(page, 10, search);
      setProjects(response.data);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen, page, search]);

  const handleProjectClick = (projectId: string, projectName: string) => {
    onProjectClick(projectId, projectName);
    onClose();
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await projectApi.deleteProject(projectId);

      if (projectContext.id === projectId) {
        setProjectContext({
          id: '',
          rootPath: '',
          name: '',
          description: '',
          aiModel: 'codestral-latest',
          apiKey: '',
          details: {
            nodes: [],
            edges: [],
            files: { name: '', type: 'directory', children: [] },
            codes: [],
            docs: [],
            isAnchorInit: false,
            isCode: false,
            aiFilePaths: [],
            aiStructure: '',
            stateContent: '',
          },
        });
      }

      fetchProjects();

      toast({
        title: 'Project Deleted',
        description: `The project was successfully deleted.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error Deleting Project',
        description: 'There was an error deleting the project. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='xl'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select a Project</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align='stretch'>
            <Input
              placeholder='Search projects...'
              value={search}
              onChange={handleSearchChange}
            />
            {loading && <Spinner />}
            {error && <Text color='red.500'>{error}</Text>}
            {projects?.map((project) => (
              <Flex 
                key={project.id} 
                justify="center" 
                align="center" 
                mb={2}   
                p={2}              
                borderWidth={1}
                borderRadius='md'
>
              <Box
                key={project.id}
                p={3}
                _hover={{ bg: 'gray.100', cursor: 'pointer' }}
                onClick={() => handleProjectClick(project.id, project.name)}
                width="100%"
              >
                <Text fontWeight='bold'>{project.name}</Text>
                <Text fontSize='sm' color='gray.600'>
                  {shortenText(project.description || 'No description available')}
                </Text>
                <Text fontSize='xs' color='gray.400'>
                  Last updated:{' '}
                  {new Date(project.last_updated).toLocaleString()}
                  </Text>
                </Box>
                <Button variant="ghost" size="sm" colorScheme="gray" onClick={() => handleDeleteProject(project.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </Flex>
            ))}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Flex justify='space-between' width='100%'>
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              isDisabled={page === 1}
            >
              Previous
            </Button>
            <Text>
              Page {page} of {totalPages}
            </Text>
            <Button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              isDisabled={page === totalPages}
            >
              Next
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ListProject;
