// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";


/// @custom:security-contact lee.marreros@blockchainbites.co
contract BBitesToken is Initializable, ERC20Upgradeable, PausableUpgradeable, AccessControlUpgradeable, OwnableUpgradeable, UUPSUpgradeable{
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
   
    function initialize() public initializer {
        __ERC20_init("BBites Token", "BBTKN");
        __ERC20_init_unchained("BBites Token", "BBTKN");
         __Pausable_init();
        __AccessControl_init();
        __Ownable_init();
        __UUPSUpgradeable_init();
        _mint(msg.sender, 1000000 * 10 ** decimals());
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
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
        _mint(to, amount * 10 ** decimals());
    }
}
