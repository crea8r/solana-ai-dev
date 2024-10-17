export interface ProjectListItem {
  id: string;
  name: string;
  description: string;
  created_at: string;
  last_updated: string;
}

export interface ProjectDetail {
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

export interface ProjectInfoToSave {
  id?: string;
  name: string;
  description: string;
  details: any;
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
  project: ProjectListItem;
}
