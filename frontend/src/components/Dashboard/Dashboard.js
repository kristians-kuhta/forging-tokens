import axios from 'axios';

import { useState, useEffect, useCallback } from 'react';

import Tokens from '../Tokens/Tokens';
import ErrorMessage from '../ErrorMessage/ErrorMessage';

const IPFS_GATEWAY_PREFIX = 'https://forge-token.infura-ipfs.io/ipfs/';

function Dashboard({walletAddress, provider, isCorrectChain, contracts}) {
  const [errorMessage, setErrorMessage] = useState(null);
  const [collection, setCollection] = useState([]);

  const [mintCooldown, setMintCooldown] = useState(false);
  const [minting, setMinting] = useState(false);
  const [forging, setForging] = useState(false);
  const [burning, setBurning] = useState(false);
  const [trading, setTrading] = useState(false);

  const MIN_TOKEN_ID = 0;
  const MAX_TOKEN_ID = 6;

  const buildToken = useCallback(async(id, tokenURI) => {
    let data = {id};
    if (!tokenURI) { return data; }

    const ipfsURL = tokenURI.replace('ipfs://', IPFS_GATEWAY_PREFIX).replace('{id}', id);
    data.url = ipfsURL;
    const tokenData = (await axios.get(ipfsURL)).data;
    const { name, description, image } = tokenData;

    const imageURL = image.replace('ipfs://', IPFS_GATEWAY_PREFIX).replace('{id}', id);

    data.name = name;
    data.description = description;
    data.image = imageURL;
    data.canBeForged = await canForgeToken(id);
    data.canBeBurned = await canBurnToken(id);
    data.canBeTraded = await canTradeToken(id);

    const balance = await contracts.Item.balanceOf(walletAddress, id);
    data.balance = balance > 0 ? balance.toString() : 0;

    return data;
  }, [contracts.Forge, contracts.Item, walletAddress]);

  useEffect(() => {
    if (!contracts || !contracts.Forge) { return; }

    try {
      contracts.Forge.mintCooldown().then(cooldownActive => {
        setMintCooldown(cooldownActive);
      });

    } catch (error) {
      handleError(error);
    }
  }, [contracts, contracts.Forge, setMintCooldown]);

  useEffect(() => {
    if (!contracts || !contracts.Item) { return; }

    (async () => {
      const items = []
      for(let tokenId = MIN_TOKEN_ID; tokenId <= MAX_TOKEN_ID; tokenId++) {
        const tokenURI = await contracts.Item.uri(tokenId);
        const token = await buildToken(tokenId, tokenURI);
        items.push(token);
      }
      setCollection(items);
    })();
  }, [contracts, contracts.Item, buildToken]);

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

      updateTokens();
    } catch (error) {
      handleError(error);
    }
  }

  const updatedToken = async (token) => {
    token.balance = Number(await contracts.Item.balanceOf(walletAddress, token.id));
    token.canBeForged = await canForgeToken(token.id);
    token.canBeTraded = await canTradeToken(token.id);
    token.canBeBurned = await canBurnToken(token.id);

    return token;
  }

  const updateTokens = async () => {
    const tokens = await Promise.all(collection.map(token => updatedToken(token)));

    setCollection(tokens);
  }

  // const updateTokensAfterBurning = async (tokenId) => {
  //   const tokens = await Promise.all(
  //     collection.map(async (token) => {
  //       if (token.id === tokenId) {
  //         token.balance = Number(await contracts.Item.balanceOf(walletAddress, token.id));
  //         token.canBeBurned = await canBurnToken(token.id);
  //         token.canBeForged = await canForgeToken(token.id);
  //         token.canBeTraded = await canTradeToken(token.id);
  //       }

  //       return token;
  //     })
  //   );
  //   setCollection(tokens);
  // }

  async function ownsTokens(tokenIds) {
    const balancePromises = tokenIds.map(tokenId => contracts.Item.balanceOf(walletAddress, tokenId));
    const balances = await Promise.all(balancePromises);
    return balances.every(balance => {
      return balance.toString() !== '0';
    });
  }

  async function canForgeToken(tokenId) {
    if (tokenId < 3) {
      return false;
    } else if (tokenId === 3) {
      return await ownsTokens([0, 1]);
    } else if (tokenId === 4) {
      return await ownsTokens([1, 2]);
    } else if (tokenId === 5) {
      return await ownsTokens([0, 2]);
    } else if (tokenId === 6) {
      return await ownsTokens([0, 1, 2]);
    } else {
      return false;
    }
  }

  async function canBurnToken(tokenId) {
    return tokenId > 3 && await ownsTokens([tokenId]);
  }

  async function canTradeToken(tokenId) {
    return tokenId < 3 && await ownsTokens([tokenId]);
  }

  const handleForge = async (tokenId) => {
    try {
      setForging(true);

      const tx = await contracts.Forge.forge(tokenId);
      await tx.wait();

      setForging(false);

      updateTokens();

    } catch (error) {
      handleError(error);
    }
  }

  const handleBurn = async (tokenId) => {
    try {
      setBurning(true);

      const tx = await contracts.Forge.burn(tokenId);
      await tx.wait();

      setBurning(false);

      // updateTokensAfterBurning(tokenId);
      updateTokens();

    } catch (error) {
      handleError(error);
    }
  }

  const handleTrade = async (fromTokenId, toTokenId) => {
    try {
      setTrading(true);

      const tx = await contracts.Forge.trade(fromTokenId, toTokenId);
      await tx.wait();

      setTrading(false);

      updateTokens();

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
        handleBurn={handleBurn}
        handleTrade={handleTrade}
        mintCooldown={mintCooldown}
        minting={minting}
        burning={burning}
        forging={forging}
        trading={trading}
        setMintCooldown={setMintCooldown}
      />
    </>;
  } else {
    return <p>Please, switch to Polygon Mumbai testnet to use the app!</p>;
  }
}

export default Dashboard;
