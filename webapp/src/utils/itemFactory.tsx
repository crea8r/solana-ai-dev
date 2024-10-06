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
      return new Account(`account-${Date.now()}`, 'New Account', '', '');
    case 'instruction':
      return new Instruction(
        `instruction-${Date.now()}`,
        'New Instruction',
        '',
        '',
        ''
      );
    case 'program':
      return new Program(`program-${Date.now()}`, 'New Program', '');
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
    background: 'lavender',
    padding: 10,
    borderRadius: 5,
  }),
  instruction: createNodeComponent({
    border: '2px solid green',
    padding: 10,
    borderRadius: 5,
  }),
  program: createNodeComponent({
    background: 'red',
    color: 'white',
    padding: 10,
    borderRadius: 5,
  }),
});
