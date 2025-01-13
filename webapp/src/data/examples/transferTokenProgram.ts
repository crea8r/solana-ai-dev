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

const _uiStructure = {
  header: {
    title: 'Token Transfer Program',
    navigationMenu: ['Dashboard', 'Transfers', 'Settings'],
    walletInfo: {
      connectedWalletAddress: {
        type: 'text',
        placeholder: 'Not Connected',
        description: 'Displays the connected wallet address if available. If not connected, show a "Connect Wallet" button.',
      },
      balanceDisplay: {
        type: 'text',
        description: 'Shows the balance of SOL and available SPL tokens.',
      },
      connectWalletButton: {
        type: 'button',
        label: 'Connect Wallet',
        description: 'Visible only when no wallet is connected.',
      },
    },
  },
  mainSection: {
    title: 'Token Transfer Actions',
    layout: 'vertical',
    formElements: [
      {
        id: 'payerPublicKeyInput',
        type: 'input',
        label: 'Payer Public Key',
        placeholder: 'Enter your public key',
        inputType: 'text',
        validation: {
          required: true,
          pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$',
          errorMessage: 'Invalid public key format.',
        },
        description: 'The public key of the user initializing the transfer.',
      },
      {
        id: 'tokenMintInput',
        type: 'input',
        label: 'Token Mint',
        placeholder: 'Enter token mint address',
        inputType: 'text',
        validation: {
          required: true,
          pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$',
          errorMessage: 'Invalid mint address.',
        },
        description: 'The mint address of the token to be transferred.',
      },
      {
        id: 'transferAmountInput',
        type: 'input',
        label: 'Amount to Transfer',
        placeholder: 'Enter the amount',
        inputType: 'number',
        validation: {
          required: true,
          min: 1,
          errorMessage: 'Please enter a valid transfer amount greater than 0.',
        },
        description: 'The amount of SPL tokens to transfer from the sender to the receiver.',
      },
      {
        id: 'initializeAccountsButton',
        type: 'button',
        label: 'Initialize Accounts',
        action: 'initializeAccounts',
        description: 'Initializes the sender and receiver token accounts.',
      },
      {
        id: 'transferTokensButton',
        type: 'button',
        label: 'Transfer Tokens',
        action: 'transferTokens',
        description: 'Transfers tokens from the sender account to the receiver account.',
      },
      {
        id: 'closeAccountButton',
        type: 'button',
        label: 'Close Account',
        action: 'closeAccount',
        description: 'Closes the specified account and returns the remaining lamports.',
      },
    ],
  },
  confirmationModal: {
    isModal: true,
    title: 'Confirm Token Transfer',
    content: {
      fields: [
        {
          id: 'confirmationAction',
          type: 'staticText',
          label: 'Action',
          description: 'Displays the action being performed (e.g., Initialize Accounts, Transfer Tokens, or Close Account).',
        },
        {
          id: 'confirmationAmount',
          type: 'staticText',
          label: 'Amount',
          description: 'Displays the amount of tokens being transferred or the lamports returned.',
        },
        {
          id: 'confirmationReceiverAccount',
          type: 'staticText',
          label: 'Receiver Account',
          description: 'Displays the public key of the receiver account.',
        },
      ],
    },
    buttons: [
      {
        id: 'confirmButton',
        type: 'button',
        label: 'Confirm',
        action: 'submitTransaction',
        description: 'Confirms the transaction and submits it to the blockchain.',
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
        message: 'Transaction Completed Successfully!',
        details: {
          transactionHash: {
            label: 'Transaction Hash',
            type: 'link',
            urlTemplate: 'https://explorer.solana.com/tx/{transactionHash}',
          },
        },
        description: 'Displays a success message and the transaction hash for verification.',
      },
      {
        id: 'errorNotification',
        type: 'notification',
        variant: 'error',
        message: 'Transaction Failed!',
        details: {
          errorReason: {
            label: 'Reason',
            type: 'text',
          },
        },
        description: 'Displays an error message if the transaction fails, including the reason for failure if available.',
      },
    ],
  },
  historySection: {
    title: 'Recent Token Transfers',
    list: {
      type: 'transactionHistoryList',
      fields: ['timestamp', 'action', 'amount', 'status'],
      description: 'A list of recent token transfer transactions with their timestamps, actions, and status.',
      maxItems: 10,
      showPagination: true,
    },
  },
  optionalFeatures: {
    qrCodeScanner: {
      enabled: true,
      type: 'button',
      label: 'Scan QR Code',
      description: 'Scan a QR code to autofill the wallet addresses for sender or receiver.',
    },
    exportDataButton: {
      enabled: true,
      type: 'button',
      label: 'Export Transfer History',
      formatOptions: ['csv', 'json'],
      description: 'Allows users to export the transfer history in CSV or JSON format.',
    },
    darkModeToggle: {
      enabled: true,
      type: 'switch',
      label: 'Dark Mode',
      description: 'Switch between light and dark modes for the interface.',
    },
    notificationsToggle: {
      enabled: true,
      type: 'switch',
      label: 'Enable Notifications',
      description: 'Toggle on or off notifications for token transfer status updates.',
    },
  },
};

const transferTokenProgram: Project = {
  id: '',
  rootPath: '',
  name: 'Token Transfer Program',
  description: 'A Solana program to transfer SPL tokens between accounts.',
  details: {
    nodes: [
      // Program Node
      {
        width: 56,
        height: 44,
        id: 'program1-20001',
        type: 'program',
        position: { x: 50, y: 200 },
        data: {
          label: 'Token Transfer Program',
          item: {
            identifier: 'program1-20001',
            description: 'Handles SPL token transfers between accounts, with input validation and transaction logging.',
            programId: '22222222222222222222222222222222',
            account: [
              { id: 'account1-20001', name: 'SenderAccount', description: 'Holds the SPL tokens of the sender.' },
              { id: 'account2-20001', name: 'ReceiverAccount', description: 'Receives the transferred SPL tokens.' },
              { id: 'system_program_account', name: 'SystemProgram', description: 'Solana’s system program' },
              { id: 'token_program_account', name: 'TokenProgram', description: 'SPL Token program ID.' },
            ],
            instruction: [
              { id: 'instruction1-20001', name: 'InitializeAccounts', description: 'Initializes the sender and receiver token accounts.' },
              { id: 'instruction2-20001', name: 'TransferTokens', description: 'Transfers a specified amount of tokens from sender to receiver.' },
              { id: 'instruction3-20001', name: 'CloseAccount', description: 'Closes an account and returns the remaining lamports.' },
            ],
            is_public: true,
            sector: [sectorEnum.finance],
          },
        },
        selected: false,
        positionAbsolute: { x: 50, y: 200 },
      },
      // Sender Account Node
      {
        width: 80,
        height: 44,
        id: 'account1-20001',
        type: 'account',
        position: { x: 300, y: 50 },
        data: {
          label: 'SenderAccount',
          item: {
            id: 'account-20001',
            type: 'account',
            name: 'SenderAccount',
            description: 'Holds the SPL tokens of the sender.',
            structure: { key: 'balance', value: 'u64' },
            ownerProgramId: 'program1-20001',
            publicKey: '22222222222222222222222222222222',
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
      // Receiver Account Node
      {
        width: 80,
        height: 44,
        id: 'account2-20001',
        type: 'account',
        position: { x: 300, y: 150 },
        data: {
          label: 'ReceiverAccount',
          item: {
            id: 'account-20002',
            type: 'account',
            name: 'ReceiverAccount',
            description: 'Holds the SPL tokens received from the transfer.',
            structure: { key: 'balance', value: 'u64' },
            ownerProgramId: 'program1-20001',
            publicKey: '33333333333333333333333333333333',
            category: ['state'],
            is_mutable: true,
            is_signer: false,
            is_writable: true,
            initialized_by: ['user'],
          },
        },
        selected: false,
        positionAbsolute: { x: 300, y: 150 },
      },
      // Instruction Node 1: Initialize Accounts
      {
        width: 66,
        height: 44,
        id: 'instruction1-20001',
        type: 'instruction',
        position: { x: 300, y: 250 },
        data: {
          label: 'InitializeAccounts',
          item: {
            description: "Initializes sender and receiver token accounts.",
            programId: ['program1-20001'],
            category: [categoryEnum.object],
            params: [
              {
                name: 'payer',
                type: 'Pubkey',
                input_source: [inputSource.user],
                validation: ['isBase58', 'length=32'],
              },
              {
                name: 'token_mint',
                type: 'Pubkey',
                input_source: [inputSource.program],
                validation: ['exists'],
              },
            ],
            logic: [
              "Create a new token account for the sender.",
              "Create a new token account for the receiver.",
              "Initialize both accounts with the provided mint and payer." 
            ],
            output: [
              {
                name: 'sender_account',
                type: 'Pubkey',
                description: 'The public key of the sender account.'
              },
              {
                name: 'receiver_account',
                type: 'Pubkey',
                description: 'The public key of the receiver account.'
              }
            ],
            error_handling: [
              "Return an error if account initialization fails due to insufficient lamports.",
              "Return an error if the token mint is invalid.",
            ]
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 250 },
      },
      // Instruction Node 2: Transfer Tokens
      {
        width: 66,
        height: 44,
        id: 'instruction2-20001',
        type: 'instruction',
        position: { x: 300, y: 350 },
        data: {
          label: 'TransferTokens',
          item: {
            description: "Transfers tokens from the sender to the receiver.",
            programId: ['program1-20001'],
            category: [categoryEnum.object],
            params: [
              {
                name: 'sender_account',
                type: 'AccountInfo',
                input_source: [inputSource.program],
                validation: ['exists', 'isWritable'],
              },
              {
                name: 'receiver_account',
                type: 'AccountInfo',
                input_source: [inputSource.program],
                validation: ['exists', 'isWritable'],
              },
              {
                name: 'amount',
                type: 'u64',
                input_source: [inputSource.user],
                validation: ['isPositive'],
              },
            ],
            logic: [
              "Verify that the sender has sufficient balance.",
              "Deduct the specified amount from the sender's balance.",
              "Add the specified amount to the receiver's balance.",
              "Invoke the SPL Token program to perform the transfer."
            ],
            output: [
              {
                name: 'updated_sender_balance',
                type: 'u64',
                description: 'The updated balance of the sender after the transfer.'
              },
              {
                name: 'updated_receiver_balance',
                type: 'u64',
                description: 'The updated balance of the receiver after the transfer.'
              }
            ],
            error_handling: [
              "Return an error if the sender's balance is insufficient.",
              "Return an error if the receiver account is not writable.",
              "Return an error if the transfer fails due to program constraints.",
            ]
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 350 },
      },
      // Instruction Node 3: Close Account
      {
        width: 66,
        height: 44,
        id: 'instruction3-20001',
        type: 'instruction',
        position: { x: 300, y: 450 },
        data: {
          label: 'CloseAccount',
          item: {
            description: "Closes a token account and returns the remaining lamports to the payer.",
            programId: ['program1-20001'],
            category: [categoryEnum.object],
            params: [
              {
                name: 'account_to_close',
                type: 'AccountInfo',
                input_source: [inputSource.program],
                validation: ['exists', 'isWritable'],
              },
              {
                name: 'payer',
                type: 'Pubkey',
                input_source: [inputSource.user],
                validation: ['isBase58', 'length=32'],
              },
            ],
            logic: [
              "Verify that the account has no remaining token balance.",
              "Close the account and transfer lamports back to the payer.",
              "Log the account closure for auditing purposes."
            ],
            output: [
              {
                name: 'lamports_returned',
                type: 'u64',
                description: 'The number of lamports returned to the payer.'
              }
            ],
            error_handling: [
              "Return an error if the account has a non-zero token balance.",
              "Return an error if the account is not writable.",
              "Return an error if the account closure fails unexpectedly.",
            ]
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 450 },
      }
    ],
    edges: [
      {
        id: 'edge1-20001',
        source: 'program1-20001',
        target: 'account1-20001',
        type: 'solana',
        animated: false,
        style: { stroke: '#00aaff', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge2-20001',
        source: 'program1-20001',
        target: 'account2-20001',
        type: 'solana',
        animated: false,
        style: { stroke: '#00aaff', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge3-20001',
        source: 'program1-20001',
        target: 'instruction1-20001',
        type: 'solana',
        animated: false,
        style: { stroke: '#00aaff', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge4-20001',
        source: 'program1-20001',
        target: 'instruction2-20001',
        type: 'solana',
        animated: false,
        style: { stroke: '#00aaff', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge5-20001',
        source: 'program1-20001',
        target: 'instruction3-20001',
        type: 'solana',
        animated: false,
        style: { stroke: '#00aaff', cursor: 'pointer', strokeWidth: 2 },
      },
    ],
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

export { transferTokenProgram };