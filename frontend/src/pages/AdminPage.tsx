import { isAddress } from "ethers";
import { useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { useIssuer } from "../hooks/useIssuer";
import { useToast } from "../hooks/useToast";
import { useWallet } from "../hooks/useWallet";
import { addIssuer, isAuthorizedIssuer, removeIssuer } from "../services/contract";
import { isContractConfigured, requiredNetworkLabel } from "../utils/config";
import { parseChainError } from "../utils/errors";

export function AdminPage() {
  const { isConnected, isCorrectNetwork, connect, switchNetwork } = useWallet();
  const { isOwner, loading, refresh } = useIssuer();
  const { notify } = useToast();
  const [issuerAddress, setIssuerAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [lookup, setLookup] = useState<string | null>(null);

  async function run(action: "add" | "remove" | "check") {
    const value = issuerAddress.trim();
    if (!isAddress(value)) {
      notify({ type: "error", title: "Invalid address", description: "Enter a valid issuer wallet." });
      return;
    }
    setBusy(true);
    setLookup(null);
    try {
      if (action === "check") {
        const result = await isAuthorizedIssuer(value);
        setLookup(result ? "This wallet is an authorized issuer." : "This wallet is not an issuer.");
        return;
      }
      const hash =
        action === "add" ? await addIssuer(value) : await removeIssuer(value);
      await refresh();
      notify({
        type: "success",
        title: action === "add" ? "Issuer added" : "Issuer removed",
        description: `Tx ${hash.slice(0, 10)}...`,
      });
      setIssuerAddress("");
    } catch (err) {
      notify({
        type: "error",
        title: "Admin action failed",
        description: parseChainError(err),
      });
    } finally {
      setBusy(false);
    }
  }

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Connect your wallet"
          description="Only the contract owner can manage issuers."
          action={
            <button
              type="button"
              onClick={() => void connect()}
              className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Connect Wallet
            </button>
          }
        />
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Please switch to Sepolia Testnet."
          description={`Admin actions require ${requiredNetworkLabel()}.`}
          action={
            <button
              type="button"
              onClick={() => void switchNetwork()}
              className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Switch network
            </button>
          }
        />
      </div>
    );
  }

  if (!isContractConfigured()) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Contract not configured"
          description="Set VITE_CONTRACT_ADDRESS before using the admin dashboard."
        />
      </div>
    );
  }

  if (loading) return <LoadingState label="Checking owner permissions..." />;

  if (!isOwner) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Owner access required"
          description="The connected wallet is not the SoulboundCertificate contract owner."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl text-navy-900">Admin dashboard</h1>
      <p className="mt-2 text-navy-700/70">
        Add or remove authorized issuers. Only the contract owner can perform these actions.
      </p>

      <div className="mt-8 space-y-4 rounded-3xl border border-navy-900/8 bg-white p-6 shadow-card">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-navy-800">Issuer wallet</span>
          <input
            value={issuerAddress}
            onChange={(event) => setIssuerAddress(event.target.value)}
            placeholder="0x..."
            className="input font-mono"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void run("add")}
            className="rounded-full bg-navy-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Add issuer
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void run("remove")}
            className="rounded-full border border-navy-900/15 px-4 py-2 text-sm font-semibold text-navy-900 disabled:opacity-60"
          >
            Remove issuer
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void run("check")}
            className="rounded-full border border-navy-900/15 px-4 py-2 text-sm font-semibold text-navy-900 disabled:opacity-60"
          >
            Check issuer
          </button>
        </div>
        {lookup ? <p className="text-sm text-navy-800">{lookup}</p> : null}
      </div>
    </div>
  );
}
