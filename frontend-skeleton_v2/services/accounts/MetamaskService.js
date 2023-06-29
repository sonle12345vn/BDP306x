export default class MetamaskService {
    constructor(web3) {
        this.web3 = web3;
    }

    sendTransaction(txObject) {
        return this.web3.eth.sendTransaction(txObject).then((result) => {
            return Promise.resolve(result.status)
        })
    }

    estimateGas(txObject) {
        return this.web3.eth.estimateGas(txObject).then((result) => {
            return Promise.resolve(result)
        })
    }
}
