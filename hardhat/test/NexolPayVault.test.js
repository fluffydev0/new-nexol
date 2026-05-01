const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("NexolPayVault", function () {
  let vault, usdc, owner, user1, user2;
  const USDC_DECIMALS = 6;
  const toUSDC = (n) => ethers.parseUnits(n.toString(), USDC_DECIMALS);

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock USDC
    const MockERC20 = await ethers.getContractFactory("MockUSDC");
    usdc = await MockERC20.deploy();
    await usdc.waitForDeployment();

    // Deploy vault
    const NexolPayVault = await ethers.getContractFactory("NexolPayVault");
    vault = await NexolPayVault.deploy(await usdc.getAddress());
    await vault.waitForDeployment();

    // Mint USDC to users and owner
    await usdc.mint(user1.address, toUSDC(10000));
    await usdc.mint(user2.address, toUSDC(10000));
    await usdc.mint(owner.address, toUSDC(100000));

    // Approve vault
    await usdc.connect(user1).approve(await vault.getAddress(), ethers.MaxUint256);
    await usdc.connect(user2).approve(await vault.getAddress(), ethers.MaxUint256);
    await usdc.connect(owner).approve(await vault.getAddress(), ethers.MaxUint256);

    // Fund yield reserve
    await vault.connect(owner).fundYieldReserve(toUSDC(50000));
  });

  describe("Deployment", function () {
    it("should set correct APY constants", async function () {
      expect(await vault.APY_6_MONTH()).to.equal(420n);
      expect(await vault.APY_12_MONTH()).to.equal(610n);
    });

    it("should set owner correctly", async function () {
      expect(await vault.owner()).to.equal(owner.address);
    });

    it("should use USDC as underlying asset", async function () {
      expect(await vault.asset()).to.equal(await usdc.getAddress());
    });
  });

  describe("Deposits", function () {
    it("should lock USDC for 6 months", async function () {
      await vault.connect(user1).lockDeposit(toUSDC(100), 0);
      const deps = await vault.getDeposits(user1.address);
      expect(deps.length).to.equal(1);
      expect(deps[0].amount).to.equal(toUSDC(100));
      expect(deps[0].withdrawn).to.be.false;
    });

    it("should lock USDC for 12 months", async function () {
      await vault.connect(user1).lockDeposit(toUSDC(500), 1);
      const deps = await vault.getDeposits(user1.address);
      expect(deps[0].duration).to.equal(1n); // TwelveMonths
    });

    it("should reject zero amount", async function () {
      await expect(
        vault.connect(user1).lockDeposit(0, 0)
      ).to.be.revertedWith("Amount must be > 0");
    });

    it("should allow multiple deposits", async function () {
      await vault.connect(user1).lockDeposit(toUSDC(100), 0);
      await vault.connect(user1).lockDeposit(toUSDC(200), 1);
      expect(await vault.getDepositCount(user1.address)).to.equal(2n);
    });

    it("should emit Locked event", async function () {
      await expect(vault.connect(user1).lockDeposit(toUSDC(100), 0))
        .to.emit(vault, "Locked");
    });
  });

  describe("Yield Calculation", function () {
    it("should calculate 6-month yield correctly", async function () {
      // $100 * 4.2% * 180/365 = $2.071233...
      const yield_ = await vault.calculateYield(toUSDC(100), 0);
      // 100_000_000 * 420 * 180 / (10000 * 365) = 2071232
      expect(yield_).to.equal(2_071_232n);
    });

    it("should calculate 12-month yield correctly", async function () {
      // $100 * 6.1% * 365/365 = $6.10
      const yield_ = await vault.calculateYield(toUSDC(100), 1);
      // 100_000_000 * 610 * 365 / (10000 * 365) = 6_100_000
      expect(yield_).to.equal(6_100_000n);
    });

    it("should scale linearly with amount", async function () {
      const y1 = await vault.calculateYield(toUSDC(100), 1); // 12-month has no rounding (365/365)
      const y2 = await vault.calculateYield(toUSDC(1000), 1);
      expect(y2).to.equal(y1 * 10n);
    });
  });

  describe("Withdrawals", function () {
    it("should reject early withdrawal", async function () {
      await vault.connect(user1).lockDeposit(toUSDC(100), 0);
      await expect(
        vault.connect(user1).unlockDeposit(0)
      ).to.be.revertedWith("Still locked");
    });

    it("should allow withdrawal after 6-month lock", async function () {
      await vault.connect(user1).lockDeposit(toUSDC(100), 0);
      const balBefore = await usdc.balanceOf(user1.address);

      // Time travel 180 days
      await time.increase(180 * 24 * 60 * 60);
      await vault.connect(user1).unlockDeposit(0);

      const balAfter = await usdc.balanceOf(user1.address);
      const expectedYield = 2_071_232n;
      expect(balAfter - balBefore).to.equal(toUSDC(100) + expectedYield);
    });

    it("should allow withdrawal after 12-month lock", async function () {
      await vault.connect(user1).lockDeposit(toUSDC(100), 1);
      const balBefore = await usdc.balanceOf(user1.address);

      await time.increase(365 * 24 * 60 * 60);
      await vault.connect(user1).unlockDeposit(0);

      const balAfter = await usdc.balanceOf(user1.address);
      expect(balAfter - balBefore).to.equal(toUSDC(100) + 6_100_000n);
    });

    it("should reject double withdrawal", async function () {
      await vault.connect(user1).lockDeposit(toUSDC(100), 0);
      await time.increase(180 * 24 * 60 * 60);
      await vault.connect(user1).unlockDeposit(0);

      await expect(
        vault.connect(user1).unlockDeposit(0)
      ).to.be.revertedWith("Already withdrawn");
    });

    it("should reject invalid index", async function () {
      await expect(
        vault.connect(user1).unlockDeposit(99)
      ).to.be.revertedWith("Invalid index");
    });

    it("should emit Unlocked event", async function () {
      await vault.connect(user1).lockDeposit(toUSDC(100), 0);
      await time.increase(180 * 24 * 60 * 60);
      await expect(vault.connect(user1).unlockDeposit(0))
        .to.emit(vault, "Unlocked");
    });
  });

  describe("Access Control", function () {
    it("should only allow owner to fund yield reserve", async function () {
      await expect(
        vault.connect(user1).fundYieldReserve(toUSDC(100))
      ).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });

    it("should let owner fund yield reserve", async function () {
      await vault.connect(owner).fundYieldReserve(toUSDC(1000));
      // Just checking it doesn't revert
    });
  });

  describe("Multi-user isolation", function () {
    it("should isolate deposits between users", async function () {
      await vault.connect(user1).lockDeposit(toUSDC(100), 0);
      await vault.connect(user2).lockDeposit(toUSDC(500), 1);

      expect(await vault.getDepositCount(user1.address)).to.equal(1n);
      expect(await vault.getDepositCount(user2.address)).to.equal(1n);

      const u1Deps = await vault.getDeposits(user1.address);
      expect(u1Deps[0].amount).to.equal(toUSDC(100));

      const u2Deps = await vault.getDeposits(user2.address);
      expect(u2Deps[0].amount).to.equal(toUSDC(500));
    });
  });
});
