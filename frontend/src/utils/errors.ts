export function parseChainError(error: unknown): string {
  if (!error) return "Something went wrong. Please try again.";

  const err = error as {
    code?: number | string;
    reason?: string;
    shortMessage?: string;
    message?: string;
    info?: { error?: { message?: string } };
    error?: { message?: string };
  };

  const message =
    err.shortMessage ||
    err.reason ||
    err.info?.error?.message ||
    err.error?.message ||
    err.message ||
    "";

  const lower = message.toLowerCase();

  if (err.code === 4001 || err.code === "ACTION_REJECTED" || lower.includes("user rejected")) {
    return "Transaction was rejected in your wallet.";
  }
  if (lower.includes("insufficient funds") || lower.includes("insufficient balance")) {
    return "Insufficient funds to cover gas. Add Sepolia ETH and try again.";
  }
  if (lower.includes("notauthorizedissuer")) {
    return "This wallet is not an authorized issuer.";
  }
  if (lower.includes("notauthorizedtorevoke")) {
    return "Only the issuer or contract owner can revoke this certificate.";
  }
  if (lower.includes("alreadyrevoked")) {
    return "This certificate has already been revoked.";
  }
  if (lower.includes("certificatedoesnotexist")) {
    return "No certificate exists for that ID.";
  }
  if (lower.includes("invalidrecipient") || lower.includes("invalid address")) {
    return "The student wallet address is invalid.";
  }
  if (lower.includes("invalidmetadatauri")) {
    return "Certificate metadata URI is missing or invalid.";
  }
  if (lower.includes("soulboundtransfernotallowed")) {
    return "SoulCert certificates are non-transferable.";
  }
  if (lower.includes("network") || lower.includes("failed to fetch") || lower.includes("timeout")) {
    return "RPC request failed. Check your network connection and try again.";
  }
  if (message) return message;
  return "Something went wrong. Please try again.";
}
