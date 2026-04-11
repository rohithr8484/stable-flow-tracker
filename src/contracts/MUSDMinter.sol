// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MUSDMinter is ReentrancyGuard {

    using SafeMath for uint256;

    IERC20 public btc;
    IERC20 public musd;
    IComplianceOracle public oracle;

    uint256 public mintRatio = 120; // 120% collateral required
    uint256 public totalMinted;

    mapping(address => uint256) public collateral;
    mapping(address => uint256) public minted;

    event Minted(address indexed user, uint256 musdAmount, uint256 collateralLocked);
    event Redeemed(address indexed user, uint256 musdAmount, uint256 collateralReturned);

    constructor(address _oracle, address _btc, address _musd) {
        oracle = IComplianceOracle(_oracle);
        btc = IERC20(_btc);
        musd = IERC20(_musd);
    }

    function mint(uint256 btcAmount) external nonReentrant {
        require(!oracle.isSanctioned(msg.sender), "Sanctioned");
        uint256 musdAmount = btcAmount.mul(100).div(mintRatio);

        require(btc.transferFrom(msg.sender, address(this), btcAmount), "Transfer failed");

        collateral[msg.sender] = collateral[msg.sender].add(btcAmount);
        minted[msg.sender] = minted[msg.sender].add(musdAmount);
        totalMinted = totalMinted.add(musdAmount);

        emit Minted(msg.sender, musdAmount, btcAmount);
    }

    function redeem(uint256 musdAmount) external nonReentrant {
        require(minted[msg.sender] >= musdAmount, "Exceeds minted");

        uint256 btcReturn = musdAmount.mul(mintRatio).div(100);
        minted[msg.sender] = minted[msg.sender].sub(musdAmount);
        collateral[msg.sender] = collateral[msg.sender].sub(btcReturn);
        totalMinted = totalMinted.sub(musdAmount);

        require(btc.transfer(msg.sender, btcReturn), "Transfer failed");
        emit Redeemed(msg.sender, musdAmount, btcReturn);
    }
}
