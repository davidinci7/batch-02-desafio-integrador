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
      const cuyCollection = await deploySC("CuyCollectionNft");
      const relMumbai = "0x33E0daF71aC39e5D1f176b6e2079C9fdAe4b7afE";
      const relayerSignerMumbai = await ethers.getImpersonatedSigner(relMumbai);
      await cuyCollection.grantRole(MINTER_ROLE,relMumbai);
      
      var ONE_ETHER = `0x${ethers.parseEther("1").toString(16)}`;
      await network.provider.send("hardhat_setBalance", [
        relMumbai,
        ONE_ETHER,
      ]);
      return { publicSale, cuyCollection, relayerSignerMumbai, bbitesTok, usdCoin, owner, addr1, addr2 };
    }

    it("Compra con BBitesToken y acuña NFT", async function () {
        const { publicSale, cuyCollection, relayerSignerMumbai, bbitesTok, usdCoin, owner} = await loadFixture(deployTokenFixture);
        const precioId10 = await publicSale.getPriceForId(10);
        await bbitesTok.approve(await publicSale.getAddress(), precioId10);
        var tx = await publicSale.purchaseWithTokens(10);
        await expect(tx).to.emit(publicSale,"PurchaseNftWithId").withArgs(owner.address,10);
        

        await cuyCollection.connect(relayerSignerMumbai).safeMint(await owner.getAddress(), 10);
        expect(await cuyCollection.ownerOf(10)).to.equal(owner.address);
      });

}
    
    
    
    
    
    
    
    
    
    
    );
