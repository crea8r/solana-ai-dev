// src/utils/itemFactory.ts

import { NodeTypes } from 'react-flow-renderer';
import { ToolboxItem } from '../interfaces/ToolboxItem';
import { Account } from '../items/Account';
import { Instruction } from '../items/Instruction';
import { Program } from '../items/Program';
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'react-flow-renderer';

export function createItem(type: string): ToolboxItem | null {
  switch (type) {
    case 'account':
      return new Account(`account-${Date.now()}`, 'Account', '', '', '');
    case 'instruction':
      return new Instruction(
        `instruction-${Date.now()}`,
        'Instruction',
        '',
        '',
        '',
        ''
      );
    case 'program':
      return new Program(`program-${Date.now()}`, 'Program', '');
    default:
      return null;
  }
}

export function loadItem(type: string, data: any): ToolboxItem | null {
  switch (type) {
    case 'account':
      return new Account(
        data.id,
        data.name,
        data.description,
        data.json,
        data.ownerProgramId
      );
    case 'instruction':
      return new Instruction(
        data.id,
        data.name,
        data.description,
        data.parameters,
        data.aiInstruction,
        data.ownerProgramId
      );
    case 'program':
      return new Program(data.id, data.name, data.description);
    default:
      return null;
  }
}

const createNodeComponent = (defaultStyle: React.CSSProperties) =>
  memo(({ data, selected }: NodeProps) => {
    const style = {
      ...defaultStyle,
      boxShadow: selected ? '0 0 0 2px #aaa' : 'none',
    };

    return (
      <div style={style}>
        <Handle type='target' position={Position.Left} />
        <Handle type='source' position={Position.Right} />

        <div>{data.label}</div>
      </div>
    );
  });

export const getNodeTypes = (): NodeTypes => ({
  account: createNodeComponent({
    background: 'white',
    color: '#51545c',
    padding: 10,
    borderRadius: 5,
    border: 'solid 2.5px #decae2', // purple
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  }),
  instruction: createNodeComponent({
    background: 'white',
    color: '#51545c',
    padding: 10,
    borderRadius: 5,
    border: 'solid 2.5px #9de19f', // green
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  }),
  program: createNodeComponent({
    background: 'white',
    color: '#51545c',
    padding: 10,
    borderRadius: 5,
    border: 'solid 2.5px #ff9494', // red
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  }),
});
