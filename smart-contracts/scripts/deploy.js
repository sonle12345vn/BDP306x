const hre = require("hardhat");
const {ethers} = require("hardhat");

const DECIMALS = 18;
const EXCHANGE_SCALE = 10000;
const ETH_ADDR = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

const NONCE_MAP = {}

async function deployTokenAndMintReserve(deployer, tokenContractName, mintFor) {
    console.log(`deploying ${tokenContractName} with deployer ${deployer.address}`)
    // get factory
    const TokenFactory = await ethers.getContractFactory(tokenContractName);

    // deploy token
    const token = await TokenFactory.connect(deployer).deploy({
        nonce: NONCE_MAP[deployer.address]
    });
    await token.deployed();
    NONCE_MAP[deployer.address]++

    console.log(`${tokenContractName} deployed at ${token.address} . Next nonce: ${NONCE_MAP[deployer.address]}`)

    // mint 10,000 tokens for deployer
    const mintAmt = new ethers.utils.parseUnits("10000", DECIMALS);
    const addrs = [deployer.address]
    for (const m of mintFor) {
        addrs.push(m.address);
    }

    for (let i = 0; i < addrs.length; i++) {
        await token.connect(deployer).mint(addrs[i], mintAmt, {
            nonce: NONCE_MAP[deployer.address]
        });
        NONCE_MAP[deployer.address]++
    }

    console.log(`minted successfully`)

    // deploy reserve contract
    const ReserveFactory = await ethers.getContractFactory("Reserve");
    const reserve = await ReserveFactory.connect(deployer).deploy(token.address, {
        nonce: NONCE_MAP[deployer.address]
    });
    await reserve.deployed();
    NONCE_MAP[deployer.address]++

    // allow Reserve contract use ERC20
    const callers = [deployer].concat(mintFor);
    for (let i = 0; i < callers.length; i++) {
        await token.connect(callers[i]).approve(reserve.address, mintAmt, {
            nonce: NONCE_MAP[callers[i].address]
        });
        NONCE_MAP[callers[i].address]++
    }

    console.log(`depositing TOMO and ${tokenContractName}`)
    // deposit 5 TOMO and 1000 token
    const ethAmount = new ethers.utils.parseEther("5");
    const tokenAmount = new ethers.utils.parseUnits("100", DECIMALS);

    await reserve.connect(deployer).depositReserves(ethAmount, tokenAmount, {
        value: ethAmount,
        nonce: NONCE_MAP[deployer.address]
    });
    NONCE_MAP[deployer.address]++

    console.log(`deploy reserve successfully`)

    return {
        token: token, reserve: reserve
    }
}

async function deployExchange(
    deployer,
    reserves
) {
    const Factory = await ethers.getContractFactory("Exchange");
    const exchange = await Factory.connect(deployer).deploy({
        nonce: NONCE_MAP[deployer.address]
    });
    await exchange.deployed();
    NONCE_MAP[deployer.address]++

    for (let i = 0; i < reserves.length; i++) {
        await exchange.connect(deployer).addReserve(reserves[i].token, reserves[i].reserve, {
            nonce: NONCE_MAP[deployer.address]
        });
        NONCE_MAP[deployer.address]++
        console.log(`token: ${reserves[i].token}, reserve: ${reserves[i].reserve}`);
        await exchange.connect(deployer).setApproveForReserve(reserves[i].token, reserves[i].reserve, {
            nonce: deployer[deployer.address]
        });
        NONCE_MAP[deployer.address]++
    }

    return exchange
}

async function setExchangeRate(deployer, reserve, rate, reverseRate,) {
    await reserve.connect(deployer).setExchangeRate(rate, reverseRate, {
        nonce: NONCE_MAP[deployer.address]
    });

    NONCE_MAP[deployer.address]++
}

async function setupAll(admin, mintFor) {
    const tiger = await deployTokenAndMintReserve(admin, "Tiger", mintFor)
    const lion = await deployTokenAndMintReserve(admin, "Lion", mintFor)

    const exchange = await deployExchange(admin, [{
        token: tiger.token.address, reserve: tiger.reserve.address
    }, {token: lion.token.address, reserve: lion.reserve.address}])

    // set 1 ETH = 2 Tiger and 1 Tiger = 0.5 ETH
    await setExchangeRate(admin, tiger.reserve, 2 * EXCHANGE_SCALE, EXCHANGE_SCALE / 2);

    // set 1 ETH = 5 Lion and 1 Lion = 0.1 ETH
    await setExchangeRate(admin, lion.reserve, 5 * EXCHANGE_SCALE, EXCHANGE_SCALE / 10);

    const callers = [admin]
    for (let i = 0; i < mintFor.length; i++) {
        callers.push(mintFor[i])
    }
    for (const addr of callers) {
        const MAX = new ethers.utils.parseEther("1000000000");
        await tiger.token.connect(addr).approve(exchange.address, MAX, {
            nonce: NONCE_MAP[addr.address]
        });
        NONCE_MAP[addr.address]++
        await lion.token.connect(addr).approve(exchange.address, MAX, {
            nonce: NONCE_MAP[addr.address]
        });
        NONCE_MAP[addr.address]++
    }

    return {
        tiger: tiger, lion: lion, exchange: exchange
    }
}

async function main() {
    const [admin] = await ethers.getSigners();
    NONCE_MAP[admin.address] = await ethers.provider.getTransactionCount(admin.address)
    console.log(`admin: ${admin.address}`)
    const {tiger, lion, exchange} = await setupAll(admin, []);

    console.log(`------------- REPORT -------------`)
    console.log(`Tiger: ${tiger.token.address}`)
    console.log(`Lion: ${lion.token.address}`)
    console.log(`Exchange: ${exchange.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
