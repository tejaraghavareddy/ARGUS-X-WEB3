import React, { useState } from 'react';
import { OnChainCertificate } from '../types';
import { CONTRACT_ADDRESS } from '../contracts/contractData';
import { copyTextSafely } from '../utils/clipboard';
import {
  Award,
  Lock,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  FileCode,
  Check,
  Copy,
  Download,
} from 'lucide-react';

interface CertificateCardProps {
  certificate: OnChainCertificate;
  showVerificationBadge?: boolean;
  compact?: boolean;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  showVerificationBadge = true,
  compact = false,
}) => {
  const { tokenId, owner, issuer, isLocked, metadata, ipfsHash } = certificate;
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const truncate = (str: string, start = 6, end = 4) => {
    if (!str) return '';
    return `${str.slice(0, start)}...${str.slice(-end)}`;
  };

  const copyIpfsHash = async () => {
    const success = await copyTextSafely(ipfsHash);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (compact) {
    return (
      <div
        id={`cert-compact-${tokenId}`}
        className="group relative rounded-xl border border-slate-800 bg-[#111114] p-5 shadow-lg transition-all hover:border-[#c5a059] hover:shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30">
              <Award className="h-4 w-4" />
            </span>
            <div>
              <span className="font-mono text-xs font-semibold text-[#c5a059]">Token #{tokenId}</span>
              <h4 className="line-clamp-1 font-serif text-base font-semibold text-slate-100">
                {metadata.courseName}
              </h4>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#1a1b1e] px-2.5 py-0.5 text-xs font-medium text-[#c5a059] border border-[#c5a059]/30">
            <Lock className="h-3 w-3 text-[#c5a059]" />
            Soulbound
          </span>
        </div>

        <p className="mt-2 text-sm text-slate-400">
          Awarded to <span className="font-semibold text-slate-200">{metadata.studentName}</span>
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-500">
          <span>{metadata.institution}</span>
          <span className="font-mono text-[#c5a059]">{truncate(owner)}</span>
        </div>
      </div>
    );
  }

  return (
    <div id={`cert-full-${tokenId}`} className="relative mx-auto w-full max-w-3xl">
      {/* Sophisticated Dark Academic Diploma Frame */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-[#c5a059]/40 bg-[#0d0d11] p-6 shadow-2xl sm:p-10">
        {/* Subtle Guilloche / Inset Borders with Gold Accents */}
        <div className="pointer-events-none absolute inset-2 rounded-xl border border-[#c5a059]/20 border-dashed" />
        <div className="pointer-events-none absolute inset-3.5 rounded-lg border border-slate-800" />

        {/* Top Watermark / Status Header */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c5a059] text-[#0a0a0c] shadow-md">
              <Award className="h-6 w-6 text-[#0a0a0c]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold tracking-widest text-[#c5a059] uppercase">
                  SOULBOUND CREDENTIAL
                </span>
                <span className="rounded-md bg-[#1a1b1e] px-2 py-0.5 font-mono text-xs font-semibold text-slate-300 border border-slate-700">
                  #{tokenId}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-400">{metadata.institution}</p>
            </div>
          </div>

          {showVerificationBadge && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/50 border border-emerald-800/60 px-3 py-1 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                On-Chain Verified
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#1a1b1e] border border-slate-800 px-2.5 py-1 text-xs font-medium text-slate-400">
                <Lock className="h-3 w-3 text-[#c5a059]" />
                EIP-5192 Soulbound
              </span>
            </div>
          )}
        </div>

        {/* Certificate Core Content */}
        <div className="relative z-10 my-8 text-center">
          <p className="font-serif text-xs tracking-widest text-[#c5a059]/80 uppercase">
            Official Certificate of Completion & Achievement
          </p>

          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-[#f8fafc] sm:text-4xl">
            {metadata.studentName}
          </h2>

          <div className="mx-auto my-3 flex items-center justify-center gap-2 text-xs font-mono text-slate-500">
            <span>Recipient Wallet:</span>
            <span className="rounded-md bg-[#1a1b1e] border border-slate-800 px-2 py-0.5 text-[#c5a059] font-semibold">
              {truncate(owner, 8, 6)}
            </span>
          </div>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-400">
            has demonstrated mastery and satisfied all rigorous academic requirements for the curriculum of
          </p>

          <div className="mx-auto my-4 max-w-xl rounded-xl bg-[#111114] p-4 border border-slate-800">
            <h3 className="font-serif text-xl font-bold text-[#c5a059] sm:text-2xl">
              {metadata.courseName}
            </h3>
            {metadata.grade && (
              <span className="mt-2 inline-block font-mono text-xs font-semibold text-emerald-400">
                {metadata.grade}
              </span>
            )}
          </div>

          {metadata.skills && metadata.skills.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
              {metadata.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded-md border border-slate-800 bg-[#1a1b1e] px-2.5 py-0.5 text-[11px] font-medium text-slate-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Certificate Footer / Signatures & Cryptographic Proof */}
        <div className="relative z-10 grid grid-cols-1 gap-6 border-t border-slate-800 pt-6 sm:grid-cols-3">
          {/* Issuer Signature Section */}
          <div className="flex flex-col justify-end text-center sm:text-left">
            <div className="font-serif italic text-base text-slate-200 font-medium pb-1 border-b border-slate-700">
              {metadata.institution}
            </div>
            <span className="mt-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Authorized Authority
            </span>
            <span className="font-mono text-[10px] text-[#c5a059]">Issuer: {truncate(issuer, 6, 4)}</span>
          </div>

          {/* Brass / Gold Seal of Authenticity */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#c5a059] shadow-lg ring-4 ring-[#c5a059]/20">
              <div className="absolute inset-1 rounded-full border border-dashed border-[#0a0a0c]/60" />
              <div className="text-center">
                <CheckCircle2 className="mx-auto h-5 w-5 text-[#0a0a0c]" />
                <span className="block text-[8px] font-extrabold text-[#0a0a0c] uppercase tracking-tighter">
                  VERIFIED
                </span>
              </div>
            </div>
            <span className="mt-2 font-mono text-[10px] text-slate-400">ID: {metadata.credentialId}</span>
          </div>

          {/* Date and EIP Details */}
          <div className="flex flex-col justify-end text-center sm:text-right">
            <div className="font-mono text-xs font-semibold text-slate-300 pb-1 border-b border-slate-700">
              {metadata.issueDate}
            </div>
            <span className="mt-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Date of Issuance
            </span>
            <span className="font-mono text-[10px] text-emerald-400 font-medium">
              EIP-5192: {isLocked ? 'Permanent Lock' : 'Unlocked'}
            </span>
          </div>
        </div>

        {/* Blockchain & IPFS verification bar - Dark Sophisticated */}
        <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#111114] p-3 text-xs text-slate-400 border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">IPFS CID:</span>
            <a
              href={`https://ipfs.io/ipfs/${ipfsHash}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[#c5a059] hover:underline"
            >
              {truncate(ipfsHash, 10, 6)}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMetadataModal(true)}
              className="inline-flex items-center gap-1 rounded-md bg-[#1a1b1e] px-2.5 py-1 text-xs font-medium text-slate-300 shadow-sm hover:border-[#c5a059] hover:text-[#c5a059] border border-slate-700 cursor-pointer"
            >
              <FileCode className="h-3 w-3 text-[#c5a059]" />
              Inspect IPFS JSON
            </button>
            <button
              onClick={() => {
                try {
                  window.print();
                } catch {
                  console.warn('Printing not permitted in this context');
                }
              }}
              className="inline-flex items-center gap-1 rounded-md bg-[#c5a059] px-2.5 py-1 text-xs font-bold text-[#0a0a0c] hover:bg-[#d4b57a] uppercase tracking-wider cursor-pointer"
            >
              Print / Save
            </button>
          </div>
        </div>
      </div>

      {/* IPFS Metadata JSON Inspection Modal */}
      {showMetadataModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#111114] p-6 shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-[#c5a059]" />
                <h4 className="text-base font-bold text-slate-100 font-serif">Decentralized IPFS Metadata</h4>
              </div>
              <button
                onClick={() => setShowMetadataModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-[#0a0a0c] p-2.5 font-mono border border-slate-800">
                <span className="text-slate-500">IPFS URI:</span>
                <span className="font-semibold text-[#c5a059]">ipfs://{ipfsHash}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[#0a0a0c] p-2.5 font-mono border border-slate-800">
                <span className="text-slate-500">Smart Contract:</span>
                <span className="font-semibold text-slate-200">{CONTRACT_ADDRESS}</span>
              </div>
            </div>

            <pre className="max-h-72 overflow-auto rounded-xl bg-[#0a0a0c] p-4 font-mono text-xs text-[#c5a059] border border-slate-800">
              {JSON.stringify(metadata, null, 2)}
            </pre>

            <div className="mt-4 flex justify-end gap-2">
              <a
                href={`https://ipfs.io/ipfs/${ipfsHash}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#1a1b1e] px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-[#c5a059] hover:text-[#c5a059]"
              >
                Open IPFS Gateway
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                onClick={() => setShowMetadataModal(false)}
                className="rounded-lg bg-[#c5a059] px-4 py-1.5 text-xs font-bold text-[#0a0a0c] hover:bg-[#d4b57a] uppercase tracking-wider cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
