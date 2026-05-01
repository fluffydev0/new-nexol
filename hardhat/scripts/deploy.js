const hre = require("hardhat");

async function main() {
  const network = hre.network.name;
  console.log(`\n🚀 Deploying NexolPayVault to ${network}...\n`);

  // USDC addresses on Base
  const USDC = {
    baseSepolia: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    baseMainnet: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    hardhat: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // placeholder for local
  };

  const usdcAddress = USDC[network];
  if (!usdcAddress) {
    throw new Error(`No USDC address for network: ${network}`);
  }

  const NexolPayVault = await hre.ethers.getContractFactory("NexolPayVault");
  const vault = await NexolPayVault.deploy(usdcAddress);
  await vault.waitForDeployment();

  const address = await vault.getAddress();
  console.log(`✅ NexolPayVault deployed to: ${address}`);
  console.log(`   USDC asset:               ${usdcAddress}`);

  // Log APY constants
  const apy6 = await vault.APY_6_MONTH();
  const apy12 = await vault.APY_12_MONTH();
  console.log(`\n📊 APY Constants:`);
  console.log(`   6-month lock: ${Number(apy6) / 100}%`);
  console.log(`   12-month lock: ${Number(apy12) / 100}%`);

  // Preview yield for $100 USDC (6 decimals)
  const amount = 100_000_000n; // $100 USDC
  const yield6 = await vault.calculateYield(amount, 0);
  const yield12 = await vault.calculateYield(amount, 1);
  console.log(`\n💰 Yield Preview ($100 USDC):`);
  console.log(`   6-month: $${(Number(yield6) / 1e6).toFixed(4)} USDC`);
  console.log(`   12-month: $${(Number(yield12) / 1e6).toFixed(4)} USDC`);
  console.log("");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
