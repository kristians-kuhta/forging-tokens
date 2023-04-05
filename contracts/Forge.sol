// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./Item.sol";

contract Forge {
  uint256 public constant MINT_COOLDOWN = 1 minutes;

  error TokenIdCannotBeMinted();
  error TokensCannotBeForged();
  error AddressOnMintCooldown(uint256 remainingSeconds);
  error TokenCannotBeBurned();
  error NotOwnerOfToken();

  mapping(address => uint256) public lastMint;

  Item public immutable item;

  constructor(address _item) {
    item = Item(_item);
  }

  //
  // Public functions
  //
  function forgeTwo(uint256 _tokenId1, uint256 _tokenId2) public
  {
    _checkTwoTokensCanBeForged(_tokenId1, _tokenId2);
    _forgeTwo(_tokenId1, _tokenId2);
  }

  function forgeThree(uint256 _tokenId1, uint256 _tokenId2) public
  {
    _checkThreeTokensCanBeForged(_tokenId1, _tokenId2, _tokenId3);
    _forgeThree(_tokenId1, _tokenId2);
  }

  function mint(uint256 _tokenId) public {
    _checkTokenCanBeMinted(_tokenId);
    _checkAddressOnMintCooldown();
    item.mint(_tokendId);
  }

  function burn(uint256 _tokenId) public {
    _checkTokenCanBeBurned(_tokenId);
    item.burn();
  }

  //
  //  Internal functions
  //

  function _checkTokenCanBeMinted(uint256 _tokenId) internal {
    if (_tokenId <= 2) {
      revert TokenIdCannotBeMinted();
    }
  }

  function _checkTokenOwnership(uint256 _tokenId) internal {
    if (item.ownerOf(_tokenId) != msg.sender) {
      revert NotOwnerOfToken();
    }
  }

  function _checkTokenCanBeBurned(uint256 _tokenId) internal {
    if (_tokenId < 4 || _tokenId > 6) {
      revert TokenCannotBeBurned();
    }
  }

  function _checkAddressOnMintCooldown() internal view {
    if (lastMint[msg.sender] != 0 && lastMint[msg.sender] > block.timestamp - MINT_COOLDOWN) {
      revert AddressOnMintCooldown((lastMint[msg.sender] + MINT_COOLDOWN) - block.timestamp);
    }
  }

  function _checkTwoTokensCanBeForged(uint256 _tokenId1, uint256 _tokenId2) internal returns(bool) {
    if (_twoTokensCanBeForged(_tokenId1, _tokenId2) {
      revert TokensCannotBeForged();
    }
  }

  function _checkThreeTokensCanBeForged(uint256 _tokenId1, uint256 _tokenId2) internal returns(bool) {
    if (_threeTokensCanBeForged(_tokenId1, _tokenId2) {
      revert TokensCannotBeForged();
    }
  }

  function _twoTokensCanBeForged(uint256 _tokenId1, uint256 _tokenId2) internal returns(bool) {
    return (_tokenId1 == 0 && _tokenId2 == 1) ||
      (_tokenId1 == 1 && _tokenId2 == 2) ||
      (_tokenId1 == 0 && _tokenId2 == 2);
  }

  function _threeTokensCanBeForged(uint256 _tokenId1, uint256 _tokenId2, uint256 _tokenId3) internal returns(bool) {
    return _tokenId1 == 0 && _tokenId2 == 1 && _tokenId3 == 2;
  }

  function _mintedTokenIdFromTwo(uint256 _tokenId1, uint256 _tokenId2) internal {
    if (_tokenId1 == 0 && _tokenId2 == 1) {
      return 3;
    } else if (_tokenId1 == 1 && _tokenId2 == 2) {
      return 4;
    } else if (_tokenId1 == 0 && _tokenId2 == 2) {
      return 5;
    }
  }

  function _forgeTwo(uint256 _tokenId1, uint256 _tokenId2) internal {
    uint256 mintedTokenId = _mintedTokenIdFromTwo(_tokenId1, _tokenId2);
    token.mint(mintedTokenId, msg.sender);

    uint256[2] tokenIds = [_tokenId1, _tokenId2];
    token.burn(tokenIDs);
  }

  function _forgeThree(uint256 _tokenId1, uint256 _tokenId2, uint256 _tokenId3) internal {
    token.mint(6, msg.sender);

    uint256[2] tokenIds = [_tokenId1, _tokenId2, _tokenId3];
    token.burn(tokenIDs);
  }
}
