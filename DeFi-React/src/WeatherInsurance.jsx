import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import { Box, Typography, Stack, Button, Divider, Grid, CircularProgress } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TemperatureCards from './TemperatureCards';
import InsuranceDisclaimer from './InsuranceDisclaimer';
import contractABI from './HighTempInsurance.json';
// If you deploy a new contract, please change the address below
const contractAddress = '0x9744D14b074408411CC1191cAB3Eb3593026c653';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#d32f2f',
    },
  },
  typography: {
    h4: {
      fontWeight: 700,
    },
    body1: {
      fontSize: '1.1rem',
      lineHeight: 1.6,
    },
  },
});

export default function InsuranceApp() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [maxTemp, setMaxTemp] = useState(null);
  const [minTemp, setMinTemp] = useState(null);
  const [thresholdTemp, setThresholdTemp] = useState(null);
  const [insurancePremium, setInsurancePremium] = useState(null);
  const [defaultPayout, setDefaultPayout] = useState(null);
  const [insuranceStartDateInterval, setInsuranceStartDateInterval] = useState(null);
  const [insuranceDuration, setInsuranceDuration] = useState(null);
  const [insurance, setInsurance] = useState(null);
  const [insuranceStatus, setInsuranceStatus] = useState(false);
  const [loading, setLoading] = useState(true);

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

          // Get contract data
          const maxTemperature = await _contract.methods.maxTemp().call();
          const minTemperature = await _contract.methods.minTemp().call();
          const thresholdTemperature = await _contract.methods.thresholdTemp().call();
          const insuranceFee = await _contract.methods.insurancePremium().call();
          const defaultPay = await _contract.methods.defaultPayout().call();
          const startDateInterval = await _contract.methods.startDateIntervalInDays().call();
          const duration = await _contract.methods.insuranceDuration().call();

          // Convert temperature data to Celsius
          setMaxTemp(Number(maxTemperature) / 10);
          setMinTemp(Number(minTemperature) / 10);
          setThresholdTemp(Number(thresholdTemperature) / 10);

          setInsurancePremium(_web3.utils.fromWei(insuranceFee, 'ether'));
          setDefaultPayout(_web3.utils.fromWei(defaultPay, 'ether'));
          setInsuranceStartDateInterval(startDateInterval);
          setInsuranceDuration(duration);

          // Check if the user has already purchased insurance
          const userInsurance = await _contract.methods.insurances(_accounts[0]).call();
          setInsurance(userInsurance);
          setInsuranceStatus(userInsurance.premium > 0);

          setLoading(false);

          ethereumProvider.on('accountsChanged', (accounts) => {
            setAccount(accounts[0]);
            console.log(`Account changed to: ${accounts[0]}`);
          });

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

  const handlePurchaseInsurance = async () => {
    if (contract && account) {
      try {
        const valueInWei = web3.utils.toWei(insurancePremium, 'ether');
        await contract.methods.purchaseInsurance().send({ from: account, value: valueInWei });
        alert('Insurance purchased successfully');
        // Update insurance status
        const userInsurance = await contract.methods.insurances(account).call();
        setInsurance(userInsurance);
        setInsuranceStatus(userInsurance.premium > 0);
      } catch (error) {
        console.error("Failed to purchase insurance:", error);
        alert('Failed to purchase insurance');
      }
    }
  };

  const handleClaimPayout = async () => {
    if (contract && account && insurance) {
      try {
        // Get current timestamp
        const currentTime = Math.floor(Date.now() / 1000);

        // Check if insurance is valid
        const startDate = parseInt(insurance.startDate);
        const endDate = startDate + parseInt(insuranceDuration);

        if (currentTime < startDate) {
          alert('The insurance policy is not yet active.');
          return;
        }

        if (currentTime > endDate) {
          alert('The insurance policy has expired.');
          return;
        }

        // Check if temperature meets the payout condition
        const currentMaxTemp = parseFloat(maxTemp);
        const requiredTemp = parseFloat(thresholdTemp);
        if (currentMaxTemp < requiredTemp) {
          alert(`The current temperature of ${currentMaxTemp} °C did not reach the threshold temperature of ${requiredTemp} °C.`);
          return;
        }

        await contract.methods.claimPayout().send({ from: account });
        alert('Payout claimed successfully');

        // Update insurance status
        const userInsurance = await contract.methods.insurances(account).call();
        setInsurance(userInsurance);
      } catch (error) {
        console.error("Error claiming payout:", error);
        alert('Error claiming payout');
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ maxWidth: 1200, margin: 'auto', padding: 2 }}>
        <Typography variant="h4" gutterBottom>Hi-Temp Insurance</Typography>
        <Divider sx={{ marginBottom: 2 }} />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <InsuranceDisclaimer
                thresholdTemp={thresholdTemp}
                insurancePremium={insurancePremium}
                defaultPayout={defaultPayout}
                insuranceStartDateInterval={insuranceStartDateInterval}
                insuranceDuration={insuranceDuration}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ marginTop: { xs: 2, md: 11 }, textAlign: 'center' }}>
                <TemperatureCards maxTemp={maxTemp} minTemp={minTemp} />

                {!insuranceStatus ? (
                  <Box sx={{ marginTop: 3 }}>
                    <Box sx={{
                      border: '2px solid #1976d2',
                      borderRadius: 4,
                      padding: 2,
                      display: 'inline-block',
                      marginBottom: 3
                    }}>
                    <Typography variant="h6" sx={{ marginBottom: 1 }}>
                      Insurance Premium
                    </Typography>
                      <Typography variant="h5">
                        {insurancePremium} ETH
                      </Typography>
                    </Box>
                    <Stack spacing={2} direction="row" justifyContent="center">
                      <Button variant="contained" color="primary" onClick={handlePurchaseInsurance}>
                        Purchase Insurance
                      </Button>
                    </Stack>
                  </Box>
                ) : (
                  <Box sx={{ marginTop: 3, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ marginTop: 3 }}>Insurance Duration</Typography>
                    <Typography variant="body1" sx={{ marginTop: 1 }}>Start Date: {new Date(parseInt(insurance.startDate) * 1000).toLocaleString()}</Typography>
                    <Typography variant="body1" sx={{ marginTop: 1 }}>End Date: {insuranceDuration ? new Date((parseInt(insurance.startDate) + parseInt(insuranceDuration)) * 1000).toLocaleString() : 'Loading...'}</Typography>
                    <Button variant="contained" color="secondary" onClick={handleClaimPayout} disabled={insurance.claimed} sx={{ marginTop: 2 }}>
                      {insurance.claimed ? 'Payout Claimed' : 'Claim Payout'}
                    </Button>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>
    </ThemeProvider>
  );
}
