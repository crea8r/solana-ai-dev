import { WalletInfo, WalletPrivateKeyInfo } from "../interfaces/wallet";
import { api } from "../utils/apiHelper";

export const createWallet = async (userId: string): Promise<void> => {
    try {
      await api.post('/auth/wallet/create', { params: { userId } });
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  };
  
export const getWalletInfo = async (userId: string): Promise<WalletInfo> => {
  try {
    const response = await api.get('/auth/wallet/info', {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const airdropTokens = async (publicKey: string, amount: number = 1): Promise<string> => {
  try {
    const response = await api.post('/auth/wallet/airdrop', { publicKey, amount });
    console.log(response.data.message);
    return response.data.message;
  } catch (error: any) {
    console.error('Error during token airdrop:', error.response?.data || error.message);
    throw error;
  }
};
  
  export const getPrivateKey = async (userId: string): Promise<WalletPrivateKeyInfo> => {
    try {
      const response = await api.get('/auth/wallet/private-key', {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      throw error;
  }
};
