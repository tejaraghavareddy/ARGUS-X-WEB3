import { isAddress } from "ethers";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CertificateCard } from "../components/CertificateCard";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { useIssuer } from "../hooks/useIssuer";
import { useWallet } from "../hooks/useWallet";
import { getCertificate, getTokensOfIssuer, getTokensOfOwner } from "../services/contract";
import { loadCertificateMetadata } from "../services/ipfs";
import type { CertificateRecord } from "../types";
import { isContractConfigured } from "../utils/config";

export function CertificatesPage() {
  const { address, isConnected, connect } = useWallet();
  const { isIssuer } = useIssuer();
  const [records, setRecords] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"issued" | "owned">("issued");

  useEffect(() => {
    async function load() {
      if (!address || !isConnected || !isContractConfigured()) {
        setRecords([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const ids =
          mode === "issued"
            ? await getTokensOfIssuer(address)
            : await getTokensOfOwner(address);
        const loaded = await Promise.all(
          ids.map(async (id) => {
            const cert = await getCertificate(id);
            let metadata = null;
            try {
              metadata = await loadCertificateMetadata(cert.metadataURI);
            } catch {
              metadata = null;
            }
            return { ...cert, metadata };
          })
        );
        setRecords(loaded.reverse());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load certificates.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [address, isConnected, mode]);

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Connect your wallet"
          description="Connect to view certificates issued to or by this wallet."
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl text-navy-900">Certificate history</h1>
          <p className="mt-2 text-navy-700/70">
            On-chain records for this wallet. Metadata is resolved from IPFS when available.
          </p>
        </div>
        <div className="flex rounded-full bg-white p-1 shadow-sm ring-1 ring-navy-900/10">
          <button
            type="button"
            onClick={() => setMode("issued")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              mode === "issued" ? "bg-navy-900 text-white" : "text-navy-700"
            }`}
          >
            Issued
          </button>
          <button
            type="button"
            onClick={() => setMode("owned")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              mode === "owned" ? "bg-navy-900 text-white" : "text-navy-700"
            }`}
          >
            Received
          </button>
        </div>
      </div>

      {mode === "issued" && !isIssuer ? (
        <p className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          This wallet is not an authorized issuer, so the issued list may be empty.
        </p>
      ) : null}

      {loading ? <LoadingState label="Loading certificates from the blockchain..." /> : null}
      {error ? <p className="mt-6 text-sm text-rose-700">{error}</p> : null}

      {!loading && !error && records.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No certificates yet"
            description={
              mode === "issued"
                ? "Issue a certificate to see it appear here."
                : "Certificates minted to this wallet will appear here."
            }
            action={
              isAddress(address ?? "") && isIssuer ? (
                <Link
                  to="/issue"
                  className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Issue New Certificate
                </Link>
              ) : undefined
            }
          />
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {records.map((certificate) => (
          <CertificateCard key={certificate.tokenId.toString()} certificate={certificate} />
        ))}
      </div>
    </div>
  );
}
