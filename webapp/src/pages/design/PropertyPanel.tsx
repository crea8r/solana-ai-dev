import React, { useState, useEffect } from 'react';
import { Box, VStack, Text, Input, Button, Flex, Tag, TagLabel, Wrap, WrapItem, Select, CloseButton, Divider, IconButton, Tooltip } from '@chakra-ui/react';
import { IoSaveOutline, IoTrashOutline } from "react-icons/io5";
import { FaSave, FaTrash } from "react-icons/fa";
import { Node, Edge } from 'react-flow-renderer';
import { ToolboxItem } from '../../interfaces/ToolboxItem';
import { useProjectContext } from '../../contexts/ProjectContext';
import { Account } from '../../items/Account';
import { Program } from '../../items/Program';
import { Instruction } from '../../items/Instruction';

interface PropertyPanelProps {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onUpdateNode: (node: Node) => void;
  onUpdateEdge: (edge: Edge) => void;
  programs: Node[];
  nodes: Node[];
  edges: Edge[];
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedNode,
  selectedEdge,
  onDeleteNode,
  onDeleteEdge,
  onUpdateNode,
  onUpdateEdge,
  programs,
  nodes,
  edges,
}) => {
  const [localValues, setLocalValues] = useState<Record<string, any>>({});
  const [edgeLabel, setEdgeLabel] = useState('');
  const { projectContext, setProjectContext } = useProjectContext();

  useEffect(() => {
    if (selectedNode) {
      console.log('selectedNode', selectedNode);
      const item = selectedNode.data.item as ToolboxItem;
      const existingNode = projectContext?.details?.nodes?.find(
        (n) => n.id === selectedNode.id
      );

      if (existingNode && existingNode.data?.localValues) {
        setLocalValues({
          ...item.getPropertyValues(),
          ...existingNode.data.localValues,
        });
      } else {
        setLocalValues({
          ...item.getPropertyValues(),
        });
      }
    
    } else if (selectedEdge) {
      setEdgeLabel(selectedEdge.data?.label || '');
    } else {
      setLocalValues({});
      setEdgeLabel('');
    }
  }, [selectedNode, selectedEdge, projectContext]);

  if (!selectedNode && !selectedEdge) return null;

  const handleChange = (field: string, value: any) => {
    setLocalValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (selectedNode) {
      const updatedNode: Node = {
        ...selectedNode,
        data: {
          ...selectedNode.data,
          label: localValues.name || selectedNode.data.label,
          localValues: {
            ...(selectedNode.data.item as ToolboxItem).getPropertyValues(),
            ...localValues,
          },
        },
      };

      onUpdateNode(updatedNode);

      setProjectContext((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          nodes: prev.details.nodes.map((node) =>
            node.id === updatedNode.id ? updatedNode : node
          ),
        },
      }));
    } else if (selectedEdge) {
      const updatedEdge: Edge = {
        ...selectedEdge,
        data: { ...selectedEdge.data, label: edgeLabel },
      };
      onUpdateEdge(updatedEdge);

      setProjectContext((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          edges: prev.details.edges.map((edge) =>
            edge.id === updatedEdge.id ? updatedEdge : edge
          ),
        },
      }));
    }
  };

  const handleDelete = () => {
    if (selectedNode) {
      onDeleteNode(selectedNode.id);
    } else if (selectedEdge) {
      onDeleteEdge(selectedEdge.id);
    }
  };

  const handleAddAccount = (accountId: string) => {
    if (selectedNode) {
      const newEdge: Edge = {
        id: `edge-${selectedNode.id}-${accountId}`,
        source: selectedNode.id,
        target: accountId,
        type: 'default',
      };

      const updatedEdges = [...edges, newEdge];
      setProjectContext((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          edges: updatedEdges,
        },
      }));
    }
  };

  const handleRemoveAccount = (accountId: string) => {
    const updatedEdges = edges.filter(
      (edge) => !(edge.source === selectedNode?.id && edge.target === accountId)
    );

    setProjectContext((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        edges: updatedEdges,
      },
    }));
  };

  const handleAddInstruction = (instructionId: string) => {
    if (selectedNode) {
      const newEdge: Edge = {
        id: `edge-${selectedNode.id}-${instructionId}`,
        source: selectedNode.id,
        target: instructionId,
        type: 'default',
      };

      const updatedEdges = [...edges, newEdge];
      setProjectContext((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          edges: updatedEdges,
        },
      }));
    }
  };

  const handleRemoveInstruction = (instructionId: string) => {
    const updatedEdges = edges.filter(
      (edge) => !(edge.source === selectedNode?.id && edge.target === instructionId)
    );

    setProjectContext((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        edges: updatedEdges,
      },
    }));
  };

  const connectedAccounts = edges
    .filter((edge) => edge.source === selectedNode?.id)
    .map((edge) => nodes.find((node) => node.id === edge.target))
    .filter((node) => node?.type === 'account');

  const unconnectedAccounts = nodes.filter(
    (node) =>
      node.type === 'account' &&
      !connectedAccounts.some((acc) => acc?.id === node.id)
  );

  const connectedInstructions = edges
    .filter((edge) => edge.source === selectedNode?.id)
    .map((edge) => nodes.find((node) => node.id === edge.target))
    .filter((node) => node?.type === 'instruction');

  const unconnectedInstructions = nodes.filter(
    (node) =>
      node.type === 'instruction' &&
      !connectedInstructions.some((ins) => ins?.id === node.id)
  );

  const fromNode = nodes.find((n) => n.id === selectedEdge?.source);
  const toNode = nodes.find((n) => n.id === selectedEdge?.target);

  return (
    <Box
      width="30vw"
      bg="gray.50"
      p={4}
      borderLeft="1px solid"
      borderColor="gray.200"
      overflowY="auto"
      maxHeight="100vh"
    >
      <VStack spacing={4} align="stretch">
        {selectedNode && (
          <>
            {/* Header Section */}
            <Flex direction="row" justify="space-evenly" align="center" fontFamily="IBM Plex Mono">
              <Text fontSize="md" fontWeight="semibold">
                {(selectedNode.data.item as ToolboxItem).getName()}
              </Text>
              <Flex gap={1}>
                <Tooltip label="Save">
                  <IconButton
                    aria-label="Save"
                    icon={<FaSave />}
                    variant= "ghost"
                    size="md"
                    colorScheme="green"
                    onClick={handleSave}
                  />
                </Tooltip>
                <Tooltip label="Delete">
                  <IconButton
                    aria-label="Delete"
                    icon={<FaTrash />}
                    variant= "ghost"
                    size="md"
                    colorScheme="blackAlpha"
                    onClick={handleDelete}
                  />
                </Tooltip>
              </Flex>
            </Flex>

            <Divider />

            {/* Program properties */}
            {selectedNode.data.item instanceof Program && (
              <>
                {selectedNode.data.item.renderProgramProperties(
                  nodes.filter((n) => n.type === 'account').map((a) => ({ id: a.id, name: a.data.label || 'Unnamed Account' })),
                  handleChange,
                  localValues,
                  (accountId: string) => handleAddAccount(accountId),
                  edges.filter((edge) => edge.source === selectedNode.id && nodes.find((n) => n.id === edge.target)?.type === 'account')
                    .map((edge) => {
                      const accountNode = nodes.find((n) => n.id === edge.target && n.type === 'account');
                      return accountNode ? { id: accountNode.id, name: accountNode.data.label || 'Unnamed Account' } : null;
                    }).filter((a) => a !== null) as { id: string; name: string }[],
                  (accountId: string) => handleRemoveAccount(accountId),
                  nodes.filter((n) => n.type === 'instruction').map((i) => ({ id: i.id, name: i.data.label || 'Unnamed Instruction' })),
                  edges.filter((edge) => edge.source === selectedNode.id && nodes.find((n) => n.id === edge.target)?.type === 'instruction')
                    .map((edge) => {
                      const instructionNode = nodes.find((n) => n.id === edge.target && n.type === 'instruction');
                      return instructionNode ? { id: instructionNode.id, name: instructionNode.data.label || 'Unnamed Instruction' } : null;
                    }).filter((i) => i !== null) as { id: string; name: string }[],
                  (instructionId: string) => handleAddInstruction(instructionId),
                  (instructionId: string) => handleRemoveInstruction(instructionId),
                  localValues.version,
                  localValues.description,
                  localValues.tags,
                  localValues.events || [],
                  localValues.errorCodes || []
                )}
              </>
            )}

            {/* Instruction properties */}
            {selectedNode.data.item instanceof Instruction && (
              <>
                {selectedNode.data.item.renderInstructionProperties(
                  nodes, // Pass the entire `nodes` array to access all program, account, and instruction nodes
                  handleChange, // Function to handle changes to the instruction's fields
                  localValues // The values (name, description, accounts, etc.) associated with the instruction
            )}
              </>
            )}

            {/* Account properties */}
            {selectedNode.data.item instanceof Account && (
              <>
                {selectedNode.data.item.renderAccountProperties(
                  programs.map((p) => ({
                    id: p.id,
                    name: p.data.label || 'Unnamed Program',
                  })),
                  handleChange,
                  {
                    ...localValues,
                    is_mutable: localValues.is_mutable ?? true,
                    is_signer: localValues.is_signer ?? false,
                  }
                )}
              </>
            )}
          </>
        )}

        {/* Edge Properties */}
        {selectedEdge && (
          <>
            <Divider my={2} />
            <Text fontSize="lg" fontWeight="medium">Edge</Text>
            <Flex align="center" justify="space-between">
              <Text fontSize="sm">From: {nodes.find((n) => n.id === selectedEdge.source)?.data.label}</Text>
              <Text fontSize="sm">To: {nodes.find((n) => n.id === selectedEdge.target)?.data.label}</Text>
            </Flex>
            <Input
              placeholder="Label"
              value={edgeLabel}
              onChange={(e) => setEdgeLabel(e.target.value)}
              fontSize="sm"
              color="gray.700"
              _placeholder={{ color: 'gray.400' }}
              py={0}
              px={3}
            />
            <Divider my={4} />
            <Flex justify="space-between">
              <Button
                leftIcon={<IoSaveOutline />}
                colorScheme="teal"
                size="sm"
                onClick={handleSave}
              >
                Save
              </Button>
              <Button
                leftIcon={<IoTrashOutline />}
                colorScheme="red"
                size="sm"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </Flex>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default PropertyPanel;
