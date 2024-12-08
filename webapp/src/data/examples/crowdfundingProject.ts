import { FileTreeItemType } from '../../components/FileTree';
import { CodeFile } from '../../contexts/CodeFileContext';
import { Project, ProjectDetails } from '../../interfaces/project';

const crowdfundingProject: Project = {
  id: '',
  rootPath: '',
  name: 'Crowdfunding Program',
  description:
    'A Solana program that enables users to create and participate in crowdfunding campaigns, track contributions, and manage fund distributions.',
  aiModel: '',
  apiKey: '',
  details: {
    nodes: [
      {
        width: 56,
        height: 44,
        id: 'program-67890',
        type: 'program',
        position: { x: 50, y: 300 }, // Program node on the left
        data: {
          label: 'Crowdfunding Program',
          item: {
            id: 'program-67890',
            type: 'program',
            name: 'Crowdfunding Program',
            description:
              'Allows users to create campaigns, contribute funds, and manage crowdfunding goals.',
          },
        },
        selected: false,
        positionAbsolute: { x: 50, y: 300 },
      },
      {
        width: 80,
        height: 44,
        id: 'account-67891',
        type: 'account',
        position: { x: 300, y: 100 }, // Top-right
        data: {
          label: 'CampaignAccount',
          item: {
            id: 'account-67891',
            type: 'account',
            name: 'CampaignAccount',
            description:
              'Stores information about the crowdfunding campaign, such as target goal, creator, and current funds.',
            json: '{creator: PubKey, target: u64, current_funds: u64, deadline: u64, is_active: bool}',
            ownerProgramId: 'program-67890',
          },
        },
        selected: false,
        positionAbsolute: { x: 300, y: 100 },
      },
      {
        width: 80,
        height: 44,
        id: 'account-67892',
        type: 'account',
        position: { x: 300, y: 200 },
        data: {
          label: 'ContributorAccount',
          item: {
            id: 'account-67892',
            type: 'account',
            name: 'ContributorAccount',
            description:
              'Tracks individual contributors to campaigns, including their contribution amounts.',
            json: '{contributor: PubKey, campaign_id: u64, amount: u64}',
            ownerProgramId: 'program-67890',
          },
        },
        selected: false,
        positionAbsolute: { x: 300, y: 200 },
      },
      {
        width: 80,
        height: 44,
        id: 'account-67893',
        type: 'account',
        position: { x: 300, y: 300 },
        data: {
          label: 'PlatformAccount',
          item: {
            id: 'account-67893',
            type: 'account',
            name: 'PlatformAccount',
            description:
              'Stores information about the platform, including fees collected from campaigns.',
            json: '{total_fees_collected: u64}',
            ownerProgramId: 'program-67890',
          },
        },
        selected: false,
        positionAbsolute: { x: 300, y: 300 },
      },
      {
        width: 66,
        height: 44,
        id: 'instruction-67894',
        type: 'instruction',
        position: { x: 300, y: 400 },
        data: {
          label: 'CreateCampaign',
          item: {
            id: 'instruction-67894',
            type: 'instruction',
            name: 'CreateCampaign',
            description: 'Allows a user to create a new crowdfunding campaign.',
            parameters: 'creator: PubKey, target: u64, deadline: u64',
            aiInstruction:
              'Verify creator, initialize CampaignAccount with target, deadline, and set current funds to 0.',
            ownerProgramId: 'program-67890',
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 400 },
      },
      {
        width: 66,
        height: 44,
        id: 'instruction-67895',
        type: 'instruction',
        position: { x: 300, y: 500 },
        data: {
          label: 'ContributeFunds',
          item: {
            id: 'instruction-67895',
            type: 'instruction',
            name: 'ContributeFunds',
            description: 'Allows a user to contribute funds to an active campaign.',
            parameters: 'contributor: PubKey, campaign_id: u64, amount: u64',
            aiInstruction:
              'Verify campaign is active, add contribution to CampaignAccount, and update ContributorAccount.',
            ownerProgramId: 'program-67890',
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 500 },
      },
      {
        width: 66,
        height: 44,
        id: 'instruction-67896',
        type: 'instruction',
        position: { x: 300, y: 600 },
        data: {
          label: 'CloseCampaign',
          item: {
            id: 'instruction-67896',
            type: 'instruction',
            name: 'CloseCampaign',
            description: 'Allows the creator to close the campaign when the goal is met or expired.',
            parameters: 'campaign_id: u64, creator: PubKey',
            aiInstruction:
              'Verify creator, check if goal is met or deadline passed, and deactivate CampaignAccount.',
            ownerProgramId: 'program-67890',
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 600 },
      },
      {
        width: 66,
        height: 44,
        id: 'instruction-67897',
        type: 'instruction',
        position: { x: 300, y: 700 },
        data: {
          label: 'WithdrawFunds',
          item: {
            id: 'instruction-67897',
            type: 'instruction',
            name: 'WithdrawFunds',
            description: 'Allows the creator to withdraw funds from a successful campaign.',
            parameters: 'campaign_id: u64, creator: PubKey',
            aiInstruction:
              'Verify creator, ensure campaign is successful, and transfer funds to creator.',
            ownerProgramId: 'program-67890',
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 700 },
      },
      {
        width: 66,
        height: 44,
        id: 'instruction-67898',
        type: 'instruction',
        position: { x: 300, y: 800 },
        data: {
          label: 'WithdrawPlatformFees',
          item: {
            id: 'instruction-67898',
            type: 'instruction',
            name: 'WithdrawPlatformFees',
            description: 'Allows the platform owner to withdraw collected fees.',
            parameters: 'platform_account: AccountInfo, owner: PubKey',
            aiInstruction:
              'Verify platform ownership and transfer fees from PlatformAccount to the owner.',
            ownerProgramId: 'program-67890',
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 800 },
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
        target: 'account-67893',
        type: 'solana',
        animated: false,
        style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge-4',
        source: 'program-67890',
        target: 'instruction-67894',
        type: 'solana',
        animated: false,
        style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge-5',
        source: 'program-67890',
        target: 'instruction-67895',
        type: 'solana',
        animated: false,
        style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge-6',
        source: 'program-67890',
        target: 'instruction-67896',
        type: 'solana',
        animated: false,
        style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge-7',
        source: 'program-67890',
        target: 'instruction-67897',
        type: 'solana',
        animated: false,
        style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge-8',
        source: 'program-67890',
        target: 'instruction-67898',
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

export { crowdfundingProject };
