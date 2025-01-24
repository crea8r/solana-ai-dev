import { v4 as uuidv4 } from 'uuid';
import React, { useState, useCallback, useEffect, useContext, useRef } from 'react';
import { 
  Button, 
  Flex, 
  TabPanels, 
  TabList, 
  Tab, 
  Tabs, 
  useDisclosure, 
  useToast, 
  TabPanel, 
  Text,
  Box,
  Tooltip
} from '@chakra-ui/react';
import {
  Node,
  Edge,
  Connection,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType,
} from 'react-flow-renderer';
import { MdOutlineFeedback } from "react-icons/md";
import TopPanel from './TopPanel';
import Toolbox from '../../components/Toolbox';
import Canvas from '../../components/Canvas';
import PropertyPanel from '../../components/PropertyPanel';
import { ToolboxItem } from '../../interfaces/ToolboxItem';
import PromptModal from '../../components/PromptModal';
import WalkthroughDialog from '../../components/WalkthroughDialog';
import FeedbackForm from '../../components/FeedbackForm';
import { FaQuestion } from 'react-icons/fa';
import { initGA, logPageView } from '../../utils/analytics';
import LoadingModal from '../../components/LoadingModal';
import { FileTreeItemType } from '../../interfaces/file';
import { createProjectContext, fetchProject, saveProject, getCodes, logProjectContext } from '../../utils/projectUtils';

import { loadItem } from '../../utils/itemFactory';
import ListProject from './ListProject';
import { projectApi } from '../../api/project';
import ProjectBanner from './ProjectBanner';
import { predefinedProjects } from '../../interfaces/example';
import { SaveProjectResponse } from '../../interfaces/project';
import { createItem } from '../../utils/itemFactory';
import { TaskModal } from './GenCodeModal';
import { useProjectContext } from '../../contexts/ProjectContext';
import InputModal from '../../components/InputModal';
import { logout } from '../../services/authApi';  
import { Wallet, WalletCreationModal } from '../../components/Wallet';
import { AuthContext } from '../../contexts/AuthContext';
import UISpace from '../ui/UISpace';
import CodeEditor from '../../components/CodeEditor';
import { handleRunCommand, 
  handleDeployProject, 
  handleTestProject, 
  handleBuildProject, 
  handleSave, 
  handleSelectFileUtil, 
  normalizePath1,
  filterFiles,
  mapFileTreeNodeToItemType,
  findFirstFile
} from '../../utils/codePageUtils';
import { useTerminalLogs } from '../../hooks/useTerminalLogs';
import FileTree from '../../components/FileTree';
import { tabStyle, tooltipStyle } from '../../styles/baseStyles';
import AIChat from '../../components/AIChat';
import { fetchDirectoryStructure } from '../../utils/projectUtils';
import { fetchFileInfo } from '../../utils/fileUtils';

const GA_MEASUREMENT_ID = 'G-L5P6STB24E';
const isProduction = (process.env.REACT_APP_ENV || 'development') === 'production';

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

const DesignPage: React.FC = () => {
  const { logs: terminalLogs, addLog, clearLogs } = useTerminalLogs();
  const { projectContext, setProjectContext } = useProjectContext();
  const isSaveDisabled = !projectContext || !projectContext.id || !projectContext.name || !projectContext.details;

  // Code state
  const [fileContent, setFileContent] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<FileTreeItemType | undefined>(undefined);
  const [isPolling, setIsPolling] = useState(false);  
  const savedFileRef = useRef(sessionStorage.getItem('selectedFile'));
  const [files, setFiles] = useState<FileTreeItemType | undefined>(undefined);
  const [isLoadingCode, setIsLoadingCode] = useState(false);

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [promptString, setPromptString] = useState<any>({});
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const { user, firstLoginAfterRegistration, markWalletModalViewed } = useContext(AuthContext)!;
  const [showWalletModal, setShowWalletModal] = useState(firstLoginAfterRegistration);
  const [loadingExample, setLoadingExample] = useState(false);
  const [isListProjectModalShown, setIsListProjectModalShown] = useState(false);
  const {
    isOpen: isProjectBannerOpen,
    onClose: closeProjectBanner,
    onOpen: openProjectBanner,
  } = useDisclosure();
  const toast = useToast();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'design' | 'ui' | 'code'>('design');

  const resetToolboxSelectionRef = useRef<() => void>(() => {});
  const fitViewRef = useRef<() => void>(() => {});

  // ---Tab Handlers---
  const tabIndexMap = {
    design: 0,
    ui: 1,
    code: projectContext.details.isCode ? 2 : -1,
  };
  const handleTabChange = (index: number) => {
    //console.log("Tab changed to index:", index); // Debugging log
    if (index === tabIndexMap.code && !projectContext.details.isCode) {
      setActiveTab('design');
      return;
    }
    setActiveTab(index === 0 ? 'design' : index === 1 ? 'ui' : 'code');
  };
  // ----------------


  // Code handlers
  const _handleSelectFile = useCallback(
    (file: FileTreeItemType) => { 
      //console.log("Selected File:", file);
      handleSelectFileUtil( file, projectContext, setSelectedFile, setFileContent, setIsLoading ); 
    },
    [projectContext, setSelectedFile, setFileContent, setIsLoading]
  );
  const _handleSave = async () => { 
    if (selectedFile) {
      handleSave(setProjectContext, selectedFile, projectContext?.id || '', setIsLoading, setIsPolling, addLog, fileContent); 

      const updatedFile = { ...selectedFile, content: fileContent };
      sessionStorage.setItem(
        'selectedFile',
        JSON.stringify({ 
          projectId: projectContext.id,
          file: updatedFile
        })
      );
      savedFileRef.current = JSON.stringify({ projectId: projectContext.id, file: updatedFile });

      setSelectedFile(updatedFile);
      setProjectContext((prev) => {
        if (!prev) return prev;
        const updatedCodes = prev.details.codes.map((code) => {
          if (normalizePath1(code.path || '') === normalizePath1(updatedFile.path || '')) {
            return { ...code, content: fileContent };
          }
          //console.log("Updated Codes Array After Save:", projectContext.details.codes);

          return code;
        });
        return { ...prev, details: { ...prev.details, codes: updatedCodes } };
      });
    } else {
      console.warn("No selected file to save.");
    }
  };
  const _handleBuildProject = () => { handleBuildProject(projectContext?.id || '', setIsPolling, setIsLoading, addLog, projectContext, setProjectContext); };
  const _handleDeployProject = () => { handleDeployProject(projectContext?.id || '', setIsPolling, setIsLoading, addLog, projectContext, setProjectContext); };
  const _handleTestProject = () => { handleTestProject(projectContext?.id || '', setIsPolling, setIsLoading, addLog); };
  const _handleRunCommand = (commandType: 'anchor clean' | 'cargo clean') => { handleRunCommand(projectContext?.id || '', setIsPolling, setIsLoading, addLog, commandType); };
  const handleContentChange = (newContent: string) => { setFileContent(newContent); };


  const handleLoadProject = async (projectId: string, projectName: string) => {
    //logProjectContext(projectContext);
    setIsLoading(true);
    try {
      const fetchedProject = await fetchProject(projectId, projectName);
      if (!fetchedProject) throw new Error('Failed to load project');
      
      setFiles(fetchedProject.details.files);

      const codes = await getCodes(fetchedProject?.id, fetchedProject.details.files);
      if (!codes) throw new Error('Failed to get codes');

      const projectContext = createProjectContext(fetchedProject);
      setProjectContext(projectContext);
      
      setProjectContext((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          files: fetchedProject.details.files,
          codes: codes,
        },
      }));

      //logProjectContext(projectContext);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // code useEffects
  //set saved file reference as the file in the session storage
  /*
  useEffect(() => {
    const savedFile = sessionStorage.getItem('selectedFile');
    if (savedFile) {
      try {
        const parsedFile: FileTreeItemType = JSON.parse(savedFile);
        if (parsedFile?.path && parsedFile?.name) {
          savedFileRef.current = savedFile;
        } else {
          console.warn("Invalid file data in session storage.");
          sessionStorage.removeItem('selectedFile');
        }
      } catch (e) {
        console.error("Error parsing saved file from session storage:", e);
        sessionStorage.removeItem('selectedFile');
      }
    }
  }, []);
  */
 
  useEffect(() => {
    const fetchFilesIfNeeded = async () => {
      try {
        if (projectContext?.details?.files?.children?.length) {
          //console.log('setFiles - projectContext.details.files', projectContext.details.files);
          setIsLoadingCode(true)
          setFiles(projectContext.details.files);
          setIsLoadingCode(false)
        } else if (projectContext?.details?.codes?.length) {
          //console.log('fetchDirectoryStructure - projectContext.details.codes', projectContext.details.codes);
          setIsLoadingCode(true)
          const data = await fetchDirectoryStructure(
            projectContext?.id,
            projectContext?.rootPath,
            projectContext?.name,
            mapFileTreeNodeToItemType,
            filterFiles(projectContext?.rootPath),
          );
          //console.log('data', data);
          setIsLoadingCode(false)
        }
      } catch (error) {
        console.error("Error fetching files or updating project context:", error);
      }
    };
  
    if (projectContext) fetchFilesIfNeeded();

  }, [projectContext, _handleSelectFile]);

  // fetch files and codes if projectContext is updated and isCode is true
  useEffect(() => {
    if (projectContext?.details?.isCode) {
      (async () => {
        try{
          const {fileTree, filePaths, fileNames} = await fetchFileInfo(projectContext?.id, projectContext?.rootPath, projectContext?.name, mapFileTreeNodeToItemType, filterFiles(projectContext?.rootPath));
          setFiles(fileTree);

          const codes = await getCodes(projectContext?.id, fileTree);
          if (!codes) throw new Error('Failed to fetch files and codes');
          
          setProjectContext((prev) => ({
            ...prev,
            details: {
              ...prev.details,
              files: fileTree,
              codes: codes,
            },
          }));

          //console.log('setFiles - projectContext.details.files', projectContext.details.files);
          
      
        } catch (error) {
          console.error('Error fetching files and codes:', error);
        }
      })();
    }
  }, [projectContext?.details?.isCode]);


  useEffect(() => {
    if (!projectContext) return;
    // If we're opening a different project (by ID), clear or adjust your session storage logic:
    const currentProjectId = projectContext.id; 
    const storedData = sessionStorage.getItem('selectedFile');
    if (storedData) {
      try {
        const { projectId: storedProjectId, file } = JSON.parse(storedData);
        // If the stored project is not the current one, don't restore the old file
        if (storedProjectId !== currentProjectId) {
          sessionStorage.removeItem('selectedFile');
          savedFileRef.current = null;
        } else {
          savedFileRef.current = JSON.stringify({ projectId: storedProjectId, file });
        }
      } catch (err) {
        sessionStorage.removeItem('selectedFile');
        savedFileRef.current = null;
      }
    }
  }, [projectContext]);

  useEffect(() => {
    if (projectContext?.details?.files?.children?.length) {
      const firstFile = findFirstFile(projectContext.details.files.children);
      if (firstFile) {
        setSelectedFile(firstFile);
        const fileData = projectContext.details.codes.find(code =>
          normalizePath1(code.path || '') === normalizePath1(firstFile.path || '')
        );
        setFileContent(fileData?.content || '');
      }
    }
  }, [projectContext]);

  useEffect(() => {
    
    if (!projectContext.details.isCode && activeTab === 'code') {
      setActiveTab('design');
    }
  }, [projectContext.details.isCode, activeTab]);

  useEffect(() => {
    //console.log("activeTab", activeTab)
  }, []);

  useEffect(() => {
    //logProjectContext(projectContext);
    //console.log('------------');
  }, [projectContext]);
  
  
  // ---Canvas Handlers---
  const onNodesChange = useCallback((changes: any) => {
    setProjectContext((prevProjectContext) => ({
      ...prevProjectContext,
      details: {
        ...prevProjectContext.details,
        nodes: applyNodeChanges(changes, prevProjectContext.details.nodes),
      },
    }));
  }, [setProjectContext]);

  const onEdgesChange = useCallback((changes: any) => {
    setProjectContext((prevProjectContext) => ({
      ...prevProjectContext,
      details: {
        ...prevProjectContext.details,
        edges: applyEdgeChanges(changes, prevProjectContext.details.edges),
      },
    }));
  }, [setProjectContext]);

  const onConnect = useCallback((connection: Connection) => {
    setProjectContext((prevProjectContext) => ({
      ...prevProjectContext,
      details: {
        ...prevProjectContext.details,
        edges: addEdge(connection, prevProjectContext.details.edges),
      },
    }));
  }, [setProjectContext]);

  const handleSelectNode = (node: Node | null) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  };

  const handleSelectEdge = (edge: Edge | null) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  };

  const handleDeleteNode = (id: string) => {
    setProjectContext((prevProjectContext) => ({
      ...prevProjectContext,
      details: {
        ...prevProjectContext.details,
        nodes: prevProjectContext.details.nodes.filter((node) => node.id !== id),
      },
    }));
    setSelectedNode(null);
  };

  const handleDeleteEdge = (id: string) => {
    setProjectContext((prevProjectContext) => ({
      ...prevProjectContext,
      details: {
        ...prevProjectContext.details,
        edges: prevProjectContext.details.edges.filter((edge) => edge.id !== id),
      },
    }));
    setSelectedEdge(null);
  };

  const handleUpdateNode = (updatedNode: Node) => {
    const oldNode = projectContext.details.nodes.find((node) => node.id === updatedNode.id);
    const newOwnerProgramId = (updatedNode.data.localValues as any).ownerProgramId;
    const oldOwnerProgramId = oldNode && (oldNode.data.item as any).ownerProgramId;
    
    if (newOwnerProgramId !== oldOwnerProgramId) {
      if (oldOwnerProgramId) {
        setProjectContext((prevProjectContext) => ({
          ...prevProjectContext,
          details: {
            ...prevProjectContext.details,
            edges: prevProjectContext.details.edges.filter(
              (edge) =>
                !(
                  edge.source === oldOwnerProgramId &&
                  edge.target === updatedNode.id
                )
            ),
          },
        }));
      }

      if (newOwnerProgramId) {
        const newEdge: Edge = {
          id: uuidv4(),
          source: newOwnerProgramId,
          target: updatedNode.id,
          type: 'solana',
          animated: false,
          style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.Arrow,
            color: '#ff0072',
            strokeWidth: 2,
          },
        };
        setProjectContext((prevProjectContext) => ({
          ...prevProjectContext,
          details: {
            ...prevProjectContext.details,
            edges: [...prevProjectContext.details.edges, newEdge],
          },
        }));
      }
    }
    const item = updatedNode.data.item as ToolboxItem;
    item.setPropertyValues(updatedNode.data.localValues);

    const updatedNodes = projectContext.details.nodes.map((node) =>
      node.id === updatedNode.id ? updatedNode : node
    );
    
    setProjectContext((prevProjectContext) => ({
      ...prevProjectContext,
      details: {
        ...prevProjectContext.details,
        nodes: updatedNodes,
      }
    }));
    setSelectedNode(updatedNode);
  };

  const handleUpdateEdge = (updatedEdge: Edge) => {
    setProjectContext((prevProjectContext) => ({
      ...prevProjectContext,
      details: {
        ...prevProjectContext.details,
        edges: prevProjectContext.details.edges.map((edge) => (edge.id === updatedEdge.id ? updatedEdge : edge)),
      },
    }));
    setSelectedEdge(updatedEdge);
  };

  const handleAddNode = (newNode: Node) => {
    setProjectContext((prevProjectContext) => ({
      ...prevProjectContext,
      details: {
        ...prevProjectContext.details,
        nodes: [...prevProjectContext.details.nodes, newNode],
      },
    }));
  };
  // ----------------

  const handlePrompt = () => {
    setIsTaskModalOpen((prev) => !prev);
  };

  const handleInputModal = () => {
    setIsInputModalOpen(true);
  };

  const handleCloseWalkthrough = () => {
    setIsWalkthroughOpen(false);
  };

  const handleOpenWalkthrough = () => {
    setIsWalkthroughOpen(true);
  };

  const handleOpenFeedbackForm = () => {
    setIsFeedbackFormOpen(true);
  };

  useEffect(() => {
    const hasSeenWalkthrough = sessionStorage.getItem('hasSeenWalkthrough');
    if (!hasSeenWalkthrough) {
      setIsWalkthroughOpen(true);
      sessionStorage.setItem('hasSeenWalkthrough', 'true');
    }
    if (isProduction) {
      initGA(GA_MEASUREMENT_ID);
      logPageView();
    }
  }, []);

  const handleOpenClick = () => {
    setIsListProjectModalShown(true);
  };

  const handleSaveClick = async () => {
    //logProjectContext(projectContext);
    const response = await saveProject(projectContext, setProjectContext);
    if (response) {
      toast({
        title: 'Project saved',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });

      setProjectContext((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          id: response.projectId,
          rootPath: response.rootPath,
          isSaved: true,
        },
      }));
    } else {
      toast({
        title: 'Please enter a project name and description',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleNewClick = async () => {
    setIsLoading(true);
    try {
      // Reset the selected node and edge
      setSelectedNode(null);
      setSelectedEdge(null);

      // Reset the example selection in the Toolbox
      if (resetToolboxSelectionRef.current) {
        resetToolboxSelectionRef.current();
      }

      // Reset the project context
      setProjectContext((prevProjectContext) => ({
        ...prevProjectContext,
        id: '',
        rootPath: '',
        name: '',
        description: '',
        aiModel: 'codestral-latest',
        apiKey: '',
        details: {
          ...prevProjectContext.details,
          nodes: [],
          edges: [],
          files: { name: '', children: [] },
          codes: [],
          docs: [],
          isSaved: false,
          isAnchorInit: false,
          isCode: false,
          aiFilePaths: [],
          aiStructure: '',
          stateContent: '',
        },
      }));

      setActiveTab('design');
    } catch (error) {
      console.error('Error creating new project:', error);
    } finally {
      setIsLoading(false);
    }
  };

 

  const toggleTaskModal = () => {
    setIsTaskModalOpen((prev) => !prev);
  };

  const toggleInputModal = () => {
    setIsInputModalOpen((prev) => !prev);
  };

  const handleLogout = useCallback(() => {
    logout();
    toast({
      title: 'Logged out successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    window.location.href = '/';
  }, [toast]);

  const handleToggleWallet = () => {
    setShowWallet((prev) => !prev);
  };

  const handleModalClose = () => {
    setShowWalletModal(false);
    markWalletModalViewed();
  };

  const handleExampleChange = (exampleName: string) => {
    if (exampleName && predefinedProjects[exampleName]) {
      const selectedProject = predefinedProjects[exampleName];
      setProjectContext((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          nodes: selectedProject.details.nodes,
          edges: selectedProject.details.edges,
        },
      }));
    }
  };

  useEffect(() => {
    if (projectContext && projectContext.details.nodes.length > 0 && !loadingExample) {
      const { nodes: contextNodes, edges: contextEdges } = projectContext.details;
  
      const tmpNodes = contextNodes
        .map((node) => {
          const item = loadItem(node.data.item.type, node.data.item);
          if (item) {
            const newNode = item.toNode({
              x: node.position.x,
              y: node.position.y,
            });
            if (newNode) {
              newNode.id = node.id;
              return newNode;
            }
          }
          return null;
        })
        .filter((node): node is Node => node !== null);
  
      setProjectContext((prevProjectContext) => ({
        ...prevProjectContext,
        details: {
          ...prevProjectContext.details,
          nodes: tmpNodes,
          edges: contextEdges,
        },
      }));
    }
  }, [projectContext.details.nodes]);
  
  
  useEffect(() => {
    if (!loadingExample) {
      setProjectContext((prevProjectContext) => ({
        ...prevProjectContext,
        details: {
          ...prevProjectContext.details,
          nodes: projectContext.details.nodes,
          edges: projectContext.details.edges,
        }
      }));
    }
    //console.log('projectContext:', projectContext);
  }, [projectContext.details.nodes, projectContext.details.edges, setProjectContext, loadingExample]);

  useEffect(() => {
    //console.log('user:', user);
  }, [user]);

  useEffect(() => {
    //console.log('projectContext:', projectContext);
  }, [projectContext]);


  /*
  useEffect(() => {
    if (projectContext?.details?.nodes?.length) {
      if (!projectContext.details.nodesHydrated) return;
      const firstProgramNode = projectContext.details.nodes.find(
        (node) => node.type === 'program'
      );

      if (firstProgramNode ) {
        setSelectedNode(firstProgramNode);
      }
    }
  }, [projectContext.details.nodes, projectContext.details.nodesHydrated]);
  */


  // Save the fitView function from Canvas
  const setFitViewFunction = useCallback((fitView: () => void) => {
    fitViewRef.current = fitView;
  }, []);

  useEffect(() => {
    if (activeTab === 'design') {
      fitViewRef.current(); // Call fitView when switching to Design tab
    }
  }, [activeTab]);

  return (
    <>
      <PromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        content={promptString}
      />
      <WalkthroughDialog
        isOpen={isWalkthroughOpen}
        onClose={handleCloseWalkthrough}
      />
      <FeedbackForm
        isOpen={isFeedbackFormOpen}
        onClose={() => setIsFeedbackFormOpen(false)}
      />
      <Flex direction="column" height="100vh" overflow="hidden">
        {/* Header area with no flex growth */}
        <Flex direction="column" flex="0 0 auto">
          <ProjectBanner
            isOpen={isListProjectModalShown}
            onClickSave={() => {}}
            closeBanner={closeProjectBanner}
            project={projectContext}
          />
          <TopPanel
            generatePrompt={handlePrompt}
            onClickInput={handleInputModal} 
            onClickNew={handleNewClick}
            onClickOpen={handleOpenClick}
            onClickSave={handleSaveClick}
            onLogout={handleLogout}
            onToggleWallet={handleToggleWallet}
          />
        </Flex>

        {/* Main content area takes the remaining height */}
        <Flex flex="1" overflow="hidden">
          {/* Left sidebar (files or toolbox) */}
          <Box width="20vw" height="100%" overflowY="auto" overflowX="hidden">
            {activeTab === 'code' ? (
              <FileTree
                onSelectFile={_handleSelectFile} 
                files={files} 
                selectedItem={selectedFile}
                onBuild={_handleBuildProject} 
                onDeploy={_handleDeployProject} 
                setIsTaskModalOpen={setIsTaskModalOpen} 
              />
            ) : (
              <Toolbox onExampleChange={handleExampleChange} resetToolboxSelection={(resetFunc) => (resetToolboxSelectionRef.current = resetFunc)} />
            )}
          </Box>

          {/* Center panel */}
          <Flex direction="column" width="50vw" height="100%" overflow="hidden" bg="gray.100" p={4}>
            <Tabs 
              index={tabIndexMap[activeTab]}
              onChange={handleTabChange}
              display="flex" 
              flexDirection="column" 
              flex="1" 
              overflow="hidden" 
              bg="white" 
              p={2} 
              borderRadius="md" 
              border="1px solid" 
              borderColor="gray.200"
            >
              <TabList flex="0 0 auto">
                <Flex width='100%' justifyContent='center' alignItems='center'>
                  <Tab {...tabStyle}>Design</Tab>
                  {/*<Tooltip label="Coming soon" {...tooltipStyle}>*/}
                    <Tab 
                      {...tabStyle}
                      isDisabled={false}
                    >UI</Tab>
                  {/*</Tooltip>*/}
                  <Tab
                    {...tabStyle}
                    isDisabled={!projectContext.details.isCode}
                  >
                    Code
                  </Tab>
                </Flex>
              </TabList>
              <TabPanels flex="1" overflow="hidden">
                <TabPanel display="flex" flexDirection="column" height="100%" overflow="hidden">
                  <Canvas
                    nodes={projectContext.details.nodes}
                    edges={projectContext.details.edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onSelectNode={handleSelectNode}
                    onSelectEdge={handleSelectEdge}
                    onAddNode={handleAddNode}
                    fitView={setFitViewFunction}
                  />
                </TabPanel>
                <TabPanel display="flex" flexDirection="column" height="100%" overflow="hidden">
                  <UISpace />
                </TabPanel>
                <TabPanel display="flex" flexDirection="column" height="100%" overflow="hidden">
                  <CodeEditor
                    content={fileContent}
                    selectedFile={selectedFile}
                    terminalLogs={terminalLogs}
                    clearLogs={clearLogs}
                    onChange={handleContentChange}
                    onSave={_handleSave}
                    onRunCommand={_handleRunCommand}
                    isPolling={isPolling}
                    isLoadingCode={isLoadingCode}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Flex>

          {/* Right-side panel */}
          <Box
            flex="1"
            height="100%"
            overflowY="auto"
            bg="gray.50"
            borderLeft="1px solid"
            borderColor="gray.200"
            overflowX="hidden"
            position="relative"
          >
            {activeTab === 'code' ? (
              <AIChat
                selectedFile={selectedFile}
                fileContent={fileContent}
                onSelectFile={_handleSelectFile}
                files={files}
              />
            ) : (
              <PropertyPanel
                selectedNode={selectedNode}
                selectedEdge={selectedEdge}
                onDeleteNode={handleDeleteNode}
                onDeleteEdge={handleDeleteEdge}
                onUpdateNode={handleUpdateNode}
                onUpdateEdge={handleUpdateEdge}
                programs={projectContext.details.nodes.filter(
                  (node) => node.type === 'program'
                )}
                nodes={projectContext.details.nodes}
                edges={projectContext.details.edges}
              />
            )}

            {/* Wallet Overlay */}
            {showWallet && (
              <Box
                position="absolute"
                top="10px"
                right="10px"
                bg="gray.50"
                border="1px solid"
                borderColor="gray.400"
                boxShadow="lg"
                borderRadius="md"
                zIndex="10"
                shadow="lg"
              >
                <Wallet />
              </Box>
            )}
          </Box>
        </Flex>
        <Button
            position='fixed'
            bottom='4'
            left='10'
            boxSizing='border-box'
            bg="white"
            border="2.5px solid"
            borderColor="#a9b7ff"
            shadow="lg"
            color="#a9b7ff"
            cursor="pointer !important"
            onClick={handleOpenWalkthrough}
            leftIcon={<FaQuestion />}
            style={{ zIndex: 100 }}
            _hover={{ bg: '#a9b7ff', color: 'white', border: '2.5px solid transparent' }}
            zIndex={100}
          >
            Help
          </Button>
          <Button
            position='fixed'
            bottom='4'
            left='40'
            boxSizing='border-box'
            bg="white"
            border="2.5px solid"
            borderColor="#a9b7ff"
            shadow="lg"
            color="#a9b7ff"
            cursor="pointer !important"
            onClick={handleOpenFeedbackForm}
            _hover={{ bg: '#a9b7ff', color: 'white', border: '2.5px solid transparent' }}
            leftIcon={<MdOutlineFeedback size={20}/>}
            zIndex={100}
          >
            Feedback
          </Button>
      </Flex>
      <ListProject
        isOpen={isListProjectModalShown}
        onClose={() => setIsListProjectModalShown(false)}
        onProjectClick={handleLoadProject}
      />
      <LoadingModal isOpen={isLoading} onClose={() => setIsLoading(false)} />
      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={toggleTaskModal} 
        handleSelectFile={_handleSelectFile} 
        setFiles={setFiles} 
        setActiveTab={setActiveTab}
      />
      <InputModal isOpen={isInputModalOpen} onClose={toggleInputModal} />
    </>
  );
};

export default DesignPage;