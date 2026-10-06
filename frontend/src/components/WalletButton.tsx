import { ChevronDown, LogOut, Wallet } from "lucide-react";
import { useState } from "react";
import { useWallet } from "../hooks/useWallet";
import { APP_CONFIG, requiredNetworkLabel } from "../utils/config";
import { shortenAddress } from "../utils/format";

export function WalletButton() {
  const {
    address,
    chainId,
    isConnected,
    isCorrectNetwork,
    connecting,
    connect,
    disconnect,
    switchNetwork,
    walletName,
  } = useWallet();
  const [open, setOpen] = useState(false);

  if (!isConnected || !address) {
    return (
      <button
        type="button"
        onClick={() => void connect()}
        disabled={connecting}
        className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-navy-800 disabled:opacity-70"
      >
        <Wallet size={16} />
        {connecting ? "Connecting..." : "Connect Wallet"}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-full border border-navy-900/10 bg-white px-3 py-2 text-sm font-semibold text-navy-900 shadow-sm"
      >
        <span
          className={`h-2 w-2 rounded-full ${isCorrectNetwork ? "bg-emerald-500" : "bg-amber-500"}`}
        />
        {shortenAddress(address)}
        <ChevronDown size={14} />
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-72 rounded-2xl border border-navy-900/10 bg-white p-4 shadow-card">
          <p className="text-xs uppercase tracking-wide text-navy-700/60">Wallet</p>
          <p className="mt-1 text-sm font-semibold text-navy-900">{walletName || "Connected"}</p>
          <p className="mt-1 break-all font-mono text-sm text-navy-900">{address}</p>
          <div className="mt-3 space-y-1 text-sm">
            <p>
              Status:{" "}
              <span className="font-semibold text-emerald-700">Connected</span>
            </p>
            <p>
              Network:{" "}
              <span className="font-semibold">
                {chainId === APP_CONFIG.chainId
                  ? requiredNetworkLabel()
                  : `Chain ${chainId ?? "unknown"}`}
              </span>
            </p>
          </div>
          {!isCorrectNetwork ? (
            <button
              type="button"
              onClick={() => void switchNetwork()}
              className="mt-3 w-full rounded-xl bg-amber-100 px-3 py-2 text-left text-sm font-semibold text-amber-900"
            >
              Please switch to Sepolia Testnet.
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              void disconnect();
              setOpen(false);
            }}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy-900/10 px-3 py-2 text-sm font-medium text-navy-800"
          >
            <LogOut size={14} />
            Disconnect
          </button>
        </div>
      ) : null}
    </div>
  );
}
