// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ComplianceOracle {

    address public owner;

    mapping(address => uint256) public riskScore;
    mapping(address => bool) public sanctioned;

    event RiskUpdated(address user, uint256 score);
    event SanctionUpdated(address user, bool status);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setRiskScore(address user, uint256 score) external onlyOwner {
        riskScore[user] = score;
        emit RiskUpdated(user, score);
    }

    function setSanction(address user, bool status) external onlyOwner {
        sanctioned[user] = status;
        emit SanctionUpdated(user, status);
    }

    function getRiskScore(address user) external view returns (uint256) {
        return riskScore[user];
    }

    function isSanctioned(address user) external view returns (bool) {
        return sanctioned[user];
    }
}
