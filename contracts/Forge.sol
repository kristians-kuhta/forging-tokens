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

  function forgeThree(uint256 _tokenId1, uint256 _tokenId2, uint256 _tokenId3) public
  {
    _checkThreeTokensCanBeForged(_tokenId1, _tokenId2, _tokenId3);
    _forgeThree(_tokenId1, _tokenId2, _tokenId3);
  }

  function mint(uint256 _tokenId) public {
    _checkTokenCanBeMinted(_tokenId);
    _checkAddressOnMintCooldown();
    lastMint[msg.sender] = block.timestamp;
    item.mint(_tokenId, msg.sender);
  }

  function burnOne(uint256 _tokenId) public {
    _checkTokenCanBeBurned(_tokenId);
    item.burn(msg.sender, _tokenId, 1);
  }

  function mintCooldown() public view returns (bool) {
    return _addressOnMintCooldown(msg.sender);
  }
  //
  //  Internal functions
  //

  function _addressOnMintCooldown(address _account) internal view returns (bool) {
    return lastMint[_account] != 0 && lastMint[_account] > block.timestamp - MINT_COOLDOWN;
  }

  function _checkTokenCanBeMinted(uint256 _tokenId) internal pure {
    if (_tokenId > 2) {
      revert TokenIdCannotBeMinted();
    }
  }

  function _checkTokenCanBeBurned(uint256 _tokenId) internal pure {
    if (_tokenId < 4 || _tokenId > 6) {
      revert TokenCannotBeBurned();
    }
  }

  function _checkAddressOnMintCooldown() internal view {
    if (_addressOnMintCooldown(msg.sender)) {
      revert AddressOnMintCooldown((lastMint[msg.sender] + MINT_COOLDOWN) - block.timestamp);
    }
  }

  function _checkTwoTokensCanBeForged(uint256 _tokenId1, uint256 _tokenId2) internal pure {
    if (_twoTokensCanBeForged(_tokenId1, _tokenId2)) {
      revert TokensCannotBeForged();
    }
  }

  function _checkThreeTokensCanBeForged(uint256 _tokenId1, uint256 _tokenId2, uint256 _tokenId3) internal pure {
    if (_threeTokensCanBeForged(_tokenId1, _tokenId2, _tokenId3)) {
      revert TokensCannotBeForged();
    }
  }

  function _twoTokensCanBeForged(uint256 _tokenId1, uint256 _tokenId2) internal pure returns(bool) {
    return (_tokenId1 == 0 && _tokenId2 == 1) ||
      (_tokenId1 == 1 && _tokenId2 == 2) ||
      (_tokenId1 == 0 && _tokenId2 == 2);
  }

  function _threeTokensCanBeForged(uint256 _tokenId1, uint256 _tokenId2, uint256 _tokenId3) internal pure returns(bool) {
    return _tokenId1 == 0 && _tokenId2 == 1 && _tokenId3 == 2;
  }

  function _mintedTokenIdFromTwo(uint256 _tokenId1, uint256 _tokenId2) internal pure returns(uint256) {
    if (_tokenId1 == 0 && _tokenId2 == 1) {
      return 3;
    } else if (_tokenId1 == 1 && _tokenId2 == 2) {
      return 4;
    } else if (_tokenId1 == 0 && _tokenId2 == 2) {
      return 5;
    }

    return 777; // Default case, never going to happen
  }

  function _forgeTwo(uint256 _tokenId1, uint256 _tokenId2) internal {
    uint256 mintedTokenId = _mintedTokenIdFromTwo(_tokenId1, _tokenId2);
    item.mint(mintedTokenId, msg.sender);

    item.burn(msg.sender, _tokenId1, 1);
    item.burn(msg.sender, _tokenId2, 1);
  }

  function _forgeThree(uint256 _tokenId1, uint256 _tokenId2, uint256 _tokenId3) internal {
    item.mint(6, msg.sender);

    item.burn(msg.sender, _tokenId1, 1);
    item.burn(msg.sender, _tokenId2, 1);
    item.burn(msg.sender, _tokenId3, 1);
  }
}
