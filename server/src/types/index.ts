export interface JwtPayload {
  id: string;
  org_id: string;
  name: string;
  org_name: string;
  wallet_created: boolean;
  private_key_viewed: boolean;
}

// export interface Organisation {
//   id: string;
//   name: string;
//   description?: string;
//   created_at: Date;
// }

// export interface Creator {
//   id: string;
//   username: string;
//   profile: any;
//   org_id: string;
//   role: 'member' | 'admin';
// }

// export interface SolanaProject {
//   id: string;
//   name: string;
//   description?: string;
//   org_id: string;
//   root_path: string;
//   details: any;
//   last_updated: Date;
//   created_at: Date;
// }

// export interface ProjectFile {
//   id: string;
//   name: string;
//   file_path: string;
//   file_size: number;
//   file_hash: string;
//   last_updated: Date;
//   created_at: Date;
// }

// export interface Task {
//   id: string;
//   name: string;
//   created_at: Date;
//   creator_id: string;
//   status: 'queued' | 'doing' | 'finished';
// }

export interface TaskQueryParams {
  page?: number;
  limit?: number;
  status?: 'queued' | 'doing' | 'finished';
  projectId?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WalletInfo {
  publicKey: string;
  balance: number;
  creationDate?: string;
}
