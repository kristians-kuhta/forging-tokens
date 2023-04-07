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
  const [forging, setForging] = useState(false);


  const MIN_TOKEN_ID = 0;
  const MAX_TOKEN_ID = 6;

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
    data.canBeForged = await contracts.Forge.canForgeToken(id);

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

      let tokens = [...collection];
      tokens = await Promise.all(
        tokens.map(async(token) => {
          if (token.id == tokenId) {
            token.balance++;
          } else if (token.id >= 3) {
            token.canBeForged = await contracts.Forge.canForgeToken(token.id);
          }
          return token;
        })
      );
      setCollection(tokens);
    } catch (error) {
      handleError(error);
    }
  }

  const updateTokenBalancesAfterForging = (tokenId) => {
    let burnedTokenIds = [];

    if (tokenId == 3) {
      burnedTokenIds = [0, 1];
    } else if (tokenId == 4) {
      burnedTokenIds = [1, 2];
    } else if (tokenId == 5) {
      burnedTokenIds = [0, 2];
    } else if (tokenId == 6) {
      burnedTokenIds = [0, 1, 2];
    }

    setCollection(prev => prev.map((token) => {
      if (token.id == tokenId) {
        token.balance++
      } else if (burnedTokenIds.includes(token.id)) {
        token.balance--;
      }

      return token;
    }));
  }

  const handleForge = async (tokenId) => {
    try {
      setForging(true);

      const tx = await contracts.Forge.forge(tokenId);
      await tx.wait();

      setForging(false);

      updateTokenBalancesAfterForging(tokenId);
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
        contracts={contracts}
        collection={collection}
        handleMint={handleMint}
        handleForge={handleForge}
        mintCooldown={mintCooldown}
        minting={minting}
        forging={forging}
        setMintCooldown={setMintCooldown}
      />
    </>;
  } else {
    return <p>Please, switch to Polygon Mumbai testnet to use the app!</p>;
  }
}

export default Dashboard;
