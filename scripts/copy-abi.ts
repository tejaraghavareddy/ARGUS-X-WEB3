import * as fs from "fs";
import * as path from "path";

async function main() {
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/SoulboundCertificate.sol/SoulboundCertificate.json"
  );

  if (!fs.existsSync(artifactPath)) {
    throw new Error("Artifact not found. Run `npx hardhat compile` first.");
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const destDir = path.join(__dirname, "../frontend/src/contracts");
  fs.mkdirSync(destDir, { recursive: true });

  const out = {
    contractName: artifact.contractName,
    abi: artifact.abi,
  };

  fs.writeFileSync(
    path.join(destDir, "SoulboundCertificate.json"),
    JSON.stringify(out, null, 2)
  );

  console.log("ABI copied to frontend/src/contracts/SoulboundCertificate.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
