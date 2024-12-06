import { api } from '../utils/apiHelper';

export const uiApi = {
  executeSdkInstruction: async (projectId: string, instructionName: string, params: any) => {
    const response = await api.post('/ui/execute-instruction', { projectId, instructionName, params });
    return response.data;
  },
  compileTsFile: async (projectId: string, userId: string) => {
    const response = await api.post('/ui/compile-ts-file', { projectId, userId });
    return response.data;
  },
};
