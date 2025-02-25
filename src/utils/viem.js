import { sepolia } from "viem/chains";
import { createPublicClient, http } from "viem";
import { defaultChainId } from "./wagmi";

// sepolia 是默认的
export const viemClients = (chainId = defaultChainId) => {

  const ALCHEMY_API_KEY = process.env.REACT_APP_ALCHEMY_API_KEY;
  const client = {
    [sepolia.id]: createPublicClient({
      chain: sepolia,
      transport: http(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
    }),
  };
  return client[chainId];
};
