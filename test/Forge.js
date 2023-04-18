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
    it("reverts if trying to mint a token that cannot be minted", async function () {
      const { item, forge } = await loadFixture(deployToken);

      await expect(forge.mint(3)).to.be.revertedWithCustomError(
        forge,
        "TokenIdCannotBeMinted"
      );
    });

    it("reverts if address is on mint cooldown", async function () {
      const { item, forge } = await loadFixture(deployToken);

      const blockTimestamp = (await time.latest()) + 1;
      await time.setNextBlockTimestamp(blockTimestamp);

      await forge.mint(0);
      const newBlockTimestamp = blockTimestamp + 57; // 57 seconds after mint
      await time.setNextBlockTimestamp(newBlockTimestamp);

      await expect(forge.mint(1))
        .to.be.revertedWithCustomError(forge, "AddressOnMintCooldown")
        .withArgs(3);
    });

    it("returns the mint cooldown in seconds", async function () {
      const { item, forge } = await loadFixture(deployToken);

      // Mint cooldown in seconds
      await expect(await forge.MINT_COOLDOWN()).to.equal(60);
    });

    it("mints a token for the caller just after the mint cooldown has ended", async function () {
      const { forge, item, firstAccount } = await loadFixture(deployToken);

      const blockTimestamp = (await time.latest()) + 1;

      await expect(
        forge.mint(0)
      ).to.emit(item, "TransferSingle").withArgs(
        forge.address,
        ethers.constants.AddressZero,
        firstAccount.address,
        0, // tokenId
        1 // amount
      );

      expect(await item.balanceOf(firstAccount.address, 0)).to.equal(1);

      const newBlockTimestamp = blockTimestamp + 60; // 61 seconds after mint
      await time.setNextBlockTimestamp(newBlockTimestamp);

      await expect(
        forge.mint(1)
      ).to.emit(item, "TransferSingle").withArgs(
        forge.address,
        ethers.constants.AddressZero,
        firstAccount.address,
        1, // tokenId
        1 // amount
      );

      expect(await item.balanceOf(firstAccount.address, 1)).to.equal(1);
    });

    it("returns false when asking if address that has not minted before is on mint cooldown", async function () {
      const { forge } = await loadFixture(deployToken);

      expect(await forge.mintCooldown()).to.equal(false);
    });

    it("returns true when asking if address that just minted is on mint cooldown", async function () {
      const { forge } = await loadFixture(deployToken);

      await forge.mint(0);

      expect(await forge.mintCooldown()).to.equal(true);
    });

    it("returns false when asking if address that minted 61 seconds ago is on mint cooldown", async function () {
      const { forge } = await loadFixture(deployToken);

      await forge.mint(0);

      await time.increaseTo((await time.latest()) + 61);

      expect(await forge.mintCooldown()).to.equal(false);
    });
  });

  describe("Forging", function () {
    it("reverts if trying to forge token with id of 2", async function () {
      const { forge } = await loadFixture(deployToken);

      await expect(forge.forge(2)).to.be.revertedWith('Token ID cannot be forged');
    });

    it("reverts if trying to forge token with id of 7", async function () {
      const { forge } = await loadFixture(deployToken);

      await expect(forge.forge(7)).to.be.revertedWith('Token ID cannot be forged');
    });

    it("forges token with id of 3", async function () {
      const { forge, item, firstAccount } = await loadFixture(deployToken);

      await expect(
        forge.mint(0)
      ).to.emit(item, "TransferSingle").withArgs(
        forge.address,
        ethers.constants.AddressZero,
        firstAccount.address,
        0, // tokenId
        1 // amount
      );

      await time.setNextBlockTimestamp((await time.latest()) + 61);

      await expect(
        forge.mint(1)
      ).to.emit(item, "TransferSingle").withArgs(
        forge.address,
        ethers.constants.AddressZero,
        firstAccount.address,
        1, // tokenId
        1 // amount
      );

      await expect(
        forge.forge(3)
      // Expect minted token event
      ).to.emit(item, "TransferSingle").withArgs(
        forge.address,
        ethers.constants.AddressZero,
        firstAccount.address,
        3, // tokenId
        1 // amount
      ).and.to.emit(item, "TransferSingle").withArgs(
        forge.address,
        firstAccount.address,
        ethers.constants.AddressZero,
        0, // tokenId
        1 // amount
      ).and.to.emit(item, "TransferSingle").withArgs(
        forge.address,
        firstAccount.address,
        ethers.constants.AddressZero,
        1, // tokenId
        1 // amount
      );
    });

    it("forges token with id of 4", async function () {
      const { forge, item, firstAccount } = await loadFixture(deployToken);

      await expect(
        forge.mint(1)
      ).to.emit(item, "TransferSingle").withArgs(
        forge.address,
        ethers.constants.AddressZero,
        firstAccount.address,
        1, // tokenId
        1 // amount
      );

      await time.setNextBlockTimestamp((await time.latest()) + 61);

      await expect(
        forge.mint(2)
      ).to.emit(item, "TransferSingle").withArgs(
        forge.address,
        ethers.constants.AddressZero,
        firstAccount.address,
        2, // tokenId
        1 // amount
      );

      await expect(
        forge.forge(4)
      ).to.emit(item, "TransferSingle").withArgs(
        forge.address,
        ethers.constants.AddressZero,
        firstAccount.address,
        4, // tokenId
        1 // amount
      ).and.to.emit(item, "TransferSingle").withArgs(
        forge.address,
        firstAccount.address,
        ethers.constants.AddressZero,
        1, // tokenId
        1 // amount
      ).and.to.emit(item, "TransferSingle").withArgs(
        forge.address,
        firstAccount.address,
        ethers.constants.AddressZero,
        2, // tokenId
        1 // amount
      );
    });

    it("forges token with id of 5", async function () {
      const { forge, item, firstAccount } = await loadFixture(deployToken);

      await expect(
        forge.mint(0)
      ).to.emit(item, "TransferSingle").withArgs(
        forge.address,
        ethers.constants.AddressZero,
        firstAccount.address,
        0, // tokenId
        1 // amount
      );

      await time.setNextBlockTimestamp((await time.latest()) + 61);

      await expect(
        forge.mint(2)
      ).to.emit(item, "TransferSingle").withArgs(
        forge.address,
        ethers.constants.AddressZero,
        firstAccount.address,
        2, // tokenId
        1 // amount
      );

      await expect(
        forge.forge(5)
      ).to.emit(item, "TransferSingle").withArgs(
        forge.address,
        ethers.constants.AddressZero,
        firstAccount.address,
        5, // tokenId
        1 // amount
      ).and.to.emit(item, "TransferSingle").withArgs(
        forge.address,
        firstAccount.address,
        ethers.constants.AddressZero,
        0, // tokenId
        1 // amount
      ).and.to.emit(item, "TransferSingle").withArgs(
        forge.address,
        firstAccount.address,
        ethers.constants.AddressZero,
        2, // tokenId
        1 // amount
      );
    });

    it("forges token with id of 6", async function () {
      const { forge, item, firstAccount } = await loadFixture(deployToken);

      await expect(
        forge.mint(0)
      ).to.emit(item, "TransferSingle").withArgs(
        forge.address,
        ethers.constants.AddressZero,
        firstAccount.address,
        0, // tokenId
        1 // amount
      );

      await time.setNextBlockTimestamp((await time.latest()) + 61);

      await expect(
        forge.mint(1)
      ).to.emit(item, "TransferSingle").withArgs(
        forge.address,
        ethers.constants.AddressZero,
        firstAccount.address,
        1, // tokenId
        1 // amount
      );

      await time.setNextBlockTimestamp((await time.latest()) + 61);

      await expect(
        forge.mint(2)
      ).to.emit(item, "TransferSingle").withArgs(
        forge.address,
        ethers.constants.AddressZero,
        firstAccount.address,
        2, // tokenId
        1 // amount
      );

      await expect(
        forge.forge(6)
      ).to.emit(item, "TransferSingle").withArgs(
        forge.address,
        ethers.constants.AddressZero,
        firstAccount.address,
        6, // tokenId
        1 // amount
      ).and.to.emit(item, "TransferSingle").withArgs(
        forge.address,
        firstAccount.address,
        ethers.constants.AddressZero,
        0, // tokenId
        1 // amount
      ).and.to.emit(item, "TransferSingle").withArgs(
        forge.address,
        firstAccount.address,
        ethers.constants.AddressZero,
        1, // tokenId
        1 // amount
      ).and.to.emit(item, "TransferSingle").withArgs(
        forge.address,
        firstAccount.address,
        ethers.constants.AddressZero,
        2, // tokenId
        1 // amount
      );
    });
  });

  describe("Burning", function () {
    it("reverts if trying to burn token with id of 3", async function () {
      const { forge } = await loadFixture(deployToken);

      await (await forge.mint(0)).wait();
      await time.setNextBlockTimestamp((await time.latest()) + 61);
      await (await forge.mint(1)).wait();

      await (await forge.forge(3)).wait();

      await expect(forge.burn(3)).to.be.revertedWithCustomError(
        forge,
        "TokenCannotBeBurned"
      );
    });

    it("burns a token with id of 4", async function () {
      const { forge, item, firstAccount } = await loadFixture(deployToken);

      await (await forge.mint(1)).wait();
      await time.setNextBlockTimestamp((await time.latest()) + 61);
      await (await forge.mint(2)).wait();

      await (await forge.forge(4)).wait();
      await (await forge.burn(4)).wait();

      expect(await item.balanceOf(firstAccount.address, 4)).to.equal(0);
    });
  });

  describe("Trading", function () {
    it("reverts if trying to trade from/to the same token ID", async function () {
      const { forge } = await loadFixture(deployToken);

      await expect(forge.trade(1, 1)).to.be.revertedWith('From/to token IDs must differ');
    });

    it("burns a token when trying to trade from a token with ID of 3", async function () {
      const { forge, item, firstAccount } = await loadFixture(deployToken);

      await (await forge.mint(0)).wait();
      await time.setNextBlockTimestamp((await time.latest()) + 61);
      await (await forge.mint(1)).wait();

      await (await forge.forge(3)).wait();
      await (await forge.trade(3, 1)).wait();

      expect(await item.balanceOf(firstAccount.address, 3)).to.equal(0);
    });

    it("trades a token when trading from token ID 1 to 2", async function () {
      const { forge, item, firstAccount } = await loadFixture(deployToken);

      await (await forge.mint(1)).wait();
      await time.setNextBlockTimestamp((await time.latest()) + 61);

      await (await forge.trade(1, 2)).wait();

      expect(await item.balanceOf(firstAccount.address, 1)).to.equal(0);
      expect(await item.balanceOf(firstAccount.address, 2)).to.equal(1);
    });

    it("reverts when trading from token ID 2 to 4", async function () {
      const { forge, item, firstAccount } = await loadFixture(deployToken);

      await (await forge.mint(2)).wait();
      await time.setNextBlockTimestamp((await time.latest()) + 61);

      await expect(forge.trade(2, 4)).to.be.revertedWith('Token IDs cannot be traded');
    });
  });
});
