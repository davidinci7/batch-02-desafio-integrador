import { Contract, ethers } from "ethers";

import usdcAbi from "../artifacts/contracts/USDCoin.sol/USDCoin.json";
import bBitesAbi from "../artifacts/contracts/BBitesToken.sol/BBitesToken.json";
import publicSaleAbi from "../artifacts/contracts/PublicSale.sol/PublicSale.json";
import cuyColAbi from "../artifacts/contracts/CuyCollectionNft.sol/CuyCollectionNft.json";

// SUGERENCIA: vuelve a armar el MerkleTree en frontend
// Utiliza la libreria buffer
import buffer from "buffer";
import walletAndIds from "../wallets/walletList";
import { MerkleTree } from "merkletreejs";

const keccak256 = require("keccak256");
var merkleTree, root;
let Buffer = buffer.Buffer;

function hashToken(tokenId, account) {
  return Buffer.from(
    ethers
      .solidityPackedKeccak256(["uint256", "address"], [tokenId, account])
      .slice(2),
    "hex"
  );
}
function buildMerkleTree() {
  var elementosHasheados = walletAndIds.walletAndIds.map(({ id, address }) => {
    return hashToken(id, address);
  });
  merkleTree = new MerkleTree(elementosHasheados, ethers.keccak256, {
    sortPairs: true,
  });

  root = merkleTree.getHexRoot();
  console.log("White list", merkleTree.toString());
  console.log("root hash", root);
}

var account, provider, signer;
var usdcContract, bBitesContract, pubSContract, cuyColContract;
var usdcAddress, bBitesAdd, pubSContractAdd, cuyColAddress;

function initSCsGoerli() {
  bBitesAdd = "0x8e3191565320E3b3b287Bc878332Ab79EaF51Bd8";
  usdcAddress = "0x857Eb21541BE70f0fE9cc7d189279272472f150E";
  pubSContractAdd = "0xd691F51B61e819Db9e7fb74bc38dD67773dEEbEc";
  provider = new ethers.BrowserProvider(window.ethereum);

  bBitesContract = new Contract(bBitesAdd, bBitesAbi.abi, provider);
  usdcContract = new Contract(usdcAddress, usdcAbi.abi, provider);
  pubSContract = new Contract(pubSContractAdd, publicSaleAbi.abi, provider);
}

function initSCsMumbai() {
  provider = new ethers.BrowserProvider(window.ethereum);
  cuyColAddress = "0xEE6694c14dD07579fD1aC5cCFFc0d4b7CCE11fa9";

  cuyColContract = new Contract(cuyColAddress, cuyColAbi.abi, provider);
}

function setUpListeners() {
  // Connect to Metamask
  const connect = document.getElementById("connect");
  const walletId = document.getElementById("walletId");
  connect.addEventListener("click", async function () {
    if (window.ethereum) {
      try {
        // Solicitar acceso a la cuenta del usuario
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });

        // Verificar si se seleccionó una cuenta
        if (accounts.length > 0) {
          account = accounts[0];
          console.log("Conectado con cuenta:", account);

          // Mostrar la cuenta en la interfaz
          walletId.innerHTML = account;

          signer = await provider.getSigner(account);
        } else {
          console.log("No se ha seleccionado ninguna cuenta");
        }
      } catch (error) {
        console.error("Error al conectar Metamask:", error);
      }
    } else {
      console.log("Billetera Metamask no ha sido detectado en el navegador.");
    }
  });


  function enBttn(button, text) {
    button.disabled = false;
    button.style.opacity = 1;
    button.textContent = text;
  }

  function disBttn(button) {
    button.disabled = true;
    button.style.opacity = 0.8;
    button.textContent = "Transaccion en proceso ...";
  }

  // USDC Balance - balanceOf
  var bttn = document.getElementById("usdcUpdate");
  bttn.addEventListener("click", async function () {
    var balanceEl = document.getElementById("usdcBalance");
    try {
      const usdcBalance = await usdcContract.balanceOf(account);
      console.log("Su balance de USDC es: ", usdcBalance);
      balanceEl.innerText = ethers.formatUnits(usdcBalance, 6);
    } catch (error) {
      console.error("No se pudo obtener el balance de USDC:", error.message);
    }
  });

  // Bbites token Balance - balanceOf
  var Bbites = document.getElementById("bbitesTknUpdate");
  Bbites.addEventListener("click", async function () {
    var balanceEl = document.getElementById("bbitesTknBalance");
    try {
      const BbitesBalance = await bBitesContract.balanceOf(account);
      console.log("Su balance de BBites es: ", BbitesBalance);
      balanceEl.innerText = ethers.formatUnits(BbitesBalance, 18);
    } catch (error) {
      console.error("No se pudo obtener el balance de BBTKN:", error.message);
    }
  });


  // APPROVE BBTKN
  const approveButtonBBTkn = document.getElementById("approveButtonBBTkn");
  const approveInput = document.getElementById("approveInput").value;
  const approveError = document.getElementById("approveError");

  approveButtonBBTkn.addEventListener("click", async function () {
    try {
      if (approveInput.value == 0) {
        return (approveError.innerText = "Introduce un numero mayor que 0");
      }
      disBttn(approveButtonBBTkn);
      const tx = await bBitesContract
        .connect(signer)
        .approve(pubSContractAdd, approveInput.trim() + "000000000000000000");
      const response = await tx.wait();
      const transactionHash = response.hash;
      console.log("Tx Hash de aprobacion de BBites: ", transactionHash);
      approveError.innerText = "";
      approveInput.value = "";
    } catch (error) {
      approveError.innerText = error.reason;
      console.error("Error al hacer el BBites Token approve:", error.message);
    } finally {
      enBttn(approveButtonBBTkn, "Approve");
    }
  });

  // APPROVE USDC
  const approveButtonUSDC = document.getElementById("approveButtonUSDC");
  const approveInputUSDC = document.getElementById("approveInputUSDC").value;
  const approveErrorUSDC = document.getElementById("approveErrorUSDC");

  approveButtonUSDC.addEventListener("click", async function () {
    try {
      if (approveInputUSDC.value == 0) {
        return (approveErrorUSDC.innerText = "Introduce un numero maor que 0");
      }
      disBttn(approveButtonUSDC);
      const tx = await usdcContract
        .connect(signer)
        .approve(pubSContractAdd, approveInputUSDC.trim() + "000000");
      const response = await tx.wait();
      const transactionHash = response.hash;
      console.log("Tx Hash de aprobacion de USDC: ", transactionHash);
      approveErrorUSDC.innerHTML = "";
      approveInputUSDC.value = "";
    } catch (error) {
      approveErrorUSDC.innerText = error.reason;
      console.error("Error al hacer el USDC approve:", error.message);
    } finally {
      enBttn(approveButtonUSDC, "Approve");
    }
  });

  // purchaseWithTokens
  const purchaseButton = document.getElementById("purchaseButton");
  const purchaseInput = document.getElementById("purchaseInput");
  const purchaseError = document.getElementById("purchaseError");
  purchaseButton.addEventListener("click", async () => {
    try {
      disBttn(purchaseButton);
      const tx = await pubSContract
        .connect(signer)
        .purchaseWithTokens(purchaseInput.value);
      const response = await tx.wait();
      const transactionHash = response.hash;
      console.log("Tx Hash de compra de NFT con BBites Tokens:", transactionHash);
      purchaseInput.value = "";
      purchaseError.innerText = "";
    } catch (error) {
      purchaseError.innerText = error.reason;
      console.log(error.message);
    } finally {
      enBttn(purchaseButton, "Purchase");
    }
  });

  // purchaseWithUSDC
  const purchaseButtonUSDC = document.getElementById("purchaseButtonUSDC");
  const purchaseInputUSDC = document.getElementById("purchaseInputUSDC");
  const amountInUSDCInput = document.getElementById("amountInUSDCInput");
  const purchaseErrorUSDC = document.getElementById("purchaseErrorUSDC");
  purchaseButtonUSDC.addEventListener("click", async () => {
    try {
      disBttn(purchaseButtonUSDC);
      const tx = await pubSContract
        .connect(signer)
        .purchaseWithUSDC(
          purchaseInputUSDC.value,
          amountInUSDCInput.value + "000000"
        );
      const response = await tx.wait();
      const transactionHash = response.hash;
      console.log("Tx Hash de compra de NFT con USDC", transactionHash);
      purchaseErrorUSDC.innerText = "";
      purchaseInputUSDC.value = "";
    } catch (error) {
      purchaseErrorUSDC.innerText = error.reason;
      console.log(error.message);
    } finally {
      enBttn(purchaseButtonUSDC, "Purchase");
    }
  });

  // purchaseWithEtherAndId
  const purchaseButtonEtherId = document.getElementById(
    "purchaseButtonEtherId"
  );
  const purchaseInputEtherId = document.getElementById("purchaseInputEtherId");
  const purchaseEtherIdError = document.getElementById("purchaseEtherIdError");

  purchaseButtonEtherId.addEventListener("click", async () => {
    try {
      disBttn(purchaseButtonEtherId);
      const tx = await pubSContract
        .connect(signer)
        .purchaseWithEtherAndId(purchaseInputEtherId.value, {
          value: ethers.parseEther("0.01"),
        });
      const response = await tx.wait();
      const transactionHash = response.hash;
      console.log("Tx Hash", transactionHash);
      purchaseEtherIdError.innerText = "";
      purchaseInputEtherId.value = "";
    } catch (error) {
      purchaseEtherIdError.innerText = error.reason;
      console.log(error.message);
    } finally {
      enBttn(purchaseButtonEtherId, "Purchase");
    }
  });

  // send Ether
  const sendEtherButton = document.getElementById("sendEtherButton");
  const sendEtherError = document.getElementById("sendEtherError");
  sendEtherButton.addEventListener("click", async () => {
    try {
      disBttn(sendEtherButton);
      const tx = await pubSContract.connect(signer).depositEthForARandomNft({
        value: ethers.parseEther("0.01"),
      });
      const response = await tx.wait();
      const transactionHash = response.hash;
      console.log("Tx Hash", transactionHash);
      sendEtherError.innerText = "";
    } catch (error) {
      sendEtherError.innerText = error.reason;
      console.log(error.message);
    } finally {
      enBttn(sendEtherButton, "Purchase");
    }
  });

  // getPriceForId
  const getPriceNftByIdBttn = document.getElementById("getPriceNftByIdBttn");
  const priceNftIdInput = document.getElementById("priceNftIdInput");
  const priceNftByIdText = document.getElementById("priceNftByIdText");
  const getPriceNftError = document.getElementById("getPriceNftError");

  getPriceNftByIdBttn.addEventListener("click", async () => {
    try {
      const tx = await pubSContract
        .connect(signer)
        .getPriceForId(priceNftIdInput.value);
      const NFTvalue = tx / BigInt(1 * 10 ** 18);
      priceNftByIdText.innerText = `El precio del NFT: ${priceNftIdInput.value} es de: ${NFTvalue}.0`;
      getPriceNftError.innerText = "";
    } catch (error) {
      getPriceNftError.innerText = error.reason;
      console.log(error.message);
    }
  });

  // getProofs
  const getProofsButtonId = document.getElementById("getProofsButtonId");
  const inputIdProofId = document.getElementById("inputIdProofId");
  const inputAccountProofId = document.getElementById("inputAccountProofId");
  const showProofsTextId = document.getElementById("showProofsTextId");

  getProofsButtonId.addEventListener("click", async () => {
    const hasheandoElemento = hashToken(
      inputIdProofId.value,
      inputAccountProofId.value
    );

    const proofs = merkleTree.getHexProof(hasheandoElemento);
    console.log(proofs);
    const pertenece = merkleTree.verify(proofs, hasheandoElemento, root);
    console.log(pertenece);
    showProofsTextId.innerText = proofs;
    navigator.clipboard.writeText(JSON.stringify(proofs));
  });

  // safeMintWhiteList
  const safeMintWhiteListBttnId = document.getElementById(
    "safeMintWhiteListBttnId"
  );
  const whiteListErrorId = document.getElementById("whiteListErrorId");
  const whiteListToInputTokenId = document.getElementById(
    "whiteListToInputTokenId"
  );
  const whiteListToInputId = document.getElementById("whiteListToInputId");

  safeMintWhiteListBttnId.addEventListener("click", async () => {
    // usar ethers.hexlify porque es un array de bytes
    const proofs = document.getElementById("whiteListToInputProofsId").value;
    proofs = JSON.parse(proofs).map(ethers.hexlify);
    try {
      disBttn(safeMintWhiteListBttnId);
      const tx = await cuyColContract
        .connect(signer)
        .safeMintWhiteList(
          whiteListToInputId.value,
          whiteListToInputTokenId.value,
          proofs
        );
      const response = await tx.wait();
      const transactionHash = response.hash;
      console.log("Tx Hash ", transactionHash);
      whiteListErrorId.innerText = "";
      whiteListToInputTokenId.innerText = "";
      whiteListToInputId.innerText = "";
    } catch (error) {
      whiteListErrorId.innerText = error.reason;
      console.log(error.message);
    } finally {
      enBttn(safeMintWhiteListBttnId, "Safe Mint");
    }
  });

  // buyBack
  const buyBackBttn = document.getElementById("buyBackBttn");
  const buyBackInputId = document.getElementById("buyBackInputId");
  const buyBackErrorId = document.getElementById("buyBackErrorId");
  buyBackBttn.addEventListener("click", async () => {
    try {
      disBttn(buyBackBttn);
      const tx = await cuyColContract
        .connect(signer)
        .buyBack(buyBackInputId.value);
      const response = await tx.wait();
      const transactionHash = response.hash;
      console.log("Tx Hash buyBack", transactionHash);
      buyBackInputId.innerText = "";
      buyBackErrorId.innerText = "";
    } catch (error) {
      buyBackErrorId.innerText = error.reason;
      console.log(error.message);
    } finally {
      enBttn(buyBackBttn, "Buy Back and Burn");
    }
  });
}

function setUpEventsContracts() {
  // pubSContract - "PurchaseNftWithId"
  const pubSList = document.getElementById("pubSList");
  pubSContract.on("PurchaseNftWithId", (sender, id) => {
    console.log("eventon del contrato");
    const newParagraph = document.createElement("p");
    newParagraph.textContent = `PurchaseNftWithId from: ${sender}, id: ${id} Goerli`;
    pubSList.appendChild(newParagraph);
    console.log(`PurchaseNftWithId from: ${sender}, id: ${id} Goerli`);
  });

  // bbitesCListener - "Transfer"
  var bbitesListEl = document.getElementById("bbitesTList");
  bBitesContract.on("Transfer", (from, to, amount) => {
    const newParagraph = document.createElement("p");
    newParagraph.textContent = `Transfer from: ${from}, to: ${to} amount: ${amount} Goerli`;
    bbitesListEl.appendChild(newParagraph);
    console.log(`Transfer from: ${from}, to: ${to} amount: ${amount} Goerli`);
  });

  const nftList = document.getElementById("nftList");
  // nftCListener - "Transfer"
  cuyColContract.on("Transfer", (from, to, tokenId) => {
    const newParagraph = document.createElement("p");
    newParagraph.textContent = `NFT Transfer - From: ${from}, to: ${to}  ${tokenId} Mumbai`;
    nftList.appendChild(newParagraph);
    console.log(`NFT Transfer - From: ${from}, to: ${to}  ${tokenId} Mumbai`);
  });

  const burnList = document.getElementById("burnList");
  // nftCListener - "Burn"
  cuyColContract.on("Burn", (sender, id) => {
    const newParagraph = document.createElement("p");
    newParagraph.textContent = `Burn  From: ${sender} wiht id: ${id}`;
    burnList.appendChild(newParagraph);
    console.log(`Burn  From: ${sender} wiht id: ${id}`);
  });
}

async function setUp() {
  window.ethereum.on("chainChanged", (chainId) => {
    window.location.reload();
  });

  setUpListeners();

  initSCsGoerli();

  initSCsMumbai();

  setUpListeners();

  setUpEventsContracts();

  buildMerkleTree();
}

setUp()
  .then()
  .catch((e) => console.log(e));
