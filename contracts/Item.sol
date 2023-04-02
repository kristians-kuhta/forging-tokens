// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract Item is ERC1155 {
  error OnlyForgeCanPerformAction();

  Forge public immutable forge;

  constructor()
    ERC1155("ipfs://QmX29AFaHREBmN5AkzD6MoPhXiJgukFh4Wsz9u8W5tQ7X1/{id}") {
    forge = new Forge();
  }


  modifier onlyForge() {
    if (msg.sender != address(forge)) {
      revert OnlyForgeCanPerformAction();
    }
  }

  function mint(uint256 _tokenId) external onlyForge {
    _mint(msg.sender, _tokenId, 1, "");
  }

  function burn(uint256 _tokenId) public onlyForge {
    _burn(_tokenId);
  }
}
