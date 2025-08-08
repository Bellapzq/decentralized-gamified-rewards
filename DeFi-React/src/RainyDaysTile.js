import React, { useState, useEffect } from 'react';
import './RainyDaysTile.css';

const RainyDaysTile = () => {
  const [rainyDays, setRainyDays] = useState(0);

  useEffect(() => {
    const fetchRainyDays = async () => {
      try {
        // Please replace this with the specific URL of the backend service.
        const response = await fetch('http://localhost:5001/rainy-days');
        const data = await response.json();
        setRainyDays(data.rainy_days);
      } catch (error) {
        console.error('Failed to fetch rainy days data:', error);
      }
    };

    fetchRainyDays();
  }, []);

  return (
    <div className="tile">
      <h3>Number of rainy days in 30 days:</h3>
      <h1>{rainyDays}</h1>
    </div>
  );
};

export default RainyDaysTile;
