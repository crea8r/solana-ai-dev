// src/components/Canvas.tsx

import React, { useCallback, useRef, useMemo, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  Controls,
  NodeTypes,
} from 'react-flow-renderer';
import { Box } from '@chakra-ui/react';
import { createItem, getNodeTypes } from '../utils/itemFactory';
import CustomEdge from './CustomEdge';
import { useProject } from '../contexts/ProjectContext';

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
  const canvasRef = useRef<HTMLDivElement>(null);
  const { project, setProject, updateProject } = useProject();

  // Memoize nodeTypes
  const nodeTypes: NodeTypes = useMemo(() => getNodeTypes(), []);

  // Handle drop event for adding new nodes
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('text');
      const canvasRect = canvasRef.current?.getBoundingClientRect();

      if (canvasRect) {
        const position = {
          x: event.clientX - canvasRect.left,
          y: event.clientY - canvasRect.top,
        };

        const newItem = createItem(type);
        if (newItem) {
          const newNode = newItem.toNode(position);
          onAddNode(newNode);
        }
      }
    },
    [onAddNode]
  );

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
    if (nodes.length > 0 || edges.length > 0) {
      updateProject({ nodes, edges });
    }
  }, [nodes, edges]);

  return (
    <Box
      ref={canvasRef}
      flex={1}
      height='100%'
      onDrop={onDrop}
      onDragOver={(event) => event.preventDefault()}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
      >
        <Controls />
      </ReactFlow>
    </Box>
  );
};

export default Canvas;
