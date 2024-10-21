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
import { ProjectInfoToSave, SaveProjectResponse } from '../../interfaces/project';
import { useProject } from '../../contexts/ProjectContext';
import { createItem } from '../../utils/itemFactory';
import { TaskModal } from './TaskModal';

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
  const { project, savedProject, setProject, updateProject, updateSavedProject } = useProject();
  const isSaveDisabled = !savedProject || !savedProject.id || !savedProject.name || !savedProject.details;

  const [projectId, setProjectId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node[]>(project?.nodes || []);
  const [edges, setEdges] = useState<Edge[]>(project?.edges || []);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [promptString, setPromptString] = useState<any>({});
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadMock = useCallback(() => {
    console.log('todoproject', todoproject);
    setProject(todoproject);
    const tmpNodes = [];
    for (const node of todoproject.nodes) {
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
    setEdges(todoproject.edges);
  }, [setProject]);
  const [isListProjectModalShown, setIsListProjectModalShown] = useState(false);
  const {
    isOpen: isProjectBannerOpen,
    onClose: closeProjectBanner,
    onOpen: openProjectBanner,
  } = useDisclosure();
  const toast = useToast();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  useEffect(() => {
    if (isProduction) {
      initGA(GA_MEASUREMENT_ID);
      logPageView();
    }
    if (!isProduction) {
      loadMock();
    }
  }, [setProject, loadMock]);

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

    updateProject({
      nodes: updatedNodes,
    });
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

  // Handle open project
  const handleOpenClick = () => {
    setIsListProjectModalShown(true);
  };

  // Handle save project
  const handleSaveClick = async () => {
    // if no project id, then create new project
    if (savedProject && !savedProject.id) {
      const projectInfoToSave: ProjectInfoToSave = {
        name: savedProject.name,
        description: savedProject.description,
        details: {
          nodes: savedProject.details.nodes,
          edges: savedProject.details.edges,
        }
      };
      try {
        const response: SaveProjectResponse = await projectApi.saveProject(projectInfoToSave);
        updateSavedProject({
          id: response.projectId,
        });
      } catch (error) {
        console.error('Error saving project:', error);
      }
    }
    // else update existing project
    if (savedProject && savedProject.id) {
      const projectInfoToUpdate: ProjectInfoToSave = {
        id: savedProject.id,
        name: savedProject.name,
        description: savedProject.description,
        details: {
          nodes: savedProject.details.nodes,
          edges: savedProject.details.edges,
        }
      };
      try {
        const response = await projectApi.updateProject(savedProject.id, projectInfoToUpdate);
        console.log('response', response);
      } catch (error) {
        console.error('Error updating project:', error);
      }
    }
  };

  // Handle new project 
  const handleNewClick = async () => {
    setIsLoading(true);
    try {
      updateSavedProject({
        id: '',
        name: '',
        description: '',
        details: {
          nodes: [],
          edges: [],
        },
      });

      setNodes([]);
      setEdges([]);

    } catch (error) {
      console.error('Error creating new project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle load project
  const handleLoadProject = async (projectId: string, projectName: string) => {
    setIsLoading(true);
    try {
      const fetchedProject = await projectApi.getProjectDetails(projectId);

      // recreate the toolbox item
      const nodesWithTypedItems = fetchedProject.details.nodes.map((node: Node) => {
        const restoredItem = createItem(node.data.item.type);
  
        if (restoredItem) {
          restoredItem.setName(node.data.item.name);
          restoredItem.setDescription(node.data.item.description);
          restoredItem.setPropertyValues(node.data.localValues);
        }
  
        return {
          ...node,
          data: {
            ...node.data,
            item: restoredItem,
          },
        };
      });

      
      updateSavedProject({
        id: fetchedProject.id,
        name: fetchedProject.name,
        description: fetchedProject.description,
        details: {
          nodes: fetchedProject.details.nodes,
          edges: fetchedProject.details.edges,
        },
      });

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
    const _project_id = savedProject?.id;
    const _name = savedProject?.name;
    const _description = savedProject?.description;
    const _nodes_count = savedProject?.details.nodes.length;
    const _nodes_names = savedProject?.details.nodes.map((node: Node) => node.data.item.name);
    const _edges_count = savedProject?.details.edges.length;
    const _root_path = savedProject?.rootPath;
    const log = `-- [DesignPage] - useEffect --
    'savedProject' context updated: 
    Project Id: ${_project_id}
    Root Path: ${_root_path}
    Name: ${_name}
    Description: ${_description}  
    nodes: ${_nodes_count} (${_nodes_names?.join(', ')});
    edges: ${_edges_count}`;
    console.log(log);
  }, [savedProject]);
  
  useEffect(() => {
    updateSavedProject({
      id: savedProject?.id,
      name: savedProject?.name,
      description: savedProject?.description,
      details: {
        nodes: nodes,
        edges: edges,
      }
    });
  }, [nodes, edges]);

  const toggleTaskModal = () => {
    setIsTaskModalOpen((prev) => !prev);
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
          project={project}
        />
        <TopPanel
          generatePrompt={handlePrompt}
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
    </>
  );
};

export default DesignPage;
