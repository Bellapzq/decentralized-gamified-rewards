import React, { useEffect } from 'react';
import './WeatherWidget.css';

const WeatherWidget = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://weatherwidget.io/js/widget.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="tile">
      <a
        className="weatherwidget-io"
        href="https://forecast7.com/en/n33d87151d21/sydney/"
        data-label_1="SYDNEY"
        data-label_2="WEATHER"
        data-font="Arial"
        data-icons="Climacons"
        data-mode="Forecast"
        data-days="3"
        data-theme="blue-mountains"
      >
        SYDNEY WEATHER
      </a>
    </div>
  );
};

export default WeatherWidget;
