import { FileTreeItemType } from '../../interfaces/file';
import { CodeFile } from '../../contexts/CodeFileContext';
import { Project, ProjectDetails } from '../../interfaces/project';

const auctionProgramProject: Project = {
  id: '',
  rootPath: '',
  name: 'Auction Program',
  description: 'A Solana program that allows users to place bids on an auction item, with an auction end time, and the highest bidder wins the auction.',
  aiModel: '',
  apiKey: '',
  walletPublicKey: '',
  details: {
    nodes: [
      {
        width: 56,
        height: 44,
        id: 'program-67890',
        type: 'program',
        position: { x: 50, y: 200 },
        data: {
          label: 'Auction Program',
          item: {
            id: 'program-67890',
            type: 'program',
            name: 'Auction Program',
            description: 'Allows users to place bids for auction items. The highest bid wins when the auction ends.',
          },
        },
        selected: false,
        positionAbsolute: { x: 50, y: 200 },
      },
      {
        width: 80,
        height: 44,
        id: 'account-67891',
        type: 'account',
        position: { x: 300, y: 50 }, // Top-right
        data: {
          label: 'AuctionAccount',
          item: {
            id: 'account-67891',
            type: 'account',
            name: 'AuctionAccount',
            description: 'Stores details of the auction including the current highest bid, auction end time, and the highest bidder.',
            json: '{auction_item: String, highest_bid: u64, highest_bidder: PubKey, auction_end: i64, auction_status: string}',
            ownerProgramId: 'program-67890',
          },
        },
        selected: false,
        positionAbsolute: { x: 300, y: 50 },
      },
      {
        width: 66,
        height: 44,
        id: 'instruction-67892',
        type: 'instruction',
        position: { x: 300, y: 150 }, // Second from top-right
        data: {
          label: 'PlaceBid',
          item: {
            id: 'instruction-67892',
            type: 'instruction',
            name: 'PlaceBid',
            description: 'Allows a user to place a bid on an auction item. Only the highest bid is accepted.',
            parameters: 'auction_account: AccountInfo, bid_amount: u64, bidder: PubKey',
            aiInstruction: 'Check if the bid amount is greater than the current highest bid, update the highest bid and bidder if the bid is higher, and record the bidder’s information.',
            ownerProgramId: 'program-67890',
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 150 },
      },
      {
        width: 66,
        height: 44,
        id: 'instruction-67893',
        type: 'instruction',
        position: { x: 300, y: 250 }, // Third from top-right
        data: {
          label: 'EndAuction',
          item: {
            id: 'instruction-67893',
            type: 'instruction',
            name: 'EndAuction',
            description: 'Ends the auction and transfers the auction item to the highest bidder.',
            parameters: 'auction_account: AccountInfo',
            aiInstruction: 'Verify the auction has ended, transfer the auction item to the highest bidder, and mark the auction as "completed."',
            ownerProgramId: 'program-67890',
          },
        },
        selected: true,
        positionAbsolute: { x: 300, y: 250 },
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
        target: 'instruction-67892',
        type: 'solana',
        animated: false,
        style: { stroke: '#ff0072', cursor: 'pointer', strokeWidth: 2 },
      },
      {
        id: 'edge-3',
        source: 'program-67890',
        target: 'instruction-67893',
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
    genUiClicked: false,
    idl: { fileName: '', content: '', parsed: { instructions: [], accounts: [] } },
    sdk: { fileName: '', content: '' },
    walletPublicKey: '',
    walletSecretKey: '',
    programId: null,
    pdas: [],
  } as ProjectDetails,
};

export { auctionProgramProject };