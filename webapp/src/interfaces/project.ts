import { Node, Edge } from 'react-flow-renderer';
import { FileTreeItemType } from './file';
import { CodeFile } from '../contexts/CodeFileContext';
import { Docs } from '../contexts/DocsContext';
import { Account, Instruction } from '../types/uiTypes';
import { PdaInfo } from '../types/uiTypes';
import { UiStructure } from './ui';
import { ExtendedIdl } from './extendedIdl';


export enum sectorEnum {
  utility = 'utility',
  finance = 'finance',
  health = 'health',
  education = 'education',
  government = 'government',
  other = 'other',
}

export enum categoryEnum {
  number = 'number',
  string = 'string',
  boolean = 'boolean',
  array = 'array',
  object = 'object',
}

export enum inputSource {
  user = 'user',
  program = 'program',
  file = 'file',
  ai = 'ai',
}

export enum orderEnum {
  before = 'before',
  after = 'after',
}

export enum triggerType {
  user = 'user',
  program = 'program',
  event = 'event',
  condition = 'condition',
}

export enum intervalEnum {
  daily = 'daily',
  weekly = 'weekly',
  monthly = 'monthly',
}

export type ProjectInfoToSave = {
  id?: string;
  name: string;
  description: string;
  details: ProjectDetailsToSave;
}

export interface ProjectDetailsToSave {
  nodes: Node[];
  edges: Edge[];
  designIdl: ExtendedIdl;
  uiStructure: UiStructure;
  isAnchorInit: boolean;
  filePaths: string[];
  fileTree: FileTreeItemType;
  isCode: boolean;
  uiResults: any[];
  aiInstructions: {
    function_name: string;
    description?: string;
    params_fields: {
      name: string;
      type: string;
      default_value?: string;
      validation?: string;
    }[];
    accounts: {
      name: string;
      type: string;
      constraints: string[];
    }[];
  }[];
  sdkFunctions: { function_name: string; params: { name: string; type: string }[]; }[];
  buildStatus: boolean;
  deployStatus: boolean;
  isSdk: boolean;
  isUi: boolean;
  genUiClicked: boolean;
  idl: any;
  sdk: { fileName: string; content: string; };
  programId: string | null;
  pdas: PdaInfo[];
  keyFeatures: string[];
  userInteractions: string[];
  sectorContext: string;
  optimizationGoals: string[];
  uiHints: string[];
}

export interface ProgramContext {
  id: string;
  name: string;
  description: string;
  programId: string;
  account: string[];
  instruction: string[];
  security: string;
  sector: sectorEnum[];
}

export interface InstructionContext {
  id: string;
  name: string;
  description: string;
  programId: string[];
  category: string[];
  params: {
    name: string;
    type: string;
    input_source?: inputSource[];
    default_value?: string;
    validation?: string[];
  }[];
  logic: string[];
  output: {
    name: string;
    type: string;
    description: string;
  }[];
}

export interface AccountContext {
  id: string;
  name: string;
  description: string;
  publicKey: string;
  category: string[];
  programId: string[];
  is_mutable: boolean;
  is_signer: boolean;
  is_writable: boolean;
  initialized_by?: string[];
  structure: {
    key: string;
    value: string;
  };
}

export interface ProjectDetails {
  nodes: Node[];
  edges: Edge[];
  designIdl: ExtendedIdl;
  uiStructure: UiStructure;
  files: FileTreeItemType;
  codes: CodeFile[];
  docs: Docs[];
  isAnchorInit: boolean;
  isCode: boolean;
  filePaths: { name: string; path: string }[];
  fileTree: FileTreeItemType;
  stateContent: string | undefined;
  uiResults: any[];
  aiInstructions: {
    function_name: string;
    description?: string;
    params_fields: {
      name: string;
      type: string;
      default_value?: string;
      validation?: string;
    }[];
    accounts: {
      name: string;
      type: string;
      constraints: string[];
    }[];
  }[];
  sdkFunctions: { function_name: string; params: { name: string; type: string }[]; }[];
  buildStatus: boolean;
  deployStatus: boolean;
  isSdk: boolean;
  isUi: boolean;
  genUiClicked: boolean;
  idl: any;
  sdk: { fileName: string; content: string; };
  programId: string | null;
  pdas: PdaInfo[];
  keyFeatures: string[];
  userInteractions: string[];
  sectorContext: string;
  optimizationGoals: string[];
  uiHints: string[];
}

export interface Project {
  id: string;
  rootPath: string;
  name: string;
  description: string;
  details: ProjectDetails;
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
  