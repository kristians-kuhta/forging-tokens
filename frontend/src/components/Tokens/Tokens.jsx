import React from 'react';
import PropTypes from 'prop-types';

import Token from '../Token/Token';

function Tokens({
  collection,
  handleMint,
  handleForge,
  handleBurn,
  handleTrade,
  mintCooldown,
  minting,
  burning,
  forging,
  trading,
  setMintCooldown,
}) {
  return (
    <ul className="d-flex mt-5 flex-wrap" style={{ gap: '2rem' }}>
      { collection.map((token) => (
        <Token
          key={`token-${token.id}`}
          id={token.id}
          name={token.name}
          description={token.description}
          image={token.image}
          balance={token.balance}
          mintable={token.id < 3}
          canBeForged={token.canBeForged}
          canBeBurned={token.canBeBurned}
          canBeTraded={token.canBeTraded}
          mintCooldown={mintCooldown}
          minting={minting}
          forging={forging}
          burning={burning}
          trading={trading}
          setMintCooldown={setMintCooldown}
          handleMint={handleMint}
          handleForge={handleForge}
          handleBurn={handleBurn}
          handleTrade={handleTrade}
        />
      )) }
    </ul>
  );
}

Tokens.propTypes = {
  collection: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      balance: PropTypes.number.isRequired,
      canBeForged: PropTypes.bool.isRequired,
      canBeBurned: PropTypes.bool.isRequired,
      canBeTraded: PropTypes.bool.isRequired
    })
  ).isRequired,
  handleMint: PropTypes.func.isRequired,
  handleForge: PropTypes.func.isRequired,
  handleBurn: PropTypes.func.isRequired,
  handleTrade: PropTypes.func.isRequired,
  mintCooldown: PropTypes.bool.isRequired,
  minting: PropTypes.bool.isRequired,
  burning: PropTypes.bool.isRequired,
  forging: PropTypes.bool.isRequired,
  trading: PropTypes.bool.isRequired,
  setMintCooldown: PropTypes.func.isRequired
};

export default Tokens;
