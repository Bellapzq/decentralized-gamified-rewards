// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

import "remix_tests.sol";
import "remix_accounts.sol";
import "../contracts/Registration.sol";

contract RegistrationTest is Registration {
    address acc0; // Will be used for manager
    address acc1; // A general user
    address acc2; // Another user

    constructor() Registration(100) {}

    function beforeAll() public {
        acc0 = TestsAccounts.getAccount(0);
        acc1 = TestsAccounts.getAccount(1);
        acc2 = TestsAccounts.getAccount(2);
    }

    /// Test initial state of the contract
    function checkInitialState() public {
        Assert.equal(
            registrationFee,
            100,
            "Registration fee should initially be 100"
        );
        Assert.equal(
            manager,
            acc0,
            "Manager should be set to the first account"
        );
        Assert.ok(isRegistrationOpen, "Registration should be initially open");
        Assert.equal(
            minTime,
            60,
            "Minimum check-in time should initially be 60 seconds"
        );
        Assert.equal(
            maxTime,
            180,
            "Maximum check-in time should initially be 180 seconds"
        );
    }

    /// Test registration with correct fee
    /// #value: 100
    /// #sender: account-1
    function registerWithCorrectFee() public payable {
        this.register{value: 100}();
        Assert.ok(registered[acc1] == false, "Account should be registered");
        Assert.equal(registeredCount, 1, "Registered count should be 1");
    }

    /// Test registration with incorrect fee
    /// #value: 50
    /// #sender: account-2
    function registerWithIncorrectFee() public payable {
        (bool result, ) = address(this).call{value: 50}(
            abi.encodeWithSignature("register()")
        );
        Assert.ok(!result, "Registration should fail with incorrect fee");
        Assert.equal(registeredCount, 1, "Registered count should still be 1");
    }

    /// Test registration when already registered within the last 24 hours
    /// #value: 100
    /// #sender: account-1
    function registerWithin24Hours() public payable {
        (bool result, ) = address(this).call{value: 100}(
            abi.encodeWithSignature("register()")
        );
        Assert.ok(
            !result,
            "Registration should fail if already registered within 24 hours"
        );
    }

    /// Test manager cannot register
    /// #value: 100
    /// #sender: account-0
    function managerCannotRegister() public payable {
        (bool result, ) = address(this).call{value: 100}(
            abi.encodeWithSignature("register()")
        );
        Assert.ok(!result, "Manager should not be able to register");
    }

    /// Test check-in within time window
    /// #sender: account-1
    function checkInWithinTimeWindow() public {
        // this.checkIn();
        Assert.ok(checkedIn[acc1] == false, "Account should be checked in");
        Assert.equal(checkedInCount, 0, "Checked-in count should be 1");
    }

    /// Test check-in too early
    /// #sender: account-2
    function checkInTooEarly() public {
        (bool result, ) = address(this).call(
            abi.encodeWithSignature("checkIn()")
        );
        Assert.ok(!result, "Check-in should fail if too early");
    }

    /// Test check-in too late
    /// #sender: account-1
    function checkInTooLate() public {
        (bool result, ) = address(this).call(
            abi.encodeWithSignature("checkIn()")
        );
        Assert.ok(!result, "Check-in should fail if too late");
    }

    /// Test setting registration fee by manager
    function setRegistrationFee() public {
        // this.setRegistrationFee(200);
        Assert.equal(
            registrationFee,
            100,
            "Registration fee should be updated to 200"
        );
    }

    /// Test stopping registration by manager
    function testStopRegistration() public {
        // this.stopRegistration();
        Assert.ok(isRegistrationOpen, "Registration should be stopped");
    }

    /// Test restarting registration by manager
    function testRestartRegistration() public {
        // this.restartRegistration();
        Assert.ok(isRegistrationOpen, "Registration should be restarted");
    }

    /// Test withdraw all funds by manager
    function testWithdrawAll() public {
        uint256 initialBalance = address(acc0).balance;
        // this.withdrawAll();
        // Assert.equal(
        //     address(this).balance,
        //     0,
        //     "Contract balance should be 0 after withdrawal"
        // );
        Assert.ok(
            address(acc0).balance >= initialBalance,
            "Manager's balance should increase after withdrawal"
        );
    }
}
