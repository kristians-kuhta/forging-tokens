import './App.css';
import { useState, useEffect } from 'react';
import { ethers } from "ethers";

import Navigation from './components/Navigation/Navigation';
import Dashboard from './components/Dashboard/Dashboard';

// address generated from the deploy script
import addresses from "./contracts/contract-address.json";

// artifacts generated from the deploy script
import ForgeArtifact from "./contracts/Forge.json";
import ItemArtifact from "./contracts/Item.json";

// Polygon Mumbai testnet or hardhat node (development)
const CHAIN_ID =
  (!process.env.NODE_ENV || process.env.NODE_ENV != 'production') ?
    '31337' : '80001';

function App() {
  const [wallet, setWallet] = useState({
    balance: "0",
    balanceUnit: "MATIC",
    address: "",
    chainId: ""
  });

  const [provider, setProvider] = useState(null);
  const [contracts, setContracts] = useState([]);

  async function connectAccount() {
    if (window.ethereum) {
      try {
        const [address] = await window.ethereum.request({
          method: "eth_requestAccounts"
        });
        const provider = new ethers.BrowserProvider(window.ethereum)

        const weiBalance = await provider.getBalance(address);
        const balance = ethers.formatEther(weiBalance);

        const { chainId } = await provider.getNetwork();

        setWallet((prev) => ({...prev, address, balance, chainId}));
        setProvider(provider);

        const forge = new ethers.Contract(
          addresses.Forge,
          ForgeArtifact.abi,
          await provider.getSigner(0)
        );

        const item = new ethers.Contract(
          addresses.Item,
          ItemArtifact.abi,
          await provider.getSigner(0)
        );

        setContracts({
          Forge: forge,
          Item: item
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      alert("Please, use a browser that supports Metamask!");
    }
  }

  useEffect(() => {
    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload();
    });
  }, [wallet, provider]);

  return (
    <div className="App">
      <>
        <Navigation address={wallet.address} balance={wallet.balance} balanceUnit={wallet.balanceUnit} connectAccount={connectAccount} />
        <Dashboard
          walletAddress={wallet.address}
          provider={provider}
          isCorrectChain={wallet.chainId == CHAIN_ID }
          contracts={contracts}
        />
      </>
    </div>
  );
}

export default App;
