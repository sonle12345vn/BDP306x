import {getExchangeContract, getTokenContract} from "./web3Service";
import EnvConfig from "../configs/env";

export function getSwapABI(data) {
    /*TODO: Get Swap ABI*/
}

export function getTransferABI(data) {
    /*TODO: Get Transfer ABI*/
}

export function getApproveABI(srcTokenAddress, amount) {
    /*TODO: Get Approve ABI*/
}

export function getAllowance(srcTokenAddress, address, spender) {
    if (isEth(srcTokenAddress)) {
        return Promise.resolve(200000 * 10 ** 18)
    }

    const tokenContract = getTokenContract(srcTokenAddress);

    return new Promise((resolve, reject) => {
        tokenContract.methods.allowance(address, spender).call().then((result) => {
            resolve(result)
        }, (error) => {
            reject(error);
        })
    })
}

/* Get Exchange Rate from Smart Contract */
export function getExchangeRate(srcTokenAddress, destTokenAddress, srcAmount) {
    const exchangeContract = getExchangeContract();

    return new Promise((resolve, reject) => {
        exchangeContract.methods.getExchangeRate(srcTokenAddress, destTokenAddress, srcAmount).call().then((result) => {
            resolve(result)
        }, (error) => {
            reject(error);
        })
    })
}

export function buildApprovalTx(tokenAddress, spender, amount) {
    const tokenContract = getTokenContract(tokenAddress);

    return tokenContract.methods.approve(spender, amount)
}

export function buildSwapTx(srcToken, destToken, srcAmount) {
    const exchangeContract = getExchangeContract();
    return exchangeContract.methods.exchange(srcToken, destToken, srcAmount)
}

export async function getTokenBalances(tokens, address) {
    /*TODO: Get Token Balance*/
}

export function isEth(token) {
    return token === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
}
