import { useChainId, useWalletClient } from "wagmi";
import { useMemo } from "react";
import { getContractByViem } from "../utils/contractHelper";

export function useContract(addressOrAddressMap, abi, options) {
  const currentChainId = useChainId();
  const chainId = options?.chainId || currentChainId;
  const { data: walletClient } = useWalletClient();

  return useMemo(() => {
    if (!addressOrAddressMap || !abi || !chainId) return null;
    let address = null;
    // 处理addressOrAddressMap的情况
    if (addressOrAddressMap && typeof addressOrAddressMap === "object") {
      address = addressOrAddressMap[chainId];
    } else {
      address = addressOrAddressMap;
    }

    if(!address) return null;

    try {
      return getContractByViem({abi, address, chainId, walletClient});
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [addressOrAddressMap, abi, chainId, walletClient]);
}

export const useTokenContract = (address, abi) => {
  return useContract(address, abi);
}

export const useUniswapRouterContract = (address, abi) => {
  return useContract(address, abi);
}

export const useUniswapPairContract = (address, abi) => {
  return useContract(address, abi);
}

export const useAirDropContract = (address, abi) => {
  return useContract(address, abi);
}
