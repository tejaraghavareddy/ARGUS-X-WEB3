import React, { useState } from 'react';
import { IssuerInfo, Web3Account } from '../types';
import { blockchain, DEMO_ACCOUNTS } from '../services/blockchain';
import {
  ShieldCheck,
  Building,
  PlusCircle,
  ExternalLink,
  Ban,
  Check,
  Award,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { CONTRACT_ADDRESS } from '../contracts/contractData';

interface IssuerManagementProps {
  currentAccount: Web3Account;
  onAccountChange: (account: Web3Account) => void;
}

export const IssuerManagement: React.FC<IssuerManagementProps> = ({
  currentAccount,
  onAccountChange,
}) => {
  const [issuers, setIssuers] = useState<Record<string, IssuerInfo>>(blockchain.getIssuers());
  const [showAddModal, setShowAddModal] = useState(false);

  // New Issuer Form
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [website, setWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const refreshIssuers = () => {
    setIssuers(blockchain.getIssuers());
  };

  const isOwner = currentAccount.address.toLowerCase() === DEMO_ACCOUNTS[2].address.toLowerCase();

  const handleAddIssuer = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!address.startsWith('0x') || address.length !== 42) {
      setErrorMsg('Invalid Ethereum address format (must be 42 characters starting with 0x).');
      return;
    }

    setIsSubmitting(true);
    try {
      blockchain.setIssuerStatus(address, true, name, organization, website);
      refreshIssuers();
      setShowAddModal(false);
      setAddress('');
      setName('');
      setOrganization('');
      setWebsite('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to whitelist issuer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleIssuerStatus = (targetAddress: string, currentStatus: boolean) => {
    const issuer = issuers[targetAddress];
    if (!issuer) return;
    blockchain.setIssuerStatus(
      targetAddress,
      !currentStatus,
      issuer.name,
      issuer.organization,
      issuer.website
    );
    refreshIssuers();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header Banner */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold tracking-wider text-[#c5a059] uppercase">
              Access Control & RBAC
            </span>
            <span className="rounded-md bg-[#111114] border border-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-400">
              Contract Owner Whitelist
            </span>
          </div>
          <h1 className="mt-1 font-serif text-3xl font-bold text-slate-100">
            Authorized Issuer Whitelist
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Only cryptographic addresses in this on-chain registry can sign and mint soulbound certificates.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#c5a059] px-5 py-2.5 text-xs font-bold text-[#0a0a0c] shadow-lg hover:bg-[#d4b57a] uppercase tracking-wider transition-all cursor-pointer"
        >
          <PlusCircle className="h-4 w-4 text-[#0a0a0c]" />
          Authorize New Institution
        </button>
      </div>

      {/* Governance Status Notice */}
      <div className="mb-8 rounded-2xl border border-slate-800 bg-[#111114] p-4 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1a1b1e] text-[#c5a059] border border-slate-800">
            <Award className="h-4 w-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-100">Smart Contract Governance Role:</span>
            <p className="text-slate-400 text-[11px]">
              The whitelist modifier <code className="font-mono text-[#c5a059]">onlyAuthorizedIssuer()</code> verifies{' '}
              <code className="font-mono text-[#c5a059]">issuers[msg.sender].isWhitelisted == true</code>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isOwner && (
            <button
              onClick={() => onAccountChange(DEMO_ACCOUNTS[2])}
              className="rounded-xl bg-[#1a1b1e] px-3.5 py-1.5 font-medium text-slate-200 border border-slate-700 hover:border-[#c5a059] hover:text-[#c5a059] cursor-pointer"
            >
              Switch to Protocol Admin (Owner)
            </button>
          )}
        </div>
      </div>

      {/* Issuers Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(Object.values(issuers) as IssuerInfo[]).map((item) => (
          <div
            key={item.address}
            className={`rounded-2xl border bg-[#111114] p-6 shadow-xl transition-all ${
              item.isWhitelisted
                ? 'border-slate-800 hover:border-[#c5a059]'
                : 'border-rose-900/50 bg-[#140b0d]'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a1b1e] border border-slate-800 text-2xl shadow-sm">
                  {item.badge}
                </span>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm line-clamp-1">{item.organization}</h3>
                  <p className="text-xs text-slate-400 line-clamp-1">{item.name}</p>
                </div>
              </div>

              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                  item.isWhitelisted
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                    : 'bg-rose-950/60 text-rose-400 border-rose-800/60'
                }`}
              >
                {item.isWhitelisted ? 'Whitelisted' : 'Revoked'}
              </span>
            </div>

            <div className="mt-5 space-y-2 rounded-xl bg-[#0a0a0c] p-3 text-xs font-mono border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Issuer Address:</span>
                <span className="font-semibold text-[#c5a059]">
                  {item.address.slice(0, 8)}...{item.address.slice(-6)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Authorized Since:</span>
                <span className="text-slate-300">{item.dateAdded}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4 text-xs">
              <a
                href={item.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-slate-400 hover:text-[#c5a059]"
              >
                Official Website <ExternalLink className="h-3 w-3" />
              </a>

              <button
                onClick={() => toggleIssuerStatus(item.address, item.isWhitelisted)}
                className={`rounded-lg px-2.5 py-1 font-semibold text-[11px] cursor-pointer transition-colors ${
                  item.isWhitelisted
                    ? 'text-rose-400 hover:bg-rose-950/50 border border-rose-900/40'
                    : 'text-emerald-400 hover:bg-emerald-950/50 border border-emerald-900/40'
                }`}
              >
                {item.isWhitelisted ? 'Revoke Rights' : 'Re-Authorize'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Authorize New Issuer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#111114] p-6 shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#c5a059]" />
                <h3 className="text-base font-bold text-slate-100 font-serif">
                  Authorize New Institutional Issuer
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddIssuer} className="my-5 space-y-4 text-xs">
              {errorMsg && (
                <div className="rounded-xl border border-rose-900/60 bg-rose-950/40 p-3 text-rose-300">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Issuer EVM Wallet Address (0x...)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="0x..."
                  className="w-full rounded-xl border border-slate-700 bg-[#0a0a0c] p-2.5 font-mono text-slate-200 focus:border-[#c5a059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Institution / Organization Name
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  required
                  placeholder="e.g. University of California, Berkeley"
                  className="w-full rounded-xl border border-slate-700 bg-[#0a0a0c] p-2.5 text-slate-200 focus:border-[#c5a059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Department / Dean Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Center for Decentralized Intelligence"
                  className="w-full rounded-xl border border-slate-700 bg-[#0a0a0c] p-2.5 text-slate-200 focus:border-[#c5a059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Official Verification Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  required
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-700 bg-[#0a0a0c] p-2.5 text-slate-200 focus:border-[#c5a059] focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#c5a059] px-5 py-2 text-xs font-bold text-[#0a0a0c] shadow-md hover:bg-[#d4b57a] uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                >
                  Confirm On-Chain Whitelist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
