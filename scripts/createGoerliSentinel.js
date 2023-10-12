require("dotenv").config();

const publicSaleAbi = require("../artifacts/contracts/PublicSale.sol/PublicSale.json")
const { SentinelClient } = require('@openzeppelin/defender-sentinel-client');
const client = new SentinelClient({ apiKey: process.env.DEFENDER_API_KEY, apiSecret: process.env.DEFENDER_SECRET_KEY });

const main = async () => {
  const requestParameters = {
    type: 'BLOCK',
    network: 'goerli',
    confirmLevel: 1,
    name:'[Goerli Sentinel] Desafio Integrador',
    addresses: ['0x1aa8AD573b654E5C19Cb4570e99BD200D98683e5'], // Address del public sale
    abi: publicSaleAbi.abi,
    paused: false,
    eventConditions: [
      {
        eventSignature: "PurchaseNftWithId(address,uint256)" // Evento a escuchar
      }
    ],
    autotaskTrigger: '8a4ab4a5-02bd-43db-82a8-e664670539be' // Id del autotask
  }
  await client.create(requestParameters);
  const sentinels = await client.list();
  console.log(sentinels)
}

main()
.catch((error) => {
  console.error(error);
  process.exitCode = 1;
})