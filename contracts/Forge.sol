// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./Item.sol";

contract Forge {
  uint256 public constant MINT_COOLDOWN = 1 minutes;

  error TokenIdCannotBeMinted();
  error TokenCannotBeForged();
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

  function canForgeToken(uint256 _tokenId) public view returns (bool) {
    return (_tokenId == 3 && _hasBalanceForToken3Forging()) ||
      (_tokenId == 4 && _hasBalanceForToken4Forging()) ||
      (_tokenId == 5 && _hasBalanceForToken5Forging()) ||
      (_tokenId == 6 && _hasBalanceForToken6Forging());
  }

  function canBurnToken(uint256 _tokenId) public view returns (bool) {
    return (_tokenId > 3 && _tokenId <= 6 && item.balanceOf(msg.sender, _tokenId) > 0);
  }

  function forge(uint256 _tokenId) public
  {
    _checkCanForgeToken(_tokenId);
    _forge(_tokenId);
  }

  function mint(uint256 _tokenId) public {
    _checkTokenCanBeMinted(_tokenId);
    _checkAddressOnMintCooldown();
    lastMint[msg.sender] = block.timestamp;
    item.mint(_tokenId, msg.sender);
  }

  function burn(uint256 _tokenId) public {
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

  function _hasBalanceForToken3Forging() internal view returns (bool) {
    return item.balanceOf(msg.sender, 0) >= 1 && item.balanceOf(msg.sender, 1) >= 1;
  }

  function _hasBalanceForToken4Forging() internal view returns (bool) {
    return item.balanceOf(msg.sender, 1) >= 1 && item.balanceOf(msg.sender, 2) >= 1;
  }

  function _hasBalanceForToken5Forging() internal view returns (bool) {
    return item.balanceOf(msg.sender, 0) >= 1 && item.balanceOf(msg.sender, 2) >= 1;
  }

  function _hasBalanceForToken6Forging() internal view returns (bool) {
    return item.balanceOf(msg.sender, 0) >= 1 &&
      item.balanceOf(msg.sender, 1) >= 1 && item.balanceOf(msg.sender, 2) >= 1;
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

  function _checkCanForgeToken(uint256 _tokenId) internal view {
    if (!canForgeToken(_tokenId)) {
      revert TokenCannotBeForged();
    }
  }

  function _forge(uint256 _tokenId) internal {
    if (_tokenId == 3) {
      _mintOneBurnTwo(_tokenId, 0, 1);
    } else if (_tokenId == 4) {
      _mintOneBurnTwo(_tokenId, 1, 2);
    } else if (_tokenId == 5) {
      _mintOneBurnTwo(_tokenId, 0, 2);
    } else {
      _mintOneBurnThree(_tokenId, 0, 1, 2);
    }
  }

  function _mintOneBurnTwo(uint256 _mintedTokenId, uint256 _burnedTokenId1, uint256 _burnedTokenId2) internal {
    item.mint(_mintedTokenId, msg.sender);
    item.burn(msg.sender, _burnedTokenId1, 1);
    item.burn(msg.sender, _burnedTokenId2, 1);
  }

  function _mintOneBurnThree(
    uint256 _mintedTokenId,
    uint256 _burnedTokenId1,
    uint256 _burnedTokenId2,
    uint256 _burnedTokenId3
  ) internal {
    item.mint(_mintedTokenId, msg.sender);
    item.burn(msg.sender, _burnedTokenId1, 1);
    item.burn(msg.sender, _burnedTokenId2, 1);
    item.burn(msg.sender, _burnedTokenId3, 1);
  }
}
