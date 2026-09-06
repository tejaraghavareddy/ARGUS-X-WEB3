import React, { useState } from 'react';
import { ContractTestSuite, TestCaseResult } from '../services/testRunner';
import { copyTextSafely } from '../utils/clipboard';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Code2,
  Terminal,
  ShieldCheck,
  Lock,
  Database,
  FileCheck,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';

export const TestSuiteRunner: React.FC = () => {
  const [testCases, setTestCases] = useState<TestCaseResult[]>(ContractTestSuite.getInitialTestCases());
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);
  const [copiedHardhatCode, setCopiedHardhatCode] = useState(false);
  const [viewMode, setViewMode] = useState<'interactive' | 'hardhat-code'>('interactive');

  const runSingleTest = async (testId: string) => {
    setTestCases((prev) =>
      prev.map((t) => (t.id === testId ? { ...t, status: 'running' } : t))
    );

    const result = await ContractTestSuite.runTest(testId);

    setTestCases((prev) =>
      prev.map((t) => (t.id === testId ? result : t))
    );
    setExpandedTestId(testId);
  };

  const runAllTests = async () => {
    setIsRunningAll(true);
    // Reset all to pending first
    setTestCases((prev) => prev.map((t) => ({ ...t, status: 'pending', logs: [] })));

    const initial = ContractTestSuite.getInitialTestCases();
    for (const test of initial) {
      setTestCases((prev) =>
        prev.map((t) => (t.id === test.id ? { ...t, status: 'running' } : t))
      );
      // Small visual pacing
      await new Promise((r) => setTimeout(r, 200));
      const result = await ContractTestSuite.runTest(test.id);
      setTestCases((prev) =>
        prev.map((t) => (t.id === test.id ? result : t))
      );
    }
    setIsRunningAll(false);
  };

  const resetTests = () => {
    setTestCases(ContractTestSuite.getInitialTestCases());
    setExpandedTestId(null);
  };

  const passedCount = testCases.filter((t) => t.status === 'passed').length;
  const failedCount = testCases.filter((t) => t.status === 'failed').length;
  const totalCount = testCases.length;

  const filteredTests = testCases.filter((t) => {
    if (selectedCategory === 'All') return true;
    return t.category === selectedCategory;
  });

  const categories = ['All', 'Access Control', 'EIP-5192 Soulbound', 'IPFS & Integrity', 'Registry & State'];

  const HARDHAT_TEST_CODE = `import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

describe("SoulboundCertificate (ERC-5192)", function () {
  let soulboundCert: Contract;
  let owner: Signer, mitIssuer: Signer, studentElena: Signer, attacker: Signer;

  beforeEach(async function () {
    [owner, mitIssuer, studentElena, attacker] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("SoulboundCertificate");
    soulboundCert = await Factory.deploy("Soulbound Credential", "SBT", await owner.getAddress());
    
    // Authorize MIT Issuer
    await soulboundCert.connect(owner).setIssuerStatus(
      await mitIssuer.getAddress(), true, "MIT Computing", "MIT", "https://mit.edu"
    );
  });

  it("TC-01: Reverts unauthorized mint calls", async () => {
    await expect(
      soulboundCert.connect(attacker).mintCertificate(await studentElena.getAddress(), "QmHash...")
    ).to.be.revertedWith("SoulboundCert: Caller is not an authorized issuer");
  });

  it("TC-02: Whitelisted issuer mints & emits Locked event", async () => {
    const tx = await soulboundCert.connect(mitIssuer).mintCertificate(
      await studentElena.getAddress(), "QmHash..."
    );
    await expect(tx).to.emit(soulboundCert, "Locked").withArgs(1);
    expect(await soulboundCert.ownerOf(1)).to.equal(await studentElena.getAddress());
  });

  it("TC-03: Reverts transferFrom secondary transfer attempts", async () => {
    await soulboundCert.connect(mitIssuer).mintCertificate(await studentElena.getAddress(), "QmHash...");
    await expect(
      soulboundCert.connect(studentElena).transferFrom(
        await studentElena.getAddress(), await attacker.getAddress(), 1
      )
    ).to.be.revertedWith("Soulbound: Token transfers are prohibited. Certificate is non-transferable.");
  });

  it("TC-04: Returns locked(1) == true per EIP-5192", async () => {
    await soulboundCert.connect(mitIssuer).mintCertificate(await studentElena.getAddress(), "QmHash...");
    expect(await soulboundCert.locked(1)).to.be.true;
  });
});`;

  const copyHardhatScript = async () => {
    const success = await copyTextSafely(HARDHAT_TEST_CODE);
    if (success) {
      setCopiedHardhatCode(true);
      setTimeout(() => setCopiedHardhatCode(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header Banner */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold tracking-wider text-[#c5a059] uppercase">
              Smart Contract Verification
            </span>
            <span className="rounded-md bg-[#111114] border border-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-400">
              EVM Invariants & Assertions
            </span>
          </div>
          <h1 className="mt-1 font-serif text-3xl font-bold text-slate-100">
            Automated Smart Contract Test Suite
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Execute unit and integration tests verifying EIP-5192 non-transferability, access controls, and IPFS integrity.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 rounded-xl bg-[#111114] p-1 border border-slate-800">
          <button
            onClick={() => setViewMode('interactive')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'interactive'
                ? 'bg-[#1a1b1e] text-[#c5a059] border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="h-3.5 w-3.5" />
            Interactive Test Runner
          </button>
          <button
            onClick={() => setViewMode('hardhat-code')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'hardhat-code'
                ? 'bg-[#1a1b1e] text-[#c5a059] border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            Hardhat / Mocha Spec
          </button>
        </div>
      </div>

      {viewMode === 'interactive' ? (
        <div className="space-y-6">
          {/* Metrics & Execution Controls */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-[#111114] p-4 shadow-xl">
              <span className="text-xs text-slate-400 font-medium">Test Coverage</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-serif text-2xl font-bold text-slate-100">{totalCount} Cases</span>
                <span className="text-[11px] font-mono text-emerald-400">100% Invariants</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#111114] p-4 shadow-xl">
              <span className="text-xs text-slate-400 font-medium">Passed Assertions</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-serif text-2xl font-bold text-emerald-400">{passedCount}</span>
                <span className="text-xs text-slate-500 font-mono">/ {totalCount}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#111114] p-4 shadow-xl">
              <span className="text-xs text-slate-400 font-medium">Failed Assertions</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className={`font-serif text-2xl font-bold ${failedCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                  {failedCount}
                </span>
                <span className="text-xs text-slate-500 font-mono">reverts verified</span>
              </div>
            </div>

            {/* Run Actions */}
            <div className="flex flex-col justify-center gap-2 rounded-2xl border border-slate-800 bg-[#111114] p-4 shadow-xl">
              <button
                id="btn-run-all-tests"
                onClick={runAllTests}
                disabled={isRunningAll}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#c5a059] py-2 px-3 text-xs font-bold text-[#0a0a0c] shadow-md hover:bg-[#d4b57a] uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer"
              >
                {isRunningAll ? (
                  <>
                    <Zap className="h-3.5 w-3.5 animate-spin" />
                    Executing Invariants...
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Run All 8 Test Cases
                  </>
                )}
              </button>
              <button
                onClick={resetTests}
                disabled={isRunningAll}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-[#1a1b1e] py-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                Reset State
              </button>
            </div>
          </div>

          {/* Category Filter Navigation */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
            <span className="text-xs font-semibold text-slate-500 mr-1">Filter Domain:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#c5a059] text-[#0a0a0c] font-bold shadow-sm'
                    : 'border border-slate-800 bg-[#111114] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Test Case Cards List */}
          <div className="space-y-3">
            {filteredTests.map((test) => {
              const isExpanded = expandedTestId === test.id;

              return (
                <div
                  key={test.id}
                  className="rounded-2xl border border-slate-800 bg-[#111114] transition-all overflow-hidden"
                >
                  <div
                    onClick={() => setExpandedTestId(isExpanded ? null : test.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 cursor-pointer hover:bg-[#151519]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {test.status === 'passed' && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </div>
                        )}
                        {test.status === 'failed' && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-950/60 border border-rose-800 text-rose-400">
                            <XCircle className="h-3.5 w-3.5" />
                          </div>
                        )}
                        {test.status === 'running' && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-950/60 border border-amber-800 text-amber-400 animate-spin">
                            <Zap className="h-3.5 w-3.5" />
                          </div>
                        )}
                        {test.status === 'pending' && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-500">
                            <Clock className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#c5a059]">
                            {test.id}
                          </span>
                          <h3 className="font-serif text-sm font-bold text-slate-100">
                            {test.title}
                          </h3>
                          <span className="rounded-full bg-[#1a1b1e] border border-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-400">
                            {test.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {test.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {test.durationMs !== undefined && (
                        <span className="font-mono text-[11px] text-slate-500">
                          {test.durationMs}ms
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          runSingleTest(test.id);
                        }}
                        disabled={test.status === 'running'}
                        className="rounded-lg border border-slate-700 bg-[#1a1b1e] px-2.5 py-1 text-xs font-semibold text-slate-200 hover:border-[#c5a059] hover:text-[#c5a059] transition-all cursor-pointer"
                      >
                        {test.status === 'running' ? 'Running...' : 'Run Test'}
                      </button>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-500" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Execution Details & Logs */}
                  {isExpanded && (
                    <div className="border-t border-slate-800 bg-[#0c0c0f] p-4 text-xs font-mono">
                      {test.assertionDetails && (
                        <div className="mb-3 rounded-xl bg-[#111114] p-3 border border-slate-800">
                          <span className="text-slate-500 block text-[11px] mb-1">
                            Assertion Details:
                          </span>
                          <span className="text-emerald-400 font-semibold">
                            {test.assertionDetails}
                          </span>
                          {test.gasEstimated && (
                            <div className="text-[11px] text-slate-400 mt-1">
                              Gas Profiling: {test.gasEstimated}
                            </div>
                          )}
                        </div>
                      )}

                      {test.error && (
                        <div className="mb-3 rounded-xl bg-rose-950/40 p-3 border border-rose-900/60 text-rose-300">
                          <span className="font-bold">Assertion Failure:</span> {test.error}
                        </div>
                      )}

                      <div className="rounded-xl bg-[#070709] p-3 border border-slate-900">
                        <div className="flex items-center gap-1.5 text-slate-500 mb-2 text-[11px]">
                          <Terminal className="h-3 w-3" />
                          <span>EVM Execution Trace:</span>
                        </div>
                        {test.logs.length > 0 ? (
                          <div className="space-y-1 text-slate-300 text-[11px] leading-relaxed">
                            {test.logs.map((log, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <span className="text-slate-600 select-none">&gt;</span>
                                <span>{log}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[11px]">
                            Test has not run yet. Click "Run Test" above to execute.
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Hardhat / Mocha Spec Tab */
        <div className="rounded-2xl border border-slate-800 bg-[#0a0a0c] shadow-2xl overflow-hidden">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-[#111114] px-6 py-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-300">test/SoulboundCertificate.test.ts</span>
              <span className="rounded-md bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                Mocha + Chai + Ethers v6
              </span>
            </div>

            <button
              onClick={copyHardhatScript}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#c5a059] px-3 py-1 font-bold text-[#0a0a0c] hover:bg-[#d4b57a] uppercase tracking-wider transition-all cursor-pointer"
            >
              {copiedHardhatCode ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy Test Suite
                </>
              )}
            </button>
          </div>

          <pre className="max-h-[640px] overflow-auto p-6 font-mono text-xs leading-relaxed text-slate-300">
            {HARDHAT_TEST_CODE}
          </pre>
        </div>
      )}
    </div>
  );
};
