// src/items/Instruction.ts
import { memo } from 'react';
import { ToolboxItem } from '../interfaces/ToolboxItem';
import { VStack, Input, Textarea, Select, Text, Button, Divider, Flex } from '@chakra-ui/react';
import { Node, Handle, Position, NodeProps } from 'react-flow-renderer';
import { IconType } from 'react-icons';
import { IoIosCode } from 'react-icons/io';

export class Instruction implements ToolboxItem {
  identifier: string;
  type: 'instruction' = 'instruction';
  name: string;
  description: string;
  programId: string[];
  category: string[];
  params: {
    name: string;
    type: string;
    input_source?: string[];
    default_value?: string;
    validation?: string[];
  }[];
  logic: string[];
  output: {
    name: string;
    type: string;
    description: string;
  }[];
  pda: {
    name: string;
    seeds: string[];
    bump: number;
  }[];
  authenticated_accounts: {
    name: string;
    public_key: string[];
  }[];
  relationships: {
    name: string;
    type: string;
    description: string;
  }[];
  state_changes: {
    account_id: string;
    account_name: string;
    before: string;
    after: string;
  }[];
  events: {
    name: string;
    description: string;
    fields: {
      name: string;
      type: string;
    }[];
  }[];
  conditions: {
    condition: string;
    order: string;
  }[];
  triggers: {
    type: string;
    description: string;
    source: {
      name: string;
      description: string;
    }[];
    schedule: {
      time: string;
      interval: string;
      description: string;
    }[];
    account?: {
      id: string;
      name: string;
      description: string;
      state: string[];
    }[];
  }[];

  constructor(
    id: string,
    name: string,
    description: string,
    programId: string[] = [],
    category: string[] = [],
    params: any[] = [],
    logic: string[] = [],
    output: any[] = [],
    pda: any[] = [],
    authenticated_accounts: any[] = [],
    relationships: any[] = [],
    state_changes: any[] = [],
    events: any[] = [],
    conditions: any[] = [],
    triggers: any[] = []
  ) {
    this.identifier = id;
    this.name = name;
    this.description = description;
    this.programId = programId;
    this.category = category;
    this.params = params;
    this.logic = logic;
    this.output = output;
    this.pda = pda;
    this.authenticated_accounts = authenticated_accounts;
    this.relationships = relationships;
    this.state_changes = state_changes;
    this.events = events;
    this.conditions = conditions;
    this.triggers = triggers;
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

  getProgramId(): string[] {
    return this.programId;
  }

  setProgramId(programId: string[]): void {
    this.programId = programId;
  }

  getParams(): any[] {
    return this.params;
  }

  setParams(params: any[]): void {
    this.params = params;
  }

  getLogic(): string[] {
    return this.logic;
  }

  setLogic(logic: string[]): void {
    this.logic = logic;
  }

  getOutput(): any[] {
    return this.output;
  }

  setOutput(output: any[]): void {
    this.output = output;
  }

  toNode(position: { x: number; y: number }): Node {
    return {
      id: this.identifier,
      type: 'instruction',
      position,
      data: { label: this.name, item: this },
    };
  }

  renderProperties(): JSX.Element {
    return (
      <VStack spacing={4} align="stretch">
        <Text fontSize="xs" fontWeight="medium">Instruction Properties Placeholder</Text>
      </VStack>
    );
  }

  renderInstructionProperties(
    programs: { id: string; name: string }[],
    onChange: (field: string, value: any) => void,
    values: any
  ): JSX.Element {
    return (
      <VStack spacing={4} align="stretch">
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

        <Divider my={2} />

        {/* Program ID */}
        <Flex direction="column" gap={2}>
          <Text fontSize="xs" fontWeight="medium">Owner Program *</Text>
          <Select
            placeholder="Select Program"
            value={values.programId?.[0] || ''}
            onChange={(e) => onChange('programId', [e.target.value])}
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

        <Divider my={2} />

        {/* Parameters */}
        <Divider />
        <Text fontWeight="medium" fontSize="xs">Parameters:</Text>
        {values.params?.map((param: any, index: number) => (
          <VStack key={index} spacing={2} align="stretch">
            <Flex direction="column" gap={2} width="80%">
              <Text fontSize="xs" fontWeight="medium">Parameter Name *</Text>
              <Input
                placeholder="Parameter Name"
                width="100%"
                value={param.name || ''}
                  onChange={(e) =>
                  onChange('params', [
                    ...values.params.slice(0, index),
                    { ...param, name: e.target.value },
                    ...values.params.slice(index + 1),
                  ])
                }
                fontSize="xs"
                bg="white"
              />
            </Flex>
            <Flex direction="column" gap={2} width="80%">
              <Text fontSize="xs" fontWeight="medium">Parameter Type *</Text>
              <Input
                placeholder="Parameter Type"
                width="100%"
                value={param.type || ''}
                onChange={(e) =>
                  onChange('params', [
                    ...values.params.slice(0, index),
                    { ...param, type: e.target.value },
                    ...values.params.slice(index + 1),
                  ])
                }
                fontSize="xs"
                bg="white"
              />
            </Flex>
          </VStack>
        ))}
        <Button
          size="xs"
          fontSize="xs"
          width="80%"
          onClick={() =>
            onChange('params', [...(values.params || []), { name: '', type: '' }])
          }
        >
          Add Parameter
        </Button>

        {/* Logic */}
        <Divider />
        <Flex direction="column" gap={2}>
          <Text fontSize="xs" fontWeight="medium">Logic *</Text>
          <Textarea
            placeholder="Enter step-by-step logic"
          value={values.logic?.join('\n') || ''}
            onChange={(e) => onChange('logic', e.target.value.split('\n'))}
            fontSize="xs"
            bg="white"
          />
        </Flex>

        {/* Output */}
        <Divider />
        <Text fontWeight="medium">Output:</Text>
        {values.output?.map((out: any, index: number) => (
          <VStack key={index} spacing={2}>
            <Input
              placeholder="Output Name"
              value={out.name || ''}
              onChange={(e) =>
                onChange('output', [
                  ...values.output.slice(0, index),
                  { ...out, name: e.target.value },
                  ...values.output.slice(index + 1),
                ])
              }
              fontSize="xs"
              bg="white"
            />
            <Input
              placeholder="Output Type"
              value={out.type || ''}
              onChange={(e) =>
                onChange('output', [
                  ...values.output.slice(0, index),
                  { ...out, type: e.target.value },
                  ...values.output.slice(index + 1),
                ])
              }
              fontSize="xs"
              bg="white"
            />
          </VStack>
        ))}
        <Button
          size="sm"
          onClick={() =>
            onChange('output', [...(values.output || []), { name: '', type: '', description: '' }])
          }
        >
          Add Output
        </Button>
      </VStack>
    );
  }

  getPropertyFields(): string[] {
    return [
      'name',
      'description',
      'programId',
      'params',
      'logic',
      'output',
      'pda',
      'authenticated_accounts',
      'relationships',
      'state_changes',
      'events',
      'conditions',
      'triggers',
    ];
  }

  getPropertyValues(): any {
    return {
      name: this.name || '',
      description: this.description || '',
      programId: this.programId || [],
      params: this.params || [],
      logic: this.logic || [],
      output: this.output || [],
    };
  }

  setPropertyValues(values: any): void {
    this.name = values.name;
    this.description = values.description;
    this.programId = values.programId || [];
    this.params = values.params || [];
    this.logic = values.logic || [];
    this.output = values.output || [];
  }

  getIcon(): IconType {
    return IoIosCode;
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
