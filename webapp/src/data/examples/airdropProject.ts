import { FileTreeItemType } from '../../interfaces/file';
import { CodeFile } from '../../contexts/CodeFileContext';
import { Project, ProjectDetails } from '../../interfaces/project';

const airdropProgramProject: Project = {
  id: '',
  rootPath: '',
  name: 'Airdrop Program',
  description: 'A Solana program to distribute a fixed number of tokens to a list of eligible users. The program checks eligibility and transfers tokens accordingly.',
  aiModel: '',
  apiKey: '',
  walletPublicKey: '',
  details: {
    nodes: [
      {
        width: 56,
        height: 44,
        id: 'program-45678',
        type: 'program',
        position: { x: 50, y: 200 },
        data: {
          label: 'Airdrop Program',
          item: {
            id: 'program-45678',
            type: 'program',
            name: 'Airdrop Program',
            description: 'Distributes tokens to eligible users based on a list of public keys.',
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
        position: { x: 300, y: 50 }, // Top-right
        data: {
          label: 'AirdropAccount',
          item: {
            id: 'account-45679',
            type: 'account',
            name: 'AirdropAccount',
            description: 'Stores the list of eligible users and their allocated token amounts for the airdrop.',
            json: '{user: PubKey, amount: u64, status: string}',
            ownerProgramId: 'program-45678',
          },
        },
        selected: false,
        positionAbsolute: { x: 300, y: 50 },
      },
      {
        width: 66,
        height: 44,
        id: 'instruction-45680',
        type: 'instruction',
        position: { x: 300, y: 150 }, // Second from top-right
        data: {
          label: 'AddEligibleUser',
          item: {
            id: 'instruction-45680',
            type: 'instruction',
            name: 'AddEligibleUser',
            description: 'Adds an eligible user to the airdrop list.',
            parameters: 'user: PubKey, amount: u64',
            aiInstruction: 'Add the user to the airdrop list with their allocated token amount. Set their status to "pending".',
            ownerProgramId: 'program-45678',
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 150 },
      },
      {
        width: 66,
        height: 44,
        id: 'instruction-45681',
        type: 'instruction',
        position: { x: 300, y: 250 }, // Third from top-right
        data: {
          label: 'DistributeTokens',
          item: {
            id: 'instruction-45681',
            type: 'instruction',
            name: 'DistributeTokens',
            description: 'Distributes tokens to eligible users from the airdrop list.',
            parameters: 'airdrop_account: AccountInfo, total_amount: u64',
            aiInstruction: 'For each user in the airdrop list, transfer their allocated tokens to them. After the transfer, update their status to "completed".',
            ownerProgramId: 'program-45678',
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 250 },
      },
      {
        width: 66,
        height: 44,
        id: 'instruction-45682',
        type: 'instruction',
        position: { x: 300, y: 350 }, // Bottom-right
        data: {
          label: 'CancelAirdrop',
          item: {
            id: 'instruction-45682',
            type: 'instruction',
            name: 'CancelAirdrop',
            description: 'Cancels the airdrop and reverts all changes.',
            parameters: 'airdrop_account: AccountInfo',
            aiInstruction: 'Revert all transactions made during the airdrop, set all users’ status to "cancelled", and remove the airdrop account.',
            ownerProgramId: 'program-45678',
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 350 },
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
        target: 'instruction-45680',
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
    uiResults: [],
    aiInstructions: [],
    sdkFunctions: [],
    buildStatus: false,
    deployStatus: false,
    isSdk: false,
    isUi: false,
    genUiClicked: false,
    idl: { fileName: '', content: '', parsed: { instructions: [], accounts: [] } },
    sdk: { fileName: '', content: '' },
    walletPublicKey: '',
    walletSecretKey: '',
    programId: null,
    pdas: [],
  } as ProjectDetails,
};

export { airdropProgramProject };