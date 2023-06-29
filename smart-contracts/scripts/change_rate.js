const {ethers} = require("hardhat");

const ExchangeRateScale = 10000;

const AddressRegistry = {
    Exchange: "0xF89bd90cC58612D710E5d8dA2f03C53e4D6bF98E",
    ReserveTiger: "0xc2504cD8ca96723c248df5d696B921a3332f1d38",
    ReserveLion: "0xdf422894281A27Aa3d19B0B7D578c59Cb051ABF8",
    Tiger: "0x10F71F4b08915cc5908429e4D1C3E396a74DaE8E",
    Lion: "0x91cc800FfeCd3126cF20e1e15904235d0175b950",
    Tomo: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
}

async function setExchangeRateTiger(deployer, newRate, newReverseRate) {
    const ReserveFactory = await ethers.getContractFactory('Reserve');
    const reserve = await ReserveFactory.attach(AddressRegistry.ReserveTiger);

    await reserve.connect(deployer).setExchangeRate(
        newRate, newReverseRate
    )
}

async function main() {
    const [admin] = await ethers.getSigners();
    // 1 TOMO = 0.5 Tiger
    // 1 Tiger = 0.1 TOMO
    await setExchangeRateTiger(admin, 2 * ExchangeRateScale,  ExchangeRateScale / 2)
    // await setExchangeRateTiger(admin, 0.5 * ExchangeRateScale,  0.1 * ExchangeRateScale)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
