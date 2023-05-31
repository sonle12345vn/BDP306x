pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Reserve is Ownable {
    IERC20 public baseToken;
    IERC20 public quoteToken;

    event WithdrawFund(address indexed token, address indexed admin, address indexed fundTo, uint256 amount);

    constructor(address _baseToken, address _quoteToken) {
        baseToken = IERC20(_baseToken);
        quoteToken = IERC20(_quoteToken);
    }

    function withdrawBaseToken(address destAddress, uint256 amount) public onlyOwner {
        baseToken.transfer(destAddress, amount);
        emit WithdrawFund(address(baseToken), this.owner(), destAddress, amount);
    }

    function withdrawQuoteToken(address destAddress, uint256 amount) public onlyOwner {
        quoteToken.transfer(destAddress, amount);
        emit WithdrawFund(address(quoteToken), this.owner(), destAddress, amount);
    }
}
