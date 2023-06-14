import {getExchangeContract, getTokenContract, getWeb3Instance} from "./web3Service";

export function getAllowance(srcTokenAddress, address, spender) {
    if (isTOMO(srcTokenAddress)) {
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

export function buildTransferTx(token, toAddress, amount) {
    const tokenContract = getTokenContract(token);
    return tokenContract.methods.transfer(toAddress, amount);
}

export async function getTokenBalance(token, address) {
    if (isTOMO(token)) {
        const web3 = getWeb3Instance();
        return web3.eth.getBalance(address)
    }

    const tokenContract = getTokenContract(token)

    return new Promise((resolve, reject) => {
        tokenContract.methods.balanceOf(address).call().then((result) => {
            resolve(result)
        }, (error) => {
            reject(error);
        })
    })
}

export function isTOMO(token) {
    return token === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
}
