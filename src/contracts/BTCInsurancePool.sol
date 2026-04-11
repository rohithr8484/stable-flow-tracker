// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BTCInsurancePool is ReentrancyGuard {

    using SafeMath for uint256;

    IERC20 public btc;
    IComplianceOracle public oracle;
    address public governance;

    uint256 public totalCoverage;
    uint256 public totalPremiums;

    struct Policy {
        uint256 coverage;
        uint256 premium;
        uint256 expiry;
        bool active;
    }

    mapping(address => Policy) public policies;

    event PolicyCreated(address indexed user, uint256 coverage, uint256 premium);
    event ClaimPaid(address indexed user, uint256 amount);

    constructor(address _oracle, address _btc, address _governance) {
        oracle = IComplianceOracle(_oracle);
        btc = IERC20(_btc);
        governance = _governance;
    }

    function purchasePolicy(uint256 coverage, uint256 duration) external nonReentrant {
        require(!oracle.isSanctioned(msg.sender), "Sanctioned");
        uint256 premium = coverage.mul(2).div(100); // 2% premium

        require(btc.transferFrom(msg.sender, address(this), premium), "Transfer failed");

        policies[msg.sender] = Policy(coverage, premium, block.timestamp.add(duration), true);
        totalCoverage = totalCoverage.add(coverage);
        totalPremiums = totalPremiums.add(premium);

        emit PolicyCreated(msg.sender, coverage, premium);
    }

    function processClaim(address user, uint256 amount) external nonReentrant {
        require(msg.sender == governance, "Not governance");
        Policy storage p = policies[user];
        require(p.active && block.timestamp <= p.expiry, "Invalid policy");
        require(amount <= p.coverage, "Exceeds coverage");

        p.coverage = p.coverage.sub(amount);
        require(btc.transfer(user, amount), "Transfer failed");

        emit ClaimPaid(user, amount);
    }
}
