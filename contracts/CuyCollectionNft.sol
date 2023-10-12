// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";


contract CuyCollectionNft is Initializable, ERC721Upgradeable, AccessControlUpgradeable, PausableUpgradeable, OwnableUpgradeable, ERC721BurnableUpgradeable, UUPSUpgradeable {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");  
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
   
    bytes32 public root;

    event Burn(address account, uint256 id);

    function initialize() public initializer {
        __ERC721_init("Cuy Collection","CUYNFT");
        __AccessControl_init();
        __Pausable_init();
        __Ownable_init();
        __ERC721Burnable_init();
        __UUPSUpgradeable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        root = 0x2a1e36609eaef943f74318bdadae71c9de4597fd85fdb1e40c4602aa3ef8d5b6;
}

function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmPJCFQ8DHTirUcoeVK242psuSwk7xCwfJuNtpFxbWMQLz/";
    }

    function setRoot(bytes32 _root) public onlyOwner{
        root = _root;
    }

    function safeMint(
        address to,
        uint256 tokenId
    ) public whenNotPaused onlyRole(MINTER_ROLE) {
        // solo puede ser llamado por el Relayer de Open Zeppelin en Mumbai. Los ids permitidos van del 0 al 999 para este método
        require(tokenId >= 0 && 999 <= tokenId, "Estas tratando de mintear un NFT que es exclusivo para usuarios de la lista blanca");
        _safeMint(to, tokenId);
    }

    function safeMintWhiteList(
        address to,
        uint256 tokenId,
        bytes32[] calldata proofs
    ) public whenNotPaused{
        //Internamente este método valida que to y tokenId sean parte de la lista.
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(to, tokenId))));
        require(tokenId >= 1000 && 1999 <= tokenId, "Estas tratando de mintear un NFT que no es parte de la lista blanca");
        require(MerkleProof.verify(proofs, root, leaf), "No eres parte de la lista blanca");
        _safeMint(to, tokenId);
    }

    function buyBack(uint256 id) public {
        /*permite a los dueños de los ids en el rango de 1000 y 1999 (inclusivo) quemar sus NFTs a cambio de un repago de BBTKN en la red de Ethereum (Goerli). 
        Este método emite el evento Burn(address account, uint256 id) que finalmente, cross-chain, dispara mint() en el token BBTKN en la cantidad de 10,000 BBTKNs. */
        require(id >= 1000 && 1999 <= id);
        _burn(id);
        emit Burn(msg.sender, id);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // The following functions are overrides required by Solidity.
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721Upgradeable, AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
