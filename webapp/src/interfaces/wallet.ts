export interface WalletPrivateKeyInfo {
  publicKey: string;
  privateKey: string;
  creationDate: string;
}
  
export interface WalletInfo {
  publicKey: string;
  balance: number;
  creationDate: string;
}