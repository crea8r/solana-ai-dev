import { NodeTypes } from 'react-flow-renderer';
import { ToolboxItem, ToolboxItemUnion, ProgramToolboxItem, AccountToolboxItem, InstructionToolboxItem } from '../interfaces/ToolboxItem';
import { Account } from '../items/Account';
import { Instruction } from '../items/Instruction';
import { Program } from '../items/Program';
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'react-flow-renderer';
import { pascalToSpaced } from './itemUtils';

export function createItem(type: string, itemData?: Partial<ToolboxItemUnion>): ToolboxItemUnion | null {
  switch (type) {
    case 'account': {
      const accountData = itemData as Partial<AccountToolboxItem>;
      const account = new Account(
        accountData?.identifier || `account-${Date.now()}`,
        accountData?.name || {snake: 'account', pascal: 'Account'},
        accountData?.description || '',
        accountData?.role || '',
        accountData?.is_mutable ?? true,
        accountData?.is_signer ?? false,
        accountData?.fields || []
      );

      Object.assign(account, accountData);
      return account as AccountToolboxItem;
    }
    case 'instruction': {
      const instructionData = itemData as Partial<InstructionToolboxItem>;
      const instruction = new Instruction(
        instructionData?.identifier || `instruction-${Date.now()}`,
        instructionData?.name || {snake: 'instruction', pascal: 'Instruction'},
        instructionData?.description || '',
        instructionData?.accounts || [],
        instructionData?.params || []
      );

      Object.assign(instruction, instructionData);
      return instruction as InstructionToolboxItem;
    }
    case 'program': {
      const programData = itemData as Partial<ProgramToolboxItem>;
      return Object.assign(
        new Program(
          programData?.identifier || `program-${Date.now()}`,
          programData?.name || {snake: 'program', pascal: 'Program'},
          programData?.description || '',
          programData?.programId || '11111111111111111111111111111111'
        ),
        programData
      ) as ProgramToolboxItem;
    }
    default:
      return null;
  }
}

export function loadItem(type: string, data: any): ToolboxItemUnion | null {
  switch (type) {
    case 'account':
      return new Account(
        data.identifier,
        data.name || {snake: 'account', pascal: 'Account'},
        data.description || '',
        data.role || '',
        data.is_mutable ?? true,
        data.is_signer ?? false,
        data.fields || []
      ) as AccountToolboxItem;

    case 'instruction':
      return new Instruction(
        data.identifier,
        data.name || {snake: 'instruction', pascal: 'Instruction'},
        data.description || '',
        data.accounts || [],
        data.params || [],
        data.events || [],
        data.error_codes || []
      ) as InstructionToolboxItem;

    case 'program':
      return new Program(
        data.identifier,
        data.name || {snake: 'program', pascal: 'Program'},
        data.description || '',
        data.programId || '11111111111111111111111111111111',
        data.account || [],
        data.instruction || [],
        data.is_public || true,
        data.version || '',
        data.events || [],
        data.error_codes || []
      ) as ProgramToolboxItem;

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
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />

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
    fontFamily: 'IBM Plex Mono',
    padding: 10,
    borderRadius: 5,
    border: '2px solid #a9b7ff',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  }),
  instruction: createNodeComponent({
    background: 'white',
    color: '#909de0',
    fontWeight: '600',
    letterSpacing: '0.05em',
    fontFamily: 'IBM Plex Mono', 
    padding: 10,
    borderRadius: 5,
    border: '2px solid #a9b7ff',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  }),
  program: createNodeComponent({
    background: 'white',
    color: '#909de0',
    fontWeight: '600',
    letterSpacing: '0.05em',
    fontFamily: 'IBM Plex Mono',
    padding: 10,
    borderRadius: 5,
    border: '2px solid #a9b7ff',
    boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.8)',
  }),
});
