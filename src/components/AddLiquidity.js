import { useState } from 'react';
import { Button, message } from "antd";
import { MYSTAddress, SYTAddress, ROUTERADDRESS } from "../utils/utils";
import {
  useTokenContract,
  useUniswapRouterContract,
} from "../hooks/useContract";
import { erc20Abi, formatEther, parseEther } from "viem";
import { uniswapV2poolABI } from "../abis/uniswapv2pool";
import { useAccount } from "wagmi";
import { waitForTransactionReceipt } from "viem/actions";
import { useWalletClient } from "wagmi";

const AddLiquidity = () => {
  // 代币的合约
  const sytContract = useTokenContract(SYTAddress, erc20Abi);
  const mystContract = useTokenContract(MYSTAddress, erc20Abi);
  // uniswap的合约
  const routerContract = useUniswapRouterContract(
    ROUTERADDRESS,
    uniswapV2poolABI
  );
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [loading, setLoading] = useState(false);

  const allowance = async () => {
    const allowanceSyt = await sytContract.read.allowance([
      address,
      ROUTERADDRESS,
    ]);
    const allowanceMyst = await mystContract.read.allowance([
      address,
      ROUTERADDRESS,
    ]);
    return { allowanceSyt, allowanceMyst };
  };

  const approve = async (tokenContract, value) => {
    try {
      const res = await tokenContract.write.approve([ROUTERADDRESS, value]);
      return res;
    } catch (error) {
      console.log("🚀 ~ approve ~ error:", error);
      setLoading(false)
      return null;
    }
  };

  /**
   *提供流动性先检查是否授权
   * 如果没有授权 先授权 再提供
   */
  const handleAddLiquidity = async () => {
    setLoading(true);
    const { allowanceSyt, allowanceMyst } = await allowance();
    if (formatEther(allowanceSyt) === "0") {
      await approve(sytContract, parseEther("1000000"));
    } else if (formatEther(allowanceMyst) === "0") {
      await approve(mystContract, parseEther("1000000"));
    } else {
      // 提供流动性
      const tokenA = MYSTAddress;
      const tokenB = SYTAddress;
      const amountADesired = parseEther("500000");
      const amountBDesired = parseEther("500000");

      // 下面两个是考虑滑点的时候，一般0.1% 到 2%之间
      // 但这是测试环境就暂时不考虑滑点
      const amountAMin = parseEther("0");
      const amountBMin = parseEther("0");

      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes 过期
      try {
        const txHash = await routerContract.write.addLiquidity([
          tokenA,
          tokenB,
          amountADesired,
          amountBDesired,
          amountAMin,
          amountBMin,
          address,
          deadline,
        ]);
        const receipt = await waitForTransactionReceipt(walletClient, { hash: txHash });
        console.log("🚀 ~ handleAddLiquidity ~ receipt:", receipt);
        message.success("Add Liquidity Success");
        setLoading(false)
      } catch (error) {
        setLoading(false)
        console.log("🚀 ~ handleAddLiquidity ~ error:", error);
      }
    }
  };
  return (
    <Button loading={loading} type="primary" onClick={handleAddLiquidity}>
      Add Liquidity
    </Button>
  );
};

export default AddLiquidity;
