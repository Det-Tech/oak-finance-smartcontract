import hardhat, { ethers, web3 } from "hardhat";
import { addressBook } from "blockchain-addressbook";
import { predictAddresses } from "../../utils/predictAddresses";
import { setPendingRewardsFunctionName } from "../../utils/setPendingRewardsFunctionName";
import { verifyContract } from "../../utils/verifyContract";
import { BigNumber, Contract } from "ethers";

const registerSubsidy = require("../../utils/registerSubsidy");

const {
  platforms: { pancake, beefyfinance },
  tokens: {
    CAKE: { address: CAKE },
    WBNB: { address: WBNB },
    WOM: { address: WOM },
    SD: { address: SD },
    BUSD: { address: BUSD }
  },
} = addressBook.bsc;

const shouldVerifyOnEtherscan = false;

const want = web3.utils.toChecksumAddress("0x23cEb1822689A5D3c3E1086075c3fC2cadD372b2");
const ensId = ethers.utils.formatBytes32String("cake.eth");

const vaultParams = {
  mooName: "Moo CakeV2 WOM-BUSD",
  mooSymbol: "mooCakeV2WOM-BUSD",
  delay: 21600,
};

const strategyParams = {
  want: want,
  poolId: 0,
  chef: "0x79f408943a39B2a7ad97211EeF6871A66eaba827",
  unirouter: "0x86363Df97d67d6E4F0d0a768Ae919A015c55FC3f",
  strategist: "0x1c1Dc74Be598caF26321C33a524cCce9A1B950cC",
  keeper: "0x1c1Dc74Be598caF26321C33a524cCce9A1B950cC",
  beefyFeeRecipient: "0x1c1Dc74Be598caF26321C33a524cCce9A1B950cC",
  beefyFeeConfig:"0x1c1Dc74Be598caF26321C33a524cCce9A1B950cC",

  outputToNativeRoute: ["0x2C24c88f06A316A3995244d10A8D9f881962dBC6", "0x462b8A4cb6E36312fb1Ca50FEd9EcA56727665f2"],
  outputToLp0Route: ["0x2C24c88f06A316A3995244d10A8D9f881962dBC6", "0x5c5941526EF2f7Dd3B8F5F4Ac164ac3D41A2E59D"],
  outputToLp1Route: ["0x2C24c88f06A316A3995244d10A8D9f881962dBC6", "0x65Ff2170987406fd8a303C004a95bb043471e966"],
  // outputToNativeRoute: [CAKE, WBNB],
  // outputToLp0Route: [CAKE, BUSD, WOM],
  // outputToLp1Route: [CAKE, BUSD],
  ensId,
  shouldSetPendingRewardsFunctionName: true,
  pendingRewardsFunctionName: "pendingCake", // used for rewardsAvailable(), use correct function name from masterchef
};

const contractNames = {
  vault: "BeefyVaultV6",
  strategy: "StrategyCommonChefLP",
};

async function main() {
  if (
    Object.values(vaultParams).some(v => v === undefined) ||
    Object.values(strategyParams).some(v => v === undefined) ||
    Object.values(contractNames).some(v => v === undefined)
  ) {
    console.error("one of config values undefined");
    return;
  }

  await hardhat.run("compile");

  const [wallet] = await ethers.getSigners();

  const Vault = await ethers.getContractFactory(contractNames.vault);
  const Strategy = await ethers.getContractFactory(contractNames.strategy);

  const [deployer] = await ethers.getSigners();

  console.log("Deploying:", vaultParams.mooName);

  const predictedAddresses = await predictAddresses({ creator: deployer.address });

  // deploy the vault, strategy contract...
    // const vaultConstructorArguments = [
    //   predictedAddresses.strategy,
    //   vaultParams.mooName,
    //   vaultParams.mooSymbol,
    //   vaultParams.delay,
    // ];
    // const vault = await Vault.deploy(...vaultConstructorArguments);
    // await vault.deployed();

    // console.log("Vault deployed")
    // const strategyConstructorArguments = [
    //   strategyParams.want,
    //   strategyParams.poolId,
    //   strategyParams.chef,
    //   [vault.address,
    //   strategyParams.unirouter,
    //   strategyParams.keeper,
    //   strategyParams.strategist,
    //   strategyParams.beefyFeeRecipient,
    //   strategyParams.beefyFeeConfig],
    //   strategyParams.outputToNativeRoute,
    //   strategyParams.outputToLp0Route,
    //   strategyParams.outputToLp1Route
    // ];
    // const strategy = await Strategy.deploy(...strategyConstructorArguments);
    // await strategy.deployed();

    // // add this info to PR
    // console.log();
    // console.log("Vault:", vault.address);
    // console.log("Strategy:", strategy.address);
    // console.log("Want:", strategyParams.want);
    // console.log("PoolId:", strategyParams.poolId);

    // console.log();
    // console.log("Running post deployment");
  // end the vault, strategy contract...

  const vault = new Contract(
    "0x13B1f02739Dad0A4Ffc285F566383568D68F99CE",
    Vault.interface,
    wallet
  );

  const strategy = new Contract(
    "0x4F4e3362105819E17405F85d923600AbF88e5dFE",
    Strategy.interface,
    wallet
  );

  const isPaused = await strategy.paused();
  if (isPaused) {
    await strategy.unpause();
  }

  // console.log("depositing...")
  // const tx = await vault.deposit(500);
  // console.log("deposited", tx.hash)
  // console.log("withdrawing...")
  // const tx1 = await vault.withdraw(100);
  // console.log("withdrawed", tx1.hash)
  // console.log("harvesting...")
  const tx2 = await vault.withdrawAll();
  // console.log(strategy)
  // await strategy.harvest();
  console.log("Vault shares:", await vault.totalSupply())
  console.log("Vault shares of me:", await vault.balanceOf(wallet.address))
  const balOfPoolAfterPanic = await strategy.balanceOfPool();
  const balOfWant = await strategy.balanceOfWant();
  console.log("balOfPoolAfterPanic: ", balOfPoolAfterPanic)
  console.log("balOfWant: ", balOfWant)
  const pricePerShare = await vault.getPricePerFullShare();
  console.log("pricePerShare: ", pricePerShare)
  const harvestOnDeposit = await strategy.harvestOnDeposit();
  console.log("harvestOnDeposit: ", harvestOnDeposit)

  console.log("isPaused: ", isPaused)
  console.log("end!!")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });