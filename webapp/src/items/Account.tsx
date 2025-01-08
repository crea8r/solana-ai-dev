import React, { memo } from 'react';
import { Node } from 'react-flow-renderer';
import { ToolboxItem } from '../interfaces/ToolboxItem';
import { VStack, Input, Textarea, Select, Text, CloseButton, TagLabel, Tag, WrapItem, Wrap, Checkbox, Divider, Flex } from '@chakra-ui/react';
import { IconType } from 'react-icons';
import { Handle, Position, NodeProps } from 'react-flow-renderer';
import { VscJson } from 'react-icons/vsc';

export class Account implements ToolboxItem {
  identifier: string;
  type: 'account' = 'account';
  name: string;
  description: string;
  structure: { key: string; value: string };
  ownerProgramId: string | null = null;
  category: string[];
  is_mutable: boolean;
  is_signer: boolean;
  is_writable: boolean;
  initialized_by: string[];

  constructor(
    id: string,
    name: string,
    description: string,
    structure: { key: string; value: string } = { key: '', value: '' },
    ownerProgramId: string,
    category: string[] = [],
    is_mutable: boolean = true,
    is_signer: boolean = false,
    is_writable: boolean = true,
    initialized_by: string[] = [],
    
  ) {
    this.identifier = id;
    this.name = name;
    this.description = description;
    this.structure = structure;
    this.ownerProgramId = ownerProgramId;
    this.category = category;
    this.is_mutable = is_mutable;
    this.is_signer = is_signer;
    this.is_writable = is_writable;
    this.initialized_by = initialized_by;
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }

  getDescription(): string {
    return this.description;
  }

  setDescription(description: string): void {
    this.description = description;
  }

  getType(): 'account' {
    return this.type;
  }

  getStructure(): { key: string; value: string } {
    return this.structure;
  }

  setStructure(structure: { key: string; value: string }): void {
    this.structure = structure;
  }

  toNode(position: { x: number; y: number }): Node {
    return {
      id: this.identifier,
      type: 'account',
      position,
      data: { label: this.name, item: this },
    };
  }

  getOwnerProgramId(): string | null {
    return this.ownerProgramId;
  }
  setOwnerProgramId(id: string | null): void {
    this.ownerProgramId = id;
  }

  renderProperties(
    programs: { id: string; name: string }[],
    onChange: (field: string, value: any) => void,
    values: any
  ): JSX.Element {
    return (
      <VStack spacing={4} align="stretch">
        <Text fontSize="xs" fontWeight="medium">Account Properties Placeholder</Text>
      </VStack>
    );
  }

  renderAccountProperties(
    programs: { id: string; name: string }[],
    onChange: (field: string, value: any) => void,
    values: any
  ): JSX.Element {
    return (
      <Flex direction="column" gap={4}>
        {/* Name */}
        <Flex direction="column" gap={2}>
          <Text fontSize="xs" fontWeight="medium">Name *</Text>
          <Input
            placeholder="Name"
            value={values.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            fontSize="xs"
            bg="white"
          />
        </Flex>
  
        {/* Description */}
        <Flex direction="column" gap={2}>
          <Text fontSize="xs" fontWeight="medium">Description *</Text>
          <Textarea
            placeholder="Description"
            value={values.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            fontSize="xs"
            bg="white"
          />
        </Flex>

        {/* Structure Key/Value Inputs */}
        <Flex direction="column" gap={2}>
          <Text fontSize="xs" fontWeight="medium">Structure Key</Text>
          <Input
            placeholder="Key"
            value={values.structure?.key || ''} // Ensure structure is defined
            onChange={(e) => onChange('structure', { ...values.structure, key: e.target.value })}
            fontSize="xs"
            bg="white"
          />
          <Text fontSize="xs" fontWeight="medium">Structure Value</Text>
          <Input
            placeholder="Value"
            value={values.structure?.value || ''} // Ensure structure is defined
            onChange={(e) => onChange('structure', { ...values.structure, value: e.target.value })}
            fontSize="xs"
            bg="white"
          />
        </Flex>
  
        {/* Owner Program */}
        <Flex direction="column" gap={2}>
          <Text fontSize="xs" fontWeight="medium">Owner Program</Text>
          <Select
            placeholder="Select Program"
            value={values.ownerProgramId || ''}
            onChange={(e) => onChange('ownerProgramId', e.target.value || null)}
            fontSize="xs"
            bg="white"
          >
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </Select>
        </Flex>

        {/* Boolean Fields */}
        <Divider my={2} />
        <Flex direction="row" gap={4} justifyContent="space-evenly" align="center">
          <Checkbox
            isChecked={values.is_mutable ?? true}
            onChange={(e) => onChange('is_mutable', e.target.checked)}
            size="xs"
            fontSize="xs"
            bg="white"
          >
            Mutable
          </Checkbox>
          <Checkbox
            isChecked={values.is_signer ?? false}
            onChange={(e) => onChange('is_signer', e.target.checked)}
            size="xs"
            fontSize="xs"
            bg="white"
          >
            Signer
          </Checkbox>
          <Checkbox
            isChecked={values.is_writable ?? true}
            onChange={(e) => onChange('is_writable', e.target.checked)}
            size="xs"
            fontSize="xs"
            bg="white"
          >
            Writable
          </Checkbox>
        </Flex>
  
        <Divider my={2} />

        {/* Category Tags */}
        <Text fontSize="xs" fontWeight="medium">Category</Text>
        <Wrap>
          {(values.category || []).map((cat: string) => ( // Ensure category is an array
            <WrapItem key={cat}>
              <Tag size="xs" fontSize="xs" variant="subtle" colorScheme="blue" padding={1} bg="white">
                <Flex direction="row" gap={1} align="center" justify="center">
                  <TagLabel ml={1}>{cat}</TagLabel>
                  <CloseButton
                    size="sm"
                    fontSize="8px"
                    onClick={() => {
                    const updatedCategories = values.category.filter((c: string) => c !== cat);
                    onChange('category', updatedCategories);
                  }}
                  />
                </Flex>
              </Tag>
            </WrapItem>
          ))}
        </Wrap>
        <Select
          placeholder="Add category"
          size="xs"
          fontSize="xs"
          value=""
          bg="white"
          onChange={(e) => onChange('category', [...(values.category || []), e.target.value])} // Ensure values.category is an array
        >
          <option value="state">State</option>
          <option value="config">Config</option>
          <option value="metadata">Metadata</option>
        </Select>

        <Divider my={2} />
    
        {/* Initialized By */}
        <Flex direction="column" gap={2}>
          <Text fontSize="xs" fontWeight="medium">Initialized By</Text>
          <Textarea
            placeholder="Enter public keys (comma-separated)"
            value={(values.initialized_by || []).join(', ')} // Ensure initialized_by is an array
            onChange={(e) =>
              onChange('initialized_by', e.target.value.split(',').map((s) => s.trim()))
            }
            fontSize="xs"
            bg="white"
          />
        </Flex>

      </Flex>
    );
  }
  

  getPropertyFields(): string[] {
    return [
      'name',
      'description',
      'json',
      'ownerProgramId',
      'category',
      'is_mutable',
      'is_signer',
      'is_writable',
      'initialized_by',
      'structure',
    ];
  }

  getPropertyValues(): any {
    return {
      name: this.name || '',
      description: this.description || '',
      structure: this.structure || { key: '', value: '' },
      ownerProgramId: this.ownerProgramId || '',
      category: this.category || [],
      is_mutable: this.is_mutable,
      is_signer: this.is_signer,
      is_writable: this.is_writable,
      initialized_by: this.initialized_by || [],
    };
  }

  setPropertyValues(values: any): void {
    this.name = values.name;
    this.description = values.description;
    this.structure = values.structure || { key: '', value: '' };
    this.ownerProgramId = values.ownerProgramId;
    this.category = values.category || [];
    this.is_mutable = values.is_mutable;
    this.is_signer = values.is_signer;
    this.is_writable = values.is_writable;
    this.initialized_by = values.initialized_by || [];
  }

  getIcon(): IconType {
    return VscJson;
  }

  static NodeType = memo(({ data }: NodeProps) => {
    return (
      <div style={{ background: 'lavender', padding: 10, borderRadius: 5 }}>
        <Handle type='target' position={Position.Top} />
        <div>{data.label}</div>
        <Handle type='source' position={Position.Bottom} />
      </div>
    );
  });
}
