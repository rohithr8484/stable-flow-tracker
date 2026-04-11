// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BTCBridge is ReentrancyGuard {

    using SafeMath for uint256;

    IERC20 public btc;
    IComplianceOracle public oracle;
    address public relayer;

    uint256 public bridgeFee = 10; // 0.1% = 10 basis points
    uint256 public nonce;

    struct BridgeRequest {
        address sender;
        uint256 amount;
        uint256 targetChain;
        bool processed;
    }

    mapping(uint256 => BridgeRequest) public requests;

    event BridgeInitiated(uint256 indexed id, address sender, uint256 amount, uint256 targetChain);
    event BridgeCompleted(uint256 indexed id);

    constructor(address _oracle, address _btc, address _relayer) {
        oracle = IComplianceOracle(_oracle);
        btc = IERC20(_btc);
        relayer = _relayer;
    }

    function initiateBridge(uint256 amount, uint256 targetChain) external nonReentrant {
        require(!oracle.isSanctioned(msg.sender), "Sanctioned");
        require(amount > 0, "Zero amount");

        uint256 fee = amount.mul(bridgeFee).div(10000);
        uint256 netAmount = amount.sub(fee);

        require(btc.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        nonce++;
        requests[nonce] = BridgeRequest(msg.sender, netAmount, targetChain, false);

        emit BridgeInitiated(nonce, msg.sender, netAmount, targetChain);
    }

    function completeBridge(uint256 id, address recipient, uint256 amount) external nonReentrant {
        require(msg.sender == relayer, "Not relayer");
        require(!requests[id].processed, "Already processed");

        requests[id].processed = true;
        require(btc.transfer(recipient, amount), "Transfer failed");

        emit BridgeCompleted(id);
    }
}
