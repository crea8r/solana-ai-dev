import { InstructionToolboxItem, AccountToolboxItem, ToolboxItemUnion, ProgramToolboxItem } from '../interfaces/ToolboxItem';

export function isProgram(item: ToolboxItemUnion): item is ProgramToolboxItem {
  return item.type === 'program';
}

export function isInstruction(item: ToolboxItemUnion): item is InstructionToolboxItem {
  return item.type === 'instruction';
}

export function isAccount(item: ToolboxItemUnion): item is AccountToolboxItem {
  return item.type === 'account';
}