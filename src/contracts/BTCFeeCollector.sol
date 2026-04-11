// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BTCFeeCollector is ReentrancyGuard {

    using SafeMath for uint256;

    address public treasury;
    address public admin;

    uint256 public totalCollected;

    mapping(address => uint256) public feesByToken;

    event FeeCollected(address indexed token, uint256 amount);
    event FeeWithdrawn(address indexed token, uint256 amount);

    constructor(address _treasury) {
        treasury = _treasury;
        admin = msg.sender;
    }

    function collectFee(address token, uint256 amount) external nonReentrant {
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        feesByToken[token] = feesByToken[token].add(amount);
        totalCollected = totalCollected.add(amount);

        emit FeeCollected(token, amount);
    }

    function withdrawToTreasury(address token) external nonReentrant {
        require(msg.sender == admin, "Not admin");
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No fees");

        feesByToken[token] = 0;
        require(IERC20(token).transfer(treasury, balance), "Transfer failed");

        emit FeeWithdrawn(token, balance);
    }

    function updateTreasury(address _treasury) external {
        require(msg.sender == admin, "Not admin");
        treasury = _treasury;
    }
}
