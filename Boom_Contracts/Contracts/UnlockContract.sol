// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract UnlockContract {
    address public owner;

    event Unlocked(address indexed receiver, uint256 amount, uint256 timestamp);
    event DebugBalance(uint256 balance);
    event DebugOwner(address sender, address owner);
    event DebugRequiredAmount(uint256 required, uint256 available);
    event DebugTransfer(address receiver, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    function unlock(address payable receiver, uint256 amountInWei) external {
        uint256 contractBalance = address(this).balance;
        emit DebugBalance(contractBalance);
        emit DebugRequiredAmount(amountInWei, contractBalance);
        require(contractBalance >= amountInWei, "Insufficient balance");

        receiver.transfer(amountInWei);
        emit DebugTransfer(receiver, amountInWei);
        emit Unlocked(receiver, amountInWei, block.timestamp);
    }

    // 允许合约接收ETH
    receive() external payable {}

    // 检查合约余额
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
