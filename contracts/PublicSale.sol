// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IUniSwapV2Router02} from "./Interfaces.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract PublicSale is PausableUpgradeable, AccessControlUpgradeable, OwnableUpgradeable {
    IUniSwapV2Router02 router;
    IERC20Upgradeable bbitesToken;

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant EXECUTER_ROLE = keccak256("EXECUTER_ROLE");

    // 00 horas del 30 de septiembre del 2023 GMT
    uint256 constant startDate = 1696032000;

    // Maximo price NFT
    uint256 constant MAX_PRICE_NFT = 90_000 * 10 ** 18;

    event PurchaseNftWithId(address account, uint256 id);

    function initialize() public initializer{
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        __Pausable_init_unchained();
        __Ownable_init_unchained();
        router = IUniSwapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
        bbitesToken = IERC20Upgradeable(0);
        
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal onlyOwner {}

    function purchaseWithTokens(uint256 _id) public {
        //Verifica que el id deseado este dentro del rango correcto
        require(_id >= 0 && _id <= 699);
        //Verifica que el NFT deseado no haya sido minteado
        //require(!cuyNFT._exists(_id));
        //Transferir los tokens del comprador a Public Sale segun el precio indicado por la funcion getPriceForId
        bbitesToken.transfer(address(this), getPriceForId(_id));
        emit PurchaseNftWithId(msg.sender, _id);
    }

    function purchaseWithUSDC(uint256 _id, uint256 _amountIn) external {
        //Verifica que el id deseado este dentro del rango correcto
        require(_id >= 0 && _id <= 699);
        //Verifica que el NFT deseado no haya sido minteado
        //require(!cuyNFT._exists(_id));
        // transfiere _amountIn de USDC a este contrato
        // llama a swapTokensForExactTokens: valor de retorno de este metodo es cuanto gastaste del token input
        // transfiere el excedente de USDC a msg.sender

        emit PurchaseNftWithId(msg.sender, _id);
    }

    function purchaseWithEtherAndId(uint256 _id) public payable {
        require(_id >= 700 && _id <= 999);
        emit PurchaseNftWithId(msg.sender, _id);
    }

    function depositEthForARandomNft() public payable {}

    receive() external payable {
        depositEthForARandomNft();
    }

    function withdrawEther() public onlyRole(DEFAULT_ADMIN_ROLE){
        payable(msg.sender).transfer(address(this).balance);
    }

    function executePermitAndPurchase() public onlyRole(EXECUTER_ROLE){
        // El owner es msg.sender, spender address(this), 100000*10*18 sufuciente value a aprobar, deadline despues de 10 mins 1694400924
        bbitesToken.permit(owner, spender, value, deadline, v, r,s);
    }

    ////////////////////////////////////////////////////////////////////////
    /////////                    Helper Methods                    /////////
    ////////////////////////////////////////////////////////////////////////

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function getPriceForId(uint256 _id) public view returns(uint256){
        require(_id >= 0 && _id <= 699);

        if(_id >= 0 && _id <= 199){
            return 1000 * 10 ** 18;
        } else if(_id >= 200 && _id <= 499){
            return (_id * 20) * 10 ** 18;
        } else{
            if(block.timestamp - startDate >= (40 * 86400)){
                return 90000 * 10 ** 18;
            } else{
                uint256 daysPassed = (block.timestamp - startDate) % 86400;
                return (10000 + daysPassed * 2000) * 10 ** 18;
            }
        }
    }
}
