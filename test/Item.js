const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");

const { expect } = require("chai");

describe("Item", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployToken() {
    // Contracts are deployed using the first signer/account by default
    const [firstAccount, secondAccount] = await ethers.getSigners();

    const factory = await ethers.getContractFactory("Item");
    const item = await factory.deploy();

    const forgeFactory = await ethers.getContractFactory("Forge");
    const forge = forgeFactory.attach(await item.forge());

    return { item, forge, firstAccount, secondAccount };
  }

  describe("Deployment", function () {
    it("set the uri", async function () {
      const { item } = await loadFixture(deployToken);

      await expect(await item.uri(777)).to.equal("ipfs://QmUSuYPXx3nxPaCJcvcNPuEMShzPpuDLGhnDmmtmJn4EJs/777");
    });

    it("deploys an instance of Forge contract", async function () {
      const { item } = await loadFixture(deployToken);

      await expect(await item.forge()).not.to.equal(ethers.constants.AddressZero);
    });

    it("deploys forge with the item address as an argument", async function () {
      const { item, forge } = await loadFixture(deployToken);

      await expect(await forge.item()).to.equal(item.address);
    });
  });

  describe("Contract information", function () {
    it("returns the contract uri", async () => {
      const { item, forge } = await loadFixture(deployToken);

      expect(await item.contractURI()).to.equal("ipfs://QmfBi7Gf2M9wLdC41aKKcncS2ns6nVgmffNAF3sFRnubqi");
    });
  });

  describe("Minting", function () {
    it("reverts if called by an address that is not forge address", async function () {
      const { item, forge, firstAccount } = await loadFixture(deployToken);

      await expect(
        item.mint(1234, firstAccount.address)
      ).to.be.revertedWithCustomError(item, "OnlyForgeCanPerformAction");
    });

    it("mints one token for the specified address", async function () {
      const { item, forge, firstAccount } = await loadFixture(deployToken);

      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [forge.address],
      });

      await network.provider.request({
        method: "hardhat_setBalance",
        // 1 ether
        params: [forge.address, "0xde0b6b3a7640000"]
      });

      const forgeSigner = await ethers.getSigner(forge.address);

      await item.connect(forgeSigner).mint(1234, firstAccount.address);

      await expect(await item.balanceOf(firstAccount.address, 1234)).to.equal(1);
    });
  });

  describe("Burning", function () {
    it("reverts if called by an address that is not forge address", async function () {
      const { item, forge, firstAccount } = await loadFixture(deployToken);

      await expect(
        item.burn(firstAccount.address, 1234, 1)
      ).to.be.revertedWithCustomError(item, "OnlyForgeCanPerformAction");
    });

    it("burns one token from the specified address", async function () {
      const { item, forge, firstAccount } = await loadFixture(deployToken);

      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [forge.address],
      });

      await network.provider.request({
        method: "hardhat_setBalance",
        // 1 ether
        params: [forge.address, "0xde0b6b3a7640000"]
      });

      const forgeSigner = await ethers.getSigner(forge.address);

      await item.connect(forgeSigner).mint(1234, firstAccount.address);

      await item.connect(forgeSigner).burn(firstAccount.address, 1234, 1);

      await expect(await item.balanceOf(firstAccount.address, 1234)).to.equal(0);
    });
  });
});
