import Token from '../Token/Token';

function Tokens({walletAddress, contracts, handleMint, collection}) {

  return <ul>
    { collection.map((token) => {
        return <Token
          key={`token-${token.id}`}
          id={token.id}
          name={token.name}
          image={token.image}
          balance={token.balance}
          description={token.description}
          handleMint={handleMint}
        />
      })
    }
  </ul>
}

export default Tokens;
