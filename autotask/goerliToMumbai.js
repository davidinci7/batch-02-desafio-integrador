const { ethers } = require("ethers");
const {
  DefenderRelaySigner,
  DefenderRelayProvider,
} = require("@openzeppelin/defender-relay-client/lib/ethers");

exports.handler = async function (data) {
  const payload = data.request.body.events;
  // Inicializa Proveedor: en este caso es OZP
  const provider = new DefenderRelayProvider(data);

  // Se crea el signer quien será el msg.sender en los smart contracts
  const signer = new DefenderRelaySigner(data, provider, { speed: "fast" });

  // Filtrando solo eventos
  var onlyEvents = payload[0].matchReasons.filter((e) => e.type === "event");
  if (onlyEvents.length === 0) return;

  // Filtrando solo PurchaseNftWithId
  var event = onlyEvents.filter((ev) =>
    ev.signature.includes("PurchaseNftWithId")
  );
  // Mismos params que en el evento
  var { account, id } = event[0].params;

  // Ejecutar 'mint' en Mumbai del contrato CuyCollection
  var cuyCollectionAdd = "0x279E9d268Ed127DF538Ff70CC1ddA4945371Ec79";
  var tokenAbi = ["function safeMint(address to, uint256 tokenId)"];
  var tokenContract = new ethers.Contract(cuyCollectionAdd, tokenAbi, signer);
  var tx = await tokenContract.safeMint(account, id);
  var res = await tx.wait();
  return res;
};