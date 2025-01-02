import React, { useState, useEffect } from 'react';
import { Box, VStack, Text, Input, Button, Flex } from '@chakra-ui/react';
import { IoSaveOutline, IoTrashOutline } from "react-icons/io5";
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
}) => {
  const [localValues, setLocalValues] = useState<Record<string, any>>({});
  const [edgeLabel, setEdgeLabel] = useState('');
  const { projectContext, setProjectContext } = useProjectContext();

  useEffect(() => {
    if (selectedNode) {
      const item = selectedNode.data.item as ToolboxItem;

      // Find the existing node in the project context
      const existingNode = projectContext?.details?.nodes?.find(n => n.id === selectedNode.id);

      if (existingNode && existingNode.data?.localValues) {
        // Initialize localValues from projectContext
        setLocalValues({
          ...item.getPropertyValues(),
          ...existingNode.data.localValues,
        });
      } else {
        // Initialize localValues from item or default
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

  useEffect(() => {
    if (selectedNode) {
      try {
        console.log('Selected Node:', selectedNode);
        console.log('Item Instance:', selectedNode.data.item);  
        console.log('Item Type:', typeof selectedNode.data.item);
        console.log('Is Account:', selectedNode.data.item instanceof Account);
        console.log('Is Instruction:', selectedNode.data.item instanceof Instruction);
        console.log('Is Program:', selectedNode.data.item instanceof Program);
      } catch (error) {
        console.error('Error logging selected node:', error);
        console.log('Selected Node (Raw):', selectedNode);
      }
    }
  }, [selectedNode]);

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

      // Update project context with the updated node
      setProjectContext((prev) => ({
        ...prev,
        details: { 
          ...prev.details, 
          nodes: prev.details.nodes.map(node => node.id === updatedNode.id ? updatedNode : node) 
        },
      }));

      // If the node is a program, update project name and description
      const isProgramNode = programs.some(p => p.id === selectedNode.id);
      if (isProgramNode) {
        const programNode = programs.find(p => p.id === selectedNode.id);
        const programItem = programNode?.data.item as ToolboxItem;

        setProjectContext((prev) => ({
          ...prev,
          details: { 
            ...prev.details, 
            name: localValues.name || programItem?.name || '[Default Project Name]', 
            description: localValues.description || programItem?.description || '[Default Project Description]' 
          },
        }));
      }

    } else if (selectedEdge) {
      const updatedEdge: Edge = {
        ...selectedEdge,
        data: { ...selectedEdge.data, label: edgeLabel },
      };
      onUpdateEdge(updatedEdge);

      // Update project context with the updated edge
      setProjectContext((prev) => ({
        ...prev,
        details: { 
          ...prev.details, 
          edges: prev.details.edges.map(edge => edge.id === updatedEdge.id ? updatedEdge : edge) 
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

  const fromNode = nodes.find((n) => n.id === selectedEdge?.source);
  const toNode = nodes.find((n) => n.id === selectedEdge?.target);

  return (
    <Box width='25vw' bg='white' p={4} borderLeft="1px solid" borderColor="gray.200" shadow="xl">
      <VStack spacing={4} align='stretch'>
        {selectedNode && (
          <>
            <Text fontSize='lg' fontWeight='medium'>{(selectedNode.data.item as ToolboxItem).getType()} </Text>
            {(selectedNode.data.item as ToolboxItem).renderProperties(
              programs.map((p) => {
                const item = p.data.item as ToolboxItem;
                return { id: p.id, name: item.name };
              }),
              handleChange,
              localValues
            )}
          </>
        )}
        {selectedEdge && (
          <>
            <Text fontSize='lg' fontWeight='medium'>
              Edge
            </Text>
            <Text fontSize='sm' fontWeight='normal'>
              From: {fromNode?.data.label} - To: {toNode?.data.label}
            </Text>
            <Input
              placeholder='Label'
              value={edgeLabel}
              onChange={(e) => setEdgeLabel(e.target.value)}
              fontSize="sm"
              color="gray.700"
              _placeholder={{ color: 'gray.400' }}
              py={0}
              px={3}
            />
          </>
        )}
        <Flex flexDirection="row" justifyContent="space-evenly" alignItems="center" gap={4}>
          <Button 
            width="60%"
            bg="white" 
            color="gray.700"
            fontWeight="normal"
            _hover={{ bg: "gray.100" }} 
            onClick={handleSave}
            border="1px solid"
            borderColor="gray.300"
            shadow="sm"
            size="xs"
          >
            Save
          </Button>
          <Button 
            width="60%"
            bg="white" 
            color="gray.700"
            fontWeight="normal"
            _hover={{ bg: "gray.100" }} 
            onClick={handleDelete}
            border="1px solid"
            borderColor="gray.300"
            shadow="sm"
            size="xs"
          >
            Delete
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
};

export default PropertyPanel;
