// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BTCTimelock is ReentrancyGuard {

    using SafeMath for uint256;

    address public admin;
    uint256 public minDelay = 24 hours;

    struct TimelockTx {
        address token;
        address to;
        uint256 amount;
        uint256 executeAfter;
        bool executed;
        bool cancelled;
    }

    uint256 public txCount;
    mapping(uint256 => TimelockTx) public timelockTxs;

    event TransactionQueued(uint256 indexed id, address token, address to, uint256 amount, uint256 executeAfter);
    event TransactionExecuted(uint256 indexed id);
    event TransactionCancelled(uint256 indexed id);

    constructor() {
        admin = msg.sender;
    }

    function queueTransaction(address token, address to, uint256 amount) external returns (uint256) {
        require(msg.sender == admin, "Not admin");
        txCount++;

        timelockTxs[txCount] = TimelockTx(token, to, amount, block.timestamp.add(minDelay), false, false);

        emit TransactionQueued(txCount, token, to, amount, block.timestamp.add(minDelay));
        return txCount;
    }

    function executeTransaction(uint256 id) external nonReentrant {
        require(msg.sender == admin, "Not admin");
        TimelockTx storage t = timelockTxs[id];
        require(!t.executed && !t.cancelled, "Invalid state");
        require(block.timestamp >= t.executeAfter, "Too early");

        t.executed = true;
        require(IERC20(t.token).transfer(t.to, t.amount), "Transfer failed");

        emit TransactionExecuted(id);
    }

    function cancelTransaction(uint256 id) external {
        require(msg.sender == admin, "Not admin");
        TimelockTx storage t = timelockTxs[id];
        require(!t.executed, "Already executed");

        t.cancelled = true;
        emit TransactionCancelled(id);
    }
}
