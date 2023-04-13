// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./Forge.sol";

contract Item is ERC1155 {
    error OnlyForgeCanPerformAction();

    Forge public immutable forge;

    constructor()
        ERC1155("ipfs://QmUSuYPXx3nxPaCJcvcNPuEMShzPpuDLGhnDmmtmJn4EJs/{id}")
    {
        forge = new Forge(address(this));
    }

    function contractURI() external pure returns (string memory) {
        return "ipfs://QmfBi7Gf2M9wLdC41aKKcncS2ns6nVgmffNAF3sFRnubqi";
    }

    function uri(
        uint256 _tokenid
    ) public pure override returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "ipfs://QmUSuYPXx3nxPaCJcvcNPuEMShzPpuDLGhnDmmtmJn4EJs/",
                    Strings.toString(_tokenid)
                )
            );
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

    function burn(address _holder, uint256 _tokenId, uint256 _amount) external {
        _onlyForge();
        _burn(_holder, _tokenId, _amount);
    }
}
