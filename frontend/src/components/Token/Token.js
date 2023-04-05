import { Card, Button } from 'react-bootstrap';

function Token({id, name, description, image, balance, handleMint}) {
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
      <Button onClick={() => handleMint(id)}>Mint</Button>
    </Card.Body>
  </Card>;
}

export default Token;
