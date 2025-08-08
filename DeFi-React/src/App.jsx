import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DrawerAppBar from './DrawerAppBar';
import WeatherInsurance from './WeatherInsurance'
import GoodMorning from './GoodMorning'
import GMManagement from './GMManager'
import SendTransaction from './SendTransaction'
import Dashboard from './Dashboard';
import CrossChain from './CrossChain'
// "/GoodMorning/management" only can be reached with typing
function App() {
  return (
    <Router>
      <DrawerAppBar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/GoodMorning" element={<GoodMorning />} />
        <Route path="/GoodMorning/management" element={<GMManagement />} />
        <Route path="/SendTransaction" element={<SendTransaction />} />
        <Route path="/WeatherInsurance" element={<WeatherInsurance />} />
        <Route path="/CrossChain" element={<CrossChain />} />
      </Routes>
    </Router>
  );
}

export default App;