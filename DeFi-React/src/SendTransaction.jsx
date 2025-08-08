import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { Container, TextField, Button, Typography, Box, Paper, Alert, Link } from '@mui/material';

const SendTransaction = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [txHash, setTxHash] = useState('');

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await web3.eth.getAccounts();
          const balance = await web3.eth.getBalance(accounts[0]);
          setWeb3(web3);
          setAccount(accounts[0]);
          setBalance(web3.utils.fromWei(balance, 'ether'));
        } catch (error) {
          console.error('Error connecting to MetaMask', error);
        }
      } else {
        console.error('MetaMask not detected');
      }
    };

    initWeb3();
  }, []);

  const handleSendTransaction = async () => {
    if (web3 && account) {
      try {
        const tx = await web3.eth.sendTransaction({
          from: account,
          to: recipient,
          value: web3.utils.toWei(amount, 'ether'),
          gas: 21000
        });
        setStatus('Transaction successful:');
        setTxHash(tx.transactionHash);
      } catch (error) {
        setStatus(`Transaction failed: ${error.message}`);
        setTxHash('');
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 5 }}>
        <Typography variant="h4" gutterBottom>
          Transaction
        </Typography>
        <Box mb={2}>
          <Typography variant="subtitle1">Account: {account}</Typography>
          <Typography variant="subtitle1">Balance: {balance} ETH</Typography>
        </Box>
        <Box mb={2}>
          <Typography variant="h6" gutterBottom>
            Send Transaction Requirement
          </Typography>
          <TextField
            fullWidth
            label="Recipient Address"
            variant="outlined"
            margin="normal"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <TextField
            fullWidth
            label="Amount in ETH"
            variant="outlined"
            margin="normal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSendTransaction}
            sx={{ marginTop: 2 }}
          >
            Send
          </Button>
        </Box>
        {status && (
          <Alert severity={status.includes('successful') ? 'success' : 'error'}>
            {status}{' '}
            {txHash && (
              <Link
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener"
                sx={{ wordBreak: 'break-all' }}
              >
                {txHash}
              </Link>
            )}
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default SendTransaction;
