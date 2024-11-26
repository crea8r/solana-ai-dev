import { FileTreeItemType } from '../../interfaces/file';
import { CodeFile } from '../../contexts/CodeFileContext';
import { Project, ProjectDetails } from '../../interfaces/project';

const counterProject: Project = {
  id: '',
  rootPath: '',
  name: 'Counter Program',
  description: 'A Solana program to increment or reset a shared counter, with restricted reset permissions.',
  aiModel: '',
  apiKey: '',
  walletPublicKey: '',
  aiInstructions: [],
  details: {
    nodes: [
      {
        width: 56,
        height: 44,
        id: 'program-12345',
        type: 'program',
        position: { x: 50, y: 200 },
        data: {
          label: 'Counter Program',
          item: {
            id: 'program-12345',
            type: 'program',
            name: 'Counter Program',
            description: 'Manages a shared counter with increment and reset functionality.',
          },
        },
        selected: false,
        positionAbsolute: { x: 50, y: 200 },
      },
      {
        width: 80,
        height: 44,
        id: 'account-12346',
        type: 'account',
        position: { x: 300, y: 50 }, // Top-right
        data: {
          label: 'CounterAccount',
          item: {
            id: 'account-12346',
            type: 'account',
            name: 'CounterAccount',
            description: 'Stores the counter value and initializer’s public key.',
            json: '{initializer: PubKey, count: u64}',
            ownerProgramId: 'program-12345',
          },
        },
        selected: false,
        positionAbsolute: { x: 300, y: 50 },
      },
      {
        width: 66,
        height: 44,
        id: 'instruction-12347',
        type: 'instruction',
        position: { x: 300, y: 150 }, // Second from top-right
        data: {
          label: 'InitializeCounter',
          item: {
            id: 'instruction-12347',
            type: 'instruction',
            name: 'InitializeCounter',
            description: 'Initializes the counter on-chain with an initial value of zero.',
            parameters: 'initializer: PubKey',
            aiInstruction: 'Verify initializer and create counter account with value set to zero.',
            ownerProgramId: 'program-12345',
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 150 },
      },
      {
        width: 66,
        height: 44,
        id: 'instruction-12348',
        type: 'instruction',
        position: { x: 300, y: 250 }, // Third from top-right
        data: {
          label: 'IncrementCounter',
          item: {
            id: 'instruction-12348',
            type: 'instruction',
            name: 'IncrementCounter',
            description: 'Increments the counter by one.',
            parameters: 'counter_account: AccountInfo, user: PubKey',
            aiInstruction: 'Retrieve current counter value, increment it by one, and store the updated value.',
            ownerProgramId: 'program-12345',
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 250 },
      },
      {
        width: 66,
        height: 44,
        id: 'instruction-12349',
        type: 'instruction',
        position: { x: 300, y: 350 }, // Bottom-right
        data: {
          label: 'ResetCounter',
          item: {
            id: 'instruction-12349',
            type: 'instruction',
            name: 'ResetCounter',
            description: 'Resets the counter to zero, restricted to the initializer.',
            parameters: 'counter_account: AccountInfo, initializer: PubKey',
            aiInstruction: 'Verify initializer and reset the counter value to zero.',
            ownerProgramId: 'program-12345',
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 350 },
      },
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'program-12345',
        target: 'account-12346',
        type: 'solana',
        animated: false,
        style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge-2',
        source: 'program-12345',
        target: 'instruction-12347',
        type: 'solana',
        animated: false,
        style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge-3',
        source: 'program-12345',
        target: 'instruction-12348',
        type: 'solana',
        animated: false,
        style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge-4',
        source: 'program-12345',
        target: 'instruction-12349',
        type: 'solana',
        animated: false,
        style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
      },
    ],
    files: { name: '', type: 'directory', children: [] },
    codes: [],
    docs: [],
    isSaved: false,
    isAnchorInit: false,
    isCode: false,
    aiFilePaths: [],
    aiStructure: '',
    stateContent: '',
  } as ProjectDetails,
};

export { counterProject };
