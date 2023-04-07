import Token from '../Token/Token';

function Tokens({
  collection,
  handleMint,
  mintCooldown,
  minting,
  setMintCooldown
}) {
  return <ul>
    { collection.map((token) => {
        return <Token
          key={`token-${token.id}`}
          id={token.id}
          name={token.name}
          description={token.description}
          image={token.image}
          balance={token.balance}
          mintable={token.id < 3}
          mintCooldown={mintCooldown}
          minting={minting}
          setMintCooldown={setMintCooldown}
          handleMint={handleMint}
        />
      })
    }
  </ul>
}

export default Tokens;
