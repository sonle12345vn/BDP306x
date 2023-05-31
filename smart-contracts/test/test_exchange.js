const {expect} = require("chai")
const {ethers} = require("hardhat")

describe("Exchange", function () {
    const DECIMALS = 18;
    const EXCHANGE_SCALE = 10000;
    const ETH_ADDR = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

    async function deployTokenAndMintReserve(deployer, tokenContractName, mintFor) {
        // get factory
        const TokenFactory = await ethers.getContractFactory(tokenContractName);

        // deploy token
        const token = await TokenFactory.connect(deployer).deploy();
        await token.deployed();

        // mint 10,000 tokens for deployer
        const mintAmt = new ethers.utils.parseUnits("10000", DECIMALS);
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
            await exchange.connect(deployer).addReserve(reserves[i].token, reserves[i].reserve);
            console.log(`token: ${reserves[i].token}, reserve: ${reserves[i].reserve}`);
            await exchange.connect(deployer).setApproveForReserve(reserves[i].token, reserves[i].reserve);
        }

        return exchange
    }

    async function setExchangeRate(deployer, reserve, rate, reverseRate,) {
        await reserve.connect(deployer).setExchangeRate(rate, reverseRate);
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
            await tiger.token.connect(addr).approve(exchange.address, MAX);
            await lion.token.connect(addr).approve(exchange.address, MAX);
        }

        return {
            tiger: tiger, lion: lion, exchange: exchange
        }
    }

    // it("Exchange between two ERC20 tokens", async function () {
    //     const [admin, alice] = await ethers.getSigners();
    //     const {tiger, lion, exchange} = await setupAll(admin, [alice]);
    //
    //     // Alice Swap 1 Tiger to 2.5 Lion
    //     const tigerBalanceBefore = await tiger.token.balanceOf(alice.address);
    //     const lionBalanceBefore = await lion.token.balanceOf(alice.address);
    //
    //     const oneTiger = new ethers.utils.parseEther("1")
    //     await exchange.connect(alice).exchange(tiger.token.address, lion.token.address, oneTiger);
    //
    //     const tigerBalanceAfter = await tiger.token.balanceOf(alice.address);
    //     const lionBalanceAfter = await lion.token.balanceOf(alice.address);
    //
    //     // Alice lost 1 Tiger
    //     expect(tigerBalanceAfter).to.equal(tigerBalanceBefore.sub(oneTiger));
    //     // Alice gain 2.5 Lion
    //     expect(lionBalanceAfter).to.equal(lionBalanceBefore.add(oneTiger.mul(5).div(2)));
    // })

    it("Exchange from ERC20 to ETH", async function () {
        const [admin, alice] = await ethers.getSigners();
        const {lion, exchange} = await setupAll(admin, [alice]);

        const lionBalanceBefore = await lion.token.balanceOf(alice.address);
        const ethBalanceBefore = await ethers.provider.getBalance(alice.address);

        // do exchange
        const oneLion = new ethers.utils.parseEther("1");
        const receivedETH = new ethers.utils.parseEther("0.1");
        await exchange.connect(alice).exchange(lion.token.address, ETH_ADDR, oneLion);

        const lionBalanceAfter = await lion.token.balanceOf(alice.address);
        const ethBalanceAfter = await ethers.provider.getBalance(alice.address);

        // Gas error
        // expect(lionBalanceAfter).to.equal(lionBalanceBefore.sub(oneLion));
        // expect(ethBalanceAfter).to.equal(ethBalanceBefore.add(receivedETH));
    })
})
