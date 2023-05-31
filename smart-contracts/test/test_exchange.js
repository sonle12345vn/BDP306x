const {expect} = require("chai")
const {ethers} = require("hardhat")

describe("Exchange", function () {
    const DECIMALS = 18;

    async function deployAndMintReserve(deployer, tokenContractName) {
        // get factory
        const Factory = await ethers.getContractFactory(tokenContractName);

        // deploy token
        const token = await Factory.connect(deployer).deploy();
        await token.deployed();

        // mint 1B tokens for deployer
        const mintAmt = new ethers.utils.parseUnits("1000000000", DECIMALS);
        await token.connect(deployer).mint(deployer.address, mintAmt)
    }

    async function setupAll(admin) {
        await deployAndMintReserve(admin, "Tiger")
        await deployAndMintReserve(admin, "Lion")
    }

    it("Exchange between two ERC20 tokens", async function() {
        const [admin] = await ethers.getSigners();
        await setupAll(admin);
    })
})
