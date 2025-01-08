import React, { useEffect, useState, useRef } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalBody, Box, Text, Flex, Spinner, Button, ModalHeader } from '@chakra-ui/react';
import { RefreshCw, X, CornerDownRight } from 'lucide-react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { projectApi } from '../../api/project';
import { taskApi } from '../../api/task';
import { FileTreeItemType } from "../../interfaces/file";
import genStructure from "../../prompts/genStructure";
import genFile from "../../prompts/genFile";
import { promptAI, promptAI_v2 } from "../../services/prompt";
import { 
    ensureInstructionNaming, 
    extractProgramIdFromAnchorToml, 
    getFileList, 
    normalizeName, 
    getNormalizedInstructionNames, 
    setFileTreePaths,
    processAIInstructionOutput,
    processAIStateOutput,
    processAITestOutput,
} from '../../utils/genCodeUtils';
import { fileApi } from '../../api/file';
import { useProjectContext, transformToProjectInfoToSave } from '../../contexts/ProjectContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { useToast } from '@chakra-ui/react'; 
import { Link as RouterLink } from 'react-router-dom';
import { 
    pollTaskStatus as pollTaskStatusUtil,
    amendConfigFile, 
    sortFilesByPriority, 
    extractInstructionContext, 
    extractStateStructs, 
    extractJSON, 
    //validateFileTree,
    processAIModRsOutput
 } from '../../utils/genCodeUtils';
import { getInstructionTemplate, getLibRsTemplate, getModRsTemplate, getStateTemplate } from '../../data/fileTemplates'; 
import instructionSchema from '../../data/ai_schema/instruction_schema.json';
import stateSchema from '../../data/ai_schema/state_schema.json';
import structureSchema from '../../data/ai_schema/structure_schema.json';
import insModSchema from '../../data/ai_schema/ins_mod_schema.json';
import sdkSchema from '../../data/ai_schema/sdk_schema.json';
import testSchema from '../../data/ai_schema/test_schema.json';
import { fetchDirectoryStructure, filterFiles } from '../../utils/codePageUtils';
import { mapFileTreeNodeToItemType } from '../../utils/codePageUtils';
import { LogEntry, useTerminalLogs } from "../../hooks/useTerminalLogs";
import authApi from '../../services/authApi';
import { predefinedFileStructure } from '../../data/schemas/predefinedFileStructure';
import { pascalToSnake } from '../../utils/uiUtils';

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
    const { user } = useAuthContext();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [contextReady, setContextReady] = useState(false);
    const [processedFiles, setProcessedFiles] = useState<Set<string>>(new Set()); 
    const [genCodeTaskRun, setGenCodeTaskRun] = useState(false); 
    const tasksInitializedRef = useRef(false);
    const toast = useToast(); 
    const [isRegenerating, setIsRegenerating] = useState(false); 
    const [existingDirectory, setExistingDirectory] = useState(false);
    const [stateTaskCompleted, setStateTaskCompleted] = useState(false);
    const [insTaskCompleted, setInsTaskCompleted] = useState(false);
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
                    name: 'Initialize Project',
                    status: projectContext?.details.isAnchorInit ? 'completed' : 'loading',
                    type: 'main' as 'main',
                },
                {
                    id: 2,
                    name: 'Generate Files',
                    status: projectContext?.details.isCode ? 'completed' : 'loading',
                    type: 'main' as 'main',
                },
                {
                    id: 3,
                    name: 'Install NPM Packages',
                    status: 'loading',
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

    const handleGenCodesTask = async (userId: string, projectId: string, rootPath: string, projectName: string) => {
        if (projectContext.details.isCode) return;
        if (!projectId) return;
        if (projectContext.details.nodes.length === 0 || projectContext.details.edges.length === 0) return;
        if (!userId) return;
      
        setTasks((prevTasks) => prevTasks.map((task) => (task.id === 2 ? { ...task, status: 'loading' } : task)) );
      
        const normalizedProgramName = normalizeName(projectContext.name);
        //('normalizedProgramName', normalizedProgramName);

        const instructionNodes = projectContext.details.nodes
          .filter((node) => node.type === "instruction")
          .map((node) => {
            const name = node.data?.item?.getName?.();
            if (!name) console.error("Instruction node is missing a name:", node);
            return { name: name || "default_instruction_name" };
        });

        const fileTree = predefinedFileStructure(normalizedProgramName, instructionNodes);
        //console.log('fileTree', fileTree);
        try {
          if (fileTree) {
            let files: FileTreeItemType;
            try {
              if (!fileTree) throw new Error('Invalid file structure returned by AI.');
              files = fileTree;
            } catch (jsonError) {
              console.error('Error parsing JSON from AI response:', jsonError);
              throw new Error('Failed to parse JSON from AI response');
            }
      
            setFileTreePaths(files);
            //console.log('files', files);
      
            let aiFilePaths = getFileList(files)
              .map((file) => file.path)
              .filter(Boolean) as string[];
      
            let updatedFilePaths = aiFilePaths.map((path) => {
              const instructionsPrefix = `/programs/${normalizedProgramName}/src/instructions/`;
              if (path.includes(instructionsPrefix)) {
                const pathParts = path.split('/');
                const fileName = pathParts.pop();
                if (fileName) {
                  const directoryPath = pathParts.join('/');
                  const newFileName = `run_${pascalToSnake(fileName)}`;
                  //console.log('newFileName', newFileName);
                  return `${directoryPath}/${newFileName}`;
                }
              }
              return path;
            });
      
            setProjectContext((prevContext) => ({
              ...prevContext,
              details: {
                ...prevContext.details,
                aiFilePaths: updatedFilePaths,
              },
            }));

            const programDirName = normalizedProgramName;
            if (!rootPath || !programDirName) return;
      
            const _existingFilesResponse = await fileApi.getDirectoryStructure(rootPath);
            if (!_existingFilesResponse) return;
      
            await fileApi.renameDirectory(rootPath, programDirName);
      
            const cargoFilePath = `programs/${programDirName}/Cargo.toml`;
            const anchorFilePath = `Anchor.toml`;
      
            await amendConfigFile(userId, projectId, 'Cargo.toml', cargoFilePath, programDirName);
            await amendConfigFile(userId, projectId, 'Anchor.toml', anchorFilePath, programDirName);
            
            const updatedFileList = getFileList(files)
            .map((file) => {
              let updatedPath = file.path;
              updatedPath = updatedPath.replace(/\/programs\/[^/]+\//, `programs/${programDirName}/`);
              //updatedPath = updatedPath.replace(/\/programs\/[^/]+\//, `programs/${programDirName}/`);
              return { ...file, path: updatedPath, name: file.name };
            })
            .filter((file) => file.path);

            //console.log('updatedFileList', updatedFileList);
      
            const filteredFileList = updatedFileList.filter((file) => {
              if (file.path?.includes('sdk/index.ts')) return false;

              return true;
            });
            //console.log('filteredFileList', filteredFileList);
      
            const sortedFilesToProcess = sortFilesByPriority(filteredFileList, programDirName);
      
            const configFiles = ['Cargo.toml', 'Xargo.toml', 'Anchor.toml', '.gitignore'];
      
            const uniqueFileMap = new Map(sortedFilesToProcess.map((file) => [file.path, file]));
            const uniqueFileList = Array.from(uniqueFileMap.values());
            let nextId = 3;
            //console.log('uniqueFileList', uniqueFileList);
      
            const processedFilesSet = new Set( projectContext.details.codes?.map((code) => code.path) || [] );
            //console.log('processedFilesSet', processedFilesSet);
      
            const instructionFileTasks: Task[] = [];
            const otherFileTasks: Task[] = [];
      
            uniqueFileList
              .filter(({ name, path }) => {
                if (configFiles.includes(name)) return false;
                if (name === 'sdk.rs') return false;
                if (processedFilesSet.has(path || '')) return false;
                return true;
              })
              .forEach(({ name, path }) => {
                const isInstructionFile = path?.includes('/instructions/') && !path.endsWith('mod.rs');
                const isInstructionModFile = path?.endsWith('/instructions/mod.rs');
                const isLibFile = name === 'lib.rs';
      
                const task = {
                  id: nextId++,
                  name,
                  path,
                  status: 'loading',
                  type: 'file',
                } as Task;
      
                if (isInstructionFile) instructionFileTasks.push(task);
                else if (isInstructionModFile) otherFileTasks.push(task);
                else if (!isLibFile) otherFileTasks.push(task);
              });
      
            const fileTasks = [...instructionFileTasks, ...otherFileTasks] 
            //console.log('fileTasks', fileTasks);
            //console.log('instructionFileTasks', instructionFileTasks);
            //console.log('otherFileTasks', otherFileTasks);

            setTasks((prevTasks) => {
              const mainTasks = prevTasks.filter((task) => task.type !== 'file');
              return [...mainTasks, ...fileTasks];
            });
      
            if (!projectName || !rootPath) return;
      
            const existingFilesResponse = await fileApi.getDirectoryStructure(rootPath);
            if (!existingFilesResponse) return;
      
            const existingFilePaths = new Set<string>();
            const traverseFileTree = (_nodes: FileTreeItemType[]) => {
              for (const node of _nodes) {
                if (node.type === 'file' && node.path) {
                  existingFilePaths.add(node.path);
                } else if (node.type === 'directory' && node.children) {
                  traverseFileTree(node.children);
                }
              }
            };
            traverseFileTree(existingFilesResponse);
      
            const instructionDetails: {
              instruction_name: string;
              context: string;
              params: string;
            }[] = [];
      
            for (const fileTask of fileTasks) {

              //console.log('fileTask', fileTask);
              //if(fileTask != fileTasks[0]) continue;
              if (processedFilesSet.has(fileTask.path || '')) continue;
      
              setTasks((prevTasks) =>
                prevTasks.map((task) =>
                  task.id === fileTask.id ? { ...task, status: 'loading' } : task
                )
              );
      
              const isStateFile = fileTask.path?.includes(`state.rs`);
              const isInstructionFile = fileTask.path?.includes('/instructions/') && !fileTask.path.endsWith('mod.rs');
              const isInstructionModFile = fileTask.path?.endsWith('/instructions/mod.rs');
              const isLibFile = fileTask.name === 'lib.rs';
              const isSdkFile = fileTask.path?.includes('sdk');
              const isTestFile = fileTask.path?.includes('.test.ts');
              if (isLibFile) continue;

              //console.log('isInstructionFile', isInstructionFile);
              //console.log('isInstructionModFile', isInstructionModFile);
              //console.log('isStateFile', isStateFile);
              //console.log('isSdkFile', isSdkFile);
              //console.log('isTestFile', isTestFile);

              try {
                const { nodes, edges } = projectContext.details || { nodes: [], edges: [] };
                const fileName = fileTask.name;
                const filePath = fileTask.path;
                if (!nodes || !edges) throw new Error('Nodes, edges are undefined');
                if (!filePath || !fileName) throw new Error('File path or file name is undefined');
      
                if (isInstructionModFile) {
                  const instructionNames = getNormalizedInstructionNames(
                    nodes as { type: string; data: { label: string } }[]
                  );
                  const codeContent = getModRsTemplate(instructionNames);
      
                  const modRsFilePath = `programs/${programDirName}/src/instructions/mod.rs`;
                  await fileApi.updateFile(projectId, modRsFilePath, codeContent);
      
                  setTasks((prevTasks) =>
                    prevTasks.map((task) =>
                      task.id === fileTask.id ? { ...task, status: 'completed' } : task
                    )
                  );
      
                  setProjectContext((prevProjectContext) => ({
                    ...prevProjectContext,
                    details: {
                      ...prevProjectContext.details,
                      codes: [
                        ...(prevProjectContext.details.codes || []),
                        { name: fileTask.name, path: modRsFilePath, content: codeContent },
                      ],
                    },
                  }));
      
                  continue;
                }
                console.log('process.env.REACT_APP_OPENAI_API_KEY', process.env.REACT_APP_OPENAI_API_KEY);
                const _promptContent = genFile(nodes, edges, fileName, filePath, '');
                const _apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';
      
                const _schema = isInstructionFile ? instructionSchema
                  : isStateFile ? stateSchema
                  : isInstructionModFile ? insModSchema
                  : isSdkFile ? sdkSchema 
                  : isTestFile ? testSchema
                  : '';
      
                const _promptType = isStateFile ? 'state'
                  : isInstructionFile ? 'instruction'
                  : isInstructionModFile ? 'instructionMod'
                  : isSdkFile ? 'sdk'
                  : isTestFile ? 'test'
                  : '';
      
                if (_schema === '') throw new Error('No schema for file generation');

                const _model = 'gpt-4o';

                //console.log('prompt content', _promptContent);
                //console.log('model', _model);
                //console.log('apiKey', _apiKey);
                //console.log('schema', _schema);
                //console.log('promptType', _promptType);
      
                const content = await promptAI(_promptContent, _model, _schema, _promptType);

                const anchorTomlPath = `Anchor.toml`;
                const programId = await extractProgramIdFromAnchorToml(
                  projectId,
                  anchorTomlPath,
                  programDirName
                );
      
                let codeContent = '';
                if (content) {
                  const aiContent = content;
      
                  if (isInstructionFile) {
                    const instructionName = fileName.replace('.rs', '');
                    const { codeContent: instructionCode, aiData } = await processAIInstructionOutput(projectId, programDirName, instructionName, aiContent);
                    codeContent = instructionCode;
                    instructionDetails.push({
                      instruction_name: instructionName, 
                      context: aiData.context_struct as string,
                      params: aiData.params_struct as string,
                    });

                    setProjectContext((prevContext) => ({
                      ...prevContext,
                      details: {
                        ...prevContext.details,
                        aiInstructions: [
                          ...prevContext.details.aiInstructions,
                          {
                            function_name: aiData.function_name,
                            description: aiData.description,
                            context_struct: aiData.context_struct,
                            params_fields: aiData.params_fields,
                            accounts: aiData.accounts,
                            error_codes: aiData.error_codes,
                            function_logic: aiData.function_logic,
                            accounts_structure: aiData.accounts_structure,
                        },
                      ],
                    },
                  }));

                  } else if (isStateFile) {
                    codeContent = await processAIStateOutput(projectId, programDirName, aiContent);
      
                    setProjectContext((prevContext) => ({
                      ...prevContext,
                      details: {
                        ...prevContext.details,
                        stateContent: codeContent,
                      },
                    }));
                  } 
                  else if (isTestFile) { codeContent = await processAITestOutput(projectId, programDirName, aiContent); } 
                  else { codeContent = aiContent; }
      
                  const updatedFilePath = filePath?.replace(
                    /\/programs\/[^/]+\//,
                    `/programs/${programDirName}/`
                  );

                  //console.log('updatedFilePath', updatedFilePath);
      
                  if (existingFilePaths.has(updatedFilePath || '')) await fileApi.updateFile(projectId, updatedFilePath || '', codeContent);
                  else await fileApi.createFile(projectId, updatedFilePath || '', codeContent);
      
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
            const anchorTomlPath = `Anchor.toml`;
            const programId = await extractProgramIdFromAnchorToml(
              projectId,
              anchorTomlPath,
              programDirName
            );

            setProjectContext((prevProjectContext) => ({
              ...prevProjectContext,
              details: {
                ...prevProjectContext.details,
                programId: programId,
              },
            }));
      
            const libRsContent = getLibRsTemplate(programDirName, programId, instructionDetails);
      
            await fileApi.updateFile(projectId, libRsPath, libRsContent);
      
            setProjectContext((prevProjectContext) => ({
              ...prevProjectContext,
              details: {
                ...prevProjectContext.details,
                codes: [
                  ...(prevProjectContext.details.codes || []),
                  { name: 'lib.rs', path: libRsPath, content: libRsContent },
                ],
              },
            }));
      
            setTasks((prevTasks) => prevTasks.map((task) => (task.id === 2 ? { ...task, status: 'completed' } : task)) );
      
            if (filteredFileList && filteredFileList.length > 0) {
              const instructionPaths = filteredFileList
                .filter((file) => file.path.includes('src/instructions/'))
                .map((file) => file.path)
                .map((path) =>
                path.replace(
                  new RegExp(`^programs/${programDirName}/`),
                  `programs/${programDirName}/`
                )
              );
      
              await ensureInstructionNaming(projectId, instructionPaths, programDirName);

              //console.log('instructionPaths', instructionPaths);
              //console.log('filteredFileList', filteredFileList);
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
          } else {
            throw new Error('No AI response for structure generation');
          }
        } catch (error) {
          console.error('Error generating files:', error);
          setTasks((prevTasks) =>
            prevTasks.map((task) => (task.id === 2 ? { ...task, status: 'failed' } : task))
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