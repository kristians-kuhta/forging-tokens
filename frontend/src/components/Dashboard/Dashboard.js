import axios from 'axios';

import { useState, useEffect } from 'react';

import Tokens from '../Tokens/Tokens';
import ErrorMessage from '../ErrorMessage/ErrorMessage';

const IPFS_GATEWAY_PREFIX = 'https://forge-token.infura-ipfs.io/ipfs/';

function Dashboard({walletAddress, provider, isCorrectChain, contracts}) {
  const [errorMessage, setErrorMessage] = useState(null);
  const [collection, setCollection] = useState([]);

  const [mintCooldown, setMintCooldown] = useState(false);
  const [minting, setMinting] = useState(false);

  const MIN_TOKEN_ID = 0;
  const MAX_TOKEN_ID = 7;

  const buildToken = async (id, tokenURI) => {
    let data = {id};
    if (!tokenURI) { return data; }

    const ipfsURL = tokenURI.replace('ipfs://', IPFS_GATEWAY_PREFIX).
      replace('{id}', id);
    data.url = ipfsURL;
    const tokenData = (await axios.get(ipfsURL)).data;
    const { name, description, image } = tokenData;

    const imageURL = image.replace('ipfs://', IPFS_GATEWAY_PREFIX).
      replace('{id}', id);

    data.name = name;
    data.description = description;
    data.image = imageURL;

    const balance = await contracts.Item.balanceOf(walletAddress, id);
    data.balance = balance > 0 ? balance.toString() : 0;

    return data;
  }

  useEffect(() => {
    if (!contracts || !contracts.Forge) { return; }

    try {
      contracts.Forge.mintCooldown().then(cooldownActive => {
        setMintCooldown(cooldownActive);
      });

    } catch (error) {
      handleError(error);
    }
  }, [setMintCooldown, contracts.Forge]);

  useEffect(() => {
    if (!contracts || !contracts.Item) { return; }

    (async () => {
      const tokenURI = await contracts.Item['uri()']();
      const items = []
      for(let tokenId = MIN_TOKEN_ID; tokenId <= MAX_TOKEN_ID; tokenId++) {
        const token = await buildToken(tokenId, tokenURI);
        items.push(token);
      }
      setCollection(items);
    })();
  }, [contracts, contracts.Item]);

  const handleError = (error) => {
    const errorMessage = error.info &&
      error.info.error && error.info.error.data &&
      error.info.error.data.message;
    setErrorMessage(errorMessage);
    console.error(error);
  }

  const handleMint = async (tokenId) => {
    try {
      setMinting(true);

      const tx = await contracts.Forge.mint(tokenId);
      await tx.wait();

      setMinting(false);
      setMintCooldown(true);

      const newBalance = await contracts.Item.balanceOf(walletAddress, tokenId);
      setCollection(prev => {
        let token = prev.filter((item) => item.id === tokenId)[0];
        if (!token) {
          return prev;
        }
        const other = prev.filter((item) => item.id != tokenId);
        token.balance = newBalance.toString();
        return [...other, token].sort((a, b) => a.id > b.id ? 1 : -1);
      });

    } catch (error) {
      handleError(error);
    }
  }

  if (!provider) {
    return <p>Connect to use the app!</p>;
  } else if (isCorrectChain) {
    return <>
      { errorMessage && <ErrorMessage text={errorMessage}/> }
      <Tokens
        collection={collection}
        handleMint={handleMint}
        mintCooldown={mintCooldown}
        minting={minting}
        setMintCooldown={setMintCooldown}
      />
    </>;
  } else {
    return <p>Please, switch to Polygon Mumbai testnet to use the app!</p>;
  }
}

export default Dashboard;
