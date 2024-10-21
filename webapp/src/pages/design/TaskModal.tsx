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
import { Spinner } from '@chakra-ui/react';
import { fileApi } from '../../api/file';
import { FileTreeNode } from '../../interfaces/file';

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
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        if (isOpen && savedProject) {
            const initialTasks: Task[] = [
                {
                    id: 1,
                    name: 'Project saved',
                    status: savedProject.projectSaved ? 'completed' : 'loading',
                    type: 'main',
                },
                {
                    id: 2,
                    name: 'Initializing Anchor project',
                    status: savedProject.anchorInitCompleted ? 'completed' : 'loading',
                    type: 'main',
                },
                {
                    id: 3,
                    name: 'Generating files:',
                    status: savedProject.filesAndCodesGenerated ? 'completed' : 'loading',
                    type: 'main',
                },
            ];
            setTasks(initialTasks);

            if (!savedProject.anchorInitCompleted) {
                handleAnchorInitTask();
            } else if (!savedProject.filesAndCodesGenerated) {
                handleGenCodesTask();
            } else {
                console.log('All tasks completed');
            }
        }
    }, [isOpen, savedProject]);

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
                    projectSaved: true,
                });
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

        if (!savedProject?.id) { console.error('Project ID is undefined'); return; }
        console.log('savedProject.id', savedProject.id);

        if (savedProject?.details?.nodes && savedProject?.details?.edges) {
            const structurePrompt = genStructure(savedProject.details.nodes, savedProject.details.edges);
            const choices = await promptAI(structurePrompt);

            try {
                if (choices && choices.length > 0) {
                    const files = JSON.parse(choices[0].message?.content) as FileTreeItemType;
                    setFileTreePaths(files);
                    updateProject({ ...project, files });
                    const fileList = getFileList(files); // Returns array of { name, path }
                    console.log('fileList', fileList);

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

                    const existingFilesResponse = await fileApi.getDirectoryStructure(projectName, projectRootPath);
                    if (!existingFilesResponse) { console.error('Existing files not found'); return; }
                    console.log('existingFilesResponse', existingFilesResponse);

                    const existingFilePaths = new Set<string>();
                    const traverseFileTree = (nodes: FileTreeNode[]) => {
                        for (const node of nodes) {
                            if (node.type === 'file' && node.path) {
                                existingFilePaths.add(node.path);
                            } else if (node.type === 'directory' && node.children) {
                                traverseFileTree(node.children);
                            }
                        }
                    };
                    traverseFileTree(existingFilesResponse);

                    const configFiles = ['Cargo.toml', 'Anchor.toml', '.gitignore'];

                    for (const fileTask of fileTasks) {
                        setTasks((prevTasks) =>
                            prevTasks.map((task) =>
                                task.id === fileTask.id ? { ...task, status: 'loading' } : task
                            )
                        );

                        try {
                            const { nodes, edges } = savedProject.details || { nodes: [], edges: [] };
                            const fileName = fileTask.name;
                            const filePath = fileTask.path;

                            if (configFiles.includes(fileName)) {
                                console.log(`Skipping config file: ${fileName}`);
                                setTasks((prevTasks) =>
                                    prevTasks.map((task) =>
                                        task.id === fileTask.id ? { ...task, status: 'completed' } : task
                                    )
                                );
                                continue;
                            }

                            const promptContent = genFiles(nodes, edges, fileName || '', filePath || '');
                            const fileChoices = await promptAI(promptContent);

                            if (fileChoices && fileChoices.length > 0) {
                                const aiContent = fileChoices[0].message?.content;
                                const codeContent = extractCodeBlock(aiContent);

                                if (existingFilePaths.has(filePath || '')) {
                                    await fileApi.updateFile(savedProject.id || projectId, filePath || '', codeContent);
                                    console.log(`Updated existing file: ${filePath}`);
                                } else {
                                    await fileApi.createFile(savedProject.id || projectId, filePath || '', codeContent);
                                    console.log(`Created new file: ${filePath}`);
                                }

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

                    updateSavedProject({
                        filesAndCodesGenerated: true,
                    });
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

                    updateSavedProject({
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

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalBody>
                    <Box mt={4}>
                        <Box mb={4} style={{ display: savedProject?.projectSaved ? 'none' : 'block' }}>
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

                        <Box style={{ display: savedProject?.projectSaved ? 'block' : 'none' }}>
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
        <Spinner
            color="gray.300"
            size="sm"
            style={{ animationDuration: '1.4s' }} 
        />
    );
}
