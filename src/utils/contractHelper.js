import { viemClients } from "./viem";
import { defaultChainId } from "./wagmi";
import { getContract } from "viem";

export const getContractByViem = ({
  abi,
  address,
  chainId = defaultChainId,
  walletClient,
}) => {
  const c = getContract({
    abi,
    address,
    client: {
      public: viemClients(chainId),
      wallet: walletClient,
    },
  });
  return {
    ...c,
    account: walletClient?.account,
    chain: walletClient?.chain,
  };
};
