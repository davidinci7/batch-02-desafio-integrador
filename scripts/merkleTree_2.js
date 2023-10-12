const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const { ethers } = require("hardhat");
const walletAndIds = require("../wallets/walletList");

function hashToken(id, address) {
  return Buffer.from(
    ethers
      .solidityPackedKeccak256(["uint256", "address"], [id, address])
      .slice(2),
    "hex"
  );
}

var merkleTree, root;
function construyendoMerkleTree() {
  var elementosHasheados = walletAndIds.map(({ id, address }) => {
    return hashToken(id, address);
  });
  merkleTree = new MerkleTree(elementosHasheados, keccak256, {
    sortPairs: true,
  });

  root = merkleTree.getHexRoot();

  console.log(root);
}

var hasheandoElemento, pruebas;
function construyendoPruebas() {
  var id = 1796;
  var address = "0x2F35cD52e3429A6D65cFDbF4EAf7195D11623C8e";
  hasheandoElemento = hashToken(id, address);
  pruebas = merkleTree.getHexProof(hasheandoElemento);
  console.log(pruebas);

  // verificacion off-chain
  var pertenece = merkleTree.verify(pruebas, hasheandoElemento, root);
  console.log(pertenece);
}

async function main() {
  var merkleTreeContract = await ethers.deployContract("MerkleTree");
  await merkleTreeContract.actualizarRaiz(root);

  var perteneceLibreria = await merkleTreeContract.verify(
    hasheandoElemento,
    pruebas
  );
  console.log(`Libreria: ${perteneceLibreria}`);

  var perteneceAMano = await merkleTreeContract.verifyMerkleProof(
    hasheandoElemento,
    pruebas
  );
  console.log(`A mano: ${perteneceAMano}`);

  // Una persona en el futuro quiere hacer mint
  var id = 1796;
  var address = "0x2F35cD52e3429A6D65cFDbF4EAf7195D11623C8e";
  await merkleTreeContract.safeMint(address, id, pruebas);
}

construyendoMerkleTree();
construyendoPruebas();
//main();
