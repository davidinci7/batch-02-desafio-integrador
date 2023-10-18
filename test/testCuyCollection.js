var { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
var { expect } = require("chai");
var { ethers, network } = require("hardhat");
var {helpers} = require("@nomicfoundation/hardhat-network-helpers");
var {whitelistWallets} = require("../wallets/walletList");

describe("Testing de CuyCollectionNFT", function () {
    async function deployTokenFixture() {
      const [owner, addr1, addr2] = await ethers.getSigners();
      const cuyCollectionFac = await hre.ethers.getContractFactory("CuyCollectionNft");
      const cuyCollection = await hre.upgrades.deployProxy(cuyCollectionFac, {
        kind: "uups",
      });

    const cuyNft0 = await cuyCollection.safeMint(owner,0);
  
      return { cuyCollection, cuyNft0, owner, addr1, addr2 };
    }
  
    it("Deberia de crear una colleccion con el nombre Cuy Collection", async function () {
      const { cuyCollection} = await loadFixture(deployTokenFixture);
  
      expect(await cuyCollection.name()).to.equal("Cuy Collection");
    });
  
    it("Deberia de asignarle el simbolo CUYNFT", 
    async function () {
      const { cuyCollection} = await loadFixture(deployTokenFixture);
  
      expect(await cuyCollection.symbol()).to.equal("CUYNFT");
    });

    it("Deberia de retornar el tokenURI correcto", 
    async function () {
      const { cuyCollection, cuyNft0 } = await loadFixture(deployTokenFixture);
  
      expect(await cuyCollection.tokenURI(0)).to.equal("ipfs://QmPJCFQ8DHTirUcoeVK242psuSwk7xCwfJuNtpFxbWMQLz/0");
    });

    it("Deberia de hacer mint de manera correcta", 
    async function () {
      const { cuyCollection, addr1 } = await loadFixture(deployTokenFixture);
  
      await cuyCollection.safeMint(addr1,10);
      await cuyCollection.safeMint(addr1,20);
      await cuyCollection.safeMint(addr1,30);
      await cuyCollection.safeMint(addr1,40);
      await cuyCollection.safeMint(addr1,50);
      expect(await cuyCollection.balanceOf(addr1.address)).to.equal(5);
    });

    it("Deberia de darle approve a otra address", 
    async function () {
      const { cuyCollection, cuyNft0, addr1 } = await loadFixture(deployTokenFixture);
      
      await cuyCollection.approve(addr1.address,0)
      expect(await cuyCollection.getApproved(0)).to.equal(addr1.address);
      
    });

   it("Deberia de retornar el balanceOf correcto", 
    async function () {
      const { cuyCollection, cuyNft0, owner} = await loadFixture(deployTokenFixture);
  
      expect(await cuyCollection.balanceOf(owner)).to.equal(1);
    });

    it("Deberia de ejecutar el burn de manera correcta", 
    async function () {
      const { cuyCollection, cuyNft0, owner } = await loadFixture(deployTokenFixture);
  
      await cuyCollection.burn(0);
      expect(await cuyCollection.balanceOf(owner)).to.equal(0);
    });

    it("Deberia de retornar el address que ha sido aprobado para un NFT en especifico", 
    async function () {
      const { cuyCollection, cuyNft0, addr1 } = await loadFixture(deployTokenFixture);
  
      await cuyCollection.approve(addr1.address,0);
      expect(await cuyCollection.getApproved(0)).to.equal(addr1.address);
    });

    it("Deberia de retornar true si ha recibido aprobacion de todos los NFTs de un usuario", 
    async function () {
      const { cuyCollection, cuyNft0, owner, addr1 } = await loadFixture(deployTokenFixture);
  
      await cuyCollection.safeMint(owner,1);
      await cuyCollection.safeMint(owner,2);
      await cuyCollection.setApprovalForAll(addr1.address, true);
      expect(await cuyCollection.isApprovedForAll(owner, addr1.address)).to.equal(true);
    });

    it("Deberia de regresar el propietario correcto del NFT especifico", 
    async function () {
      const { cuyCollection, addr1 } = await loadFixture(deployTokenFixture);
        
      await cuyCollection.safeMint(addr1,100);
      expect(await cuyCollection.ownerOf(100)).to.equal(addr1.address);
    });

    it("Deberia de transferir el NFT de un address a otro", 
    async function () {
      const { cuyCollection, cuyNft0, owner, addr1 } = await loadFixture(deployTokenFixture);
  
      await cuyCollection.safeTransferFrom(owner, addr1.address, 0);
      expect(await cuyCollection.ownerOf(0)).to.equal(addr1.address);
    });

    it("Deberia de aprobar todos los NFTs pertenecientes a un address", 
    async function () {
      const { cuyCollection, owner, addr1 } = await loadFixture(deployTokenFixture);
  
      await cuyCollection.safeMint(owner,1);
      await cuyCollection.safeMint(owner,2);
      await cuyCollection.safeMint(owner,3);
      await cuyCollection.safeMint(owner,4);
      await cuyCollection.safeMint(owner,5);
      await cuyCollection.setApprovalForAll(addr1.address, true);
      expect(await cuyCollection.isApprovedForAll(owner, addr1.address)).to.equal(true);
    });

    
  });

  describe("Testing de funciones para participantes del whiteList", () => {
    async function deployTokenFixture() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const cuyCollectionFac = await hre.ethers.getContractFactory("CuyCollectionNft");
        const cuyCollection = await hre.upgrades.deployProxy(cuyCollectionFac, {
          kind: "uups",
        });
        return { cuyCollection, owner, addr1, addr2 };
      }
    var walletSigners;
    before(async () => {
      // 1 ether en hexadecimal
      var ONE_ETHER = `0x${ethers.parseEther("1").toString(16)}`;

      // Crea un array de billeteras con balance
      var getWalletsPromises = whitelistWallets
        .slice(0, 2)
        .map(async ({ address, privateKey }) => {
          await network.provider.send("hardhat_setBalance", [
            address,
            ONE_ETHER,
          ]);
          return new ethers.Wallet(privateKey, ethers.provider);
        });

      // Esperar a que terminen los requests
      walletSigners = await Promise.all(getWalletsPromises);
    });

    it("Deberia de mintear los NFTs a las billeteras del whiteList", async () => {
      const { cuyCollection, owner, alice } = await loadFixture(deployTokenFixture);

      for (var [i, wallet] of walletSigners.entries()) {
        // obtener pruebas
        const proofs = [[
            '0xc69e0f2d5c3527a25e7e4f8fc40c4d1468276263dfa352ebce210499a90d8c2d',
            '0x3687a62e13a8592b64a58a7bf1974e28f68cbf5b58ac9a00e286132c71579454',
            '0xa05e993355027b3037785d2f63c3363ab61b69e430d4054e364c9566dfb8d0ee',
            '0xa8e78c35b8fdaa5a0f307cd1d8b12dfa9d0fd99b528ade7bfcbf2b467e35cb6c',
            '0x7e6e241807eba959c7e886d66fbb24ed7eb9704acfa05c05c31ab7dd5c7d8325',
            '0x839e6099895ad99f1b5195b401d7b131744def11071dfe8e463f6a0ac1d918a0',
            '0x7da7c7f5098b4704e5564d19f6d65bc3f551112e46081cd0b70c8cfab4d0a9b0',
            '0x9a184d9a1744e8e9093ac5e65d7e96c1b609549a75d38c610f538aead2b04c58',
            '0x7bb0854a5a2a180c8416993d26910d3100cd9f9bc389fb8ac6449d3e37c467d7',
            '0x7f818777dfe171b443c8a7d57bd2d50e26850f9bd2640b905e5e0b82d205818c'
          ],[
            '0x66fd2afad7b9ed64c1e25285d29bba41e6a75c1e1a0b4ed3da25032b15015220',
            '0x3687a62e13a8592b64a58a7bf1974e28f68cbf5b58ac9a00e286132c71579454',
            '0xa05e993355027b3037785d2f63c3363ab61b69e430d4054e364c9566dfb8d0ee',
            '0xa8e78c35b8fdaa5a0f307cd1d8b12dfa9d0fd99b528ade7bfcbf2b467e35cb6c',
            '0x7e6e241807eba959c7e886d66fbb24ed7eb9704acfa05c05c31ab7dd5c7d8325',
            '0x839e6099895ad99f1b5195b401d7b131744def11071dfe8e463f6a0ac1d918a0',
            '0x7da7c7f5098b4704e5564d19f6d65bc3f551112e46081cd0b70c8cfab4d0a9b0',
            '0x9a184d9a1744e8e9093ac5e65d7e96c1b609549a75d38c610f538aead2b04c58',
            '0x7bb0854a5a2a180c8416993d26910d3100cd9f9bc389fb8ac6449d3e37c467d7',
            '0x7f818777dfe171b443c8a7d57bd2d50e26850f9bd2640b905e5e0b82d205818c'
          ]];

        // acuñar los nfts
        await cuyCollection.connect(wallet).safeMintWhiteList(wallet.address,1000+i,proofs[i]);

        // verificar que es dueño
        const ownerNFT =  await cuyCollection.ownerOf(1000+i);
        // expect(owner) to be equal to wallet.address
        expect(await ownerNFT).to.equal(wallet.address);
      }
    });

    it("Deberia de quemar el NFT al llamar el BuyBack", 
    async function () {
      const { cuyCollection} = await loadFixture(deployTokenFixture);

      const proofs = [
        '0xc69e0f2d5c3527a25e7e4f8fc40c4d1468276263dfa352ebce210499a90d8c2d',
        '0x3687a62e13a8592b64a58a7bf1974e28f68cbf5b58ac9a00e286132c71579454',
        '0xa05e993355027b3037785d2f63c3363ab61b69e430d4054e364c9566dfb8d0ee',
        '0xa8e78c35b8fdaa5a0f307cd1d8b12dfa9d0fd99b528ade7bfcbf2b467e35cb6c',
        '0x7e6e241807eba959c7e886d66fbb24ed7eb9704acfa05c05c31ab7dd5c7d8325',
        '0x839e6099895ad99f1b5195b401d7b131744def11071dfe8e463f6a0ac1d918a0',
        '0x7da7c7f5098b4704e5564d19f6d65bc3f551112e46081cd0b70c8cfab4d0a9b0',
        '0x9a184d9a1744e8e9093ac5e65d7e96c1b609549a75d38c610f538aead2b04c58',
        '0x7bb0854a5a2a180c8416993d26910d3100cd9f9bc389fb8ac6449d3e37c467d7',
        '0x7f818777dfe171b443c8a7d57bd2d50e26850f9bd2640b905e5e0b82d205818c'
      ];
  
      await cuyCollection.connect(walletSigners[0]).safeMintWhiteList(walletSigners[0].address,1000,proofs);
      await cuyCollection.connect(walletSigners[0]).burn(1000);
      expect(await cuyCollection.balanceOf(walletSigners[0])).to.equal(0);
    });

    it("Deberia de emitir el evento Burn al hacer el BuyBack", 
    async function () {
      const { cuyCollection} = await loadFixture(deployTokenFixture);

      const proofs = [
        '0xc69e0f2d5c3527a25e7e4f8fc40c4d1468276263dfa352ebce210499a90d8c2d',
        '0x3687a62e13a8592b64a58a7bf1974e28f68cbf5b58ac9a00e286132c71579454',
        '0xa05e993355027b3037785d2f63c3363ab61b69e430d4054e364c9566dfb8d0ee',
        '0xa8e78c35b8fdaa5a0f307cd1d8b12dfa9d0fd99b528ade7bfcbf2b467e35cb6c',
        '0x7e6e241807eba959c7e886d66fbb24ed7eb9704acfa05c05c31ab7dd5c7d8325',
        '0x839e6099895ad99f1b5195b401d7b131744def11071dfe8e463f6a0ac1d918a0',
        '0x7da7c7f5098b4704e5564d19f6d65bc3f551112e46081cd0b70c8cfab4d0a9b0',
        '0x9a184d9a1744e8e9093ac5e65d7e96c1b609549a75d38c610f538aead2b04c58',
        '0x7bb0854a5a2a180c8416993d26910d3100cd9f9bc389fb8ac6449d3e37c467d7',
        '0x7f818777dfe171b443c8a7d57bd2d50e26850f9bd2640b905e5e0b82d205818c'
      ];
  
      await cuyCollection.connect(walletSigners[0]).safeMintWhiteList(walletSigners[0].address,1000,proofs);
      expect(await cuyCollection.connect(walletSigners[0]).burn(1000)).to.emit(cuyCollection,"Burn").withArgs(walletSigners[0],1000);
    });
  });
