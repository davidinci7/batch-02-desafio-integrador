require("dotenv").config();

const { ethers } = require("hardhat");
const {
  getRole,
  verify,
  ex,
  printAddress,
  deploySC,
  deploySCNoUp,
} = require("../utils");

const { getRootFromMT } = require("../utils/merkleTree");

var MINTER_ROLE = getRole("MINTER_ROLE");
var BURNER_ROLE = getRole("BURNER_ROLE");

// Publicar NFT en Mumbai
async function comprarConUsdc() {
  const bbitesTokAdd = "0x4c3bF58EbaFbCf2f67901d4EC1C1B08CB220bbEb";
  const usdCoinAdd = "0xd10862CcBd9b2A7Ef8541bE36E9BFC3Af1EB2e89";
  // utiliza deploySC
  var publicSale = await deploySC("PublicSale",[bbitesTokAdd,usdCoinAdd]);
  var [owner] = await ethers.getSigners();

  var USDC = await ethers.getContractFactory("USDCoin");
  var usdc = USDC.attach(usdCoinAdd);

 
var txApprove = await usdc.approve(await publicSale.getAddress(),100000000000n);
await txApprove.wait();
console.log(`Este es el approve: ${txApprove.hash}`);

var tx = await publicSale.purchaseWithUSDC(20,100000000000n);
await tx.wait();
console.log(`Este es el metodo PurchaseWithUsdc: ${tx.hash}`)

var balanceUSDC = await usdc.balanceOf(owner.address);
  console.log(balanceUSDC);
}
comprarConUsdc();