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
      await network.provider.send("hardhat_setBalance", [
        owner.address,
        ONE_ETHER,
      ]);
      return { publicSale, cuyCollection, relayerSignerMumbai, bbitesTok, usdCoin, owner, addr1, addr2, ONE_ETHER };
    }

    it("Compra con BBitesToken y acuña NFT (purchaseWithTokens)", async function () {
        const { publicSale, cuyCollection, relayerSignerMumbai, bbitesTok, owner} = await loadFixture(deployTokenFixture);
        const precioId10 = await publicSale.getPriceForId(10);
        await bbitesTok.approve(await publicSale.getAddress(), precioId10);
        var tx = await publicSale.purchaseWithTokens(10);
        await expect(tx).to.emit(publicSale,"PurchaseNftWithId").withArgs(owner.address,10);
        

        await cuyCollection.connect(relayerSignerMumbai).safeMint(await owner.getAddress(), 10);
        expect(await cuyCollection.ownerOf(10)).to.equal(owner.address);
      });

      //Este test debe ser ejecutado en un fork de Goerli, ya que hace uso del router de Uniswap V2
  /*  it("Compra con USDC y acuña NFT (purchaseWithUSDC)", async function () {
        const { publicSale, cuyCollection, relayerSignerMumbai, usdCoin, owner} = await loadFixture(deployTokenFixture);
        await usdCoin.approve(await publicSale.getAddress(), 50000000000);
        var tx = await publicSale.purchaseWithUSDC(10,10000000000);
        await expect(tx).to.emit(publicSale,"PurchaseNftWithId").withArgs(owner.address,10);
        
        await cuyCollection.connect(relayerSignerMumbai).safeMint(await owner.getAddress(), 10);
        expect(await cuyCollection.ownerOf(10)).to.equal(owner.address);
      }); */

    it("Compra con Ether y acuña NFT (purchaseWithEtherAndId)", async function () {
        const { publicSale, cuyCollection, relayerSignerMumbai, owner} = await loadFixture(deployTokenFixture);
        var tx = await publicSale.purchaseWithEtherAndId(700,{value:ethers.parseEther("0.01")});
        await expect(tx).to.emit(publicSale,"PurchaseNftWithId").withArgs(owner.address,700);
        

        await cuyCollection.connect(relayerSignerMumbai).safeMint(await owner.getAddress(), 700);
        expect(await cuyCollection.ownerOf(700)).to.equal(owner.address);
      });

    it("Retira el Ether depositado (withdrawEther)", async function () {
        const { publicSale, ONE_ETHER} = await loadFixture(deployTokenFixture);
        await network.provider.send("hardhat_setBalance", [
          await publicSale.getAddress(),
          ONE_ETHER,
        ]);
        await publicSale.withdrawEther();
        await expect(await ethers.provider.getBalance(await publicSale.getAddress())).to.equal(0);
      });

    it("Retira los BBites Tokens depositados (withdrawTokens)", async function () {
        const { publicSale, cuyCollection, relayerSignerMumbai, bbitesTok, owner} = await loadFixture(deployTokenFixture);
        await bbitesTok.mint(await publicSale.getAddress(),50000000000000000000000n);
        var tx = await publicSale.withdrawTokens();
        await expect(await bbitesTok.balanceOf(await publicSale.getAddress())).to.equal(0);
      });

    it("Retorna el precio de 1000 para el NFT con ID 10 (getPriceForId)", async function () {
        const { publicSale, cuyCollection, relayerSignerMumbai, bbitesTok, owner} = await loadFixture(deployTokenFixture);
        const precioId10 = await publicSale.getPriceForId(10);
        await expect(precioId10).to.equal(1000000000000000000000n);
      });

    it("Retorna el precio de 5000 para el NFT con ID 250 (getPriceForId)", async function () {
        const { publicSale, cuyCollection, relayerSignerMumbai, bbitesTok, owner} = await loadFixture(deployTokenFixture);
        const precioId10 = await publicSale.getPriceForId(250);
        await expect(precioId10).to.equal(5000000000000000000000n);
      });
});
