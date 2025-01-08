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



const counterProject: Project = {
  id: '',
  rootPath: '',
  name: 'Counter Program',
  description: 'A Solana program to increment or reset a shared counter, with restricted reset permissions.',
  details: {
    nodes: [
      // Program Node 1
      {
        width: 56,
        height: 44,
        id: 'program1-10001',
        type: 'program',
        position: { x: 50, y: 200 },
        data: {
          label: 'Counter Program',
          item: {
            identifier: 'program1-10001',
            description: 'Manages a shared counter with increment and reset functionality.',
            programId: '11111111111111111111111111111111',
            account: [
              { id: 'account1-10001', name: 'CounterAccount', description: 'Stores counter value and initializer' },
              { id: 'system_program_account', name: 'SystemProgram', description: 'Solana’s system program' },
            ],
            instruction: [
              { id: 'instruction1-10001', name: 'InitializeCounter', description: 'Initializes the counter' },
              { id: 'instruction2-10001', name: 'IncrementCounter', description: 'Increments the counter by 1' },
              { id: 'instruction3-10001', name: 'ResetCounter', description: 'Resets the counter to zero' },
            ],
            is_public: true,
            sector: [sectorEnum.utility],
          },
        },
        selected: false,
        positionAbsolute: { x: 50, y: 200 },
      },
      // Account Node 1
      {
        width: 80,
        height: 44,
        id: 'account1-10001',
        type: 'account',
        position: { x: 300, y: 50 }, // Top-right
        data: {
          label: 'CounterAccount',
          item: {
            id: 'account-10001',
            type: 'account',
            name: 'CounterAccount',
            description: 'Stores the counter value and initializer’s public key.',
            structure: { key: 'counter', value: 'u64' },
            ownerProgramId: 'program1-10001',
            publicKey: '11111111111111111111111111111111',
            category: ['state'],
            is_mutable: true,
            is_signer: false,
            is_writable: true,
            initialized_by: ['initializer'],
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
        position: { x: 300, y: 150 }, // Second from top-right
        data: {
          label: 'InitializeCounter',
          item: {
            description: "Initializes a new counter account with an initial value of zero.",
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
            error_handling: [
              "Return an error if the initializer's public key is invalid.",
              "Return an error if account allocation fails due to insufficient lamports.",
              "Return an error if the CounterAccount already exists."
            ]
          },
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
        position: { x: 300, y: 250 }, // Third from top-right
        data: {
          label: 'IncrementCounter',
          item: {
            description: "Increments the counter value by one in the specified CounterAccount.",
            programId: ['program1-10001'],
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
            error_handling: [
              "Return an error if the CounterAccount does not exist.",
              "Return an error if the user is not authorized to increment the counter.",
              "Return an error if the CounterAccount is not writable.",
              "Return an error if there is an arithmetic overflow when incrementing the counter."
            ]
          },
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
        position: { x: 300, y: 350 }, // Bottom-right
        data: {
          label: 'ResetCounter',
          item: {
            description: "Resets the counter value to zero for a specified CounterAccount.",
            programId: ['program1-10001'],
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
            error_handling: [
              "Return an error if the CounterAccount does not exist.",
              "Return an error if the initializer is not authorized to reset the counter.",
              "Return an error if the CounterAccount is not writable.",
              "Return an error if an unexpected failure occurs when logging the reset operation."
            ]
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 350 },
      }
    ],
    edges: [
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