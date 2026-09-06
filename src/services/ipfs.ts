import { CertificateMetadata } from '../types';

// In-memory / local storage pin cache for simulated IPFS network
const IPFS_CACHE_KEY = 'soulbound_cert_ipfs_storage_v1';

function getIpfsStorage(): Record<string, string> {
  try {
    const raw = localStorage.getItem(IPFS_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToIpfsStorage(cid: string, data: string) {
  try {
    const storage = getIpfsStorage();
    storage[cid] = data;
    localStorage.setItem(IPFS_CACHE_KEY, JSON.stringify(storage));
  } catch (err) {
    console.warn('Unable to cache to localStorage', err);
  }
}

// Convert bytes to Base58 (Bitcoin style used in IPFS Qm... CIDs)
const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function toBase58(bytes: Uint8Array): string {
  const digits = [0];
  for (let i = 0; i < bytes.length; i++) {
    for (let j = 0; j < digits.length; j++) digits[j] <<= 8;
    digits[0] += bytes[i];
    let carry = 0;
    for (let j = 0; j < digits.length; j++) {
      digits[j] += carry;
      carry = (digits[j] / 58) | 0;
      digits[j] %= 58;
    }
    while (carry) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
    digits.push(0);
  }
  return digits.reverse().map((d) => ALPHABET[d]).join('');
}

/**
 * Generate a deterministic IPFS CIDv0 hash from any JSON payload using sha256 + multihash header (0x12 0x20)
 */
export async function calculateIpfsCid(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = new Uint8Array(hashBuffer);
      
      // IPFS CIDv0 prefix: 0x12 (sha2-256), 0x20 (32 bytes length)
      const multihash = new Uint8Array(34);
      multihash[0] = 0x12;
      multihash[1] = 0x20;
      multihash.set(hashArray, 2);
      
      return toBase58(multihash);
    } catch {
      // Fallback if crypto.subtle.digest throws
    }
  }
  
  // Fallback if crypto.subtle is unavailable
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = (hash << 5) - hash + content.charCodeAt(i);
    hash |= 0;
  }
  return `Qm${Math.abs(hash).toString(16).padStart(44, '7')}`;
}

/**
 * Upload certificate metadata to IPFS (computes CID, pins to storage, and provides gateway URLs)
 */
export async function uploadMetadataToIpfs(
  metadataPayload: Omit<CertificateMetadata, 'ipfsHash' | 'ipfsMetadataUri'>
): Promise<{ cid: string; uri: string; gatewayUrl: string; fullMetadata: CertificateMetadata }> {
  // First calculate provisional string for CID
  const provisionalJson = JSON.stringify(metadataPayload, null, 2);
  const cid = await calculateIpfsCid(provisionalJson);
  const uri = `ipfs://${cid}`;
  const gatewayUrl = `https://ipfs.io/ipfs/${cid}`;

  const fullMetadata: CertificateMetadata = {
    ...metadataPayload,
    ipfsHash: cid,
    ipfsMetadataUri: uri,
  };

  const finalJson = JSON.stringify(fullMetadata, null, 2);
  saveToIpfsStorage(cid, finalJson);

  return {
    cid,
    uri,
    gatewayUrl,
    fullMetadata,
  };
}

/**
 * Retrieve metadata from IPFS cache or gateway simulation
 */
export function fetchFromIpfs(cid: string): CertificateMetadata | null {
  const storage = getIpfsStorage();
  if (storage[cid]) {
    try {
      return JSON.parse(storage[cid]);
    } catch {
      return null;
    }
  }
  return null;
}
