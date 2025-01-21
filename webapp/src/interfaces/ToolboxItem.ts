import { Node } from 'react-flow-renderer';
import { IconType } from 'react-icons';

export interface ToolboxItem {
  identifier: string;
  name: { snake: string; pascal: string; };
  description: string;

  getNameSnake(): string;
  setNameSnake(name: string): void;
  getNamePascal(): string;
  setNamePascal(name: string): void;
  getDescription(): string;
  setDescription(description: string): void;
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
  isPublic: boolean;
  version: string;
  account: string[];
  instruction: string[];

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
    handleRemoveInstruction: (instructionId: string) => void,
  ): JSX.Element;
}

export interface InstructionToolboxItem extends ToolboxItem {
  type: 'instruction';
  accounts: any[];
  params: any[];
  events: any[];
  error_codes: any[];
  imports: { field: string; module: string; items: string[] }[];

  renderInstructionProperties(
    programs: { id: string; name: string }[],
    onChange: (field: string, value: any) => void,
    values: any
  ): JSX.Element;
}

export interface AccountToolboxItem<T extends string = 'account'> extends ToolboxItem {
  type: T;
  role: string;
  is_mutable: boolean;
  is_signer: boolean;
  fields: { name: string; type: string }[];
  renderAccountProperties(
    programs: { id: string; name: string }[],
    onChange: (field: string, value: any) => void,
    values: any
  ): JSX.Element;
}

export interface TokenAccountToolboxItem extends AccountToolboxItem<'token_account'> {
  spl_type: 'mint' | 'token';
  mint_address: string;
  owner: string;

  renderAccountProperties(
    programs: { id: string; name: string }[],
    onChange: (field: string, value: any) => void,
    values: any
  ): JSX.Element;
}

export interface MintAccountToolboxItem extends AccountToolboxItem<'mint_account'> {
  decimals: number;
  mintAuthority: string;
}


export type ToolboxItemUnion = 
  ProgramToolboxItem |
  InstructionToolboxItem |
  AccountToolboxItem |
  TokenAccountToolboxItem |
  MintAccountToolboxItem;