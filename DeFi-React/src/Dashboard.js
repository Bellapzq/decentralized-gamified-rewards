import React from 'react';
import './Dashboard.css';
import TimeTile from './TimeTile';
import WeatherTile from './WeatherWidget';
import EthGasTile from './EthGasTile';
import RainyDaysTile from './RainyDaysTile';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="tile-container">
        <div className="tile-full">
          <TimeTile />
        </div>
        <div className="tile-row">
          <div className="tile"><WeatherTile /></div>
          <div className="tile"><EthGasTile /></div>
          <div className="tile"><RainyDaysTile /></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
