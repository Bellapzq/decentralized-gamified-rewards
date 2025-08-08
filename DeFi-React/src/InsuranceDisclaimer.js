import React, { useState } from 'react';
import { Typography, Card, CardContent, Divider, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

const InsuranceDisclaimer = ({
  thresholdTemp,
  insurancePremium,
  defaultPayout,
  insuranceStartDateInterval,
  insuranceDuration
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleToggleDetails = () => {
    setShowDetails(prevShowDetails => !prevShowDetails);
  };

  return (
    <Card sx={{ margin: 3, padding: 2, backgroundColor: '#f9f9f9', boxShadow: 3 }}>
      <CardContent>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" color="primary" gutterBottom>Insurance Information</Typography>
          <IconButton onClick={handleToggleDetails}>
            {showDetails ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </div>
        <Divider sx={{ marginBottom: 2 }} />
        {showDetails && (
          <>
            <Typography variant="body1">
              Welcome to our Hi(gh)-Temperature Insurance! This policy provides coverage for temperature-related events. A payout will be triggered if the maximum temperature exceeds the threshold of {Number(thresholdTemp).toFixed(1)} °C during the insured period.
            </Typography>
            <Typography variant="body2">
              <strong>Insurance Premium:</strong> {insurancePremium} ETH
            </Typography>
            <Typography variant="body2">
              <strong>Default Payout:</strong> {defaultPayout} ETH
            </Typography>
            <Typography variant="body2">
              <strong>Insurance Starts In:</strong> {Number(insuranceStartDateInterval)} days
            </Typography>
            <Typography variant="body2">
              <strong>Insurance Duration:</strong> {Number(insuranceDuration) / (60 * 60 * 24)} days
            </Typography>
            <Typography variant="body1" sx={{ marginTop: 2 }}>
              Please ensure that the policy details are understood before purchasing. Contact our customer service for any inquiries.
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default InsuranceDisclaimer;
