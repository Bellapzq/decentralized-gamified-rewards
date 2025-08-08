import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import './EthGasTile.css';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PedalBikeIcon from '@mui/icons-material/PedalBike';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';


const EthGasTile = () => {
  const [gasPrices, setGasPrices] = useState({
    SafeGasPrice: 0,
    ProposeGasPrice: 0,
    FastGasPrice: 0
  });

  useEffect(() => {
    const fetchGasPrices = async () => {
      // Please replace this with the specific URL of the backend service.
      const response = await fetch('http://localhost:5002/eth-gas-price');
      const data = await response.json();
      setGasPrices(data);
    };

    fetchGasPrices();
    const interval = setInterval(fetchGasPrices, 10000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="tile">
      <CardContent>
        <Typography variant="h" component="div">
          ETH Gas Prices
        </Typography>
        <div className="gas-prices">
          <div className="gas-price">
            <PedalBikeIcon /> Safe: {gasPrices.SafeGasPrice} Gwei
          </div>
          <div className="gas-price">
            <AirportShuttleIcon /> Propose: {gasPrices.ProposeGasPrice} Gwei
          </div>
          <div className="gas-price">
            <RocketLaunchIcon /> Fast: {gasPrices.FastGasPrice} Gwei
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EthGasTile;
