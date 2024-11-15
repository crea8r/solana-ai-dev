import React, { useEffect, useState, useRef } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalBody, Box, Text, Flex, Spinner, Button, ModalHeader } from '@chakra-ui/react';
import { RefreshCw, X, CornerDownRight } from 'lucide-react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { projectApi } from '../../api/project';
import { taskApi } from '../../api/task';
import { FileTreeItemType } from "../../components/FileTree";
import genStructure from "../../prompts/genStructure";
import genFiles from "../../prompts/genFile";
import { promptAI } from "../../services/prompt";
import { 
    ensureInstructionNaming, 
    extractCodeBlock, 
    extractProgramIdFromAnchorToml, 
    getFileList, 
    insertTemplateFiles, 
    normalizeName, 
    getNormalizedInstructionNames, 
    setFileTreePaths 
} from '../../utils/genCodeUtils';
import { fileApi } from '../../api/file';
import { FileTreeNode } from '../../interfaces/file';
import { useProjectContext } from '../../contexts/ProjectContext';
import { transformToProjectInfoToSave } from '../../contexts/ProjectContext';
import { useToast } from '@chakra-ui/react'; 
import { Link as RouterLink } from 'react-router-dom';
import { amendConfigFile, sortFilesByPriority, extractInstructionContext, extractStateStructs } from '../../utils/genCodeUtils';
import { getInstructionTemplate, getLibRsTemplate, getModRsTemplate, getStateTemplate } from '../../data/fileTemplates'; 

interface genTaskProps {
    isOpen: boolean;
    onClose: () => void;
    disableClose?: boolean;
}

type TaskStatus = 'completed' | 'loading' | 'failed' | 'succeed' | 'warning';

type Task = {
    id: number;
    name: string;
    path?: string;
    status: TaskStatus;
    type: 'main' | 'file';
};

export const TaskModal: React.FC<genTaskProps> = ({ isOpen, onClose, disableClose }) => {
    const { projectContext, setProjectContext, projectInfoToSave, setProjectInfoToSave } = useProjectContext();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [contextReady, setContextReady] = useState(false);
    const [processedFiles, setProcessedFiles] = useState<Set<string>>(new Set()); 
    const [genCodeTaskRun, setGenCodeTaskRun] = useState(false); 
    const tasksInitializedRef = useRef(false);
    const toast = useToast(); 
    const [isRegenerating, setIsRegenerating] = useState(false); 
    const [existingDirectory, setExistingDirectory] = useState(false);

    const isCloseDisabled = tasks.some(task => task.status === 'loading');

    useEffect(() => {
        if (projectContext) {
            setContextReady(true);
        }
        //console.log('projectContext', projectContext);
    }, [projectContext]);

    useEffect(() => {
        if (isOpen && contextReady && !tasksInitializedRef.current) {
            if (!projectContext) return;

            if (!projectContext.id || !projectContext.rootPath) {
                toast({
                    title: 'Project not saved',
                    description: 'Please save the project first.',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
                onClose(); 
                return;
            }

            const initialTasks: Task[] = [
                {
                    id: 1,
                    name: 'Initialize Project',
                    status: projectContext?.details.isAnchorInit ? 'completed' : 'loading',
                    type: 'main' as 'main',
                },
                {
                    id: 2,
                    name: 'Generate Files',
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

    useEffect(() => {
        if (genCodeTaskRun) {
            const updateProjectInDatabase = async () => {
                try {
                    const projectInfoToSave = transformToProjectInfoToSave(projectContext);
                    await projectApi.updateProject(projectContext.id, projectInfoToSave);
                    console.log('Project updated successfully in the database.');
                } catch (error) {
                    console.error('Error updating project in the database:', error);
                }
            };

            updateProjectInDatabase();
        }
    }, [genCodeTaskRun]);

    const runTasksSequentially = async () => {
        if (!projectContext) {
            console.error("Project context not available.");
            return;
        }

        try {
            const { id: projectId, rootPath, name: projectName } = projectContext;

            if (!projectId || !rootPath || !projectName) {
                toast({
                    title: 'Project not saved',
                    description: 'Project name, root path, and description are required. Please save the project first.',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }

            // Checking if the project directory already exists
            try {
                const directory = await fileApi.getDirectoryStructure(projectName, rootPath);
                if (directory && directory.length > 0) {
                    console.log(`Project directory at ${rootPath} already exists. Initialization task will be skipped.`);
                    setProjectContext((prevProjectContext) => ({
                        ...prevProjectContext,
                        details: {
                            ...prevProjectContext.details,
                            isAnchorInit: true,
                            isCode: true,
                        },
                    }));
                    setExistingDirectory(true);
                    toast({
                        title: 'Directory already exists',
                        description: `The project directory ${rootPath} already exists on the server.`,
                        status: 'info',
                        duration: 5000,
                        isClosable: true,
                    });
                    return; 
                } else {
                    setExistingDirectory(false);
                }
            } catch (error) {
                console.error('Error checking directory existence:', error);
            }

            // if anchor project is not initialized, initialize it
            if (!projectContext.details.isAnchorInit) {
                await handleAnchorInitTask(projectId, rootPath, projectName);
            } else {
                console.log('Anchor project is already initialized.');
            }

            // if files and codes are not generated, generate them
            if (!genCodeTaskRun && !projectContext.details.isCode) {
                await handleGenCodesTask(projectId, rootPath, projectName);
                setGenCodeTaskRun(true);
            } else {
                console.log('Files and codes have already been generated or the task has already run.');
            }
        } finally {
        }
    };

    const handleGenCodesTask = async (projectId: string, rootPath: string, projectName: string) => {
        if (projectContext.details.isCode) return;
        if (!projectId) return;
        if (projectContext.details.nodes.length === 0 || projectContext.details.edges.length === 0) return;

        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === 2 ? { ...task, status: 'loading' } : task
            )
        );

        const structurePrompt = genStructure(projectContext.details.nodes, projectContext.details.edges);
        const choices = await promptAI(structurePrompt);

        try {
            if (choices && choices.length > 0) {
                const files = JSON.parse(choices[0].message?.content) as FileTreeItemType;
                setFileTreePaths(files);

                let aiFilePaths = getFileList(files).map((file) => file.path).filter(Boolean) as string[];
                const normalizedProgramName = normalizeName(projectContext.name);


                let updatedFilePaths = aiFilePaths.map((path) => {
                    const instructionsPrefix = `/programs/${normalizedProgramName}/src/instructions/`;
                    if (path.includes(instructionsPrefix)) {
                        const pathParts = path.split('/');
                        const fileName = pathParts.pop();
                        if (fileName) {
                            const directoryPath = pathParts.join('/');
                            const newFileName = `run_${fileName}`;
                            return `${directoryPath}/${newFileName}`;
                        }
                    }
                    return path;
                });

                updatedFilePaths = updatedFilePaths.filter((path) => {
                    const instructionsPrefix = `programs/${normalizedProgramName}/src/instructions/`;
                    if (path.includes(instructionsPrefix)) {
                        const fileName = path.split('/').pop();
                        return fileName !== 'lib.rs' && fileName !== 'mod.rs';  
                    }
                    return true;
                });

                setProjectContext((prevContext) => ({
                    ...prevContext,
                    details: {
                        ...prevContext.details,
                        aiFilePaths: updatedFilePaths,
                    },
                }));
                console.log("updatedFilePaths", updatedFilePaths);
                console.log("projectContext", projectContext);

                const programDirName = normalizedProgramName;
                if (!rootPath || !programDirName) return;

                const _existingFilesResponse = await fileApi.getDirectoryStructure(projectName, rootPath);
                if (!_existingFilesResponse) return;

                const response = await fileApi.renameDirectory(rootPath, programDirName);

                const cargoFilePath = `programs/${programDirName}/Cargo.toml`;
                const anchorFilePath = `Anchor.toml`;

                await amendConfigFile(projectId, 'Cargo.toml', cargoFilePath, programDirName);
                await amendConfigFile(projectId, 'Anchor.toml', anchorFilePath, programDirName);

                setProjectContext((prevContext) => ({
                    ...prevContext,
                    details: {
                        ...prevContext.details,
                        aiFilePaths: updatedFilePaths,
                    },
                }));

                const updatedFileList = getFileList(files)
                    .map((file) => {
                        let updatedPath = file.path;
                        updatedPath = updatedPath.replace(/\/programs\/[^/]+\//, `/programs/${programDirName}/`);
                        updatedPath = updatedPath.split('/').slice(1).join('/');
                        return { ...file, path: updatedPath, name: file.name };
                    })
                    .filter((file) => file.path);

                const sortedFilesToProcess = sortFilesByPriority(updatedFileList, programDirName);

                const filesToProcess = sortedFilesToProcess.filter((file) => {
                    return (
                        file.path?.startsWith(`programs/${programDirName}/src/`) ||
                        file.path?.startsWith('tests/') ||
                        file.path?.startsWith('sdk/')
                    );
                });

                const configFiles = ['Cargo.toml', 'Xargo.toml', 'Anchor.toml', '.gitignore'];

                const uniqueFileMap = new Map(sortedFilesToProcess.map((file) => [file.path, file]));
                const uniqueFileList = Array.from(uniqueFileMap.values());
                let nextId = 3;

                const processedFilesSet = new Set(projectContext.details.codes?.map((code) => code.path) || []);

                const fileTasks = uniqueFileList
                    .filter(({ name, path }) => {
                        if (configFiles.includes(name)) return false;
                        if (path?.startsWith('instructions/')) {
                            const fileName = path.split('/').pop();
                            if (fileName === 'lib.rs' || fileName === 'mod.rs') return false;
                        }
                        if (processedFilesSet.has(path || '')) return false;
                        if (path === `programs/${programDirName}/src/mod.rs`) return false;
                        return true;
                    })
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

                if (!projectName || !rootPath) return;

                const existingFilesResponse = await fileApi.getDirectoryStructure(projectName, rootPath);
                if (!existingFilesResponse) return;

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

                for (const fileTask of fileTasks) {
                    if (processedFilesSet.has(fileTask.path || '')) continue;
                    if (fileTask.path === `programs/${programDirName}/src/mod.rs`) continue;

                    setTasks((prevTasks) =>
                        prevTasks.map((task) =>
                            task.id === fileTask.id ? { ...task, status: 'loading' } : task
                        )
                    );

                    try {
                        const { nodes, edges } = projectContext.details || { nodes: [], edges: [] };
                        const fileName = fileTask.name;
                        const filePath = fileTask.path;

                        const promptContent = genFiles(nodes, edges, fileName || '', filePath || '');
                        const fileChoices = await promptAI(promptContent);

                        if (fileChoices && fileChoices.length > 0) {
                            const aiContent = fileChoices[0].message?.content;
                            const codeContent = extractCodeBlock(aiContent);

                            let updatedFilePath = filePath?.startsWith('Anchor Program/')
                                ? filePath.replace('Anchor Program/', 'programs/')
                                : filePath;

                            updatedFilePath = updatedFilePath?.replace(/\/programs\/[^/]+\//, `/programs/${programDirName}/`);

                            if (existingFilePaths.has(updatedFilePath || '')) {
                                await fileApi.updateFile(projectId, updatedFilePath || '', codeContent);
                            } else {
                                await fileApi.createFile(projectId, updatedFilePath || '', codeContent);
                            }

                            setProjectContext((prevProjectContext) => ({
                                ...prevProjectContext,
                                details: {
                                    ...prevProjectContext.details,
                                    codes: [
                                        ...(prevProjectContext.details.codes || []),
                                        { name: fileName || '', path: updatedFilePath || '', content: codeContent },
                                    ],
                                },
                            }));

                            setTasks((prevTasks) =>
                                prevTasks.map((task) =>
                                    task.id === fileTask.id ? { ...task, status: 'completed' } : task
                                )
                            );

                            if (fileTask.path) processedFilesSet.add(fileTask.path);
                            else throw new Error('File path is undefined');

                        } else throw new Error('No AI response for file generation');

                    } catch (error) {
                        console.error('Error generating file content for', fileTask.name, error);
                        setTasks((prevTasks) =>
                            prevTasks.map((task) =>
                                task.id === fileTask.id ? { ...task, status: 'failed' } : task
                            )
                        );
                    }
                }

                const libRsPath = `programs/${programDirName}/src/lib.rs`;
                const modRsPath = `programs/${programDirName}/src/instructions/mod.rs`;

                const nodes = projectContext.details?.nodes || [];
                if(nodes.length === 0) return;
                const normInstructionNames = getNormalizedInstructionNames(nodes as { type: string; data: { label: string } }[]);

                const anchorTomlPath = `Anchor.toml`;
                const programId = await extractProgramIdFromAnchorToml(projectId, anchorTomlPath, programDirName);
                console.log('Extracted Program ID:', programId);
            
                const instructionPaths = updatedFileList
                    .filter((file) => file.path.includes('/instructions/'))
                    .map((file) => file.path)
                    .map((path) =>
                        path.replace(/\/programs\/[^/]+\//, `/programs/${programDirName}/`)
                    );
                
                    const instructionContextMapping = await extractInstructionContext(
                        projectId,
                        normInstructionNames,
                        instructionPaths
                    );
                    
                    if (!instructionContextMapping) throw new Error("Failed to extract instruction context mapping.");

                
                const libRsContent = await getLibRsTemplate(projectId, programDirName, programId, instructionContextMapping, instructionPaths);
                const modRsContent = getModRsTemplate(normInstructionNames);

                setProjectContext((prevProjectContext) => ({
                    ...prevProjectContext,
                    details: {
                        ...prevProjectContext.details,
                        codes: [
                            ...(prevProjectContext.details.codes || []),
                            { name: 'lib.rs', path: libRsPath, content: libRsContent },
                            { name: 'mod.rs', path: modRsPath, content: modRsContent },
                        ],
                    },
                }));

                await insertTemplateFiles(
                    projectId,
                    programDirName,
                    existingFilePaths,
                    instructionContextMapping,
                    instructionPaths,
                    libRsPath,
                    modRsPath,
                    programId
                );

                setTasks((prevTasks) =>
                    prevTasks.map((task) =>
                        task.id === 2 ? { ...task, status: 'completed' } : task
                    )
                );

                if (updatedFileList && updatedFileList.length > 0) {
                    const instructionPaths = updatedFileList
                        .filter((file) => file.path.includes('/instructions/'))
                        .map((file) => file.path)
                        .map((path) =>
                            path.replace(/\/programs\/[^/]+\//, `/programs/${programDirName}/`)
                        );

                    await ensureInstructionNaming(projectId, instructionPaths, programDirName);
                }

                setProjectContext((prevProjectContext) => ({
                    ...prevProjectContext,
                    details: {
                        ...prevProjectContext.details,
                        isCode: true,
                    },
                }));

                setProjectInfoToSave((prevInfo) => ({
                    ...prevInfo,
                    details: {
                        ...prevInfo.details,
                        isAnchorInit: true,
                        isCode: true,
                    },
                }));

                // Generate instruction files using the template
                for (const [instructionName, { context, params, accounts, paramsFields, errorCodes }] of Object.entries(
                    instructionContextMapping
                )) {
                    const content = getInstructionTemplate(
                        instructionName,
                        context,
                        params,
                        accounts,
                        paramsFields,
                        errorCodes
                    );
                    const filePath = `programs/${programDirName}/src/instructions/${instructionName}.rs`;

                    if (existingFilePaths.has(filePath)) {
                        // Optionally, you can choose to overwrite or skip
                        console.log(`Overwriting instruction file: ${filePath}`);
                    }

                    await fileApi
                        .updateFile(projectId, filePath, content)
                        .then(() => console.log(`Generated instruction file: ${filePath}`))
                        .catch((error: any) => console.error(`Error creating ${filePath}:`, error));
                }

                // Handle state.rs
                const stateRsPath = `programs/${programDirName}/src/state.rs`;

                // Extract account structs from AI-generated state.rs
                const accountStructs = await extractStateStructs(projectId, stateRsPath);

                // Generate state.rs using the template
                if (accountStructs.length > 0) {
                    const stateContent = getStateTemplate(accountStructs);
                    console.log('stateContent', stateContent);

                    // Overwrite the content of the existing state.rs file
                    await fileApi.updateFile(projectId, stateRsPath, stateContent)
                        .then(() => console.log(`Updated state.rs file: ${stateRsPath}`))
                        .catch((error) => console.error(`Error updating ${stateRsPath}:`, error));
                } else {
                    console.error(`No account structs found in AI-generated state.rs`);
                }

                // Update tasks status
                setTasks((prevTasks) =>
                    prevTasks.map((task) =>
                        task.id === 2 ? { ...task, status: 'completed' } : task
                    )
                );
            } else {
                throw new Error('No AI response for structure generation');
            }
        } catch (error) {
            console.error('Error generating files:', error);
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === 2 ? { ...task, status: 'failed' } : task
                )
            );
        }
    };

    const handleAnchorInitTask = async (projectId: string, rootPath: string, projectName: string) => {
        try {
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === 1 ? { ...task, status: 'loading' } : task
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
            await pollTaskStatus(taskId);

        } catch (error) {
            console.error('Error initializing Anchor project:', error);

            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === 1 ? { ...task, status: 'failed' } : task
                )
            );
        }
    };

    const pollTaskStatus = (taskId: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                try {
                    const { task } = await taskApi.getTask(taskId);
                    console.log('task', task);

                    if (task.status === 'succeed' || task.status === 'warning') {
                        setTasks((prevTasks) =>
                            prevTasks.map((prevTask) =>
                                prevTask.type === 'main' && prevTask.id === 1
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
                                prevTask.id === 1 ? { ...prevTask, status: 'failed' } : prevTask
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

    const handleRegenerate = async () => {
        if (!projectContext) return;

        const { name: projectName, rootPath, id: projectId } = projectContext;

        if (!projectName || !rootPath || !projectId) {
            toast({
                title: 'Invalid Project',
                description: 'Project name, root path, or ID is missing.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        setIsRegenerating(true);

        try {
            await fileApi.deleteDirectory(rootPath);

            toast({
                title: 'Directory deleted',
                description: 'Root directory deleted. Restarting tasks...',
                status: 'info',
                duration: 3000,
                isClosable: true,
            });

            setProjectContext((prev) => ({
                ...prev,
                details: {
                    ...prev.details,
                    isAnchorInit: false,
                    isCode: false,
                },
            }));

            setTasks([]);
            tasksInitializedRef.current = false;
            await runTasksSequentially();

            toast({
                title: 'Tasks restarted',
                description: 'Project initialization and file generation restarted.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

        } catch (error) {
            console.error('Error regenerating files:', error);
            toast({
                title: 'Error regenerating files',
                description: 'There was an error regenerating the files. Please try again.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsRegenerating(false);
        }
    };

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
        <Modal 
            isOpen={isOpen} 
            onClose={isCloseDisabled ? () => {} : onClose}
            closeOnOverlayClick={!isCloseDisabled}
            closeOnEsc={!isCloseDisabled}
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader p={1} height={30}>
                    {projectContext.details.isCode || existingDirectory ? (
                        <Button 
                            onClick={handleRegenerate} 
                            variant="ghost" 
                            size="sm" 
                            colorScheme="gray" 
                            isLoading={isRegenerating}
                            height={30}
                        >
                            <RefreshCw className="h-3 w-3 mr-1" style={{ color: '#5688e8' }} />
                            <Text fontSize="xs" color="blue.500">Regenerate Files</Text>
                        </Button>
                    ) : ( <Box height={30} /> )}
                    <Button
                        onClick={isCloseDisabled ? undefined : onClose}
                        variant="ghost"
                        size="sm"
                        colorScheme="gray"
                        position="absolute"
                        top={2}
                        right={2}
                        isDisabled={isCloseDisabled}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </ModalHeader>
                <ModalBody>
                    <Box mt={4}>
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
                                            <Text 
                                                fontSize="sm" 
                                                maxW="300px" 
                                                whiteSpace="nowrap" 
                                                overflow="hidden" 
                                                textOverflow="ellipsis"
                                            >
                                                {task.path}
                                            </Text>
                                            <StatusSymbol status={task.status} />
                                        </Flex>
                                    ))}
                            </Box>
                        </Box>
                    </Box>
                    <Flex justify="flex-end" pt={3}>
                        <Box>
                            {(projectContext.details.isCode || existingDirectory) && (
                                <Button as={RouterLink} to="/code" variant="ghost" size="sm" colorScheme="gray">
                                    <Text fontSize="xs" color="blue.500">View Files</Text>
                                    <CornerDownRight className="h-3 w-3 ml-1 text-blue-500" />
                                </Button>
                            )}
                        </Box>
                    </Flex>
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