import React, { useCallback, useRef, useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  Controls,
  NodeTypes,
  ReactFlowInstance,
  applyNodeChanges,
} from 'react-flow-renderer';
import { Box } from '@chakra-ui/react';
import { createItem, getNodeTypes } from '../utils/itemFactory';
import CustomEdge from './CustomEdge';
import { useProjectContext } from '../contexts/ProjectContext';
import { Instruction } from '../items/Instruction';

interface CanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  onSelectNode: (node: Node | null) => void;
  onSelectEdge: (edge: Edge | null) => void;
  onAddNode: (node: Node) => void;
}

const edgeTypes = {
  solana: CustomEdge,
};

const Canvas: React.FC<CanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onSelectNode,
  onSelectEdge,
  onAddNode,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const { setProjectContext } = useProjectContext();

  const nodeTypes: NodeTypes = useMemo(() => getNodeTypes(), []);

  useEffect(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.7 }); 
    }
  }, [reactFlowInstance, nodes, edges]);

  const handleNodesChange = useCallback((changes: any) => {
    setProjectContext((prevProjectContext) => {
      const updatedNodes = applyNodeChanges(changes, prevProjectContext.details.nodes);

      updatedNodes.forEach((node) => {
        if (node.type === "instruction" && node.data.item) {
          const instruction = node.data.item as Instruction;
          instruction.setName(node.data.label);
          if (node.data.description) {
            instruction.setDescription(node.data.description);
          }
          if (node.data.parameters) {
            instruction.setParameters(node.data.parameters);
          }
        }
      });

      return {
        ...prevProjectContext,
        details: {
          ...prevProjectContext.details,
          nodes: updatedNodes,
        },
      };
    });
  }, [setProjectContext]);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('text');

      if (!type || !reactFlowInstance || !reactFlowBounds) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newItem = createItem(type);
      if (newItem) {
        const newNode = newItem.toNode(position);

        if (newNode.type === "instruction" && newNode.data.item) {
          const instruction = newNode.data.item as Instruction;
          instruction.setDescription("New instruction description");
          instruction.setParameters("parameter1, parameter2");
        }

        onAddNode(newNode);
      }
    },
    [reactFlowInstance, onAddNode]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onSelectNode(node);
    },
    [onSelectNode]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      onSelectEdge(edge);
    },
    [onSelectEdge]
  );

  const onPaneClick = useCallback(() => {
    onSelectNode(null);
    onSelectEdge(null);
  }, [onSelectNode, onSelectEdge]);

  useEffect(() => {
    setProjectContext((prevProjectContext) => ({
      ...prevProjectContext,
      details: {
        ...prevProjectContext.details,
        nodes,
        edges,
      },
    }));
  }, [nodes, edges, setProjectContext]);

  return (
    <Box ref={reactFlowWrapper} flex={1} height='100%'>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
        minZoom={0.5}
        maxZoom={2}
      >
        <Controls />
      </ReactFlow>
    </Box>
  );
};

export default Canvas;
