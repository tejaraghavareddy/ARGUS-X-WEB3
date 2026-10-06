import { isAddress } from "ethers";
import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { TransactionStatus } from "../components/TransactionStatus";
import { useIssuer } from "../hooks/useIssuer";
import { useToast } from "../hooks/useToast";
import { useWallet } from "../hooks/useWallet";
import { mintCertificate } from "../services/contract";
import { uploadCertificateImage, uploadCertificateMetadata } from "../services/ipfs";
import type { CertificateMetadata, MintProgress } from "../types";
import { isContractConfigured, requiredNetworkLabel } from "../utils/config";
import { parseChainError } from "../utils/errors";
import { copyToClipboard, explorerTxUrl } from "../utils/format";

interface SuccessState {
  tokenId: string;
  recipient: string;
  issuer: string;
  hash: string;
  cid: string;
  contractAddress: string;
}

const CERTIFICATE_TYPES = [
  "Course Completion",
  "Degree",
  "Diploma",
  "Professional Certification",
  "Workshop",
];

export function IssuePage() {
  const { address, isConnected, isCorrectNetwork, connect, switchNetwork } = useWallet();
  const { isIssuer, loading } = useIssuer();
  const { notify } = useToast();

  const [studentName, setStudentName] = useState("");
  const [studentWallet, setStudentWallet] = useState("");
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [certificateType, setCertificateType] = useState(CERTIFICATE_TYPES[0]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<MintProgress>("idle");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessState | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!studentName.trim() || !courseName.trim() || !description.trim() || !issueDate) {
      setError("Please complete all required fields.");
      return;
    }
    if (!isAddress(studentWallet.trim())) {
      setError("The student wallet address is invalid.");
      return;
    }
    if (!address) {
      setError("Wallet not connected.");
      return;
    }

    try {
      setProgress("preparing");
      let imageUri = "";
      if (imageFile) {
        const uploadedImage = await uploadCertificateImage(imageFile);
        imageUri = uploadedImage.uri;
      }

      const metadata: CertificateMetadata = {
        name: `Certificate of Completion`,
        description: description.trim(),
        studentName: studentName.trim(),
        courseName: courseName.trim(),
        certificateType,
        issueDate,
        issuerName: "SoulCert Issuer",
        issuerAddress: address,
        image: imageUri || undefined,
      };

      setProgress("uploading");
      const ipfs = await uploadCertificateMetadata(metadata);

      setProgress("awaiting-wallet");
      const minted = await mintCertificate(studentWallet.trim(), ipfs.uri, () => {
        setProgress("confirming");
      });

      setProgress("success");
      setSuccess({
        tokenId: minted.tokenId.toString(),
        recipient: studentWallet.trim(),
        issuer: address,
        hash: minted.hash,
        cid: ipfs.cid,
        contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS,
      });
      notify({
        type: "success",
        title: "Certificate issued successfully.",
        description: `Token ID #${minted.tokenId.toString()}`,
      });
    } catch (err) {
      const message = parseChainError(err);
      setProgress("error");
      setError(message);
      notify({ type: "error", title: "Issuing failed", description: message });
    }
  }

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Connect your wallet"
          description="An authorized issuer wallet is required to mint certificates."
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
          description={`Minting requires ${requiredNetworkLabel()}.`}
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
          description="Set VITE_CONTRACT_ADDRESS before issuing certificates."
        />
      </div>
    );
  }

  if (loading) {
    return <LoadingState label="Verifying issuer permissions..." />;
  }

  if (!isIssuer) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="You are not an authorized issuer."
          description="Only wallets added by the contract owner can mint SoulCert certificates."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl text-navy-900">Issue a certificate</h1>
      <p className="mt-2 text-navy-700/70">
        Metadata is stored on IPFS. The soulbound NFT is minted to the student wallet.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-3xl border border-navy-900/8 bg-white p-6 shadow-card">
        <Field label="Student Name">
          <input
            required
            value={studentName}
            onChange={(event) => setStudentName(event.target.value)}
            placeholder="Rahul Sharma"
            className="input"
          />
        </Field>
        <Field label="Student Wallet Address">
          <input
            required
            value={studentWallet}
            onChange={(event) => setStudentWallet(event.target.value)}
            placeholder="0x..."
            className="input font-mono"
          />
        </Field>
        <Field label="Certificate / Course Name">
          <input
            required
            value={courseName}
            onChange={(event) => setCourseName(event.target.value)}
            placeholder="Full Stack Web Development"
            className="input"
          />
        </Field>
        <Field label="Description">
          <textarea
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            placeholder="Awarded for successfully completing the Full Stack Web Development program."
            className="input resize-y"
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Issue Date">
            <input
              required
              type="date"
              value={issueDate}
              onChange={(event) => setIssueDate(event.target.value)}
              className="input"
            />
          </Field>
          <Field label="Certificate Type">
            <select
              value={certificateType}
              onChange={(event) => setCertificateType(event.target.value)}
              className="input"
            >
              {CERTIFICATE_TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Optional Image">
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-navy-700 file:mr-3 file:rounded-full file:border-0 file:bg-navy-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
        </Field>

        <button
          type="submit"
          disabled={progress !== "idle" && progress !== "error" && progress !== "success"}
          className="w-full rounded-full bg-navy-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          Issue Certificate
        </button>
      </form>

      <div className="mt-6">
        <TransactionStatus progress={progress} error={error} />
      </div>

      {success ? (
        <div className="mt-6 space-y-4 rounded-3xl border border-emerald-200 bg-white p-6">
          <h2 className="font-display text-2xl text-navy-900">Certificate issued successfully.</h2>
          <dl className="grid gap-3 text-sm">
            <Row label="Certificate ID" value={`#${success.tokenId}`} />
            <Row label="Student wallet" value={success.recipient} />
            <Row label="Issuer wallet" value={success.issuer} />
            <Row label="Transaction hash" value={success.hash} />
            <Row label="IPFS CID" value={success.cid} />
            <Row label="Contract address" value={success.contractAddress} />
            <Row label="Network" value={requiredNetworkLabel()} />
          </dl>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              to={`/certificate/${success.tokenId}`}
              className="rounded-full bg-navy-900 px-4 py-2 text-sm font-semibold text-white"
            >
              View Certificate
            </Link>
            <Link
              to={`/verify?tokenId=${success.tokenId}`}
              className="rounded-full border border-navy-900/15 px-4 py-2 text-sm font-semibold text-navy-900"
            >
              Verify Certificate
            </Link>
            <button
              type="button"
              onClick={async () => {
                const ok = await copyToClipboard(success.hash);
                notify({
                  type: ok ? "success" : "error",
                  title: ok ? "Transaction hash copied" : "Unable to copy",
                });
              }}
              className="rounded-full border border-navy-900/15 px-4 py-2 text-sm font-semibold text-navy-900"
            >
              Copy Transaction Hash
            </button>
            <a
              href={explorerTxUrl(success.hash)}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-navy-900/15 px-4 py-2 text-sm font-semibold text-navy-900"
            >
              View on explorer
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-navy-800">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[10rem_1fr]">
      <dt className="text-navy-700/60">{label}</dt>
      <dd className="break-all font-mono text-navy-900">{value}</dd>
    </div>
  );
}
