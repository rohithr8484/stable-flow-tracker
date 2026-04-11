// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BTCPriceFeed {

    using SafeMath for uint256;

    address public oracle;
    uint256 public price;
    uint256 public lastUpdated;
    uint256 public maxStaleness = 1 hours;

    mapping(uint256 => uint256) public priceHistory;
    uint256 public historyCount;

    event PriceUpdated(uint256 newPrice, uint256 timestamp);

    constructor(address _oracle) {
        oracle = _oracle;
    }

    function updatePrice(uint256 _price) external {
        require(msg.sender == oracle, "Not oracle");
        require(_price > 0, "Invalid price");

        price = _price;
        lastUpdated = block.timestamp;
        historyCount++;
        priceHistory[historyCount] = _price;

        emit PriceUpdated(_price, block.timestamp);
    }

    function getPrice() external view returns (uint256) {
        require(block.timestamp.sub(lastUpdated) <= maxStaleness, "Stale price");
        return price;
    }

    function isStale() external view returns (bool) {
        return block.timestamp.sub(lastUpdated) > maxStaleness;
    }
}
