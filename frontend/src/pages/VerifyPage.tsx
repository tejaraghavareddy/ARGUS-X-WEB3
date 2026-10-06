import { isAddress } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CertificateCard } from "../components/CertificateCard";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { getCertificate, getTokensOfOwner } from "../services/contract";
import { loadCertificateMetadata } from "../services/ipfs";
import type { CertificateRecord } from "../types";
import { isContractConfigured } from "../utils/config";
import { parseChainError } from "../utils/errors";

export function VerifyPage() {
  const [params] = useSearchParams();
  const initial = params.get("tokenId") || params.get("wallet") || "";
  const [query, setQuery] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<CertificateRecord[]>([]);

  const placeholder = useMemo(
    () => "Enter a wallet address or certificate / token ID",
    []
  );

  async function hydrate(ids: bigint[]): Promise<CertificateRecord[]> {
    return Promise.all(
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
  }

  async function runLookup(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Enter a wallet address or token ID.");
      return;
    }
    if (!isContractConfigured()) {
      setError("Contract address is not configured.");
      return;
    }

    setLoading(true);
    setError(null);
    setRecords([]);
    try {
      if (isAddress(trimmed)) {
        const ids = await getTokensOfOwner(trimmed);
        if (ids.length === 0) {
          setError("No certificates are associated with that wallet.");
          return;
        }
        setRecords(await hydrate(ids));
        return;
      }

      if (!/^\d+$/.test(trimmed)) {
        setError("Enter a valid wallet address or numeric token ID.");
        return;
      }

      const cert = await getCertificate(trimmed);
      const [record] = await hydrate([cert.tokenId]);
      setRecords([record]);
    } catch (err) {
      setError(parseChainError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initial) {
      void runLookup(initial);
    }
  }, [initial]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl text-navy-900">Verify a certificate</h1>
      <p className="mt-2 text-navy-700/70">
        Anyone can confirm authenticity using on-chain data. No issuer login required.
      </p>

      <form
        className="mt-8 flex flex-col gap-3 rounded-3xl border border-navy-900/8 bg-white p-4 shadow-card sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          void runLookup(query);
        }}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="input flex-1"
        />
        <button
          type="submit"
          className="rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white"
        >
          Verify
        </button>
      </form>

      {loading ? <LoadingState label="Reading blockchain records..." /> : null}
      {error && !loading ? (
        <div className="mt-6">
          <EmptyState title="Verification result" description={error} />
        </div>
      ) : null}

      <div className="mt-8 grid gap-4">
        {records.map((certificate) => (
          <CertificateCard key={certificate.tokenId.toString()} certificate={certificate} />
        ))}
      </div>
    </div>
  );
}
