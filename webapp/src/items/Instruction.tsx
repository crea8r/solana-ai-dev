// src/items/Instruction.ts
import { memo } from 'react';
import { ToolboxItem } from '../interfaces/ToolboxItem';
import { VStack, Input, Textarea, Select } from '@chakra-ui/react';
import { Node, Handle, Position, NodeProps } from 'react-flow-renderer';
import { IconType } from 'react-icons';
import { FaHandPointer } from 'react-icons/fa';

export class Instruction implements ToolboxItem {
  id: string;
  type: 'instruction' = 'instruction';
  name: string;
  description: string;
  parameters: string;
  aiInstruction: string;
  ownerProgramId: string | null = null;

  constructor(
    id: string,
    name: string,
    description: string,
    parameters: string,
    aiInstruction: string
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.parameters = parameters;
    this.aiInstruction = aiInstruction;
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

  getType(): 'instruction' {
    return this.type;
  }

  getParameters(): string {
    return this.parameters;
  }

  setParameters(parameters: string): void {
    this.parameters = parameters;
  }

  getAiInstruction(): string {
    return this.aiInstruction;
  }

  setAiInstruction(aiInstruction: string): void {
    this.aiInstruction = aiInstruction;
  }

  toNode(position: { x: number; y: number }): Node {
    return {
      id: this.id,
      type: 'instruction',
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
      <VStack spacing={4} align='stretch'>
        <Input
          placeholder='Name'
          value={values.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
        />
        <Textarea
          placeholder='Description, e.g: This function let user deposit token'
          value={values.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
        />
        <Textarea
          placeholder='Parameters, e.g: amount: u64, user: PublicKey, token_mint: PublicKey'
          value={values.parameters || ''}
          onChange={(e) => onChange('parameters', e.target.value)}
        />
        <Textarea
          placeholder='Step by step instruction to AI, e.g: Check if user is whitelisted, then transfer let user deposit token"'
          value={values.aiInstruction || ''}
          onChange={(e) => onChange('aiInstruction', e.target.value)}
        />
        <Select
          placeholder='Select Program'
          value={values.ownerProgramId || ''}
          onChange={(e) => onChange('ownerProgramId', e.target.value)}
        >
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {program.name}
            </option>
          ))}
        </Select>
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
      parameters: this.parameters || [],
      aiInstruction: this.aiInstruction || '',
      ownerProgramId: this.ownerProgramId,
    };
  }

  setPropertyValues(values: any): void {
    this.name = values.name;
    this.description = values.description;
    this.parameters = values.parameters;
    this.aiInstruction = values.aiInstruction;
    this.ownerProgramId = values.ownerProgramId;
  }

  getIcon(): IconType {
    return FaHandPointer;
  }

  static NodeType = memo(({ data }: NodeProps) => {
    return (
      <div style={{ border: '2px solid green', padding: 10, borderRadius: 5 }}>
        <Handle type='target' position={Position.Top} />
        <div>{data.label}</div>
        <Handle type='source' position={Position.Bottom} />
      </div>
    );
  });
}
