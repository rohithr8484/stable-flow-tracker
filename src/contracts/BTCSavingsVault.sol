// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BTCSavingsVault is ReentrancyGuard {

    using SafeMath for uint256;

    IERC20 public token;
    IComplianceOracle public oracle;

    mapping(address => uint256) public deposits;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor(address _oracle, address _token) {
        oracle = IComplianceOracle(_oracle);
        token = IERC20(_token);
    }

    function deposit(uint256 amount) external nonReentrant {
        require(!oracle.isSanctioned(msg.sender), "Sanctioned");

        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        deposits[msg.sender] = deposits[msg.sender].add(amount);

        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(deposits[msg.sender] >= amount, "Insufficient");

        deposits[msg.sender] = deposits[msg.sender].sub(amount);

        require(token.transfer(msg.sender, amount), "Withdraw failed");

        emit Withdrawn(msg.sender, amount);
    }
}

interface IComplianceOracle {
    function isSanctioned(address user) external view returns (bool);
}
