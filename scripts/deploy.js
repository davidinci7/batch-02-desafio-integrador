require("dotenv").config();

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
async function deployMumbai() {
  // utiliza deploySC
  var cuyCollectionContract = await deploySC("CuyCollectionNft",[]);
  var cuyColproxyAdd = await cuyCollectionContract.getAddress();
  // utiliza printAddress
  var implAdd = await printAddress("CuyCollectionNft", cuyColproxyAdd);
  // Darle Mint role al relayer
  const relMumbai = "0x33E0daF71aC39e5D1f176b6e2079C9fdAe4b7afE";
  await cuyCollectionContract.grantRole(MINTER_ROLE,relMumbai);
  // utiliza ex
  // utiliza verify

  await verify(implAdd, "CuyCollectionNft", []);
}

// Publicar UDSC, Public Sale y Bbites Token en Goerli
async function deployGoerli() {

  // var bbitesToken Contrato
  // deploySC;
  var bbitesContract = await deploySC("BBitesToken",[]);
  var bbitesProxyAdd = await bbitesContract.getAddress();
  var impBT = await printAddress("BBitesToken", bbitesProxyAdd);
  // Darle Mint role al relayer
  const relGoerli = "0x395A8DcD95e5Cb1B3D51f493dF4be3400f43c843";
  await bbitesContract.grantRole(MINTER_ROLE,relGoerli);
  await verify(impBT, "BBitesToken", []);
  // var usdc Contrato
  // deploySC;
  var usdcContract = await deploySCNoUp("USDCoin",[]);
  var usdcAdd = await usdcContract.getAddress();
  await verify(usdcAdd, "USDCoin", []);

}

async function deployPublicSale(){
  var bbitesTokAdd ="0x8e3191565320E3b3b287Bc878332Ab79EaF51Bd8";
  var usdCoinAdd = "0x857Eb21541BE70f0fE9cc7d189279272472f150E";
  var publicSale = await deploySC("PublicSale",[bbitesTokAdd,usdCoinAdd]);
  var publicSaleProxyAdd = await publicSale.getAddress();
  var impPS = await printAddress("PublicSale", publicSaleProxyAdd);
 
//Darle el approve 
 var [owner] = await ethers.getSigners();

  var USDC = await ethers.getContractFactory("USDCoin");
  var usdc = USDC.attach(usdCoinAdd);
  var txApproveUsdc = await usdc.approve(await publicSale.getAddress(),100000000000n);
  await txApproveUsdc.wait();
  console.log(`Este es el approve de USDC: ${txApproveUsdc.hash}`);

  var BBITES = await ethers.getContractFactory("BBitesToken");
  var bbites = BBITES.attach(bbitesTokAdd);
  var txApproveBbites = await bbites.approve(await publicSale.getAddress(),50000000000000000000000n);
  await txApproveBbites.wait();
  console.log(`Este es el approve de BBites: ${txApproveBbites.hash}`);


  await verify(impPS, "PublicSale", []);
}

function roles(){
  console.log(`El minter role en bytes32 es: ${MINTER_ROLE}`);
  console.log(`El burner role en bytes32 es: ${BURNER_ROLE}`);
}

//deployMumbai()
//deployGoerli()
deployPublicSale()
  //roles()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
