import { Award, Ban, Plus, ShieldAlert, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { useIssuer } from "../hooks/useIssuer";
import { useWallet } from "../hooks/useWallet";
import { isContractConfigured, requiredNetworkLabel } from "../utils/config";

export function DashboardPage() {
  const { isConnected, isCorrectNetwork, connect, switchNetwork } = useWallet();
  const { isIssuer, stats, loading, error } = useIssuer();

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Connect your wallet"
          description="Connect a compatible wallet to check issuer status and manage certificates."
          action={
            <button
              type="button"
              onClick={() => void connect()}
              className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Connect Wallet
            </button>
          }
        />
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Please switch to Sepolia Testnet."
          description={`SoulCert is configured for ${requiredNetworkLabel()}. Switch networks in your wallet to continue.`}
          action={
            <button
              type="button"
              onClick={() => void switchNetwork()}
              className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Switch network
            </button>
          }
        />
      </div>
    );
  }

  if (!isContractConfigured()) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Contract not configured"
          description="Set VITE_CONTRACT_ADDRESS in frontend/.env to the deployed SoulboundCertificate address."
        />
      </div>
    );
  }

  if (loading) {
    return <LoadingState label="Checking issuer status on-chain..." />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState title="Unable to load issuer status" description={error} />
      </div>
    );
  }

  if (!isIssuer) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
          <ShieldAlert className="mx-auto text-amber-700" />
          <h1 className="mt-3 font-display text-3xl text-navy-900">
            You are not an authorized issuer.
          </h1>
          <p className="mt-2 text-sm text-navy-700/80">
            Ask the contract owner to add this wallet from the Admin dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
            <ShieldCheck size={16} />
            Issuer Verified
          </div>
          <h1 className="mt-3 font-display text-4xl text-navy-900">Issuer dashboard</h1>
          <p className="mt-2 text-navy-700/70">Issue, review, and revoke soulbound certificates.</p>
        </div>
        <Link
          to="/issue"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-navy-900 px-5 py-3 text-sm font-semibold text-white"
        >
          <Plus size={16} />
          Issue New Certificate
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          {
            label: "Certificates Issued",
            value: stats?.issued.toString() ?? "0",
            icon: Award,
          },
          {
            label: "Active Certificates",
            value: stats?.active.toString() ?? "0",
            icon: ShieldCheck,
          },
          {
            label: "Revoked Certificates",
            value: stats?.revoked.toString() ?? "0",
            icon: Ban,
          },
        ].map((card) => (
          <article key={card.label} className="rounded-3xl border border-navy-900/8 bg-white p-6 shadow-card">
            <card.icon className="text-gold-500" size={20} />
            <p className="mt-4 text-sm text-navy-700/70">{card.label}</p>
            <p className="mt-1 font-display text-4xl text-navy-900">{card.value}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
