import { Project, ProjectDetails } from '../../interfaces/project';
import { ExtendedIdl } from '../../interfaces/extendedIdl';

const description = `The Counter Program maintains an on-chain counter, allowing authorized users to increment its value and restricting reset functionality to the initializer. 
A PDA-derived CounterAccount stores the counter value and its owner, with strict access control enforced through validated accounts and parameters.`

const _idl: ExtendedIdl = {
  version: "0.1.0",
  name: "counter_program",
  address: "11111111111111111111111111111111",
  metadata: {},
  instructions: [
    {
      name: "initialize_counter",
      discriminator: "initialize_counter",
      accounts: [
        { name: "initializer", writable: true, signer: true },
        {
          name: "counter_account",
          writable: true,
          signer: false,
          constraints: [
            "init",
            "seeds = [b\"counter\", initializer.key().as_ref()]",
            "bump",
            "payer = initializer",
            "space = 8 + 16",
          ],
        },
        { name: "system_program", writable: false, signer: false },
        { name: "rent", writable: false, signer: false },
      ],
      args: [],
    },
    {
      name: "increment_counter",
      discriminator: "increment_counter",
      accounts: [
        { name: "user", writable: false, signer: true },
        { name: "counter_account", writable: true, signer: false },
      ],
      args: [],
    },
    {
      name: "reset_counter",
      discriminator: "reset_counter",
      accounts: [
        { name: "initializer", writable: false, signer: true },
        { name: "counter_account", writable: true, signer: false },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "CounterAccount",
      type: {
        kind: "struct",
        fields: [
          { name: "counter", type: "u64" },
          { name: "initializer", type: "publicKey" },
        ],
      },
    },
  ],
  errors: [
    { code: 100, name: "Unauthorized", msg: "The caller is not authorized to perform this operation." },
    { code: 101, name: "AccountAlreadyInitialized", msg: "The counter account is already initialized." },
    { code: 102, name: "OverflowError", msg: "The counter value overflowed." },
    { code: 103, name: "AlreadyReset", msg: "The counter is already reset to 0." },
  ],
  events: [
    {
      name: "CounterIncremented",
      fields: [
        { name: "previousValue", type: "u64", index: false },
        { name: "newValue", type: "u64", index: false },
        { name: "incrementBy", type: "u64", index: false },
      ],
    },
    {
      name: "CounterReset",
      fields: [
        { name: "previousValue", type: "u64", index: false },
        { name: "resetByUser", type: "bool", index: false },
      ],
    },
  ],
};

const _nodes = [
  // Program Node
  {
    width: 56,
    height: 44,
    id: 'program1-10001',
    type: 'program',
    position: { x: 0, y: 0 },
    positionAbsolute: { x: 0, y: 0 },
    data: {
      label: 'Counter Program',
      item: {
        id: "program1-10001",
        name: {snake: 'counter_program', pascal: 'CounterProgram'},
        description: "Manages a shared counter with increment and reset functionality.",
        programId: "11111111111111111111111111111111",
        account: [
          "account1-10001",
          "system_program_account"
        ],
        instruction: [
          "instruction1-10001",
          "instruction2-10001",
          "instruction3-10001"
        ],
        isPublic: true,
        events: [
          {
            name: "CounterIncremented",
            fields: [
              { name: "previousValue", type: "u64" },
              { name: "newValue", type: "u64" },
              { name: "incrementBy", type: "u64" }
            ]
          },
          {
            name: "CounterReset",
            fields: [
              { name: "previousValue", type: "u64" },
              { name: "resetByUser", type: "bool" }
            ]
          }
        ],
        errorCodes: [
          {
            code: 100,
            name: "Unauthorized",
            msg: "The caller is not authorized to perform this operation."
          },
          {
            code: 101,
            name: "InvalidInput",
            msg: "The provided input is invalid (e.g., negative increment)."
          },
          {
            code: 102,
            name: "OverflowError",
            msg: "Counter overflow: the value exceeded the maximum allowed."
          },
          {
            code: 103,
            name: "AlreadyReset",
            msg: "The counter is already reset to 0."
          }
        ]
      }
      ,
    },
    selected: false,
  },
  // Account Node 1
  {
    width: 80,
    height: 44,
    id: 'account1-10001',
    type: 'account',
    position: { x: 300, y: -250 },
    data: {
      label: 'CounterAccount',
      item: {
        id: "account1-10001",
        name: {snake: 'counter_account', pascal: 'CounterAccount'},
        description: "Stores the counter value and initializer’s public key.",
        role: 'program_account',
        is_mutable: true,
        is_signer: false,
        fields: [
          { name: "counter", type: "u64" },
          { name: "initializer", type: "Pubkey" }
        ]
      },
    },
    selected: false,
    positionAbsolute: { x: 300, y: 50 },
  },
  // Account Node 2
  {
    width: 80,
    height: 44,
    id: "account2-10001",
    type: "account",
    position: { x: 100, y: 50 },  // Adjusted to be near the program
    data: {
      label: "Initializer",
      item: {
        id: "account2-10001",
        name: { snake: "initializer", pascal: "Initializer" },
        description: "The account that initializes and owns the CounterAccount.",
        role: 'signer_account',
        is_mutable: true,
        is_signer: true,
        fields: [
          { name: "public_key", type: "Pubkey" }
        ]
      }
    },
    selected: false,
    positionAbsolute: { x: 100, y: 50 }
  },
  // Account Node 3
  {
    width: 80,
    height: 44,
    id: "account3-10001",
    type: "account",
    position: { x: 100, y: 120 },  // Adjusted to be near the program
    data: {
      label: "User",
      item: {
        id: "account3-10001",
        name: { snake: "user", pascal: "User" },
        description: "The account of the user performing counter increments.",
        role: 'signer_account',
        is_mutable: false,
        is_signer: true,
        fields: [
          { name: "public_key", type: "Pubkey" }
        ]
      }
    },
    selected: false,
    positionAbsolute: { x: 100, y: 120 }
  },
  // Instruction Node 1 - InitializeCounter
  {
    width: 66,
    height: 44,
    id: 'instruction1-10001',
    type: 'instruction',
    position: { x: 300, y: -150 },
    data: {
      label: 'InitializeCounter',
      item: {
        id: "instruction1-10001",
        name: {snake: "initialize_counter", pascal: "InitializeCounter"},
        description: "Initializes a new counter account with an initial value of zero.",
        docs_description: "This function initializes a counter account, setting its initial value to zero.",
        accounts: [
          {
            "name": {snake: "authority", pascal: "Authority"},
            "type": "Signer",
            "constraints": ["mut"]
          },
          {
            "name": {snake: "counter_account", pascal: "CounterAccount"},
            "type": "Account",
            "constraints": [
              "init",
              "seeds = [b\"counter\", authority.key().as_ref()]",
              "bump",
              "payer = authority",
              "space = 8 + 16"
            ]
          },
          {
            "name": { snake: "system_program", pascal: "System" },
            "type": "Program",
            "constraints": []
          }
        ],
        params: [ { name: "authority", type: "Pubkey" } ],
        error_codes: [
          {
            code: 100,
            name: "Unauthorized",
            msg: "The caller is not authorized to perform this operation."
          },
          {
            code: 101,
            name: "AccountAlreadyInitialized",
            msg: "The counter account is already initialized."
          }
        ],
        events: [
          {
            name: "CounterInitialized",
            fields: [
              { name: "initializer", type: "Pubkey" }
            ]
          }
        ]
      }
      ,
    },
    selected: true,
    positionAbsolute: { x: 300, y: 50 },
  },
  // Instruction Node 2 - IncrementCounter
  {
    width: 66,
    height: 44,
    id: 'instruction2-10001',
    type: 'instruction',
    position: { x: 300, y: -50 },
    data: {
      label: 'IncrementCounter',
      item: {
        id: "instruction2-10001",
        name: {snake: "increment_counter", pascal: "IncrementCounter"},
        description: "Increments the counter value by one in the specified CounterAccount.",
        docs_description: "This function increments the counter value by one for the specified account.",
        accounts: [
          {
            "name": {snake: "user", pascal: "User"},
            "type": "Signer",
            "constraints": []
          },
          {
            "name": {snake: "counter_account", pascal: "CounterAccount"},
            "type": "Account",
            "constraints": ["mut"]
          }
        ],
        params: [
          {
            name: "counter_account",
            type: "Pubkey"
          },
          {
            name: "user",
            type: "Pubkey"
          }
        ],
        error_codes: [
          {
            code: 200,
            name: "UnauthorizedUser",
            msg: "The user is not authorized to increment the counter."
          },
          {
            code: 201,
            name: "AccountNotInitialized",
            msg: "The counter account is not initialized."
          },
          {
            code: 202,
            name: "CounterOverflow",
            msg: "The counter value overflowed."
          }
        ],
        events: [
          {
            name: "CounterIncremented",
            fields: [
              { name: "previous_value", type: "u64" },
              { name: "new_value", type: "u64" },
              { name: "increment_by", type: "u64" }
            ]
          }
        ]
      }
      ,
    },
    selected: true,
    positionAbsolute: { x: 300, y: 250 },
  },
  // Instruction Node 3 - ResetCounter
  {
    width: 66,
    height: 44,
    id: 'instruction3-10001',
    type: 'instruction',
    position: { x: 300, y: 150 },
    data: {
      label: 'ResetCounter',
      item: {
        id: "instruction3-10001",
        name: {snake: "reset_counter", pascal: "ResetCounter"},
        description: "Resets the counter value to zero for a specified CounterAccount.",
        docs_description: "This function resets the counter value to zero, only the initializer can perform this action.",
        accounts: [
          {
            name: {snake: "counter_account", pascal: "CounterAccount"},
            type: "Account",
            constraints: ["mut"]
          },
          {
            name: {snake: "authority", pascal: "Authority"},
            type: "Signer",
            constraints: []
          }
        ],
        params: [
          {
            name: "counter_account",
            type: "Pubkey"
          },
          {
            name: "authority",
            type: "Pubkey"
          }
        ],
        error_codes: [
          {
            code: 300,
            name: "AlreadyReset",
            msg: "The counter is already reset to zero."
          },
          {
            code: 301,
            name: "UnauthorizedReset",
            msg: "Only the initializer can reset the counter."
          }
        ],
        events: [
          {
            name: "CounterReset",
            fields: [
              { name: "previous_value", type: "u64" },
              { name: "reset_by_user", type: "bool" }
            ]
          }
        ]
      },
    },
    selected: true,
    positionAbsolute: { x: 300, y: 350 },
  },
];

const _edges = [
  {
    id: 'edge1-10001',
    source: 'program1-10001',
    target: 'account1-10001',
    type: 'solana',
    animated: false,
    style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
  },
  {
    id: 'edge-2',
    source: 'program1-10001',
    target: 'instruction1-10001',
    type: 'solana',
    animated: false,
    style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
  },
  {
    id: 'edge-3',
    source: 'program1-10001',
    target: 'instruction2-10001',
    type: 'solana',
    animated: false,
    style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
  },
  {
    id: 'edge-4',
    source: 'program1-10001',
    target: 'instruction3-10001',
    type: 'solana',
    animated: false,
    style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
  },
];

const _uiStructure = {
  header: {
    title: 'Counter Program',
    navigationMenu: ['Dashboard', 'Counter Actions', 'History', 'Settings'],
    walletInfo: {
      connectedWalletAddress: {
        type: 'text',
        placeholder: 'Not Connected',
        description: 'Displays the connected wallet address if available. Otherwise, show a "Connect Wallet" button.',
      },
      balanceDisplay: {
        type: 'text',
        description: 'Shows the balance of SOL and any relevant program-specific tokens.',
      },
      connectWalletButton: {
        type: 'button',
        label: 'Connect Wallet',
        description: 'Visible only when no wallet is connected. Initiates wallet connection.',
      },
    },
  },
  mainSection: {
    title: 'Counter Actions',
    layout: 'vertical',
    formElements: [
      {
        id: 'counterValueDisplay',
        type: 'staticText',
        label: 'Current Counter Value',
        value: '0',
        description: 'Displays the current counter value fetched from the program.',
      },
      {
        id: 'initializeCounterButton',
        type: 'button',
        label: 'Initialize Counter',
        action: 'initializeCounter',
        description: 'Initializes the counter account with the current wallet address as the owner.',
        validation: {
          required: true,
          walletConnected: true,
          errorMessage: 'Please connect your wallet to initialize the counter.',
        },
      },
      {
        id: 'incrementCounterButton',
        type: 'button',
        label: 'Increment Counter',
        action: 'incrementCounter',
        description: 'Increments the counter value by 1.',
        validation: {
          required: true,
          walletConnected: true,
          errorMessage: 'Please connect your wallet to increment the counter.',
        },
      },
      {
        id: 'resetCounterButton',
        type: 'button',
        label: 'Reset Counter',
        action: 'resetCounter',
        description: 'Resets the counter value to zero. Only the initializer is allowed to perform this action.',
        validation: {
          walletConnected: true,
          roleCheck: 'initializer',
          errorMessage: 'Only the initializer can reset the counter.',
        },
      },
    ],
  },
  confirmationModal: {
    isModal: true,
    title: 'Confirm Counter Action',
    content: {
      fields: [
        {
          id: 'confirmationActionType',
          type: 'staticText',
          label: 'Action',
          description: 'Displays the type of action being performed (initialize, increment, reset).',
        },
        {
          id: 'confirmationCounterValue',
          type: 'staticText',
          label: 'Counter Value',
          description: 'Displays the counter value after the action for user confirmation.',
        },
      ],
    },
    buttons: [
      {
        id: 'confirmButton',
        type: 'button',
        label: 'Confirm',
        action: 'submitAction',
        description: 'Confirms the action and submits the transaction.',
      },
      {
        id: 'cancelButton',
        type: 'button',
        label: 'Cancel',
        action: 'closeModal',
        description: 'Cancels the action and closes the confirmation modal.',
      },
    ],
  },
  feedbackSection: {
    title: 'Transaction Status',
    elements: [
      {
        id: 'successNotification',
        type: 'notification',
        variant: 'success',
        message: 'Action Completed Successfully!',
        details: {
          transactionHash: {
            label: 'Transaction Hash',
            type: 'link',
            urlTemplate: 'https://explorer.solana.com/tx/{transactionHash}',
          },
        },
        description: 'Displays a success message and transaction hash for verification.',
      },
      {
        id: 'errorNotification',
        type: 'notification',
        variant: 'error',
        message: 'Action Failed!',
        details: {
          errorReason: {
            label: 'Reason',
            type: 'text',
            description: 'Displays the reason for failure if available.',
          },
        },
        description: 'Shows an error message if the transaction fails, along with any available failure reason.',
      },
    ],
  },
  historySection: {
    title: 'Recent Counter Transactions',
    list: {
      type: 'transactionHistoryList',
      fields: ['timestamp', 'action', 'updatedValue', 'status'],
      description: 'A list showing recent counter transactions, including timestamp, action, updated value, and status.',
      maxItems: 10,
      showPagination: true,
    },
  },
  optionalFeatures: {
    roleBasedAccess: {
      enabled: true,
      description: 'Restricts reset-related actions to the authorized initializer.',
    },
    exportDataButton: {
      enabled: true,
      type: 'button',
      label: 'Export Transaction History',
      formatOptions: ['csv', 'json'],
      description: 'Allows users to export the counter transaction history in CSV or JSON format.',
    },
    darkModeToggle: {
      enabled: true,
      type: 'switch',
      label: 'Dark Mode',
      description: 'Toggle between light and dark mode.',
    },
    notificationsToggle: {
      enabled: true,
      type: 'switch',
      label: 'Enable Notifications',
      description: 'Enable or disable in-app notifications for transaction updates.',
    },
  },
};

const counterProgram: Project = {
  id: '',
  rootPath: '',
  name: 'Counter Program',
  description: description,
  details: {
    nodes: _nodes,
    edges: _edges,
    nodesHydrated: false,
    designIdl: _idl,
    uiStructure: _uiStructure,
    files: { name: '', type: 'directory', children: [] },
    codes: [],
    docs: [],
    isSaved: false,
    isAnchorInit: false,
    isCode: false,
    genUiClicked: false,
    filePaths: [],
    fileTree: { name: '', type: 'directory', children: [] },
    stateContent: '',
    uiResults: [],
    aiInstructions: [],
    sdkFunctions: [],
    buildStatus: false,
    deployStatus: false,
    isSdk: false,
    isUi: false,
    idl: {},
    sdk: { fileName: '', content: '' },
    programId: null,
    pdas: [],
    keyFeatures: [],
    userInteractions: [],
    sectorContext: '',
    optimizationGoals: [],
    uiHints: [],
  } as ProjectDetails,
};

export { counterProgram };