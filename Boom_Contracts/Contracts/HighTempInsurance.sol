// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HighTempInsurance{
    struct Insurance {
        uint256 premium; // The premium paid for the insurance
        uint256 payout; // The payout amount for a claim
        uint256 purchaseTime; // The timestamp when the insurance was purchased
        uint256 startDate; // The start date when the insurance becomes active
        bool claimed; // Whether the payout has been claimed
    }

    mapping(address => Insurance) public insurances;
    int256 public maxTemp;
    int256 public minTemp;
    address public oracle;
    address public owner;
    uint256 public lastUpdateTimestamp; // Timestamp of the last weather data update
    uint256 public insuranceDuration; // Duration for which the insurance is valid
    int256 public thresholdTemp; // Temperature threshold for triggering payout
    uint256 public insurancePremium; // The premium amount for purchasing insurance
    uint256 public defaultPayout; // Default payout amount for insurance claims
    uint256 public startDateIntervalInDays; // Number of days before insurance becomes active
    bool public isInsuranceOpen; // Indicates whether insurance can be purchased
    address[] public insuredAddresses; // List of addresses that purchased insurance
    uint256 public insuredCount; // Count of insured addresses

    event InsurancePurchased(address indexed user, uint256 premium, uint256 payout, uint256 startDate);
    event WeatherDataUpdated(int256 maxTemp, int256 minTemp);
    event OracleChanged(address indexed oldOracle, address indexed newOracle);
    event PayoutClaimed(address indexed user, uint256 amount);
    event WeatherDataRequested();
    event InsuranceOpenStatusChanged(bool isOpen);
    event InsufficientBalance(uint256 contractBalance, uint256 payoutAmount);
    event ManagerCannotPurchase(address indexed user);
    event ContractFunded(address indexed owner, uint256 amount);

    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle can call this function");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier insuranceOpen() {
        require(isInsuranceOpen, "Insurance is currently closed");
        _;
    }

    constructor(
        address _oracle,
        uint256 _insuranceDurationInDays,
        int256 _thresholdTemp,
        uint256 _insurancePremium,
        uint256 _defaultPayout,
        uint256 _startDateIntervalInDays
    ) {
        owner = msg.sender;
        oracle = _oracle;
        insuranceDuration = _insuranceDurationInDays * 1 days;
        thresholdTemp = _thresholdTemp * 10; // Assumes the temperature data uses a different scale
        insurancePremium = _insurancePremium;
        defaultPayout = _defaultPayout;
        startDateIntervalInDays = _startDateIntervalInDays;
        isInsuranceOpen = false; // Insurance registration is initially closed
    }

    // Toggle the status of whether insurance can be purchased
    function toggleInsuranceStatus() external onlyOwner {
        isInsuranceOpen = !isInsuranceOpen;
        emit InsuranceOpenStatusChanged(isInsuranceOpen);
    }

    // Allows users to purchase insurance if it is open
    function purchaseInsurance() external payable insuranceOpen {
        require(msg.value == insurancePremium, "Incorrect premium amount");
        require(defaultPayout > 0, "Payout must be greater than 0");
        require(insurances[msg.sender].premium == 0, "Insurance already purchased");

        // Prevent the manager from purchasing insurance
        if (msg.sender == owner) {
            emit ManagerCannotPurchase(msg.sender);
            revert("Manager cannot purchase insurance");
        }

        uint256 startDate = block.timestamp + startDateIntervalInDays * 1 days;

        insurances[msg.sender] = Insurance({
            premium: msg.value,
            payout: defaultPayout,
            purchaseTime: block.timestamp,
            startDate: startDate,
            claimed: false
        });

        insuredAddresses.push(msg.sender);
        insuredCount++;

        emit InsurancePurchased(msg.sender, msg.value, defaultPayout, startDate);
    }

    // Allows users to claim their payout if the temperature threshold is met
    function claimPayout() external {
        Insurance storage insurance = insurances[msg.sender];
        require(insurance.premium > 0, "No insurance purchased");
        require(!insurance.claimed, "Payout already claimed");
        require(block.timestamp >= insurance.startDate, "Insurance not yet active");
        require(block.timestamp <= insurance.purchaseTime + insuranceDuration, "Insurance expired");

        if (maxTemp >= thresholdTemp) {
            uint256 payout = insurance.payout;
            insurance.claimed = true;
            if (address(this).balance >= payout) {
                (bool success, ) = payable(msg.sender).call{value: payout}("");
                require(success, "Payout failed");
                emit PayoutClaimed(msg.sender, payout);
            } else {
                emit InsufficientBalance(address(this).balance, payout);
            }
        } else {
            revert("Temperature threshold not reached");
        }
    }

    // Allows the owner to withdraw all funds from the contract
    function withdrawAll() external onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner).transfer(balance);
    }

    // Allows the owner to fund the contract with additional ether
    function fundContract() external payable onlyOwner {
        require(msg.value > 0, "Funding amount must be greater than zero");
        emit ContractFunded(msg.sender, msg.value);
    }

    // Returns the balance of the contract
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Returns the start date of the caller's insurance
    function getMyInsuranceStartDate() external view returns (uint256) {
        Insurance storage insurance = insurances[msg.sender];
        require(insurance.premium > 0, "No insurance purchased for this user");
        return insurance.startDate;
    }

    // Updates the weather data, only callable by the oracle
    function updateWeatherData(int256 _maxTemp, int256 _minTemp) public onlyOracle {
        maxTemp = _maxTemp;
        minTemp = _minTemp;
        lastUpdateTimestamp = block.timestamp;
        emit WeatherDataUpdated(_maxTemp, _minTemp);
    }

    // Allows the owner to set a new oracle
    function setOracle(address _newOracle) public onlyOwner {
        address oldOracle = oracle;
        oracle = _newOracle;
        emit OracleChanged(oldOracle, _newOracle);
    }

    // Requests a weather data update
    function requestWeatherDataUpdate() public {
        emit WeatherDataRequested();
    }

    // Returns the current weather data and the last update timestamp
    function getWeatherData() public view returns (int256, int256, uint256) {
        return (maxTemp, minTemp, lastUpdateTimestamp);
    }

    // Returns the list of addresses that have purchased insurance
    function getInsuredAddresses() public view returns (address[] memory) {
        return insuredAddresses;
    }
}
