// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BTCReceiveHandler {

    using SafeMath for uint256;

    IComplianceOracle public oracle;

    mapping(address => uint256) public balances;

    event Credited(address indexed user, uint256 amount);

    constructor(address _oracle) {
        oracle = IComplianceOracle(_oracle);
    }

    function credit(address user, uint256 amount, address sender) external {
        require(!oracle.isSanctioned(sender), "Sanctioned sender");

        uint256 risk = oracle.getRiskScore(sender);
        require(risk < 80, "High risk funds");

        balances[user] = balances[user].add(amount);

        emit Credited(user, amount);
    }
}

interface IComplianceOracle {
    function getRiskScore(address user) external view returns (uint256);
    function isSanctioned(address user) external view returns (bool);
}
