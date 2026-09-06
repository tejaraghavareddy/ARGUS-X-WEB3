import React, { useState } from 'react';
import {
  CONTRACT_ADDRESS,
  SOLIDITY_CONTRACT_CODE,
  CONTRACT_ABI,
} from '../contracts/contractData';
import { copyTextSafely } from '../utils/clipboard';
import {
  Code2,
  Copy,
  Check,
  FileCode,
  ShieldCheck,
  Lock,
  Layers,
  ExternalLink,
} from 'lucide-react';

export const ContractViewer: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'solidity' | 'abi'>('solidity');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAbi, setCopiedAbi] = useState(false);

  const copyToClipboard = async (text: string, isAbi = false) => {
    const success = await copyTextSafely(text);
    if (success) {
      if (isAbi) {
        setCopiedAbi(true);
        setTimeout(() => setCopiedAbi(false), 2000);
      } else {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header Banner */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold tracking-wider text-[#c5a059] uppercase">
              Smart Contract Architecture
            </span>
            <span className="rounded-md bg-[#111114] border border-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-400">
              Solidity 0.8.20
            </span>
          </div>
          <h1 className="mt-1 font-serif text-3xl font-bold text-slate-100">
            EIP-5192 Soulbound Certificate Contract
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Production-ready smart contract implementation of non-transferable academic credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-slate-800 bg-[#111114] p-3 font-mono text-xs">
            <span className="text-slate-500">Deployed Address: </span>
            <span className="font-bold text-[#c5a059]">{CONTRACT_ADDRESS}</span>
          </div>
        </div>
      </div>

      {/* Contract Features Highlights */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-[#111114] p-5 shadow-xl">
          <div className="flex items-center gap-2 font-serif text-sm font-bold text-slate-100">
            <Lock className="h-4 w-4 text-[#c5a059]" />
            <span>Permanent Non-Transferability</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Overrides <code className="font-mono bg-[#0a0a0c] text-[#c5a059] px-1 py-0.5 rounded border border-slate-800">_update()</code> to guarantee tokens can never be transferred, sold, or stolen after minting.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#111114] p-5 shadow-xl">
          <div className="flex items-center gap-2 font-serif text-sm font-bold text-slate-100">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Role-Based Whitelist Minting</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Strict <code className="font-mono bg-[#0a0a0c] text-[#c5a059] px-1 py-0.5 rounded border border-slate-800">onlyAuthorizedIssuer</code> modifier enforces that only accredited institutions can sign and mint.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#111114] p-5 shadow-xl">
          <div className="flex items-center gap-2 font-serif text-sm font-bold text-slate-100">
            <Layers className="h-4 w-4 text-sky-400" />
            <span>Decentralized IPFS Storage</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Implements <code className="font-mono bg-[#0a0a0c] text-[#c5a059] px-1 py-0.5 rounded border border-slate-800">tokenURI</code> pointing to immutable IPFS multihash metadata references for instant off-chain verification.
          </p>
        </div>
      </div>

      {/* Code Viewer Box */}
      <div className="rounded-2xl border border-slate-800 bg-[#0a0a0c] shadow-2xl overflow-hidden">
        {/* Code Header Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-[#111114] px-6 py-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="ml-3 font-mono font-medium text-slate-300">
              contracts/SoulboundCertificate.sol
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('solidity')}
              className={`rounded-lg px-3 py-1 font-medium transition-all cursor-pointer ${
                activeSubTab === 'solidity'
                  ? 'bg-[#1a1b1e] text-[#c5a059] border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Solidity Source
            </button>
            <button
              onClick={() => setActiveSubTab('abi')}
              className={`rounded-lg px-3 py-1 font-medium transition-all cursor-pointer ${
                activeSubTab === 'abi'
                  ? 'bg-[#1a1b1e] text-[#c5a059] border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Contract ABI
            </button>

            <button
              onClick={() =>
                copyToClipboard(
                  activeSubTab === 'solidity'
                    ? SOLIDITY_CONTRACT_CODE
                    : JSON.stringify(CONTRACT_ABI, null, 2),
                  activeSubTab === 'abi'
                )
              }
              className="ml-2 inline-flex items-center gap-1.5 rounded-lg bg-[#c5a059] px-3 py-1 font-bold text-[#0a0a0c] hover:bg-[#d4b57a] uppercase tracking-wider transition-all cursor-pointer"
            >
              {(activeSubTab === 'solidity' ? copiedCode : copiedAbi) ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Content Area */}
        <pre className="max-h-[640px] overflow-auto p-6 font-mono text-xs leading-relaxed text-slate-300">
          {activeSubTab === 'solidity'
            ? SOLIDITY_CONTRACT_CODE
            : JSON.stringify(CONTRACT_ABI, null, 2)}
        </pre>
      </div>
    </div>
  );
};
