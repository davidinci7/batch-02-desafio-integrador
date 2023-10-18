var { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
var { expect } = require("chai");
var { ethers } = require("hardhat");

const { deploySCNoUp } = require("../utils");


describe("Testing de USDCoin contract", function () {
    async function deployTokenFixture() {
      const [owner, addr1, addr2] = await ethers.getSigners();
  
      const usdcTokenFac = await ethers.getContractFactory("USDCoin");
      const usdcToken = await usdcTokenFac.deploy();
  
      return { usdcToken, owner, addr1, addr2 };
    }
  
    it("Deberia de asignarle toda la cantidad de tokens existente al address que hace deploy", 
    async function () {
      const { usdcToken, owner } = await loadFixture(deployTokenFixture);
  
      const ownerBalance = await usdcToken.balanceOf(owner.address);
      expect(await usdcToken.totalSupply()).to.equal(ownerBalance);
    });
  
    it("Deberia de asignar la cantidad de tokens al llamar la function mint", 
    async function () {
      const { usdcToken, addr1 } = await loadFixture(deployTokenFixture);

      await usdcToken.mint(addr1.address, 100);
      expect(await usdcToken.balanceOf(addr1.address)).to.equal(100000000);
    });

    it("Deberia de transferir los tokens de un address a otra", async function() {
        const { usdcToken, addr1, addr2 } = await loadFixture(deployTokenFixture);
    
        await usdcToken.transfer(addr1.address, 50);

        await usdcToken.connect(addr1).transfer(addr2.address, 50);
        expect(await usdcToken.balanceOf(addr2.address)).to.equal(50);
      });

    it("Deberia de regresar la cantidad de decimals del token", 
    async function () {
      const { usdcToken } = await loadFixture(deployTokenFixture);

      expect(await usdcToken.decimals()).to.equal(6);
    });
  });