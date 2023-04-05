const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");

const { expect } = require("chai");

describe("Forge", function () {
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

    return { forge, item, firstAccount, secondAccount };
  }

  describe("Deployment", function () {
    it("sets the item upon deployment", async function () {
      const { item, forge } = await loadFixture(deployToken);

      await expect(await forge.item()).to.equal(item.address);
    });
  });

  describe("Minting", function () {
    it("reverts if trying to mint a token that cannot be minted", async function() {
      const { item, forge } = await loadFixture(deployToken);

      await expect(forge.mint(3)).to.be.revertedWithCustomError(forge, "TokenIdCannotBeMinted");
    });

    it("reverts if address is on mint cooldown", async function() {
      const { item, forge } = await loadFixture(deployToken);

      const blockTimestamp = await time.latest() + 1;
      await time.setNextBlockTimestamp(blockTimestamp);

      await forge.mint(0);
      const newBlockTimestamp = blockTimestamp + 57; // 57 seconds after mint
      await time.setNextBlockTimestamp(newBlockTimestamp);

      await expect(
        forge.mint(1)
      ).to.be.revertedWithCustomError(
        forge,
        "AddressOnMintCooldown"
      ).withArgs(3);
    });

    it("returns the mint cooldown in seconds", async function() {
      const { item, forge } = await loadFixture(deployToken);

      // Mint cooldown in seconds
      await expect(await forge.MINT_COOLDOWN()).to.equal(60);
    });

    it("mints a token for the caller just after the mint cooldown has ended", async function() {
      const { item, forge } = await loadFixture(deployToken);

      const blockTimestamp = await time.latest() + 1;

      await forge.mint(0);
      const newBlockTimestamp = blockTimestamp + 60; // 61 seconds after mint
      await time.setNextBlockTimestamp(newBlockTimestamp);

      await expect(forge.mint(1)).not.to.be.reverted;
    });
  });
});
