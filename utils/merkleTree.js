const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const { ethers } = require("hardhat");
const walletAndIds = require("../wallets/walletList");

var merkleTree, root;
function hashToken(tokenId, account) {
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

function getRootFromMT() {
  return "0x2a1e36609eaef943f74318bdadae71c9de4597fd85fdb1e40c4602aa3ef8d5b6";
}

module.exports = { getRootFromMT };
