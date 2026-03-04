const { ethers } = require("hardhat");

async function main() {
  const Certificate = await ethers.getContractFactory("CertificateContract");
  const certificate = await Certificate.deploy();
  await certificate.waitForDeployment();

  const address = await certificate.getAddress();
  console.log("Certificate contract deployed to:", address);
  console.log("\nAdd this to your .env file:");
  console.log(`CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exit(1);
});
