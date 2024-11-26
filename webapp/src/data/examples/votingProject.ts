import { FileTreeItemType } from '../../interfaces/file';
import { CodeFile } from '../../contexts/CodeFileContext';
import { Project, ProjectDetails } from '../../interfaces/project';

const votingProject: Project = {
  id: '',
  rootPath: '',
  name: 'Voting Program',
  description: 'A Solana program that allows users to vote on a proposal. The program stores the votes and tracks which users have voted.',
  aiModel: '',
  apiKey: '',
  walletPublicKey: '',
  aiInstructions: [],
  details: {
    nodes: [
      {
        width: 56,
        height: 44,
        id: 'program-56789',
        type: 'program',
        position: { x: 50, y: 200 },
        data: {
          label: 'Voting Program',
          item: {
            id: 'program-56789',
            type: 'program',
            name: 'Voting Program',
            description: 'Allows users to vote on a proposal with options for Yes and No.',
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
        position: { x: 300, y: 50 }, // Top-right
        data: {
          label: 'VotingAccount',
          item: {
            id: 'account-56790',
            type: 'account',
            name: 'VotingAccount',
            description: 'Stores voting data including proposal, votes, and list of voters.',
            json: '{initializer: PubKey, proposal: string, yes_votes: u32, no_votes: u32, voters: Vec<Pubkey>, is_closed: bool}',
            ownerProgramId: 'program-56789',
          },
        },
        selected: false,
        positionAbsolute: { x: 300, y: 50 },
      },
      {
        width: 66,
        height: 44,
        id: 'instruction-56791',
        type: 'instruction',
        position: { x: 300, y: 150 }, // Second from top-right
        data: {
          label: 'InitializeVoting',
          item: {
            id: 'instruction-56791',
            type: 'instruction',
            name: 'InitializeVoting',
            description: 'Initializes a new voting session for a proposal.',
            parameters: 'initializer: PubKey, proposal: String',
            aiInstruction: 'Verify initializer, create a VotingAccount, set vote counts to zero, and store the proposal description.',
            ownerProgramId: 'program-56789',
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 150 },
      },
      {
        width: 66,
        height: 44,
        id: 'instruction-56792',
        type: 'instruction',
        position: { x: 300, y: 250 }, // Third from top-right
        data: {
          label: 'CastVote',
          item: {
            id: 'instruction-56792',
            type: 'instruction',
            name: 'CastVote',
            description: 'Allows a user to cast a vote (Yes or No) on the proposal.',
            parameters: 'voting_account: AccountInfo, voter: PubKey, vote: u8',
            aiInstruction: 'Verify the user has not voted, check the vote value, update the vote count, and record the voter.',
            ownerProgramId: 'program-56789',
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 250 },
      },
      {
        width: 66,
        height: 44,
        id: 'instruction-56793',
        type: 'instruction',
        position: { x: 300, y: 350 }, // Bottom-right
        data: {
          label: 'CloseVoting',
          item: {
            id: 'instruction-56793',
            type: 'instruction',
            name: 'CloseVoting',
            description: 'Ends the voting session and prevents further votes.',
            parameters: 'voting_account: AccountInfo, initializer: PubKey',
            aiInstruction: 'Verify initializer and mark the voting session as closed.',
            ownerProgramId: 'program-56789',
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 350 },
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
        target: 'instruction-56791',
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

export { votingProject };
