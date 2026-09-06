import React, { useState } from 'react';
import { Web3Account } from '../types';
import { DEMO_ACCOUNTS, blockchain } from '../services/blockchain';
import { copyTextSafely } from '../utils/clipboard';
import {
  Award,
  Lock,
  Search,
  PlusCircle,
  ShieldCheck,
  Code2,
  ChevronDown,
  Wallet,
  Check,
  Copy,
  ExternalLink,
  Ban,
  FlaskConical,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'verify' | 'mint' | 'soulbound' | 'issuers' | 'contract' | 'tests';
  setActiveTab: (tab: 'verify' | 'mint' | 'soulbound' | 'issuers' | 'contract' | 'tests') => void;
  currentAccount: Web3Account;
  onAccountChange: (account: Web3Account) => void;
  certCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentAccount,
  onAccountChange,
  certCount,
}) => {
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [walletNotice, setWalletNotice] = useState<string | null>(null);

  const copyAddress = async () => {
    const success = await copyTextSafely(currentAccount.address);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const connectMetaMask = async () => {
    setWalletNotice(null);
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts[0]) {
          const customAccount: Web3Account = {
            address: accounts[0],
            name: 'MetaMask Injected Wallet',
            role: blockchain.isIssuerAuthorized(accounts[0]) ? 'issuer' : 'student',
            balanceEth: '0.15 ETH',
          };
          onAccountChange(customAccount);
          setShowWalletModal(false);
        }
      } catch (err) {
        console.error('MetaMask connection error', err);
        setWalletNotice('Unable to connect to MetaMask. Please select a simulated demo account.');
      }
    } else {
      setWalletNotice('No Web3 wallet extension detected in this browser environment. Please choose any preconfigured testing account below!');
    }
  };

  const getRoleBadge = (role: Web3Account['role']) => {
    switch (role) {
      case 'issuer':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            Whitelisted Issuer
          </span>
        );
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 px-2 py-0.5 text-[11px] font-semibold text-[#c5a059]">
            <Award className="h-3 w-3 text-[#c5a059]" />
            Contract Owner
          </span>
        );
      case 'student':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 text-[11px] font-semibold text-sky-400">
            <Award className="h-3 w-3 text-sky-400" />
            Student Wallet
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 text-[11px] font-semibold text-rose-400">
            <Ban className="h-3 w-3 text-rose-400" />
            Unauthorized Wallet
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#0a0a0c]/90 backdrop-blur-md">
      {/* Network Notification Bar */}
      <div className="bg-[#050507] border-b border-slate-900 px-4 py-1.5 text-center text-xs text-slate-400">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-medium text-slate-200">EVM Sepolia Testnet</span>
            <span className="hidden text-slate-600 sm:inline">•</span>
            <span className="hidden text-slate-400 sm:inline">ERC-5192 Soulbound Standard</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span>{certCount} Valid Credentials On-Chain</span>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => setActiveTab('contract')}
              className="text-[#c5a059] hover:text-[#d4b57a] font-mono underline cursor-pointer"
            >
              0x71C5...d677
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('verify')}
            className="flex items-center gap-2 text-left cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c5a059] text-[#0a0a0c] shadow-md transition-transform group-hover:scale-105">
              <Award className="h-5 w-5 text-[#0a0a0c]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-lg font-bold tracking-tight text-slate-100">
                  CertSoul
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#1a1b1e] px-2 py-0.5 text-[10px] font-bold text-[#c5a059] border border-[#c5a059]/30">
                  <Lock className="h-2.5 w-2.5 text-[#c5a059]" />
                  SBT
                </span>
              </div>
              <p className="hidden text-[11px] text-slate-500 sm:block">
                Non-Transferable On-Chain Certificates
              </p>
            </div>
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 rounded-xl bg-[#111114] p-1 border border-slate-800">
          <button
            id="nav-verify"
            onClick={() => setActiveTab('verify')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'verify'
                ? 'bg-[#1a1b1e] text-[#c5a059] shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            Public Verifier
          </button>

          <button
            id="nav-mint"
            onClick={() => setActiveTab('mint')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'mint'
                ? 'bg-[#1a1b1e] text-[#c5a059] shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Issuer Dashboard
          </button>

          <button
            id="nav-soulbound"
            onClick={() => setActiveTab('soulbound')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'soulbound'
                ? 'bg-[#1a1b1e] text-[#c5a059] shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            Soulbound Transfer Test
          </button>

          <button
            id="nav-issuers"
            onClick={() => setActiveTab('issuers')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'issuers'
                ? 'bg-[#1a1b1e] text-[#c5a059] shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Whitelisted Issuers
          </button>

          <button
            id="nav-contract"
            onClick={() => setActiveTab('contract')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'contract'
                ? 'bg-[#1a1b1e] text-[#c5a059] shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            Smart Contract
          </button>

          <button
            id="nav-tests"
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'tests'
                ? 'bg-[#1a1b1e] text-[#c5a059] shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FlaskConical className="h-3.5 w-3.5" />
            Test Suite
          </button>
        </nav>

        {/* Wallet Pill & Switcher */}
        <div className="flex items-center gap-2">
          <button
            id="wallet-button"
            onClick={() => setShowWalletModal(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#111114] p-1.5 pr-3 shadow-md hover:border-[#c5a059] transition-all cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a1b1e] text-[#c5a059] border border-slate-800">
              <Wallet className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-semibold text-slate-200">
                  {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-500" />
              </div>
              <div className="hidden sm:block">
                {getRoleBadge(currentAccount.role)}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Strip */}
      <div className="flex lg:hidden overflow-x-auto border-t border-slate-800 px-4 py-2 gap-1 scrollbar-none bg-[#0e0e11]">
        <button
          onClick={() => setActiveTab('verify')}
          className={`shrink-0 rounded-lg px-3 py-1 text-xs font-medium ${
            activeTab === 'verify' ? 'bg-[#c5a059] text-[#0a0a0c] font-bold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          Verify
        </button>
        <button
          onClick={() => setActiveTab('mint')}
          className={`shrink-0 rounded-lg px-3 py-1 text-xs font-medium ${
            activeTab === 'mint' ? 'bg-[#c5a059] text-[#0a0a0c] font-bold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          Mint SBT
        </button>
        <button
          onClick={() => setActiveTab('soulbound')}
          className={`shrink-0 rounded-lg px-3 py-1 text-xs font-medium ${
            activeTab === 'soulbound' ? 'bg-[#c5a059] text-[#0a0a0c] font-bold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          Transfer Test
        </button>
        <button
          onClick={() => setActiveTab('issuers')}
          className={`shrink-0 rounded-lg px-3 py-1 text-xs font-medium ${
            activeTab === 'issuers' ? 'bg-[#c5a059] text-[#0a0a0c] font-bold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          Issuers
        </button>
        <button
          onClick={() => setActiveTab('contract')}
          className={`shrink-0 rounded-lg px-3 py-1 text-xs font-medium ${
            activeTab === 'contract' ? 'bg-[#c5a059] text-[#0a0a0c] font-bold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          Contract
        </button>
        <button
          onClick={() => setActiveTab('tests')}
          className={`shrink-0 rounded-lg px-3 py-1 text-xs font-medium ${
            activeTab === 'tests' ? 'bg-[#c5a059] text-[#0a0a0c] font-bold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          Test Suite
        </button>
      </div>

      {/* Account Switcher & Web3 Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-[#111114] p-6 shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-[#c5a059]" />
                <h3 className="text-base font-bold text-slate-100 font-serif">Switch Wallet / Web3 Role</h3>
              </div>
              <button
                onClick={() => setShowWalletModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Current Account Details */}
            <div className="my-4 rounded-xl bg-[#0a0a0c] p-3.5 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500">Connected Account:</span>
                <button
                  onClick={copyAddress}
                  className="inline-flex items-center gap-1 text-[#c5a059] hover:underline cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy Address
                    </>
                  )}
                </button>
              </div>
              <div className="mt-1 font-mono text-xs font-bold text-slate-200 break-all">
                {currentAccount.address}
              </div>
              <div className="mt-2 flex items-center justify-between">
                {getRoleBadge(currentAccount.role)}
                <span className="font-mono text-xs font-medium text-slate-400">
                  {currentAccount.balanceEth}
                </span>
              </div>
            </div>

            {/* Preconfigured Test Accounts */}
            <p className="text-xs font-semibold text-slate-300 mb-2">
              Select a Role to Test Specific Permissions:
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = acc.address.toLowerCase() === currentAccount.address.toLowerCase();
                return (
                  <button
                    key={acc.address}
                    onClick={() => {
                      onAccountChange(acc);
                      setShowWalletModal(false);
                    }}
                    className={`w-full text-left rounded-xl p-3 border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#c5a059] bg-[#1a1b1e] ring-1 ring-[#c5a059]'
                        : 'border-slate-800 bg-[#0d0d10] hover:border-slate-700 hover:bg-[#151519]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-100 text-xs">{acc.name}</span>
                      {isSelected && <Check className="h-4 w-4 text-[#c5a059]" />}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-mono">{acc.address.slice(0, 10)}...{acc.address.slice(-6)}</span>
                      {getRoleBadge(acc.role)}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Connect External Injected Wallet (MetaMask) */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              {walletNotice && (
                <div className="mb-2.5 rounded-xl border border-amber-800/60 bg-amber-950/30 p-2.5 text-[11px] text-amber-300">
                  {walletNotice}
                </div>
              )}
              <button
                onClick={connectMetaMask}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1a1b1e] py-2.5 text-xs font-semibold text-slate-200 hover:border-[#c5a059] hover:text-[#c5a059] border border-slate-700 transition-all cursor-pointer"
              >
                <Wallet className="h-4 w-4" />
                Connect Browser Wallet (MetaMask)
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
