import Token from '../Token/Token';

function Tokens({
  contracts,
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

  return <ul className='d-flex mt-5 flex-wrap' style={{gap: '2rem'}}>
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
      })
    }
  </ul>
}

export default Tokens;
