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
  var proxyContract = await deploySC("CuyCollectionNft",[]);
  var proxyAddress = await proxyContract.getAddress();
  // utiliza printAddress
  var implAdd = await printAddress("CuyCollectionNft", proxyAddress);
  // utiliza ex
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
  await verify(impBT, "BBitesToken", []);
  // var usdc Contrato
  // deploySC;
  var usdcContract = await deploySCNoUp("USDCoin",[]);
  var usdcAdd = await usdcContract.getAddress();
  await verify(usdcAdd, "USDCoin", []);

}

async function deployPublicSale(){
  var psContract = await deploySC("PublicSale",[]);
  var psProxyAdd = await psContract.getAddress();
  var impPS = await printAddress("PublicSale", psProxyAdd);
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
