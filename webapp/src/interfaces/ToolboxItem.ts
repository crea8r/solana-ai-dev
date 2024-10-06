// src/interfaces/ToolboxItem.ts
import { Node } from 'react-flow-renderer';
import { IconType } from 'react-icons';

export interface ToolboxItem {
  id: string;
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
