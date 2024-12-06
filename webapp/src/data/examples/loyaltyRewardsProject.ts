import { FileTreeItemType } from '../../interfaces/file';
import { CodeFile } from '../../contexts/CodeFileContext';
import { Project, ProjectDetails } from '../../interfaces/project';

const loyaltyRewardsProject: Project = {
  id: '',
  rootPath: '',
  name: 'Loyalty Rewards Program',
  description:
    'A Solana program that allows businesses to reward customers with loyalty points and manage point balances.',
  aiModel: '',
  apiKey: '',
  walletPublicKey: '',
  details: {
    nodes: [
      {
        width: 56,
        height: 44,
        id: 'program-34567',
        type: 'program',
        position: { x: 50, y: 200 },
        data: {
          label: 'Loyalty Rewards Program',
          item: {
            id: 'program-34567',
            type: 'program',
            name: 'Loyalty Rewards Program',
            description:
              'Allows businesses to allocate loyalty points to customers, redeem points, and manage point balances.',
          },
        },
        selected: false,
        positionAbsolute: { x: 50, y: 200 },
      },
      {
        width: 80,
        height: 44,
        id: 'account-34568',
        type: 'account',
        position: { x: 300, y: 100 }, // Top-right
        data: {
          label: 'BusinessAccount',
          item: {
            id: 'account-34568',
            type: 'account',
            name: 'BusinessAccount',
            description:
              'Tracks the total loyalty points issued and redeemed by a business.',
            json: '{business_id: PubKey, total_points_issued: u64, total_points_redeemed: u64}',
            ownerProgramId: 'program-34567',
          },
        },
        selected: false,
        positionAbsolute: { x: 300, y: 100 },
      },
      {
        width: 80,
        height: 44,
        id: 'account-34569',
        type: 'account',
        position: { x: 300, y: 200 },
        data: {
          label: 'CustomerAccount',
          item: {
            id: 'account-34569',
            type: 'account',
            name: 'CustomerAccount',
            description:
              'Tracks loyalty points earned and redeemed by a specific customer.',
            json: '{customer_id: PubKey, points_balance: u64}',
            ownerProgramId: 'program-34567',
          },
        },
        selected: false,
        positionAbsolute: { x: 300, y: 200 },
      },
      {
        width: 66,
        height: 44,
        id: 'instruction-34570',
        type: 'instruction',
        position: { x: 300, y: 300 },
        data: {
          label: 'AllocatePoints',
          item: {
            id: 'instruction-34570',
            type: 'instruction',
            name: 'AllocatePoints',
            description: 'Allows a business to allocate loyalty points to a customer.',
            parameters: 'business_account: AccountInfo, customer_account: AccountInfo, points: u64',
            aiInstruction:
              'Verify business, increase customer points balance, and update BusinessAccount with points issued.',
            ownerProgramId: 'program-34567',
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 300 },
      },
      {
        width: 66,
        height: 44,
        id: 'instruction-34571',
        type: 'instruction',
        position: { x: 300, y: 400 },
        data: {
          label: 'RedeemPoints',
          item: {
            id: 'instruction-34571',
            type: 'instruction',
            name: 'RedeemPoints',
            description:
              'Allows a customer to redeem loyalty points for rewards.',
            parameters: 'customer_account: AccountInfo, business_account: AccountInfo, points: u64',
            aiInstruction:
              'Verify customer has enough points, reduce customer balance, and update BusinessAccount with points redeemed.',
            ownerProgramId: 'program-34567',
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 400 },
      },
      {
        width: 66,
        height: 44,
        id: 'instruction-34572',
        type: 'instruction',
        position: { x: 300, y: 500 },
        data: {
          label: 'TransferPoints',
          item: {
            id: 'instruction-34572',
            type: 'instruction',
            name: 'TransferPoints',
            description: 'Allows a customer to transfer loyalty points to another customer.',
            parameters: 'sender_account: AccountInfo, receiver_account: AccountInfo, points: u64',
            aiInstruction:
              'Verify sender has enough points, decrease sender balance, and increase receiver balance.',
            ownerProgramId: 'program-34567',
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 500 },
      },
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'program-34567',
        target: 'account-34568',
        type: 'solana',
        animated: false,
        style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge-2',
        source: 'program-34567',
        target: 'account-34569',
        type: 'solana',
        animated: false,
        style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge-3',
        source: 'program-34567',
        target: 'instruction-34570',
        type: 'solana',
        animated: false,
        style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge-4',
        source: 'program-34567',
        target: 'instruction-34571',
        type: 'solana',
        animated: false,
        style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge-5',
        source: 'program-34567',
        target: 'instruction-34572',
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
    idl: { fileName: '', content: '', parsed: { instructions: [], accounts: [] } },
    sdk: { fileName: '', content: '' },
    walletPublicKey: '',
    walletSecretKey: '',
  } as ProjectDetails,
};

export { loyaltyRewardsProject };
