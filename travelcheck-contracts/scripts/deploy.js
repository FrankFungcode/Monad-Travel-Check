const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log(
    "Account balance:",
    (await hre.ethers.provider.getBalance(deployer.address)).toString()
  );

  // 1. Deploy Staking Contract (with initial funding)
  console.log("\n--- Deploying TravelCheckStaking ---");
  const Staking = await hre.ethers.getContractFactory("TravelCheckStaking");
  const initialFunding = hre.ethers.parseEther("2");
  const staking = await Staking.deploy(deployer.address, {
    value: initialFunding
  });
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("TravelCheckStaking deployed to:", stakingAddress);
  console.log(
    "Staking contract funded with 2 ETH for rewards (interest + red packets)."
  );

  // 2. Deploy Attraction Contract
  console.log("\n--- Deploying TravelCheckAttraction ---");
  const Attraction = await hre.ethers.getContractFactory(
    "TravelCheckAttraction"
  );
  const attraction = await Attraction.deploy(deployer.address);
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
    `npx hardhat verify --network ${hre.network.name} ${stakingAddress} ${deployer.address}`
  );
  console.log(
    `npx hardhat verify --network ${hre.network.name} ${attractionAddress} ${deployer.address}`
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
