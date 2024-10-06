// src/items/Program.ts
import { memo } from 'react';
import { FaBox } from 'react-icons/fa';
import { ToolboxItem } from '../interfaces/ToolboxItem';
import { Node, Handle, Position, NodeProps } from 'react-flow-renderer';
import { IconType } from 'react-icons';
import { Input, Textarea, VStack } from '@chakra-ui/react';

export class Program implements ToolboxItem {
  id: string;
  type: 'program' = 'program';
  name: string;
  description: string;

  constructor(id: string, name: string, description: string) {
    this.id = id;
    this.name = name;
    this.description = description;
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

  getType(): 'program' {
    return this.type;
  }

  toNode(position: { x: number; y: number }): Node {
    return {
      id: this.id,
      type: 'program',
      position,
      data: { label: this.name, item: this },
    };
  }

  renderProperties(
    programs: { id: string; name: string }[],
    onChange: (field: string, value: any) => void,
    values: any
  ): JSX.Element {
    return (
      <VStack spacing={4} align='stretch'>
        <Input
          placeholder='Name'
          value={values.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
        />
        <Textarea
          placeholder='Description'
          value={values.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
        />
      </VStack>
    );
  }

  getPropertyFields(): string[] {
    return ['name', 'description', 'parameters', 'note', 'ownerProgramId'];
  }

  getPropertyValues(): any {
    return {
      name: this.name || '',
      description: this.description || '',
    };
  }

  setPropertyValues(values: any): void {
    this.name = values.name;
    this.description = values.description;
  }

  getIcon(): IconType {
    return FaBox;
  }

  static NodeType = memo(({ data }: NodeProps) => {
    return (
      <div
        style={{
          background: 'red',
          color: 'white',
          padding: 10,
          borderRadius: 5,
        }}
      >
        <Handle type='target' position={Position.Top} />
        <div>{data.label}</div>
        <Handle type='source' position={Position.Bottom} />
      </div>
    );
  });
}
