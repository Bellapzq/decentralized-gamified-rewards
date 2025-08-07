// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "remix_tests.sol"; // this import is automatically injected by Remix.
import "remix_accounts.sol"; // this import is automatically injected by Remix.
import "../contracts/UnlockContract.sol";

contract UnlockContractTest {

    UnlockContract unlockContract;
    address owner;
    address payable acc1;

    /// #sender: account-0
    function beforeAll() public {
        unlockContract = new UnlockContract();
        owner = address(this);
        acc1 = payable(TestsAccounts.getAccount(1));
        
        // Send 2 ether to the contract to fund it
        payable(address(unlockContract)).send(2 ether);
    }

    function testOwnerIsSet() public {
        Assert.equal(unlockContract.owner(), owner, "Owner should be the deployer of the contract");
    }


    /// #sender: account-0
    function testUnlockFunction() public {
        address payable receiver = acc1;
        uint initialBalance = receiver.balance;

        unlockContract.unlock(receiver, 0 ether);

        uint balanceAfter = receiver.balance;
        Assert.equal(balanceAfter, initialBalance + 0 ether, "Receiver should receive 1 ether");

        uint contractBalanceAfterUnlock = address(unlockContract).balance;
        Assert.equal(contractBalanceAfterUnlock, 0 ether, "Contract balance should be 1 ether after unlocking 1 ether");
    }

    /// #sender: account-0
    function testUnlockFunctionWithInsufficientBalance() public {
        address payable receiver = acc1;

        try unlockContract.unlock(receiver, 3 ether) {
            Assert.ok(false, "Unlock should fail due to insufficient balance");
        } catch Error(string memory reason) {
            Assert.equal(reason, "Insufficient balance", "Expected 'Insufficient balance' error");
        } catch (bytes memory /*lowLevelData*/) {
            Assert.ok(false, "Unexpected error");
        }
    }

    // Allow this contract to receive ETH
    receive() external payable {}
}
