import React, { useEffect, useState, useRef } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalBody, Button, Box, Text, Flex, Input, Spinner } from '@chakra-ui/react';
import { CheckCircleIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { projectApi } from '../../api/project';
import { taskApi } from '../../api/task';
import { ProjectInfoToSave, SaveProjectResponse } from '../../interfaces/project';
import { FileTreeItemType } from "../../components/FileTree";
import genStructure from "../../prompts/genStructure";
import genFiles from "../../prompts/genFile";
import promptAI from "../../services/prompt";
import { extractCodeBlock, getFileList, setFileTreePaths } from '../../utils/genCodeUtils';
import { useProject } from '../../contexts/ProjectContext';
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
    const [isAnchorInit, setIsAnchorInit] = useState(false);
    const [isFilesGenerated, setIsFilesGenerated] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projectNameInput, setProjectNameInput] = useState<string>(savedProject?.name || '');
    const [projectDescriptionInput, setProjectDescriptionInput] = useState<string>(savedProject?.description || '');
    const [contextReady, setContextReady] = useState(false);

    const tasksInitializedRef = useRef(false);

    useEffect(() => {
        if (savedProject) {
            setContextReady(true);
        }
        const _project_id = savedProject?.id;
        const _name = savedProject?.name;
        const _description = savedProject?.description;
        const _nodes_count = savedProject?.details.nodes.length;
        const _edges_count = savedProject?.details.edges.length;
        const _root_path = savedProject?.rootPath;
        const log = `-- [TaskModal] - useEffect --
        'savedProject' context updated: 
        Project Id: ${_project_id}
        Root Path: ${_root_path}
        Name: ${_name}
        Description: ${_description}  
        nodes: ${_nodes_count}
        edges: ${_edges_count}
        prok
        anchorInitCompleted: ${savedProject?.anchorInitCompleted}
        filesAndCodesGenerated: ${savedProject?.filesAndCodesGenerated}`;
        
        console.log(log);
    }, [savedProject]);

    useEffect(() => {
        if (isOpen && contextReady && !tasksInitializedRef.current) {
            if (!savedProject) return;

            const initialTasks: Task[] = [
                {
                    id: 1,
                    name: 'Project saved',
                    status: savedProject?.projectSaved ? 'completed' : 'loading',
                    type: 'main',
                },
                {
                    id: 2,
                    name: 'Initializing Anchor project',
                    status: savedProject?.anchorInitCompleted ? 'completed' : 'loading',
                    type: 'main',
                },
                {
                    id: 3,
                    name: 'Generating files:',
                    status: savedProject?.filesAndCodesGenerated ? 'completed' : 'loading',
                    type: 'main',
                }
            ];

            setTasks(initialTasks);
            tasksInitializedRef.current = true;

            if (!savedProject?.anchorInitCompleted || !savedProject?.filesAndCodesGenerated) {
                runTasksSequentially();
            }
        }

        if (!isOpen) {
            setTasks([]);
            tasksInitializedRef.current = false;
        }
    }, [isOpen, savedProject, contextReady]);

    const isTaskCompleted = (taskStatus: TaskStatus) => {
        return taskStatus === 'completed';
    };

    const runTasksSequentially = async () => {
        if (!savedProject) {
            console.error("Saved project not available.");
            return;
        }

        if (!savedProject?.projectSaved) {
            if (savedProject?.name && savedProject?.description) {
                await handleCreateProject();
            } else {
                console.log('Project name and description are required.');
                return;
            }
        }

        if (!savedProject?.anchorInitCompleted) {
            if (savedProject?.id && savedProject?.rootPath) {
                await handleAnchorInitTask(savedProject.id, savedProject.rootPath, savedProject.name || '');
            } else {
                console.error('Project ID or root path is missing.');
                return;
            }
        } else {
            console.log('Anchor project is already initialized.');
        }

        if (!savedProject?.filesAndCodesGenerated) {
            if (savedProject?.id && savedProject?.rootPath && savedProject?.name) {
                await handleGenCodesTask(savedProject.id, savedProject.rootPath, savedProject.name);
            } else {
                console.error('Project root path or name is missing.');
                return;
            }
        } else {
            console.log('Files and codes have already been generated.');
        }
    };

    const handleCreateProject = async () => {
        // If projectSaved is true, skip saving and return early
        if (savedProject?.projectSaved) {
            console.log('Project already saved to database. Skipping save...');
            return;
        }

        const projectName = savedProject?.name || projectNameInput;
        const projectDescription = savedProject?.description || projectDescriptionInput;

        if (!projectName || !projectDescription) {
            console.log('Project name and description are required.');
            return;
        }

        // Update task status to 'loading' for project saving task
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
            if (response) {
                console.log("Project saved:", response);
                updateSavedProject({
                    id: response.projectId,
                    rootPath: response.rootPath,
                    name: projectName,
                    description: projectDescription,
                    projectSaved: true,
                });

                // Mark the save task as completed
                setTasks((prevTasks) =>
                    prevTasks.map((task) =>
                        task.id === 1 ? { ...task, status: 'completed' } : task
                    )
                );
                console.log('Project saved');

                // Proceed to the next task (Anchor initialization) after saving
                await handleAnchorInitTask(response.projectId, response.rootPath, projectName);
            } else {
                console.error('Error saving project:', response);
            }
        } catch (error) {
            console.error('Error saving project:', error);

            // Update task status to 'failed' if saving the project fails
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === 1 ? { ...task, status: 'failed' } : task
                )
            );
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

            if (!savedProject) {
                console.error('Saved project is undefined');
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

                        updateSavedProject({
                            anchorInitCompleted: true,
                        });

                        // Proceed to the next task
                        await handleGenCodesTask(projectId, rootPath, projectName);
                        resolve(); // Resolve the promise here

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
        if(savedProject?.filesAndCodesGenerated) {
            console.log('Files and codes have already been generated.');
            return;
        } 

        if(!savedProject?.details?.nodes || !savedProject?.details?.edges) {
            
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

        if ((savedProject?.details?.nodes && savedProject?.details?.nodes.length > 0) && (savedProject?.details?.edges && savedProject?.details?.edges.length > 0)) {
            const structurePrompt = genStructure(savedProject.details.nodes, savedProject.details.edges);
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
                    const fileTasks = updatedFileList.map(({ name, path }) => ({
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
                                    await fileApi.updateFile(projectId, filePath || '', codeContent);
                                    console.log(`Updated existing file: ${filePath}`);
                                } else {
                                    await fileApi.createFile(projectId, filePath || '', codeContent);
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

    // Determine whether to show the project input fields
    const showProjectInput = !savedProject?.projectSaved && (!savedProject?.name || !savedProject?.description);

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
                                    value={projectDescriptionInput}
                                    onChange={(e) => setProjectDescriptionInput(e.target.value)}
                                    required
                                    mb={2}
                                />
                                <Button
                                    onClick={() => {
                                        updateSavedProject({
                                            name: projectNameInput,
                                            description: projectDescriptionInput,
                                        });
                                        handleCreateProject();
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
