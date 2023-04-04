import './App.css';
import { useState, useEffect } from 'react';
import { ethers } from "ethers";

function App() {
  const [wallet, setWallet] = useState({});

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

        setWallet({address, balance});
      } catch (err) {
        console.error(err);
      }
    } else {
      alert("Please, use a browser that supports Metamask!");
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        { wallet.address ?
          <p>Connected to { wallet.address } ({wallet.balance} MATIC)</p>
          :
          <button onClick={connectAccount} >Connect</button>
        }
      </header>
    </div>
  );
}

export default App;
