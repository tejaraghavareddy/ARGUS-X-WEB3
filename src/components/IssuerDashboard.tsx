import React, { useState } from 'react';
import { Web3Account, CertificateMetadata, OnChainCertificate } from '../types';
import { blockchain, DEMO_ACCOUNTS } from '../services/blockchain';
import { uploadMetadataToIpfs } from '../services/ipfs';
import {
  Award,
  ShieldCheck,
  Lock,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  ExternalLink,
  Sparkles,
  ArrowRight,
  RefreshCw,
  User,
  BookOpen,
  Calendar,
  Layers,
  KeyRound,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface IssuerDashboardProps {
  currentAccount: Web3Account;
  onAccountChange: (acc: Web3Account) => void;
  onViewCertificate: (tokenId: number) => void;
}

export const IssuerDashboard: React.FC<IssuerDashboardProps> = ({
  currentAccount,
  onAccountChange,
  onViewCertificate,
}) => {
  const isAuthorized = blockchain.canCallerMint(currentAccount.address);
  const issuerInfo = blockchain.getIssuerInfo(currentAccount.address);

  // Form State
  const [studentName, setStudentName] = useState('Sophia Alverez');
  const [studentAddress, setStudentAddress] = useState('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC');
  const [courseName, setCourseName] = useState('Advanced Decentralized Finance & Automated Market Makers');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [credentialId, setCredentialId] = useState(`CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [grade, setGrade] = useState('Distinction (Top 1%)');
  const [skillsInput, setSkillsInput] = useState('Uniswap v3 Math, Flash Loans, Oracle Manipulation Defense, Liquidity Provisioning');
  const [description, setDescription] = useState(
    'Demonstrated mastery of decentralized financial primitives, constant-product invariant curves, and economic security modeling.'
  );

  // Status & Progress
  const [isMinting, setIsMinting] = useState(false);
  const [mintStep, setMintStep] = useState<'idle' | 'ipfs' | 'blockchain' | 'success'>('idle');
  const [createdCertificate, setCreatedCertificate] = useState<OnChainCertificate | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isAuthorized) {
      setErrorMsg('Transaction rejected: Connected wallet is not an authorized issuer.');
      return;
    }

    if (!studentAddress.startsWith('0x') || studentAddress.length !== 42) {
      setErrorMsg('Invalid Ethereum address. Must begin with 0x and be 42 characters.');
      return;
    }

    try {
      setIsMinting(true);
      setMintStep('ipfs');

      // Step 1: Upload Metadata to IPFS
      const skills = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const metadataToPin: Omit<CertificateMetadata, 'ipfsHash' | 'ipfsMetadataUri'> = {
        studentName,
        studentAddress,
        courseName,
        institution: issuerInfo?.organization || 'Authorized Educational Institution',
        issueDate,
        expirationDate: null,
        credentialId,
        grade,
        skills,
        issuerAddress: currentAccount.address,
        description,
        attributes: [
          { trait_type: 'Institution', value: issuerInfo?.organization || 'Academic Institution' },
          { trait_type: 'Transferability', value: 'Non-Transferable (Soulbound)' },
          { trait_type: 'Standard', value: 'ERC-5192' },
          { trait_type: 'Grade', value: grade },
        ],
      };

      // Slight realistic delay for IPFS pinning simulation
      await new Promise((resolve) => setTimeout(resolve, 800));
      const ipfsResult = await uploadMetadataToIpfs(metadataToPin);

      // Step 2: Mint Soulbound NFT on blockchain
      setMintStep('blockchain');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const { certificate } = await blockchain.mintCertificate({
        studentAddress,
        ipfsHash: ipfsResult.cid,
        metadata: ipfsResult.fullMetadata,
      });

      setCreatedCertificate(certificate);
      setMintStep('success');
      triggerConfetti();

      // Refresh credential ID for next
      setCredentialId(`CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Minting transaction failed on-chain.');
      setMintStep('idle');
    } finally {
      setIsMinting(false);
    }
  };

  const setExampleCourse = (title: string, desc: string, defaultGrade: string) => {
    setCourseName(title);
    setDescription(desc);
    setGrade(defaultGrade);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header Banner */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold tracking-wider text-[#c5a059] uppercase">
              Issuer Portal
            </span>
            <span className="rounded-md bg-[#111114] border border-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-400">
              ERC-5192 Engine
            </span>
          </div>
          <h1 className="mt-1 font-serif text-3xl font-bold text-slate-100">
            Mint Soulbound NFT Certificates
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Store immutable academic credentials on IPFS and mint non-transferable certificates to student wallets.
          </p>
        </div>

        {/* Current Issuer Status Card */}
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-[#111114] p-3 shadow-md">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
              isAuthorized ? 'bg-emerald-950/70 border border-emerald-800/60 text-emerald-400' : 'bg-amber-950/70 border border-amber-800/60 text-amber-400'
            }`}
          >
            {isAuthorized ? '🏛️' : '⚠️'}
          </div>
          <div className="text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <span>{issuerInfo ? issuerInfo.organization : currentAccount.name}</span>
            </div>
            <div className="mt-0.5">
              {isAuthorized ? (
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                  <ShieldCheck className="h-3 w-3" /> Whitelisted Issuer (Active)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                  <AlertTriangle className="h-3 w-3" /> Unauthorized Caller
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Warning if current account is not authorized */}
      {!isAuthorized && (
        <div className="mb-8 rounded-2xl border border-amber-900/60 bg-amber-950/40 p-5 text-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
            <div className="flex-1 text-xs">
              <h4 className="font-bold text-sm text-amber-300">Access Restricted: Connected Wallet is not Whitelisted</h4>
              <p className="mt-1 leading-relaxed text-amber-200/80">
                The smart contract modifier <code className="font-mono bg-amber-900/50 px-1 py-0.5 rounded text-amber-200">onlyAuthorizedIssuer()</code> prevents unauthorized addresses from forging credentials. Switch to a pre-whitelisted university account to mint certificates.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => onAccountChange(DEMO_ACCOUNTS[0])}
                  className="rounded-xl bg-[#c5a059] px-3 py-1.5 font-bold text-[#0a0a0c] hover:bg-[#d4b57a] text-xs transition-colors cursor-pointer"
                >
                  Switch to Dr. Sarah Connor (MIT Computing)
                </button>
                <button
                  onClick={() => onAccountChange(DEMO_ACCOUNTS[1])}
                  className="rounded-xl bg-[#1a1b1e] border border-slate-700 px-3 py-1.5 font-medium text-slate-200 hover:border-[#c5a059] text-xs transition-colors cursor-pointer"
                >
                  Switch to Prof. David Wu (Stanford Center)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Minting Success Modal / Card */}
      {mintStep === 'success' && createdCertificate && (
        <div className="mb-8 rounded-3xl border border-emerald-800/60 bg-gradient-to-br from-emerald-950/60 to-[#111114] p-6 shadow-2xl text-slate-200 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-800/40 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-[#0a0a0c] shadow-lg">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  MINTING SUCCESSFUL • BLOCK #{createdCertificate.blockNumber}
                </span>
                <h3 className="text-xl font-bold font-serif text-white">
                  Token #{createdCertificate.tokenId} Successfully Bound to Wallet
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewCertificate(createdCertificate.tokenId)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#c5a059] px-4 py-2 text-xs font-bold text-[#0a0a0c] shadow-md hover:bg-[#d4b57a] transition-all cursor-pointer"
              >
                Inspect in Public Verifier
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs font-mono">
            <div className="rounded-xl bg-[#0a0a0c] p-3 border border-slate-800">
              <span className="text-slate-500">Student Address:</span>
              <p className="font-semibold text-slate-200 mt-1 truncate">
                {createdCertificate.owner}
              </p>
            </div>
            <div className="rounded-xl bg-[#0a0a0c] p-3 border border-slate-800">
              <span className="text-slate-500">IPFS Multihash CID:</span>
              <p className="font-semibold text-[#c5a059] mt-1 truncate">
                {createdCertificate.ipfsHash}
              </p>
            </div>
            <div className="rounded-xl bg-[#0a0a0c] p-3 border border-slate-800">
              <span className="text-slate-500">Transaction Hash:</span>
              <p className="font-semibold text-slate-200 mt-1 truncate">
                {createdCertificate.txHash}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout: Form (Left) & Real-Time Certificate Preview (Right) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Minting Form */}
        <div className="lg:col-span-7 space-y-6">
          <form
            onSubmit={handleMint}
            className="rounded-2xl border border-slate-800 bg-[#111114] p-6 shadow-xl sm:p-8 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-[#c5a059]" />
                <h2 className="font-serif text-lg font-bold text-slate-100">
                  Certificate Issuance Parameters
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-500">
                EIP-5192 Compatible
              </span>
            </div>

            {errorMsg && (
              <div className="rounded-xl border border-rose-900/60 bg-rose-950/40 p-3.5 text-xs text-rose-300">
                {errorMsg}
              </div>
            )}

            {/* Recipient Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-[#c5a059]" />
                1. Recipient Details
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Student Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                    placeholder="e.g. Elena Rostova"
                    className="w-full rounded-xl border border-slate-700 bg-[#0a0a0c] p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:border-[#c5a059] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Student Ethereum Wallet Address
                  </label>
                  <input
                    type="text"
                    value={studentAddress}
                    onChange={(e) => setStudentAddress(e.target.value)}
                    required
                    placeholder="0x..."
                    className="w-full rounded-xl border border-slate-700 bg-[#0a0a0c] p-2.5 font-mono text-xs text-slate-200 placeholder-slate-600 focus:border-[#c5a059] focus:outline-none"
                  />
                </div>
              </div>

              {/* Preset Student Addresses */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-500">Quick Test Wallets:</span>
                <button
                  type="button"
                  onClick={() => {
                    setStudentName('Elena Rostova');
                    setStudentAddress('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC');
                  }}
                  className="rounded-md border border-slate-800 bg-[#1a1b1e] px-2 py-0.5 text-slate-400 hover:border-[#c5a059] hover:text-[#c5a059] cursor-pointer"
                >
                  Elena (0x3C44...93BC)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStudentName('Marcus Vance');
                    setStudentAddress('0x90F79bf6EB2c4f870365E785982E1f101E93b906');
                  }}
                  className="rounded-md border border-slate-800 bg-[#1a1b1e] px-2 py-0.5 text-slate-400 hover:border-[#c5a059] hover:text-[#c5a059] cursor-pointer"
                >
                  Marcus (0x90F7...b906)
                </button>
              </div>
            </div>

            {/* Academic Credential Details */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-[#c5a059]" />
                2. Academic Program & Degree
              </h3>

              {/* Example Course Templates */}
              <div>
                <span className="text-[11px] text-slate-500 block mb-1.5">Curriculum Presets:</span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      setExampleCourse(
                        'Master of Science in Distributed Systems & Consensus',
                        'Demonstrated comprehensive mastery of Byzantine Fault Tolerance, Raft protocols, and distributed consensus.',
                        'Summa Cum Laude (Top 1%)'
                      )
                    }
                    className="rounded-lg border border-slate-800 bg-[#1a1b1e] px-2.5 py-1 text-slate-400 hover:border-[#c5a059] hover:text-[#c5a059] cursor-pointer text-[11px]"
                  >
                    Distributed Systems (MIT)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setExampleCourse(
                        'Applied Zero-Knowledge Cryptography & zk-SNARKs',
                        'Engineered arithmetic circuits in Circom and deployed Groth16 verification contracts with optimal gas invariants.',
                        'Honors with Distinction'
                      )
                    }
                    className="rounded-lg border border-slate-800 bg-[#1a1b1e] px-2.5 py-1 text-slate-400 hover:border-[#c5a059] hover:text-[#c5a059] cursor-pointer text-[11px]"
                  >
                    Zero-Knowledge (Stanford)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Credential / Program Title
                </label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                  placeholder="e.g. Master of Science in Distributed Systems"
                  className="w-full rounded-xl border border-slate-700 bg-[#0a0a0c] p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:border-[#c5a059] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Academic Standing / Grade
                  </label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="e.g. Distinction, Summa Cum Laude, A+"
                    className="w-full rounded-xl border border-slate-700 bg-[#0a0a0c] p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:border-[#c5a059] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Unique Institutional Credential ID
                  </label>
                  <input
                    type="text"
                    value={credentialId}
                    onChange={(e) => setCredentialId(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-[#0a0a0c] p-2.5 font-mono text-xs text-slate-200 focus:border-[#c5a059] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Demonstrated Competencies (comma-separated)
                </label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="e.g. Solidity, Raft, Cryptography, EVM Invariants"
                  className="w-full rounded-xl border border-slate-700 bg-[#0a0a0c] p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:border-[#c5a059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Citation / Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-[#0a0a0c] p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:border-[#c5a059] focus:outline-none"
                />
              </div>
            </div>

            {/* Submission Action */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={isMinting || !isAuthorized}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c5a059] px-6 py-3.5 text-xs font-bold text-[#0a0a0c] shadow-lg hover:bg-[#d4b57a] uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer"
              >
                {isMinting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    {mintStep === 'ipfs' && 'Uploading & Pinning Metadata to IPFS...'}
                    {mintStep === 'blockchain' && 'Broadcasting Soulbound Mint Tx to EVM...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Pin to IPFS & Mint Soulbound Certificate
                  </>
                )}
              </button>
              <p className="mt-2 text-center text-[11px] text-slate-500 font-mono">
                Requires authorized issuer signature • Permanent token lock (EIP-5192)
              </p>
            </div>
          </form>
        </div>

        {/* Right Column: Live Visual Diploma Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-28 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-serif text-sm font-bold text-slate-300 flex items-center gap-2">
                <Award className="h-4 w-4 text-[#c5a059]" />
                Real-Time Certificate Preview
              </span>
              <span className="rounded-md bg-[#1a1b1e] border border-slate-800 px-2 py-0.5 text-[10px] font-mono text-[#c5a059]">
                Live Renderer
              </span>
            </div>

            {/* Dark Luxury Diploma Preview */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-[#c5a059]/30 bg-[#0d0d11] p-6 shadow-2xl">
              <div className="pointer-events-none absolute inset-2 rounded-xl border border-[#c5a059]/20 border-dashed" />

              <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#c5a059] text-[#0a0a0c]">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-bold tracking-wider text-[#c5a059] uppercase">
                      SOULBOUND NFT
                    </span>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {issuerInfo?.organization || 'Authorized University'}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#1a1b1e] border border-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                  <Lock className="h-2.5 w-2.5 text-[#c5a059]" /> Locked
                </span>
              </div>

              <div className="relative z-10 my-6 text-center">
                <p className="font-serif text-[10px] tracking-widest text-[#c5a059]/80 uppercase">
                  Certificate of Completion
                </p>
                <h3 className="mt-1 font-serif text-xl font-bold text-slate-100 line-clamp-1">
                  {studentName || 'Recipient Student Name'}
                </h3>
                <p className="mt-1 font-mono text-[10px] text-[#c5a059]">
                  {studentAddress ? `${studentAddress.slice(0, 8)}...${studentAddress.slice(-6)}` : '0x...'}
                </p>

                <div className="my-3 rounded-xl bg-[#111114] p-3 border border-slate-800">
                  <h4 className="font-serif text-sm font-bold text-[#c5a059] line-clamp-2">
                    {courseName || 'Program Title'}
                  </h4>
                  {grade && (
                    <span className="mt-1 inline-block font-mono text-[10px] font-semibold text-emerald-400">
                      {grade}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {description || 'Academic completion citation...'}
                </p>
              </div>

              <div className="relative z-10 flex items-center justify-between border-t border-slate-800 pt-3 text-[10px] text-slate-500">
                <span>Date: {issueDate}</span>
                <span className="font-mono text-[#c5a059]">ID: {credentialId}</span>
              </div>
            </div>

            {/* Architecture Explainer Card */}
            <div className="rounded-2xl border border-slate-800 bg-[#111114] p-4 text-xs text-slate-400 space-y-2">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-[#c5a059]" />
                How Minting Works
              </span>
              <p className="text-[11px] leading-relaxed">
                1. <strong>Decentralized IPFS Pinning:</strong> Metadata JSON is hashed with SHA-256 multihash, generating a permanent CID (<code className="font-mono text-[#c5a059]">Qm...</code>).
              </p>
              <p className="text-[11px] leading-relaxed">
                2. <strong>EVM Smart Contract:</strong> Executes <code className="font-mono text-[#c5a059]">mintCertificate()</code> with <code className="font-mono text-[#c5a059]">onlyAuthorizedIssuer</code>, stores the CID in on-chain storage, and locks the token permanently under EIP-5192.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
