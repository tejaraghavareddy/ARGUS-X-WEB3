import { BrowserProvider, Contract, JsonRpcProvider, isAddress } from "ethers";
import artifact from "../contracts/SoulboundCertificate.json";
import { APP_CONFIG, isContractConfigured } from "../utils/config";
import type { IssuerStats, OnChainCertificate } from "../types";
import { getActiveProvider } from "./wallet";

function requireAddress(): string {
  if (!isContractConfigured()) {
    throw new Error(
      "Contract address is not configured. Set VITE_CONTRACT_ADDRESS in frontend/.env."
    );
  }
  return APP_CONFIG.contractAddress;
}

export function getBrowserProvider(): BrowserProvider {
  const provider = getActiveProvider() || window.ethereum;
  if (!provider) {
    throw new Error("Connect a wallet to continue.");
  }
  return new BrowserProvider(provider);
}

export function getReadProvider(): BrowserProvider | JsonRpcProvider {
  const provider = getActiveProvider() || window.ethereum;
  if (provider) {
    return new BrowserProvider(provider);
  }
  if (APP_CONFIG.rpcUrl) {
    return new JsonRpcProvider(APP_CONFIG.rpcUrl);
  }
  throw new Error("No wallet or RPC endpoint is available.");
}

export function getReadContract(
  provider?: BrowserProvider | JsonRpcProvider
): Contract {
  return new Contract(requireAddress(), artifact.abi, provider ?? getReadProvider());
}

export async function getWriteContract(): Promise<Contract> {
  const provider = getBrowserProvider();
  const signer = await provider.getSigner();
  return new Contract(requireAddress(), artifact.abi, signer);
}

function mapCertificate(raw: {
  id?: bigint;
  recipient?: string;
  issuer?: string;
  metadataURI?: string;
  issuedAt?: bigint;
  revoked?: boolean;
  0?: bigint;
  1?: string;
  2?: string;
  3?: string;
  4?: bigint;
  5?: boolean;
}): OnChainCertificate {
  return {
    tokenId: (raw.id ?? raw[0]) as bigint,
    recipient: (raw.recipient ?? raw[1]) as string,
    issuer: (raw.issuer ?? raw[2]) as string,
    metadataURI: (raw.metadataURI ?? raw[3]) as string,
    issuedAt: (raw.issuedAt ?? raw[4]) as bigint,
    revoked: Boolean(raw.revoked ?? raw[5]),
  };
}

export async function isAuthorizedIssuer(address: string): Promise<boolean> {
  if (!isAddress(address)) return false;
  const contract = getReadContract();
  return Boolean(await contract.isIssuer(address));
}

export async function getOwner(): Promise<string> {
  const contract = getReadContract();
  return String(await contract.owner());
}

export async function getIssuerStats(address: string): Promise<IssuerStats> {
  const contract = getReadContract();
  const stats = await contract.getIssuerStats(address);
  return {
    issued: stats.issued as bigint,
    revoked: stats.revoked as bigint,
    active: stats.active as bigint,
  };
}

export async function getCertificate(tokenId: bigint | number | string): Promise<OnChainCertificate> {
  const contract = getReadContract();
  const raw = await contract.getCertificate(tokenId);
  return mapCertificate(raw);
}

export async function getTokensOfIssuer(address: string): Promise<bigint[]> {
  const contract = getReadContract();
  const tokens = (await contract.tokensOfIssuer(address)) as bigint[];
  return [...tokens];
}

export async function getTokensOfOwner(address: string): Promise<bigint[]> {
  const contract = getReadContract();
  const tokens = (await contract.tokensOfOwner(address)) as bigint[];
  return [...tokens];
}

export async function mintCertificate(
  recipient: string,
  metadataURI: string,
  onSubmitted?: () => void
): Promise<{ tokenId: bigint; hash: string }> {
  if (!isAddress(recipient)) {
    throw new Error("The student wallet address is invalid.");
  }
  if (!metadataURI) {
    throw new Error("Certificate metadata URI is missing.");
  }

  const contract = await getWriteContract();
  const tx = await contract.mintCertificate(recipient, metadataURI);
  onSubmitted?.();
  const receipt = await tx.wait();
  if (!receipt) {
    throw new Error("Transaction was submitted but no receipt was returned.");
  }

  let tokenId: bigint | null = null;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog({
        topics: log.topics as string[],
        data: log.data,
      });
      if (parsed?.name === "CertificateIssued") {
        tokenId = parsed.args.tokenId as bigint;
        break;
      }
    } catch {
      continue;
    }
  }

  if (tokenId === null) {
    throw new Error("Certificate was minted but the token ID could not be read from the receipt.");
  }

  return { tokenId, hash: receipt.hash };
}

export async function revokeCertificate(tokenId: bigint | number): Promise<string> {
  const contract = await getWriteContract();
  const tx = await contract.revokeCertificate(tokenId);
  const receipt = await tx.wait();
  return receipt?.hash ?? tx.hash;
}

export async function addIssuer(address: string): Promise<string> {
  if (!isAddress(address)) {
    throw new Error("Issuer address is invalid.");
  }
  const contract = await getWriteContract();
  const tx = await contract.addIssuer(address);
  const receipt = await tx.wait();
  return receipt?.hash ?? tx.hash;
}

export async function removeIssuer(address: string): Promise<string> {
  if (!isAddress(address)) {
    throw new Error("Issuer address is invalid.");
  }
  const contract = await getWriteContract();
  const tx = await contract.removeIssuer(address);
  const receipt = await tx.wait();
  return receipt?.hash ?? tx.hash;
}

export async function isRevoked(tokenId: bigint | number | string): Promise<boolean> {
  const contract = getReadContract();
  return Boolean(await contract.isRevoked(tokenId));
}
