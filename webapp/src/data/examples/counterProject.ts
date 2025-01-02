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



const counterProject: Project = {
  id: '',
  rootPath: '',
  name: 'Counter Program',
  description: 'A Solana program to increment or reset a shared counter, with restricted reset permissions.',
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
    program: [{
      id: 'program1-10001',
      name: 'Counter Program',
      description: 'Manages a shared counter with increment and reset functionality.',
      account: ['account1-10001'],
      instruction: ['instruction1-10001', 'instruction2-10001', 'instruction3-10001'],
      dependencies: [],
      security: 'Public',
      sector: [sectorEnum.utility],
    }],
    instruction: [
      {
      id: 'instruction1-10001',
      name: 'InitializeCounter',
      description: 'Initializes the counter on-chain with an initial value of zero.',
      programId: ['program1-10001'],
      category: [categoryEnum.number],
      params: [
        {
          name: 'initializer',
          type: 'Pubkey',
          input_source: [inputSource.user],
          default_value: '11111111111111111111111111111111',
          validation: ['isBase58', 'length=32'],
        },
      ],
      logic: [
        "Verify the initializer's signature to confirm the transaction is authorized.",
        "Allocate a new CounterAccount and set its owner to the Counter Program.",
        "Set the counter value in CounterAccount to zero.",
        "Store the initializer's public key in the CounterAccount.",
        "Deduct rent-exempt lamports from the initializer's account."
      ],
      output: [
        {
          name: 'counter_account',
          type: 'Pubkey',
          description: 'The public key of the newly created CounterAccount.'
        },
        {
          name: 'initializer',
          type: 'Pubkey',
          description: 'The public key of the initializer who created the CounterAccount.'
        }
      ],
      pda: [
        {
          name: 'counter_pda',
          seeds: ['initializer', 'counter_program'],
          bump: 255 // Example bump value, to be programmatically derived
        }
      ],
      authenticated_accounts: [
        {
          name: 'initializer',
          public_key: ['initializer_pubkey'] // Public key of the initializer who signs the transaction
        },
        {
          name: 'counter_account',
          public_key: ['counter_pda'] // PDA associated with the CounterAccount
        },
        {
          name: 'system_program',
          public_key: ['11111111111111111111111111111111'] // Public key of Solana's System Program
        }
      ],
      relationships: [
        {
          name: 'initializer-counter_account',
          type: 'ownership',
          description: 'The initializer owns the newly created CounterAccount.'
        },
        {
          name: 'counter_account-system_program',
          type: 'dependency',
          description: 'The System Program is used to create and fund the CounterAccount.'
        }
      ],
      state_changes: [
        {
          account_id: 'counter_account',
          account_name: 'CounterAccount',
          before: 'Uninitialized account, no data stored.',
          after: 'Account initialized with count set to 0 and initializer public key stored.'
        }
      ],
      events: [
        {
          name: 'CounterInitialized',
          description: 'Emitted when a new CounterAccount is successfully initialized.',
          fields: [
            {
              name: 'initializer',
              type: 'Pubkey', // The public key of the initializer
            },
            {
              name: 'counter_account',
              type: 'Pubkey', // The public key of the created CounterAccount
            },
            {
              name: 'initial_count',
              type: 'u64', // The initial value of the counter
            },
          ]
        }
      ],
      conditions: [
        {
          condition: 'The initializer must have enough SOL to fund the rent-exempt balance for the CounterAccount.',
          order: orderEnum.before, // This condition is checked before executing the instruction.
        },
        {
          condition: 'The CounterAccount must not already exist.',
          order: orderEnum.before, // This ensures the account is created only once.
        },
        {
          condition: 'The System Program must be accessible to allocate space for the CounterAccount.',
          order: orderEnum.before, // Checked before account creation.
        },
        {
          condition: 'The transaction must be signed by the initializer.',
          order: orderEnum.before, // Ensures proper authorization.
        }
      ],
      triggers: [
        {
          type: triggerType.user, // Manual trigger initiated by a user action
          description: 'Triggered when the user submits a transaction to initialize the counter.',
          source: [
            {
              name: 'User Wallet',
              description: 'The user signs the transaction using their wallet.'
            }
          ],
          schedule: [],
          account: [
            {
              id: 'initializer',
              name: 'Initializer',
              description: 'The user initiating the counter setup.',
              state: ['Has sufficient SOL for rent exemption', 'Is authorized to sign transactions']
            }
          ]
        }
      ],
    },
    {
      id: 'instruction1-10002',
      name: 'IncrementCounter',
      description: 'Increments the counter by one.',
      programId: ['program1-10001'], // The program that owns this instruction
      category: [categoryEnum.number],
      params: [
        {
          name: 'counter_account',
          type: 'AccountInfo',
          input_source: [inputSource.program],
          validation: ['exists'],
        },
        {
          name: 'user',
          type: 'Pubkey',
          input_source: [inputSource.user],
          validation: ['isBase58', 'length=32'],
        },
      ],
      logic: [
        "Verify that the user is authorized to update the counter.",
        "Fetch the current counter value from the CounterAccount.",
        "Increment the counter value by one.",
        "Store the updated value back in the CounterAccount."
      ],
      output: [
        {
          name: 'updated_counter',
          type: 'u64',
          description: 'The updated counter value after incrementing.'
        }
      ],
      pda: [],
      authenticated_accounts: [
        {
          name: 'counter_account',
          public_key: ['counter_account_pubkey'], // Public key of the CounterAccount
        },
        {
          name: 'user',
          public_key: ['user_pubkey'], // Public key of the user incrementing the counter
        }
      ],
      relationships: [
        {
          name: 'user-counter_account',
          type: 'authorization',
          description: 'The user must be authorized to increment the counter.'
        }
      ],
      state_changes: [
        {
          account_id: 'counter_account',
          account_name: 'CounterAccount',
          before: 'Counter value before increment.',
          after: 'Counter value after increment.'
        }
      ],
      events: [
        {
          name: 'CounterIncremented',
          description: 'Emitted when the counter is successfully incremented.',
          fields: [
            {
              name: 'counter_account',
              type: 'Pubkey',
            },
            {
              name: 'user',
              type: 'Pubkey',
            },
            {
              name: 'new_value',
              type: 'u64',
            }
          ]
        }
      ],
      conditions: [
        {
          condition: 'The CounterAccount must exist.',
          order: orderEnum.before,
        },
        {
          condition: 'The user must be authorized to update the counter.',
          order: orderEnum.before,
        }
      ],
      triggers: [
        {
          type: triggerType.user,
          description: 'Triggered when the user submits a transaction to increment the counter.',
          source: [
            {
              name: 'User Wallet',
              description: 'The user signs the transaction using their wallet.',
            }
          ],
          schedule: [],
          account: [
            {
              id: 'counter_account',
              name: 'CounterAccount',
              description: 'The account storing the counter value.',
              state: ['Exists', 'Writable'],
            },
            {
              id: 'user',
              name: 'User',
              description: 'The user incrementing the counter.',
              state: ['Has valid signature'],
            }
          ]
        }
      ],
    },
    {
      id: 'instruction1-10003',
      name: 'ResetCounter',
      description: 'Resets the counter to zero, restricted to the initializer.',
      programId: ['program1-10001'], // The program that owns this instruction
      category: [categoryEnum.number],
      params: [
        {
          name: 'counter_account',
          type: 'AccountInfo',
          input_source: [inputSource.program],
          validation: ['exists'],
        },
        {
          name: 'initializer',
          type: 'Pubkey',
          input_source: [inputSource.user],
          validation: ['isBase58', 'length=32'],
        },
      ],
      logic: [
        "Verify that the initializer is authorized to reset the counter.",
        "Fetch the current counter value from the CounterAccount.",
        "Set the counter value to zero.",
        "Log the reset operation for auditing."
      ],
      output: [
        {
          name: 'reset_counter',
          type: 'u64',
          description: 'The counter value after being reset to zero.'
        }
      ],
      pda: [],
      authenticated_accounts: [
        {
          name: 'counter_account',
          public_key: ['counter_account_pubkey'], // Public key of the CounterAccount
        },
        {
          name: 'initializer',
          public_key: ['initializer_pubkey'], // Public key of the initializer
        }
      ],
      relationships: [
        {
          name: 'initializer-counter_account',
          type: 'authorization',
          description: 'The initializer must be authorized to reset the counter.'
        }
      ],
      state_changes: [
        {
          account_id: 'counter_account',
          account_name: 'CounterAccount',
          before: 'Counter value before reset.',
          after: 'Counter value set to zero.'
        }
      ],
      events: [
        {
          name: 'CounterReset',
          description: 'Emitted when the counter is successfully reset.',
          fields: [
            {
              name: 'counter_account',
              type: 'Pubkey',
            },
            {
              name: 'initializer',
              type: 'Pubkey',
            },
            {
              name: 'new_value',
              type: 'u64',
            }
          ]
        }
      ],
      conditions: [
        {
          condition: 'The CounterAccount must exist.',
          order: orderEnum.before,
        },
        {
          condition: 'The initializer must be authorized to reset the counter.',
          order: orderEnum.before,
        }
      ],
      triggers: [
        {
          type: triggerType.user,
          description: 'Triggered when the initializer submits a transaction to reset the counter.',
          source: [
            {
              name: 'User Wallet',
              description: 'The initializer signs the transaction using their wallet.',
            }
          ],
          schedule: [],
          account: [
            {
              id: 'counter_account',
              name: 'CounterAccount',
              description: 'The account storing the counter value.',
              state: ['Exists', 'Writable'],
            },
            {
              id: 'initializer',
              name: 'Initializer',
              description: 'The user authorized to reset the counter.',
              state: ['Has valid signature'],
            }
          ]
        }
      ],
      }
    ],
    accounts: [
        {
          id: 'account-12346',
          name: 'CounterAccount',
          description: 'Stores the counter value and initializer’s public key.',
          publicKey: '11111111111111111111111111111111',
          category: ['state'],
          programId: ['program1-10001'],
          is_mutable: true,
          is_signer: false,
          is_writable: true,
          initialized_by: ['initializer'],
          structure: {
            key: 'counter',
            value: 'u64',
          },
        },
        {
          id: 'system_program_account',
          name: 'SystemProgram',
          description: 'Solana’s system program used to allocate and fund accounts.',
          publicKey: '11111111111111111111111111111111',
          category: ['dependency'],
          programId: ['program1-10001'],
          is_mutable: false,
          is_signer: false,
          is_writable: false,
          initialized_by: [],
          structure: {
            key: '',
            value: '',
          },
        },
        {
          id: 'rent_account',
          name: 'Rent',
          description: 'Account used to calculate rent-exemption for created accounts.',
          publicKey: '11111111111111111111111111111111',
          category: ['dependency'],
          programId: ['program1-10001'],
          is_mutable: false,
          is_signer: false,
          is_writable: false,
          initialized_by: [],
          structure: {
            key: '',
            value: '',
          },
        },
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

export { counterProject };