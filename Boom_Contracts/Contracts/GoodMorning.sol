// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Registration {
    uint256 public registrationFee;
    address public manager;
    bool public isRegistrationOpen;
    uint256 public minTime;
    uint256 public maxTime;
    mapping(address => bool) public registered;
    mapping(address => uint256) public lastRegistrationTime;
    mapping(address => bool) public checkedIn;
    address[] public registeredUsers;
    uint256 public registeredCount;
    uint256 public checkedInCount;

    event Registered(address indexed user);
    event FeeChanged(uint256 newFee);
    event RegistrationStopped();
    event RegistrationRestarted();
    event UserRemoved(address indexed user);
    event TimeReset();
    event CheckedIn(address indexed user);
    event RewardSent(address indexed user, uint256 amount);
    event InsufficientBalance(uint256 contractBalance, uint256 rewardAmount);
    event RepeatedRegistration(address indexed user, uint256 remainingHours, uint256 remainingMinutes);
    event CheckInTooEarly(address indexed user, uint256 timeRemaining);
    event CheckInTooLate(address indexed user, uint256 timePassed);
    event ManagerCannotRegister(address indexed user);


    modifier onlyManager() {
        require(msg.sender == manager, "Only the contract manager can call this function");
        _;
    }

    modifier registrationOpen() {
        require(isRegistrationOpen, "Registration is currently closed");
        _;
    }

    constructor(uint256 _registrationFee) {
        registrationFee = _registrationFee;
        manager = msg.sender;
        isRegistrationOpen = true;
        minTime = 60; // 1 minute
        maxTime = 180; // 3 minutes
        registeredCount = 0;
        checkedInCount = 0;
    }

    receive() external payable {
        // Allow the contract to receive funds
    }

    function register() external payable registrationOpen {
        require(msg.value == registrationFee, "Incorrect registration fee");
        if (msg.sender == manager) {
            emit ManagerCannotRegister(msg.sender);
            revert("Manager cannot register");
        }
        require(!registered[msg.sender], "Already registered");

        // Check if the user has registered in the last 24 hours
        uint256 lastTime = lastRegistrationTime[msg.sender];
        if (lastTime != 0 && block.timestamp - lastTime < 24 hours) {
            uint256 remainingTime = 24 hours - (block.timestamp - lastTime);
            uint256 remainingHours = remainingTime / 1 hours;
            uint256 remainingMinutes = (remainingTime % 1 hours) / 1 minutes;
            emit RepeatedRegistration(msg.sender, remainingHours, remainingMinutes);
            revert(
                string(
                    abi.encodePacked(
                        "You have already registered today, please register again in ",
                        uintToString(remainingHours),
                        " hours ",
                        uintToString(remainingMinutes),
                        " minutes."
                    )
                )
            );
        }

        registered[msg.sender] = true;
        lastRegistrationTime[msg.sender] = block.timestamp;
        checkedIn[msg.sender] = false;

        // Add to registered users list
        registeredUsers.push(msg.sender);
        registeredCount++;

        // Check and remove users who have not registered in the last 24 hours
        for (uint256 i = 0; i < registeredUsers.length; i++) {
            if (block.timestamp - lastRegistrationTime[registeredUsers[i]] >= 24 hours) {
                address user = registeredUsers[i];
                registered[user] = false;
                checkedIn[user] = false;
                // Remove user from list
                registeredUsers[i] = registeredUsers[registeredUsers.length - 1];
                registeredUsers.pop();
                registeredCount--;
                emit UserRemoved(user);
                i--; // Adjust index to check the new element at this position
            }
        }

        emit Registered(msg.sender);
    }

    function checkIn() external {
        require(registered[msg.sender], "You are not registered");
        require(!checkedIn[msg.sender], "You have already checked in");
        
        uint256 registrationTime = lastRegistrationTime[msg.sender];
        uint256 timeSinceRegistration = block.timestamp - registrationTime;

        if (timeSinceRegistration < minTime) {
            uint256 timeRemaining = minTime - timeSinceRegistration;
            emit CheckInTooEarly(msg.sender, timeRemaining);
            revert("Check-in time has not started yet");
        }

        if (timeSinceRegistration > maxTime) {
            uint256 timePassed = timeSinceRegistration - maxTime;
            emit CheckInTooLate(msg.sender, timePassed);
            revert("Your check-in time has passed");
        }

        checkedIn[msg.sender] = true;
        checkedInCount++;

        // Send reward to the user
        if (address(this).balance >= registrationFee) {
            (bool sent, ) = payable(msg.sender).call{value: registrationFee}("");
            if (sent) {
                emit RewardSent(msg.sender, registrationFee);
            } else {
                emit InsufficientBalance(address(this).balance, registrationFee);
            }
        } else {
            emit InsufficientBalance(address(this).balance, registrationFee);
        }

        // Remove users who missed the check-in window
        for (uint256 i = 0; i < registeredUsers.length; i++) {
            if (!checkedIn[registeredUsers[i]] && block.timestamp - lastRegistrationTime[registeredUsers[i]] > maxTime) {
                address user = registeredUsers[i];
                registered[user] = false;
                // Remove user from list
                registeredUsers[i] = registeredUsers[registeredUsers.length - 1];
                registeredUsers.pop();
                registeredCount--;
                emit UserRemoved(user);
                i--; // Adjust index to check the new element at this position
            }
        }

        emit CheckedIn(msg.sender);
    }

    function setRegistrationFee(uint256 _registrationFee) external onlyManager {
        registrationFee = _registrationFee;
        emit FeeChanged(_registrationFee);
    }

    function stopRegistration() external onlyManager {
        isRegistrationOpen = false;
        emit RegistrationStopped();
    }

    function restartRegistration() external onlyManager {
        isRegistrationOpen = true;
        emit RegistrationRestarted();
    }

    function withdrawAll() external onlyManager {
        uint256 balance = address(this).balance;
        uint256 managerShare = balance * 5 / 100;
        uint256 remainingBalance = balance - managerShare;


        uint256 individualShare = 0;
        if (checkedInCount > 0) {
            individualShare = remainingBalance / checkedInCount;
            }

        payable(manager).transfer(managerShare);

        for (uint256 i = 0; i < registeredUsers.length; i++) {
        if (checkedIn[registeredUsers[i]]) {
            payable(registeredUsers[i]).transfer(individualShare);
        }
    }
        
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getRegisteredUsers() external view returns (address[] memory) {
        return registeredUsers;
    }

    function resetTime() external onlyManager {
        for (uint256 i = 0; i < registeredUsers.length; i++) {
            address user = registeredUsers[i];
            registered[user] = false;
            lastRegistrationTime[user] = 0;
            checkedIn[user] = false;
            emit UserRemoved(user);
        }
        delete registeredUsers;
        registeredCount = 0;
        checkedInCount = 0;
        emit TimeReset();
    }

    function setCheckInTimes(uint256 _minTime, uint256 _maxTime) external onlyManager {
        require(_minTime < _maxTime, "minTime must be less than maxTime");
        minTime = _minTime;
        maxTime = _maxTime;
    }

    function uintToString(uint256 v) internal pure returns (string memory) {
        if (v == 0) {
            return "0";
        }
        uint256 digits;
        uint256 v_copy = v;
        while (v_copy != 0) {
            digits++;
            v_copy /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (v != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + v % 10));
            v /= 10;
        }
        return string(buffer);
    }
}
