import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

describe("SoulboundCertificate (ERC-5192) Smart Contract", function () {
  let soulboundCert: Contract;
  let owner: Signer;
  let mitIssuer: Signer;
  let stanfordIssuer: Signer;
  let studentElena: Signer;
  let studentMarcus: Signer;
  let attacker: Signer;

  let ownerAddress: string;
  let mitAddress: string;
  let studentElenaAddress: string;
  let studentMarcusAddress: string;
  let attackerAddress: string;

  const SAMPLE_IPFS_CID = "QmZtmD2qtdpUbFS43EBcqMVH21NKnqMBk6jJv4kPZ4yQd8";

  beforeEach(async function () {
    [owner, mitIssuer, stanfordIssuer, studentElena, studentMarcus, attacker] =
      await ethers.getSigners();

    ownerAddress = await owner.getAddress();
    mitAddress = await mitIssuer.getAddress();
    studentElenaAddress = await studentElena.getAddress();
    studentMarcusAddress = await studentMarcus.getAddress();
    attackerAddress = await attacker.getAddress();

    // Deploy contract
    const SoulboundCertificateFactory = await ethers.getContractFactory("SoulboundCertificate");
    soulboundCert = await SoulboundCertificateFactory.deploy(
      "Soulbound Academic Credential",
      "CERT-SBT",
      ownerAddress
    );
    await soulboundCert.waitForDeployment();

    // Authorize MIT Issuer
    await soulboundCert.connect(owner).setIssuerStatus(
      mitAddress,
      true,
      "MIT Computing",
      "Massachusetts Institute of Technology",
      "https://computing.mit.edu"
    );
  });

  describe("1. Access Control & Whitelist Authorization", function () {
    it("TC-01: Should revert minting when called by an unauthorized address", async function () {
      await expect(
        soulboundCert.connect(attacker).mintCertificate(studentElenaAddress, SAMPLE_IPFS_CID)
      ).to.be.revertedWith("SoulboundCert: Caller is not an authorized issuer");
    });

    it("TC-02: Should allow a whitelisted issuer to mint certificates and emit Locked event", async function () {
      const tx = await soulboundCert
        .connect(mitIssuer)
        .mintCertificate(studentElenaAddress, SAMPLE_IPFS_CID);

      // Verify EIP-5192 Locked event is emitted
      await expect(tx)
        .to.emit(soulboundCert, "Locked")
        .withArgs(1);

      // Verify CertificateMinted event
      await expect(tx)
        .to.emit(soulboundCert, "CertificateMinted")
        .withArgs(studentElenaAddress, 1, SAMPLE_IPFS_CID, mitAddress);

      // Verify ownership
      expect(await soulboundCert.ownerOf(1)).to.equal(studentElenaAddress);

      // Verify tokenURI
      expect(await soulboundCert.tokenURI(1)).to.equal(`ipfs://${SAMPLE_IPFS_CID}`);
    });

    it("TC-08: Should allow owner to revoke issuer whitelist, halting further minting", async function () {
      // Revoke MIT
      await soulboundCert.connect(owner).setIssuerStatus(
        mitAddress,
        false,
        "MIT Computing",
        "Massachusetts Institute of Technology",
        "https://computing.mit.edu"
      );

      // Attempting to mint now must fail
      await expect(
        soulboundCert.connect(mitIssuer).mintCertificate(studentElenaAddress, SAMPLE_IPFS_CID)
      ).to.be.revertedWith("SoulboundCert: Caller is not an authorized issuer");
    });
  });

  describe("2. Non-Transferability (EIP-5192 Soulbound Enforcement)", function () {
    beforeEach(async function () {
      // Mint Token #1 to student Elena
      await soulboundCert
        .connect(mitIssuer)
        .mintCertificate(studentElenaAddress, SAMPLE_IPFS_CID);
    });

    it("TC-03: Should revert transferFrom() when recipient or student attempts transfer", async function () {
      await expect(
        soulboundCert
          .connect(studentElena)
          .transferFrom(studentElenaAddress, studentMarcusAddress, 1)
      ).to.be.revertedWith(
        "Soulbound: Token transfers are prohibited. Certificate is non-transferable."
      );
    });

    it("TC-03b: Should revert safeTransferFrom() when secondary transfer is attempted", async function () {
      await expect(
        soulboundCert
          .connect(studentElena)
          ["safeTransferFrom(address,address,uint256)"](
            studentElenaAddress,
            studentMarcusAddress,
            1
          )
      ).to.be.revertedWith(
        "Soulbound: Token transfers are prohibited. Certificate is non-transferable."
      );
    });

    it("TC-04: Should return locked(tokenId) == true according to EIP-5192 standard", async function () {
      const isLocked = await soulboundCert.locked(1);
      expect(isLocked).to.be.true;
    });

    it("TC-04b: Should revert locked() for a non-existent token", async function () {
      await expect(soulboundCert.locked(999)).to.be.reverted;
    });
  });

  describe("3. Student Credential Discovery & Integrity", function () {
    it("TC-06: Should track and retrieve all token IDs for a student wallet", async function () {
      // Mint two certificates to Elena
      await soulboundCert.connect(mitIssuer).mintCertificate(studentElenaAddress, SAMPLE_IPFS_CID);
      await soulboundCert.connect(mitIssuer).mintCertificate(studentElenaAddress, "QmAnotherCidHash");

      const certificates = await soulboundCert.getCertificatesByStudent(studentElenaAddress);
      expect(certificates.length).to.equal(2);
      expect(certificates[0]).to.equal(1);
      expect(certificates[1]).to.equal(2);
    });

    it("TC-09: Should correctly report ERC-165 support for ERC-721 and EIP-5192", async function () {
      // ERC721 Interface ID = 0x80ac58cd
      expect(await soulboundCert.supportsInterface("0x80ac58cd")).to.be.true;
      // EIP-5192 Interface ID = 0xb45a3c0e
      expect(await soulboundCert.supportsInterface("0xb45a3c0e")).to.be.true;
    });
  });
});
