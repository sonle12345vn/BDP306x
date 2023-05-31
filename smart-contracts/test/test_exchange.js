const {expect} = require("chai")
const {ethers} = require("hardhat")

describe("Exchange", function () {
    const DECIMALS = 18;

    async function deployTokenAndMintReserve(deployer, tokenContractName, mintFor) {
        // get factory
        const TokenFactory = await ethers.getContractFactory(tokenContractName);

        // deploy token
        const token = await TokenFactory.connect(deployer).deploy();
        await token.deployed();

        // mint 1B tokens for deployer
        const mintAmt = new ethers.utils.parseUnits("1000000000", DECIMALS);
        const addrs = [deployer.address]
        for (const m of mintFor) {
            addrs.push(m.address);
        }

        for (let i = 0; i < addrs.length; i++) {
            await token.connect(deployer).mint(addrs[i], mintAmt);
        }

        // deploy reserve contract
        const ReserveFactory = await ethers.getContractFactory("Reserve");
        const reserve = await ReserveFactory.connect(deployer).deploy(token.address);
        await reserve.deployed();

        // allow Reserve contract use ERC20
        const callers = [deployer].concat(mintFor);
        for (let i = 0; i < callers.length; i++) {
            await token.connect(callers[i]).approve(reserve.address, mintAmt);
        }

        // deposit 100 ETH and 1000 token
        const ethAmount = new ethers.utils.parseEther("100");
        const tokenAmount = new ethers.utils.parseUnits("100", DECIMALS);
        await reserve.connect(deployer).depositReserves(ethAmount, tokenAmount, {
            value: ethAmount
        });

        return {
            token: token, reserve: reserve
        }
    }

    async function deployExchange(
        deployer,
        reserves
    ) {
        const Factory = await ethers.getContractFactory("Exchange");
        const exchange = await Factory.connect(deployer).deploy();
        await exchange.deployed();

        for (let i = 0; i < reserves.length; i++) {
            await exchange.connect(deployer).addReserve(
                reserves[i].token,
                reserves[i].reserve,
            );
        }
    }

    async function setupAll(admin, mintFor) {
        const tiger = await deployTokenAndMintReserve(admin, "Tiger", mintFor)
        console.log(`Token Tiger is deployed at ${tiger.token.address}, reserve at ${tiger.reserve.address}`);
        const lion = await deployTokenAndMintReserve(admin, "Lion", mintFor)
        console.log(`Token Lion is deployed at ${lion.token.address}, reserve at ${lion.reserve.address}`);

        await deployExchange(admin, [
            {token: tiger.token.address, reserve: tiger.reserve.address},
            {token: lion.token.address, reserve: lion.reserve.address}
        ])
    }

    it("Exchange between two ERC20 tokens", async function () {
        const [admin, alice, bob] = await ethers.getSigners();
        await setupAll(admin, [alice, bob]);
    })
})
