// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BTCGovernance {

    using SafeMath for uint256;

    IERC20 public govToken;
    IComplianceOracle public oracle;

    uint256 public proposalCount;
    uint256 public votingPeriod = 3 days;
    uint256 public quorum = 1000e18;

    struct Proposal {
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 deadline;
        bool executed;
        address proposer;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 indexed id, string description, address proposer);
    event Voted(uint256 indexed id, address voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed id);

    constructor(address _oracle, address _govToken) {
        oracle = IComplianceOracle(_oracle);
        govToken = IERC20(_govToken);
    }

    function propose(string calldata description) external returns (uint256) {
        require(!oracle.isSanctioned(msg.sender), "Sanctioned");
        require(govToken.balanceOf(msg.sender) >= 100e18, "Insufficient tokens");

        proposalCount++;
        proposals[proposalCount] = Proposal(description, 0, 0, block.timestamp.add(votingPeriod), false, msg.sender);

        emit ProposalCreated(proposalCount, description, msg.sender);
        return proposalCount;
    }

    function vote(uint256 id, bool support) external {
        require(!oracle.isSanctioned(msg.sender), "Sanctioned");
        require(!hasVoted[id][msg.sender], "Already voted");
        require(block.timestamp <= proposals[id].deadline, "Voting ended");

        uint256 weight = govToken.balanceOf(msg.sender);
        hasVoted[id][msg.sender] = true;

        if (support) {
            proposals[id].forVotes = proposals[id].forVotes.add(weight);
        } else {
            proposals[id].againstVotes = proposals[id].againstVotes.add(weight);
        }

        emit Voted(id, msg.sender, support, weight);
    }
}
