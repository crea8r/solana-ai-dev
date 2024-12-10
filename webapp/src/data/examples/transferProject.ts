import { FileTreeItemType } from '../../interfaces/file';
import { CodeFile } from '../../contexts/CodeFileContext';
import { Project, ProjectDetails } from '../../interfaces/project';

const transferProject: Project = {
  id: '',
  rootPath: '',
  name: 'Token Transfer Program',
  description: 'A Solana program to transfer tokens between two accounts.',
  aiModel: '',
  apiKey: '',
  walletPublicKey: '',
  details: {
    nodes: [
      {
        width: 56,
        height: 44,
        id: 'program-67890',
        type: 'program',
        position: { x: 50, y: 200 },
        data: {
          label: 'Transfer Program',
          item: {
            id: 'program-67890',
            type: 'program',
            name: 'Transfer Program',
            description: 'Transfers tokens from one account to another.',
          },
        },
        selected: false,
        positionAbsolute: { x: 50, y: 200 },
      },
      {
        width: 80,
        height: 44,
        id: 'account-67891',
        type: 'account',
        position: { x: 300, y: 50 }, // Top-right
        data: {
          label: 'SenderAccount',
          item: {
            id: 'account-67891',
            type: 'account',
            name: 'SenderAccount',
            description: 'The account sending tokens.',
            json: '{sender: PubKey, balance: u64}',
            ownerProgramId: 'program-67890',
          },
        },
        selected: false,
        positionAbsolute: { x: 300, y: 50 },
      },
      {
        width: 80,
        height: 44,
        id: 'account-67892',
        type: 'account',
        position: { x: 300, y: 150 }, // Bottom-right
        data: {
          label: 'ReceiverAccount',
          item: {
            id: 'account-67892',
            type: 'account',
            name: 'ReceiverAccount',
            description: 'The account receiving tokens.',
            json: '{receiver: PubKey, balance: u64}',
            ownerProgramId: 'program-67890',
          },
        },
        selected: false,
        positionAbsolute: { x: 300, y: 150 },
      },
      {
        width: 66,
        height: 44,
        id: 'instruction-67893',
        type: 'instruction',
        position: { x: 300, y: 250 }, // Bottom-right
        data: {
          label: 'TransferTokens',
          item: {
            id: 'instruction-67893',
            type: 'instruction',
            name: 'TransferTokens',
            description: 'Transfers tokens from the sender to the receiver.',
            parameters: 'sender_account: AccountInfo, receiver_account: AccountInfo, amount: u64',
            aiInstruction: 'Verify sender balance, transfer tokens to receiver, and update both account balances.',
            ownerProgramId: 'program-67890',
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 250 },
      },
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'program-67890',
        target: 'account-67891',
        type: 'solana',
        animated: false,
        style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge-2',
        source: 'program-67890',
        target: 'account-67892',
        type: 'solana',
        animated: false,
        style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge-3',
        source: 'program-67890',
        target: 'instruction-67893',
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

export { transferProject };
