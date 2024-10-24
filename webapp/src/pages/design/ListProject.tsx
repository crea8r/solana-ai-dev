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
import { shortenText } from '../../utils/text';

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
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

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
              <Box
                key={project.id}
                p={3}
                borderWidth={1}
                borderRadius='md'
                _hover={{ bg: 'gray.100', cursor: 'pointer' }}
                onClick={() => handleProjectClick(project.id, project.name)}
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
