// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TreasuryMultisig is ReentrancyGuard {

    using SafeMath for uint256;

    uint256 public requiredApprovals;
    address[] public signers;
    mapping(address => bool) public isSigner;

    struct Transaction {
        address token;
        address to;
        uint256 amount;
        uint256 approvals;
        bool executed;
    }

    uint256 public txCount;
    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => mapping(address => bool)) public approved;

    event TransactionProposed(uint256 indexed id, address token, address to, uint256 amount);
    event TransactionApproved(uint256 indexed id, address signer);
    event TransactionExecuted(uint256 indexed id);

    constructor(address[] memory _signers, uint256 _required) {
        require(_required <= _signers.length, "Invalid threshold");
        signers = _signers;
        requiredApprovals = _required;
        for (uint i = 0; i < _signers.length; i++) {
            isSigner[_signers[i]] = true;
        }
    }

    function propose(address token, address to, uint256 amount) external {
        require(isSigner[msg.sender], "Not signer");
        txCount++;
        transactions[txCount] = Transaction(token, to, amount, 0, false);
        emit TransactionProposed(txCount, token, to, amount);
    }

    function approve(uint256 id) external {
        require(isSigner[msg.sender], "Not signer");
        require(!approved[id][msg.sender], "Already approved");

        approved[id][msg.sender] = true;
        transactions[id].approvals++;

        emit TransactionApproved(id, msg.sender);
    }

    function execute(uint256 id) external nonReentrant {
        Transaction storage t = transactions[id];
        require(t.approvals >= requiredApprovals, "Not enough approvals");
        require(!t.executed, "Already executed");

        t.executed = true;
        require(IERC20(t.token).transfer(t.to, t.amount), "Transfer failed");

        emit TransactionExecuted(id);
    }
}
