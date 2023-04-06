import hardhat, { ethers, web3 } from "hardhat";
import { BigNumber, Contract } from "ethers";

import { addressBook } from "blockchain-addressbook";
import { predictAddresses } from "../../utils/predictAddresses";
import { setPendingRewardsFunctionName } from "../../utils/setPendingRewardsFunctionName";
import { verifyContract } from "../../utils/verifyContract";

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

const want = web3.utils.toChecksumAddress("0xe68D05418A8d7969D9CA6761ad46F449629d928c");
const ensId = ethers.utils.formatBytes32String("cake.eth");

const vaultParams = {
  mooName: "Moo CakeV2 WOM-BUSD",
  mooSymbol: "mooCakeV2WOM-BUSD",
  delay: 21600,
};

const strategyParams = {
  want: want,
  poolId: 116,
  chef: pancake.masterchefV2,
  unirouter: pancake.router,
  strategist: process.env.STRATEGIST_ADDRESS,
  keeper: beefyfinance.keeper,
  beefyFeeRecipient: beefyfinance.beefyFeeRecipient,
  beefyFeeConfig: beefyfinance.beefyFeeConfig,
  outputToNativeRoute: [CAKE, WBNB],
  outputToLp0Route: [CAKE, BUSD, WOM],
  outputToLp1Route: [CAKE, BUSD],
  ensId,
  shouldSetPendingRewardsFunctionName: true,
  pendingRewardsFunctionName: "pendingCake", // used for rewardsAvailable(), use correct function name from masterchef
};

const contractNames = {
  vault: "BeefyVaultV6",
  strategy: "StrategyCommonChefLP",
  SyrupBar: "SyrupBar",
  CakeToken: "CakeToken",
  MasterChef: "MasterChef"
};

async function main() {
 
  await hardhat.run("compile");

  const SyrupBar = await ethers.getContractFactory(contractNames.SyrupBar);
  const CakeToken = await ethers.getContractFactory(contractNames.CakeToken);
  const MasterChef = await ethers.getContractFactory(contractNames.MasterChef);

  // const cakeToken = await CakeToken.deploy();
  // await cakeToken.deployed();

  // console.log("cakeToken Address: ", cakeToken.address)

  // const syrupBar = await SyrupBar.deploy(cakeToken.address);
  // await syrupBar.deployed();

  // console.log("syrupBar Address: ", syrupBar.address)

  // const masterConstructorArguments = [
  //   cakeToken.address,
  //   syrupBar.address,
  //   "0x1c1Dc74Be598caF26321C33a524cCce9A1B950cC",
  //   BigNumber.from("40000000000000000000"),
  //   122725
  // ];

  // const masterChef = await MasterChef.deploy(...masterConstructorArguments);
  // await masterChef.deployed();
  const [wallet] = await ethers.getSigners();
  const cakeToken = new Contract(
    "0x2C24c88f06A316A3995244d10A8D9f881962dBC6",
    CakeToken.interface,
    wallet
  );
  const tx = await cakeToken.mint("0x79f408943a39B2a7ad97211EeF6871A66eaba827", "1000000000000000000000000000")
  console.log("tx: ", tx.hash)
  
  // console.log("masterChef Address: ", masterChef.address)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });