import { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';

function Token({
  id,
  name,
  description,
  image,
  balance,
  mintable,
  mintAllowed,
  setMintAllowed,
  handleMint
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      setMintAllowed(true);
    }, 60000);
    return () => clearTimeout(timer);
  }, [setMintAllowed]);

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
      { mintable && <Button onClick={() => handleMint(id)} disabled={!mintAllowed} >Mint</Button> }
    </Card.Body>
  </Card>;
}

export default Token;
