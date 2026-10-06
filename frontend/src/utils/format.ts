export function shortenAddress(address?: string | null, chars = 4): string {
  if (!address) return "";
  if (address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatTimestamp(value: bigint | number): string {
  const ms = typeof value === "bigint" ? Number(value) * 1000 : value;
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function explorerTxUrl(hash: string): string {
  const base =
    import.meta.env.VITE_BLOCK_EXPLORER || "https://sepolia.etherscan.io";
  return `${base.replace(/\/$/, "")}/tx/${hash}`;
}

export function explorerAddressUrl(address: string): string {
  const base =
    import.meta.env.VITE_BLOCK_EXPLORER || "https://sepolia.etherscan.io";
  return `${base.replace(/\/$/, "")}/address/${address}`;
}

export async function copyToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export function cidFromUri(uri: string): string {
  if (!uri) return "";
  return uri.replace(/^ipfs:\/\//, "").replace(/^https?:\/\/[^/]+\/ipfs\//, "");
}
