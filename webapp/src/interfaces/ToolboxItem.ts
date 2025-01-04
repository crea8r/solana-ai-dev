import { Node } from 'react-flow-renderer';
import { IconType } from 'react-icons';

export interface ToolboxItem {
  identifier: string;
  type: 'account' | 'instruction' | 'program';
  name: string;
  description: string;

  getName(): string;
  setName(name: string): void;
  getDescription(): string;
  setDescription(description: string): void;
  getType(): 'account' | 'instruction' | 'program';
  toNode(position: { x: number; y: number }): Node;
  renderProperties(
    programs: { id: string; name: string }[],
    onChange: (field: string, value: any) => void,
    values: any
  ): JSX.Element;
  getIcon(): IconType;
  getPropertyFields(): string[];
  getPropertyValues(): any;
  setPropertyValues(values: any): void;
}

export interface ProgramToolboxItem extends ToolboxItem {
  type: 'program';
  programId: string;

  getProgramId(): string;
  setProgramId(programId: string): void;

  renderProgramProperties(
    accounts: { id: string; name: string }[],
    onChange: (field: string, value: any) => void,
    values: any,
    handleAddAccount: (accountId: string) => void,
    connectedAccounts: { id: string; name: string }[],
    handleRemoveAccount: (accountId: string) => void,
    instructions: { id: string; name: string }[],
    connectedInstructions: { id: string; name: string }[],
    handleAddInstruction: (instructionId: string) => void,
    handleRemoveInstruction: (instructionId: string) => void
  ): JSX.Element;
}

export interface InstructionToolboxItem extends ToolboxItem {
  type: 'instruction';
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

  renderInstructionProperties(
    programs: { id: string; name: string }[],
    onChange: (field: string, value: any) => void,
    values: any
  ): JSX.Element;
}


export interface AccountToolboxItem extends ToolboxItem {
  type: 'account';
  json: string;
  ownerProgramId: string;
  category: string[];
  is_mutable: boolean;
  is_signer: boolean;
  is_writable: boolean;
  initialized_by: string[];
  structure: { key: string; value: string };

  renderAccountProperties(
    programs: { id: string; name: string }[],
    onChange: (field: string, value: any) => void,
    values: any
  ): JSX.Element;
}

export type ToolboxItemUnion = ProgramToolboxItem | InstructionToolboxItem | AccountToolboxItem;