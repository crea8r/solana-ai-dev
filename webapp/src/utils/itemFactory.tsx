import { NodeTypes } from 'react-flow-renderer';
import { ToolboxItem } from '../interfaces/ToolboxItem';
import { Account } from '../items/Account';
import { Instruction } from '../items/Instruction';
import { Program } from '../items/Program';
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'react-flow-renderer';

export function createItem(type: string, itemData?: Partial<ToolboxItem>): ToolboxItem | null {
  switch (type) {
    case 'account': {
      const accountData = itemData as Partial<Account>;
      const account = new Account(
        itemData?.id || `account-${Date.now()}`,
        itemData?.name || 'Account',
        itemData?.description || '',
        accountData?.json || '',
        accountData?.ownerProgramId || ''
      );

      Object.assign(account, itemData);
      return account;
    }  
    case 'instruction':
      const instructionData = itemData as Partial<Instruction>;
      return Object.assign(
        new Instruction(
          instructionData?.id || `instruction-${Date.now()}`,
          instructionData?.name || 'Instruction',
          instructionData?.parameters || '',
          instructionData?.description || '',
          instructionData?.aiInstruction || '',
          instructionData?.ownerProgramId || ''
          ),
        itemData
      );
    case 'program':
      return Object.assign(
        new Program(itemData?.id || `program-${Date.now()}`, itemData?.name || 'Program', ''),
        itemData
      );    
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
    color: '#909de0',
    fontWeight: '600',
    letterSpacing: '0.05em',
    fontFamily: 'Red Hat Display',
    padding: 10,
    borderRadius: 5,
    //border: 'solid 2.5px #decae2', // purple
    border: '2px solid #a9b7ff',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  }),
  instruction: createNodeComponent({
    background: 'white',
    color: '#909de0',
    fontWeight: '600',
    letterSpacing: '0.05em',
    fontFamily: 'Red Hat Display',
    padding: 10,
    borderRadius: 5,
    //border: 'solid 2.5px #9de19f', // green
    border: '2px solid #a9b7ff',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  }),
  program: createNodeComponent({
    background: 'white',
    color: '#909de0',
    fontWeight: '600',
    letterSpacing: '0.05em',
    fontFamily: 'Red Hat Display',
    padding: 10,
    borderRadius: 5,
    //border: 'solid 2.5px #ff9494', // red
    border: '2px solid #a9b7ff',
    boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.8)',
  }),
});
