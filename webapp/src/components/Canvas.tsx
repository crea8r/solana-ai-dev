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
import ELK from 'elkjs/lib/elk.bundled.js';
import { TokenAccount } from '../items/Account/TokenAccount';

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

const elk = new ELK();

async function getLayoutedElements(nodes: Node[], edges: Edge[]) {
  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'radial',
      'elk.spacing.nodeNode': '150',
      'elk.radial.radius': '200',
      'elk.direction': 'UNDEFINED',
    },
    children: nodes.map((node) => ({
      id: node.id,
      width: node.width || 180,
      height: node.height || 60,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layoutedGraph = await elk.layout(graph);

  console.log('ELK Layout Output:', layoutedGraph.children);
  nodes.forEach((node) => {
    const n = layoutedGraph.children?.find((c) => c.id === node.id);
    if (!n) {
      console.warn(`Node ${node.id} is missing in ELK layout output`);
    }
  });

  const layoutedNodes = nodes.map((node) => {
    const n = layoutedGraph.children?.find((c) => c.id === node.id);
    return {
      ...node,
      position: { x: n?.x ?? node.position.x ?? 0, y: n?.y ?? node.position.y ?? 0 },
      positionAbsolute: { x: n?.x ?? node.positionAbsolute?.x ?? 0, y: n?.y ?? node.positionAbsolute?.y ?? 0 },
    };
  });

  return {
    nodes: layoutedNodes,
    edges,
  };
}

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
  const previousNodeCount = useRef(nodes.length);
  const previousEdgeCount = useRef(edges.length);

  const nodeTypes: NodeTypes = useMemo(() => getNodeTypes(), []);

  useEffect(() => {
    if (reactFlowInstance && nodes.length !== previousNodeCount.current) {
      reactFlowInstance.fitView({ padding: 0.7 });
      previousNodeCount.current = nodes.length;
    }
  }, [reactFlowInstance, nodes.length]);

  useEffect(() => {
    if (!reactFlowInstance) return;

    const nodeCountChanged = nodes.length !== previousNodeCount.current;
    const edgeCountChanged = edges.length !== previousEdgeCount.current;

    if (nodeCountChanged || edgeCountChanged) {
      previousNodeCount.current = nodes.length;
      previousEdgeCount.current = edges.length;

      getLayoutedElements(nodes, edges)
        .then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
          if (layoutedNodes.some((node) => !node.position || !node.positionAbsolute)) {
            console.error('Invalid positions in layoutedNodes:', layoutedNodes);
          }

          setProjectContext((prev) => ({
            ...prev,
            details: {
              ...prev.details,
              nodes: layoutedNodes,
              edges: layoutedEdges,
            },
          }));

          requestAnimationFrame(() => {
            reactFlowInstance.fitView({ padding: 0.8 });
          });
        })
        .catch((error) => {
          console.error('Error in ELK layout:', error);
        });
    }
  }, [nodes, edges, reactFlowInstance, setProjectContext]);

  const handleNodesChange = useCallback((changes: any) => {
    setProjectContext((prevProjectContext) => {
      const updatedNodes = applyNodeChanges(changes, prevProjectContext.details.nodes);

      updatedNodes.forEach((node) => {
        console.log('node', node);
        if (node.type === "instruction" && node.data.item) {
          const { identifier, name, description, accounts, params, error_codes, events, imports } = node.data.item;

          node.data.item = new Instruction(
            identifier || node.id,
            name || {snake: 'instruction', pascal: 'Instruction'},
            description || '',
            accounts || [],
            params || [],
            events || [],
            error_codes || [],
            imports || []
          );

          const instruction = node.data.item as Instruction;

          instruction.setNamePascal(name.pascal || node.data.item.name.pascal || '');
          if (node.data.description) instruction.setDescription(node.data.description);
          if (node.data.accounts) instruction.setAccounts(node.data.accounts);
          if (node.data.params) instruction.setParams(node.data.params);
          if (node.data.events) instruction.setEvents(node.data.events);
          if (node.data.error_codes) instruction.setErrorCodes(node.data.error_codes);
          if (node.data.imports) instruction.setImports(node.data.imports);
        }
        
        if (node.type === 'program' && node.data.item) {
          const {
            identifier,
            name,
            description,
            programId,
            isPublic,
            version,
            account,
            instruction,
          } = node.data.item;
        
          node.data.item = new Program(
            identifier || node.id,
            name || {snake: 'program', pascal: 'Program'},
            description || '',
            programId || '11111111111111111111111111111111',
            isPublic || false,
            version || '',
            account || [],
            instruction || [],
          );
        
          const program = node.data.item as Program;
        
          program.setNamePascal(name.pascal || node.data.item.name.pascal || '');
          if (node.data.description)  program.setDescription(node.data.description);
          if (node.data.programId)  program.setProgramId(node.data.programId);
          if (node.data.isPublic) program.setIsPublic(node.data.isPublic);
          if (node.data.version) program.setVersion(node.data.version);
          if (node.data.account) program.setAccounts(node.data.account);
          if (node.data.instruction) program.setInstructions(node.data.instruction);

        }
        if (node.type === 'account' && node.data.item) {
          const {
            identifier,
            name,
            description,
            is_mutable,
            is_signer,
            fields,
            role
          } = node.data.item;
        
          node.data.item = new Account(
            identifier || node.id,
            name || {snake: 'account', pascal: 'Account'},
            description || '',
            role || '',
            is_mutable ?? true,
            is_signer ?? false,
            fields || [],
          );
      
          const account = node.data.item as Account;
      
          account.setNamePascal(name.pascal || node.data.item.name.pascal || '');
          if (node.data.description) account.setDescription(node.data.description);
          if (node.data.is_mutable) account.setIsMutable(node.data.is_mutable);
          if (node.data.is_signer) account.setIsSigner(node.data.is_signer);
          if (node.data.fields) account.setFields(node.data.fields);
          if (node.data.role) account.setRole(node.data.role);
        }

        if (node.type === 'token_account' && node.data.item) {
          const {
            identifier,
            name,
            description,
            is_mutable,
            is_signer,
            fields,
            role,
            spl_type,
            mint_address,
            owner
          } = node.data.item;

          node.data.item = new TokenAccount(
            identifier || node.id,
            name || {snake: 'token_account', pascal: 'TokenAccount'},
            description || '',
            role || '',
            is_mutable ?? true,
            is_signer ?? false,
            fields || [],
            spl_type || 'token',
            mint_address || '',
            owner || ''
          );
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
        console.log('newItem', newItem);
        console.log("type", type);
        const newNode = newItem.toNode(position);

        if (newNode.type === "instruction" && newNode.data.item) {
          const instruction = newNode.data.item as Instruction;
          instruction.setDescription("New instruction description");
          instruction.setParams([{ name: "param1", type: "u64" }]);
        }

        if (newNode.type === "token_account" && newNode.data.item) {
          const tokenAccount = newNode.data.item as TokenAccount;
          tokenAccount.mint_address = "New mint address";
          tokenAccount.owner = "New owner address";
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
    <Box ref={reactFlowWrapper} flex={1} height='83vh' width='100%'>
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
