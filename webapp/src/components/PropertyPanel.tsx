// src/components/PropertyPanel.tsx

import React, { useState, useEffect } from 'react';
import { Box, VStack, Text, Input, Button } from '@chakra-ui/react';
import { Node, Edge } from 'react-flow-renderer';
import { ToolboxItem } from '../interfaces/ToolboxItem';

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
  const [localValues, setLocalValues] = useState<any>({});
  const [edgeLabel, setEdgeLabel] = useState('');

  useEffect(() => {
    if (selectedNode) {
      const item = selectedNode.data.item as ToolboxItem;
      setLocalValues(item.getPropertyValues());
    } else if (selectedEdge) {
      setEdgeLabel(selectedEdge.data?.label || '');
    } else {
      // Reset states when nothing is selected
      setLocalValues({});
      setEdgeLabel('');
    }
  }, [selectedNode, selectedEdge]);

  if (!selectedNode && !selectedEdge) return null;

  const handleChange = (field: string, value: any) => {
    setLocalValues((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (selectedNode) {
      const updatedNode = {
        ...selectedNode,
        data: {
          ...selectedNode.data,
          label: localValues.name || selectedNode.data.label,
          localValues,
        },
      };

      onUpdateNode(updatedNode);
    } else if (selectedEdge) {
      const updatedEdge = {
        ...selectedEdge,
        data: { ...selectedEdge.data, label: edgeLabel },
      };
      onUpdateEdge(updatedEdge);
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
    <Box width='300px' bg='gray.100' p={4}>
      <VStack spacing={4} align='stretch'>
        {selectedNode && (
          <>
            <Text fontSize='xl' fontWeight='bold'>
              {(selectedNode.data.item as ToolboxItem).getType()}
            </Text>
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
            <Text fontSize='xl' fontWeight='bold'>
              Edge
            </Text>
            <Text fontSize='sm' fontWeight='bold'>
              From: {fromNode?.data.label} - To: {toNode?.data.label}
            </Text>
            <Input
              placeholder='Label'
              value={edgeLabel}
              onChange={(e) => setEdgeLabel(e.target.value)}
            />
          </>
        )}
        <Button colorScheme='blue' onClick={handleSave}>
          Save
        </Button>
        <Button colorScheme='red' onClick={handleDelete}>
          Delete
        </Button>
      </VStack>
    </Box>
  );
};

export default PropertyPanel;
