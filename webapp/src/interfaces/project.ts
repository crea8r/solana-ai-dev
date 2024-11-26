import { Node, Edge } from 'react-flow-renderer';
import { FileTreeItemType } from './file';
import { CodeFile } from '../contexts/CodeFileContext';
import { Docs } from '../contexts/DocsContext';
import { counterProject } from '../data/examples/counterProject';
import { votingProject } from '../data/examples/votingProject';
import { crowdfundingProject } from '../data/examples/crowdfundingProject';
import { loyaltyRewardsProject } from '../data/examples/loyaltyRewardsProject';

export type ProjectInfoToSave = {
  id?: string;
  name: string;
  description: string;
  details: ProjectDetailsToSave;
  aiModel: string;
  apiKey: string;
  walletPublicKey: string;
  aiInstructions: {
    function_name: string;
    params_fields: {
      name: string;
      type: string;
      default_value?: string;
      validation?: string;
    }[];
    accounts: {
      name: string;
      type: string;
      attributes: string[];
    }[];
  }[];
}

export interface ProjectDetailsToSave {
  nodes: Node[];
  edges: Edge[];
  isAnchorInit: boolean;
  aiFilePaths: string[];
  aiStructure: string;
  isCode: boolean;
}

export interface ProjectDetails {
  nodes: Node[];
  edges: Edge[];
  files: FileTreeItemType;
  codes: CodeFile[];
  docs: Docs[];
  isAnchorInit: boolean;
  isCode: boolean;
  aiFilePaths: string[];
  aiStructure: string;
  stateContent: string | undefined;
}

export interface Project {
  id: string;
  rootPath: string;
  name: string;
  description: string;
  details: ProjectDetails;
  aiModel: string;
  apiKey: string;
  walletPublicKey: string;
  aiInstructions: {
    function_name: string;
    params_fields: {
      name: string;
      type: string;
      default_value?: string;
      validation?: string;
    }[];
    accounts: {
      name: string;
      type: string;
      attributes: string[];
    }[];
  }[];
}

export type ProjectExample = {
  name: string;
  description: string;
  project: Project;
}

export type ProjectDetail = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  org_id: string;
  root_path: string;
  last_updated: string;
  details: any;
  recentTasks?: any[];
  fileTree?: any;
}


export interface ProjectListItem {
  id: string;
  name: string;
  description: string;
  created_at: string;
  last_updated: string;
  root_path: string;
}


export interface ListProjectsResponse {
  data: ProjectListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SaveProjectResponse {
  message: string;
  projectId: string;
  rootPath: string;
}


interface Program {
  id: string;
  label: string;
  localValues: {
    name: string;
    description?: string;
  };
}
  