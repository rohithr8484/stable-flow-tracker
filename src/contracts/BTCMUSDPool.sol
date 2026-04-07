// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BTCMUSDPool is ReentrancyGuard {

    using SafeMath for uint256;

    IERC20 public btc;
    IERC20 public musd;
    IComplianceOracle public oracle;

    mapping(address => uint256) public shares;

    event LiquidityAdded(address user, uint256 btcAmount, uint256 musdAmount);
    event LiquidityRemoved(address user, uint256 share);

    constructor(address _oracle, address _btc, address _musd) {
        oracle = IComplianceOracle(_oracle);
        btc = IERC20(_btc);
        musd = IERC20(_musd);
    }

    function addLiquidity(uint256 btcAmount, uint256 musdAmount)
        external
        nonReentrant
    {
        require(!oracle.isSanctioned(msg.sender), "Sanctioned");

        require(btc.transferFrom(msg.sender, address(this), btcAmount), "BTC failed");
        require(musd.transferFrom(msg.sender, address(this), musdAmount), "MUSD failed");

        shares[msg.sender] = shares[msg.sender].add(btcAmount.add(musdAmount));

        emit LiquidityAdded(msg.sender, btcAmount, musdAmount);
    }

    function removeLiquidity(uint256 share)
        external
        nonReentrant
    {
        require(shares[msg.sender] >= share, "Not enough");

        shares[msg.sender] = shares[msg.sender].sub(share);

        require(btc.transfer(msg.sender, share / 2), "BTC transfer failed");
        require(musd.transfer(msg.sender, share / 2), "MUSD transfer failed");

        emit LiquidityRemoved(msg.sender, share);
    }
}

interface IComplianceOracle {
    function isSanctioned(address user) external view returns (bool);
}
