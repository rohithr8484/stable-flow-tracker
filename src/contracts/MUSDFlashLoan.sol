// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IFlashBorrower {
    function onFlashLoan(address token, uint256 amount, uint256 fee, bytes calldata data) external;
}

contract MUSDFlashLoan is ReentrancyGuard {

    using SafeMath for uint256;

    IERC20 public musd;
    IComplianceOracle public oracle;

    uint256 public flashFee = 9; // 0.09% = 9 basis points

    event FlashLoan(address indexed borrower, uint256 amount, uint256 fee);

    constructor(address _oracle, address _musd) {
        oracle = IComplianceOracle(_oracle);
        musd = IERC20(_musd);
    }

    function flashLoan(uint256 amount, bytes calldata data) external nonReentrant {
        require(!oracle.isSanctioned(msg.sender), "Sanctioned");

        uint256 fee = amount.mul(flashFee).div(10000);
        uint256 balanceBefore = musd.balanceOf(address(this));

        require(musd.transfer(msg.sender, amount), "Transfer failed");

        IFlashBorrower(msg.sender).onFlashLoan(address(musd), amount, fee, data);

        uint256 balanceAfter = musd.balanceOf(address(this));
        require(balanceAfter >= balanceBefore.add(fee), "Not repaid");

        emit FlashLoan(msg.sender, amount, fee);
    }
}
