import { useCallback, useEffect, useState } from "react";
import { getIssuerStats, getOwner, isAuthorizedIssuer } from "../services/contract";
import { isContractConfigured } from "../utils/config";
import { parseChainError } from "../utils/errors";
import { useWallet } from "./useWallet";
import type { IssuerStats } from "../types";

export function useIssuer() {
  const { address, isConnected, isCorrectNetwork } = useWallet();
  const [isIssuer, setIsIssuer] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [stats, setStats] = useState<IssuerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!address || !isConnected || !isContractConfigured()) {
      setIsIssuer(false);
      setIsOwner(false);
      setStats(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [issuerFlag, ownerAddress, issuerStats] = await Promise.all([
        isAuthorizedIssuer(address),
        getOwner(),
        getIssuerStats(address),
      ]);
      setIsIssuer(issuerFlag);
      setIsOwner(ownerAddress.toLowerCase() === address.toLowerCase());
      setStats(issuerStats);
    } catch (err) {
      setError(parseChainError(err));
      setIsIssuer(false);
      setIsOwner(false);
    } finally {
      setLoading(false);
    }
  }, [address, isConnected]);

  useEffect(() => {
    void refresh();
  }, [refresh, isCorrectNetwork]);

  return { isIssuer, isOwner, stats, loading, error, refresh };
}
