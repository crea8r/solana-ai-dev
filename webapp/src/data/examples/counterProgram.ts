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

const _nodes = [
  // Program Node
  {
    width: 56,
    height: 44,
    id: 'program1-10001',
    type: 'program',
    position: { x: 50, y: 200 },
    data: {
      label: 'Counter Program',
      item: {
        id: "program1-10001",
        name: "Counter Program",
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
    positionAbsolute: { x: 50, y: 200 },
  },
  // Account Node
  {
    width: 80,
    height: 44,
    id: 'account1-10001',
    type: 'account',
    position: { x: 300, y: 50 },
    data: {
      label: 'CounterAccount',
      item: {
        id: "account1-10001",
        name: "CounterAccount",
        description: "Stores the counter value and initializer’s public key.",
        is_mutable: true,
        is_signer: false
      },
    },
    selected: false,
    positionAbsolute: { x: 300, y: 50 },
  },
  // Instruction Node 1
  {
    width: 66,
    height: 44,
    id: 'instruction1-10001',
    type: 'instruction',
    position: { x: 300, y: 150 },
    data: {
      label: 'InitializeCounter',
      item: {
        id: "instruction1-10001",
        name: "InitializeCounter",
        description: "Initializes a new counter account with an initial value of zero.",
        accounts: ["initializer"],
        params: [
          {
            name: "initializer",
            type: "Pubkey"
          }
        ]
      }
      ,
    },
    selected: true,
    positionAbsolute: { x: 300, y: 150 },
  },
  // Instruction Node 2
  {
    width: 66,
    height: 44,
    id: 'instruction2-10001',
    type: 'instruction',
    position: { x: 300, y: 250 },
    data: {
      label: 'IncrementCounter',
      item: {
        id: "instruction2-10001",
        name: "IncrementCounter",
        description: "Increments the counter value by one in the specified CounterAccount.",
        accounts: ["counter_account", "user"],
        params: [
          {
            name: "counter_account",
            type: "AccountInfo"
          },
          {
            name: "user",
            type: "Pubkey"
          }
        ]
      }
      ,
    },
    selected: true,
    positionAbsolute: { x: 300, y: 250 },
  },
  // Instruction Node 3
  {
    width: 66,
    height: 44,
    id: 'instruction3-10001',
    type: 'instruction',
    position: { x: 300, y: 350 },
    data: {
      label: 'ResetCounter',
      item: {
        id: "instruction3-10001",
        name: "ResetCounter",
        description: "Resets the counter value to zero for a specified CounterAccount.",
        accounts: ["counter_account", "initializer"],
        params: [
          {
            name: "counter_account",
            type: "AccountInfo"
          },
          {
            name: "initializer",
            type: "Pubkey"
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
  description: 'A Solana program to increment or reset a shared counter, with restricted reset permissions.',
  details: {
    nodes: _nodes,
    edges: _edges,
    uiStructure: _uiStructure,
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