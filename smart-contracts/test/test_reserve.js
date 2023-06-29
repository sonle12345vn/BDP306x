const {expect} = require("chai")
const {ethers} = require("hardhat")

describe("Reserve", function () {
    const DECIMALS = 18;
    const EXCHANGE_SCALE = 10000;
    const ETH_ADDR = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

    async function deployReserve(deployer, tokenContractName) {
        // get factory
        const TokenFactory = await ethers.getContractFactory(tokenContractName);

        // deploy token
        const token = await TokenFactory.connect(deployer).deploy();
        await token.deployed();

        // mint 10,000 tokens for deployer
        const mintAmt = new ethers.utils.parseUnits("10000", DECIMALS);
        await token.connect(deployer).mint(deployer.address, mintAmt);

        // deploy reserve contract
        const ReserveFactory = await ethers.getContractFactory("Reserve");
        const reserve = await ReserveFactory.connect(deployer).deploy(token.address);
        await reserve.deployed();

        // allow Reserve contract use ERC20
        await token.connect(deployer).approve(reserve.address, mintAmt);

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

    it("Deposit reserve", async function () {
        const [admin] = await ethers.getSigners();

        // deploy and deposit 100 TIGER + 100 TOMO to reserve contract
        const {token, reserve} = await deployReserve(admin, "Tiger")
        expect(await token.balanceOf(reserve.address)).to.equal(BigInt(100 * 10 ** 18))
        expect(await ethers.provider.getBalance(reserve.address)).to.equal(BigInt(100 * 10 ** 18))
    })

    it("Withdraw reserve", async function() {
        const [admin] = await ethers.getSigners();

        // deploy and deposit 100 TIGER + 100 TOMO to reserve contract
        const {token, reserve} = await deployReserve(admin, "Tiger")

        // withdraw 50 TOMO
        await reserve.connect(admin).withdrawBaseToken(admin.address, BigInt(30 * 10 ** 18))
        // check balance after withdrawing
        expect(await ethers.provider.getBalance(reserve.address)).to.equal(BigInt(70 * 10 ** 18))

        // withdraw 50 TIGER
        const tigerBalanceBefore = BigInt(await token.balanceOf(admin.address))
        await reserve.connect(admin).withdrawQuoteToken(admin.address, BigInt(80 * 10 ** 18))
        // check balance after withdrawing
        expect(await token.balanceOf(reserve.address)).to.equal(BigInt(20 * 10 ** 18))
        expect(await token.balanceOf(admin.address)).to.equal(tigerBalanceBefore + BigInt(80 * 10 ** 18))
    })

    it("Set exchange rate", async function () {

        const [admin] = await ethers.getSigners();

        // deploy and deposit 100 TIGER + 100 TOMO to reserve contract
        const {reserve} = await deployReserve(admin, "Tiger")

        // set new exchange rate
        await reserve.connect(admin).setExchangeRate(
            3 * EXCHANGE_SCALE, // rate from 1 TOMO to 3 TIGER
            0.7 * EXCHANGE_SCALE // rate from 1 TIGER to 0.7 TOMO
        )
    })
})
