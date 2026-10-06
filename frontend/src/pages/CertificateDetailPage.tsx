import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { VerificationBadge } from "../components/VerificationBadge";
import { useIssuer } from "../hooks/useIssuer";
import { useToast } from "../hooks/useToast";
import { useWallet } from "../hooks/useWallet";
import { getCertificate, revokeCertificate } from "../services/contract";
import { loadCertificateMetadata, toGatewayUrl } from "../services/ipfs";
import type { CertificateRecord } from "../types";
import { APP_CONFIG, isContractConfigured } from "../utils/config";
import { parseChainError } from "../utils/errors";
import {
  cidFromUri,
  copyToClipboard,
  explorerAddressUrl,
  formatTimestamp,
} from "../utils/format";

export function CertificateDetailPage() {
  const { tokenId } = useParams();
  const { address, isConnected } = useWallet();
  const { isIssuer, isOwner, refresh } = useIssuer();
  const { notify } = useToast();
  const [record, setRecord] = useState<CertificateRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    async function load() {
      if (!tokenId || !isContractConfigured()) {
        setError("Certificate ID or contract address is missing.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const cert = await getCertificate(tokenId);
        let metadata = null;
        try {
          metadata = await loadCertificateMetadata(cert.metadataURI);
        } catch {
          metadata = null;
        }
        setRecord({ ...cert, metadata });
      } catch (err) {
        setError(parseChainError(err));
        setRecord(null);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [tokenId]);

  async function handleRevoke() {
    if (!record) return;
    setRevoking(true);
    try {
      const hash = await revokeCertificate(record.tokenId);
      setRecord({ ...record, revoked: true });
      await refresh();
      notify({
        type: "success",
        title: "Certificate revoked",
        description: `Tx ${hash.slice(0, 10)}...`,
      });
    } catch (err) {
      notify({
        type: "error",
        title: "Revocation failed",
        description: parseChainError(err),
      });
    } finally {
      setRevoking(false);
    }
  }

  if (loading) return <LoadingState label="Loading certificate from chain..." />;

  if (error || !record) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Certificate not found"
          description={error || "This token ID does not exist on the configured contract."}
        />
      </div>
    );
  }

  const canRevoke =
    isConnected &&
    !record.revoked &&
    (isOwner ||
      (isIssuer && address?.toLowerCase() === record.issuer.toLowerCase()));
  const meta = record.metadata;
  const imageUrl = meta?.image ? toGatewayUrl(meta.image) : "";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link to="/certificates" className="text-sm font-semibold text-navy-700">
        Back to certificates
      </Link>
      <article className="mt-5 overflow-hidden rounded-[2rem] border border-navy-900/8 bg-white shadow-card">
        <div className="bg-navy-900 px-6 py-8 text-white sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gold-400">
                {meta?.certificateType || "Soulbound certificate"}
              </p>
              <h1 className="mt-2 font-display text-4xl">
                {meta?.courseName || "On-chain credential"}
              </h1>
            </div>
            <VerificationBadge revoked={record.revoked} />
          </div>
        </div>
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={meta?.courseName || "Certificate"}
                className="mb-6 max-h-64 w-full rounded-2xl object-cover"
              />
            ) : null}
            <dl className="space-y-4 text-sm">
              <Item label="Student" value={meta?.studentName || "—"} />
              <Item label="Description" value={meta?.description || "Metadata not available from IPFS."} />
              <Item label="Issue date" value={meta?.issueDate || formatTimestamp(record.issuedAt)} />
              <Item label="On-chain timestamp" value={formatTimestamp(record.issuedAt)} />
            </dl>
          </div>
          <aside className="rounded-2xl bg-mist p-5 text-sm">
            <Item label="Certificate ID" value={`#${record.tokenId.toString()}`} mono />
            <Item
              label="Recipient"
              value={record.recipient}
              href={explorerAddressUrl(record.recipient)}
              mono
            />
            <Item
              label="Issuer"
              value={record.issuer}
              href={explorerAddressUrl(record.issuer)}
              mono
            />
            <Item label="Contract" value={APP_CONFIG.contractAddress} mono />
            <Item label="IPFS CID" value={cidFromUri(record.metadataURI) || "—"} mono />
            <button
              type="button"
              onClick={async () => {
                const ok = await copyToClipboard(record.tokenId.toString());
                notify({
                  type: ok ? "success" : "error",
                  title: ok ? "Certificate ID copied" : "Unable to copy",
                });
              }}
              className="mt-4 w-full rounded-full border border-navy-900/15 bg-white px-4 py-2 font-semibold text-navy-900"
            >
              Copy Certificate ID
            </button>
            {canRevoke ? (
              <button
                type="button"
                disabled={revoking}
                onClick={() => void handleRevoke()}
                className="mt-3 w-full rounded-full bg-rose-700 px-4 py-2 font-semibold text-white disabled:opacity-60"
              >
                {revoking ? "Revoking..." : "Revoke certificate"}
              </button>
            ) : null}
          </aside>
        </div>
      </article>
    </div>
  );
}

function Item({
  label,
  value,
  href,
  mono,
}: {
  label: string;
  value: string;
  href?: string;
  mono?: boolean;
}) {
  const content = (
    <span className={`break-all ${mono ? "font-mono" : ""}`}>{value}</span>
  );
  return (
    <div className="mb-4">
      <dt className="text-xs uppercase tracking-wide text-navy-700/50">{label}</dt>
      <dd className="mt-1 text-navy-900">
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
            {content}
          </a>
        ) : (
          content
        )}
      </dd>
    </div>
  );
}
