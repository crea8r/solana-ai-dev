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
import { extractCodeBlock, getFileList, setFileTreePaths } from '../../utils/genCodeUtils';
import { useProject } from '../../contexts/ProjectContext';

interface genTaskProps {
    isOpen: boolean;
    onClose: () => void;
}   

type TaskStatus = 'completed' | 'loading' | 'failed' | 'succeed' | 'warning';

type Task = {
    id: number;
    name: string;
    path?: string;
    status: TaskStatus;
    type: 'main' | 'file';
};

export const TaskModal: React.FC<genTaskProps> = ({ isOpen, onClose }) => {
    const { project, updateProject, savedProject, updateSavedProject } = useProject();
    const [projectId, setProjectId] = useState<string>('');
    const [projectName, setProjectName] = useState<string>('');
    const [projectDescription, setProjectDescription] = useState<string>('');
    const [projectRootPath, setProjectRootPath] = useState<string>('');
    const [isProjectSaved, setisProjectSaved] = useState<boolean>(false);
    const [tasks, setTasks] = useState<Task[]>([
        { id: 1, name: 'Project saved', status: 'loading', type: 'main' },
        { id: 2, name: 'Initializing Anchor project', status: 'loading', type: 'main' },
        { id: 3, name: 'Generating files:', status: 'loading', type: 'main' },
    ]);

    const [anchorInitCompleted, setAnchorInitCompleted] = useState<boolean>(
        savedProject?.anchorInitCompleted || false
    );

    useEffect(() => {
        if (savedProject && typeof savedProject.anchorInitCompleted !== 'undefined') {
            setAnchorInitCompleted(savedProject.anchorInitCompleted);
        }
    }, [savedProject]);

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

    

    const handleGenCodesTask = async () => {
        setTasks((prevTasks) => prevTasks.map((task) => task.id === 3 ? { ...task, status: 'loading' } : task));

        if (savedProject?.details?.nodes && savedProject?.details?.edges) {
            const structurePrompt = genStructure(savedProject.details.nodes, savedProject.details.edges);
            const choices = await promptAI(structurePrompt);

            try {
                if (choices && choices.length > 0) {
                    const files = JSON.parse(choices[0].message?.content) as FileTreeItemType;
                    setFileTreePaths(files);
                    updateProject({ ...project, files });
                    const fileList = getFileList(files); // Returns array of { name, path }

                    let nextId = 4;
                    const fileTasks = fileList.map(({ name, path }) => ({
                        id: nextId++,
                        name: name,
                        path: path,
                        status: 'loading',
                        type: 'file',
                    } as Task));

                    setTasks((prevTasks) => {
                        const mainTasks = prevTasks.filter((task) => task.type !== 'file');
                        return [...mainTasks, ...fileTasks];
                    });

                    for (const fileTask of fileTasks) {
                        setTasks((prevTasks) =>
                            prevTasks.map((task) =>
                                task.id === fileTask.id ? { ...task, status: 'loading' } : task
                            )
                        );

                        try {
                            // Generate code content and update Project
                            const { nodes, edges } = savedProject.details || { nodes: [], edges: [] };
                            const fileName = fileTask.name;
                            const filePath = fileTask.path;

                            const promptContent = genFiles(nodes, edges, fileName || '', filePath || '');
                            const fileChoices = await promptAI(promptContent);

                            if (fileChoices && fileChoices.length > 0) {
                                const aiContent = fileChoices[0].message?.content;
                                const codeContent = extractCodeBlock(aiContent);

                                // Update project codes
                                updateProject({
                                    ...project,
                                    codes: [
                                        ...(project?.codes || []),
                                        { name: fileName || '', path: filePath || '', content: codeContent },
                                    ],
                                });

                                setTasks((prevTasks) =>
                                    prevTasks.map((task) =>
                                        task.id === fileTask.id ? { ...task, status: 'completed' } : task
                                    )
                                );
                            } else {
                                throw new Error('No AI response for file generation');
                            }
                        } catch (error) {
                            console.error('Error generating file content for', fileTask.name, error);
                            setTasks((prevTasks) =>
                                prevTasks.map((task) =>
                                    task.id === fileTask.id ? { ...task, status: 'failed' } : task
                                )
                            );
                        }
                    }

                    setTasks((prevTasks) =>
                        prevTasks.map((task) =>
                            task.id === 3 ? { ...task, status: 'completed' } : task
                        )
                    );
                } else {
                    throw new Error('No AI response for structure generation');
                }
            } catch (error) {
                console.error('Error generating files:', error);
                setTasks((prevTasks) =>
                    prevTasks.map((task) =>
                        task.id === 3 ? { ...task, status: 'failed' } : task
                    )
                );
            }
        }
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

                    handleGenCodesTask();
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
