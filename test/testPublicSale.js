var { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
var { expect } = require("chai");
var { ethers } = require("hardhat");
var { time } = require("@nomicfoundation/hardhat-network-helpers");

const { getRole, deploySC, deploySCNoUp, ex, pEth } = require("../utils");

const MINTER_ROLE = getRole("MINTER_ROLE");
const BURNER_ROLE = getRole("BURNER_ROLE");

// 00 horas del 30 de septiembre del 2023 GMT
var startDate = 1696032000;

describe("Testing", function () {
    async function deployTokenFixture() {
      const [owner, addr1, addr2] = await ethers.getSigners();
      const bbitesTok = await deploySC("BBitesToken");
      const usdCoin = await deploySCNoUp("USDCoin");
      const publicSale = await deploySC("PublicSale",[await bbitesTok.getAddress(),await usdCoin.getAddress()]);
  
      return { publicSale, bbitesTok, usdCoin, owner, addr1, addr2 };
    }

    it("Deberia de crear una colleccion con el nombre Cuy Collection", async function () {
        const { publicSale, bbitesTok, usdCoin, owner, addr1, addr2} = await loadFixture(deployTokenFixture);
        const precioId10 = await publicSale.getPriceForId(10);
        await bbitesTok.approve(await publicSale.getAddress(), precioId10);
        var tx = await publicSale.purchaseWithTokens(10);
        await expect(tx).to.emit(publicSale,"PurchaseNftWithId").withArgs(owner.address,10);
        //expect(await publicSale.ownerOf(10)).to.equal(owner.address);
      });

}
    
    
    
    
    
    
    
    
    
    
    );
