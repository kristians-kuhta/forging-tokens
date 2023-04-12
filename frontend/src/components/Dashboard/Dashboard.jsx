import axios from 'axios';

import React, { useState, useEffect, useCallback } from 'react';

import PropTypes from 'prop-types';

import Tokens from '../Tokens/Tokens';
import ErrorMessage from '../ErrorMessage/ErrorMessage';

const IPFS_GATEWAY_PREFIX = 'https://forge-token.infura-ipfs.io/ipfs/';

function Dashboard({
  walletAddress,
  provider,
  isCorrectChain,
  contracts
}) {
  const [errorMessage, setErrorMessage] = useState(null);
  const [collection, setCollection] = useState([]);

  const [mintCooldown, setMintCooldown] = useState(false);
  const [minting, setMinting] = useState(false);
  const [forging, setForging] = useState(false);
  const [burning, setBurning] = useState(false);
  const [trading, setTrading] = useState(false);

  const MIN_TOKEN_ID = 0;
  const MAX_TOKEN_ID = 6;

  const ownsTokens = useCallback(
    async (tokenIds) => {
      const balancePromises = tokenIds.map((tokenId) => contracts.Item
        .balanceOf(walletAddress, tokenId));
      const balances = await Promise.all(balancePromises);
      return balances.every((balance) => balance.toString() !== '0');
    },
    [contracts.Item, walletAddress,]
  );

  const canForgeToken = useCallback(
    async (tokenId) => {
      if (tokenId < 3) {
        return false;
      }
      if (tokenId === 3) {
        return ownsTokens([0, 1]);
      }
      if (tokenId === 4) {
        return ownsTokens([1, 2]);
      }
      if (tokenId === 5) {
        return ownsTokens([0, 2]);
      }
      if (tokenId === 6) {
        return ownsTokens([0, 1, 2]);
      }
      return false;
    },
    [ownsTokens,]
  );

  const canBurnToken = useCallback(
    async (tokenId) => tokenId > 3 && ownsTokens([tokenId]),
    [ownsTokens,]
  );

  const canTradeToken = useCallback(
    async (tokenId) => tokenId < 3 && ownsTokens([tokenId]),
    [ownsTokens,]
  );

  const updatedToken = useCallback(
    async (token) => {
      const newToken = { ...token };
      newToken.balance = Number(
        await contracts.Item.balanceOf(walletAddress, token.id),
      );
      newToken.canBeForged = await canForgeToken(token.id);
      newToken.canBeTraded = await canTradeToken(token.id);
      newToken.canBeBurned = await canBurnToken(token.id);

      return newToken;
    },
    [contracts.Item, walletAddress, canForgeToken, canTradeToken, canBurnToken,]
  );

  const buildToken = useCallback(
    async (id, tokenURIPromise) => {
      let data = { id };
      if (!tokenURIPromise) {
        return data;
      }

      const ipfsURL = (await tokenURIPromise)
        .replace('ipfs://', IPFS_GATEWAY_PREFIX)
        .replace('{id}', id);
      const tokenData = (await axios.get(ipfsURL)).data;
      const { name, description, image } = tokenData;

      const imageURL = image
        .replace('ipfs://', IPFS_GATEWAY_PREFIX)
        .replace('{id}', id);

      data.name = name;
      data.description = description;
      data.image = imageURL;
      data = updatedToken(data);

      return data;
    },
    [updatedToken,]
  );

  const handleError = (error) => {
    const message = error.info
      && error.info.error
      && error.info.error.data
      && error.info.error.data.message;
    setErrorMessage(message);
  };

  useEffect(() => {
    if (!contracts || !contracts.Forge) {
      return undefined;
    }

    try {
      contracts.Forge.mintCooldown().then((cooldownActive) => {
        setMintCooldown(cooldownActive);
      });
    } catch (error) {
      handleError(error);
    }
    return undefined;
  }, [contracts, contracts.Forge, setMintCooldown]);

  useEffect(() => {
    if (!contracts || !contracts.Item) {
      return undefined;
    }

    (async () => {
      let items = [];
      for (let tokenId = MIN_TOKEN_ID; tokenId <= MAX_TOKEN_ID; tokenId += 1) {
        const tokenURIPromise = contracts.Item.uri(tokenId);
        items.push(buildToken(tokenId, tokenURIPromise));
      }
      setCollection(await Promise.all(items));
    })();
    return undefined;
  }, [contracts, contracts.Item, buildToken]);

  const updateTokens = async () => {
    const tokens = await Promise.all(collection.map((token) => updatedToken(token)));

    setCollection(tokens);
  };

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
  };

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
  };

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
  };

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
  };

  if (!provider) {
    return <p>Connect to use the app!</p>;
  }
  if (isCorrectChain) {
    return (
      <>
        {errorMessage && <ErrorMessage text={errorMessage} />}
        <Tokens
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
      </>
    );
  }
  return <p>Please, switch to Polygon Mumbai testnet to use the app!</p>;
}

Dashboard.defaultProps = { provider: null };

Dashboard.propTypes = {
  walletAddress: PropTypes.string.isRequired,
  provider: PropTypes.shape({}),
  isCorrectChain: PropTypes.bool.isRequired,
  contracts: PropTypes.shape({
    Item: PropTypes.shape({
      balanceOf: PropTypes.func.isRequired,
      uri: PropTypes.func.isRequired
    }),
    Forge: PropTypes.shape({
      mint: PropTypes.func.isRequired,
      forge: PropTypes.func.isRequired,
      burn: PropTypes.func.isRequired,
      trade: PropTypes.func.isRequired,
      mintCooldown: PropTypes.func.isRequired,
    }),
  }).isRequired,
};

export default Dashboard;
