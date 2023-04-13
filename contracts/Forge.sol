// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./Item.sol";

contract Forge {
    uint256 public constant MINT_COOLDOWN = 1 minutes;

    error TokenIdCannotBeMinted();
    error TokenCannotBeBurned();
    error TokenCannotBeTraded();
    error AddressOnMintCooldown(uint256 remainingSeconds);

    mapping(address => uint256) public lastMint;

    Item public immutable item;

    constructor(address _item) {
        item = Item(_item);
    }

    //
    // Public functions
    //

    function mint(uint256 _tokenId) public {
        _checkTokenCanBeMinted(_tokenId);
        _checkAddressOnMintCooldown();
        lastMint[msg.sender] = block.timestamp;
        item.mint(_tokenId, msg.sender);
    }

    function forge(uint256 _tokenId) public {
        _forge(_tokenId);
    }

    function burn(uint256 _tokenId) public {
        _checkTokenCanBeBurned(_tokenId);
        item.burn(msg.sender, _tokenId, 1);
    }

    function trade(uint256 _fromTokenId, uint256 _toTokenId) public {
        require(_fromTokenId != _toTokenId);

        if (_fromTokenId > 2) {
            item.burn(msg.sender, _fromTokenId, 1);
        } else if (_toTokenId < 3) {
            item.burn(msg.sender, _fromTokenId, 1);
            item.mint(_toTokenId, msg.sender);
        } else {
            revert();
        }
    }

    function mintCooldown() public view returns (bool) {
        return _addressOnMintCooldown(msg.sender);
    }

    //
    //  Internal functions
    //

    function _addressOnMintCooldown(
        address _account
    ) internal view returns (bool) {
        return
            lastMint[_account] != 0 &&
            lastMint[_account] > block.timestamp - MINT_COOLDOWN;
    }

    function _checkTokenCanBeMinted(uint256 _tokenId) internal pure {
        if (_tokenId > 2) {
            revert TokenIdCannotBeMinted();
        }
    }

    function _checkTokenCanBeBurned(uint256 _tokenId) internal pure {
        if (_tokenId < 4) {
            revert TokenCannotBeBurned();
        }
    }

    function _checkAddressOnMintCooldown() internal view {
        if (_addressOnMintCooldown(msg.sender)) {
            revert AddressOnMintCooldown(
                (lastMint[msg.sender] + MINT_COOLDOWN) - block.timestamp
            );
        }
    }

    function _forge(uint256 _tokenId) internal {
        if (_tokenId == 3) {
            _mintOneBurnTwo(_tokenId, 0, 1);
        } else if (_tokenId == 4) {
            _mintOneBurnTwo(_tokenId, 1, 2);
        } else if (_tokenId == 5) {
            _mintOneBurnTwo(_tokenId, 0, 2);
        } else if (_tokenId == 6) {
            _mintOneBurnThree(_tokenId, 0, 1, 2);
        } else {
            revert();
        }
    }

    function _mintOneBurnTwo(
        uint256 _mintedTokenId,
        uint256 _burnedTokenId1,
        uint256 _burnedTokenId2
    ) internal {
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
