// src/items/Account.ts

import React, { memo } from 'react';
import { Node } from 'react-flow-renderer';
import { ToolboxItem } from '../interfaces/ToolboxItem';
import { VStack, Input, Textarea, Select } from '@chakra-ui/react';
import { FaFile } from 'react-icons/fa';
import { IconType } from 'react-icons';
import { Handle, Position, NodeProps } from 'react-flow-renderer';

export class Account implements ToolboxItem {
  id: string;
  type: 'account' = 'account';
  name: string;
  description: string;
  json: string;
  ownerProgramId: string | null = null;

  constructor(id: string, name: string, description: string, json: string) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.json = json;
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

  getJson(): string {
    return this.json;
  }

  setJson(json: string): void {
    this.json = json;
  }

  toNode(position: { x: number; y: number }): Node {
    return {
      id: this.id,
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
      <VStack spacing={4} align='stretch'>
        <Input
          placeholder='Name'
          value={values.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
        />
        <Textarea
          placeholder='Description, e.g: This PDA account is used for storing vault information'
          value={values.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
        />
        <Textarea
          placeholder='Data struct, eg: {owner: PublicKey, expired_at: u64}'
          value={values.json || ''}
          onChange={(e) => onChange('json', e.target.value)}
        />
        <Select
          placeholder='Select Program'
          value={values.ownerProgramId || ''}
          onChange={(e) => onChange('ownerProgramId', e.target.value || null)}
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
    return ['name', 'description', 'json', 'ownerProgramId'];
  }

  getPropertyValues(): any {
    return {
      name: this.name || '',
      description: this.description || '',
      json: this.json || '',
      ownerProgramId: this.ownerProgramId || '',
    };
  }

  setPropertyValues(values: any): void {
    this.name = values.name;
    this.description = values.description;
    this.json = values.json;
    this.ownerProgramId = values.ownerProgramId;
  }

  getIcon(): IconType {
    return FaFile;
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
