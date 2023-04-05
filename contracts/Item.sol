// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import './Forge.sol';

contract Item is ERC1155 {
  error OnlyForgeCanPerformAction();

  Forge public immutable forge;

  constructor()
    ERC1155("ipfs://QmUSuYPXx3nxPaCJcvcNPuEMShzPpuDLGhnDmmtmJn4EJs/{id}") {
    forge = new Forge(address(this));
  }

  function uri() public view returns (string memory) {
    // All tokens have the same uri, so just picking 1 as random number here
    return super.uri(1);
  }

  function _onlyForge() internal view {
    if (msg.sender != address(forge)) {
      revert OnlyForgeCanPerformAction();
    }
  }

  function mint(uint256 _tokenId, address _receiver) external {
    _onlyForge();
    _mint(_receiver, _tokenId, 1, "");
  }

  function burn(address _holder, uint256 _tokenId, uint256 _amount) public {
    _onlyForge();
    _burn(_holder, _tokenId, _amount);
  }
}
