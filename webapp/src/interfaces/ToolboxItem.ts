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
  accounts: {name: string; type: string; constraints?: string[]}[];
  params: {
    name: string;
    type: string;
    input_source?: string[];
    default_value?: string;
    validation?: string[];
  }[];
  events: any[];
  error_codes: any[];

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
  fields: { name: string; type: string }[];
  renderAccountProperties(
    programs: { id: string; name: string }[],
    onChange: (field: string, value: any) => void,
    values: any
  ): JSX.Element;
}

export type ToolboxItemUnion = ProgramToolboxItem | InstructionToolboxItem | AccountToolboxItem;