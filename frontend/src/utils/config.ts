export const APP_CONFIG = {
  contractAddress: (import.meta.env.VITE_CONTRACT_ADDRESS || "").trim(),
  chainId: Number(import.meta.env.VITE_CHAIN_ID || 11155111),
  networkName: import.meta.env.VITE_NETWORK_NAME || "Sepolia",
  rpcUrl: import.meta.env.VITE_RPC_URL || "",
  explorer: import.meta.env.VITE_BLOCK_EXPLORER || "https://sepolia.etherscan.io",
  ipfsGateway:
    import.meta.env.VITE_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs/",
  walletConnectProjectId: (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "").trim(),
};

export const SEPOLIA_CHAIN_ID = 11155111;
export const HARDHAT_CHAIN_ID = 31337;

export const NETWORK_PARAMS: Record<
  number,
  {
    chainId: string;
    chainName: string;
    nativeCurrency: { name: string; symbol: string; decimals: number };
    rpcUrls: string[];
    blockExplorerUrls: string[];
  }
> = {
  [SEPOLIA_CHAIN_ID]: {
    chainId: "0xaa36a7",
    chainName: "Sepolia",
    nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: [APP_CONFIG.rpcUrl || "https://rpc.sepolia.org"],
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },
};

export function isContractConfigured(): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(APP_CONFIG.contractAddress);
}

export function requiredNetworkLabel(): string {
  return APP_CONFIG.chainId === HARDHAT_CHAIN_ID
    ? "Hardhat Local"
    : APP_CONFIG.networkName;
}
