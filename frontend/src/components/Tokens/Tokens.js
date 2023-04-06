import Token from '../Token/Token';

function Tokens({
  walletAddress,
  contracts,
  handleMint,
  collection,
  mintAllowed,
  setMintAllowed
}) {
  return <ul>
    { collection.map((token) => {
        return <Token
          key={`token-${token.id}`}
          id={token.id}
          name={token.name}
          image={token.image}
          balance={token.balance}
          mintable={token.id < 3}
          mintAllowed={mintAllowed}
          setMintAllowed={setMintAllowed}
          description={token.description}
          handleMint={handleMint}
        />
      })
    }
  </ul>
}

export default Tokens;
