import React, { useState, useEffect } from 'react';
import { Box, VStack, Text, Input, Button, Flex } from '@chakra-ui/react';
import { IoSaveOutline, IoTrashOutline } from "react-icons/io5";
import { Node, Edge } from 'react-flow-renderer';
import { ToolboxItem } from '../interfaces/ToolboxItem';
import { useProjectContext } from '../contexts/ProjectContext';

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
  const { projectContext, setProjectContext } = useProjectContext();


  useEffect(() => {
    if (selectedNode) {
      const item = selectedNode.data.item as ToolboxItem;
      setLocalValues(item.getPropertyValues());
    } else if (selectedEdge) {
      setEdgeLabel(selectedEdge.data?.label || '');
    } else {
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

      setProjectContext((prevProjectContext) => ({ 
        ...prevProjectContext, 
        details: { ...prevProjectContext.details, nodes: nodes.map(node => node.id === updatedNode.id ? updatedNode : node) } }));

      const isProgramNode = programs.some(p => p.id === selectedNode.id);

      if (isProgramNode) {
        const programNode = programs.find(p => p.id === selectedNode.id);
        const programItem = programNode?.data.item as ToolboxItem;

        setProjectContext((prevProjectContext) => ({ 
          ...prevProjectContext, 
          details: { ...prevProjectContext.details, name: programItem?.name || '[Default Project Name]', description: programItem?.description || '[Default Project Description]' } }));
      }

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
    <Box 
    width='300px' 
    bg='white' 
    p={4} 
    borderLeft="1px solid" 
    borderColor="gray.200" 
    shadow="md"
    >
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
        <Flex flexDirection="row" justifyContent="space-evenly" alignItems="center" gap={4}>
          <Button 
            width="70%"
            bg="white" 
            color="black" 
            _hover={{ bg: "gray.100" }} 
            onClick={handleSave}
            leftIcon={<IoSaveOutline />}
            border="1px solid"
            borderColor="gray.300"
            shadow="md"
          >
            Save
          </Button>
          <Button 
            width="70%"
            bg="white" 
            color="black" 
            _hover={{ bg: "gray.100" }} 
            onClick={handleDelete}
            leftIcon={<IoTrashOutline />}
            border="1px solid"
            borderColor="gray.300"
            shadow="md"
          >
            Delete
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
};

export default PropertyPanel;
