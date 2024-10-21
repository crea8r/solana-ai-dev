import { Edge } from 'react-flow-renderer';
import { FileTreeItemType } from '../components/FileTree';
import { InMemoryProject } from '../contexts/ProjectContext';
// todoproject is type of InMemoryProject
const todoproject = {
  nodes: [
    {
      width: 56,
      height: 44,
      id: 'program-1729506920961',
      type: 'program',
      position: {
        x: 322,
        y: 198,
      },
      data: {
        label: 'Todo',
        item: {
          id: 'program-1729506920961',
          type: 'program',
          name: 'Todo',
          description: 'A todo program',
        },
      },
      selected: false,
      positionAbsolute: {
        x: 322,
        y: 198,
      },
    },
    {
      width: 80,
      height: 44,
      id: 'account-1729506922025',
      type: 'account',
      position: {
        x: 574,
        y: 108,
      },
      data: {
        label: 'Task',
        item: {
          id: 'account-1729506922025',
          type: 'account',
          name: 'Task',
          description: 'Store the task content',
          json: '{owner: pubk, content: string}',
          ownerProgramId: 'program-1729506920961',
        },
      },
      selected: false,
      positionAbsolute: {
        x: 574,
        y: 108,
      },
      dragging: false,
    },
    {
      width: 66,
      height: 44,
      id: 'instruction-1729506923018',
      type: 'instruction',
      position: {
        x: 569,
        y: 221,
      },
      data: {
        label: 'create',
        item: {
          id: 'instruction-1729506923018',
          type: 'instruction',
          name: 'create',
          description: 'Create the task',
          parameters: 'content: string',
          aiInstruction: 'Assign the signer as the owner of the task',
          ownerProgramId: 'program-1729506920961',
        },
      },
      selected: true,
      positionAbsolute: {
        x: 569,
        y: 221,
      },
      dragging: false,
    },
  ],
  edges: [
    {
      id: 'b87e8042-6a9a-45c1-908e-c125d61212e1',
      source: 'program-1729506920961',
      target: 'account-1729506922025',
      type: 'solana',
      animated: false,
      style: {
        stroke: '#ff0072',
        cursor: 'pointer',
        strokeWidth: 2,
      },
    },
    {
      id: 'ff752afc-ac78-40f6-9347-fbe9239778fd',
      source: 'program-1729506920961',
      target: 'instruction-1729506923018',
      type: 'solana',
      animated: false,
      style: {
        stroke: '#ff0072',
        cursor: 'pointer',
        strokeWidth: 2,
      },
    },
  ],
  files: {
    name: 'Todo',
  } as FileTreeItemType,
} as InMemoryProject;
export { todoproject };
