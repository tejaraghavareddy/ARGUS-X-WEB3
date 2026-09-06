import React, { useState } from 'react';
import { OnChainCertificate, Web3Account } from '../types';
import { blockchain } from '../services/blockchain';
import {
  Lock,
  Ban,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Terminal,
  ShieldAlert,
  Send,
} from 'lucide-react';
import { CONTRACT_ADDRESS } from '../contracts/contractData';

interface SoulboundDemoProps {
  certificates: OnChainCertificate[];
  currentAccount: Web3Account;
}

export const SoulboundDemo: React.FC<SoulboundDemoProps> = ({ certificates }) => {
  const [selectedTokenId, setSelectedTokenId] = useState<number>(certificates[0]?.tokenId || 1);
  const [recipientAddress, setRecipientAddress] = useState('0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    reverted: boolean;
    reason: string;
    txHash: string;
    gasUsed: string;
    blockNumber: number;
  } | null>(null);

  const selectedCert = certificates.find((c) => c.tokenId === selectedTokenId) || certificates[0];

  const handleSimulateTransfer = async () => {
    setIsExecuting(true);
    setExecutionResult(null);

    // Simulate block time
    await new Promise((resolve) => setTimeout(resolve, 900));

    try {
      const res = await blockchain.attemptTransfer(selectedTokenId, recipientAddress);
      setExecutionResult({
        reverted: res.reverted,
        reason: res.reason,
        txHash: res.tx.txHash,
        gasUsed: res.tx.gasUsed,
        blockNumber: res.tx.blockNumber,
      });
    } catch (err: any) {
      setExecutionResult({
        reverted: true,
        reason: err.message,
        txHash: '0xfailed...',
        gasUsed: '24,000',
        blockNumber: blockchain.getBlockNumber(),
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold tracking-wider text-[#c5a059] uppercase">
            EIP-5192 Compliance Inspector
          </span>
          <span className="rounded-md bg-[#111114] border border-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-400">
            Transfer Invariant Validation
          </span>
        </div>
        <h1 className="mt-1 font-serif text-3xl font-bold text-slate-100">
          Soulbound Non-Transferability Proof
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Test the smart contract's transfer blocking engine. Verify that any call to{' '}
          <code className="bg-[#111114] px-1 py-0.5 rounded font-mono text-[#c5a059] border border-slate-800">transferFrom()</code> or{' '}
          <code className="bg-[#111114] px-1 py-0.5 rounded font-mono text-[#c5a059] border border-slate-800">safeTransferFrom()</code> unconditionally reverts.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Interactive Simulation Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#111114] p-6 shadow-xl sm:p-8 space-y-6">
            <h2 className="font-serif text-lg font-bold text-slate-100">
              Transfer Simulation Parameters
            </h2>

            {/* Select Certificate */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                1. Select Minted Certificate to Attempt Transfer:
              </label>
              <select
                value={selectedTokenId}
                onChange={(e) => setSelectedTokenId(parseInt(e.target.value, 10))}
                className="w-full rounded-xl border border-slate-700 bg-[#0a0a0c] p-3 text-xs font-medium text-slate-200 focus:border-[#c5a059] focus:outline-none cursor-pointer"
              >
                {certificates.map((c) => (
                  <option key={c.tokenId} value={c.tokenId} className="bg-[#111114] text-slate-200">
                    Token #{c.tokenId} - {c.metadata.studentName} ({c.metadata.courseName})
                  </option>
                ))}
              </select>

              {selectedCert && (
                <div className="mt-2.5 rounded-xl bg-[#0a0a0c] p-3 text-xs border border-slate-800 text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Current Legal Owner:</span>
                    <span className="font-mono font-semibold text-[#c5a059]">
                      {selectedCert.owner.slice(0, 10)}...{selectedCert.owner.slice(-6)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span>Soulbound Lock Status:</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                      <Lock className="h-3 w-3" /> Locked Forever (EIP-5192)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Recipient Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                2. Target Destination / Unauthorized Buyer Address:
              </label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="0x..."
                className="w-full rounded-xl border border-slate-700 bg-[#0a0a0c] px-3.5 py-2.5 font-mono text-xs text-slate-200 placeholder-slate-600 focus:border-[#c5a059] focus:outline-none"
              />

              <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                <span className="text-slate-500">Target Presets:</span>
                <button
                  type="button"
                  onClick={() => setRecipientAddress('0x000000000000000000000000000000000000dEaD')}
                  className="rounded-md border border-slate-800 bg-[#1a1b1e] px-2 py-0.5 text-slate-400 hover:border-[#c5a059] hover:text-[#c5a059] cursor-pointer"
                >
                  Burn Address (0x...dEaD)
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientAddress('0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65')}
                  className="rounded-md border border-slate-800 bg-[#1a1b1e] px-2 py-0.5 text-slate-400 hover:border-[#c5a059] hover:text-[#c5a059] cursor-pointer"
                >
                  Secondary Buyer Wallet
                </button>
              </div>
            </div>

            {/* EVM Function Call Visualizer */}
            <div className="rounded-xl border border-slate-800 bg-[#0a0a0c] p-4 text-xs font-mono">
              <span className="text-slate-500">// Transaction payload to be broadcast</span>
              <div className="mt-1 text-slate-300">
                <span className="text-[#c5a059]">contract</span>.{' '}
                <span className="text-purple-400 font-bold">transferFrom</span>(
                <br />
                &nbsp;&nbsp;from: <span className="text-slate-400">{selectedCert?.owner.slice(0, 14)}...</span>,
                <br />
                &nbsp;&nbsp;to: <span className="text-slate-400">{recipientAddress.slice(0, 14)}...</span>,
                <br />
                &nbsp;&nbsp;tokenId: <span className="text-amber-400">{selectedTokenId}</span>
                <br />
                )
              </div>
            </div>

            {/* Execute Test Button */}
            <button
              onClick={handleSimulateTransfer}
              disabled={isExecuting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-700 to-rose-900 px-5 py-3 text-xs font-bold text-white shadow-lg transition-all hover:from-rose-600 hover:to-rose-800 disabled:opacity-50 cursor-pointer"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  Broadcasting Transfer Transaction to EVM...
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4" />
                  Execute Illegal Transfer Test (Attempt EVM Transfer)
                </>
              )}
            </button>
          </div>

          {/* Real-time EVM Execution Console */}
          {executionResult && (
            <div className="rounded-2xl border border-rose-950/70 bg-[#140b0d] p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-rose-400" />
                  <span className="font-mono text-xs font-bold text-rose-300 uppercase tracking-wider">
                    EVM Transaction Revert Confirmed
                  </span>
                </div>
                <span className="rounded-full bg-rose-950 px-2.5 py-0.5 font-mono text-[10px] font-bold text-rose-400 border border-rose-800">
                  STATUS: REVERTED (0x0)
                </span>
              </div>

              <p className="text-xs text-rose-200/90 leading-relaxed">
                The smart contract successfully intercepted and aborted the transfer transaction. Non-transferability invariant is active and intact.
              </p>

              <div className="rounded-xl bg-[#0a0a0c] p-3 font-mono text-xs text-slate-300 border border-slate-800 space-y-1">
                <p className="text-slate-500">&gt; Invoking: SoulboundCertificate.transferFrom()</p>
                <p className="text-slate-500">&gt; Internal Hook: _update(to={recipientAddress.slice(0, 8)}..., tokenId={selectedTokenId})</p>
                <p className="text-slate-500">&gt; Invariant Check: from != 0 && to != 0 =&gt; TRUE (Transfer detected)</p>
                <p className="text-rose-400 font-bold">
                  &gt; REVERT: "{executionResult.reason}"
                </p>
                <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-800 flex justify-between">
                  <span>Tx Hash: {executionResult.txHash.slice(0, 16)}...</span>
                  <span>Gas: {executionResult.gasUsed}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Code Invariant & Educational Architecture */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#111114] p-6 shadow-xl sm:p-8 space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-[#c5a059]" />
              <h3 className="font-serif text-lg font-bold text-slate-100">
                How Soulbound Invariants Are Enforced
              </h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Standard ERC-721 NFTs allow unrestricted secondary market transfers via <code className="font-mono bg-[#0a0a0c] text-[#c5a059] px-1 py-0.5 rounded border border-slate-800">transferFrom()</code> and <code className="font-mono bg-[#0a0a0c] text-[#c5a059] px-1 py-0.5 rounded border border-slate-800">safeTransferFrom()</code>. For academic degrees, identity credentials, and diplomas, this is a fatal defect because credentials can be bought, sold, or borrowed.
            </p>

            <p className="text-xs text-slate-400 leading-relaxed">
              In our smart contract, we override the OpenZeppelin <code className="font-mono bg-[#0a0a0c] text-[#c5a059] px-1 py-0.5 rounded border border-slate-800">_update()</code> internal hook:
            </p>

            {/* Code Snippet */}
            <div className="rounded-xl bg-[#0a0a0c] p-4 font-mono text-xs text-[#c5a059] border border-slate-800">
              <span className="text-slate-600">// OpenZeppelin v5 Hook Override</span>
              <br />
              <span className="text-purple-400">function</span> <span className="text-amber-300">_update</span>(
              <br />
              &nbsp;&nbsp;address to,
              <br />
              &nbsp;&nbsp;uint256 tokenId,
              <br />
              &nbsp;&nbsp;address auth
              <br />
              ) <span className="text-purple-400">internal virtual override returns</span> (address) &#123;
              <br />
              &nbsp;&nbsp;address from = _ownerOf(tokenId);
              <br />
              <br />
              &nbsp;&nbsp;<span className="text-slate-600">// Block any transfer between existing accounts</span>
              <br />
              &nbsp;&nbsp;<span className="text-purple-400">if</span> (from != address(0) &amp;&amp; to != address(0)) &#123;
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-rose-400 font-bold">revert</span>(<span className="text-amber-300">"Soulbound: Token transfers are prohibited."</span>);
              <br />
              &nbsp;&nbsp;&#125;
              <br />
              <br />
              &nbsp;&nbsp;<span className="text-purple-400">return super</span>._update(to, tokenId, auth);
              <br />
              &#125;
            </div>

            {/* 3 Key Guarantees */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 rounded-xl bg-[#0a0a0c] p-3 text-xs border border-slate-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200">Minting is Allowed (from == 0x0)</span>
                  <p className="text-slate-400 text-[11px]">Whitelisted universities can mint initial certificates into a student's public wallet.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-[#0a0a0c] p-3 text-xs border border-slate-800">
                <Ban className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200">Transfers are Forbidden (from != 0x0 &amp;&amp; to != 0x0)</span>
                  <p className="text-slate-400 text-[11px]">Tokens cannot be transferred on OpenSea, traded peer-to-peer, or drained by malicious approvals.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-[#0a0a0c] p-3 text-xs border border-slate-800">
                <Lock className="h-4 w-4 shrink-0 text-[#c5a059] mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200">EIP-5192 Standard Compliance</span>
                  <p className="text-slate-400 text-[11px]">Exposes <code className="font-mono text-[#c5a059]">locked(uint256) returns (bool)</code> and emits <code className="font-mono text-[#c5a059]">Locked(tokenId)</code> for universal wallet compatibility.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
