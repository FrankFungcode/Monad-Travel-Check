const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("TravelCheckStaking", function () {
  let tckToken;
  let staking;
  let owner;
  let user1;
  let user2;

  const STAKE_AMOUNT = ethers.parseEther("100");
  const MILESTONE = 30;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy TCK Token
    const TravelCheckToken = await ethers.getContractFactory("TravelCheckToken");
    tckToken = await TravelCheckToken.deploy(owner.address);
    await tckToken.waitForDeployment();

    // Deploy Staking Contract
    const TravelCheckStaking = await ethers.getContractFactory("TravelCheckStaking");
    staking = await TravelCheckStaking.deploy(
      await tckToken.getAddress(),
      owner.address
    );
    await staking.waitForDeployment();

    // Transfer tokens to users and approve staking contract
    await tckToken.transfer(user1.address, ethers.parseEther("10000"));
    await tckToken.transfer(user2.address, ethers.parseEther("10000"));
    await tckToken.connect(user1).approve(await staking.getAddress(), ethers.MaxUint256);
    await tckToken.connect(user2).approve(await staking.getAddress(), ethers.MaxUint256);
  });

  describe("Deployment", function () {
    it("Should set correct token address", async function () {
      expect(await staking.tckToken()).to.equal(await tckToken.getAddress());
    });

    it("Should set correct interest rates", async function () {
      expect(await staking.sealedRates(30)).to.equal(500);
      expect(await staking.sealedRates(100)).to.equal(800);
      expect(await staking.anytimeRates(30)).to.equal(250);
    });

    it("Should set correct constants", async function () {
      expect(await staking.MIN_STAKE_AMOUNT()).to.equal(ethers.parseEther("1"));
      expect(await staking.MAX_STAKE_AMOUNT()).to.equal(ethers.parseEther("1000"));
    });
  });

  describe("Create Stake", function () {
    it("Should create a stake successfully", async function () {
      await expect(
        staking.connect(user1).createStake(0, STAKE_AMOUNT, MILESTONE, 0)
      )
        .to.emit(staking, "StakeCreated")
        .withArgs(0, user1.address, 0, STAKE_AMOUNT, MILESTONE, 0);

      const stake = await staking.getStake(0);
      expect(stake.user).to.equal(user1.address);
      expect(stake.amount).to.equal(STAKE_AMOUNT);
      expect(stake.milestone).to.equal(MILESTONE);
    });

    it("Should reject stake below minimum amount", async function () {
      const lowAmount = ethers.parseEther("0.5");
      await expect(
        staking.connect(user1).createStake(0, lowAmount, MILESTONE, 0)
      ).to.be.revertedWith("Amount too low");
    });

    it("Should reject stake above maximum amount", async function () {
      const highAmount = ethers.parseEther("1001");
      await expect(
        staking.connect(user1).createStake(0, highAmount, MILESTONE, 0)
      ).to.be.revertedWith("Amount too high");
    });

    it("Should reject invalid milestone", async function () {
      await expect(
        staking.connect(user1).createStake(0, STAKE_AMOUNT, 50, 0)
      ).to.be.revertedWith("Invalid milestone");
    });

    it("Should transfer tokens from user", async function () {
      const initialBalance = await tckToken.balanceOf(user1.address);
      await staking.connect(user1).createStake(0, STAKE_AMOUNT, MILESTONE, 0);
      const finalBalance = await tckToken.balanceOf(user1.address);
      expect(finalBalance).to.equal(initialBalance - STAKE_AMOUNT);
    });
  });

  describe("Check In", function () {
    beforeEach(async function () {
      await staking.connect(user1).createStake(0, STAKE_AMOUNT, MILESTONE, 0);
    });

    it("Should check in successfully", async function () {
      await expect(staking.connect(user1).checkIn(0))
        .to.emit(staking, "CheckedIn")
        .withArgs(0, 1);

      const stake = await staking.getStake(0);
      expect(stake.checkedDays).to.equal(1);
    });

    it("Should only allow stake owner to check in", async function () {
      await expect(staking.connect(user2).checkIn(0)).to.be.revertedWith(
        "Not stake owner"
      );
    });

    it("Should complete stake after checking in all days", async function () {
      // Check in for all days
      for (let i = 0; i < MILESTONE; i++) {
        await staking.connect(user1).checkIn(0);
      }

      const stake = await staking.getStake(0);
      expect(stake.status).to.equal(1); // COMPLETED
    });

    it("Should calculate interest correctly", async function () {
      await staking.connect(user1).checkIn(0);
      const interest = await staking.calculateInterest(0);
      expect(interest).to.be.gt(0);
    });
  });

  describe("Withdraw", function () {
    beforeEach(async function () {
      await staking.connect(user1).createStake(0, STAKE_AMOUNT, MILESTONE, 0);
    });

    it("Should withdraw successfully after completion (sealed mode)", async function () {
      // Check in for all days
      for (let i = 0; i < MILESTONE; i++) {
        await staking.connect(user1).checkIn(0);
      }

      const initialBalance = await tckToken.balanceOf(user1.address);
      await staking.connect(user1).withdraw(0);
      const finalBalance = await tckToken.balanceOf(user1.address);

      expect(finalBalance).to.be.gt(initialBalance);
      expect(finalBalance).to.be.gte(initialBalance + STAKE_AMOUNT);

      const stake = await staking.getStake(0);
      expect(stake.status).to.equal(2); // WITHDRAWN
    });

    it("Should allow withdrawal anytime for anytime mode", async function () {
      // Create anytime stake
      await staking.connect(user1).createStake(0, STAKE_AMOUNT, MILESTONE, 1);

      // Check in a few times
      await staking.connect(user1).checkIn(1);
      await staking.connect(user1).checkIn(1);

      // Should be able to withdraw
      await expect(staking.connect(user1).withdraw(1)).to.not.be.reverted;
    });

    it("Should not allow double withdrawal", async function () {
      // Complete and withdraw
      for (let i = 0; i < MILESTONE; i++) {
        await staking.connect(user1).checkIn(0);
      }
      await staking.connect(user1).withdraw(0);

      // Try to withdraw again
      await expect(staking.connect(user1).withdraw(0)).to.be.revertedWith(
        "Already withdrawn"
      );
    });

    it("Should only allow stake owner to withdraw", async function () {
      for (let i = 0; i < MILESTONE; i++) {
        await staking.connect(user1).checkIn(0);
      }

      await expect(staking.connect(user2).withdraw(0)).to.be.revertedWith(
        "Not stake owner"
      );
    });
  });

  describe("Interest Calculation", function () {
    it("Should calculate higher interest for sealed mode", async function () {
      await staking.connect(user1).createStake(0, STAKE_AMOUNT, MILESTONE, 0); // Sealed
      await staking.connect(user2).createStake(0, STAKE_AMOUNT, MILESTONE, 1); // Anytime

      await staking.connect(user1).checkIn(0);
      await staking.connect(user2).checkIn(1);

      const sealedInterest = await staking.calculateInterest(0);
      const anytimeInterest = await staking.calculateInterest(1);

      expect(sealedInterest).to.be.gt(anytimeInterest);
    });

    it("Should reduce interest by 50% for imperfect sealed stakes", async function () {
      await staking.connect(user1).createStake(0, STAKE_AMOUNT, MILESTONE, 0);

      await staking.connect(user1).checkIn(0);
      const perfectInterest = await staking.calculateInterest(0);

      await staking.markImperfect(0);
      const imperfectInterest = await staking.calculateInterest(0);

      expect(imperfectInterest).to.equal(perfectInterest / BigInt(2));
    });
  });

  describe("User Stakes", function () {
    it("Should return user's stake IDs", async function () {
      await staking.connect(user1).createStake(0, STAKE_AMOUNT, 30, 0);
      await staking.connect(user1).createStake(0, STAKE_AMOUNT, 100, 0);

      const stakeIds = await staking.getUserStakes(user1.address);
      expect(stakeIds.length).to.equal(2);
      expect(stakeIds[0]).to.equal(0);
      expect(stakeIds[1]).to.equal(1);
    });
  });
});
