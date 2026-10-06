import type { CertificateMetadata, IpfsUploadResult } from "../types";
import { APP_CONFIG } from "../utils/config";

export interface IpfsProvider {
  uploadJson(payload: CertificateMetadata): Promise<IpfsUploadResult>;
  uploadFile(file: File): Promise<IpfsUploadResult>;
  resolveUri(uri: string): string;
  fetchJson<T>(uri: string): Promise<T>;
}

function gatewayBase(): string {
  const gateway = APP_CONFIG.ipfsGateway;
  return gateway.endsWith("/") ? gateway : `${gateway}/`;
}

export function toGatewayUrl(uri: string): string {
  if (!uri) return "";
  if (uri.startsWith("http://") || uri.startsWith("https://")) return uri;
  const cid = uri.replace(/^ipfs:\/\//, "");
  return `${gatewayBase()}${cid}`;
}

class PinataIpfsProvider implements IpfsProvider {
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_IPFS_API_KEY || "";
    this.apiSecret = import.meta.env.VITE_IPFS_API_SECRET || "";
  }

  private headers(): HeadersInit {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error(
        "IPFS is not configured. Add VITE_IPFS_API_KEY and VITE_IPFS_API_SECRET to frontend/.env."
      );
    }
    return {
      pinata_api_key: this.apiKey,
      pinata_secret_api_key: this.apiSecret,
    };
  }

  private wrap(cid: string): IpfsUploadResult {
    return {
      cid,
      uri: `ipfs://${cid}`,
      gatewayUrl: `${gatewayBase()}${cid}`,
    };
  }

  async uploadJson(payload: CertificateMetadata): Promise<IpfsUploadResult> {
    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        ...this.headers(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pinataContent: payload,
        pinataMetadata: {
          name: `${payload.studentName}-${payload.courseName}`.slice(0, 80),
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`IPFS upload failed: ${text || response.statusText}`);
    }

    const data = (await response.json()) as { IpfsHash: string };
    if (!data.IpfsHash) {
      throw new Error("IPFS upload succeeded but no CID was returned.");
    }
    return this.wrap(data.IpfsHash);
  }

  async uploadFile(file: File): Promise<IpfsUploadResult> {
    const form = new FormData();
    form.append("file", file);
    form.append(
      "pinataMetadata",
      JSON.stringify({ name: file.name || "soulcert-image" })
    );

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: this.headers(),
      body: form,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`IPFS image upload failed: ${text || response.statusText}`);
    }

    const data = (await response.json()) as { IpfsHash: string };
    if (!data.IpfsHash) {
      throw new Error("IPFS image upload succeeded but no CID was returned.");
    }
    return this.wrap(data.IpfsHash);
  }

  resolveUri(uri: string): string {
    return toGatewayUrl(uri);
  }

  async fetchJson<T>(uri: string): Promise<T> {
    const url = this.resolveUri(uri);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Unable to load certificate metadata from IPFS.");
    }
    return (await response.json()) as T;
  }
}

export const ipfsService: IpfsProvider = new PinataIpfsProvider();

export async function uploadCertificateMetadata(
  metadata: CertificateMetadata
): Promise<IpfsUploadResult> {
  return ipfsService.uploadJson(metadata);
}

export async function uploadCertificateImage(file: File): Promise<IpfsUploadResult> {
  return ipfsService.uploadFile(file);
}

export async function loadCertificateMetadata(
  uri: string
): Promise<CertificateMetadata> {
  return ipfsService.fetchJson<CertificateMetadata>(uri);
}
