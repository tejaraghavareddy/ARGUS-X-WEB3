import {
  BlockchainTx,
  CertificateMetadata,
  IssuerInfo,
  OnChainCertificate,
  VerificationResult,
  Web3Account,
} from '../types';
import { CONTRACT_ADDRESS } from '../contracts/contractData';

const STORAGE_KEYS = {
  CERTIFICATES: 'soulbound_certs_list_v2',
  ISSUERS: 'soulbound_issuers_list_v2',
  TRANSACTIONS: 'soulbound_txs_list_v2',
  CURRENT_ACCOUNT: 'soulbound_curr_acc_v2',
  BLOCK_NUMBER: 'soulbound_block_num_v2',
};

// Initial Seed Issuers
export const SEED_ISSUERS: Record<string, IssuerInfo> = {
  '0x89205A3E3b2A69De6Dbf7f01ED13B2108B2c43e7': {
    address: '0x89205A3E3b2A69De6Dbf7f01ED13B2108B2c43e7',
    name: 'MIT School of Computing',
    organization: 'Massachusetts Institute of Technology',
    website: 'https://computing.mit.edu',
    isWhitelisted: true,
    dateAdded: '2025-01-15',
    badge: '🏛️',
  },
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8': {
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    name: 'Stanford Center for Blockchain',
    organization: 'Stanford University',
    website: 'https://cbr.stanford.edu',
    isWhitelisted: true,
    dateAdded: '2025-02-01',
    badge: '🌲',
  },
  '0x324469d9E11172B7A45B26Db9E0AC5466A96E543': {
    address: '0x324469d9E11172B7A45B26Db9E0AC5466A96E543',
    name: 'Ethereum Foundation Academy',
    organization: 'Ethereum Fellowship',
    website: 'https://ethereum.org',
    isWhitelisted: true,
    dateAdded: '2025-03-10',
    badge: '💎',
  },
};

// Available Accounts for quick role switching and testing
export const DEMO_ACCOUNTS: Web3Account[] = [
  {
    address: '0x89205A3E3b2A69De6Dbf7f01ED13B2108B2c43e7',
    name: 'Dr. Sarah Connor (MIT Computing)',
    role: 'issuer',
    institution: 'MIT School of Computing',
    balanceEth: '4.85 ETH',
  },
  {
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    name: 'Prof. David Wu (Stanford Center)',
    role: 'issuer',
    institution: 'Stanford University',
    balanceEth: '3.20 ETH',
  },
  {
    address: '0x19aD784F392B602c11456a1bC698f1fF363768D3',
    name: 'Protocol Governance Admin',
    role: 'owner',
    institution: 'Soulbound Protocol Contract Owner',
    balanceEth: '18.50 ETH',
  },
  {
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    name: 'Elena Rostova (Student)',
    role: 'student',
    balanceEth: '0.45 ETH',
  },
  {
    address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    name: 'Marcus Vance (Student)',
    role: 'student',
    balanceEth: '0.12 ETH',
  },
  {
    address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    name: 'Unauthorized Guest Wallet',
    role: 'unauthorized',
    balanceEth: '0.05 ETH',
  },
];

// Initial Seed Certificates
export const SEED_CERTIFICATES: OnChainCertificate[] = [
  {
    tokenId: 1,
    owner: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    issuer: '0x89205A3E3b2A69De6Dbf7f01ED13B2108B2c43e7',
    tokenURI: 'ipfs://QmZtmD2qtdpUbFS43EBcqMVH21NKnqMBk6jJv4kPZ4yQd8',
    ipfsHash: 'QmZtmD2qtdpUbFS43EBcqMVH21NKnqMBk6jJv4kPZ4yQd8',
    isLocked: true,
    mintTimestamp: Date.now() - 1000 * 60 * 60 * 24 * 14, // 14 days ago
    blockNumber: 19842102,
    txHash: '0x9e8a71c50b691bf79ffec106e232770857ef5b83984e1837b0ff42c55498a4a1',
    metadata: {
      studentName: 'Elena Rostova',
      studentAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      courseName: 'Master of Science in Distributed Systems',
      institution: 'MIT School of Computing',
      issueDate: '2025-05-20',
      expirationDate: null,
      credentialId: 'MIT-DIST-2025-0981',
      grade: 'Distinction (Top 2%)',
      skills: ['Consensus Protocols', 'Raft & Paxos', 'Byzantine Fault Tolerance', 'Distributed DBs'],
      issuerAddress: '0x89205A3E3b2A69De6Dbf7f01ED13B2108B2c43e7',
      description:
        'This certifies that Elena Rostova has successfully completed all advanced requirements for the Distributed Systems engineering curriculum.',
      ipfsHash: 'QmZtmD2qtdpUbFS43EBcqMVH21NKnqMBk6jJv4kPZ4yQd8',
      ipfsMetadataUri: 'ipfs://QmZtmD2qtdpUbFS43EBcqMVH21NKnqMBk6jJv4kPZ4yQd8',
      attributes: [
        { trait_type: 'Institution', value: 'MIT School of Computing' },
        { trait_type: 'Degree Type', value: 'Master of Science' },
        { trait_type: 'Honors', value: 'Summa Cum Laude' },
        { trait_type: 'Transferability', value: 'Non-Transferable (Soulbound)' },
        { trait_type: 'Standard', value: 'ERC-5192' },
      ],
    },
  },
  {
    tokenId: 2,
    owner: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    issuer: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    tokenURI: 'ipfs://QmR9tN9eHwK7hK2M7vP8qW5bV2nZ3mC1xJ6kL8oP4qR7sT',
    ipfsHash: 'QmR9tN9eHwK7hK2M7vP8qW5bV2nZ3mC1xJ6kL8oP4qR7sT',
    isLocked: true,
    mintTimestamp: Date.now() - 1000 * 60 * 60 * 24 * 7, // 7 days ago
    blockNumber: 19848519,
    txHash: '0x4f128c61e05a8b5e2978007a51375d04ca07d2f9b1f7f9ea382436f9e0783412',
    metadata: {
      studentName: 'Elena Rostova',
      studentAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      courseName: 'Zero-Knowledge Proofs & Cryptographic Engineering',
      institution: 'Stanford Center for Blockchain',
      issueDate: '2025-06-02',
      expirationDate: null,
      credentialId: 'STAN-ZK-8842',
      grade: 'Grade: A+ (100%)',
      skills: ['zk-SNARKs', 'Circom', 'Groth16', 'Elliptic Curve Cryptography'],
      issuerAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      description:
        'Awarded for mastery of zero-knowledge circuit development, polynomial commitment schemes, and cryptographic rollup design.',
      ipfsHash: 'QmR9tN9eHwK7hK2M7vP8qW5bV2nZ3mC1xJ6kL8oP4qR7sT',
      ipfsMetadataUri: 'ipfs://QmR9tN9eHwK7hK2M7vP8qW5bV2nZ3mC1xJ6kL8oP4qR7sT',
      attributes: [
        { trait_type: 'Institution', value: 'Stanford Center for Blockchain' },
        { trait_type: 'Program', value: 'Executive Cryptography' },
        { trait_type: 'Transferability', value: 'Non-Transferable (Soulbound)' },
        { trait_type: 'Standard', value: 'ERC-5192' },
      ],
    },
  },
  {
    tokenId: 3,
    owner: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    issuer: '0x89205A3E3b2A69De6Dbf7f01ED13B2108B2c43e7',
    tokenURI: 'ipfs://QmV3xP8jM9kL1nZ7qW5bV2nC3mR9tN9eHwK7hK2M7vP8qW',
    ipfsHash: 'QmV3xP8jM9kL1nZ7qW5bV2nC3mR9tN9eHwK7hK2M7vP8qW',
    isLocked: true,
    mintTimestamp: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
    blockNumber: 19853901,
    txHash: '0x18d9ef6731998491c9258ebcd67e4521098ef3247012bc54a883908ff980cae2',
    metadata: {
      studentName: 'Marcus Vance',
      studentAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      courseName: 'Applied Smart Contract Security & Formal Verification',
      institution: 'MIT School of Computing',
      issueDate: '2025-06-18',
      expirationDate: null,
      credentialId: 'MIT-AUDIT-4491',
      grade: 'Honors',
      skills: ['Solidity Invariants', 'EVM Bytecode Analysis', 'Certora', 'Fuzzing'],
      issuerAddress: '0x89205A3E3b2A69De6Dbf7f01ED13B2108B2c43e7',
      description:
        'Awarded to Marcus Vance upon successfully passing comprehensive smart contract auditing and invariant testing evaluations.',
      ipfsHash: 'QmV3xP8jM9kL1nZ7qW5bV2nC3mR9tN9eHwK7hK2M7vP8qW',
      ipfsMetadataUri: 'ipfs://QmV3xP8jM9kL1nZ7qW5bV2nC3mR9tN9eHwK7hK2M7vP8qW',
      attributes: [
        { trait_type: 'Institution', value: 'MIT School of Computing' },
        { trait_type: 'Transferability', value: 'Non-Transferable (Soulbound)' },
        { trait_type: 'Standard', value: 'ERC-5192' },
      ],
    },
  },
];

class BlockchainSimulator {
  private certificates: OnChainCertificate[] = [];
  private issuers: Record<string, IssuerInfo> = {};
  private transactions: BlockchainTx[] = [];
  private currentAccount: Web3Account = DEMO_ACCOUNTS[0];
  private currentBlock = 19856720;
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const storedCerts = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
      this.certificates = storedCerts ? JSON.parse(storedCerts) : [...SEED_CERTIFICATES];

      const storedIssuers = localStorage.getItem(STORAGE_KEYS.ISSUERS);
      this.issuers = storedIssuers ? JSON.parse(storedIssuers) : { ...SEED_ISSUERS };

      const storedTxs = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      this.transactions = storedTxs ? JSON.parse(storedTxs) : [];

      const storedAcc = localStorage.getItem(STORAGE_KEYS.CURRENT_ACCOUNT);
      if (storedAcc) {
        const parsed = JSON.parse(storedAcc);
        const match = DEMO_ACCOUNTS.find((a) => a.address.toLowerCase() === parsed.address.toLowerCase());
        this.currentAccount = match || parsed;
      } else {
        this.currentAccount = DEMO_ACCOUNTS[0];
      }

      const storedBlock = localStorage.getItem(STORAGE_KEYS.BLOCK_NUMBER);
      if (storedBlock) {
        this.currentBlock = parseInt(storedBlock, 10);
      }
    } catch (e) {
      console.error('Failed to load blockchain state', e);
      this.certificates = [...SEED_CERTIFICATES];
      this.issuers = { ...SEED_ISSUERS };
      this.currentAccount = DEMO_ACCOUNTS[0];
    }
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(this.certificates));
      localStorage.setItem(STORAGE_KEYS.ISSUERS, JSON.stringify(this.issuers));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
      localStorage.setItem(STORAGE_KEYS.CURRENT_ACCOUNT, JSON.stringify(this.currentAccount));
      localStorage.setItem(STORAGE_KEYS.BLOCK_NUMBER, this.currentBlock.toString());
    } catch (e) {
      console.warn('Failed to save state to localStorage', e);
    }
    this.notifyListeners();
  }

  public subscribe(cb: () => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb());
  }

  public getCurrentAccount(): Web3Account {
    return this.currentAccount;
  }

  public switchAccount(account: Web3Account) {
    this.currentAccount = account;
    this.saveState();
  }

  public getBlockNumber(): number {
    return this.currentBlock;
  }

  public getCertificates(): OnChainCertificate[] {
    return [...this.certificates];
  }

  public getIssuers(): Record<string, IssuerInfo> {
    return { ...this.issuers };
  }

  public getTransactions(): BlockchainTx[] {
    return [...this.transactions];
  }

  public isIssuerAuthorized(address: string): boolean {
    const norm = address.toLowerCase();
    const issuer = Object.values(this.issuers).find((i) => i.address.toLowerCase() === norm);
    return !!issuer && issuer.isWhitelisted;
  }

  public getIssuerInfo(address: string): IssuerInfo | undefined {
    const norm = address.toLowerCase();
    return Object.values(this.issuers).find((i) => i.address.toLowerCase() === norm);
  }

  /**
   * Check if caller has permission to mint
   */
  public canCallerMint(callerAddress: string = this.currentAccount.address): boolean {
    if (callerAddress.toLowerCase() === DEMO_ACCOUNTS[2].address.toLowerCase()) {
      return true; // Protocol owner can mint
    }
    return this.isIssuerAuthorized(callerAddress);
  }

  /**
   * On-chain Minting function
   * Reverts if caller is not an authorized issuer
   */
  public async mintCertificate(params: {
    studentAddress: string;
    ipfsHash: string;
    metadata: CertificateMetadata;
  }): Promise<{ certificate: OnChainCertificate; tx: BlockchainTx }> {
    const caller = this.currentAccount.address;

    // Simulate smart contract modifier: onlyAuthorizedIssuer
    if (!this.canCallerMint(caller)) {
      const failedTx: BlockchainTx = {
        txHash: this.generateTxHash(),
        from: caller,
        to: CONTRACT_ADDRESS,
        method: 'mintCertificate',
        status: 'reverted',
        revertReason: 'SoulboundCert: Caller is not an authorized issuer',
        timestamp: Date.now(),
        gasUsed: '28,450',
        blockNumber: this.currentBlock + 1,
      };
      this.transactions.unshift(failedTx);
      this.saveState();
      throw new Error('Transaction Reverted: SoulboundCert: Caller is not an authorized issuer.');
    }

    if (!params.studentAddress.startsWith('0x') || params.studentAddress.length !== 42) {
      throw new Error('Invalid Ethereum recipient address format.');
    }

    // Advance block
    this.currentBlock += 1;
    const nextTokenId =
      this.certificates.length > 0 ? Math.max(...this.certificates.map((c) => c.tokenId)) + 1 : 1;

    const txHash = this.generateTxHash();

    const newCertificate: OnChainCertificate = {
      tokenId: nextTokenId,
      owner: params.studentAddress,
      issuer: caller,
      tokenURI: `ipfs://${params.ipfsHash}`,
      ipfsHash: params.ipfsHash,
      isLocked: true, // ERC-5192 standard: locked forever
      mintTimestamp: Date.now(),
      blockNumber: this.currentBlock,
      txHash: txHash,
      metadata: params.metadata,
    };

    const successTx: BlockchainTx = {
      txHash: txHash,
      from: caller,
      to: CONTRACT_ADDRESS,
      method: 'mintCertificate',
      tokenId: nextTokenId,
      status: 'success',
      timestamp: Date.now(),
      gasUsed: '142,380',
      blockNumber: this.currentBlock,
    };

    this.certificates.unshift(newCertificate);
    this.transactions.unshift(successTx);
    this.saveState();

    return { certificate: newCertificate, tx: successTx };
  }

  /**
   * Attempt to transfer Soulbound token (MUST REVERT)
   * Proves on-chain non-transferability according to EIP-5192 / ERC-721
   */
  public async attemptTransfer(
    tokenId: number,
    toAddress: string
  ): Promise<{ reverted: true; reason: string; tx: BlockchainTx }> {
    const cert = this.certificates.find((c) => c.tokenId === tokenId);
    if (!cert) {
      throw new Error(`Token ID #${tokenId} does not exist on-chain.`);
    }

    const caller = this.currentAccount.address;
    this.currentBlock += 1;
    const txHash = this.generateTxHash();

    // The Soulbound smart contract explicitly blocks transfers:
    // require(from == address(0) || to == address(0), "Soulbound: Token transfers are prohibited.");
    const revertReason =
      'EVM Revert: Soulbound: Token transfers are prohibited. Certificate is non-transferable (EIP-5192).';

    const failedTx: BlockchainTx = {
      txHash: txHash,
      from: caller,
      to: CONTRACT_ADDRESS,
      method: 'transferFrom',
      tokenId: tokenId,
      status: 'reverted',
      revertReason: revertReason,
      timestamp: Date.now(),
      gasUsed: '31,210',
      blockNumber: this.currentBlock,
    };

    this.transactions.unshift(failedTx);
    this.saveState();

    return {
      reverted: true,
      reason: revertReason,
      tx: failedTx,
    };
  }

  /**
   * Whitelist or revoke an issuer (Only contract owner)
   */
  public setIssuerStatus(
    address: string,
    status: boolean,
    name: string,
    organization: string,
    website: string
  ): BlockchainTx {
    const caller = this.currentAccount.address;
    this.currentBlock += 1;
    const txHash = this.generateTxHash();

    const normalized = address.toLowerCase();
    const existing = Object.keys(this.issuers).find((k) => k.toLowerCase() === normalized);

    if (existing) {
      this.issuers[existing] = {
        ...this.issuers[existing],
        isWhitelisted: status,
        name: name || this.issuers[existing].name,
        organization: organization || this.issuers[existing].organization,
        website: website || this.issuers[existing].website,
      };
    } else {
      this.issuers[address] = {
        address,
        name: name || 'Institutional Issuer',
        organization: organization || 'Accredited Organization',
        website: website || 'https://example.edu',
        isWhitelisted: status,
        dateAdded: new Date().toISOString().split('T')[0],
        badge: '🎓',
      };
    }

    const tx: BlockchainTx = {
      txHash,
      from: caller,
      to: CONTRACT_ADDRESS,
      method: 'setIssuerWhitelist',
      status: 'success',
      timestamp: Date.now(),
      gasUsed: '46,120',
      blockNumber: this.currentBlock,
    };

    this.transactions.unshift(tx);
    this.saveState();
    return tx;
  }

  /**
   * Verify a certificate by Token ID or Student Wallet Address
   */
  public verify(query: string): VerificationResult[] {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const isTokenId = /^\d+$/.test(trimmed);

    let matchingCerts: OnChainCertificate[] = [];

    if (isTokenId) {
      const id = parseInt(trimmed, 10);
      const found = this.certificates.find((c) => c.tokenId === id);
      if (found) matchingCerts = [found];
    } else {
      const normAddress = trimmed.toLowerCase();
      matchingCerts = this.certificates.filter(
        (c) => c.owner.toLowerCase() === normAddress || c.metadata.credentialId.toLowerCase() === normAddress
      );
    }

    return matchingCerts.map((cert) => {
      const issuer = this.getIssuerInfo(cert.issuer);
      const isAuthorized = this.isIssuerAuthorized(cert.issuer);
      const isSoulboundLocked = cert.isLocked === true;
      const ipfsMetadataVerified = !!cert.ipfsHash && cert.tokenURI.includes(cert.ipfsHash);
      const existsOnChain = true;

      const isValid = isAuthorized && isSoulboundLocked && ipfsMetadataVerified && existsOnChain;

      return {
        isValid,
        certificate: cert,
        checks: {
          existsOnChain,
          isSoulboundLocked,
          isAuthorizedIssuer: isAuthorized,
          ipfsMetadataVerified,
          ownerMatchesQuery: true,
        },
        issuerInfo: issuer,
      };
    });
  }

  /**
   * Reset to initial state
   */
  public resetToDefault() {
    this.certificates = [...SEED_CERTIFICATES];
    this.issuers = { ...SEED_ISSUERS };
    this.transactions = [];
    this.currentAccount = DEMO_ACCOUNTS[0];
    this.currentBlock = 19856720;
    this.saveState();
  }

  private generateTxHash(): string {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  }
}

export const blockchain = new BlockchainSimulator();
