import React, { useEffect, useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalBody, Button, Box, Text, Flex, Input } from '@chakra-ui/react';
import { CheckCircleIcon, TimeIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { projectApi } from '../../api/project';
import { taskApi } from '../../api/task';
import { ProjectDetail, ProjectInfoToSave, SaveProjectResponse } from '../../interfaces/project';
import { FileTreeItemType } from "../../components/FileTree";
import genStructure from "../../prompts/genStructure";
import genFiles from "../../prompts/genFile";
import promptAI from "../../services/prompt";
//import { genAiProject } from '../../utils/genAiProject';
import { useProject } from '../../contexts/ProjectContext';

interface genTaskProps {
    isOpen: boolean;
    onClose: () => void;
}   

type TaskStatus = 'completed' | 'loading' | 'failed' | 'succeed' | 'warning';

type Task = {
    id: number;
    name: string;
    status: TaskStatus;
    type: 'main' | 'file';
};

function setFileTreePaths(
    item: FileTreeItemType,
    parentPath: string = ''
): void {
    const currentPath = parentPath ? `${parentPath}/${item.name}` : item.name;
    item.path = currentPath;
  
    if (item.children) {
      for (const child of item.children) {
        setFileTreePaths(child, currentPath);
      }
    }
}

export const TaskModal: React.FC<genTaskProps> = ({ isOpen, onClose }) => {
    const { project, updateProject, savedProject, updateSavedProject } = useProject();
    const [projectId, setProjectId] = useState<string>('');
    const [projectName, setProjectName] = useState<string>('');
    const [projectDescription, setProjectDescription] = useState<string>('');
    const [projectRootPath, setProjectRootPath] = useState<string>('');
    const [isProjectSaved, setisProjectSaved] = useState<boolean>(false);

    // Initialize anchorInitCompleted from savedProject
    const [anchorInitCompleted, setAnchorInitCompleted] = useState<boolean>(
        savedProject?.anchorInitCompleted || false
    );

    useEffect(() => {
        if (savedProject && typeof savedProject.anchorInitCompleted !== 'undefined') {
            setAnchorInitCompleted(savedProject.anchorInitCompleted);
        }
    }, [savedProject]);

    const [tasks, setTasks] = useState<Task[]>([
        { id: 1, name: 'Project saved', status: 'loading', type: 'main' },
        { id: 2, name: 'Initializing Anchor project', status: 'loading', type: 'main' },
        { id: 3, name: 'Generating files:', status: 'loading', type: 'main' },
        { id: 4, name: 'state.rs', status: 'loading', type: 'file' },
        { id: 5, name: 'lib.rs', status: 'loading', type: 'file' },
        { id: 6, name: 'lib.rs', status: 'loading', type: 'file' },
        { id: 7, name: 'lib.rs', status: 'loading', type: 'file' },
    ]);

    const handleCreateProject = async () => {
        if (!projectName || !projectDescription) {
            console.log('Project name and description are required.');
            return;
        }

        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === 1 ? { ...task, status: 'loading' } : task
            )
        );

        try {
            const projectInfo: ProjectInfoToSave = {
                name: projectName,
                description: projectDescription,
                details: savedProject?.details,
            };

            const response: SaveProjectResponse = await projectApi.createProject(projectInfo);
            console.log(response);

            setProjectId(response.projectId);
            setProjectRootPath(response.rootPath);

            setTimeout(() => {
                setTasks((prevTasks) =>
                    prevTasks.map((task) =>
                        task.id === 1 ? { ...task, status: 'completed' } : task
                    )
                );
                console.log('project saved');

                updateSavedProject({
                    id: response.projectId,
                    rootPath: response.rootPath,
                    name: projectName,
                    description: projectDescription,
                });

                setisProjectSaved(true);
            }, 2000);
        } catch (error) {
            console.error('Error saving project:', error);

            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === 1 ? { ...task, status: 'failed' } : task
                )
            );
        }
    };

    const handleAnchorInitTask = async () => {
        try {
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === 2 ? { ...task, status: 'loading' } : task
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
                    task.id === 2 ? { ...task, status: 'failed' } : task
                )
            );
        }
    };

    const handleGenFilesTask = async () => {
        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === 3 ? { ...task, status: 'loading' } : task
            )
        );

        if (savedProject?.details?.nodes && savedProject?.details?.edges) {
            const structurePrompt = genStructure(savedProject?.details?.nodes || [], savedProject?.details?.edges || []);
            const choices = await promptAI(structurePrompt);

            try {
                if (choices && choices.length > 0) {
                    const files = JSON.parse(
                    choices[0].message?.content
                    ) as FileTreeItemType;
                    setFileTreePaths(files);
                    updateProject({
                        files: files,
                    });
                }
            } catch (error) {
                console.error(error);
            }

           
        }
    
        const fileTaskIds = [4, 5, 6, 7];
        for (const id of fileTaskIds) {
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === id ? { ...task, status: 'loading' } : task
                )
            );
    
            await new Promise((resolve) => setTimeout(resolve, 1000));
    
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === id ? { ...task, status: 'completed' } : task
                )
            );
        }
    
        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === 3 ? { ...task, status: 'completed' } : task
            )
        );
    };
    

    const pollTaskStatus = async (taskId: string) => {
        const interval = setInterval(async () => {
            try {
                const { task } = await taskApi.getTask(taskId);
                console.log('task', task);

                if (task.status === 'succeed' || task.status === 'warning') {
                    setTasks((prevTasks) =>
                        prevTasks.map((prevTask) =>
                            prevTask.type === 'main' && prevTask.id === 2
                                ? { ...prevTask, status: 'completed' }
                                : prevTask
                        )
                    );
                    clearInterval(interval);

                    // Update savedProject to include anchorInitCompleted
                    updateSavedProject({
                        ...savedProject,
                        anchorInitCompleted: true,
                    });

                    handleGenFilesTask();
                } else if (task.status === 'failed') {
                    setTasks((prevTasks) =>
                        prevTasks.map((prevTask) =>
                            prevTask.id === 2 ? { ...prevTask, status: 'failed' } : prevTask
                        )
                    );
                    clearInterval(interval);
                }
            } catch (error) {
                console.error('Error fetching task status:', error);
                clearInterval(interval);
            }
        }, 2000);
    };


    // genFile() - generate file
    // function to 'merge' files into anchor project, save all on server

    useEffect(() => {
        if (isOpen) {
            if (savedProject && savedProject.name && savedProject.description) {
                setisProjectSaved(true);
            } else {
                setisProjectSaved(false);
            }
        }
    }, [isOpen, savedProject]);

    useEffect(() => {
        if (isProjectSaved) {
            if (savedProject && savedProject.anchorInitCompleted) {
                console.log('Anchor init task already completed');
                setAnchorInitCompleted(true);
            } else if (!anchorInitCompleted) {
                console.log('start anchor init task');
                handleAnchorInitTask();
                // No need to set anchorInitCompleted here; it's updated when the task completes
            }
        }
    }, [isProjectSaved, savedProject, anchorInitCompleted]);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalBody>
                    <Box mt={4}>
                        <Box mb={4} style={{ display: isProjectSaved ? 'none' : 'block' }}>
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

                        <Box style={{ display: isProjectSaved ? 'block' : 'none' }}>
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
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

function StatusSymbol({ status }: { status: TaskStatus }) {
    return status === 'completed' ? (
        <CheckCircleIcon color="green.500" />
    ) : (
        <TimeIcon color="gray.300" />
    );
}
