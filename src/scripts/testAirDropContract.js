// 测试 Airdrop 合约的脚本
require("dotenv").config();
const { AIRDROP_ADDRESS } = require("../utils/utils");
const { airdropAbis } = require("../abis/airdropAbis");
const {
  createWalletClient,
  http,
  createPublicClient,
  parseUnits,
  formatUnits,
} = require("viem");
const { sepolia } = require("viem/chains");
const { privateKeyToAccount } = require("viem/accounts");
const { getContract, erc20Abi } = require("viem");
const { waitForTransactionReceipt } = require("viem/actions");
const { MYSTAddress, SYTAddress } = require("../utils/utils");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ALCHEMY_API_KEY = process.env.REACT_APP_ALCHEMY_API_KEY;

const account = privateKeyToAccount(PRIVATE_KEY);

const walletClient = createWalletClient({
  chain: sepolia,
  account,
  transport: http(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
});
const viemClient = createPublicClient({
  chain: sepolia,
  transport: http(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
});

const airdropContract = getContract({
  abi: airdropAbis,
  address: AIRDROP_ADDRESS,
  client: {
    public: viemClient,
    wallet: walletClient,
  },
});
const mystContract = getContract({
  abi: erc20Abi,
  address: MYSTAddress,
  client: {
    public: viemClient,
    wallet: walletClient,
  },
});
const sytContract = getContract({
  abi: erc20Abi,
  address: SYTAddress,
  client: {
    public: viemClient,
    wallet: walletClient,
  },
});

const approve = async (amountMyst, amountSyt) => {
  let resMyst = null;
  let resSyt = null;
  try {
    if (!amountMyst && !amountSyt) return null;

    const allowanceMyst = await mystContract.read.allowance([
      account.address,
      AIRDROP_ADDRESS,
    ]);
    const allowanceSyt = await sytContract.read.allowance([
      account.address,
      AIRDROP_ADDRESS,
    ]);
    console.log("🚀 ~ approve ~ allowanceSyt:", allowanceSyt);
    console.log("🚀 ~ approve ~ allowanceMyst:", allowanceMyst);

    if (allowanceMyst < amountMyst) {
      resMyst = await mystContract.write.approve([AIRDROP_ADDRESS, amountMyst]);
    }
    if (allowanceSyt < amountSyt) {
      resSyt = await sytContract.write.approve([AIRDROP_ADDRESS, amountSyt]);
    }
    return [resMyst, resSyt];
  } catch (error) {
    console.log("🚀 ~ approve ~ error:", error);
    return null;
  }
};

const deposit = async () => {
  const amountMYST = parseUnits("10000", 18);
  const amountSYT = parseUnits("10000", 18);

  try {
    await approve(amountMYST, amountSYT);
    const estimateGas = await airdropContract.estimateGas.depositTokens([
      amountMYST,
      amountSYT,
    ]);
    console.log(estimateGas);
    const gasBuffer = (estimateGas * BigInt(105)) / BigInt(100); // 增加 5% buffer
    console.log("发起交易");
    const txHash = await airdropContract.write.depositTokens(
      [amountMYST, amountSYT],
      {
        gasLimit: gasBuffer,
      }
    );
    console.log("交易中....");
    const receipt = await waitForTransactionReceipt(walletClient, {
      hash: txHash,
    });
    console.log("交易成功:", receipt);
    const balanceMystAndSyt = await airdropContract.read.getTokenBalances();
    console.log("合约中存在的MystAndSyt: ", balanceMystAndSyt);
  } catch (error) {
    console.log("🚀 ~ deposit ~ error:", error);
  }
};
// 需要存的时候执行这个
// deposit();


const getTokenBalancesFunc = async () => {
  const [balanceMYST, balanceSYT] =
    await airdropContract.read.getTokenBalances();
  console.log("合约中存在的balanceMYST: ", formatUnits(balanceMYST, 18));
  console.log("合约中存在的balanceSYT: ", formatUnits(balanceSYT, 18));
};
// 查询合约中的余额
getTokenBalancesFunc();
