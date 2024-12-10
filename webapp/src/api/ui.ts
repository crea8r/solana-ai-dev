import { api } from '../utils/apiHelper';

export const uiApi = {
  executeSdkInstruction: async (userId: string, projectId: string, instructionName: string, params: any) => {
    const response = await api.post('/ui/execute-instruction', { userId, projectId, instructionName, params });
    return response.data;
  },
  compileTsFile: async (projectId: string, userId: string) => {
    const response = await api.post('/ui/compile-ts-file', { projectId, userId });
    return response.data;
  },
};
