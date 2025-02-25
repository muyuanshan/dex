import React, { useState } from "react";
import { useAirDropContract } from "../hooks/useContract";
import { airdropAbis } from "../abis/airdropAbis";
import { AIRDROP_ADDRESS } from "../utils/utils";
import { useWalletClient } from "wagmi";

import { Card, Button, Form, Input, message } from "antd";
import { waitForTransactionReceipt } from "viem/actions";

function Faucet() {
  // 0xC907b5620838fC7E7B4B95a68745e018cF3c173c
  const airdropContract = useAirDropContract(AIRDROP_ADDRESS, airdropAbis);
  const { data: walletClient } = useWalletClient();

  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    const { address } = values;
    if (!address) return;
    try {
      const estimateGas = await airdropContract.estimateGas.claimTokens([
        address,
      ]);
      const gasBuffer = (estimateGas * BigInt(105)) / BigInt(100); // 增加 5% buffer
      const txHash = await airdropContract.write.claimTokens([address], {
        gasLimit: gasBuffer,
      });
      const receipt = await waitForTransactionReceipt(walletClient, { hash: txHash });
      setLoading(false);
      console.log("🚀 ~ onFinish ~ receipt:", receipt);
      message.success("Faucet success");
    } catch (error) {
      console.log("🚀 ~ error", error);
      message.error("Faucet failed");
      setLoading(false);
      return;
    }

    // await airdropContract.write.claimTokens(address);
  };

  return (
    <Card className="faucetBox">
      <Form
        style={{ width: "100%" }}
        name="basic"
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
      >
        <Form.Item
          label="address"
          name="address"
          rules={[
            {
              required: true,
              message: "Please input your wallet address!",
            },
          ]}
        >
          <Input
            className="formInput"
            placeholder="Please input your wallet address!"
          />
        </Form.Item>

        <Form.Item label={null}>
          <div className="swapButtonContainer">
            <Button htmlType="submit" loading={loading}>
              Faucet
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default Faucet;
