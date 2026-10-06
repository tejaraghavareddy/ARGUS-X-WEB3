import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { APP_CONFIG, NETWORK_PARAMS, SEPOLIA_CHAIN_ID } from "../utils/config";
import { parseChainError } from "../utils/errors";
import { useToast } from "./useToast";
import type { EthereumProvider } from "../types";
import {
  clearRememberedWallet,
  discoverInjectedWallets,
  disconnectWalletConnect,
  findDetectedWallet,
  getActiveProvider,
  getDetectedWallets,
  getRememberedWallet,
  getWalletConnectClient,
  isWalletConnectConfigured,
  rememberWallet,
  setActiveProvider,
  subscribeDetectedWallets,
  type DetectedWallet,
  type WalletSource,
} from "../services/wallet";

interface WalletContextValue {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  connecting: boolean;
  hasProvider: boolean;
  pickerOpen: boolean;
  detectedWallets: DetectedWallet[];
  walletName: string | null;
  walletSource: WalletSource | null;
  openPicker: () => void;
  closePicker: () => void;
  connect: () => Promise<void>;
  connectInjected: (wallet: DetectedWallet) => Promise<void>;
  connectWalletConnect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { notify } = useToast();
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [detectedWallets, setDetectedWallets] = useState<DetectedWallet[]>([]);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [walletSource, setWalletSource] = useState<WalletSource | null>(null);

  const hasProvider = detectedWallets.length > 0 || Boolean(window.ethereum);
  const isConnected = Boolean(address);
  const isCorrectNetwork = chainId === APP_CONFIG.chainId;

  const applyAccounts = useCallback((accounts: unknown) => {
    const list = Array.isArray(accounts) ? (accounts as string[]) : [];
    setAddress(list[0] ?? null);
    if (!list[0]) {
      setWalletName(null);
      setWalletSource(null);
    }
  }, []);

  const applyChainId = useCallback((value: unknown) => {
    if (typeof value === "string") {
      setChainId(Number.parseInt(value, 16));
      return;
    }
    if (typeof value === "number") {
      setChainId(value);
    }
  }, []);

  const bindProvider = useCallback(
    async (provider: EthereumProvider, source: WalletSource, name: string, rdns?: string) => {
      setActiveProvider(provider);
      rememberWallet(source, rdns);
      setWalletSource(source);
      setWalletName(name);
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      applyAccounts(accounts);
      const nextChain = await provider.request({ method: "eth_chainId" });
      applyChainId(nextChain);
    },
    [applyAccounts, applyChainId]
  );

  const openPicker = useCallback(() => {
    discoverInjectedWallets();
    setDetectedWallets(getDetectedWallets());
    setPickerOpen(true);
  }, []);

  const closePicker = useCallback(() => setPickerOpen(false), []);

  const connect = useCallback(async () => {
    openPicker();
  }, [openPicker]);

  const connectInjected = useCallback(
    async (wallet: DetectedWallet) => {
      setConnecting(true);
      try {
        await bindProvider(wallet.provider, "injected", wallet.name, wallet.rdns);
        setPickerOpen(false);
      } catch (error) {
        notify({
          type: "error",
          title: "Wallet connection failed",
          description: parseChainError(error),
        });
      } finally {
        setConnecting(false);
      }
    },
    [bindProvider, notify]
  );

  const connectWalletConnect = useCallback(async () => {
    if (!isWalletConnectConfigured()) {
      notify({
        type: "error",
        title: "WalletConnect is not configured",
        description: "Add VITE_WALLETCONNECT_PROJECT_ID in frontend/.env to enable mobile wallets.",
      });
      return;
    }
    setConnecting(true);
    try {
      const wc = await getWalletConnectClient();
      await wc.connect();
      await bindProvider(wc as unknown as EthereumProvider, "walletconnect", "WalletConnect");
      setPickerOpen(false);
    } catch (error) {
      notify({
        type: "error",
        title: "WalletConnect failed",
        description: parseChainError(error),
      });
    } finally {
      setConnecting(false);
    }
  }, [bindProvider, notify]);

  const disconnect = useCallback(async () => {
    const provider = getActiveProvider();
    if (walletSource === "walletconnect") {
      await disconnectWalletConnect();
    }
    if (provider?.disconnect) {
      try {
        await provider.disconnect();
      } catch {
        /* ignore */
      }
    }
    setActiveProvider(undefined);
    clearRememberedWallet();
    setAddress(null);
    setWalletName(null);
    setWalletSource(null);
    setPickerOpen(false);
  }, [walletSource]);

  const switchNetwork = useCallback(async () => {
    const provider = getActiveProvider();
    if (!provider) return;
    const hexChainId = `0x${APP_CONFIG.chainId.toString(16)}`;
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChainId }],
      });
    } catch (error) {
      const code = (error as { code?: number }).code;
      if (code === 4902 && APP_CONFIG.chainId === SEPOLIA_CHAIN_ID) {
        try {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [NETWORK_PARAMS[SEPOLIA_CHAIN_ID]],
          });
        } catch (addError) {
          notify({
            type: "error",
            title: "Network switch failed",
            description: parseChainError(addError),
          });
        }
        return;
      }
      notify({
        type: "error",
        title: "Please switch to Sepolia Testnet.",
        description: parseChainError(error),
      });
    }
  }, [notify]);

  useEffect(() => {
    discoverInjectedWallets();
    setDetectedWallets(getDetectedWallets());
    return subscribeDetectedWallets(() => setDetectedWallets(getDetectedWallets()));
  }, []);

  useEffect(() => {
    const provider = getActiveProvider();
    if (!provider) return;

    const onAccounts = (...args: unknown[]) => applyAccounts(args[0]);
    const onChain = (...args: unknown[]) => applyChainId(args[0]);
    const onDisconnect = () => {
      setAddress(null);
      setWalletName(null);
      setWalletSource(null);
      setActiveProvider(undefined);
      clearRememberedWallet();
    };

    provider.on("accountsChanged", onAccounts);
    provider.on("chainChanged", onChain);
    provider.on("disconnect", onDisconnect);

    return () => {
      provider.removeListener("accountsChanged", onAccounts);
      provider.removeListener("chainChanged", onChain);
      provider.removeListener("disconnect", onDisconnect);
    };
  }, [applyAccounts, applyChainId, walletSource, address]);

  useEffect(() => {
    const remembered = getRememberedWallet();
    if (!remembered) return;

    const restore = async () => {
      try {
        if (remembered.source === "injected") {
          discoverInjectedWallets();
          const wallet = remembered.rdns
            ? findDetectedWallet(remembered.rdns)
            : getDetectedWallets()[0];
          if (!wallet) return;
          setActiveProvider(wallet.provider);
          setWalletSource("injected");
          setWalletName(wallet.name);
          const accounts = await wallet.provider.request({ method: "eth_accounts" });
          applyAccounts(accounts);
          const nextChain = await wallet.provider.request({ method: "eth_chainId" });
          applyChainId(nextChain);
          return;
        }

        if (remembered.source === "walletconnect" && isWalletConnectConfigured()) {
          const wc = await getWalletConnectClient();
          if (!wc.session) return;
          setActiveProvider(wc as unknown as EthereumProvider);
          setWalletSource("walletconnect");
          setWalletName("WalletConnect");
          const accounts = await wc.request({ method: "eth_accounts" });
          applyAccounts(accounts);
          const nextChain = await wc.request({ method: "eth_chainId" });
          applyChainId(nextChain);
        }
      } catch {
        clearRememberedWallet();
      }
    };

    void restore();
  }, [applyAccounts, applyChainId]);

  const value = useMemo(
    () => ({
      address,
      chainId,
      isConnected,
      isCorrectNetwork,
      connecting,
      hasProvider,
      pickerOpen,
      detectedWallets,
      walletName,
      walletSource,
      openPicker,
      closePicker,
      connect,
      connectInjected,
      connectWalletConnect,
      disconnect,
      switchNetwork,
    }),
    [
      address,
      chainId,
      isConnected,
      isCorrectNetwork,
      connecting,
      hasProvider,
      pickerOpen,
      detectedWallets,
      walletName,
      walletSource,
      openPicker,
      closePicker,
      connect,
      connectInjected,
      connectWalletConnect,
      disconnect,
      switchNetwork,
    ]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return ctx;
}
