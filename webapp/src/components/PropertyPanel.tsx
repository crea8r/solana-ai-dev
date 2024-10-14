// src/components/PropertyPanel.tsx

import React, { useState, useEffect } from 'react';
import { Box, Text, Input } from '@chakra-ui/react';
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
    <div className='h-full max-h-[70vh] w-1/3 border border-gray-100 shadow-sm p-4 overflow-y-auto'>
      <div className='flex flex-col gap-4'>
        {selectedNode ? (
          <>
            <div className='text-lg font-bold'>
              {(selectedNode.data.item as ToolboxItem).getType()}
            </div>
            {(selectedNode.data.item as ToolboxItem).renderProperties(
              programs.map((p) => {
                const item = p.data.item as ToolboxItem;
                return { id: p.id, name: item.name };
              }),
              handleChange,
              localValues
            )}
          </>
        ) : selectedEdge ? (
          <>
            <Text fontSize='lg' fontWeight='bold'>
              Edge
            </Text>
            <Text fontSize='sm'>
              From: {fromNode?.data.label} - To: {toNode?.data.label}
            </Text>
            <Input
              placeholder='Label'
              value={edgeLabel}
              onChange={(e) => setEdgeLabel(e.target.value)}
            />
          </>
        ) : (
          // Empty placeholder when no node or edge is selected
          <div className='h-16' />
        )}
        {(selectedNode || selectedEdge) && (
          <div className='flex flex-row gap-4'>
            <button className='flex-1 flex justify-center items-center w-32 h-8 p-2 rounded-md bg-gray-200 text-black' onClick={handleSave}>
              Save
            </button>
            <button className='flex-1 flex justify-center items-center w-32 h-8 p-2 rounded-md bg-gray-200 text-black' onClick={handleDelete}>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyPanel;
