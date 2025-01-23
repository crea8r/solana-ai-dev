import { Project, ProjectDetails } from '../../interfaces/project';
import { ExtendedIdl } from '../../interfaces/extendedIdl';

const description = `The Token Transfer Program facilitates secure and efficient token transfers on-chain. 
Authorized users can initialize token accounts and transfer tokens between accounts. 
A PDA-derived TokenAccount stores the token balance and owner information, with robust access control enforced through validated accounts and parameters.`;

const _idl: ExtendedIdl = {
  version: "0.1.0",
  name: "token_transfer_program",
  address: "22222222222222222222222222222222",
  metadata: {},
  instructions: [
    {
      name: "initializeToken",
      discriminator: "initialize_token",
      accounts: [
        { name: "initializer", writable: true, signer: true },
        {
          name: "token_account",
          writable: true,
          signer: false,
          constraints: [
            "init",
            "seeds = [b\"token\", initializer.key().as_ref()]",
            "bump",
            "payer = initializer",
            "space = 8 + 165"
          ],
        },
        { name: "mint", writable: false, signer: false },
        { name: "system_program", writable: false, signer: false },
        { name: "token_program", writable: false, signer: false },
        { name: "rent", writable: false, signer: false },
      ],
      args: [],
    },
    {
      name: "transferToken",
      discriminator: "transfer_token",
      accounts: [
        { name: "from_token_account", writable: true, signer: false },
        { name: "to_token_account", writable: true, signer: false },
        { name: "authority", writable: false, signer: true },
        { name: "token_program", writable: false, signer: false },
      ],
      args: [
        { name: "amount", type: "u64" },
      ],
    },
  ],
  accounts: [],
  errors: [
    { code: 200, name: "Unauthorized", msg: "The caller is not authorized to perform this operation." },
    { code: 201, name: "AccountAlreadyInitialized", msg: "The token account is already initialized." },
    { code: 202, name: "InsufficientFunds", msg: "The token account does not have enough balance." },
  ],
  events: [
    {
      name: "TokenInitialized",
      fields: [
        { name: "initializer", type: "Pubkey", index: false },
        { name: "mint", type: "Pubkey", index: false },
      ],
    },
    {
      name: "TokenTransferred",
      fields: [
        { name: "from", type: "Pubkey", index: false },
        { name: "to", type: "Pubkey", index: false },
        { name: "amount", type: "u64", index: false },
      ],
    },
  ],
};

const _nodes = [
  // Program Node
  {
    width: 60,
    height: 48,
    id: 'program2-20001',
    type: 'program',
    position: { x: -250, y: 250 },
    data: {
      label: 'Token Transfer Program',
      item: {
        id: "program2-20001",
        name: { snake: 'token_transfer_program', pascal: 'TokenTransferProgram' },
        description: "Facilitates secure token transfers between accounts.",
        programId: "22222222222222222222222222222222",
        account: [
          "account1-20001",
          "system_program_account",
          "token_program_account",
        ],
        instruction: [
          "instruction1-20001",
          "instruction2-20001",
        ],
        isPublic: true,
      },
    },
    selected: false,
    positionAbsolute: { x: 20, y: 200 },
  },
  // System Program Account Node
  {
    width: 120,
    height: 40,
    id: "account3-20001",
    type: "account",
    position: { x: 100, y: 50 },
    data: {
      label: "System Program",
      item: {
        id: "account3-20001",
        name: { snake: "system_program", pascal: "SystemProgram" },
        description: "The Solana system program for account creation and management.",
        role: 'system_program',
        is_mutable: false,
        is_signer: false,
        fields: []
      }
    },
    selected: false,
    positionAbsolute: { x: 100, y: 50 }
  },
  // Token Program Account Node
  {
    width: 110,
    height: 40,
    id: "account4-20001",
    type: "account",
    position: { x: 100, y: 120 },
    data: {
      label: "Token Program",
      item: {
        id: "account4-20001",
        name: { snake: "token_program", pascal: "TokenProgram" },
        description: "The SPL Token program responsible for token operations.",
        role: 'token_program',
        is_mutable: false,
        is_signer: false,
        fields: []
      }
    },
    selected: false,
    positionAbsolute: { x: 100, y: 120 }
  },
  // Instruction Node 1: InitializeToken
  {
    width: 80,
    height: 50,
    id: 'instruction1-20001',
    type: 'instruction',
    position: { x: 300, y: 250 },
    data: {
      label: 'InitializeToken',
      item: {
        id: "instruction1-20001",
        name: { snake: "initialize_token", pascal: "InitializeToken" },
        description: "Initializes a new token account with an associated mint.",
        docs_description: "This function initializes a token account, setting its initial balance and associating it with a mint.",
        accounts: [
          {
            "name": { snake: "initializer", pascal: "Initializer" },
            "type": "Signer",
            "constraints": ["mut"]
          },
          {
            "name": { snake: "token_account", pascal: "TokenAccount" },
            "type": "Account",
            "constraints": [
              "init",
              "seeds = [b\"token\", initializer.key().as_ref()]",
              "bump",
              "payer = initializer",
              "space = 8 + 32 + 32"
            ]
          },
          {
            "name": { snake: "mint", pascal: "Mint" },
            "type": "Account",
            "constraints": ["mut"]
          },
          {
            "name": { snake: "system_program", pascal: "System" },
            "type": "Program",
            "constraints": []
          },
          {
            "name": { snake: "token_program", pascal: "Token" },
            "type": "Token",
            "constraints": []
          },
          {
            "name": { snake: "rent", pascal: "Rent" },
            "type": "Sysvar",
            "constraints": []
          }
        ],
        params: [],
        error_codes: [
          {
            code: 200,
            name: "Unauthorized",
            msg: "The caller is not authorized to perform this operation."
          },
          {
            code: 201,
            name: "AccountAlreadyInitialized",
            msg: "The token account is already initialized."
          }
        ],
        events: [
          {
            name: "TokenInitialized",
            fields: [
              { name: "initializer", type: "Pubkey" },
              { name: "mint", type: "Pubkey" }
            ]
          }
        ],
        imports: [
          {
            "field": "anchor_spl",
            "module": "anchor_spl::token",
            "items": ["Mint", "TokenAccount", "Token"]
          },
          {
            "field": "spl_token",
            "module": "spl_token::instruction",
            "items": ["*"]
          },
          {
            "field": "system_program",
            "module": "anchor_lang::system_program",
            "items": ["*"]
          },
          {
            "field": "rent_sysvar",
            "module": "anchor_lang::solana_program::sysvar::rent",
            "items": ["Rent"]
          }
        ],
      },
    },
    selected: true,
    positionAbsolute: { x: 300, y: 250 },
  },
  // Instruction Node 2: TransferToken
  {
    width: 80,
    height: 50,
    id: 'instruction2-20001',
    type: 'instruction',
    position: { x: 300, y: 350 },
    data: {
      label: 'TransferToken',
      item: {
        id: "instruction2-20001",
        name: { snake: "transfer_token", pascal: "TransferToken" },
        description: "Transfers tokens from one account to another.",
        docs_description: "This function handles the transfer of tokens between two token accounts.",
        accounts: [
          {
            "name": { snake: "from_token_account", pascal: "TokenAccount" },
            "type": "Account",
            "constraints": ["mut"]
          },
          {
            "name": { snake: "to_token_account", pascal: "TokenAccount" },
            "type": "Account",
            "constraints": ["mut"]
          },
          {
            "name": { snake: "authority", pascal: "Authority" },
            "type": "Signer",
            "constraints": []
          },
          {
            "name": { snake: "token_program", pascal: "Token" },
            "type": "Token",
            "constraints": []
          }
        ],
        params: [
          { name: "amount", type: "u64" }
        ],
        error_codes: [
          {
            code: 202,
            name: "InsufficientFunds",
            msg: "The token account does not have enough balance."
          },
          {
            code: 200,
            name: "Unauthorized",
            msg: "The caller is not authorized to perform this operation."
          }
        ],
        events: [
          {
            name: "TokenTransferred",
            fields: [
              { name: "from", type: "Pubkey" },
              { name: "to", type: "Pubkey" },
              { name: "amount", type: "u64" }
            ]
          }
        ],
        imports: [
          {
            field: "anchor_spl",
            module: "anchor_spl::token",
            items: ["TokenAccount", "Token"]
          },
          {
            field: "spl_token",
            module: "spl_token::instruction",
            items: ["*"]
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
    id: 'edge1-20001',
    source: 'program2-20001',
    target: 'account1-20001',
    type: 'solana',
    animated: false,
    style: { stroke: '#00ff57', cursor: 'pointer', strokeWidth: 2 },
  },
  {
    id: 'edge2-20001',
    source: 'program2-20001',
    target: 'account3-20001',
    type: 'solana',
    animated: false,
    style: { stroke: '#00ff57', cursor: 'pointer', strokeWidth: 2 },
  },
  {
    id: 'edge3-20001',
    source: 'program2-20001',
    target: 'account4-20001',
    type: 'solana',
    animated: false,
    style: { stroke: '#00ff57', cursor: 'pointer', strokeWidth: 2 },
  },
  {
    id: 'edge4-20001',
    source: 'program2-20001',
    target: 'instruction1-20001',
    type: 'solana',
    animated: false,
    style: { stroke: '#00ff57', cursor: 'pointer', strokeWidth: 2 },
  },
  {
    id: 'edge5-20001',
    source: 'program2-20001',
    target: 'instruction2-20001',
    type: 'solana',
    animated: false,
    style: { stroke: '#00ff57', cursor: 'pointer', strokeWidth: 2 },
  },
];

const _uiStructure = {
  header: {
    title: 'Token Transfer Program',
    navigationMenu: ['Dashboard', 'Token Actions', 'History', 'Settings'],
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
    title: 'Token Actions',
    layout: 'vertical',
    formElements: [
      {
        id: 'tokenBalanceDisplay',
        type: 'staticText',
        label: 'Current Token Balance',
        value: '0',
        description: 'Displays the current token balance fetched from the program.',
      },
      {
        id: 'initializeTokenButton',
        type: 'button',
        label: 'Initialize Token Account',
        action: 'initializeToken',
        description: 'Initializes the token account with the current wallet address as the owner and associates it with a mint.',
        validation: {
          required: true,
          walletConnected: true,
          errorMessage: 'Please connect your wallet to initialize the token account.',
        },
      },
      {
        id: 'transferTokenButton',
        type: 'button',
        label: 'Transfer Tokens',
        action: 'transferToken',
        description: 'Transfers a specified amount of tokens to another account.',
        validation: {
          required: true,
          walletConnected: true,
          errorMessage: 'Please connect your wallet to transfer tokens.',
        },
      },
    ],
  },
  confirmationModal: {
    isModal: true,
    title: 'Confirm Token Action',
    content: {
      fields: [
        {
          id: 'confirmationActionType',
          type: 'staticText',
          label: 'Action',
          description: 'Displays the type of action being performed (initialize, transfer).',
        },
        {
          id: 'confirmationAmount',
          type: 'staticText',
          label: 'Amount',
          description: 'Displays the amount of tokens involved in the action for user confirmation.',
        },
        {
          id: 'confirmationRecipient',
          type: 'staticText',
          label: 'Recipient',
          description: 'Displays the recipient address for transfer actions.',
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
    title: 'Recent Token Transactions',
    list: {
      type: 'transactionHistoryList',
      fields: ['timestamp', 'action', 'amount', 'status'],
      description: 'A list showing recent token transactions, including timestamp, action, amount, and status.',
      maxItems: 10,
      showPagination: true,
    },
  },
  optionalFeatures: {
    roleBasedAccess: {
      enabled: true,
      description: 'Restricts transfer-related actions to the authorized wallet.',
    },
    exportDataButton: {
      enabled: true,
      type: 'button',
      label: 'Export Transaction History',
      formatOptions: ['csv', 'json'],
      description: 'Allows users to export the token transaction history in CSV or JSON format.',
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


const tokenTransferProgram: Project = {
  id: '',
  rootPath: '',
  name: 'Token Transfer Program',
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

export { tokenTransferProgram };