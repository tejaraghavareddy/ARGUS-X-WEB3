export interface CertificateMetadata {
  name: string;
  description: string;
  studentName: string;
  courseName: string;
  certificateType: string;
  issueDate: string;
  issuerName: string;
  issuerAddress: string;
  image?: string;
}

export interface OnChainCertificate {
  tokenId: bigint;
  recipient: string;
  issuer: string;
  metadataURI: string;
  issuedAt: bigint;
  revoked: boolean;
}

export interface CertificateRecord extends OnChainCertificate {
  metadata?: CertificateMetadata | null;
}

export interface IssuerStats {
  issued: bigint;
  revoked: bigint;
  active: bigint;
}

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
}

export interface IpfsUploadResult {
  cid: string;
  uri: string;
  gatewayUrl: string;
}

export type MintProgress =
  | "idle"
  | "preparing"
  | "uploading"
  | "awaiting-wallet"
  | "submitting"
  | "confirming"
  | "success"
  | "error";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  description?: string;
}

export interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
  disconnect?: () => Promise<void> | void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
    Buffer?: typeof import("buffer").Buffer;
  }
}
