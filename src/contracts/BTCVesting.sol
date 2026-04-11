// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BTCVesting is ReentrancyGuard {

    using SafeMath for uint256;

    IERC20 public token;
    address public admin;

    struct VestingSchedule {
        uint256 total;
        uint256 claimed;
        uint256 start;
        uint256 duration;
    }

    mapping(address => VestingSchedule) public schedules;

    event VestingCreated(address indexed beneficiary, uint256 total, uint256 duration);
    event TokensClaimed(address indexed beneficiary, uint256 amount);

    constructor(address _token) {
        token = IERC20(_token);
        admin = msg.sender;
    }

    function createVesting(address beneficiary, uint256 total, uint256 duration) external {
        require(msg.sender == admin, "Not admin");
        require(schedules[beneficiary].total == 0, "Already exists");

        require(token.transferFrom(msg.sender, address(this), total), "Transfer failed");

        schedules[beneficiary] = VestingSchedule(total, 0, block.timestamp, duration);
        emit VestingCreated(beneficiary, total, duration);
    }

    function claim() external nonReentrant {
        VestingSchedule storage s = schedules[msg.sender];
        require(s.total > 0, "No schedule");

        uint256 elapsed = block.timestamp.sub(s.start);
        if (elapsed > s.duration) elapsed = s.duration;

        uint256 vested = s.total.mul(elapsed).div(s.duration);
        uint256 claimable = vested.sub(s.claimed);
        require(claimable > 0, "Nothing to claim");

        s.claimed = s.claimed.add(claimable);
        require(token.transfer(msg.sender, claimable), "Transfer failed");

        emit TokensClaimed(msg.sender, claimable);
    }
}
