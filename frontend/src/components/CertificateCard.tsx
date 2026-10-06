import { Link } from "react-router-dom";
import type { CertificateRecord } from "../types";
import { shortenAddress, formatTimestamp } from "../utils/format";
import { VerificationBadge } from "./VerificationBadge";

export function CertificateCard({ certificate }: { certificate: CertificateRecord }) {
  const name = certificate.metadata?.studentName || "Certificate holder";
  const course = certificate.metadata?.courseName || "On-chain credential";
  const type = certificate.metadata?.certificateType || "Certificate";

  return (
    <Link
      to={`/certificate/${certificate.tokenId.toString()}`}
      className="block rounded-3xl border border-navy-900/8 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-navy-700/50">{type}</p>
          <h3 className="mt-1 font-display text-xl text-navy-900">{course}</h3>
        </div>
        <VerificationBadge revoked={certificate.revoked} />
      </div>
      <p className="mt-4 text-sm text-navy-700">{name}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-navy-700/80">
        <div>
          <dt className="uppercase tracking-wide">Token ID</dt>
          <dd className="mt-1 font-semibold text-navy-900">#{certificate.tokenId.toString()}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wide">Issued</dt>
          <dd className="mt-1 font-semibold text-navy-900">{formatTimestamp(certificate.issuedAt)}</dd>
        </div>
        <div className="col-span-2">
          <dt className="uppercase tracking-wide">Recipient</dt>
          <dd className="mt-1 font-mono">{shortenAddress(certificate.recipient, 6)}</dd>
        </div>
      </dl>
    </Link>
  );
}
