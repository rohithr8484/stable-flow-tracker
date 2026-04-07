// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IComplianceOracle {
    function getRiskScore(address user) external view returns (uint256);
    function isSanctioned(address user) external view returns (bool);
}

contract BTCSendRouter is ReentrancyGuard {

    using SafeMath for uint256;

    IComplianceOracle public oracle;
    uint256 public maxRisk = 70;

    event TransferExecuted(address indexed from, address indexed to, uint256 amount);

    constructor(address _oracle) {
        oracle = IComplianceOracle(_oracle);
    }

    function send(address token, address to, uint256 amount)
        external
        nonReentrant
    {
        require(!oracle.isSanctioned(msg.sender), "Sender sanctioned");
        require(!oracle.isSanctioned(to), "Receiver sanctioned");

        uint256 risk = oracle.getRiskScore(msg.sender);
        require(risk < maxRisk, "High risk");

        require(IERC20(token).transferFrom(msg.sender, to, amount), "Transfer failed");

        emit TransferExecuted(msg.sender, to, amount);
    }
}
