import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import { Box, Button, Stack, TextField, Alert, Link, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
//See the line 221 if you deploys new contracts
// Lock and unlock contract ABIs
const lockContractABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "lock",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "Locked",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
const unlockContractABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "balance",
				"type": "uint256"
			}
		],
		"name": "DebugBalance",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "DebugOwner",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "required",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "available",
				"type": "uint256"
			}
		],
		"name": "DebugRequiredAmount",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "DebugTransfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address payable",
				"name": "receiver",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amountInWei",
				"type": "uint256"
			}
		],
		"name": "unlock",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "Unlocked",
		"type": "event"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	},
	{
		"inputs": [],
		"name": "getBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
// If you deploys new contracts, please change the contract addresses below
const lockContractSepoliaAddress = '0x19b158bA1d2798A4785B269beE4DCEE90cAe6308';
const unlockContractArbitrumAddress = '0x3A5C8EA4B6b2a2a61a9574222C0DD5Fe0A2F4225';

const lockContractArbitrumAddress = '0x4ED4867e3CD8F15b1AD2958c3efda9546394136B';
const unlockContractSepoliaAddress = '0xC060CA9F153B7071D76A863619bb3664C5d7ba44';


const CrossChain = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [status, setStatus] = useState('');
  const [txHash, setTxHash] = useState('');
  const [transferDirection, setTransferDirection] = useState(''); // 'L1ToL2' or 'L2ToL1'
  const [isLockDone, setIsLockDone] = useState(false);
  const [lockedReceiver, setLockedReceiver] = useState(null);
  const [lockedAmount, setLockedAmount] = useState(null);

  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        const provider = await detectEthereumProvider();
        if (provider) {
          await provider.request({ method: 'eth_requestAccounts' });
          const web3Instance = new Web3(provider);
          const accounts = await web3Instance.eth.getAccounts();
          setWeb3(web3Instance);
          setAccount(accounts[0]);
          provider.on('accountsChanged', (accounts) => {
            setAccount(accounts[0]);
          });
          console.log('Web3 initialized:', web3Instance);
          console.log('Account:', accounts[0]);
        } else {
          console.error('MetaMask is not installed');
        }
      } catch (error) {
        console.error('Error initializing web3:', error);
      }
    };

    initializeWeb3();
  }, []);

  const handleTransfer = async () => {
    setStatus('');
    setTxHash('');
    const amountInWei = web3.utils.toWei(amount, 'ether');
    try {
      if (transferDirection === 'L1ToL2') {
        await lockOnL1(amountInWei);
      } else if (transferDirection === 'L2ToL1') {
        await lockOnL2(amountInWei);
      }
    } catch (error) {
      console.error('Transfer failed:', error);
      setStatus(`Transfer failed: ${error.message}`);
    }
  };

  const lockOnL1 = async (amountInWei) => {
    try {
      const lockContract = new web3.eth.Contract(lockContractABI, lockContractSepoliaAddress);
      console.log('Lock contract (Sepolia) initialized:', lockContract);

      const tx = await lockContract.methods.lock(recipient).send({ from: account, value: amountInWei });
      console.log('Transaction sent:', tx);

      setTxHash(tx.transactionHash);
      setStatus('L1 to L2 lock successful');
      setLockedReceiver(recipient);
      setLockedAmount(amountInWei);
      setIsLockDone(true);
    } catch (error) {
      console.error('L1 lock failed:', error);
      setStatus(`L1 lock failed: ${error.message}`);
    }
  };

  const UnlockOnL2 = async () => {
    setStatus('');
    try {
      const provider = await detectEthereumProvider();
      const l2Web3 = new Web3(provider);
      const accounts = await l2Web3.eth.getAccounts();
      const l2Account = accounts[0];

      if (l2Account.toLowerCase() !== lockedReceiver.toLowerCase()) {
        setStatus('Error: Connected wallet address does not match the receiver address.');
        return;
      }

      const amountInWei = web3.utils.toWei(amount, 'ether');
      if (amountInWei !== lockedAmount) {
        setStatus('Error: Input amount does not match the locked amount.');
        return;
      }

      const unlockContractAddress = unlockContractArbitrumAddress;
      const unlockContract = new l2Web3.eth.Contract(unlockContractABI, unlockContractAddress);
      console.log('Unlock contract initialized:', unlockContract);

      const tx = await unlockContract.methods.unlock(l2Account, amountInWei).send({ from: l2Account });
      console.log('Unlock transaction sent:', tx);

      setTxHash(tx.transactionHash);
      setStatus('Unlock successful');
      setTimeout(() => {
        resetState();
      }, 5000); // 5 seconds
    } catch (error) {
      console.error('Unlock failed:', error);
      setStatus(`Unlock failed: ${error.message}`);
    }
  };

  const lockOnL2 = async (amountInWei) => {
    try {
        const provider = await detectEthereumProvider();
        if (!provider) {
            throw new Error('MetaMask is not installed');
        }

        const l2Web3 = new Web3(provider);
        const accounts = await l2Web3.eth.getAccounts();
        const l2Account = accounts[0];

        if (!l2Account) {
        throw new Error('No L2 account found');
        }

        console.log('L2 Account:', l2Account);
    
        const lockContract = new l2Web3.eth.Contract(lockContractABI, lockContractArbitrumAddress);
        console.log('Lock contract (Arbitrum) initialized:', lockContract);

        // Check the balance and gas price
        const balance = await l2Web3.eth.getBalance(l2Account);
        console.log('L2 Account Balance:', balance);

        const gasPrice = await l2Web3.eth.getGasPrice();
        console.log('Current Gas Price:', gasPrice);

        const gasEstimate = await lockContract.methods.lock(recipient).estimateGas({ from: l2Account, value: amountInWei });
        console.log('Estimated Gas:', gasEstimate);

        const tx = await lockContract.methods.lock(recipient).send({
            from: l2Account,
            value: amountInWei,
            gas: gasEstimate,
            gasPrice
          });

        console.log('Transaction sent:', tx);

        setTxHash(tx.transactionHash);
        setStatus('L2 to L1 lock successful');
        setLockedReceiver(recipient);
        setLockedAmount(amountInWei);
        setIsLockDone(true);
    } catch (error) {
        console.error('L2 lock failed:', error);
        setStatus(`L2 lock failed: ${error.message}`);
    }
  };

  const UnlockOnL1 = async () => {
    setStatus('');
    try {
      const provider = await detectEthereumProvider();
      const l2Web3 = new Web3(provider);
      const accounts = await l2Web3.eth.getAccounts();
      const l2Account = accounts[0];

      if (l2Account.toLowerCase() !== lockedReceiver.toLowerCase()) {
        setStatus('Error: Connected wallet address does not match the receiver address.');
        return;
      }

      const amountInWei = web3.utils.toWei(amount, 'ether');
      if (amountInWei !== lockedAmount) {
        setStatus('Error: Input amount does not match the locked amount.');
        return;
      }

      const unlockContractAddress = unlockContractSepoliaAddress;
      const unlockContract = new l2Web3.eth.Contract(unlockContractABI, unlockContractAddress);
      console.log('Unlock contract initialized:', unlockContract);

      const tx = await unlockContract.methods.unlock(l2Account, amountInWei).send({ from: l2Account });
      console.log('Unlock transaction sent:', tx);

      setTxHash(tx.transactionHash);
      setStatus('Unlock successful');
      setTimeout(() => {
        resetState();
      }, 5000); // 5 seconds
    } catch (error) {
      console.error('Unlock failed:', error);
      setStatus(`Unlock failed: ${error.message}`);
    }
  };

  const resetState = () => {
    setIsLockDone(false);
    setTransferDirection('');
    setAmount('');
    setRecipient('');
    setLockedReceiver(null);
    setLockedAmount(null);
  };

  const handleTransferDirectionChange = (event) => {
    setTransferDirection(event.target.value);
    setStatus('');
    setTxHash('');
    setIsLockDone(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <FormControl variant="outlined" sx={{ minWidth: 300, marginBottom: 2 }}>
        <InputLabel>Transfer Direction</InputLabel>
        <Select value={transferDirection} onChange={handleTransferDirectionChange} label="Transfer Direction">
          <MenuItem value="L1ToL2">Ethereum Sepolia(Layer1) to Arbitrum Sepolia(Layer2)</MenuItem>
          <MenuItem value="L2ToL1">Arbitrum Sepolia(Layer2) to Ethereum Sepolia(Layer1)</MenuItem>
        </Select>
      </FormControl>
      {transferDirection && !isLockDone && (
        <Box sx={{ width: '400px', margin: '0 auto', textAlign: 'center' }}>
          <TextField
            label="Recipient Address"
            variant="outlined"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            sx={{ marginBottom: 2 }}
            fullWidth
          />
          <TextField
            label="Amount (ETH)"
            variant="outlined"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={{ marginBottom: 2 }}
            fullWidth
          />
          <Stack spacing={2} direction="row" justifyContent="center">
            <Button variant="contained" onClick={handleTransfer}>Lock</Button>
          </Stack>
          {status && (
          <Alert severity={status.includes('successful') ? 'success' : 'error'} sx={{ marginTop: 2 }}>
            {status}
            {txHash && (
              <Link
                href={transferDirection === 'L1ToL2' ? `https://sepolia.arbiscan.io/tx/${txHash}` : `https://sepolia.etherscan.io/tx/${txHash}` }
                target="_blank"
                rel="noopener"
                sx={{ wordBreak: 'break-all', display: 'block', marginTop: 1 }}
              >
                Lock Transaction Hash: {txHash}
              </Link>
            )}
          </Alert>
        )}
        </Box>
      )}
      {isLockDone && (
        <Box sx={{ margin: '0 auto', textAlign: 'center', marginTop: 2 }}>
          <Alert severity="info" sx={{ marginTop: 2 }}>
            {transferDirection === 'L1ToL2' ? 
              "Lock successful. Please switch Metamask to the 'Arbitrum Sepolia' network and unlock funds." : 
              "Lock successful. Please switch Metamask to the 'Sepolia' network and unlock funds."
            }
          </Alert>
          <Box sx={{ marginTop: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <TextField
                label="Recipient Address"
                variant="outlined"
                value={lockedReceiver}
                disabled
                sx={{ marginBottom: 2, width: '400px' }}
                fullWidth
            />
            <TextField
                label="Amount (ETH)"
                variant="outlined"
                value={web3.utils.fromWei(lockedAmount, 'ether')}
                disabled
                sx={{ marginBottom: 2, width: '400px' }}
                fullWidth
            />
            {txHash && (
              <Link
                href={transferDirection === 'L1ToL2' ? `https://sepolia.etherscan.io/tx/${txHash}` : `https://sepolia.arbiscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener"
                sx={{ wordBreak: 'break-all', display: 'block', marginTop: 1 }}
              >
                Lock Transaction Hash: {txHash}
              </Link>
            )}
          </Box>
          {transferDirection === 'L1ToL2' ? (
            <Stack spacing={2} direction="row" justifyContent="center" sx={{ marginTop: 4 }}>
              <Button variant="contained" onClick={UnlockOnL2}>Unlock on Arbitrum</Button>
            </Stack>
          ) : (
            <Stack spacing={2} direction="row" justifyContent="center" sx={{ marginTop: 4 }} >
              <Button variant="contained" onClick={UnlockOnL1}>Unlock on Ethereum</Button>
            </Stack>
          )}
        </Box>
      )}
      {status.includes('Unlock successful') && (
        <Box sx={{ margin: '0 auto', textAlign: 'center', marginTop: 2 }}>
          <Alert severity="success" sx={{ marginTop: 2 }}>
            Unlock successful.<br />
            Transfer Successful.
          </Alert>
          <Link
            href={transferDirection === 'L1ToL2' ? `https://sepolia.arbiscan.io/tx/${txHash}` : `https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener"
            sx={{ wordBreak: 'break-all', display: 'block', marginTop: 1 }}
          >
            Unlock Transaction Hash: {txHash}
          </Link>
        </Box>
      )}
    </Box>
  );
};

export default CrossChain;
