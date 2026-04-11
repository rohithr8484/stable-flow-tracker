// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BTCEscrow is ReentrancyGuard {

    using SafeMath for uint256;

    IERC20 public btc;
    IComplianceOracle public oracle;

    enum EscrowState { Created, Funded, Released, Refunded }

    struct Escrow {
        address buyer;
        address seller;
        uint256 amount;
        EscrowState state;
        uint256 deadline;
    }

    uint256 public escrowCount;
    mapping(uint256 => Escrow) public escrows;

    event EscrowCreated(uint256 indexed id, address buyer, address seller, uint256 amount);
    event EscrowFunded(uint256 indexed id);
    event EscrowReleased(uint256 indexed id);
    event EscrowRefunded(uint256 indexed id);

    constructor(address _oracle, address _btc) {
        oracle = IComplianceOracle(_oracle);
        btc = IERC20(_btc);
    }

    function createEscrow(address seller, uint256 amount, uint256 duration) external nonReentrant {
        require(!oracle.isSanctioned(msg.sender), "Sanctioned");
        require(!oracle.isSanctioned(seller), "Seller sanctioned");

        escrowCount++;
        escrows[escrowCount] = Escrow(msg.sender, seller, amount, EscrowState.Created, block.timestamp.add(duration));

        emit EscrowCreated(escrowCount, msg.sender, seller, amount);
    }

    function fundEscrow(uint256 id) external nonReentrant {
        Escrow storage e = escrows[id];
        require(msg.sender == e.buyer, "Not buyer");
        require(e.state == EscrowState.Created, "Invalid state");

        require(btc.transferFrom(msg.sender, address(this), e.amount), "Transfer failed");
        e.state = EscrowState.Funded;

        emit EscrowFunded(id);
    }

    function releaseEscrow(uint256 id) external nonReentrant {
        Escrow storage e = escrows[id];
        require(msg.sender == e.buyer, "Not buyer");
        require(e.state == EscrowState.Funded, "Not funded");

        e.state = EscrowState.Released;
        require(btc.transfer(e.seller, e.amount), "Transfer failed");

        emit EscrowReleased(id);
    }

    function refundEscrow(uint256 id) external nonReentrant {
        Escrow storage e = escrows[id];
        require(block.timestamp > e.deadline, "Not expired");
        require(e.state == EscrowState.Funded, "Not funded");

        e.state = EscrowState.Refunded;
        require(btc.transfer(e.buyer, e.amount), "Transfer failed");

        emit EscrowRefunded(id);
    }
}
