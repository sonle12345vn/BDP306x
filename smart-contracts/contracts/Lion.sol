pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// SPDX-License-Identifier: UNLICENSED

contract Tiger is ERC20, Ownable {
    address minter;

    event SetMinter(address _newMinter);

    modifier onlyMinter {
        require(msg.sender == minter, "only minter");
        _;
    }

    constructor() ERC20("Lion ERC20 token", "Lion"){}

    function mint(address recipient, uint256 amount) public onlyMinter {
        _mint(recipient, amount);
    }

    function setMinter(address _newMinter) public onlyOwner {
        minter = _newMinter;
        emit SetMinter(_newMinter);
    }
}
