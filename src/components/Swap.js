import React, { useState, useEffect } from "react";
import { Button } from "antd";
import { Input, Popover, Radio, Modal, message } from "antd";
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import tokenList from "../tokenListTest.json";

import { Pair, Route, Trade } from "@uniswap/v2-sdk";
import { CurrencyAmount, Token, ChainId, TradeType } from "@uniswap/sdk-core";
import { uniswapV2PairABI } from "../abis/UniswapV2PairABI";
import { uniswapV2poolABI } from "../abis/uniswapv2pool";

import { waitForTransactionReceipt } from "viem/actions";

import { getContractByViem } from "../utils/contractHelper";
import { useAccount, useWalletClient } from "wagmi";
import { parseUnits, erc20Abi } from "viem";
import { ROUTERADDRESS } from "../utils/utils";

function Swap() {
  const { address, isConnected } = useAccount();
  const [messageApi, contextHolder] = message.useMessage();
  const [slippage, setSlippage] = useState(2.5);
  const [tokenOneAmount, setTokenOneAmount] = useState(null);
  const [tokenTwoAmount, setTokenTwoAmount] = useState(null);
  const [tokenOne, setTokenOne] = useState(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [prices, setPrices] = useState(null);

  const [loading, setLoading] = useState(false);

  const { data: walletClient } = useWalletClient();

  function handleSlippageChange(e) {
    setSlippage(e.target.value);
  }

  function changeAmount(e) {
    setTokenOneAmount(e.target.value);
    if (e.target.value && prices) {
      setTokenTwoAmount((e.target.value * prices.ratio).toFixed(6));
    } else {
      setTokenTwoAmount(null);
    }
  }

  function switchTokens() {
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    const one = tokenOne;
    const two = tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);
    fetchPrices(two, one);
  }

  function openModal(asset) {
    setChangeToken(asset);
    setIsOpen(true);
  }

  function modifyToken(index) {
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    const selectedToken = tokenList[index];
    // 判断当前操作的是哪一个token（上面还是下面）
    const isChangingFirstToken = changeToken === 1;
    const otherToken = isChangingFirstToken ? tokenTwo : tokenOne;

    // 判断需不需要调换位置
    if (selectedToken.address === otherToken.address) {
      switchTokens();
    } else {
      isChangingFirstToken
        ? setTokenOne(selectedToken)
        : setTokenTwo(selectedToken);
      fetchPrices(
        isChangingFirstToken ? selectedToken : tokenOne,
        isChangingFirstToken ? tokenTwo : selectedToken
      );
    }
    setIsOpen(false);
  }

  const waitForReceipt = async (txhash) => {
    const receipt = await waitForTransactionReceipt(walletClient, {
      hash: txhash,
    });
    return receipt;
  };

  async function createPair(tokenOneToken, tokenTwoToken) {
    const pairAddress = Pair.getAddress(tokenOneToken, tokenTwoToken);
    const pairContract = getContractByViem({
      abi: uniswapV2PairABI,
      address: pairAddress,
      walletClient,
    });

    const reserves = await pairContract.read.getReserves();

    const [reserve0, reserve1] = reserves;
    const tokens = [tokenOneToken, tokenTwoToken];
    const [token0, token1] = tokens[0].sortsBefore(tokens[1])
      ? tokens
      : [tokens[1], tokens[0]];
    const pair = new Pair(
      CurrencyAmount.fromRawAmount(token0, reserve0.toString()),
      CurrencyAmount.fromRawAmount(token1, reserve1.toString())
    );
    return pair;
  }

  const approve = async (tokenAddress, amount) => {
    const tokenContract = getContractByViem({
      abi: erc20Abi,
      address: tokenAddress,
      walletClient,
    });
    try {
      // 先验证额度, 第一个参数是用户钱包的地址  这里第二个参数是uniswapV2Router的地址
      // 从用户钱包地址转账到uniswapV2Router的地址的额度
      const allowance = await tokenContract.read.allowance([
        address,
        ROUTERADDRESS,
      ]);
      console.log(allowance < BigInt(amount), allowance, amount);
      // 额度不足然后授权
      if (allowance < BigInt(amount)) {
        // 这里记得用另一个地址测试一下
        const tx = await tokenContract.write.approve([ROUTERADDRESS, amount]);
        await waitForReceipt(tx);
      }
    } catch (error) {
      console.log("🚀 ~ approve ~ error:", error);
      setLoading(false);
      return null;
    }
  };

  // 获取价格
  async function fetchPrices(tokenOne, tokenTwo) {
    const tokenOneToken = new Token(
      ChainId.SEPOLIA,
      tokenOne.address,
      tokenOne.decimals
    );
    const tokenTwoToken = new Token(
      ChainId.SEPOLIA,
      tokenTwo.address,
      tokenTwo.decimals
    );
    const pair = await createPair(tokenOneToken, tokenTwoToken);
    const route = new Route([pair], tokenOneToken, tokenTwoToken);
    const tokenOnePrice = route.midPrice.toSignificant(18);
    const tokenTwoPrice = route.midPrice.invert().toSignificant(18);
    const ratio = tokenOnePrice;
    setPrices({ tokenOne: tokenOnePrice, tokenTwo: tokenTwoPrice, ratio });
  }


  async function fetchDexSwap() {
    setLoading(true);
    const tokenOneToken = new Token(
      ChainId.SEPOLIA,
      tokenOne.address,
      tokenOne.decimals
    );
    const tokenTwoToken = new Token(
      ChainId.SEPOLIA,
      tokenTwo.address,
      tokenTwo.decimals
    );

    const pair = await createPair(tokenOneToken, tokenTwoToken);
    const route = new Route([pair], tokenOneToken, tokenTwoToken);
    // 输入的数量
    const amountIn = parseUnits(tokenOneAmount, tokenOne.decimals).toString();

    // 交易实体
    const trade = new Trade(
      route,
      CurrencyAmount.fromRawAmount(tokenOneToken, amountIn),
      TradeType.EXACT_INPUT
    );

    // 计算滑点
    const tokenTwoOut = (
      (Number(tokenTwoAmount) * (100 - slippage)) /
      100
    ).toString();

    const amountOutMin = parseUnits(tokenTwoOut, tokenTwo.decimals).toString();
    const path = [tokenOneToken.address, tokenTwoToken.address];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes

    await approve(tokenOne.address, amountIn);
    const routerContract = getContractByViem({
      abi: uniswapV2poolABI,
      address: ROUTERADDRESS,
      walletClient,
    });
    messageApi.destroy();
    // 发起交易
    try {
      const estimateGas =
        await routerContract.estimateGas.swapExactTokensForTokens([
          amountIn,
          amountOutMin,
          path,
          address,
          deadline,
        ]);
      const gasBuffer = (estimateGas * BigInt(105)) / BigInt(100); // 增加 5% buffer
      const txhash = await routerContract.write.swapExactTokensForTokens(
        [amountIn, amountOutMin, path, address, deadline],
        {
          gasLimit: gasBuffer,
        }
      );
      console.log("🚀 ~ fetchDexSwap ~ txhash:", txhash);

      if (txhash) {
        const re = await waitForReceipt(txhash);
        setLoading(false);
        setTokenOneAmount(null);
        setTokenTwoAmount(null);
        messageApi.open({
          type: "success",
          content: "Transaction Success",
          duration: 1.5,
        });
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Transaction Failed",
        duration: 1.5,
      });
      setLoading(false);
      console.log("🚀 ~ fetchDexSwap ~ error:", error);
    }
  }

  useEffect(() => {
    fetchPrices(tokenList[0], tokenList[1]);
  }, []);

  const settings = (
    <>
      <div>Slippage Tolerance</div>
      <div>
        <Radio.Group value={slippage} onChange={handleSlippageChange}>
          <Radio.Button value={0.5}>0.5%</Radio.Button>
          <Radio.Button value={2.5}>2.5%</Radio.Button>
          <Radio.Button value={5}>5.0%</Radio.Button>
        </Radio.Group>
      </div>
    </>
  );

  return (
    <>
      {contextHolder}
      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title="Select a token"
      >
        <div className="modalContent">
          {tokenList?.map((e, i) => {
            return (
              <div
                className="tokenChoice"
                key={i}
                onClick={() => modifyToken(i)}
              >
                <img src={e.img} alt={e.ticker} className="tokenLogo" />
                <div className="tokenChoiceNames">
                  <div className="tokenName">{e.name}</div>
                  <div className="tokenTicker">{e.ticker}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
      <div className="tradeBox">
        <div className="tradeBoxHeader">
          <h4>Swap</h4>
          <Popover
            content={settings}
            title="Settings"
            trigger="click"
            placement="bottomRight"
          >
            <SettingOutlined className="cog" />
          </Popover>
        </div>
        <div className="inputs">
          <Input
            placeholder="0"
            value={tokenOneAmount}
            onChange={changeAmount}
            disabled={!prices}
          />
          <Input placeholder="0" value={tokenTwoAmount} disabled={true} />
          <div className="switchButton" onClick={switchTokens}>
            <ArrowDownOutlined className="switchArrow" />
          </div>
          <div className="assetOne" onClick={() => openModal(1)}>
            <img src={tokenOne.img} alt="assetOneLogo" className="assetLogo" />
            {tokenOne.ticker}
            <DownOutlined />
          </div>
          <div className="assetTwo" onClick={() => openModal(2)}>
            <img src={tokenTwo.img} alt="assetOneLogo" className="assetLogo" />
            {tokenTwo.ticker}
            <DownOutlined />
          </div>
        </div>
        <div className="swapButtonContainer">
          <Button
            className="swapButton"
            onClick={fetchDexSwap}
            disabled={!tokenOneAmount || !isConnected}
            loading={loading}
          >
            Swap
          </Button>
        </div>
      </div>
    </>
  );
}

export default Swap;
