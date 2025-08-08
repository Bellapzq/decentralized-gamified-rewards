import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';
import './TimeTile.css';

const TimeTile = () => {
  const [localTime, setLocalTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => setLocalTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    navigate('/GoodMorning');
  };
  return (
    <Card className="time-tile" onClick={handleClick}>
      <CardContent>
        <div className="time-content">
          <AccessTimeIcon className="time-icon" />
          <Typography variant="h3" component="div">
            {localTime.toLocaleTimeString()}
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeTile;
