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
  MasterChef: "MasterChef",
  MasterChefV2: "MasterChefV2"
};

async function main() {
 
  await hardhat.run("compile");

  const [wallet] = await ethers.getSigners();

  const MasterChefV2 = await ethers.getContractFactory(contractNames.MasterChefV2);

  const masterConstructorArguments = [
    "0xd7157a56B0d730c6b881629403A8f9aFF20d408D",
    "0x2C24c88f06A316A3995244d10A8D9f881962dBC6",
    1,
    "0x1c1Dc74Be598caF26321C33a524cCce9A1B950cC"
  ];

  // masterChefV2 deploy address
  // const masterChef2 = await MasterChefV2.deploy(...masterConstructorArguments);
  // await masterChef2.deployed();

  const masterChef2 = new Contract(
    "0x79f408943a39B2a7ad97211EeF6871A66eaba827",
    MasterChefV2.interface,
    wallet
  );

  const newPoolInfo = [
    1,
    "0x23cEb1822689A5D3c3E1086075c3fC2cadD372b2",
    true,
    false
  ]

  const poolLength = await masterChef2.poolLength();
  const poolInfo = await masterChef2.poolInfo(0);
  const userInfo = await masterChef2.userInfo(0, "0x934D9adc4AB60be67e6Ee0301ac342A4C1676B79")
  console.log('poolLength: ', poolLength)
  console.log('poolInfo: ', poolInfo)
  console.log('userInfo: ', userInfo)
  // console.log("poolLength", poolLength.toString())
  // await masterChef2.add(...newPoolInfo).then((data:any)=>{
  //   console.log(data)
  //   console.log("poolLength", poolLength.toString())
  // })
  
  console.log("masterChef2 Address: ", masterChef2.address)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });