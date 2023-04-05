import axios from 'axios';

import { useState, useEffect } from 'react';

import Tokens from '../Tokens/Tokens';
import ErrorMessage from '../ErrorMessage/ErrorMessage';

const IPFS_GATEWAY_PREFIX = 'https://forge-token.infura-ipfs.io/ipfs/';

function Dashboard({walletAddress, provider, isCorrectChain, contracts}) {
  const [errorMessage, setErrorMessage] = useState(null);
  const [collection, setCollection] = useState([]);

  const MIN_TOKEN_ID = 0;
  const MAX_TOKEN_ID = 7;

  const buildToken = async (id) => {
    let data = {id};
    if (!contracts.Item) { return data; }

    const uri = await contracts.Item.uri(id);

    const ipfsURL = uri.replace('ipfs://', IPFS_GATEWAY_PREFIX).
      replace('{id}', id);
    data.url = ipfsURL;
    const tokenData = (await axios.get(ipfsURL)).data;
    const { name, description, image } = tokenData;

    const imageURL = image.replace('ipfs://', IPFS_GATEWAY_PREFIX).
      replace('{id}', id);

    data.name = name;
    data.description = description;
    data.image = imageURL;

    // 4. fetch and set the balance
    const balance = await contracts.Item.balanceOf(walletAddress, id);
    data.balance = balance > 0 ? balance.toString() : 0;

    return data;
  }

  useEffect(() => {
    (async () => {
      const items = []
      for(let tokenId = MIN_TOKEN_ID; tokenId <= MAX_TOKEN_ID; tokenId++) {
        const token = await buildToken(tokenId);

        items.push(token);
      }
      setCollection(items);
    })();
  }, [contracts]);

  const handleMint = async (tokenId) => {
    try {
      const tx = await contracts.Forge.mint(tokenId);
      await tx.wait();
      const newBalance = await contracts.Item.balanceOf(walletAddress, tokenId);
      setCollection(prev => {
        const token = prev.filter((item) => item.id === tokenId);
        if (!token) {
          return prev;
        }
        const other = prev.filter((item) => item.id != tokenId);
        token.balance = newBalance;
        return [...other, token];
      });
    } catch (error) {
      const errorMessage = error.info &&
        error.info.error && error.info.error.data &&
        error.info.error.data.message;
      setErrorMessage(errorMessage);
      console.error(error);
    }
  }

  if (!provider) {
    return <p>Connect to use the app!</p>;
  } else if (isCorrectChain) {
    return <>
      { errorMessage && <ErrorMessage text={errorMessage}/> }
      <Tokens walletAddress={walletAddress} contracts={contracts} handleMint={handleMint} collection={collection} />;
    </>;
  } else {
    return <p>Please, switch to Polygon Mumbai testnet to use the app!</p>;
  }
}

export default Dashboard;
