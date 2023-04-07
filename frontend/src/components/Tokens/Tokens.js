import Token from '../Token/Token';

function Tokens({
  contracts,
  collection,
  handleMint,
  handleForge,
  mintCooldown,
  minting,
  forging,
  setMintCooldown,
}) {
  return <ul className='d-flex'>
    { collection.map((token) => {
        return <Token
          key={`token-${token.id}`}
          id={token.id}
          contracts={contracts}
          name={token.name}
          description={token.description}
          image={token.image}
          balance={token.balance}
          mintable={token.id < 3}
          canBeForged={token.canBeForged}
          mintCooldown={mintCooldown}
          minting={minting}
          forging={forging}
          setMintCooldown={setMintCooldown}
          handleMint={handleMint}
          handleForge={handleForge}
        />
      })
    }
  </ul>
}

export default Tokens;
