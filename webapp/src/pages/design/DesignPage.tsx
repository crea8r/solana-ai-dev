// src/App.tsx

import { v4 as uuidv4 } from 'uuid';
import React, { useState, useCallback, useEffect } from 'react';
import {
  Button,
  Flex,
  Modal,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useToast,
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
import TopPanel from './TopPanel';
import Toolbox from '../../components/Toolbox';
import Canvas from '../../components/Canvas';
import PropertyPanel from '../../components/PropertyPanel';
import { ToolboxItem } from '../../interfaces/ToolboxItem';
import { prompt } from '../../utils/promptFactory';
import PromptModal from '../../components/PromptModal';
import WalkthroughDialog from '../../components/WalkthroughDialog';
import { FaQuestion } from 'react-icons/fa';
import { initGA, logPageView } from '../../utils/analytics';
import genStructure from '../../prompts/genStructure';
import promptAI from '../../services/prompt';
import LoadingModal from '../../components/LoadingModal';
import { FileTreeItemType } from '../../components/FileTree';
import ListProject from './ListProject';
import { projectApi } from '../../api/project';
import ProjectBanner from './ProjectBanner';
import { ProjectInfoToSave } from '../../interfaces/project';
import { useProject } from '../../contexts/ProjectContext';
import { createItem } from '../../utils/itemFactory';


const GA_MEASUREMENT_ID = 'G-L5P6STB24E';

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

  const [nodes, setNodes] = useState<Node[]>(project?.nodes || []);
  const [edges, setEdges] = useState<Edge[]>(project?.edges || []);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [promptString, setPromptString] = useState<any>({});
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListProjectModalShown, setIsListProjectModalShown] = useState(false);
  const {
    isOpen: isProjectBannerOpen,
    onClose: closeProjectBanner,
    onOpen: openProjectBanner,
  } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    initGA(GA_MEASUREMENT_ID);
    logPageView();
  }, []);

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
    console.log('[DesignPage] selectedNode', node);
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
    const newOwnerProgramId = (updatedNode.data.localValues as any)
      .ownerProgramId;
    const oldOwnerProgramId =
      oldNode && (oldNode.data.item as any).ownerProgramId;
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
        console.log(newEdge);
        setEdges((edges) => [...edges, newEdge]);
      }
    }
    const item = updatedNode.data.item as ToolboxItem;
    item.setPropertyValues(updatedNode.data.localValues);
    setNodes(
      nodes.map((node) => (node.id === updatedNode.id ? updatedNode : node))
    );
    setSelectedNode(updatedNode);
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

  const handlePrompt = async (nodes: Node[], edges: Edge[]) => {
    const ai_prompt = genStructure(nodes, edges);
    setPromptString(ai_prompt);
    setIsLoading(true);
    const choices = await promptAI(ai_prompt);
    try {
      if (choices && choices.length > 0) {
        const files = JSON.parse(
          choices[0].message?.content
        ) as FileTreeItemType;
        setFileTreePaths(files);

        setProject({
          name: project?.name || '',
          description: project?.description || '',
          nodes,
          edges,
          files,
        });
      }
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
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
    if (!savedProject) {
      console.error('Saved project data is missing');
      return;
    }
    console.log('[DesignPage] savedProject', savedProject);
    const projectInfo: ProjectInfoToSave = {
      name: savedProject.name,
      description: savedProject.description,
      details: {
        nodes: savedProject.details.nodes,
        edges: savedProject.details.edges,
      }
    };

    try {
      const response = await projectApi.saveProject(projectInfo);
      console.log('[DesignPage - handleSaveClick] projectInfo', projectInfo);
      console.log('Project saved successfully:', response);
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  // Handle new project 
  const handleNewClick = () => {};

  // Handle load project
  const handleLoadProject = async (projectId: string, projectName: string) => {
    setIsLoading(true);
    try {
      const project = await projectApi.getProjectDetails(projectId);

      // recreate the toolbox item
      const nodesWithTypedItems = project.details.nodes.map((node: Node) => {
        // Rebuild the item using the createItem function based on the type
        const restoredItem = createItem(node.data.item.type);  // Creates a ToolboxItem (e.g., Account, Instruction, Program)
  
        if (restoredItem) {
          // Restore any saved properties from the fetched data
          restoredItem.setName(node.data.item.name);  // Set name and other properties from fetched data
          restoredItem.setDescription(node.data.item.description);
        }
  
        // Return the node with the updated item (now it's a ToolboxItem with methods)
        return {
          ...node,
          data: {
            ...node.data,
            item: restoredItem,  // Updated with the re-created ToolboxItem
          },
        };
      });

      
      updateSavedProject({
        name: project.name,
        description: project.description,
        details: {
          nodes: project.details.nodes,
          edges: project.details.edges,
        }
      });


      setNodes(nodesWithTypedItems || []);
      setEdges(project.details.edges || []);

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

  /*
  useEffect(() => {
    console.log('selectedNode', selectedNode);
  }, [selectedNode]);
  */

  useEffect(() => {
    updateSavedProject({
      name: savedProject?.name || '',
      description: savedProject?.description || '',
      details: {
        nodes: nodes,
        edges: edges,
      }
    });
  }, [nodes, edges]);

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
          generatePrompt={() => {
            handlePrompt(nodes, edges);
          }}
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
    </>
  );
};

export default DesignPage;
