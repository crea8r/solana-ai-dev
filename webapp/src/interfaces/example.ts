import { airdropProgramProject } from "../data/examples/airdropProject";
import { auctionProgramProject } from "../data/examples/auctionProject";
import { counterProject } from "../data/examples/counterProject";
import { crowdfundingProgramProject } from "../data/examples/crowdfundingProject";
import { didVerificationProgramProject } from "../data/examples/didVerificationProject";
import { lendingProgramProject } from "../data/examples/lendingProject";
import { loanProgramProject } from "../data/examples/loanProject";
import { nftMarketplaceProject } from "../data/examples/nftMarketplaceProject";
import { stakingProgramProject } from "../data/examples/stakingProject";
import { transferProject } from "../data/examples/transferProject";
import { vestingProgramProject } from "../data/examples/vestingProject";
import { votingProject } from "../data/examples/votingProject";
import { Project } from "./project";

export const predefinedProjects: Record<string, Project> = {
  Counter: counterProject,
  Voting: votingProject,
  Transfer: transferProject,
  Loan: loanProgramProject,
  NFTMarketplace: nftMarketplaceProject,
  Staking: stakingProgramProject,
  Airdrop: airdropProgramProject, 
  Auction: auctionProgramProject,
  Crowdfunding: crowdfundingProgramProject,
  Vesting: vestingProgramProject,
  DIDVerification: didVerificationProgramProject,
  Lending: lendingProgramProject,
};  

export interface ProjectExample {
    id: string;
    name: string;
    description: string;
    details: ProjectDetails;
  }

  export interface ProjectDetails {
    nodes: ProjectNode[];
    edges: ProjectEdge[];
  }

  export interface ProjectNode {
    id: string;
    type: 'program' | 'instruction' | 'account';
    position: { x: number; y: number };
    data: NodeData;
  }

  export interface NodeData {
    item: ProgramItem | InstructionItem | AccountItem;
    localValues?: {
      ownerProgramId?: string;
    };
  }

  export interface ProgramItem {
    type: 'program';
    name: string;
    description: string;
  }
  
  export interface InstructionItem {
    type: 'instruction';
    name: string;
    description: string;
    parameters: Parameter[];
    steps: string[];
  }

  export interface AccountItem {
    type: 'account';
    name: string;
    description: string;
    fields: Field[];
  }
  
  export interface Parameter {
    name: string;
    type: string;
    description: string;
  }

  export interface Field {
    name: string;
    type: string;
    description: string;
  }
  
  export interface ProjectEdge {
    id: string;
    source: string;
    target: string;
    type: string;
  }