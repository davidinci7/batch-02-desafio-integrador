// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IUniSwapV2Router02} from "./Interfaces.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract PublicSale is Initializable, PausableUpgradeable, AccessControlUpgradeable, OwnableUpgradeable, UUPSUpgradeable {
    IUniSwapV2Router02 router;
    IERC20Upgradeable bbitesToken;
    IERC20Upgradeable usdCoin;

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant EXECUTER_ROLE = keccak256("EXECUTER_ROLE");

    // 00 horas del 30 de septiembre del 2023 GMT
    uint256 constant startDate = 1696032000;

    // Maximo price NFT
    uint256 constant MAX_PRICE_NFT = 90_000 * 10 ** 18;

    mapping (uint256 => bool) comprado;

    event PurchaseNftWithId(address account, uint256 id);

    function initialize() public initializer{
        __AccessControl_init();
        __Pausable_init();
        __Ownable_init();
        __UUPSUpgradeable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        router = IUniSwapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
        bbitesToken = IERC20Upgradeable(0xbb553A8f3049baE459A15d149b20c25F3054e6a1);
        usdCoin = IERC20Upgradeable(0x57bdadeAcf684Fa3a01a89B76E7c9038e4f93296);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    function purchaseWithTokens(uint256 _id) public {
        //Verifica que el id deseado este dentro del rango correcto
        require(_id >= 0 && _id <= 699);
        //Verifica que el NFT deseado no haya sido minteado
        require(!comprado[_id], "Este NFT ya fue minteado");
        //Transferir los tokens del comprador a Public Sale segun el precio indicado por la funcion getPriceForId
        bbitesToken.transferFrom(msg.sender, address(this), getPriceForId(_id));
        comprado[_id] = true;
        emit PurchaseNftWithId(msg.sender, _id);
    }

    function purchaseWithUSDC(uint256 _id, uint256 _amountIn) external {
        //Verifica que el id deseado este dentro del rango correcto
        require(_id >= 0 && _id <= 699);
        //Verifica que el NFT deseado no haya sido minteado
        require(!comprado[_id], "Este NFT ya fue minteado");
        //Guarda el address del comprador para darle su vuelto en caso de que lo haya
        address nftBuyer = msg.sender;
        // transfiere _amountIn de USDC a este contrato
        usdCoin.transferFrom(msg.sender, address(this), _amountIn);
        // llama a swapTokensForExactTokens: valor de retorno de este metodo es cuanto gastaste del token input
        uint256 nftPrice = getPriceForId(_id);
        //Definiendo el path
        address[] memory path = new address[](2);
        path[0] = 0x57bdadeAcf684Fa3a01a89B76E7c9038e4f93296;
        path[1] = 0xbb553A8f3049baE459A15d149b20c25F3054e6a1;
        // Dandole approve al router para usar los USDC
        usdCoin.approve(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D, _amountIn);
        uint[] memory amounts = router.swapTokensForExactTokens(nftPrice,_amountIn,path,address(this),1694400924);
        // transfiere el excedente de USDC al comprador, en este caso msg.sender es Public Sale
        if (amounts[0] < _amountIn) {
            usdCoin.transfer(nftBuyer,_amountIn - amounts[0]);
        }
        comprado[_id] = true;
        emit PurchaseNftWithId(msg.sender, _id);
    }

    function purchaseWithEtherAndId(uint256 _id) public payable {
        require(_id >= 700 && _id <= 999);
        require(msg.value >= 0.01 ether);
        //Verifica que el NFT deseado no haya sido minteado
        require(!comprado[_id], "Este NFT ya fue minteado");
        uint256 rest = msg.value - 0.01 ether;
        if(rest > 0){
            payable(msg.sender).transfer(rest);
        }
        comprado[_id] = true;
        emit PurchaseNftWithId(msg.sender, _id);
    }

    function depositEthForARandomNft() public payable {
        require(msg.value == 0.01 ether, "No envio la cantidad exacta de Ether");
        uint256 id = random700To999();
        //Verifica que el NFT deseado no haya sido minteado
        require(!comprado[id], "Este NFT ya fue minteado");
        comprado[id] = true;
        emit PurchaseNftWithId(msg.sender, id);

    }

    receive() external payable {
        depositEthForARandomNft();
    }

    function withdrawEther() public onlyRole(DEFAULT_ADMIN_ROLE){
        payable(msg.sender).transfer(address(this).balance);
    }

    function withdrawTokens() public onlyRole(DEFAULT_ADMIN_ROLE){
        //Captura el address del admin que llama al metodo withdraw
        address adminCaller = msg.sender;
        uint256 balanceBBitesContract = bbitesToken.balanceOf(address(this));
        bbitesToken.transfer(adminCaller, balanceBBitesContract); 
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

    function random700To999() internal view returns (uint) {
    uint randomNumber = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, block.number))) % 299;
    randomNumber = randomNumber + 700;
    return randomNumber;
  }
}


