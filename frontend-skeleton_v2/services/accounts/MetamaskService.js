export default class MetamaskService {
    constructor(web3) {
        this.web3 = web3;
    }

    sendTransaction(txObject) {
        return this.web3.eth.sendTransaction(txObject).then((result) => {
            console.log(`Metamask send tx result = ${JSON.stringify(result)}`)
            return Promise.resolve(result.status)
        })
    }
}
