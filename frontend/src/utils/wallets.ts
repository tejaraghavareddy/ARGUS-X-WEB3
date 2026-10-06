export type WalletPlatform = "extension" | "mobile" | "both";

export interface CompatibleWallet {
  id: string;
  name: string;
  rdns?: string;
  platforms: WalletPlatform;
  downloadUrl: string;
  description: string;
}

export const COMPATIBLE_WALLETS: CompatibleWallet[] = [
  {
    id: "metamask",
    name: "MetaMask",
    rdns: "io.metamask",
    platforms: "both",
    downloadUrl: "https://metamask.io/download/",
    description: "Browser extension and mobile app",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    rdns: "com.coinbase.wallet",
    platforms: "both",
    downloadUrl: "https://www.coinbase.com/wallet",
    description: "Self-custody wallet from Coinbase",
  },
  {
    id: "rabby",
    name: "Rabby Wallet",
    rdns: "io.rabby",
    platforms: "both",
    downloadUrl: "https://rabby.io/",
    description: "Multi-chain browser wallet",
  },
  {
    id: "rainbow",
    name: "Rainbow",
    rdns: "me.rainbow",
    platforms: "both",
    downloadUrl: "https://rainbow.me/download",
    description: "Ethereum wallet for mobile and desktop",
  },
  {
    id: "brave",
    name: "Brave Wallet",
    rdns: "com.brave.wallet",
    platforms: "extension",
    downloadUrl: "https://brave.com/wallet/",
    description: "Built into the Brave browser",
  },
  {
    id: "trust",
    name: "Trust Wallet",
    rdns: "com.trustwallet.app",
    platforms: "both",
    downloadUrl: "https://trustwallet.com/download",
    description: "Mobile-first multi-chain wallet",
  },
  {
    id: "okx",
    name: "OKX Wallet",
    rdns: "com.okex.wallet",
    platforms: "both",
    downloadUrl: "https://www.okx.com/web3",
    description: "OKX Web3 wallet",
  },
  {
    id: "phantom",
    name: "Phantom",
    rdns: "app.phantom",
    platforms: "both",
    downloadUrl: "https://phantom.app/download",
    description: "Multi-chain wallet with Ethereum support",
  },
  {
    id: "zerion",
    name: "Zerion",
    rdns: "io.zerion.wallet",
    platforms: "both",
    downloadUrl: "https://zerion.io/download",
    description: "Portfolio and Web3 wallet",
  },
  {
    id: "enkrypt",
    name: "Enkrypt",
    rdns: "com.enkrypt.wallet",
    platforms: "extension",
    downloadUrl: "https://www.enkrypt.com/",
    description: "Multi-chain wallet by MEW",
  },
  {
    id: "bitget",
    name: "Bitget Wallet",
    rdns: "com.bitget.web3",
    platforms: "both",
    downloadUrl: "https://web3.bitget.com/en/wallet-download",
    description: "Formerly BitKeep",
  },
  {
    id: "tokenpocket",
    name: "TokenPocket",
    rdns: "pro.tokenpocket",
    platforms: "both",
    downloadUrl: "https://www.tokenpocket.pro/en/download/app",
    description: "Multi-chain wallet",
  },
  {
    id: "onekey",
    name: "OneKey",
    rdns: "so.onekey.wallet",
    platforms: "both",
    downloadUrl: "https://onekey.so/download",
    description: "Open-source hardware and software wallet",
  },
  {
    id: "taho",
    name: "Taho",
    rdns: "org.tally",
    platforms: "extension",
    downloadUrl: "https://taho.xyz/",
    description: "Community-owned Ethereum wallet",
  },
  {
    id: "frame",
    name: "Frame",
    rdns: "sh.frame",
    platforms: "extension",
    downloadUrl: "https://frame.sh/",
    description: "Desktop Ethereum wallet and signer",
  },
  {
    id: "core",
    name: "Core",
    rdns: "app.core.extension",
    platforms: "both",
    downloadUrl: "https://core.app/",
    description: "Avalanche wallet with Ethereum support",
  },
  {
    id: "exodus",
    name: "Exodus",
    rdns: "com.exodus.wallet",
    platforms: "both",
    downloadUrl: "https://www.exodus.com/download/",
    description: "Multi-asset desktop and mobile wallet",
  },
  {
    id: "safepal",
    name: "SafePal",
    rdns: "io.safepal.wallet",
    platforms: "both",
    downloadUrl: "https://www.safepal.com/download",
    description: "Hardware and software wallet",
  },
  {
    id: "opera",
    name: "Opera Wallet",
    rdns: "com.opera.wallet",
    platforms: "extension",
    downloadUrl: "https://www.opera.com/crypto/next",
    description: "Built into Opera Crypto Browser",
  },
  {
    id: "imtoken",
    name: "imToken",
    platforms: "mobile",
    downloadUrl: "https://token.im/download",
    description: "Connect with WalletConnect on mobile",
  },
  {
    id: "argent",
    name: "Argent",
    platforms: "mobile",
    downloadUrl: "https://www.argent.xyz/download/",
    description: "Smart contract wallet via WalletConnect",
  },
  {
    id: "ledger",
    name: "Ledger Live",
    platforms: "both",
    downloadUrl: "https://www.ledger.com/ledger-live",
    description: "Hardware wallet through Ledger Live",
  },
  {
    id: "uniswap",
    name: "Uniswap Wallet",
    platforms: "mobile",
    downloadUrl: "https://wallet.uniswap.org/",
    description: "Connect with WalletConnect on mobile",
  },
  {
    id: "crypto-com",
    name: "Crypto.com Wallet",
    platforms: "mobile",
    downloadUrl: "https://crypto.com/eea/defi-wallet",
    description: "Connect with WalletConnect on mobile",
  },
  {
    id: "binance",
    name: "Binance Web3 Wallet",
    platforms: "mobile",
    downloadUrl: "https://www.binance.com/en/web3wallet",
    description: "Connect with WalletConnect on mobile",
  },
];

export function findWalletByRdns(rdns?: string): CompatibleWallet | undefined {
  if (!rdns) return undefined;
  return COMPATIBLE_WALLETS.find((wallet) => wallet.rdns === rdns);
}

export function platformLabel(platforms: WalletPlatform): string {
  if (platforms === "both") return "Extension + mobile";
  if (platforms === "mobile") return "Mobile (WalletConnect)";
  return "Browser extension";
}
