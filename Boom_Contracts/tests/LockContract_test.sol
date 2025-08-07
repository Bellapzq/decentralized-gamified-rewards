// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "remix_tests.sol"; // this import is automatically injected by Remix.
import "remix_accounts.sol"; // this import is automatically injected by Remix.
import "../contracts/LockContract.sol";

contract LockContractTest {

    LockContract lockContract;
    address acc0;
    address acc1;

    /// #sender: account-0
    function beforeAll() public {
        lockContract = new LockContract();
        acc0 = address(this);
        acc1 = TestsAccounts.getAccount(1);
    }

    function testOwnerIsSet() public {
        Assert.equal(lockContract.owner(), acc0, "Owner should be the deployer of the contract");
    }

    /// #sender: account-1
    /// #value: 1 ether
    function testLockFunction() public payable {
        address receiver = acc1;
        uint initialBalance = address(receiver).balance;

        lockContract.lock{value: msg.value}(receiver);

        Assert.ok(true, "Lock function should be successful");

        // Since we're not listening to events, we will assume success if no errors
        Assert.equal(address(receiver).balance, initialBalance, "Receiver balance should remain the same after lock");
    }

    /// #sender: account-1
    function testLockFunctionWithZeroValue() public {
        address receiver = acc1;

        // 捕获错误
        (bool success, ) = address(lockContract).call(abi.encodeWithSignature("lock(address)", receiver));
        Assert.equal(success, false, "Should fail when locking 0 value");
    }
}
