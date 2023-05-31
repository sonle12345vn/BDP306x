pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "hardhat/console.sol";

contract Reserve is Ownable {
    // quoteToken should be Lion, Tiger
    IERC20 public quoteToken;

    // exchangeRate from ETH to quoteToken
    uint256 public exchangeRate;
    // exchangeRate from quoteToken to ETH
    uint256 public reverseExchangeRate;

    uint256 public exchangeScale = 10000;

    address public Eth = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    event WithdrawFund(address indexed token, address indexed admin, address indexed fundTo, uint256 amount);
    event SetChangeRate(uint256 exchangeRate, uint256 reverseExchangeRate);
    event ExchangeToQuote(address indexed user, uint256 fromAmt, uint256 toAmount);
    event ExchangeToBase(address indexed user, uint256 fromAmt, uint256 toAmount);

    constructor(address _quoteToken) {
        quoteToken = IERC20(_quoteToken);
    }

    function withdrawBaseToken(address destAddress, uint256 amount) public payable onlyOwner {
        (bool sent,) = this.owner().call{value : amount}("");
        require(sent, "Failed to send ETH");
        emit WithdrawFund(Eth, this.owner(), destAddress, amount);
    }

    function withdrawQuoteToken(address destAddress, uint256 amount) public onlyOwner {
        quoteToken.transfer(destAddress, amount);
        emit WithdrawFund(address(quoteToken), this.owner(), destAddress, amount);
    }

    // set exchange rate from 1 baseToken -> quoteToken
    // if 1 baseToken = 1 quote tokens, exchangeRate = 10000 ( 1 * ExchangeRateScale)
    // if 1 baseToken = 0.5 quote tokens, exchangeRate = 5000 ( 0.5 * ExchangeRateScale)
    // if 1 baseToken = 5 quote tokens, exchangeRate = 50000 ( 5 * ExchangeRateScale)
    function setExchangeRate(uint256 exchangeRateWScale, uint256 reverseExchangeRateWScale) public onlyOwner {
        exchangeRate = exchangeRateWScale;
        reverseExchangeRate = reverseExchangeRateWScale;
        emit SetChangeRate(exchangeRateWScale, reverseExchangeRateWScale);
    }

    function depositReserves(uint256 baseAmount, uint256 quoteAmount) public payable onlyOwner {
        require(msg.value == baseAmount, "Invalid base amount");
        //        (bool sent, ) = address(this).call{value: baseAmount}("");
        //        require(sent, "Failed to deposit base reserve");

        IERC20(quoteToken).transferFrom(msg.sender, address(this), quoteAmount);
    }

    function getExchangeRate(bool isFromBaseToQuote, uint256 amount) public view returns (uint256) {
        if (isFromBaseToQuote) {
            uint256 to = amount * exchangeRate / exchangeScale;
            if (to > IERC20(quoteToken).balanceOf(address(this))) {
                return 0;
            }

            return to;
        } else {
            console.log("Reserve amount %d", address(this).balance);
            uint256 to = amount * reverseExchangeRate / exchangeScale;
            console.log("to %d", to);
            if (to > address(this).balance) {
                return 0;
            }

            return to;
        }
    }

    function exchange(bool isFromBaseToQuote, uint256 amount) payable public {
        if (isFromBaseToQuote) {
            // transfer ETH to this smart contract
            require(msg.value == amount, "Not enough ETH");
            (bool sent,) = address(this).call{value : amount}("");
            require(sent, "Failed to send ETH");

            // transfer quote token for Exchange
            uint256 to = getExchangeRate(true, amount);
            require(to > 0, "Not enough quote token liquidity");

            IERC20(quoteToken).transfer(msg.sender, to);

            emit ExchangeToQuote(msg.sender, amount, to);
        } else {
            require(amount <= IERC20(quoteToken).balanceOf(msg.sender), "Not enough quote token");
            uint256 to = getExchangeRate(false, amount);
            require(to > 0, "Not enough base token liquidity");

            // transfer quote token to this smart contract
            IERC20(quoteToken).transferFrom(msg.sender, address(this), amount);

            console.log("msg.sender --------- %d", address(msg.sender));
            console.log("to --------- %d", to);
            console.log("balance --------- %d", address(this).balance);
            // transfer ETH for Exchange
            (bool sent,) = payable(msg.sender).call{value : to}("");
            require(sent, "Failed to send ETH");

            emit ExchangeToBase(msg.sender, amount, to);
        }
    }
}
