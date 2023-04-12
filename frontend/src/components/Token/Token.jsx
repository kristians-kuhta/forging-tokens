import React, { useEffect, useRef } from 'react';

import PropTypes from 'prop-types';

import {
  Card, Button, Spinner, InputGroup, Form,
} from 'react-bootstrap';

import addresses from '../../contracts/contract-address.json';

function Token({
  id,
  name,
  description,
  image,
  balance,
  mintable,
  mintCooldown,
  minting,
  forging,
  burning,
  trading,
  setMintCooldown,
  handleMint,
  handleForge,
  handleBurn,
  handleTrade,
  canBeForged,
  canBeBurned,
  canBeTraded,
}) {
  const toTokenId = useRef(null);

  useEffect(() => {
    if (mintCooldown) {
      const timer = setTimeout(() => {
        setMintCooldown(false);
      }, 60000);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [mintCooldown, setMintCooldown]);

  const mintButtonText = () => {
    if (minting) {
      return 'Minting...';
    } if (mintCooldown) {
      return 'Mint cooldown...';
    }
    return 'Mint';
  };

  const handleTokenTrade = (fromTokenId) => {
    handleTrade(fromTokenId, toTokenId.current.value);
  };

  const handleTokenIdInput = (event) => {
    const value = Number(event.target.value);
    if (value < 0 || value > 2 || event.target.value === '') {
      toTokenId.current.value = '0';
    }
  };

  return (
    <Card style={{ width: '18rem' }}>
      <Card.Img variant="top" src={image} />
      <Card.Body>
        <Card.Title>
          <a href={`https://testnets.opensea.io/assets/mumbai/${addresses.Item.toLowerCase()}/${id}`}>
            {name}
          </a>
        </Card.Title>
        <Card.Text>
          { description }
          <br />
          <strong>TokenId:</strong>
          {' '}
          #
          {id}
          <br />
          <strong>Owned:</strong>
          {' '}
          {balance}
        </Card.Text>
        {
        mintable
          && (
          <Button onClick={() => handleMint(id)} disabled={mintCooldown || minting}>
            <span className="me-1">
              { mintButtonText() }
            </span>
            { (minting || mintCooldown) && (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
            )}
          </Button>
          )
      }
        {
        canBeForged
          && (
          <Button onClick={() => handleForge(id)} disabled={forging}>
            <span className="me-1">
              { forging ? 'Forging...' : 'Forge' }
            </span>
            { forging && (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
            )}
          </Button>
          )
      }
        {
        canBeBurned
          && (
          <Button onClick={() => handleBurn(id)} disabled={burning}>
            <span className="me-1">
              { burning ? 'Burning...' : 'Burn' }
            </span>
            { burning && (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
            )}
          </Button>
          )
      }
        {
        canBeTraded && (
          <InputGroup className="flex-fill mt-3">
            <Form.Control
              placeholder="TokenId"
              aria-label="TokenId"
              aria-describedby="tokenId"
              ref={toTokenId}
              type="number"
              min="0"
              max="2"
              onInput={handleTokenIdInput}
            />
            <Button onClick={() => handleTokenTrade(id)} disabled={trading}>
              <span className="me-1">
                { trading ? 'Trading...' : 'Trade' }
              </span>
              { trading && (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              )}
            </Button>
          </InputGroup>
        )
      }
      </Card.Body>
    </Card>
  );
}

Token.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  balance: PropTypes.number.isRequired,
  mintable: PropTypes.bool.isRequired,
  mintCooldown: PropTypes.bool.isRequired,
  minting: PropTypes.bool.isRequired,
  forging: PropTypes.bool.isRequired,
  burning: PropTypes.bool.isRequired,
  trading: PropTypes.bool.isRequired,
  setMintCooldown: PropTypes.func.isRequired,
  handleMint: PropTypes.func.isRequired,
  handleForge: PropTypes.func.isRequired,
  handleBurn: PropTypes.func.isRequired,
  handleTrade: PropTypes.func.isRequired,
  canBeForged: PropTypes.bool.isRequired,
  canBeBurned: PropTypes.bool.isRequired,
  canBeTraded: PropTypes.bool.isRequired,
};

export default Token;
