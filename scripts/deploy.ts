import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("Deploying SoulboundCertificate");
  console.log("Network:", network.name, `(chainId ${network.chainId})`);
  console.log("Deployer:", deployer.address);
  console.log(
    "Balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "ETH"
  );

  const factory = await ethers.getContractFactory("SoulboundCertificate");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("SoulboundCertificate deployed to:", address);
  console.log("Owner / initial issuer:", deployer.address);
  console.log("");
  console.log("Add this to frontend/.env:");
  console.log(`VITE_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
