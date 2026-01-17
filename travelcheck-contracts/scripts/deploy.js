const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log(
    "Account balance:",
    (await hre.ethers.provider.getBalance(deployer.address)).toString()
  );

  // Signer address for signature verification (for TravelCheckAttraction only)
  const signerAddress = process.env.SIGNER_ADDRESS || deployer.address;
  console.log("Signer address for Attraction verification:", signerAddress);

  // 1. Deploy Staking Contract
  console.log("\n--- Deploying TravelCheckStaking ---");
  const Staking = await hre.ethers.getContractFactory("TravelCheckStaking");
  const staking = await Staking.deploy(deployer.address, signerAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("TravelCheckStaking deployed to:", stakingAddress);

  // Fund the staking contract for rewards (interest + red packets)
  console.log("Funding staking contract with 5 ETH for rewards...");
  await deployer.sendTransaction({
    to: stakingAddress,
    value: hre.ethers.parseEther("5")
  });
  console.log("Staking contract funded.");

  // 2. Deploy Attraction Contract
  console.log("\n--- Deploying TravelCheckAttraction ---");
  const Attraction = await hre.ethers.getContractFactory(
    "TravelCheckAttraction"
  );
  const attraction = await Attraction.deploy(deployer.address, signerAddress);
  await attraction.waitForDeployment();
  const attractionAddress = await attraction.getAddress();
  console.log("TravelCheckAttraction deployed to:", attractionAddress);

  // 3. Deploy Badge Contract
  console.log("\n--- Deploying TravelCheckBadge ---");
  const Badge = await hre.ethers.getContractFactory("TravelCheckBadge");
  const badge = await Badge.deploy(deployer.address);
  await badge.waitForDeployment();
  const badgeAddress = await badge.getAddress();
  console.log("TravelCheckBadge deployed to:", badgeAddress);

  // Deployment Summary
  console.log("\n========== Deployment Summary ==========");
  console.log(
    JSON.stringify(
      {
        network: hre.network.name,
        deployer: deployer.address,
        signer: signerAddress,
        contracts: {
          TravelCheckStaking: stakingAddress,
          TravelCheckAttraction: attractionAddress,
          TravelCheckBadge: badgeAddress
        }
      },
      null,
      2
    )
  );
  console.log("=========================================\n");

  // Verify instructions
  console.log("To verify contracts on explorer:");
  console.log(
    `npx hardhat verify --network ${hre.network.name} ${stakingAddress} ${deployer.address} ${signerAddress}`
  );
  console.log(
    `npx hardhat verify --network ${hre.network.name} ${attractionAddress} ${deployer.address} ${signerAddress}`
  );
  console.log(
    `npx hardhat verify --network ${hre.network.name} ${badgeAddress} ${deployer.address}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
