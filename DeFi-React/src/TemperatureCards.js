import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';

const TemperatureCards = ({ maxTemp, minTemp }) => {
  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center">
      <Grid item>
        <Card>
          <CardContent>
            <Typography variant="h7">Today Max Temp</Typography>
            <Typography variant="h5" color="secondary">{maxTemp} °C</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item>
        <Card>
          <CardContent>
            <Typography variant="h7">Today Min Temp</Typography>
            <Typography variant="h5" color="primary">{minTemp} °C</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default TemperatureCards;
