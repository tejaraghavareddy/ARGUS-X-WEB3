import { expect } from "chai";
import { ethers } from "hardhat";
import { SoulboundCertificate } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("SoulboundCertificate", function () {
  let contract: SoulboundCertificate;
  let owner: HardhatEthersSigner;
  let issuer: HardhatEthersSigner;
  let student: HardhatEthersSigner;
  let outsider: HardhatEthersSigner;
  const metadataURI = "ipfs://QmTestCertificateMetadataHash";

  beforeEach(async function () {
    [owner, issuer, student, outsider] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("SoulboundCertificate");
    contract = (await factory.deploy()) as unknown as SoulboundCertificate;
    await contract.waitForDeployment();
  });

  describe("issuers", function () {
    it("marks the deployer as owner and issuer", async function () {
      expect(await contract.owner()).to.equal(owner.address);
      expect(await contract.isIssuer(owner.address)).to.equal(true);
    });

    it("allows owner to add and remove issuers", async function () {
      await expect(contract.addIssuer(issuer.address))
        .to.emit(contract, "IssuerAdded")
        .withArgs(issuer.address);
      expect(await contract.isIssuer(issuer.address)).to.equal(true);

      await expect(contract.removeIssuer(issuer.address))
        .to.emit(contract, "IssuerRemoved")
        .withArgs(issuer.address);
      expect(await contract.isIssuer(issuer.address)).to.equal(false);
    });

    it("rejects non-owner issuer management", async function () {
      await expect(
        contract.connect(outsider).addIssuer(issuer.address)
      ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });

    it("rejects zero-address issuer", async function () {
      await expect(
        contract.addIssuer(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(contract, "InvalidIssuer");
    });

    it("rejects duplicate issuer add", async function () {
      await contract.addIssuer(issuer.address);
      await expect(
        contract.addIssuer(issuer.address)
      ).to.be.revertedWithCustomError(contract, "IssuerAlreadyAdded");
    });
  });

  describe("minting", function () {
    beforeEach(async function () {
      await contract.addIssuer(issuer.address);
    });

    it("lets an authorized issuer mint a certificate", async function () {
      await expect(
        contract.connect(issuer).mintCertificate(student.address, metadataURI)
      )
        .to.emit(contract, "CertificateIssued")
        .withArgs(1, student.address, issuer.address, metadataURI);

      expect(await contract.ownerOf(1)).to.equal(student.address);
      expect(await contract.tokenURI(1)).to.equal(metadataURI);
      expect(await contract.totalSupply()).to.equal(1n);

      const cert = await contract.getCertificate(1);
      expect(cert.id).to.equal(1n);
      expect(cert.recipient).to.equal(student.address);
      expect(cert.issuer).to.equal(issuer.address);
      expect(cert.metadataURI).to.equal(metadataURI);
      expect(cert.revoked).to.equal(false);
      expect(cert.issuedAt).to.be.gt(0n);
    });

    it("rejects minting from a non-issuer", async function () {
      await expect(
        contract.connect(outsider).mintCertificate(student.address, metadataURI)
      ).to.be.revertedWithCustomError(contract, "NotAuthorizedIssuer");
    });

    it("rejects the zero address as recipient", async function () {
      await expect(
        contract.connect(issuer).mintCertificate(ethers.ZeroAddress, metadataURI)
      ).to.be.revertedWithCustomError(contract, "InvalidRecipient");
    });

    it("rejects empty metadata URI", async function () {
      await expect(
        contract.connect(issuer).mintCertificate(student.address, "")
      ).to.be.revertedWithCustomError(contract, "InvalidMetadataURI");
    });
  });

  describe("soulbound behavior", function () {
    beforeEach(async function () {
      await contract.addIssuer(issuer.address);
      await contract.connect(issuer).mintCertificate(student.address, metadataURI);
    });

    it("reverts transferFrom", async function () {
      await expect(
        contract.connect(student).transferFrom(student.address, outsider.address, 1)
      ).to.be.revertedWithCustomError(contract, "SoulboundTransferNotAllowed");
    });

    it("reverts safeTransferFrom", async function () {
      await expect(
        contract
          .connect(student)
          ["safeTransferFrom(address,address,uint256)"](
            student.address,
            outsider.address,
            1
          )
      ).to.be.revertedWithCustomError(contract, "SoulboundTransferNotAllowed");
    });

    it("reverts approve", async function () {
      await expect(
        contract.connect(student).approve(outsider.address, 1)
      ).to.be.revertedWithCustomError(contract, "SoulboundTransferNotAllowed");
    });

    it("reverts setApprovalForAll", async function () {
      await expect(
        contract.connect(student).setApprovalForAll(outsider.address, true)
      ).to.be.revertedWithCustomError(contract, "SoulboundTransferNotAllowed");
    });
  });

  describe("revocation", function () {
    beforeEach(async function () {
      await contract.addIssuer(issuer.address);
      await contract.connect(issuer).mintCertificate(student.address, metadataURI);
    });

    it("lets the issuing wallet revoke a certificate", async function () {
      await expect(contract.connect(issuer).revokeCertificate(1))
        .to.emit(contract, "CertificateRevoked")
        .withArgs(1, issuer.address);
      expect(await contract.isRevoked(1)).to.equal(true);
    });

    it("lets the contract owner revoke a certificate", async function () {
      await expect(contract.connect(owner).revokeCertificate(1))
        .to.emit(contract, "CertificateRevoked")
        .withArgs(1, owner.address);
      expect(await contract.isRevoked(1)).to.equal(true);
    });

    it("rejects revocation by unrelated wallets", async function () {
      await expect(
        contract.connect(outsider).revokeCertificate(1)
      ).to.be.revertedWithCustomError(contract, "NotAuthorizedToRevoke");
    });

    it("rejects double revocation", async function () {
      await contract.connect(issuer).revokeCertificate(1);
      await expect(
        contract.connect(issuer).revokeCertificate(1)
      ).to.be.revertedWithCustomError(contract, "AlreadyRevoked");
    });

    it("rejects queries for missing certificates", async function () {
      await expect(contract.isRevoked(99)).to.be.revertedWithCustomError(
        contract,
        "CertificateDoesNotExist"
      );
      await expect(contract.getCertificate(99)).to.be.revertedWithCustomError(
        contract,
        "CertificateDoesNotExist"
      );
    });
  });

  describe("stats and indexing", function () {
    beforeEach(async function () {
      await contract.addIssuer(issuer.address);
      await contract.connect(issuer).mintCertificate(student.address, metadataURI);
      await contract.connect(issuer).mintCertificate(outsider.address, metadataURI);
      await contract.connect(issuer).revokeCertificate(2);
    });

    it("returns issuer stats", async function () {
      const stats = await contract.getIssuerStats(issuer.address);
      expect(stats.issued).to.equal(2n);
      expect(stats.revoked).to.equal(1n);
      expect(stats.active).to.equal(1n);
    });

    it("lists tokens of issuer and owner", async function () {
      const issued = await contract.tokensOfIssuer(issuer.address);
      expect(issued.map((n) => Number(n))).to.deep.equal([1, 2]);
      const owned = await contract.tokensOfOwner(student.address);
      expect(owned.map((n) => Number(n))).to.deep.equal([1]);
    });
  });
});
