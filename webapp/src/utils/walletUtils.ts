import { airdropTokens, getWalletInfo } from "../api/wallet";
import { WalletInfo } from "../interfaces/wallet";

export const handleBalanceRefresh = async (
    userId: string, 
    setWalletInfo: (value: WalletInfo) => void, 
    setIsLoading: (value: boolean) => void
) => {
    try {
      setIsLoading(true);
      const info = await getWalletInfo(userId);
      setWalletInfo(info);
    } catch (error) {
      console.error("Failed to refresh wallet balance:", error);
    } finally {
      setIsLoading(false);
    }
  };

export const handleAirdrop = async (
    isLoading: boolean,
    setIsLoading: (value: boolean) => void,
    publicKey: string, 
    onBalanceRefresh: () => void, 
    onClose: () => void
) => {
    try {
        setIsLoading(true);
        await airdropTokens(publicKey, 2); 
        await onBalanceRefresh(); 
    } catch (error) {
      console.error("Airdrop failed:", error);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };