pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Reserve.sol";

import "hardhat/console.sol";


contract Exchange is Ownable {
    mapping(address => Reserve) public tokenMapping;

    event AddReserve(address indexed token, address indexed reserve);

    event ExchangeSuccess(address indexed srcToken, address indexed dstToken, uint256 fromAmount, uint256 toAmount);

    address public Eth = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    uint256 MAX_INT = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

    constructor() {}

    function getExchangeRate(
        address srcToken,
        address dstToken,
        uint256 srcAmount
    ) public view returns (uint256) {
        if (isEth(srcToken)) {
            Reserve dst = tokenMapping[dstToken];
            uint256 ethToDst = dst.getExchangeRate(true, srcAmount);

            return ethToDst;
        } else {
            if (isEth(dstToken)) {
                Reserve src = tokenMapping[srcToken];

                uint256 srcToETH = src.getExchangeRate(false, srcAmount);
                return srcToETH;
            } else {
                Reserve src = tokenMapping[srcToken];
                Reserve dst = tokenMapping[dstToken];

                uint256 srcToETH = src.getExchangeRate(false, srcAmount);
                uint256 ethToDst = dst.getExchangeRate(true, srcToETH);

                return ethToDst;
            }
        }
    }

    function addReserve(address token, address payable reserve) public onlyOwner {
        tokenMapping[token] = Reserve(reserve);

        emit AddReserve(token, reserve);
    }

    function exchange(
        address srcToken,
        address dstToken,
        uint256 srcAmount
    ) payable public {
        // sanity checks
        uint256 amountTo = getExchangeRate(srcToken, dstToken, srcAmount);
        require(amountTo > 0, "Not enough liquidity");

        // 1.1 Exchange from ETH to ERC20 token
        if (isEth(srcToken)) {
            require(!isEth(dstToken), "Exchange from ETH to ETH is nonsense");
            // transfer ETH from user to Exchange contract
            require(msg.value == srcAmount, "Invalid input ETH");
            (bool sent,) = address(this).call{value : srcAmount}("");
            require(sent, "Failed to send ETH");

            // exchange from ETH to dst from Exchange contract
            // after this succeed, Exchange contract hold dstToken
            Reserve dst = tokenMapping[dstToken];
            dst.exchange{value: srcAmount}(true, srcAmount);

            // Transfer dstToken to user
            IERC20(dstToken).transfer(msg.sender, amountTo);

            emit ExchangeSuccess(srcToken, dstToken, srcAmount, amountTo);
        } else {
            // Transfer ERC20 to Exchange contract
            IERC20(srcToken).transferFrom(msg.sender, address(this), srcAmount);
            Reserve dst = tokenMapping[dstToken];

            // 1.2 Exchange from ERC20 token to ETH
            if (isEth(dstToken)) {
                Reserve src = tokenMapping[srcToken];
                // Exchange from ERC20 token to ETH
                src.exchange{value: 0}(false, srcAmount);

                // Transfer ETH to user
                (bool sent,) = msg.sender.call{value : amountTo}("");
                require(sent, "Failed to send ETH from Exchange to user");

                emit ExchangeSuccess(srcToken, dstToken, srcAmount, amountTo);
            } else {
                // 1.3 Exchange from ERC20 token to ERC20 token

                // exchange ERC20 to ETH
                Reserve src = tokenMapping[srcToken];
                uint256 srcToEth = src.getExchangeRate(false, srcAmount);
                src.exchange(false, srcAmount);

                uint256 ethToDst = dst.getExchangeRate(true, srcToEth);
                dst.exchange{value: srcToEth}(true, srcToEth);

                // Transfer ERC20 token to user
                IERC20(dstToken).transfer(msg.sender, ethToDst);

                emit ExchangeSuccess(srcToken, dstToken, srcAmount, amountTo);
            }
        }
    }

    function setApproveForReserve(address token, address reserve) public onlyOwner {
        IERC20(token).approve(reserve, MAX_INT);
    }

    function isEth(address token) public view returns (bool) {
        return token == Eth;
    }

    receive() payable external {}
}
