const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TravelCheckToken", function () {
  let tckToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const TravelCheckToken = await ethers.getContractFactory("TravelCheckToken");
    tckToken = await TravelCheckToken.deploy(owner.address);
    await tckToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await tckToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply to the owner", async function () {
      const ownerBalance = await tckToken.balanceOf(owner.address);
      const totalSupply = await tckToken.totalSupply();
      expect(ownerBalance).to.equal(totalSupply);
    });

    it("Should have correct name and symbol", async function () {
      expect(await tckToken.name()).to.equal("TravelCheck Token");
      expect(await tckToken.symbol()).to.equal("TCK");
    });

    it("Should have 18 decimals", async function () {
      expect(await tckToken.decimals()).to.equal(18);
    });

    it("Should have initial supply of 1 billion tokens", async function () {
      const expectedSupply = ethers.parseEther("1000000000");
      expect(await tckToken.totalSupply()).to.equal(expectedSupply);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const amount = ethers.parseEther("50");
      await tckToken.transfer(addr1.address, amount);
      expect(await tckToken.balanceOf(addr1.address)).to.equal(amount);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await tckToken.balanceOf(owner.address);
      await expect(
        tckToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.reverted;

      expect(await tckToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await tckToken.balanceOf(owner.address);
      const amount1 = ethers.parseEther("100");
      const amount2 = ethers.parseEther("50");

      await tckToken.transfer(addr1.address, amount1);
      await tckToken.transfer(addr2.address, amount2);

      const finalOwnerBalance = await tckToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance - amount1 - amount2);

      expect(await tckToken.balanceOf(addr1.address)).to.equal(amount1);
      expect(await tckToken.balanceOf(addr2.address)).to.equal(amount2);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint new tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      const initialSupply = await tckToken.totalSupply();

      await tckToken.mint(addr1.address, mintAmount);

      expect(await tckToken.balanceOf(addr1.address)).to.equal(mintAmount);
      expect(await tckToken.totalSupply()).to.equal(initialSupply + mintAmount);
    });

    it("Should not allow non-owner to mint", async function () {
      const mintAmount = ethers.parseEther("1000");
      await expect(
        tckToken.connect(addr1).mint(addr1.address, mintAmount)
      ).to.be.reverted;
    });
  });

  describe("Burning", function () {
    it("Should allow token holders to burn their tokens", async function () {
      const burnAmount = ethers.parseEther("100");
      const initialBalance = await tckToken.balanceOf(owner.address);
      const initialSupply = await tckToken.totalSupply();

      await tckToken.burn(burnAmount);

      expect(await tckToken.balanceOf(owner.address)).to.equal(
        initialBalance - burnAmount
      );
      expect(await tckToken.totalSupply()).to.equal(initialSupply - burnAmount);
    });
  });
});
