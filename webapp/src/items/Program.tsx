import { memo } from 'react';
import { BsBox } from "react-icons/bs";
import { ProgramToolboxItem, ToolboxItem } from '../interfaces/ToolboxItem';
import { Node, Handle, Position, NodeProps } from 'react-flow-renderer';
import { IconType } from 'react-icons';
import { Input, Textarea, VStack, Text, Flex } from '@chakra-ui/react';

export class Program implements ProgramToolboxItem {
  identifier: string;
  type: 'program' = 'program';
  name: string;
  description: string;
  programId: string;

  constructor(
    id: string,
    name: string,
    description: string,
    programId: string 
  ) {
    this.identifier = id;
    this.type = 'program';
    this.name = name;
    this.description = description;
    this.programId = programId;
  }

  getType(): 'program' { return this.type; }

  getName(): string { return this.name; }
  setName(name: string): void {  this.name = name; }

  getDescription(): string { return this.description; }
  setDescription(description: string): void { this.description = description; }

  getProgramId(): string { return this.programId; }
  setProgramId(programId: string): void { this.programId = programId; }

  toNode(position: { x: number; y: number }): Node {
    return {
      id: this.identifier,
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
      <Flex direction='column' gap={4}>
        <Flex direction='column' gap={2}>
          <Text fontSize='sm' fontWeight='medium'>Name *</Text>
          <Input
            placeholder='Name'
            value={values.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            fontSize='sm'
          />
        </Flex>
        <Flex direction='column' gap={2}>
          <Text fontSize='sm' fontWeight='medium'>Description *</Text>
          <Textarea
            placeholder='Description'
            value={values.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            fontSize='sm'
          />
        </Flex>
        <Flex direction='column' gap={2}>
          <Text fontSize='sm' fontWeight='medium'>Program ID</Text>
          <Input
            placeholder='Program ID'
            value={values.programId || ''}
            onChange={(e) => onChange('programId', e.target.value)}
            fontSize='sm'
          />
        </Flex>
      </Flex>
    );
  }

  getPropertyFields(): string[] {
    return ['name', 'description', 'programId'];
  }

  getPropertyValues(): any {
    return {
      name: this.name || '',
      description: this.description || '',
      programId: this.programId || '',
    };
  }

  setPropertyValues(values: any): void {
    this.name = values.name;
    this.description = values.description;
    if (values.programId) this.programId = values.programId;
  }

  getIcon(): IconType {
    return BsBox;
  }

  static NodeType = memo(({ data }: NodeProps) => {
    return (
      <div
        style={{
          background: 'white',
          color: 'black',
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
