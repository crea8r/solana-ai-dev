import { counterProject } from "../data/examples/counterProject";
import { votingProject } from "../data/examples/votingProject";
import { crowdfundingProject } from "../data/examples/crowdfundingProject";
import { loyaltyRewardsProject } from "../data/examples/loyaltyRewardsProject";
import { Project } from "./project";
import { timeLockedSavingsProject } from "../data/examples/timeLockedSavingsProject";

export const predefinedProjects: Record<string, Project> = {
  Counter: counterProject,
  Voting: votingProject,
  Crowdfunding: crowdfundingProject,
  LoyaltyRewards: loyaltyRewardsProject,
  TimeLockedSavings: timeLockedSavingsProject,
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