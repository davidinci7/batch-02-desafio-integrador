// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;


import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";


/// @custom:security-contact lee.marreros@blockchainbites.co
contract BBitesToken is UUPSUpgradeable, ERC20PermitUpgradeable, OwnableUpgradeable, AccessControlUpgradeable, PausableUpgradeable{
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    

    function initialize() public initializer {
        __ERC20_init("BBites Token", "BBTKN");
        _mint(msg.sender, 1000000 * 10 ** decimals());
        __Pausable_init_unchained();
        __ERC20Permit_init("BBites Token");
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }

    function mint(address to, uint256 amount) public whenNotPaused onlyRole(MINTER_ROLE){
        /*Este método es disparado cuando desde Polygon (Mumbai) se quema un NFT cuyo id está entre 1000 y 1999 (inclusivo). 
        Se acuña 10,000 tokens al address que quemó su NFT. */
    }
}
