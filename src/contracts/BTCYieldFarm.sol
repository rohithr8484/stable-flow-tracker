// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BTCYieldFarm is ReentrancyGuard {

    using SafeMath for uint256;

    IERC20 public lpToken;
    IERC20 public rewardToken;
    IComplianceOracle public oracle;

    uint256 public rewardPerBlock = 1e16;
    uint256 public lastRewardBlock;
    uint256 public accRewardPerShare;
    uint256 public totalDeposited;

    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
    }

    mapping(address => UserInfo) public userInfo;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event Harvest(address indexed user, uint256 reward);

    constructor(address _oracle, address _lpToken, address _rewardToken) {
        oracle = IComplianceOracle(_oracle);
        lpToken = IERC20(_lpToken);
        rewardToken = IERC20(_rewardToken);
        lastRewardBlock = block.number;
    }

    function updatePool() internal {
        if (totalDeposited == 0) { lastRewardBlock = block.number; return; }
        uint256 blocks = block.number.sub(lastRewardBlock);
        uint256 reward = blocks.mul(rewardPerBlock);
        accRewardPerShare = accRewardPerShare.add(reward.mul(1e12).div(totalDeposited));
        lastRewardBlock = block.number;
    }

    function deposit(uint256 amount) external nonReentrant {
        require(!oracle.isSanctioned(msg.sender), "Sanctioned");
        updatePool();
        UserInfo storage user = userInfo[msg.sender];

        if (user.amount > 0) {
            uint256 pending = user.amount.mul(accRewardPerShare).div(1e12).sub(user.rewardDebt);
            if (pending > 0) rewardToken.transfer(msg.sender, pending);
        }

        require(lpToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        user.amount = user.amount.add(amount);
        user.rewardDebt = user.amount.mul(accRewardPerShare).div(1e12);
        totalDeposited = totalDeposited.add(amount);

        emit Deposit(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        require(user.amount >= amount, "Insufficient");
        updatePool();

        uint256 pending = user.amount.mul(accRewardPerShare).div(1e12).sub(user.rewardDebt);
        if (pending > 0) rewardToken.transfer(msg.sender, pending);

        user.amount = user.amount.sub(amount);
        user.rewardDebt = user.amount.mul(accRewardPerShare).div(1e12);
        totalDeposited = totalDeposited.sub(amount);

        require(lpToken.transfer(msg.sender, amount), "Transfer failed");
        emit Withdraw(msg.sender, amount);
    }
}
