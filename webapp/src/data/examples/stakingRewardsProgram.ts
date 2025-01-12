import { FileTreeItemType } from '../../interfaces/file';
import { CodeFile } from '../../contexts/CodeFileContext';
import { Project, ProjectDetails, sectorEnum, inputSource } from '../../interfaces/project';
import { 
  intervalEnum,
  orderEnum,
  triggerType,
  categoryEnum,
} from '../../interfaces/project';
import { ProgramContext, InstructionContext, AccountContext } from '../../interfaces/project';
import { Program } from '../../items/Program';

const stakingRewardsProgram: Project = {
  id: '',
  rootPath: '',
  name: 'Staking Rewards Program',
  description: 'A Solana program that allows users to stake tokens and earn rewards based on a predefined staking period.',
  details: {
    nodes: [
      // Program Node
      {
        width: 56,
        height: 44,
        id: 'program1-30001',
        type: 'program',
        position: { x: 50, y: 200 },
        data: {
          label: 'Staking Rewards Program',
          item: {
            identifier: 'program1-30001',
            description: 'Manages the staking and reward distribution process, ensuring fair handling of user stakes and withdrawals.',
            programId: '33333333333333333333333333333333',
            account: [
              { id: 'account1-30001', name: 'StakeAccount', description: 'Stores user stake details including amount and staking duration.' },
              { id: 'account2-30001', name: 'RewardPoolAccount', description: 'Holds the reward pool for distributing staking rewards.' },
              { id: 'system_program_account', name: 'SystemProgram', description: 'Solana’s system program' },
            ],
            instruction: [
              { id: 'instruction1-30001', name: 'InitializeStake', description: 'Initializes a new stake account for a user.' },
              { id: 'instruction2-30001', name: 'AddStake', description: 'Adds tokens to an existing stake for a user.' },
              { id: 'instruction3-30001', name: 'ClaimRewards', description: 'Allows users to claim accumulated staking rewards.' },
              { id: 'instruction4-30001', name: 'WithdrawStake', description: 'Withdraws the user’s full stake and any remaining rewards.' },
            ],
            is_public: true,
            sector: [sectorEnum.finance],
          },
        },
        selected: false,
        positionAbsolute: { x: 50, y: 200 },
      },
      // Stake Account Node
      {
        width: 80,
        height: 44,
        id: 'account1-30001',
        type: 'account',
        position: { x: 300, y: 50 },
        data: {
          label: 'StakeAccount',
          item: {
            id: 'account-30001',
            type: 'account',
            name: 'StakeAccount',
            description: 'Stores user stake details, such as the amount staked and staking period.',
            structure: { key: 'stake_amount', value: 'u64' },
            ownerProgramId: 'program1-30001',
            publicKey: '33333333333333333333333333333333',
            category: ['state'],
            is_mutable: true,
            is_signer: true,
            is_writable: true,
            initialized_by: ['user'],
          },
        },
        selected: false,
        positionAbsolute: { x: 300, y: 50 },
      },
      // Reward Pool Account Node
      {
        width: 80,
        height: 44,
        id: 'account2-30001',
        type: 'account',
        position: { x: 300, y: 150 },
        data: {
          label: 'RewardPoolAccount',
          item: {
            id: 'account-30002',
            type: 'account',
            name: 'RewardPoolAccount',
            description: 'Holds the reward pool tokens for distribution.',
            structure: { key: 'pool_balance', value: 'u64' },
            ownerProgramId: 'program1-30001',
            publicKey: '44444444444444444444444444444444',
            category: ['state'],
            is_mutable: true,
            is_signer: false,
            is_writable: true,
            initialized_by: ['admin'],
          },
        },
        selected: false,
        positionAbsolute: { x: 300, y: 150 },
      },
      // Instruction Node 1: Initialize Stake
      {
        width: 66,
        height: 44,
        id: 'instruction1-30001',
        type: 'instruction',
        position: { x: 300, y: 250 },
        data: {
          label: 'InitializeStake',
          item: {
            description: "Initializes a user's stake account.",
            programId: ['program1-30001'],
            category: [categoryEnum.object],
            params: [
              {
                name: 'initializer',
                type: 'Pubkey',
                input_source: [inputSource.user],
                validation: ['isBase58', 'length=32'],
              },
              {
                name: 'stake_amount',
                type: 'u64',
                input_source: [inputSource.user],
                validation: ['isPositive'],
              },
            ],
            logic: [
              "Verify the user's signature.",
              "Allocate the stake account and set its owner to the Staking Rewards Program.",
              "Record the initial stake amount and the staking period.",
            ],
            output: [
              {
                name: 'stake_account',
                type: 'Pubkey',
                description: 'The public key of the newly created stake account.'
              }
            ],
            error_handling: [
              "Return an error if the initializer's public key is invalid.",
              "Return an error if account allocation fails due to insufficient lamports.",
            ]
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 250 },
      },
      // Instruction Node 2: Add Stake
      {
        width: 66,
        height: 44,
        id: 'instruction2-30001',
        type: 'instruction',
        position: { x: 300, y: 350 },
        data: {
          label: 'AddStake',
          item: {
            description: "Allows users to add more tokens to their existing stake.",
            programId: ['program1-30001'],
            category: [categoryEnum.object],
            params: [
              {
                name: 'stake_account',
                type: 'AccountInfo',
                input_source: [inputSource.program],
                validation: ['exists', 'isWritable'],
              },
              {
                name: 'additional_amount',
                type: 'u64',
                input_source: [inputSource.user],
                validation: ['isPositive'],
              },
            ],
            logic: [
              "Fetch the current stake amount.",
              "Add the additional tokens to the stake amount.",
              "Update the total staked amount.",
            ],
            output: [
              {
                name: 'updated_stake_amount',
                type: 'u64',
                description: 'The updated total stake amount.'
              }
            ],
            error_handling: [
              "Return an error if the stake account does not exist.",
              "Return an error if the account is not writable.",
              "Return an error if the user does not have enough tokens to add.",
            ]
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 350 },
      },
      // Instruction Node 3: Claim Rewards
      {
        width: 66,
        height: 44,
        id: 'instruction3-30001',
        type: 'instruction',
        position: { x: 300, y: 450 },
        data: {
          label: 'ClaimRewards',
          item: {
            description: "Allows users to claim their staking rewards.",
            programId: ['program1-30001'],
            category: [categoryEnum.object],
            params: [
              {
                name: 'stake_account',
                type: 'AccountInfo',
                input_source: [inputSource.program],
                validation: ['exists', 'isWritable'],
              },
              {
                name: 'reward_pool_account',
                type: 'AccountInfo',
                input_source: [inputSource.program],
                validation: ['exists'],
              },
            ],
            logic: [
              "Calculate the rewards based on the staking duration.",
              "Transfer the calculated reward from the reward pool to the user.",
              "Update the reward pool balance.",
            ],
            output: [
              {
                name: 'claimed_rewards',
                type: 'u64',
                description: 'The amount of rewards claimed by the user.'
              }
            ],
            error_handling: [
              "Return an error if the stake account is invalid.",
              "Return an error if the reward pool has insufficient balance.",
            ]
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 450 },
      },
      // Instruction Node 4: Withdraw Stake
      {
        width: 66,
        height: 44,
        id: 'instruction4-30001',
        type: 'instruction',
        position: { x: 300, y: 550 },
        data: {
          label: 'WithdrawStake',
          item: {
            description: "Withdraws the full stake and any remaining rewards.",
            programId: ['program1-30001'],
            category: [categoryEnum.object],
            params: [
              {
                name: 'stake_account',
                type: 'AccountInfo',
                input_source: [inputSource.program],
                validation: ['exists', 'isWritable'],
              },
              {
                name: 'initializer',
                type: 'Pubkey',
                input_source: [inputSource.user],
                validation: ['isBase58', 'length=32'],
              },
            ],
            logic: [
              "Verify the user's identity.",
              "Transfer the staked tokens and rewards to the user.",
              "Close the stake account.",
            ],
            output: [
              {
                name: 'withdrawn_amount',
                type: 'u64',
                description: 'The total amount withdrawn including rewards.'
              }
            ],
            error_handling: [
              "Return an error if the stake account has a non-zero balance but cannot be closed.",
              "Return an error if the transaction is unauthorized.",
            ]
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 550 },
      }
    ],
    edges: [
      {
        id: 'edge1-30001',
        source: 'program1-30001',
        target: 'account1-30001',
        type: 'solana',
        animated: false,
        style: { stroke: '#ffaa00', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge2-30001',
        source: 'program1-30001',
        target: 'account2-30001',
        type: 'solana',
        animated: false,
        style: { stroke: '#ffaa00', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge3-30001',
        source: 'program1-30001',
        target: 'instruction1-30001',
        type: 'solana',
        animated: false,
        style: { stroke: '#ffaa00', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge4-30001',
        source: 'program1-30001',
        target: 'instruction2-30001',
        type: 'solana',
        animated: false,
        style: { stroke: '#ffaa00', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge5-30001',
        source: 'program1-30001',
        target: 'instruction3-30001',
        type: 'solana',
        animated: false,
        style: { stroke: '#ffaa00', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge6-30001',
        source: 'program1-30001',
        target: 'instruction4-30001',
        type: 'solana',
        animated: false,
        style: { stroke: '#ffaa00', cursor: 'pointer', strokeWidth: 2 },
      }
    ],
    files: { name: '', type: 'directory', children: [] },
    codes: [],
    docs: [],
    isSaved: false,
    isAnchorInit: false,
    isCode: false,
    genUiClicked: false,
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
    programId: null,
    pdas: [],
    keyFeatures: [],
    userInteractions: [],
    sectorContext: '',
    optimizationGoals: [],
    uiHints: [],
  } as ProjectDetails,
};

export { stakingRewardsProgram };
