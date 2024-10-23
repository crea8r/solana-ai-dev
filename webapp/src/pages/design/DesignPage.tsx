// src/App.tsx

import { v4 as uuidv4 } from 'uuid';
import React, { useState, useCallback, useEffect } from 'react';
import { Button, Flex, useDisclosure, useToast } from '@chakra-ui/react';
import {
  Node,
  Edge,
  Connection,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType,
} from 'react-flow-renderer';
import TopPanel from './TopPanel';
import Toolbox from '../../components/Toolbox';
import Canvas from '../../components/Canvas';
import PropertyPanel from '../../components/PropertyPanel';
import { ToolboxItem } from '../../interfaces/ToolboxItem';
import PromptModal from '../../components/PromptModal';
import WalkthroughDialog from '../../components/WalkthroughDialog';
import { FaQuestion } from 'react-icons/fa';
import { initGA, logPageView } from '../../utils/analytics';
import genStructure from '../../prompts/genStructure';
import promptAI from '../../services/prompt';
import LoadingModal from '../../components/LoadingModal';
import { FileTreeItemType } from '../../components/FileTree';

import { todoproject } from '../../data/mock';
import { loadItem } from '../../utils/itemFactory';
import ListProject from './ListProject';
import { projectApi } from '../../api/project';
import ProjectBanner from './ProjectBanner';
import { SaveProjectResponse } from '../../interfaces/project';
import { createItem } from '../../utils/itemFactory';
import { TaskModal } from './TaskModal';
import { useProjectContext } from '../../contexts/ProjectContext';
import InputModal from '../../components/InputModal';
const GA_MEASUREMENT_ID = 'G-L5P6STB24E';
// load env
const isProduction =
  (process.env.REACT_APP_ENV || 'development') === 'production';

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
  const { projectContext: projectContext, setProjectContext: setProjectContext } = useProjectContext();
  const isSaveDisabled = !projectContext || !projectContext.id || !projectContext.name || !projectContext.details;

  const [nodes, setNodes] = useState<Node[]>(projectContext.details.nodes || []);
  const [edges, setEdges] = useState<Edge[]>(projectContext.details.edges || []);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [promptString, setPromptString] = useState<any>({});
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);

  useEffect(() => {
    const log = `-- [DesignPage] - useEffect --
    'project' context updated: 
    Project Id: ${projectContext.id}
    Root Path: ${projectContext.rootPath}
    Name: ${projectContext.name}
    Description: ${projectContext.description}  
    nodes: ${projectContext.details.nodes.length} (${projectContext.details.nodes.map((node) => node.data.item.name).join(', ')});
    edges: ${projectContext.details.edges.length}
    isAnchorInit: ${projectContext.details.isAnchorInit}
    isCode: ${projectContext.details.isCode}`;
    console.log(log);
  }, [projectContext]);

  const loadMock = useCallback(() => {
    console.log('todoproject', todoproject);
    setProjectContext(todoproject);
    const tmpNodes = [];
    for (const node of todoproject.details.nodes) {
      const item = loadItem(node.data.item.type, node.data.item);
      if (item) {
        const newNode = loadItem(node.data.item.type, node.data.item)?.toNode({
          x: node.position.x,
          y: node.position.y,
        });
        if (newNode) {
          newNode.id = node.id;
          tmpNodes.push(newNode);
        }
      }
    }
    setNodes(tmpNodes);
    setEdges(todoproject.details.edges);
  }, [setProjectContext]);

  const [isListProjectModalShown, setIsListProjectModalShown] = useState(false);
  const {
    isOpen: isProjectBannerOpen,
    onClose: closeProjectBanner,
    onOpen: openProjectBanner,
  } = useDisclosure();
  const toast = useToast();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  /*
  useEffect(() => {
    if (isProduction) {
      initGA(GA_MEASUREMENT_ID);
      logPageView();
    }
    if (!isProduction) {
      loadMock();
    }
  }, [setProjectContext, loadMock]);
  */

  const onNodesChange = useCallback((changes: any) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes: any) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, []);

  const handleSelectNode = (node: Node | null) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  };

  const handleSelectEdge = (edge: Edge | null) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  };

  const handleDeleteNode = (id: string) => {
    setNodes(nodes.filter((node) => node.id !== id));
    setEdges(edges.filter((edge) => edge.source !== id && edge.target !== id));
    setSelectedNode(null);
  };

  const handleDeleteEdge = (id: string) => {
    setEdges(edges.filter((edge) => edge.id !== id));
    setSelectedEdge(null);
  };

  const handleUpdateNode = (updatedNode: Node) => {
    // Check if ownerProgramId has changed
    const oldNode = nodes.find((node) => node.id === updatedNode.id);
    const newOwnerProgramId = (updatedNode.data.localValues as any).ownerProgramId;
    const oldOwnerProgramId = oldNode && (oldNode.data.item as any).ownerProgramId;
    
    if (newOwnerProgramId !== oldOwnerProgramId) {
      // Remove old edge if it exists
      if (oldOwnerProgramId) {
        setEdges(
          edges.filter(
            (edge) =>
              !(
                edge.source === oldOwnerProgramId &&
                edge.target === updatedNode.id
              )
          )
        );
      }

      // Add new edge if ownerProgramId is set
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
        //console.log(newEdge);
        setEdges((edges) => [...edges, newEdge]);
      }
    }
    const item = updatedNode.data.item as ToolboxItem;
    item.setPropertyValues(updatedNode.data.localValues);

    const updatedNodes = nodes.map((node) =>
      node.id === updatedNode.id ? updatedNode : node
    );
    
    setNodes(updatedNodes);
    setSelectedNode(updatedNode);

    setProjectContext((prevProjectContext) => ({
      ...prevProjectContext,
      details: {
        ...prevProjectContext.details,
        nodes: updatedNodes,
      }
    }));
  };

  const handleUpdateEdge = (updatedEdge: Edge) => {
    setEdges(
      edges.map((edge) => (edge.id === updatedEdge.id ? updatedEdge : edge))
    );
    setSelectedEdge(updatedEdge);
  };

  const handleAddNode = (newNode: Node) => {
    setNodes((nds) => [...nds, newNode]);
  };

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

  useEffect(() => {
    const hasSeenWalkthrough = localStorage.getItem('hasSeenWalkthrough');
    if (!hasSeenWalkthrough) {
      setIsWalkthroughOpen(true);
      localStorage.setItem('hasSeenWalkthrough', 'true');
    }
  }, []);

  const handleOpenClick = () => {
    setIsListProjectModalShown(true);
  };

  const handleSaveClick = async () => {
    // if no project id, then create new project
    if (projectContext && !projectContext.id && !projectContext.rootPath) {
      if (!projectContext.name || !projectContext.description) {
        setIsInputModalOpen(true);
        toast({
          title: 'Project name and description are required',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      try {
        const response: SaveProjectResponse = await projectApi.createProject(projectContext);

        if (response.projectId && response.rootPath) {
          toast({
            title: 'Project saved',
            status: 'success',
            duration: 4000,
            isClosable: true,
          });

          setProjectContext((prev) => ({
            ...prev,
            id: response.projectId,
            rootPath: response.rootPath,
          }));

          console.log("Created new project on database", response.projectId, response.rootPath);
        } else {
          toast({
            title: 'Something went wrong',
            status: 'error',
            duration: 4000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error('Error saving project:', error);
      }
    }
    // else update existing project
    if (projectContext && projectContext.id && projectContext.rootPath) {
      try {
        const response = await projectApi.updateProject(projectContext.id, projectContext);
        if (response.message === 'Project updated successfully') {
          setProjectContext((prev) => ({
            ...prev,
            details: {
              ...prev.details,
              isSaved: true,
            },
          }));
          toast({
            title: 'Project updated successfully!',
            status: 'success',
            duration: 4000,
            isClosable: true,
          });
          console.log("Updated project on database", response.projectId, response.rootPath);
        } else {
          toast({
            title: 'Something went wrong',
            status: 'error',
            duration: 4000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error('Error updating project:', error);
      }
    }
  };

  const handleNewClick = async () => {
    setIsLoading(true);
    try {
      setProjectContext((prevProjectContext) => ({
        ...prevProjectContext,
        id: '',
        rootPath: '',
        name: '',
        description: '',
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
        },
      }));

      setNodes([]);
      setEdges([]);

    } catch (error) {
      console.error('Error creating new project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadProject = async (projectId: string, projectName: string) => {
    setIsLoading(true);
    try {
      const fetchedProject = await projectApi.getProjectDetails(projectId);

      // recreate the toolbox item
      const nodesWithTypedItems = fetchedProject.details.nodes.map((node: Node) => {
        const restoredItem = createItem(node.data.item.type);
        return {
          ...node,
          data: {
            ...node.data,
            item: restoredItem,
          },
        };
      });

      setProjectContext((prevProjectContext) => ({
        ...prevProjectContext,
        id: fetchedProject.id,
        rootPath: fetchedProject.root_path,
        name: fetchedProject.name,
        description: fetchedProject.description,
        details: {
          ...prevProjectContext.details,
          nodes: fetchedProject.details.nodes,
          edges: fetchedProject.details.edges,
          isSaved: fetchedProject.details.isSaved,
          isAnchorInit: fetchedProject.details.isAnchorInit,
          isCode: fetchedProject.details.isCode,
        },
      }));

      setNodes(nodesWithTypedItems || []);
      setEdges(fetchedProject.details.edges || []);

    } catch (e) {
      toast({
        title: 'Something went wrong!',
        description: `Cannot load ${projectName} project`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      handleCloseWalkthrough();
    }
  };
  
  useEffect(() => {
    setProjectContext((prevProjectContext) => ({
      ...prevProjectContext,
      details: {
        ...prevProjectContext.details,
        nodes: nodes,
        edges: edges,
      }
    }));
  }, [nodes, edges]);

  const toggleTaskModal = () => {
    setIsTaskModalOpen((prev) => !prev);
  };

  const toggleInputModal = () => {
    setIsInputModalOpen((prev) => !prev);
  };



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
      <Flex direction='column' height='100vh'>
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
        />
        <Flex flex={1}>
          <Toolbox />
          <Canvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectNode={handleSelectNode}
            onSelectEdge={handleSelectEdge}
            onAddNode={handleAddNode}
          />
          <PropertyPanel
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            onDeleteNode={handleDeleteNode}
            onDeleteEdge={handleDeleteEdge}
            onUpdateNode={handleUpdateNode}
            onUpdateEdge={handleUpdateEdge}
            programs={nodes.filter((node) => node.type === 'program')}
            nodes={nodes}
          />
        </Flex>
        <Button
          position='fixed'
          bottom='4'
          right='4'
          colorScheme='blue'
          onClick={handleOpenWalkthrough}
          leftIcon={<FaQuestion />}
          style={{ zIndex: 100 }}
        >
          Help
        </Button>
      </Flex>
      <ListProject
        isOpen={isListProjectModalShown}
        onClose={() => setIsListProjectModalShown(false)}
        onProjectClick={handleLoadProject}
      />
      <LoadingModal isOpen={isLoading} onClose={() => setIsLoading(false)} />
      <TaskModal isOpen={isTaskModalOpen} onClose={toggleTaskModal} />
      <InputModal isOpen={isInputModalOpen} onClose={toggleInputModal} />
    </>
  );
};

export default DesignPage;
