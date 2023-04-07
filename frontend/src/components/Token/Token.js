import { useEffect, useState } from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';

function Token({
  id,
  contracts,
  name,
  description,
  image,
  balance,
  mintable,
  mintCooldown,
  minting,
  forging,
  setMintCooldown,
  handleMint,
  handleForge,
  canBeForged
}) {

  useEffect(() => {
    if (mintCooldown) {
      const timer = setTimeout(() => {
        setMintCooldown(false);
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [mintCooldown, setMintCooldown]);

  const mintButtonText = () => {
    if (minting) {
      return 'Minting...';
    } else if (mintCooldown) {
      return 'Mint cooldown...';
    } else {
      return 'Mint';
    }
  }

  return <Card style={{ width: '18rem' }}>
    <Card.Img variant="top" src={image} />
    <Card.Body>
      <Card.Title>{name}</Card.Title>
      <Card.Text>
        { description }
        <br />
        <strong>TokenId:</strong> #{id}
        <br />
        <strong>Owned:</strong> {balance}
      </Card.Text>
      {
        mintable &&
          <Button onClick={() => handleMint(id)} disabled={mintCooldown || minting} >
            <span className="me-1">
              { mintButtonText() }
            </span>
            { (minting || mintCooldown) && <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            }
          </Button>
      }
      {
        canBeForged &&
          <Button onClick={() => handleForge(id)}>
            <span className="me-1">
              { forging ? 'Forging...' : 'Forge' }
            </span>
            { forging && <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            }
          </Button>
      }
    </Card.Body>
  </Card>;
}

export default Token;
