// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BTCStaking is ReentrancyGuard {

    using SafeMath for uint256;

    IERC20 public btc;
    IComplianceOracle public oracle;

    uint256 public rewardRate = 5; // 5% annual
    uint256 public totalStaked;

    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 rewardsClaimed;
    }

    mapping(address => Stake) public stakes;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 reward);

    constructor(address _oracle, address _btc) {
        oracle = IComplianceOracle(_oracle);
        btc = IERC20(_btc);
    }

    function stake(uint256 amount) external nonReentrant {
        require(!oracle.isSanctioned(msg.sender), "Sanctioned");
        require(amount > 0, "Zero amount");

        require(btc.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        stakes[msg.sender].amount = stakes[msg.sender].amount.add(amount);
        stakes[msg.sender].startTime = block.timestamp;
        totalStaked = totalStaked.add(amount);

        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external nonReentrant {
        require(stakes[msg.sender].amount >= amount, "Insufficient stake");

        stakes[msg.sender].amount = stakes[msg.sender].amount.sub(amount);
        totalStaked = totalStaked.sub(amount);

        require(btc.transfer(msg.sender, amount), "Transfer failed");
        emit Unstaked(msg.sender, amount);
    }

    function claimRewards() external nonReentrant {
        Stake storage s = stakes[msg.sender];
        uint256 duration = block.timestamp.sub(s.startTime);
        uint256 reward = s.amount.mul(rewardRate).mul(duration).div(365 days).div(100);
        uint256 pending = reward.sub(s.rewardsClaimed);

        require(pending > 0, "No rewards");
        s.rewardsClaimed = reward;

        require(btc.transfer(msg.sender, pending), "Transfer failed");
        emit RewardsClaimed(msg.sender, pending);
    }
}
