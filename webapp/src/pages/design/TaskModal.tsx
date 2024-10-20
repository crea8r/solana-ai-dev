import React, { useEffect, useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, Button, Box, Text, Flex, Input } from '@chakra-ui/react';
import { CheckCircleIcon, TimeIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { projectApi } from '../../api/project';
import { taskApi } from '../../api/task';
import { v4 as uuidv4 } from 'uuid';
import { ProjectDetail, ProjectInfoToSave, SaveProjectResponse } from '../../interfaces/project';
import { useProject } from '../../contexts/ProjectContext';

interface genTaskProps {
    isOpen: boolean;
    onClose: () => void;
}   

type Task = {
    id: number;
    name: string;
    status: 'completed' | 'loading' | 'failed';
    type: 'main' | 'file';
};

export const TaskModal: React.FC<genTaskProps> = ({isOpen, onClose}) => {
    const { savedProject, updateSavedProject } = useProject();
    const [project, setProject] = useState<ProjectDetail | null>(null);
    const [isNewProject, setIsNewProject] = useState<boolean>(false);
    const [projectId, setProjectId] = useState<string>('');
    const [projectName, setProjectName] = useState<string>('');
    const [projectDescription, setProjectDescription] = useState<string>('');
    const [projectRootPath, setProjectRootPath] = useState<string>('');
    const [isProjectSaved, setisProjectSaved] = useState<boolean>(false);

    const [tasks, setTasks] = useState<Task[]>([
        { id: 1, name: 'Project saved', status: 'completed', type: 'main' },
        { id: 3, name: 'Generating project structure', status: 'loading', type: 'main' },
        { id: 4, name: 'Generating files:', status: 'loading', type: 'main' },
        { id: 5, name: 'state.rs', status: 'loading', type: 'file' },
        { id: 6, name: 'lib.rs', status: 'loading', type: 'file' },
        { id: 7, name: 'lib.rs', status: 'loading', type: 'file' },
        { id: 8, name: 'lib.rs', status: 'loading', type: 'file' },
    ]);

    const handleCreateProject = async () => {
        if (!projectName || !projectDescription) {
            console.log('Project name and description are required.');
            return;
        }
        const projectInfo: ProjectInfoToSave = {
            name: projectName,
            description: projectDescription,
            details: savedProject?.details,
        };
    
        const response: SaveProjectResponse = await projectApi.createProject(projectInfo);
        console.log(response);

        setIsNewProject(false);
        setisProjectSaved(true);
        setProjectId(response.projectId);
        setProjectRootPath(response.rootPath);
    }

    const anchorInitTask = async () => {
        try {
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === 1 ? { ...task, status: 'loading' } : task
                )
            );
            const response = await projectApi.initAnchorProject(projectId, projectRootPath, projectName);
            const { taskId } = response;

            console.log('taskId', taskId);
            console.log(response);

            pollTaskStatus(taskId);
        } catch (error) {
            console.error('Error initializing Anchor project:', error);
            
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === 1 ? { ...task, status: 'failed' } : task
                )
            );
        }
    };

    // Function to poll the status of a specific task (file)
    const pollTaskStatus = async (taskId: string) => {
        const interval = setInterval(async () => {
            try {
                // Call the API to get the task status from the backend
                const { task } = await taskApi.getTask(taskId);
                console.log('task', task);

                // Check if the task has succeeded or failed
                if (task.status === 'succeed') {
                    setTasks((prevTasks) =>
                        prevTasks.map((prevTask) =>
                            prevTask.id === Number(taskId) ? { ...prevTask, status: 'completed' } : prevTask
                        )
                    );
                    clearInterval(interval); // Stop polling once task is complete
                } else if (task.status === 'failed') {
                    setTasks((prevTasks) =>
                        prevTasks.map((prevTask) =>
                            prevTask.id === Number(taskId) ? { ...prevTask, status: 'failed' } : prevTask
                        )
                    );
                    clearInterval(interval); // Stop polling on failure
                }
            } catch (error) {
                console.error('Error fetching task status:', error);
                clearInterval(interval); // Stop polling on error
            }
        }, 2000); // Poll every 2 seconds
    };


    // genStructure() - files to generate
    // genFile() - generate file
    // function to 'merge' files into anchor project, save all on server

    useEffect(() => {
        if (isOpen) if (!savedProject?.name && !savedProject?.description) setIsNewProject(true);
    }, [isOpen]);

    useEffect(() => {
        if (isProjectSaved) {
            console.log('start anchor init task');
            anchorInitTask();
        }
    }, [isProjectSaved]);

    useEffect(() => {
        const allFilesCompleted = tasks
            .filter(task => task.type === 'file')
            .every(task => task.status === 'completed');

        if (allFilesCompleted) {
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === 3 ? { ...task, status: 'completed' } : task
                )
            );
        }
    }, [tasks]);

    useEffect(() => {
        updateSavedProject({
            id: projectId,
            rootPath: projectRootPath,
            name: projectName,
            description: projectDescription,
        });
    }, [projectName, projectDescription, projectId, projectRootPath]);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalBody>
                    <Box mt={4}>
                        {isNewProject && (
                            <Box mb={4}>
                                    <Input
                                        placeholder="Enter Project Name"
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                        required
                                        mb={2}
                                    />
                                    <Input
                                        placeholder="Enter Project Description"
                                        value={projectDescription}
                                        onChange={(e) => setProjectDescription(e.target.value)}
                                        required
                                        mb={2}
                                    />
                                    <Button
                                        onClick={handleCreateProject}
                                        colorScheme="blue"
                                        mt={2}
                                        rightIcon={<ArrowForwardIcon />}
                                    />
                            </Box>
                        )}
                        {tasks.filter(task => task.type === 'main').map((task) => (
                            <Flex key={task.id} justify="space-between" align="center" mb={2}>
                                <Text fontSize="sm" fontWeight="medium">{task.name}</Text>
                                <StatusSymbol status={task.status} />
                            </Flex>
                        ))}
                        <Box mt={4}>
                            {tasks.filter(task => task.type === 'file').map((task) => (
                                <Flex key={task.id} justify="space-between" align="center" ml={4} mb={2}>
                                    <Text fontSize="sm">{task.name}</Text>
                                    <StatusSymbol status={task.status} />
                                </Flex>
                            ))}
                        </Box>
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

function StatusSymbol({ status }: { status: 'completed' | 'loading' | 'failed' }) {
    return status === 'completed' ? (
        <CheckCircleIcon color="green.500" />
    ) : (
        <TimeIcon color="gray.300" />
    );
}
