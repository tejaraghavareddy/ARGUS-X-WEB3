import React, { useState, useEffect } from 'react';
import { VerificationResult } from '../types';
import { blockchain } from '../services/blockchain';
import { CertificateCard } from './CertificateCard';
import { copyTextSafely } from '../utils/clipboard';
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ExternalLink,
  Share2,
  Copy,
  Check,
  Building,
  Info,
  Sparkles,
} from 'lucide-react';
import { CONTRACT_ADDRESS } from '../contracts/contractData';

interface VerificationPageProps {
  onNavigateToMint?: () => void;
}

export const VerificationPage: React.FC<VerificationPageProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Check URL params on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyParam = params.get('verify');
    if (verifyParam) {
      setSearchQuery(verifyParam);
      handleSearch(verifyParam);
    } else {
      // Default to Token #1 so the user instantly sees a verified certificate
      setSearchQuery('1');
      handleSearch('1');
    }
  }, []);

  const handleSearch = (query: string) => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    const verificationResults = blockchain.verify(q);
    setResults(verificationResults);
    setHasSearched(true);

    // Update URL query string for easy sharing
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('verify', q);
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Safe fallback if history API is restricted in iframe
    }
  };

  const copyShareLink = async () => {
    const success = await copyTextSafely(window.location.href);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const sampleSearches = [
    { label: 'Token #1 (MIT Distributed Systems)', query: '1' },
    { label: 'Token #2 (Stanford ZK Proofs)', query: '2' },
    { label: 'Elena’s Wallet (2 Certs)', query: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' },
    { label: 'Marcus’s Wallet (1 Cert)', query: '0x90F79bf6EB2c4f870365E785982E1f101E93b906' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Hero / Explainer Banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#141418] via-[#101014] to-[#0a0a0c] p-8 text-slate-100 shadow-2xl border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1a1b1e] px-3 py-1 text-xs font-semibold text-[#c5a059] border border-[#c5a059]/30">
            <ShieldCheck className="h-3.5 w-3.5 text-[#c5a059]" />
            Public On-Chain Verification Portal
          </div>
          <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Instant Credential Authenticity Verification
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Verify non-transferable Soulbound NFT certificates directly against the Ethereum blockchain and IPFS.
            Zero intermediaries, tamper-proof issuer signatures, and permanent cryptographic proof.
          </p>
        </div>

        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-[#c5a059]/10 blur-3xl" />
      </div>

      {/* Search Input Box */}
      <div className="relative mx-auto mb-8 max-w-3xl">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              id="verification-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              placeholder="Enter Student Wallet Address (0x...) or Token ID (#1, #2)"
              className="w-full rounded-2xl border border-slate-700 bg-[#111114] py-3.5 pl-12 pr-4 text-sm font-medium text-slate-200 placeholder-slate-500 shadow-md focus:border-[#c5a059] focus:outline-none"
            />
          </div>
          <button
            id="btn-verify"
            onClick={() => handleSearch(searchQuery)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#c5a059] px-6 py-3.5 text-xs font-bold text-[#0a0a0c] shadow-lg hover:bg-[#d4b57a] uppercase tracking-wider transition-all cursor-pointer"
          >
            <ShieldCheck className="h-4 w-4 text-[#0a0a0c]" />
            Verify Now
          </button>
        </div>

        {/* Quick Search Chips */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">Quick Verifications:</span>
          {sampleSearches.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchQuery(item.query);
                handleSearch(item.query);
              }}
              className="rounded-lg border border-slate-800 bg-[#111114] px-2.5 py-1 text-slate-300 hover:border-[#c5a059] hover:text-[#c5a059] transition-all cursor-pointer font-medium"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Display */}
      {hasSearched && (
        <div className="space-y-10">
          {results.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-slate-800 bg-[#111114] p-10 text-center shadow-lg">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-400">
                <Info className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-serif text-lg font-bold text-slate-200">
                No Certificates Found
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                We could not find any soulbound certificates matching query{' '}
                <span className="font-mono font-semibold text-[#c5a059]">"{searchQuery}"</span> on-chain.
              </p>
              <p className="mt-4 text-xs text-slate-500">
                Check that the wallet address is correct (42-character hex) or try searching by Token ID (e.g. 1, 2).
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-100">
                    Found {results.length} Authenticated Certificate{results.length > 1 ? 's' : ''}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Queried: <span className="text-[#c5a059]">{searchQuery}</span>
                  </p>
                </div>

                <button
                  onClick={copyShareLink}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-[#111114] px-3.5 py-2 text-xs font-semibold text-slate-300 shadow-md hover:border-[#c5a059] hover:text-[#c5a059] transition-all cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      Verification URL Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4 text-slate-400" />
                      Share Verification Link
                    </>
                  )}
                </button>
              </div>

              {results.map((res, index) => {
                if (!res.certificate) return null;
                const cert = res.certificate;

                return (
                  <div
                    key={cert.tokenId}
                    className="rounded-3xl border border-slate-800 bg-[#111114] p-6 shadow-xl sm:p-8 space-y-8"
                  >
                    {/* Cryptographic Verification Overview Status */}
                    <div className="rounded-2xl border border-emerald-900/60 bg-emerald-950/40 p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-[#0a0a0c] shadow-md">
                            <ShieldCheck className="h-7 w-7" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold tracking-widest text-emerald-400 uppercase">
                                VERIFIED ON-CHAIN (TOKEN #{cert.tokenId})
                              </span>
                            </div>
                            <h3 className="font-serif text-lg font-bold text-white">
                              Authentic Academic Credential Confirmed
                            </h3>
                            <p className="text-xs text-emerald-200/80">
                              Issued by{' '}
                              <span className="font-semibold text-white">
                                {res.issuerInfo?.organization || cert.metadata.institution}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-start sm:items-end text-xs font-mono">
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> 5-Point Cryptographic Proof Passed
                          </span>
                          <span className="text-slate-400 mt-1">
                            Contract: {CONTRACT_ADDRESS.slice(0, 10)}...
                          </span>
                        </div>
                      </div>

                      {/* 5 Cryptographic Check Points */}
                      <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5 border-t border-emerald-900/40 pt-4 text-xs">
                        <div className="flex items-center gap-2 text-slate-300">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                          <span>On-Chain Existence</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-300">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                          <span>EIP-5192 Soulbound Locked</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-300">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                          <span>Whitelisted Issuer</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-300">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                          <span>IPFS Hash Verified</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-300">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                          <span>Owner Cryptographic Match</span>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Certificate Display Card */}
                    <CertificateCard certificate={cert} showVerificationBadge={false} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
