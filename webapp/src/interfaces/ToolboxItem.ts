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
}

export interface InstructionToolboxItem extends ToolboxItem {
  type: 'instruction';
  parameters: string;
  aiInstruction: string;
  ownerProgramId: string;
}

export interface AccountToolboxItem extends ToolboxItem {
  type: 'account';
  json: string;
  ownerProgramId: string;
}

export type ToolboxItemUnion = ProgramToolboxItem | InstructionToolboxItem | AccountToolboxItem;