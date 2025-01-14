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
  account: string[];
  instruction: string[];
  isPublic: boolean;

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
    version: string,
    description: string,
    tags: string[],
    events: { name: string; fields: { name: string; type: string }[] }[],
    errorCodes: { code: number; name: string; msg: string }[]
  ): JSX.Element;
}

export interface InstructionToolboxItem extends ToolboxItem {
  type: 'instruction';
  accounts: string[];
  params: {
    name: string;
    type: string;
    input_source?: string[];
    default_value?: string;
    validation?: string[];
  }[];

  renderInstructionProperties(
    programs: { id: string; name: string }[],
    onChange: (field: string, value: any) => void,
    values: any
  ): JSX.Element;
}

export interface AccountToolboxItem extends ToolboxItem {
  type: 'account';
  is_mutable: boolean;
  is_signer: boolean;

  renderAccountProperties(
    programs: { id: string; name: string }[],
    onChange: (field: string, value: any) => void,
    values: any
  ): JSX.Element;
}

export type ToolboxItemUnion = ProgramToolboxItem | InstructionToolboxItem | AccountToolboxItem;