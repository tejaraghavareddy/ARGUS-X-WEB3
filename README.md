# SoulCert

Credentials you can trust. Verify instantly.

Blockchain-backed, non-transferable certificates for the future of education.

SoulCert is an on-chain verifiable credential platform. Authorized institutions mint soulbound (non-transferable) NFT certificates to student wallets. Anyone can verify a certificate using a wallet address or token ID.

## Project structure

```text
.
├── contracts/
│   └── SoulboundCertificate.sol
├── scripts/
│   ├── deploy.ts
│   └── copy-abi.ts
├── test/
│   └── SoulboundCertificate.ts
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── services/
│       ├── utils/
│       ├── types/
│       └── contracts/
├── hardhat.config.ts
├── package.json
└── .env.example
```

## Prerequisites

- Node.js 20+
- npm
- An Ethereum wallet (MetaMask, Coinbase Wallet, Rabby, Trust, Rainbow, or any WalletConnect wallet)
- A Pinata account for IPFS uploads (optional until you issue certificates)
- Sepolia ETH if you deploy or mint on Sepolia

## Installation

```bash
# Install workspace (Hardhat, OpenZeppelin, tests)
npm install

# Install the frontend
npm --prefix frontend install
```

Copy environment files:

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

## Compile the contract

```bash
npm run compile
```

This compiles `SoulboundCertificate` and copies the ABI into `frontend/src/contracts/SoulboundCertificate.json`.

## Run tests

```bash
npm test
```

Tests cover issuer management, minting, soulbound transfer rejection, revocation, and issuer stats.

## Local development

Start a local Hardhat node in one terminal:

```bash
npx hardhat node
```

Deploy the contract to the local network in another terminal:

```bash
npm run deploy:local
```

Copy the printed address into `frontend/.env`:

```bash
VITE_CONTRACT_ADDRESS=0x...
VITE_CHAIN_ID=31337
VITE_NETWORK_NAME=Hardhat
VITE_RPC_URL=http://127.0.0.1:8545
```

Start the frontend:

```bash
npm run frontend:dev
```

Open the printed local URL. Import a Hardhat account into MetaMask if you want to mint locally.

## Sepolia deployment

1. Fund a deployer wallet with Sepolia ETH.
2. Set `SEPOLIA_RPC_URL` and `PRIVATE_KEY` in the root `.env`.
3. Deploy:

```bash
npm run deploy:sepolia
```

4. Put the deployed address into `frontend/.env`:

```bash
VITE_CONTRACT_ADDRESS=0xYourDeployedContract
VITE_CHAIN_ID=11155111
VITE_NETWORK_NAME=Sepolia
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
VITE_BLOCK_EXPLORER=https://sepolia.etherscan.io
```

5. Start the frontend and connect MetaMask to Sepolia.

The deployer is the contract owner and the first authorized issuer.

## Configure IPFS (Pinata)

SoulCert uploads certificate metadata to IPFS through Pinata.

1. Create a Pinata API key pair.
2. Add the values to `frontend/.env`:

```bash
VITE_IPFS_API_KEY=your_pinata_api_key
VITE_IPFS_API_SECRET=your_pinata_api_secret
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

Do not commit real keys. The IPFS layer in `frontend/src/services/ipfs.ts` is provider-agnostic so another pinning service can replace Pinata later.

## Connect a wallet

SoulCert is not MetaMask-only. Click **Connect Wallet** to open the wallet picker.

Browser extensions (EIP-6963, auto-detected when installed):

- MetaMask
- Coinbase Wallet
- Rabby
- Rainbow
- Brave Wallet
- Trust Wallet
- OKX Wallet
- Phantom
- Zerion
- Enkrypt
- Bitget Wallet
- TokenPocket
- OneKey
- Taho
- Frame
- Core
- Exodus
- SafePal
- Opera Wallet

Mobile / WalletConnect:

- Trust Wallet, Rainbow, Argent, imToken, Uniswap Wallet, Crypto.com Wallet, Binance Web3 Wallet, Ledger Live, and 300+ WalletConnect wallets

1. Create or import a wallet. Never paste a private key into the SoulCert UI.
2. Switch to Sepolia Testnet (chain ID 11155111), or Hardhat (31337) for local use.
3. Click **Connect Wallet** and choose an installed wallet, or scan the WalletConnect QR code.
4. If you are on the wrong network, SoulCert shows: "Please switch to Sepolia Testnet."

WalletConnect QR connect needs a Cloud project ID from https://cloud.walletconnect.com :

```bash
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

The contract owner can open `/admin` and authorize additional issuer wallets with `addIssuer`.

## Issuer flow

1. Connect Wallet
2. Open `/dashboard` — the app calls `isIssuer` on-chain
3. Open `/issue` and fill the certificate form
4. Metadata is uploaded to IPFS
5. The wallet confirms `mintCertificate(recipient, metadataURI)`
6. After confirmation, SoulCert shows token ID, transaction hash, and IPFS CID

Certificates cannot be transferred. The contract reverts `transferFrom`, `safeTransferFrom`, `approve`, and `setApprovalForAll`.

## Environment variables

Root `.env` (deployment):

| Variable | Purpose |
| --- | --- |
| `SEPOLIA_RPC_URL` | RPC endpoint used by Hardhat |
| `PRIVATE_KEY` | Deployer key (never commit this) |

Frontend `frontend/.env`:

| Variable | Purpose |
| --- | --- |
| `VITE_CONTRACT_ADDRESS` | Deployed SoulboundCertificate address |
| `VITE_CHAIN_ID` | `11155111` for Sepolia |
| `VITE_NETWORK_NAME` | Display name |
| `VITE_RPC_URL` | Read-only RPC |
| `VITE_BLOCK_EXPLORER` | Etherscan base URL |
| `VITE_IPFS_API_KEY` | Pinata API key |
| `VITE_IPFS_API_SECRET` | Pinata API secret |
| `VITE_IPFS_GATEWAY` | Gateway used to resolve `ipfs://` URIs |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud project ID for mobile QR connect |

## License

MIT
