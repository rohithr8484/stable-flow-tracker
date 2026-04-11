// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BTCLiquidation is ReentrancyGuard {

    using SafeMath for uint256;

    IERC20 public btc;
    IERC20 public musd;
    IComplianceOracle public oracle;

    uint256 public liquidationThreshold = 110; // 110%
    uint256 public liquidationBonus = 5; // 5% bonus

    struct Position {
        uint256 collateral;
        uint256 debt;
    }

    mapping(address => Position) public positions;

    event PositionLiquidated(address indexed user, address liquidator, uint256 collateralSeized, uint256 debtRepaid);

    constructor(address _oracle, address _btc, address _musd) {
        oracle = IComplianceOracle(_oracle);
        btc = IERC20(_btc);
        musd = IERC20(_musd);
    }

    function isLiquidatable(address user) public view returns (bool) {
        Position memory p = positions[user];
        if (p.debt == 0) return false;
        return p.collateral.mul(100).div(p.debt) < liquidationThreshold;
    }

    function liquidate(address user, uint256 debtAmount) external nonReentrant {
        require(!oracle.isSanctioned(msg.sender), "Sanctioned");
        require(isLiquidatable(user), "Not liquidatable");

        Position storage p = positions[user];
        require(debtAmount <= p.debt, "Exceeds debt");

        uint256 collateralShare = debtAmount.mul(p.collateral).div(p.debt);
        uint256 bonus = collateralShare.mul(liquidationBonus).div(100);
        uint256 totalSeized = collateralShare.add(bonus);

        if (totalSeized > p.collateral) totalSeized = p.collateral;

        p.debt = p.debt.sub(debtAmount);
        p.collateral = p.collateral.sub(totalSeized);

        require(musd.transferFrom(msg.sender, address(this), debtAmount), "Repay failed");
        require(btc.transfer(msg.sender, totalSeized), "Transfer failed");

        emit PositionLiquidated(user, msg.sender, totalSeized, debtAmount);
    }
}
