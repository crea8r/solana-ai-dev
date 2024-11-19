import { FileTreeItemType } from '../../components/FileTree';
import { CodeFile } from '../../contexts/CodeFileContext';
import { Project, ProjectDetails } from '../../interfaces/project';

const timeLockedSavingsProject: Project = {
  id: '',
  rootPath: '',
  name: 'Time-Locked Savings Program',
  description:
    'A Solana program that allows users to lock funds into accounts that can only be withdrawn after a specified unlock time.',
  aiModel: '',
  apiKey: '',
  details: {
    nodes: [
      {
        width: 56,
        height: 44,
        id: 'program-45678',
        type: 'program',
        position: { x: 50, y: 200 }, // Program node on the left
        data: {
          label: 'Time-Locked Savings Program',
          item: {
            id: 'program-45678',
            type: 'program',
            name: 'Time-Locked Savings Program',
            description:
              'Allows users to lock funds in accounts with a specific unlock time.',
          },
        },
        selected: false,
        positionAbsolute: { x: 50, y: 200 },
      },
      {
        width: 80,
        height: 44,
        id: 'account-45679',
        type: 'account',
        position: { x: 300, y: 100 }, // Top-right
        data: {
          label: 'SavingsAccount',
          item: {
            id: 'account-45679',
            type: 'account',
            name: 'SavingsAccount',
            description:
              'Stores information about the locked funds, including the unlock time.',
            json: '{owner: PubKey, balance: u64, unlock_time: u64}',
            ownerProgramId: 'program-45678',
          },
        },
        selected: false,
        positionAbsolute: { x: 300, y: 100 },
      },
      {
        width: 80,
        height: 44,
        id: 'account-45680',
        type: 'account',
        position: { x: 300, y: 200 },
        data: {
          label: 'UserAccount',
          item: {
            id: 'account-45680',
            type: 'account',
            name: 'UserAccount',
            description:
              'Tracks the user’s total locked funds and their associated savings accounts.',
            json: '{user_id: PubKey, total_locked: u64}',
            ownerProgramId: 'program-45678',
          },
        },
        selected: false,
        positionAbsolute: { x: 300, y: 200 },
      },
      {
        width: 66,
        height: 44,
        id: 'instruction-45681',
        type: 'instruction',
        position: { x: 300, y: 300 },
        data: {
          label: 'DepositFunds',
          item: {
            id: 'instruction-45681',
            type: 'instruction',
            name: 'DepositFunds',
            description: 'Allows a user to deposit funds into a new savings account.',
            parameters: 'user_account: AccountInfo, savings_account: AccountInfo, amount: u64, unlock_time: u64',
            aiInstruction:
              'Verify user, create SavingsAccount with balance and unlock time, and update UserAccount.',
            ownerProgramId: 'program-45678',
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 300 },
      },
      {
        width: 66,
        height: 44,
        id: 'instruction-45682',
        type: 'instruction',
        position: { x: 300, y: 400 },
        data: {
          label: 'WithdrawFunds',
          item: {
            id: 'instruction-45682',
            type: 'instruction',
            name: 'WithdrawFunds',
            description: 'Allows a user to withdraw funds from their savings account after the unlock time.',
            parameters: 'savings_account: AccountInfo, user_account: AccountInfo',
            aiInstruction:
              'Verify unlock time, reduce balance in SavingsAccount, and update UserAccount.',
            ownerProgramId: 'program-45678',
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 400 },
      },
      {
        width: 66,
        height: 44,
        id: 'instruction-45683',
        type: 'instruction',
        position: { x: 300, y: 500 },
        data: {
          label: 'ExtendUnlockTime',
          item: {
            id: 'instruction-45683',
            type: 'instruction',
            name: 'ExtendUnlockTime',
            description: 'Allows a user to extend the unlock time for their savings account.',
            parameters: 'savings_account: AccountInfo, new_unlock_time: u64',
            aiInstruction:
              'Verify user is the owner, ensure new unlock time is later than current time, and update unlock_time.',
            ownerProgramId: 'program-45678',
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 500 },
      },
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'program-45678',
        target: 'account-45679',
        type: 'solana',
        animated: false,
        style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge-2',
        source: 'program-45678',
        target: 'account-45680',
        type: 'solana',
        animated: false,
        style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge-3',
        source: 'program-45678',
        target: 'instruction-45681',
        type: 'solana',
        animated: false,
        style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge-4',
        source: 'program-45678',
        target: 'instruction-45682',
        type: 'solana',
        animated: false,
        style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge-5',
        source: 'program-45678',
        target: 'instruction-45683',
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

export { timeLockedSavingsProject };
