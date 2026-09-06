import React, { useState, useEffect } from 'react';
import { Web3Account, OnChainCertificate } from './types';
import { blockchain } from './services/blockchain';
import { Header } from './components/Header';
import { VerificationPage } from './components/VerificationPage';
import { IssuerDashboard } from './components/IssuerDashboard';
import { SoulboundDemo } from './components/SoulboundDemo';
import { IssuerManagement } from './components/IssuerManagement';
import { ContractViewer } from './components/ContractViewer';
import { TestSuiteRunner } from './components/TestSuiteRunner';
import { Award, RotateCcw } from 'lucide-react';
import { CONTRACT_ADDRESS } from './contracts/contractData';

export default function App() {
  const [activeTab, setActiveTab] = useState<'verify' | 'mint' | 'soulbound' | 'issuers' | 'contract' | 'tests'>('verify');
  const [currentAccount, setCurrentAccount] = useState<Web3Account>(blockchain.getCurrentAccount());
  const [certificates, setCertificates] = useState<OnChainCertificate[]>(blockchain.getCertificates());
  const [blockNumber, setBlockNumber] = useState<number>(blockchain.getBlockNumber());

  // Subscribe to blockchain state updates
  useEffect(() => {
    const unsubscribe = blockchain.subscribe(() => {
      setCertificates(blockchain.getCertificates());
      setCurrentAccount(blockchain.getCurrentAccount());
      setBlockNumber(blockchain.getBlockNumber());
    });
    return () => unsubscribe();
  }, []);

  const [showResetModal, setShowResetModal] = useState(false);

  const handleAccountChange = (acc: Web3Account) => {
    blockchain.switchAccount(acc);
    setCurrentAccount(acc);
  };

  const handleViewCertificate = (tokenId: number) => {
    setActiveTab('verify');
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('verify', tokenId.toString());
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Safe fallback if history manipulation is restricted in iframe
    }

    // Trigger verification search on page
    setTimeout(() => {
      const input = document.getElementById('verification-search-input') as HTMLInputElement;
      if (input) {
        input.value = tokenId.toString();
        const btn = document.getElementById('btn-verify');
        if (btn) btn.click();
      }
    }, 100);
  };

  const confirmReset = () => {
    blockchain.resetToDefault();
    setShowResetModal(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 flex flex-col font-sans selection:bg-[#c5a059]/30 selection:text-[#f8fafc]">
      {/* Top Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentAccount={currentAccount}
        onAccountChange={handleAccountChange}
        certCount={certificates.length}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'verify' && <VerificationPage onNavigateToMint={() => setActiveTab('mint')} />}
        {activeTab === 'mint' && (
          <IssuerDashboard
            currentAccount={currentAccount}
            onAccountChange={handleAccountChange}
            onViewCertificate={handleViewCertificate}
          />
        )}
        {activeTab === 'soulbound' && (
          <SoulboundDemo certificates={certificates} currentAccount={currentAccount} />
        )}
        {activeTab === 'issuers' && (
          <IssuerManagement currentAccount={currentAccount} onAccountChange={handleAccountChange} />
        )}
        {activeTab === 'contract' && <ContractViewer />}
        {activeTab === 'tests' && <TestSuiteRunner />}
      </main>

      {/* Footer & On-Chain Telemetry Bar */}
      <footer className="border-t border-slate-800 bg-[#0a0a0c] py-6 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#c5a059] text-[#0a0a0c]">
              <Award className="h-3.5 w-3.5 text-[#0a0a0c]" />
            </div>
            <span className="font-serif font-bold text-slate-300">
              CertSoul • EIP-5192 Soulbound Certificate dApp
            </span>
          </div>

          {/* Quick On-Chain Metrics */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Block #{blockNumber}
            </span>
            <span className="text-slate-700">•</span>
            <span>Total Minted: {certificates.length}</span>
            <span className="text-slate-700">•</span>
            <span>Contract: {CONTRACT_ADDRESS.slice(0, 8)}...</span>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => setShowResetModal(true)}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-[#c5a059] transition-colors cursor-pointer"
              title="Reset Demo Data"
            >
              <RotateCcw className="h-3 w-3" /> Reset State
            </button>
          </div>
        </div>
      </footer>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#111114] p-6 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-slate-100">
              Reset On-Chain State?
            </h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              This will restore all simulated certificates, issuers, and transaction histories back to the factory seed state.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="rounded-xl border border-slate-700 bg-[#1a1b1e] px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmReset}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 transition-all cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
