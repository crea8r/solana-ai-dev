import { Node } from 'react-flow-renderer';
import { IconType } from 'react-icons';

export interface ToolboxItem {
  identifier: string;
  type: 'account' | 'instruction' | 'program';
  name: { snake: string; pascal: string; };
  description: string;

  getNameSnake(): string;
  setNameSnake(name: string): void;
  getNamePascal(): string;
  setNamePascal(name: string): void;
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

export interface AccountToolboxItem extends ToolboxItem {
  type: 'account';
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

export type ToolboxItemUnion = ProgramToolboxItem | InstructionToolboxItem | AccountToolboxItem;