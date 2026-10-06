import { EthereumProvider as WalletConnectProvider } from "@walletconnect/ethereum-provider";
import type { EthereumProvider } from "../types";
import { APP_CONFIG } from "../utils/config";
import { findWalletByRdns } from "../utils/wallets";

export interface DetectedWallet {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
  provider: EthereumProvider;
}

export type WalletSource = "injected" | "walletconnect";

const STORAGE_SOURCE = "soulcert.wallet.source";
const STORAGE_RDNS = "soulcert.wallet.rdns";

let activeProvider: EthereumProvider | undefined;
let walletConnectProvider: InstanceType<typeof WalletConnectProvider> | null = null;
let discoveryStarted = false;
const detected = new Map<string, DetectedWallet>();
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeDetectedWallets(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getDetectedWallets(): DetectedWallet[] {
  return [...detected.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function getActiveProvider(): EthereumProvider | undefined {
  return activeProvider;
}

export function setActiveProvider(provider?: EthereumProvider): void {
  activeProvider = provider;
}

export function rememberWallet(source: WalletSource, rdns?: string): void {
  localStorage.setItem(STORAGE_SOURCE, source);
  if (rdns) localStorage.setItem(STORAGE_RDNS, rdns);
  else localStorage.removeItem(STORAGE_RDNS);
}

export function getRememberedWallet(): { source: WalletSource; rdns?: string } | null {
  const source = localStorage.getItem(STORAGE_SOURCE) as WalletSource | null;
  if (!source) return null;
  return { source, rdns: localStorage.getItem(STORAGE_RDNS) || undefined };
}

export function clearRememberedWallet(): void {
  localStorage.removeItem(STORAGE_SOURCE);
  localStorage.removeItem(STORAGE_RDNS);
}

export function isWalletConnectConfigured(): boolean {
  return Boolean(import.meta.env.VITE_WALLETCONNECT_PROJECT_ID);
}

export function discoverInjectedWallets(): DetectedWallet[] {
  if (typeof window === "undefined") return [];

  if (!discoveryStarted) {
    discoveryStarted = true;
    window.addEventListener("eip6963:announceProvider", (event: Event) => {
      const detail = (event as CustomEvent).detail as {
        info?: { uuid: string; name: string; icon: string; rdns: string };
        provider?: EthereumProvider;
      };
      if (!detail?.info || !detail.provider) return;
      detected.set(detail.info.rdns || detail.info.uuid, {
        uuid: detail.info.uuid,
        name: detail.info.name,
        icon: detail.info.icon,
        rdns: detail.info.rdns,
        provider: detail.provider,
      });
      notify();
    });
  }

  window.dispatchEvent(new Event("eip6963:requestProvider"));

  if (detected.size === 0 && window.ethereum) {
    detected.set("injected", {
      uuid: "legacy-injected",
      name: "Browser wallet",
      icon: "",
      rdns: "injected",
      provider: window.ethereum,
    });
    notify();
  }

  return getDetectedWallets();
}

export function findDetectedWallet(rdns: string): DetectedWallet | undefined {
  return detected.get(rdns) || getDetectedWallets().find((wallet) => wallet.rdns === rdns);
}

export async function getWalletConnectClient(): Promise<InstanceType<typeof WalletConnectProvider>> {
  const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
  if (!projectId) {
    throw new Error(
      "WalletConnect is not configured. Add VITE_WALLETCONNECT_PROJECT_ID in frontend/.env."
    );
  }
  if (walletConnectProvider) return walletConnectProvider;

  const rpcUrl = APP_CONFIG.rpcUrl || "https://rpc.sepolia.org";
  walletConnectProvider = await WalletConnectProvider.init({
    projectId,
    chains: [APP_CONFIG.chainId],
    optionalChains: [APP_CONFIG.chainId],
    showQrModal: true,
    rpcMap: {
      [APP_CONFIG.chainId]: rpcUrl,
    },
    metadata: {
      name: "SoulCert",
      description: "Blockchain-backed, non-transferable certificates for education.",
      url: window.location.origin,
      icons: [`${window.location.origin}/favicon.svg`],
    },
    qrModalOptions: {
      themeMode: "light",
    },
  });

  return walletConnectProvider;
}

export async function disconnectWalletConnect(): Promise<void> {
  if (!walletConnectProvider) return;
  try {
    await walletConnectProvider.disconnect();
  } catch {
    /* session may already be closed */
  }
  walletConnectProvider = null;
}

export function walletDisplayName(rdns?: string, fallback = "Wallet"): string {
  if (!rdns) return fallback;
  const detectedWallet = findDetectedWallet(rdns);
  if (detectedWallet) return detectedWallet.name;
  return findWalletByRdns(rdns)?.name || fallback;
}
