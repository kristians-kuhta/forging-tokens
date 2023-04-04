import './App.css';
import { useState, useEffect } from 'react';
import { ethers } from "ethers";

import Navigation from './components/Navigation/Navigation';
import Dashboard from './components/Dashboard/Dashboard';

function App() {
  const [wallet, setWallet] = useState({
    balance: "0",
    balanceUnit: "MATIC",
    address: ""
  });

  const [provider, setProvider] = useState(null);

  async function connectAccount() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts"
        });
        const address = accounts[0];
        const provider = new ethers.BrowserProvider(window.ethereum)
        const weiBalance = await provider.getBalance(address);
        const balance = ethers.formatEther(weiBalance);

        setWallet((prev) => ({...prev, address, balance}));
        setProvider(provider);
      } catch (err) {
        console.error(err);
      }
    } else {
      alert("Please, use a browser that supports Metamask!");
    }
  }

  return (
    <div className="App">
      <>
        <Navigation address={wallet.address} balance={wallet.balance} balanceUnit={wallet.balanceUnit} connectAccount={connectAccount} />
        <Dashboard provider={provider} />
      </>
    </div>
  );
}

export default App;
