require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");

const INFURA_API_KEY = process.env.INFURA_API_KEY;
const ACCOUNT_PRIVATE_KEY = process.env.ACCOUNT_PRIVATE_KEY;
const ETHERSCAN_API_KEY= process.env.ETHERSCAN_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */

const config = buildConfig();

function buildConfig() {
  let networks = {
    hardhat: {
      mining: {
        auto: false,
        interval: 5000
      }
    },
  };

  if (INFURA_API_KEY) {
    networks.sepolia = {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [ACCOUNT_PRIVATE_KEY]
    }
    networks.goerli = {
      url: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [ACCOUNT_PRIVATE_KEY]
    }
    networks.polygon_mumbai = {
      url: `https://polygon-mumbai.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [ACCOUNT_PRIVATE_KEY]
    }
  }

  return ETHERSCAN_API_KEY ? { networks, etherscan: { apiKey: ETHERSCAN_API_KEY } } : { networks };
}

module.exports = {
  solidity: "0.8.19",
  ...config
};
