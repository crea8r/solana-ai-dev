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
import { Box, Tag, TagLabel, Wrap, WrapItem } from '@chakra-ui/react';
import { createItem, getNodeTypes } from '../utils/itemFactory';
import CustomEdge from './CustomEdge';
import { useProjectContext } from '../contexts/ProjectContext';
import { Instruction } from '../items/Instruction';
import { Program } from '../items/Program';
import { Account } from '../items/Account';

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
          const {
            identifier,
            name,
            description,
            programId,
            category,
            params,
            logic,
            output,
            error_handling
          } = node.data.item;
        
          node.data.item = new Instruction(
            identifier || node.id,
            name || node.data.label || '',
            description || '',
            programId || [],
            category || [],
            params || [],
            logic || [],
            output || [],
            error_handling || []
          );
        
          const instruction = node.data.item as Instruction;
        
          instruction.setName(node.data.label || '');
          if (node.data.description) instruction.setDescription(node.data.description);
          if (node.data.programId) instruction.setProgramId(node.data.programId);
          if (node.data.params) instruction.setParams(node.data.params);
          if (node.data.logic) instruction.setLogic(node.data.logic);
          if (node.data.output) instruction.setOutput(node.data.output);
          if (node.data.error_handling) instruction.setErrorHandling(node.data.error_handling);
        }
        
        if (node.type === 'program' && node.data.item) {
          const {
            identifier,
            name,
            description,
            programId,
            account,
            instruction,
            is_public,
            sector
          } = node.data.item;
        
          node.data.item = new Program(
            identifier || node.id,
            name || node.data.label || '',
            description || '',
            programId || '11111111111111111111111111111111',
            account || [],
            instruction || [],
            is_public || false,
            sector || []
          );
        
          const program = node.data.item as Program;
        
          program.setName(node.data.label || '');
          if (node.data.description)  program.setDescription(node.data.description);
          if (node.data.programId)  program.setProgramId(node.data.programId);
          if (node.data.account) program.setAccounts(node.data.account);
          if (node.data.instruction) program.setInstructions(node.data.instruction);
          if (node.data.is_public) program.setIsPublic(node.data.is_public);
          if (node.data.sector) program.setSector(node.data.sector);
        }
        if (node.type === 'account' && node.data.item) {
          const {
            identifier,
            name,
            description,
            json,
            ownerProgramId,
            category,
            is_mutable,
            is_signer,
            is_writable,
            initialized_by,
            structure
          } = node.data.item;
      
          node.data.item = new Account(
            identifier || node.id,
            name || node.data.label || '',
            description || '',
            json || '{}',
            ownerProgramId || '',
            category || [],
            is_mutable ?? true,
            is_signer ?? false,
            is_writable ?? true,
            initialized_by || [],
            structure || { key: '', value: '' }
          );
      
          const account = node.data.item as Account;
      
          account.setName(node.data.label || '');
          if (node.data.description) account.setDescription(node.data.description);
          if (node.data.json) account.setJson(node.data.json);
          if (node.data.ownerProgramId) account.setOwnerProgramId(node.data.ownerProgramId);
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
          instruction.setParams(["parameter1", "parameter2"]);
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
