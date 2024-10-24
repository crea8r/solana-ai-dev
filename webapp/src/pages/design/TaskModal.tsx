import React, { useEffect, useState, useRef } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalBody, Button, Box, Text, Flex, Input, Spinner } from '@chakra-ui/react';
import { CheckCircleIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { projectApi } from '../../api/project';
import { taskApi } from '../../api/task';
import { ProjectDetail, ProjectInfoToSave, SaveProjectResponse } from '../../interfaces/project';
import { FileTreeItemType } from "../../components/FileTree";
import genStructure from "../../prompts/genStructure";
import genFiles from "../../prompts/genFile";
import promptAI from "../../services/prompt";
import { extractCodeBlock, getFileList, setFileTreePaths } from '../../utils/genCodeUtils';
import { fileApi } from '../../api/file';
import { FileTreeNode } from '../../interfaces/file';
import { useProjectContext } from '../../contexts/ProjectContext';
import { saveProject } from '../../utils/projectUtils'; // Import the utility function
import { useToast } from '@chakra-ui/react'; // Import toast for notifications

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
    const { projectContext, setProjectContext } = useProjectContext();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projectNameInput, setProjectNameInput] = useState<string>(projectContext?.name || '');
    const [projectDescInput, setProjectDescInput] = useState<string>(projectContext?.description || '');
    const [contextReady, setContextReady] = useState(false);
    const [processedFiles, setProcessedFiles] = useState<Set<string>>(new Set()); 
    const [genCodeTaskRun, setGenCodeTaskRun] = useState(false); 
    const tasksInitializedRef = useRef(false);
    const toast = useToast(); // Initialize toast

    useEffect(() => {
        if (projectContext) {
            setContextReady(true);
        }
        const log = `-- [TaskModal] useEffect --
        project context updated:    
        Project Id: ${projectContext?.id}
        Root Path: ${projectContext?.rootPath}
        Name: ${projectContext?.name}
        Description: ${projectContext?.description}  
        nodes: ${projectContext?.details.nodes.length}
        edges: ${projectContext?.details.edges.length}
        isAnchorInit: ${projectContext?.details.isAnchorInit}
        isCode: ${projectContext?.details.isCode}`;
        
        console.log(log);
    }, [projectContext]);

    useEffect(() => {
        if (isOpen && contextReady && !tasksInitializedRef.current) {
            if (!projectContext) return;

            const initialTasks: Task[] = [
                {
                    id: 1,
                    name: 'Project saved',
                    status: projectContext.id && projectContext.rootPath ? 'completed' : 'loading',
                    type: 'main' as 'main',  
                },
                {
                    id: 2,
                    name: 'Initializing Anchor project',
                    status: projectContext?.details.isAnchorInit ? 'completed' : 'loading',
                    type: 'main' as 'main',
                },
                {
                    id: 3,
                    name: 'Generating files:',
                    status: projectContext?.details.isCode ? 'completed' : 'loading',
                    type: 'main' as 'main',
                }
            ];

            setTasks(initialTasks);
            tasksInitializedRef.current = true;

            if ((!projectContext?.details.isAnchorInit || !projectContext?.details.isCode) && contextReady) {
                runTasksSequentially();
            }
        }

        if (!isOpen) {
            setTasks([]);
            tasksInitializedRef.current = false;
        }
    }, [isOpen, projectContext, contextReady]);

    const isTaskCompleted = (taskStatus: TaskStatus) => {
        return taskStatus === 'completed';
    };

    const runTasksSequentially = async () => {
        if (!projectContext) {
            console.error("Project not available.");
            return;
        }

        let projectId = projectContext.id;
        let rootPath = projectContext.rootPath;

        if (!projectId && !rootPath && contextReady) {
            if (projectContext.name && projectContext.description) {
                const response = await handleProjectSaveTask();
                if (response) {
                    projectId = response.projectId;
                    rootPath = response.rootPath;
                } else {
                    console.error('Failed to save project.');
                    return;
                }
            } else {
                console.log('Project name and description are required.');
                return;
            }
        }

        if (!projectContext?.details.isAnchorInit) {
            if (projectId && rootPath && contextReady) {
                await handleAnchorInitTask(projectId, rootPath, projectContext.name || '');
            } else {
                console.error('Project ID or root path is missing.');
                return;
            }
        } else {
            console.log('Anchor project is already initialized.');
        }

        if (!genCodeTaskRun && !projectContext.details.isCode) {
            if (projectId && rootPath && projectContext.name && contextReady) {
                await handleGenCodesTask(projectId, rootPath, projectContext.name);
                setGenCodeTaskRun(true); 
                console.log('Files and codes generated (runTasksSequentially).');
            } else {
                console.error('Project root path or name is missing.');
                return;
            }
        } else {
            console.log('Files and codes have already been generated or the task has already run.');
        }
    };

    const handleProjectSaveTask = async (): Promise<SaveProjectResponse | null> => {
        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === 1 ? { ...task, status: 'loading' } : task
            )
        );

        const response = await saveProject(projectContext, setProjectContext);

        if (response) {
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === 1 ? { ...task, status: 'completed' } : task
                )
            );
            return response;
        } else {
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === 1 ? { ...task, status: 'failed' } : task
                )
            );
            return null;
        }
    };

    const handleAnchorInitTask = async (projectId: string, rootPath: string, projectName: string) => {
        try {
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === 2 ? { ...task, status: 'loading' } : task
                )
            );

            if (!projectId || !rootPath) {
                console.error('Project ID or root path is undefined');
                return;
            }

            if (!projectContext) {
                console.error('Project is undefined');
                return;
            }
            if (!projectId || !projectName || !rootPath) {
                console.error('Project ID, name, or root path is missing.');
                return;
            }

            const response = await projectApi.initAnchorProject(projectId, rootPath, projectName);
            const { taskId } = response;
            console.log('taskId', taskId);
            await pollTaskStatus(taskId, projectId, rootPath, projectName);

        } catch (error) {
            console.error('Error initializing Anchor project:', error);

            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === 2 ? { ...task, status: 'failed' } : task
                )
            );
        }
    };

    const pollTaskStatus = (taskId: string, projectId: string, rootPath: string, projectName: string): Promise<void> => {
        return new Promise((resolve, reject) => {
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

                        setProjectContext((prevProjectContext) => ({
                            ...prevProjectContext,
                            details: {
                                ...prevProjectContext.details,
                                isSaved: true,
                                isAnchorInit: true,
                            },
                        }));

                        resolve();

                    } else if (task.status === 'failed') {
                        setTasks((prevTasks) =>
                            prevTasks.map((prevTask) =>
                                prevTask.id === 2 ? { ...prevTask, status: 'failed' } : prevTask
                            )
                        );
                        clearInterval(interval);
                        reject(new Error('Task failed'));
                    }
                } catch (error) {
                    console.error('Error fetching task status:', error);
                    clearInterval(interval);
                    reject(error);
                }
            }, 2000);
        });
    };

    const handleGenCodesTask = async (projectId: string, rootPath: string, projectName: string) => {
        if (projectContext.details.isCode) {
            console.log('Files and codes have already been generated.');
            return;
        }

        if (projectContext.details.nodes.length === 0 || projectContext.details.edges.length === 0) {
            console.error('Nodes or edges are missing in saved project details.');
            return;
        }

        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === 3 ? { ...task, status: 'loading' } : task
            )
        );

        if (!projectId) {
            console.error('Project ID is undefined');
            return;
        }

        const structurePrompt = genStructure(projectContext.details.nodes, projectContext.details.edges);
        const choices = await promptAI(structurePrompt);

        try {
            if (choices && choices.length > 0) {
                const files = JSON.parse(choices[0].message?.content) as FileTreeItemType;
                setFileTreePaths(files);

                const updatedFileList = getFileList(files).map(file => {
                    const updatedPath = file.path.split('/').slice(1).join('/');
                    return { ...file, path: updatedPath, name: file.name };
                });

                let nextId = 4;

                const processedFiles = new Set(projectContext.details.codes?.map((code) => code.path) || []);

                const fileTasks = updatedFileList
                    .filter(({ path }) => !processedFiles.has(path)) 
                    .map(({ name, path }) => ({
                        id: nextId++,
                        name,
                        path,
                        status: 'loading',
                        type: 'file',
                    } as Task));

                setTasks((prevTasks) => {
                    const mainTasks = prevTasks.filter((task) => task.type !== 'file');
                    return [...mainTasks, ...fileTasks];
                });

                if (!projectName || !rootPath) {
                    console.error('(handleGenCodesTask) Project name or root path is missing.');
                    return;
                }

                const existingFilesResponse = await fileApi.getDirectoryStructure(projectName, rootPath);
                if (!existingFilesResponse) {
                    console.error('Existing files not found');
                    return;
                }

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
                    if (processedFiles.has(fileTask.path || '')) {
                        continue;
                    }

                    setTasks((prevTasks) =>
                        prevTasks.map((task) =>
                            task.id === fileTask.id ? { ...task, status: 'loading' } : task
                        )
                    );

                    try {
                        const { nodes, edges } = projectContext.details || { nodes: [], edges: [] };
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
                                await fileApi.updateFile(projectId, filePath || '', codeContent);
                                console.log(`Updated existing file: ${filePath}`);
                            } else {
                                await fileApi.createFile(projectId, filePath || '', codeContent);
                                console.log(`Created new file: ${filePath}`);
                            }

                            setProjectContext((prevProjectContext) => ({
                                ...prevProjectContext,
                                details: {
                                    ...prevProjectContext.details,
                                    codes: [
                                        ...(prevProjectContext.details.codes || []),
                                        { name: fileName || '', path: filePath || '', content: codeContent },
                                    ],
                                },
                            }));

                            setTasks((prevTasks) =>
                                prevTasks.map((task) =>
                                    task.id === fileTask.id ? { ...task, status: 'completed' } : task
                                )
                            );
                            if (fileTask.path) {
                                processedFiles.add(fileTask.path);
                            } else {
                                throw new Error('File path is undefined');
                            }
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

                setProjectContext((prevProjectContext) => ({
                    ...prevProjectContext,
                    details: {
                        ...prevProjectContext.details,
                        isCode: true,
                    },
                }));
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
    };

    const showProjectInput = !projectContext.id && !projectContext.rootPath && (!projectContext.name || !projectContext.description);

    if (!contextReady) {
        return (
            <Spinner
                size="lg"
                color="blue.500"
                label="Loading project data..."
            />
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalBody>
                    <Box mt={4}>
                        {showProjectInput && (
                            <Box mb={4}>
                                <Input
                                    placeholder="Enter Project Name"
                                    value={projectNameInput}
                                    onChange={(e) => setProjectNameInput(e.target.value)}
                                    required
                                    mb={2}
                                />
                                <Input
                                    placeholder="Enter Project Description"
                                    value={projectDescInput}
                                    onChange={(e) => setProjectDescInput(e.target.value)}
                                    required
                                    mb={2}
                                />
                                <Button
                                    onClick={() => {
                                        setProjectContext((prevProjectContext) => ({
                                            ...prevProjectContext,
                                            name: projectNameInput,
                                            description: projectDescInput,
                                        }));
                                        handleProjectSaveTask();
                                    }}
                                    colorScheme="blue"
                                    mt={2}
                                    rightIcon={<ArrowForwardIcon />}
                                >
                                    Save Project
                                </Button>
                            </Box>
                        )}

                        {!showProjectInput && (
                            <Box>
                                {tasks
                                    .filter((task) => task.type === 'main')
                                    .map((task) => (
                                        <Flex key={task.id} justify="space-between" align="center" mb={2}>
                                            <Text fontSize="sm" fontWeight="medium">{task.name}</Text>
                                            <StatusSymbol status={task.status} />
                                        </Flex>
                                    ))}
                                <Box mt={4}>
                                    {tasks
                                        .filter((task) => task.type === 'file')
                                        .map((task) => (
                                            <Flex key={task.id} justify="space-between" align="center" ml={4} mb={2}>
                                                <Text fontSize="sm">{task.name}</Text>
                                                <StatusSymbol status={task.status} />
                                            </Flex>
                                        ))}
                                </Box>
                            </Box>
                        )}
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

function StatusSymbol({ status }: { status: TaskStatus }) {
    return status === 'completed' ? (
        <CheckCircleIcon color="green.500" />
    ) : status === 'failed' ? (
        <CheckCircleIcon color="red.500" />
    ) : (
        <Spinner
            color="gray.300"
            size="sm"
            style={{ animationDuration: '1.4s' }}
        />
    );
}
