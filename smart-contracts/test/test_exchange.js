const {expect} = require("chai")
const {ethers} = require("hardhat")

describe("Exchange", function () {
    const DECIMALS = 18;

    async function deployAndMintReserve(
        deployer,
        tokenContractName,
        mintFor
    ) {
        // get factory
        const Factory = await ethers.getContractFactory(tokenContractName);

        // deploy token
        const token = await Factory.connect(deployer).deploy();
        await token.deployed();

        // mint 1B tokens for deployer
        const mintAmt = new ethers.utils.parseUnits("1000000000", DECIMALS);
        for (const addr in [deployer.address].push(mintFor)) {
            await token.connect(deployer).mint(addr, mintAmt)
        }
    }

    async function setupAll(admin, mintFor) {
        await deployAndMintReserve(admin, "Tiger", mintFor)
        await deployAndMintReserve(admin, "Lion", mintFor)
    }

    it("Exchange between two ERC20 tokens", async function() {
        const [admin, alice, bob] = await ethers.getSigners();
        await setupAll(admin, [alice.address, bob.address]);
    })
})
