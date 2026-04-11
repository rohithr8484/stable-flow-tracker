// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BTCRewardsDistributor is ReentrancyGuard {

    using SafeMath for uint256;

    IERC20 public rewardToken;
    IComplianceOracle public oracle;
    address public admin;

    uint256 public totalDistributed;

    mapping(address => uint256) public rewards;
    mapping(address => uint256) public claimed;

    event RewardsAllocated(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);

    constructor(address _oracle, address _rewardToken) {
        oracle = IComplianceOracle(_oracle);
        rewardToken = IERC20(_rewardToken);
        admin = msg.sender;
    }

    function allocateRewards(address[] calldata users, uint256[] calldata amounts) external {
        require(msg.sender == admin, "Not admin");
        require(users.length == amounts.length, "Length mismatch");

        for (uint i = 0; i < users.length; i++) {
            rewards[users[i]] = rewards[users[i]].add(amounts[i]);
            totalDistributed = totalDistributed.add(amounts[i]);
            emit RewardsAllocated(users[i], amounts[i]);
        }
    }

    function claimRewards() external nonReentrant {
        require(!oracle.isSanctioned(msg.sender), "Sanctioned");
        uint256 pending = rewards[msg.sender].sub(claimed[msg.sender]);
        require(pending > 0, "No rewards");

        claimed[msg.sender] = claimed[msg.sender].add(pending);
        require(rewardToken.transfer(msg.sender, pending), "Transfer failed");

        emit RewardsClaimed(msg.sender, pending);
    }
}
