import './App.css';
import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

import Navigation from './components/Navigation/Navigation';
import Dashboard from './components/Dashboard/Dashboard';

// address generated from the deploy script
import addresses from './contracts/contract-address.json';

// artifacts generated from the deploy script
import ForgeArtifact from './contracts/Forge.json';
import ItemArtifact from './contracts/Item.json';

// Polygon Mumbai testnet or hardhat node (development)
const CHAIN_ID = process.env.NODE_ENV === 'production' ? 80001 : 31337;

function App() {
  const [wallet, setWallet] = useState({
    balance: '0',
    balanceUnit: 'MATIC',
    address: '',
    chainId: ''
  });

  const [provider, setProvider] = useState(null);
  const [contracts, setContracts] = useState({});

  const connectAccount = useCallback(async () => {
    if (window.ethereum) {
      try {
        const [address] = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const weiBalance = await web3Provider.getBalance(address);
        const balance = ethers.utils.formatEther(weiBalance);

        const { chainId } = await web3Provider.getNetwork();

        setWallet((prev) => ({
          ...prev, address, balance, chainId
        }));
        setProvider(web3Provider);

        if (wallet.chainId !== CHAIN_ID) {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
          });
        }

        const forge = new ethers.Contract(
          addresses.Forge,
          ForgeArtifact.abi,
          await web3Provider.getSigner(0)
        );

        const item = new ethers.Contract(
          addresses.Item,
          ItemArtifact.abi,
          await web3Provider.getSigner(0)
        );

        setContracts({
          Forge: forge,
          Item: item
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      alert('Please, use a browser that supports Metamask!');
    }
  }, []);

  useEffect(() => {
    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    });
  }, [wallet, provider]);

  return (
    <div className="App">
      <Navigation
        address={wallet.address}
        balance={wallet.balance}
        balanceUnit={wallet.balanceUnit}
        connectAccount={connectAccount}
      />
      <Dashboard
        walletAddress={wallet.address}
        provider={provider}
        isCorrectChain={wallet.chainId === CHAIN_ID}
        contracts={contracts}
      />
    </div>
  );
}

export default App;
