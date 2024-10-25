import { Node, Edge } from 'react-flow-renderer';
import { FileTreeItemType } from '../components/FileTree';
import { CodeFile } from '../contexts/CodeFileContext';
import { Docs } from '../contexts/DocsContext';

export interface ProjectDetails {
  nodes: Node[];
  edges: Edge[];
  files: FileTreeItemType;
  codes: CodeFile[];
  docs: Docs[];
  isAnchorInit: boolean;
  isCode: boolean;
}

export interface Project {
  id: string;
  rootPath: string;
  name: string;
  description: string;
  details: ProjectDetails;
}


export interface ProjectListItem {
  id: string;
  name: string;
  description: string;
  created_at: string;
  last_updated: string;
  root_path: string;
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

export type ProjectInfoToSave = {
  id?: string;
  name: string;
  description: string;
  details: ProjectDetail;
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
