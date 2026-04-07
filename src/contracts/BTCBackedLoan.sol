// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BTCBackedLoan is ReentrancyGuard {

    using SafeMath for uint256;

    IERC20 public btc;
    IERC20 public musd;
    IComplianceOracle public oracle;

    uint256 public collateralRatio = 150;

    struct Loan {
        uint256 collateral;
        uint256 debt;
    }

    mapping(address => Loan) public loans;

    event CollateralDeposited(address user, uint256 amount);
    event Borrowed(address user, uint256 amount);

    constructor(address _oracle, address _btc, address _musd) {
        oracle = IComplianceOracle(_oracle);
        btc = IERC20(_btc);
        musd = IERC20(_musd);
    }

    function depositCollateral(uint256 amount) external nonReentrant {
        require(!oracle.isSanctioned(msg.sender), "Sanctioned");

        require(btc.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        loans[msg.sender].collateral = loans[msg.sender].collateral.add(amount);

        emit CollateralDeposited(msg.sender, amount);
    }

    function borrow(uint256 amount) external nonReentrant {
        Loan storage loan = loans[msg.sender];

        require(
            loan.collateral.mul(100).div(collateralRatio) >= amount,
            "Insufficient collateral"
        );

        loan.debt = loan.debt.add(amount);

        require(musd.transfer(msg.sender, amount), "Loan transfer failed");

        emit Borrowed(msg.sender, amount);
    }
}

interface IComplianceOracle {
    function isSanctioned(address user) external view returns (bool);
}
