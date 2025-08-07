// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract LockContract {
    address public owner;

    event Locked(address indexed sender, address indexed receiver, uint256 amount, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    function lock(address receiver) external payable {
        require(msg.value > 0, "Must send ETH to lock");
        emit Locked(msg.sender, receiver, msg.value, block.timestamp);
    }
}
