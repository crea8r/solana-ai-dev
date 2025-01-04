import { NodeTypes } from 'react-flow-renderer';
import { ToolboxItem, ToolboxItemUnion, ProgramToolboxItem, AccountToolboxItem, InstructionToolboxItem } from '../interfaces/ToolboxItem';
import { Account } from '../items/Account';
import { Instruction } from '../items/Instruction';
import { Program } from '../items/Program';
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'react-flow-renderer';

export function createItem(type: string, itemData?: Partial<ToolboxItemUnion>): ToolboxItemUnion | null {
  switch (type) {
    case 'account': {
      const accountData = itemData as Partial<AccountToolboxItem>;
      const account = new Account(
        accountData?.identifier || `account-${Date.now()}`,
        accountData?.name || 'Account',
        accountData?.description || '',
        accountData?.json || '',
        accountData?.ownerProgramId || ''
      );

      Object.assign(account, accountData);
      return account as AccountToolboxItem;
    }  
    case 'instruction': {
      const instructionData = itemData as Partial<InstructionToolboxItem>;
      const instruction = new Instruction(
        instructionData?.identifier || `instruction-${Date.now()}`,
        instructionData?.name || 'Instruction',
        instructionData?.description || '',
        instructionData?.programId || [],
        instructionData?.category || [],
        instructionData?.params || [],
        instructionData?.logic || [],
        instructionData?.output || [],
        instructionData?.pda || [],
        instructionData?.authenticated_accounts || [],
        instructionData?.relationships || [],
        instructionData?.state_changes || [],
        instructionData?.events || [],
        instructionData?.conditions || [],
        instructionData?.triggers || []
      );

      Object.assign(instruction, instructionData);
      return instruction as InstructionToolboxItem;
    }
    case 'program': {
      const programData = itemData as Partial<ProgramToolboxItem>;
      return Object.assign(
        new Program(
          programData?.identifier || `program-${Date.now()}`, 
          programData?.name || 'Program', 
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
        data.name,
        data.description,
        data.json,
        data.ownerProgramId || '',
        data.category || [],
        data.is_mutable ?? true,
        data.is_signer ?? false,
        data.is_writable ?? true,
        data.initialized_by || [],
        data.structure || { key: '', value: '' }
      ) as AccountToolboxItem;
    
      case 'instruction':
      return new Instruction(
        data.identifier,
        data.name || '',
        data.description || '',
        data.programId || [],
        data.category || [],
        data.params || [],
        data.logic || [],
        data.output || [],
        data.pda || [],
        data.authenticated_accounts || [],
        data.relationships || [],
        data.state_changes || [],
        data.events || [],
        data.conditions || [],
        data.triggers || []
      ) as InstructionToolboxItem;
    
      case 'program':
      return new Program(
        data.identifier,
        data.name || '',
        data.description || '',
        data.programId || '',
        data.account || [],
        data.instruction || [],
        data.security || 'Public',
        data.sector || []
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
