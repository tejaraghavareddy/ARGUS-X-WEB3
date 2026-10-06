import { QrCode, Search, Smartphone, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { useWallet } from "../hooks/useWallet";
import { isWalletConnectConfigured } from "../services/wallet";
import { COMPATIBLE_WALLETS, platformLabel } from "../utils/wallets";
import { Modal } from "./Modal";

export function WalletModal() {
  const {
    pickerOpen,
    closePicker,
    detectedWallets,
    connecting,
    connectInjected,
    connectWalletConnect,
  } = useWallet();
  const [query, setQuery] = useState("");
  const walletConnectReady = isWalletConnectConfigured();

  const detectedRdns = useMemo(
    () => new Set(detectedWallets.map((wallet) => wallet.rdns)),
    [detectedWallets]
  );

  const filteredCatalog = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return COMPATIBLE_WALLETS;
    return COMPATIBLE_WALLETS.filter((wallet) =>
      `${wallet.name} ${wallet.description}`.toLowerCase().includes(term)
    );
  }, [query]);

  return (
    <Modal open={pickerOpen} title="Connect a wallet" onClose={closePicker}>
      <p className="mb-4 text-sm text-navy-700/70">
        Use an installed browser wallet, or scan a WalletConnect QR code with a mobile app.
      </p>

      {detectedWallets.length > 0 ? (
        <div className="mb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy-700/60">
            Detected in this browser
          </p>
          <div className="space-y-2">
            {detectedWallets.map((wallet) => (
              <button
                key={wallet.uuid}
                type="button"
                disabled={connecting}
                onClick={() => void connectInjected(wallet)}
                className="flex w-full items-center gap-3 rounded-2xl border border-navy-900/10 px-3 py-3 text-left hover:bg-mist disabled:opacity-60"
              >
                {wallet.icon ? (
                  <img src={wallet.icon} alt="" className="h-9 w-9 rounded-xl" />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-white">
                    <Wallet size={16} />
                  </span>
                )}
                <span>
                  <span className="block text-sm font-semibold text-navy-900">{wallet.name}</span>
                  <span className="block text-xs text-navy-700/60">Installed</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="mb-5 rounded-2xl bg-mist px-3 py-3 text-sm text-navy-700">
          No browser wallet detected. Install one below or connect with WalletConnect.
        </p>
      )}

      <button
        type="button"
        disabled={connecting}
        onClick={() => void connectWalletConnect()}
        className="mb-5 flex w-full items-center gap-3 rounded-2xl bg-navy-900 px-3 py-3 text-left text-white disabled:opacity-60"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
          <QrCode size={16} />
        </span>
        <span>
          <span className="block text-sm font-semibold">WalletConnect</span>
          <span className="block text-xs text-white/70">
            {walletConnectReady
              ? "Scan with MetaMask, Trust, Rainbow, Argent, and 300+ wallets"
              : "Add VITE_WALLETCONNECT_PROJECT_ID to enable QR connect"}
          </span>
        </span>
      </button>

      <label className="relative mb-3 block">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-500" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search compatible wallets"
          className="input pl-9"
        />
      </label>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy-700/60">
        Compatible wallets
      </p>
      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {filteredCatalog.map((wallet) => {
          const installed = Boolean(wallet.rdns && detectedRdns.has(wallet.rdns));
          const detected = installed
            ? detectedWallets.find((item) => item.rdns === wallet.rdns)
            : undefined;
          return (
            <div
              key={wallet.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-navy-900/8 px-3 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-navy-900">{wallet.name}</p>
                <p className="text-xs text-navy-700/65">{wallet.description}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-navy-600">
                  {wallet.platforms === "mobile" ? <Smartphone size={11} /> : <Wallet size={11} />}
                  {platformLabel(wallet.platforms)}
                </p>
              </div>
              {detected ? (
                <button
                  type="button"
                  disabled={connecting}
                  onClick={() => void connectInjected(detected)}
                  className="shrink-0 rounded-full bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Connect
                </button>
              ) : wallet.platforms === "mobile" || wallet.platforms === "both" ? (
                <a
                  href={wallet.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 rounded-full border border-navy-900/15 px-3 py-1.5 text-xs font-semibold text-navy-800"
                >
                  Get app
                </a>
              ) : (
                <a
                  href={wallet.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 rounded-full border border-navy-900/15 px-3 py-1.5 text-xs font-semibold text-navy-800"
                >
                  Install
                </a>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
