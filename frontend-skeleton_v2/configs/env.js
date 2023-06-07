const EnvConfig = {
    RPC_ENDPOINT: 'https://rpc.testnet.tomochain.com', TOKEN_ABI: [
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Approval",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "previousOwner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "newOwner",
                    "type": "address"
                }
            ],
            "name": "OwnershipTransferred",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "_newMinter",
                    "type": "address"
                }
            ],
            "name": "SetMinter",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                }
            ],
            "name": "allowance",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "decimals",
            "outputs": [
                {
                    "internalType": "uint8",
                    "name": "",
                    "type": "uint8"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "subtractedValue",
                    "type": "uint256"
                }
            ],
            "name": "decreaseAllowance",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "addedValue",
                    "type": "uint256"
                }
            ],
            "name": "increaseAllowance",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "recipient",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "mint",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "name",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "owner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "renounceOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_newMinter",
                    "type": "address"
                }
            ],
            "name": "setMinter",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "symbol",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "totalSupply",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "transfer",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "transferFrom",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "newOwner",
                    "type": "address"
                }
            ],
            "name": "transferOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ],
    EXCHANGE_CONTRACT_ABI: [{
        "inputs": [], "stateMutability": "nonpayable", "type": "constructor"
    }, {
        "anonymous": false, "inputs": [{
            "indexed": true, "internalType": "address", "name": "token", "type": "address"
        }, {
            "indexed": true, "internalType": "address", "name": "reserve", "type": "address"
        }], "name": "AddReserve", "type": "event"
    }, {
        "anonymous": false, "inputs": [{
            "indexed": true, "internalType": "address", "name": "srcToken", "type": "address"
        }, {
            "indexed": true, "internalType": "address", "name": "dstToken", "type": "address"
        }, {
            "indexed": false, "internalType": "uint256", "name": "fromAmount", "type": "uint256"
        }, {
            "indexed": false, "internalType": "uint256", "name": "toAmount", "type": "uint256"
        }], "name": "ExchangeSuccess", "type": "event"
    }, {
        "anonymous": false, "inputs": [{
            "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address"
        }, {
            "indexed": true, "internalType": "address", "name": "newOwner", "type": "address"
        }], "name": "OwnershipTransferred", "type": "event"
    }, {
        "inputs": [], "name": "Eth", "outputs": [{
            "internalType": "address", "name": "", "type": "address"
        }], "stateMutability": "view", "type": "function"
    }, {
        "inputs": [{
            "internalType": "address", "name": "token", "type": "address"
        }, {
            "internalType": "address payable", "name": "reserve", "type": "address"
        }], "name": "addReserve", "outputs": [], "stateMutability": "nonpayable", "type": "function"
    }, {
        "inputs": [{
            "internalType": "address", "name": "srcToken", "type": "address"
        }, {
            "internalType": "address", "name": "dstToken", "type": "address"
        }, {
            "internalType": "uint256", "name": "srcAmount", "type": "uint256"
        }], "name": "exchange", "outputs": [], "stateMutability": "payable", "type": "function"
    }, {
        "inputs": [{
            "internalType": "address", "name": "srcToken", "type": "address"
        }, {
            "internalType": "address", "name": "dstToken", "type": "address"
        }, {
            "internalType": "uint256", "name": "srcAmount", "type": "uint256"
        }], "name": "getExchangeRate", "outputs": [{
            "internalType": "uint256", "name": "", "type": "uint256"
        }], "stateMutability": "view", "type": "function"
    }, {
        "inputs": [{
            "internalType": "address", "name": "token", "type": "address"
        }], "name": "isEth", "outputs": [{
            "internalType": "bool", "name": "", "type": "bool"
        }], "stateMutability": "view", "type": "function"
    }, {
        "inputs": [], "name": "owner", "outputs": [{
            "internalType": "address", "name": "", "type": "address"
        }], "stateMutability": "view", "type": "function"
    }, {
        "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function"
    }, {
        "inputs": [{
            "internalType": "address", "name": "token", "type": "address"
        }, {
            "internalType": "address", "name": "reserve", "type": "address"
        }], "name": "setApproveForReserve", "outputs": [], "stateMutability": "nonpayable", "type": "function"
    }, {
        "inputs": [{
            "internalType": "address", "name": "", "type": "address"
        }], "name": "tokenMapping", "outputs": [{
            "internalType": "contract Reserve", "name": "", "type": "address"
        }], "stateMutability": "view", "type": "function"
    }, {
        "inputs": [{
            "internalType": "address", "name": "newOwner", "type": "address"
        }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function"
    }, {
        "stateMutability": "payable", "type": "receive"
    }], EXCHANGE_CONTRACT_ADDRESS: '0xe64d3fe8daC38E035206f16e28fBF62cd92C076F',

    TOKENS: [{
        "name": 'TomoChain', "symbol": 'TOMO', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    }, {
        "name": 'Tiger', "symbol": 'TIGER', address: '0xD4B4B15DB1E73A0572046DdD1eDD1acF591162E1',
    }, {
        "name": 'Lion', "symbol": 'LION', address: '0xb5c4569617320146c8510A9Cf432dd2f86acf6d1',
    },],
};

export default EnvConfig;
