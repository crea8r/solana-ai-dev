import { FileTreeItemType } from '../../interfaces/file';
import { CodeFile } from '../../contexts/CodeFileContext';
import { Project, ProjectDetails } from '../../interfaces/project';

const escrowPaymentProject: Project = {
  id: '',
  rootPath: '',
  name: 'Escrow Payment Program',
  description:
    'A Solana program that securely holds funds in escrow until both parties agree to release the payment.',
  aiModel: '',
  apiKey: '',
  walletPublicKey: '',
  details: {
    nodes: [
      {
        width: 56,
        height: 44,
        id: 'program-56789',
        type: 'program',
        position: { x: 50, y: 200 },
        data: {
          label: 'Escrow Payment Program',
          item: {
            id: 'program-56789',
            type: 'program',
            name: 'Escrow Payment Program',
            description:
              'Facilitates secure payments by holding funds in escrow until both buyer and seller agree to release them.',
          },
        },
        selected: false,
        positionAbsolute: { x: 50, y: 200 },
      },
      {
        width: 80,
        height: 44,
        id: 'account-56790',
        type: 'account',
        position: { x: 300, y: 100 }, // Top-right
        data: {
          label: 'EscrowAccount',
          item: {
            id: 'account-56790',
            type: 'account',
            name: 'EscrowAccount',
            description:
              'Holds the funds for a transaction until both parties approve the release.',
            json: '{buyer: PubKey, seller: PubKey, amount: u64, is_released: bool}',
            ownerProgramId: 'program-56789',
          },
        },
        selected: false,
        positionAbsolute: { x: 300, y: 100 },
      },
      {
        width: 80,
        height: 44,
        id: 'account-56791',
        type: 'account',
        position: { x: 300, y: 200 },
        data: {
          label: 'UserAccount',
          item: {
            id: 'account-56791',
            type: 'account',
            name: 'UserAccount',
            description:
              'Tracks user balance and participation in escrow transactions.',
            json: '{user_id: PubKey, balance: u64, escrow_transactions: Vec<u64>}',
            ownerProgramId: 'program-56789',
          },
        },  
        selected: false,
        positionAbsolute: { x: 300, y: 200 },
      },
      {
        width: 66,
        height: 44,
        id: 'instruction-56792',
        type: 'instruction',
        position: { x: 300, y: 300 },
        data: {
          label: 'InitiateEscrow',
          item: {
            id: 'instruction-56792',
            type: 'instruction',
            name: 'InitiateEscrow',
            description: 'Allows a buyer to deposit funds into an escrow account.',
            parameters: 'buyer: PubKey, seller: PubKey, amount: u64',
            aiInstruction:
              'Verify buyer balance, create EscrowAccount with the specified amount, and lock the funds.',
            ownerProgramId: 'program-56789',
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 300 },
      },
      {
        width: 66,
        height: 44,
        id: 'instruction-56793',
        type: 'instruction',
        position: { x: 300, y: 400 },
        data: {
          label: 'ApproveEscrow',
          item: {
            id: 'instruction-56793',
            type: 'instruction',
            name: 'ApproveEscrow',
            description: 'Allows the buyer or seller to approve releasing the funds.',
            parameters: 'escrow_account: AccountInfo, user: PubKey',
            aiInstruction:
              'Verify the user is a participant (buyer or seller), record their approval, and release funds if both parties approve.',
            ownerProgramId: 'program-56789',
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 400 },
      },
      {
        width: 66,
        height: 44,
        id: 'instruction-56794',
        type: 'instruction',
        position: { x: 300, y: 500 },
        data: {
          label: 'CancelEscrow',
          item: {
            id: 'instruction-56794',
            type: 'instruction',
            name: 'CancelEscrow',
            description: 'Allows the buyer to cancel the escrow and retrieve their funds.',
            parameters: 'escrow_account: AccountInfo, buyer: PubKey',
            aiInstruction:
              'Verify buyer ownership of the escrow account, return funds to the buyer, and mark the EscrowAccount as canceled.',
            ownerProgramId: 'program-56789',
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 500 },
      },
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'program-56789',
        target: 'account-56790',
        type: 'solana',
        animated: false,
        style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge-2',
        source: 'program-56789',
        target: 'account-56791',
        type: 'solana',
        animated: false,
        style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge-3',
        source: 'program-56789',
        target: 'instruction-56792',
        type: 'solana',
        animated: false,
        style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge-4',
        source: 'program-56789',
        target: 'instruction-56793',
        type: 'solana',
        animated: false,
        style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge-5',
        source: 'program-56789',
        target: 'instruction-56794',
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
  } as ProjectDetails,
};

export { escrowPaymentProject };
