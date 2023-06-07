import Web3 from "web3";
import EnvConfig from "../configs/env";

export function getWeb3Instance() {
  if (window.ethereum) {
    return new Web3(window.ethereum);
  }

  return new Web3(new Web3.providers.HttpProvider(EnvConfig.RPC_ENDPOINT));
}

export function getTokenContract(tokenAddress) {
  const web3 = getWeb3Instance();
  return new web3.eth.Contract(EnvConfig.TOKEN_ABI, tokenAddress);
}

export function getExchangeContract() {
  const web3 = getWeb3Instance();
  return new web3.eth.Contract(EnvConfig.EXCHANGE_CONTRACT_ABI, EnvConfig.EXCHANGE_CONTRACT_ADDRESS);
}
