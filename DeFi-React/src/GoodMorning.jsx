import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import { Typography, Box, Container, CircularProgress, Button, Stack, Collapse, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const contractABI = [{"inputs":[{"internalType":"uint256","name":"_registrationFee","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"timeRemaining","type":"uint256"}],"name":"CheckInTooEarly","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"timePassed","type":"uint256"}],"name":"CheckInTooLate","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"CheckedIn","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newFee","type":"uint256"}],"name":"FeeChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"contractBalance","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"rewardAmount","type":"uint256"}],"name":"InsufficientBalance","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"ManagerCannotRegister","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"Registered","type":"event"},{"anonymous":false,"inputs":[],"name":"RegistrationRestarted","type":"event"},{"anonymous":false,"inputs":[],"name":"RegistrationStopped","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"remainingHours","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"remainingMinutes","type":"uint256"}],"name":"RepeatedRegistration","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardSent","type":"event"},{"anonymous":false,"inputs":[],"name":"TimeReset","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"UserRemoved","type":"event"},{"inputs":[],"name":"checkIn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"checkedIn","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"checkedInCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getContractBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getRegisteredUsers","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isRegistrationOpen","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"lastRegistrationTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"manager","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"register","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"registered","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"registeredCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"registeredUsers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"registrationFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"resetTime","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"restartRegistration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_minTime","type":"uint256"},{"internalType":"uint256","name":"_maxTime","type":"uint256"}],"name":"setCheckInTimes","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_registrationFee","type":"uint256"}],"name":"setRegistrationFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"stopRegistration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];
// If you deploy a new contract, please change the address below
const contractAddress = '0xe10f088bd815b4a05f4b39f6302bf302c321fb18';

export default function WakeUpRewardSystem() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [registrationFee, setRegistrationFee] = useState("0");
  const [manager, setManager] = useState(null);
  const [minTime, setMinTime] = useState(null);
  const [maxTime, setMaxTime] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        const ethereumProvider = await detectEthereumProvider();
        if (ethereumProvider) {
          await ethereumProvider.request({ method: 'eth_requestAccounts' });
          const _web3 = new Web3(ethereumProvider);
          const _accounts = await _web3.eth.getAccounts();
          const _contract = new _web3.eth.Contract(contractABI, contractAddress);

          setWeb3(_web3);
          setAccount(_accounts[0]);
          setContract(_contract);

          const fee = await _contract.methods.registrationFee().call();
          setRegistrationFee(_web3.utils.fromWei(fee, 'ether')); // Convert to ETH unit

          const _manager = await _contract.methods.manager().call();
          setManager(_manager);

          const _minTime = await _contract.methods.minTime().call();
          const _maxTime = await _contract.methods.maxTime().call();
          setMinTime(Number(_minTime));
          setMaxTime(Number(_maxTime));

          const _isRegistrationOpen = await _contract.methods.isRegistrationOpen().call();
          setIsRegistrationOpen(_isRegistrationOpen);

          const _isRegistered = await _contract.methods.registered(_accounts[0]).call();
          setIsRegistered(_isRegistered);

          if (_isRegistered) {
            const lastRegistrationTime = Number(await _contract.methods.lastRegistrationTime(_accounts[0]).call());
            setStartTime(lastRegistrationTime);
          }

          // Listen for account changes
          ethereumProvider.on('accountsChanged', (accounts) => {
            setAccount(accounts[0]);
            console.log(`Account changed to: ${accounts[0]}`);
          });

          setLoading(false);
        } else {
          console.error("MetaMask is not installed");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error initializing web3:", error);
        setLoading(false);
      }
    };

    initializeWeb3();
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h} h` : ''}${h > 0 && m > 0 ? ', ' : ''}${m > 0 ? `${m} min` : ''}${(h > 0 || m > 0) && s > 0 ? ', ' : ''}${s > 0 ? `${s} s` : ''}`;
  };

  const handleRegister = async () => {
    if (contract && account) {
      try {
        if (!isRegistrationOpen) {
          alert("Registration is currently closed.");
          return;
        }

        if (account.toLowerCase() === manager.toLowerCase()) {
          alert("The manager cannot register.");
          return;
        }

        const alreadyRegistered = await contract.methods.registered(account).call();
        if (alreadyRegistered) {
          const lastRegistrationTime = Number(await contract.methods.lastRegistrationTime(account).call());
          const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
          const timeSinceLastRegistration = currentTime - lastRegistrationTime;
          if (timeSinceLastRegistration < 24 * 60 * 60) {
            const remainingTime = 24 * 60 * 60 - timeSinceLastRegistration;
            const remainingHours = Math.floor(remainingTime / 3600);
            const remainingMinutes = Math.floor((remainingTime % 3600) / 60);
            alert(`You have already registered today. Please register again in ${remainingHours} hours ${remainingMinutes} minutes.`);
            return;
          }
        }

        const valueInWei = web3.utils.toWei(registrationFee, 'ether'); // Convert ETH to Wei
        await contract.methods.register().send({ from: account, value: valueInWei });
        alert(`Registration successful, please check in after ${formatTime(minTime)} and before ${formatTime(maxTime)}.`);

        setIsRegistered(true);
        const lastRegistrationTime = Number(await contract.methods.lastRegistrationTime(account).call());
        setStartTime(lastRegistrationTime);
      } catch (error) {
        console.error("Registration failed:", error);
        handleContractError(error);
      }
    }
  };

  const handleCheckIn = async () => {
    if (contract && account) {
      try {
        if (!isRegistrationOpen) {
          alert("Registration is currently closed.");
          return;
        }

        const isRegistered = await contract.methods.registered(account).call();
        if (!isRegistered) {
          alert('You are not registered.');
          return;
        }

        const checkedIn = await contract.methods.checkedIn(account).call();
        if (checkedIn) {
          alert('You have already checked in.');
          return;
        }

        const lastRegistrationTime = Number(await contract.methods.lastRegistrationTime(account).call());
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        const timeSinceRegistration = currentTime - lastRegistrationTime;

        if (timeSinceRegistration < minTime) {
          const timeRemaining = minTime - timeSinceRegistration;
          alert(`Check-in time has not started yet. Please wait ${formatTime(timeRemaining)}.`);
          return;
        }

        if (timeSinceRegistration > maxTime) {
          const timePassed = timeSinceRegistration - maxTime;
          alert(`Your check-in time has passed. It is ${formatTime(timePassed)} too late.`);
          return;
        }

        await contract.methods.checkIn().send({ from: account });
        alert('Check-in successful');
      } catch (error) {
        console.error("Check-in failed:", error);
        handleContractError(error);
      }
    }
  };

  const handleContractError = (error) => {
    if (error.message.includes("Incorrect registration fee")) {
      alert("Incorrect registration fee. Please send the correct amount.");
    } else if (error.message.includes("Manager cannot register")) {
      alert("The manager cannot register.");
    } else if (error.message.includes("You are not registered")) {
      alert("You are not registered.");
    } else if (error.message.includes("You have already checked in")) {
      alert("You have already checked in.");
    } else if (error.message.includes("Check-in time has not started yet")) {
      alert("Check-in time has not started yet.");
    } else if (error.message.includes("Your check-in time has passed")) {
      alert("Your check-in time has passed.");
    } else {
      alert(`An unknown error occurred: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', mt: 4 }}>
      <Box sx={{
        borderRadius: 4,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <Typography variant="h5" gutterBottom>
          Good Morning Reward
          <IconButton onClick={() => setIsDescriptionOpen(!isDescriptionOpen)} size="small">
            {isDescriptionOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Typography>
        <Collapse in={isDescriptionOpen}>
          <Typography variant="body1" gutterBottom>
            Welcome to our Good Morning Reward System! Register before sleeping and pay a registration fee of {registrationFee} ETH. Wake up after {formatTime(minTime)} and check in within the allowed period of {formatTime(maxTime - minTime)} to receive a reward. If you fail to check in on time, your registration fee will be distributed among the others.
          </Typography>
        </Collapse>
      </Box>
      <Box sx={{
        borderRadius: 4,
        padding: 2,
        marginTop: 2,
        display: 'inline-block'
      }}>
        <Typography variant="h6" gutterBottom>
          {isRegistered ? 'Check-in Time Window:' : 'Registration Fee:'}
        </Typography>
        <Typography variant="h5" gutterBottom>
          {isRegistered ? (
            <Box>
              <Box component="span" fontWeight="fontWeightBold">Start:</Box> {new Date(startTime * 1000 + minTime * 1000).toLocaleString()}<br />
              <Box component="span" fontWeight="fontWeightBold">End:</Box> {new Date(startTime * 1000 + maxTime * 1000).toLocaleString()}
            </Box>
          ) : `${registrationFee} ETH`}
        </Typography>
      </Box>
      <Stack spacing={2} direction="row" justifyContent="center" sx={{ mt: 4 }}>
        <Button variant="contained" onClick={isRegistered ? handleCheckIn : handleRegister} disabled={!isRegistrationOpen}
          size="large"
          sx={{
            width: '160px',
            height: '50px',
            fontSize: '18px'
          }}
        >
          {isRegistered ? 'Check In' : 'Register'}
        </Button>
      </Stack>
    </Container>
  );
}
