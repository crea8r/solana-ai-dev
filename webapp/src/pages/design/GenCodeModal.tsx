import React, { useEffect, useState, useRef } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalBody, Box, Text, Flex, Spinner, Button, ModalHeader } from '@chakra-ui/react';
import { RefreshCw, X, CornerDownRight } from 'lucide-react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { projectApi } from '../../api/project';
import { taskApi } from '../../api/task';
import { 
    extractProgramIdFromAnchorToml, 
    normalizeName, 
} from '../../utils/genCodeUtils';
import { fileApi } from '../../api/file';
import { useProjectContext, transformToProjectInfoToSave } from '../../contexts/ProjectContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { useToast } from '@chakra-ui/react'; 
import { Link as RouterLink } from 'react-router-dom';
import { 
  getFilesToGenerate, 
  setupProjectDirectory, 
  fetchAndExtractFilePaths,
  updateOrCreateFile,
  generateFileContent,
  getInstructionNamesSnake,
  aiGenOutput,
  insertAiOutputIntoFiles,
} from '../../utils/genCodeUtils2';
import { fetchDirectoryStructure, filterFiles } from '../../utils/codePageUtils';
import { mapFileTreeNodeToItemType } from '../../utils/codePageUtils';
import { LogEntry, useTerminalLogs } from "../../hooks/useTerminalLogs";


interface genTaskProps {
    isOpen: boolean;
    onClose: () => void;
    disableClose?: boolean;
}

const configFiles = ['Cargo.toml', 'Xargo.toml', 'Anchor.toml', '.gitignore'];
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
    const { user } = useAuthContext();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [contextReady, setContextReady] = useState(false);
    const [processedFiles, setProcessedFiles] = useState<Set<string>>(new Set()); 
    const [genCodeTaskRun, setGenCodeTaskRun] = useState(false); 
    const tasksInitializedRef = useRef(false);
    const toast = useToast(); 
    const [isRegenerating, setIsRegenerating] = useState(false); 
    const [existingDirectory, setExistingDirectory] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isPolling, setIsPolling] = useState(false);
    const isCloseDisabled = tasks.some(task => task.status === 'loading');
    const { logs: terminalLogs, addLog, clearLogs } = useTerminalLogs();

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
                    name: 'Generate Files',
                    status: genCodeTaskRun ? 'completed' : 'loading',
                    type: 'main' as 'main',
                },
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
          if (genCodeTaskRun) {
            const fetchAndSetProjectData = async () => {
              try {
                setIsLoading(true);
        
                const { id: projectId, rootPath } = projectContext;
                if (!projectId || !rootPath) {
                  console.error('Project context is missing essential data.');
                  setIsLoading(false);
                  return;
                }
        
                await fetchDirectoryStructure(
                  projectId,
                  rootPath,
                  projectContext.name,
                  mapFileTreeNodeToItemType,
                  filterFiles(rootPath),
                  () => {},
                  setProjectContext,
                  setIsPolling,
                  setIsLoading,
                  addLog,
                  (file) => {
                    setProjectContext((prev) => ({
                      ...prev,
                      selectedFile: file,
                      details: {
                        ...prev.details,
                        isCode: true,
                        programId: prev.details.programId,
                      },
                    }));
                  }
                );
        
                setIsLoading(false);
              } catch (error) {
                console.error('Error updating project in Task Modal:', error);
                setIsLoading(false);
              }
            };
            fetchAndSetProjectData();
            const updateProjectInDatabase = async () => {
              try {
                  const projectInfoToSave = transformToProjectInfoToSave(projectContext);
                  await projectApi.updateProject(projectContext.id, projectInfoToSave);
                  //console.log('Project updated successfully in the database.');
              } catch (error) { console.error('Error updating project in the database:', error); }
            };

          updateProjectInDatabase();
          }
        }
    }, [genCodeTaskRun]);

    const runTasksSequentially = async () => {
        if (!projectContext) { console.error("Project context not available."); return; }

        try {
            const { id: projectId, rootPath, name: projectName } = projectContext;
            if (!user) { throw new Error('User in auth context not found'); }

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

            try {
                const directory = await fileApi.getDirectoryStructure(rootPath);
                if (directory && directory.length > 0) {
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
                } else setExistingDirectory(false);

              } catch (error) { console.error('Error checking directory existence:', error); }

            if (!projectContext.details.isAnchorInit) await handleAnchorInitTask(projectId, rootPath, projectName);

            if (!genCodeTaskRun && !projectContext.details.isCode) {
              await handleGenCodesTask(user?.id, projectId, rootPath, projectName);
              setGenCodeTaskRun(true);
            } 

            await projectApi.installPackages(projectId);

        } catch (error) { console.error('Error running tasks:', error); }
    };

    const handleGenCodesTask = async (
      userId: string, 
      projectId: string, 
      rootPath: string, 
      _projectName: string
    ) => {
      if (projectContext.details.isCode) throw new Error('Project is already generated');
      if (!projectId) throw new Error('Project ID is undefined');
      if (projectContext.details.nodes.length === 0 || projectContext.details.edges.length === 0) throw new Error('Nodes, edges are undefined');
      if (!userId || !rootPath || !_projectName) throw new Error('User, root path, or project name is undefined');
        
      try {

        const instructionNamesSnake = getInstructionNamesSnake(projectContext.details.nodes);
        const processedFilesSet = new Set( projectContext.details.codes?.map((code) => code.path) || [] );
        const programName = normalizeName(_projectName);
  
        await setupProjectDirectory(rootPath, programName, userId, projectId);
        const existingFilePaths = await fetchAndExtractFilePaths(rootPath);
        const filesToGenerate = getFilesToGenerate(programName, instructionNamesSnake);

        const fileSet = new Set<{ name: string; path: string; content: string }>();
        let allFileDetails: any[] = [];

        for (const fileTask of filesToGenerate) {
          if (processedFilesSet.has(fileTask.path || '')) continue;

          try {
            const { nodes, edges } = projectContext.details || { nodes: [], edges: [] };
            const fileName = fileTask.name;
            const filePath = fileTask.path;
            if (!filePath || !fileName) throw new Error('File path or file name is undefined');
            const programId = await extractProgramIdFromAnchorToml(projectId, programName);

            const { fileDetails, codeContent } = await generateFileContent(fileTask, programName, nodes, programId, projectContext);

            fileSet.add({ name: fileName, path: filePath, content: codeContent });
            allFileDetails.push(fileDetails);
            console.log('fileDetails', fileDetails);
  
            if (fileTask.path) processedFilesSet.add(fileTask.path);
            else throw new Error('File path is undefined');
            
          } catch (error) {
            console.error('Error generating file content for', fileTask.name, error);
          }
        }

        const flatFileDetails = allFileDetails.flat();

        const instructionDetailsMap = new Map(
            flatFileDetails
              .filter((detail: any) => detail.context_name && detail.params_name)
              .map((detail: any) => [detail.name, detail])
        );

        const aiOutput = await aiGenOutput(fileSet, projectContext);
        const updatedFileSet = await insertAiOutputIntoFiles(fileSet, aiOutput, instructionDetailsMap);
        const updatedFileArray = Array.from(updatedFileSet);

        const formattedContents: any = await fileApi.formatFiles(updatedFileArray.map((file) => file.content));
  
        updatedFileArray.forEach((file: { content: string }, index: number) => {
          file.content = formattedContents[index];
        });

        for (const file of updatedFileArray) {  await updateOrCreateFile(projectId, file.path, file.content, existingFilePaths); }

        const programId = await extractProgramIdFromAnchorToml(projectId, programName);
        setProjectContext((prevProjectContext) => ({
          ...prevProjectContext,
          details: {
            ...prevProjectContext.details,
            programId: programId,
            isCode: true,
          },
        }));
          
        setTasks((prevTasks) => prevTasks.map((task) => (task.id === 1 ? { ...task, status: 'completed' } : task)) );
          
        setProjectInfoToSave((prevInfo) => ({
          ...prevInfo,
          details: {
            ...prevInfo.details,
            isAnchorInit: true,
            isCode: true,
          },
        }));
        
      } catch (error) {
        console.error('Error generating files:', error);
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === 1 ? { ...task, status: 'failed' } : task))
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
            //console.log('taskId', taskId);
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
                    //console.log('task', task);

                    if (task.status === 'succeed' || task.status === 'warning') {
                        /*
                        setTasks((prevTasks) =>
                            prevTasks.map((prevTask) =>
                                prevTask.type === 'main' && prevTask.id === 1
                                    ? { ...prevTask, status: 'completed' }
                                    : prevTask
                            )
                        );
                        */
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
            // 1. Delete the existing directory.
            await fileApi.deleteDirectory(rootPath);

            toast({
                title: 'Directory deleted',
                description: 'Root directory deleted. Restarting tasks...',
                status: 'info',
                duration: 3000,
                isClosable: true,
            });

            // 2. Reset project flags so we know we need to run Anchor init & code-gen again.
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

            setGenCodeTaskRun(false);

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
                            <Flex align="center" gap={2}>
                                <RefreshCw size={16} style={{ color: '#5688e8' }} />
                                <Text fontSize="xs" color="blue.500">Regenerate Files</Text>
                            </Flex>
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
                        <X size={16} />
                    </Button>
                </ModalHeader>
                <ModalBody>
                    <Box mt={4}>
                        <Box>
                            {tasks
                                .filter((task) => task.type === 'main')
                                .map((task) => (
                                    <Flex key={task.id} align="center" mb={2}>
                                        <StatusSymbol status={task.status} />
                                        <Text fontSize="sm" fontWeight="medium" ml={2}>{task.name}</Text>
                                    </Flex>
                                ))}
                            <Box mt={4}>
                                {tasks
                                    .filter((task) => task.type === 'file')
                                    .map((task) => (
                                        <Flex key={task.id} align="center" ml={4} mb={2}>
                                            <StatusSymbol status={task.status} />
                                            <Text fontSize="sm" fontWeight="medium" ml={2} mr={2}>
                                                {task.name}
                                            </Text>
                                            <Text 
                                                fontSize="sm" 
                                                maxW="300px" 
                                                whiteSpace="nowrap" 
                                                overflow="hidden" 
                                                textOverflow="ellipsis"
                                            >
                                                {task.path}
                                            </Text>
                                        </Flex>
                                    ))}
                            </Box>
                        </Box>
                    </Box>
                    <Flex justify="flex-end" pt={3}>
                        <Box>
                            {(projectContext.details.isCode || existingDirectory) && (
                                <Button as={RouterLink} to="/code" variant="ghost" size="sm" colorScheme="gray">
                                    <Flex align="center" gap={2}>
                                        <Text fontSize="xs" color="blue.500">View Files</Text>
                                        <CornerDownRight size={16} style={{ color: '#5688e8' }} />
                                    </Flex>
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