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
      return new Account(`account-${Date.now()}`, 'Account', '', '');
    case 'instruction':
      return new Instruction(`instruction-${Date.now()}`, 'Instruction', '', '', '');
    case 'program':
      return new Program(`program-${Date.now()}`, 'Program', '');
    default:
      return null;
  }
}

const createNodeComponent = () =>
  memo(({ data, selected }: NodeProps) => {
    const baseClasses = 'bg-white border border-gray-300 text-black p-2 rounded';
    const selectedClasses = selected ? 'shadow-outline' : '';

    return (
      <div className={`${baseClasses} ${selectedClasses}`}>
        <Handle type='target' position={Position.Left} />
        <Handle type='source' position={Position.Right} />

        <div>{data.label}</div>
      </div>
    );
  });

export const getNodeTypes = (): NodeTypes => ({
  account: createNodeComponent(),
  instruction: createNodeComponent(),
  program: createNodeComponent(),
});
