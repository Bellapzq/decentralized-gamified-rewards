// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "remix_tests.sol";
import "../contracts/HighTempInsurance.sol";

contract HighTempInsuranceTest {
    HighTempInsurance highTempInsurance;
    address owner;
    address oracle;

    function beforeAll() public {
        owner = address(this);
        oracle = address(0x123);
        highTempInsurance = new HighTempInsurance(oracle, 30, 25, 1 ether, 10 ether, 1);
    }

    function testInitialSetup() public {
        Assert.equal(highTempInsurance.owner(), owner, "Owner should be set correctly");
        Assert.equal(highTempInsurance.oracle(), oracle, "Oracle should be set correctly");
        Assert.equal(highTempInsurance.isInsuranceOpen(), false, "Insurance should initially be closed");
        Assert.equal(highTempInsurance.insurancePremium(), 1 ether, "Premium should be 1 ether");
    }

    function testToggleInsuranceStatus() public {
        highTempInsurance.toggleInsuranceStatus();
        Assert.equal(highTempInsurance.isInsuranceOpen(), true, "Insurance should be open");
        highTempInsurance.toggleInsuranceStatus();
        Assert.equal(highTempInsurance.isInsuranceOpen(), false, "Insurance should be closed");
    }
    
    function testPurchaseInsuranceWhenClosed() public {
            (bool success, ) = address(highTempInsurance).call{value: 1 ether}(
                abi.encodeWithSignature("purchaseInsurance()")
            );
            Assert.ok(success == false, "Should not allow purchase when insurance is closed");
        }

    function testPurchaseInsuranceWithIncorrectPremium() public {
        (bool success, ) = address(highTempInsurance).call{value: 0.5 ether}(
            abi.encodeWithSignature("purchaseInsurance()")
        );
        Assert.ok(success == false, "Should not allow purchase with incorrect premium");
    }

    function testDoublePurchaseInsurance() public {
        (bool success, ) = address(highTempInsurance).call{value: 1 ether}(
            abi.encodeWithSignature("purchaseInsurance()")
        );
        Assert.ok(success == false, "Should not allow double purchase of insurance");
    }


    function testClaimPayoutThresholdNotReached() public {
        (bool success, ) = address(highTempInsurance).call(
            abi.encodeWithSignature("claimPayout()")
        );
        Assert.ok(success == false, "Should not allow claim when temperature threshold not reached");
    }


    function testOnlyOracleCanUpdateWeatherData() public {
        (bool success, ) = address(highTempInsurance).call(
            abi.encodeWithSignature("updateWeatherData(int256,int256)", 35 * 10, 15 * 10)
        );
        Assert.ok(success == false, "Only oracle should be able to update weather data");
    }

    function testChangeOracle() public {
        address newOracle = address(0x456);
        highTempInsurance.setOracle(newOracle);
        Assert.equal(highTempInsurance.oracle(), newOracle, "Oracle should be updated");
    }


    function testNonOwnerWithdrawAll() public {
        (bool success, ) = address(highTempInsurance).call(
            abi.encodeWithSignature("withdrawAll()")
        );
        Assert.ok(success == false, "Only owner should be able to withdraw funds");
    }
}
