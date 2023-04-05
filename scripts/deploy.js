// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require('hardhat');
const path = require('path');
const fs = require('fs');

async function main() {
  const [owner] = await hre.ethers.getSigners();

  const factory = await hre.ethers.getContractFactory('Item');
  const token = await factory.deploy();

  const item = await token.deployed();

  console.log(`Item deployed to ${token.address}`);
  const forgeAddress = await item.forge();

  await saveFrontendFiles(item.address, forgeAddress);
}

function removePreviousFiles(contractsDir) {
  fs.unlinkSync(`${contractsDir}/Forge.json`);
  fs.unlinkSync(`${contractsDir}/Item.json`);
  fs.unlinkSync(`${contractsDir}/contract-address.json`);

  console.log(`Cleaned out ${contractsDir}`);
}

function saveFrontendFiles(itemAddress, forgeAddress) {
  const contractsDir = path.join(__dirname, '/../frontend/src/contracts');
  removePreviousFiles(contractsDir);

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  const contractAddressesPath = contractsDir + '/contract-address.json';

  fs.writeFileSync(
    contractAddressesPath,
    JSON.stringify({ Item: itemAddress, Forge: forgeAddress }, null, 2)
  );
  console.log(`Addresses written to ${contractAddressesPath}\n`);

  const forgeAbiPath = `${contractsDir}/Forge.json`;
  const ForgeArtifact = artifacts.readArtifactSync('Forge');

  fs.writeFileSync(forgeAbiPath, JSON.stringify(ForgeArtifact, null, 2));
  console.log(`Forge abi written to ${forgeAbiPath}`);

  const itemAbiPath = `${contractsDir}/Item.json`;
  const ItemArtifact = artifacts.readArtifactSync('Item');

  fs.writeFileSync(itemAbiPath, JSON.stringify(ItemArtifact, null, 2));
  console.log(`Forge abi written to ${itemAbiPath}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
