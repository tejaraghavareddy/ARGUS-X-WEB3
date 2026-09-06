export interface IssuerInfo {
  address: string;
  name: string;
  organization: string;
  website: string;
  isWhitelisted: boolean;
  dateAdded: string;
  badge: string;
}

export interface CertificateMetadata {
  studentName: string;
  studentAddress: string;
  courseName: string;
  institution: string;
  issueDate: string;
  expirationDate: string | null;
  credentialId: string;
  grade?: string;
  skills: string[];
  issuerAddress: string;
  description: string;
  certificateImage?: string;
  ipfsHash: string;
  ipfsMetadataUri: string;
  attributes: Array<{ trait_type: string; value: string }>;
}

export interface OnChainCertificate {
  tokenId: number;
  owner: string;
  issuer: string;
  tokenURI: string;
  ipfsHash: string;
  isLocked: boolean; // EIP-5192 Soulbound standard
  mintTimestamp: number;
  blockNumber: number;
  txHash: string;
  metadata: CertificateMetadata;
}

export interface Web3Account {
  address: string;
  name: string;
  role: 'issuer' | 'student' | 'unauthorized' | 'owner';
  institution?: string;
  balanceEth: string;
}

export interface BlockchainTx {
  txHash: string;
  from: string;
  to: string;
  method: 'mintCertificate' | 'transferFrom' | 'setIssuerWhitelist' | 'burn';
  tokenId?: number;
  status: 'success' | 'reverted';
  revertReason?: string;
  timestamp: number;
  gasUsed: string;
  blockNumber: number;
}

export interface VerificationResult {
  isValid: boolean;
  certificate: OnChainCertificate | null;
  checks: {
    existsOnChain: boolean;
    isSoulboundLocked: boolean;
    isAuthorizedIssuer: boolean;
    ipfsMetadataVerified: boolean;
    ownerMatchesQuery: boolean;
  };
  issuerInfo?: IssuerInfo;
}
