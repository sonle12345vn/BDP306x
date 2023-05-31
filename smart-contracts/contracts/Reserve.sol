pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Reserve is Ownable {
    // quoteToken should be Lion, Tiger
    IERC20 public quoteToken;

    // exchangeRate from ETH to quoteToken
    uint256 public exchangeRate;
    // exchangeRate from quoteToken to ETH
    uint256 public reverseExchangeRate;

    uint256 public exchangeScale = 10000;

    event WithdrawFund(address indexed token, address indexed admin, address indexed fundTo, uint256 amount);
    event SetChangeRate(uint256 exchangeRate, uint256 reverseExchangeRate);

    constructor(address _quoteToken) {
        quoteToken = IERC20(_quoteToken);
    }

    function withdrawBaseToken(address destAddress, uint256 amount) public payable onlyOwner {
        payable(address(this)).transfer(amount);
        emit WithdrawFund(address(0xeeeeeeeeeeeeeeeeeeeeeeee), this.owner(), destAddress, amount);
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

    function getExchangeRate(bool isFromBaseToQuote, uint256 amount) public view returns (uint256) {
        if (isFromBaseToQuote) {
            uint256 to = amount * exchangeRate / exchangeScale;
            if (to > IERC20(quoteToken).balanceOf(address(this))) {
                return 0;
            }

            return to;
        } else {
            uint256 to = amount * reverseExchangeRate / exchangeScale;
            if (to > address(this).balance) {
                return 0;
            }

            return to;
        }
    }
}
