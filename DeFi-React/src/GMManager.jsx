import React, { useState, useEffect } from 'react';
import { Typography, Box, Stack, Button, TextField } from '@mui/material';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';

// const contractABI = [{"inputs":[{"internalType":"uint256","name":"_registrationFee","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"timeRemaining","type":"uint256"}],"name":"CheckInTooEarly","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"CheckInTooLate","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"CheckedIn","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newFee","type":"uint256"}],"name":"FeeChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"contractBalance","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"rewardAmount","type":"uint256"}],"name":"InsufficientBalance","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"ManagerCannotRegister","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"Registered","type":"event"},{"anonymous":false,"inputs":[],"name":"RegistrationRestarted","type":"event"},{"anonymous":false,"inputs":[],"name":"RegistrationStopped","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"remainingHours","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"remainingMinutes","type":"uint256"}],"name":"RepeatedRegistration","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardSent","type":"event"},{"anonymous":false,"inputs":[],"name":"TimeReset","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"UserRemoved","type":"event"},{"inputs":[],"name":"checkIn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"checkedIn","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"checkedInCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getContractBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getRegisteredUsers","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isRegistrationOpen","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"lastRegistrationTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"manager","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"register","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"registered","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"registeredCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"registeredUsers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"registrationFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"resetTime","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"restartRegistration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_minTime","type":"uint256"},{"internalType":"uint256","name":"_maxTime","type":"uint256"}],"name":"setCheckInTimes","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_registrationFee","type":"uint256"}],"name":"setRegistrationFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"stopRegistration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];
const contractABI = [{"inputs":[{"internalType":"uint256","name":"_registrationFee","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"timeRemaining","type":"uint256"}],"name":"CheckInTooEarly","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"timePassed","type":"uint256"}],"name":"CheckInTooLate","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"CheckedIn","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newFee","type":"uint256"}],"name":"FeeChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"contractBalance","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"rewardAmount","type":"uint256"}],"name":"InsufficientBalance","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"ManagerCannotRegister","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"Registered","type":"event"},{"anonymous":false,"inputs":[],"name":"RegistrationRestarted","type":"event"},{"anonymous":false,"inputs":[],"name":"RegistrationStopped","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"remainingHours","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"remainingMinutes","type":"uint256"}],"name":"RepeatedRegistration","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardSent","type":"event"},{"anonymous":false,"inputs":[],"name":"TimeReset","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"UserRemoved","type":"event"},{"inputs":[],"name":"checkIn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"checkedIn","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"checkedInCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getContractBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getRegisteredUsers","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isRegistrationOpen","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"lastRegistrationTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"manager","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"register","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"registered","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"registeredCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"registeredUsers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"registrationFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"resetTime","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"restartRegistration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_minTime","type":"uint256"},{"internalType":"uint256","name":"_maxTime","type":"uint256"}],"name":"setCheckInTimes","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_registrationFee","type":"uint256"}],"name":"setRegistrationFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"stopRegistration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];
// If you deploy a new contract, please change the address below
// const contractAddress = '0x66030219a871dF367aCC1259c27AD4f7F147d1a2';
const contractAddress = '0xe10f088bd815b4a05f4b39f6302bf302c321fb18';

const BasicButtons = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [manager, setManager] = useState("");
  const [registeredCount, setRegisteredCount] = useState(0);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [contractBalance, setContractBalance] = useState("0");
  // const [setRegistrationFee] = useState("0");
  // const [setMinTime] = useState(0);
  // const [setMaxTime] = useState(0);
  const [registrationFee, setRegistrationFee] = useState("0");
  const [minTime, setMinTime] = useState(0);
  const [maxTime, setMaxTime] = useState(0);
  const [newRegistrationFee, setNewRegistrationFee] = useState("");
  const [newMinTime, setNewMinTime] = useState("");
  const [newMaxTime, setNewMaxTime] = useState("");

  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        const ethereumProvider = await detectEthereumProvider();
        if (ethereumProvider) {
          await ethereumProvider.request({ method: 'eth_requestAccounts' });
          const web3Instance = new Web3(ethereumProvider);
          setWeb3(web3Instance);
          
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);
          const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);
          setContract(contractInstance);

          const managerAddress = await contractInstance.methods.manager().call();
          setManager(managerAddress);

          const registeredUserCount = await contractInstance.methods.registeredCount().call();
          setRegisteredCount(registeredUserCount);

          const checkedInUserCount = await contractInstance.methods.checkedInCount().call();
          setCheckedInCount(checkedInUserCount);

          const balance = await web3Instance.eth.getBalance(contractAddress);
          setContractBalance(parseFloat(web3Instance.utils.fromWei(balance, 'ether')).toFixed(18));

          const fee = await contractInstance.methods.registrationFee().call();
          setRegistrationFee(web3Instance.utils.fromWei(fee, 'ether'));
          setNewRegistrationFee(web3Instance.utils.fromWei(fee, 'ether'));

          const minimumTime = await contractInstance.methods.minTime().call();
          const maximumTime = await contractInstance.methods.maxTime().call();
          setMinTime(Number(minimumTime));
          setMaxTime(Number(maximumTime));
          setNewMinTime(Number(minimumTime));
          setNewMaxTime(Number(maximumTime));

          ethereumProvider.on('accountsChanged', (accounts) => {
            setAccount(accounts[0]);
            console.log(`Account changed to: ${accounts[0]}`);
          });
        } else {
          console.error("MetaMask 未安装");
        }
      } catch (error) {
        console.error("初始化 web3 时出错:", error);
      }
    };

    initializeWeb3();
  }, [setMaxTime,setMinTime,setRegistrationFee]);

  const isManager = () => {
    return account && account.toLowerCase() === manager.toLowerCase();
  };

  const handleSetRegistrationFee = async () => {
    if (!isManager()) {
      alert('Only the manager can perform this action.');
      return;
    }
    if (contract && account) {
      try {
        const feeInWei = web3.utils.toWei(newRegistrationFee, 'ether');
        await contract.methods.setRegistrationFee(feeInWei).send({ from: account });
        setRegistrationFee(newRegistrationFee);
        alert('Registration fee set successfully');
      } catch (error) {
        console.error("Failed to set registration fee:", error);
        alert('Failed to set registration fee');
      }
    }
  };

  const handleSetCheckInTimes = async () => {
    if (!isManager()) {
      alert('Only the manager can perform this action.');
      return;
    }
    if (contract && account) {
      try {
        await contract.methods.setCheckInTimes(newMinTime, newMaxTime).send({ from: account });
        setMinTime(newMinTime);
        setMaxTime(newMaxTime);
        alert('Check-in times set successfully');
      } catch (error) {
        console.error("Failed to set check-in times:", error);
        alert('Failed to set check-in times');
      }
    }
  };

  const handleResetTime = async () => {
    if (!isManager()) {
      alert('Only the manager can perform this action.');
      return;
    }
    if (contract && account) {
      try {
        await contract.methods.resetTime().send({ from: account });
        alert('Time reset successfully');
      } catch (error) {
        console.error("Failed to reset time:", error);
        alert('Failed to reset time');
      }
    }
  };

  const handleStopContract = async () => {
    if (!isManager()) {
      alert('Only the manager can perform this action.');
      return;
    }
    if (contract && account) {
      try {
        await contract.methods.stopRegistration().send({ from: account });
        alert('Contract stopped successfully');
      } catch (error) {
        console.error("Failed to stop contract:", error);
        alert('Failed to stop contract');
      }
    }
  };

  const handleStartContract = async () => {
    if (!isManager()) {
      alert('Only the manager can perform this action.');
      return;
    }
    if (contract && account) {
      try {
        await contract.methods.restartRegistration().send({ from: account });
        alert('Contract started successfully');
      } catch (error) {
        console.error("Failed to start contract:", error);
        alert('Failed to start contract');
      }
    }
  };

  const handleWithdraw = async () => {
    if (!isManager()) {
      alert('Only the manager can perform this action.');
      return;
    }
    if (contract && account) {
      try {
        await contract.methods.withdrawAll().send({ from: account });
        alert('Funds withdrawn successfully');
      } catch (error) {
        console.error("Failed to withdraw funds:", error);
        alert('Failed to withdraw funds');
      }
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Good Morning Management Page</Typography>
      <Typography variant="body1">Manager account: {String(manager)}</Typography>
      <Typography variant="body1">Number of users registered: {String(registeredCount)}</Typography>
      <Typography variant="body1">Number of users signed in: {String(checkedInCount)}</Typography>
      <Typography variant="body1">Contract balance: {String(contractBalance)} ETH</Typography>
      <Box sx={{ marginTop: '30px' }}>
        <TextField
          required
          id="outlined-required"
          label="Min Time (seconds)"
          value={newMinTime}
          onChange={(e) => setNewMinTime(e.target.value)}
        />
        <TextField
          required
          id="outlined-required"
          label="Max Time (seconds)"
          value={newMaxTime}
          onChange={(e) => setNewMaxTime(e.target.value)}
          sx={{ marginLeft: '15px' }}
        />
        <Button variant="outlined" onClick={handleSetCheckInTimes} sx={{ marginLeft: '15px', marginTop: '8px' }}>Set Check-In Times</Button>
      </Box>
      <Box sx={{ marginTop: '30px' }}>
        <TextField
          required
          id="outlined-required"
          label="Registration Fee (ETH)"
          value={newRegistrationFee}
          onChange={(e) => setNewRegistrationFee(e.target.value)}
        />
        <Button variant="outlined" onClick={handleSetRegistrationFee} sx={{ marginLeft: '15px', marginTop: '8px' }}>Set Registration Fee</Button>
      </Box>
      <Stack sx={{ marginTop: '30px' }} spacing={2} direction="row">
        <Button variant="contained" onClick={handleResetTime}>Reset Time</Button>
        <Button variant="contained" color="warning" onClick={handleStopContract}>Stop Contract</Button>
        <Button variant="contained" color="success" onClick={handleStartContract}>Start Contract</Button>
        <Button variant="contained" color="info" onClick={handleWithdraw}>Withdraw</Button>
      </Stack>
    </Box>
  );
}

export default BasicButtons;






