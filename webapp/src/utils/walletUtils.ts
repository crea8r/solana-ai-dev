import { airdropTokens, getWalletInfo } from "../api/wallet";
import { WalletInfo } from "../interfaces/wallet";

export const handleBalanceRefresh = async (
    userId: string, 
    setWalletInfo: (value: WalletInfo) => void, 
    setIsBalanceRefreshing: React.Dispatch<React.SetStateAction<boolean>>
) => {
    setIsBalanceRefreshing(true);
    try {
      const info = await getWalletInfo(userId);
      setWalletInfo(info);
    } catch (error) {
      console.error("Failed to refresh wallet balance:", error);
    } finally {
      setIsBalanceRefreshing(false);
    }
  };

export const handleAirdrop = async (
  setIsAirdropLoading: (value: boolean) => void,
  publicKey: string,
  onBalanceRefresh: () => Promise<void>,
  onClose: () => void
) => {
  try {
    setIsAirdropLoading(true);
    await airdropTokens(publicKey, 5);
    await onBalanceRefresh();
  } catch (error) {
    console.error("Airdrop failed:", error);
  } finally {
    setIsAirdropLoading(false);
    onClose();
  }
};