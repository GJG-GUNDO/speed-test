import React, { useState, useEffect } from 'react';
import SpeedTest from '@cloudflare/speedtest';
import './App.css';

// Custom function to format numbers without using toFixed()
const formatNumber = (num, decimals) => {
  if (num == null || isNaN(num)) return "0";
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

const bpsToMbps = (bps) => formatNumber(bps / 1e6, 2);

const calculateAverage = (results) => {
  if (!results || results.length === 0) return 0;
  const sum = results.reduce((acc, point) => acc + point.bps, 0);
  return sum / results.length / 1e6; // Convert to Mbps
};
const formatLatencyResults = (points) => {
  // console.log('Latency Points results:', points);

  if (!points || points.length === 0) return <tr><td colSpan="2">No latency data available</td></tr>;
  
  return points.map((point, index) => (
    <tr key={index}>
      <td>{index + 1}</td>
      <td>{formatNumber(point, 2)} ms</td> {/* Directly using point as it's the latency value */}
    </tr>
  ));
};


const formatJitterResults = (points) => {
  // console.log('Jitter Points results:', points);

  if (!points || points.length === 0) return <tr><td colSpan="2">No jitter data available</td></tr>;
  
  return points.map((point, index) => (
    <tr key={index}>
      <td>{index + 1}</td>
      <td>{formatNumber(point, 2)} ms</td> {/* Directly using point as it's the jitter value */}
    </tr>
  ));
};


function App() {
  const [results, setResults] = useState({
    download: [],
    upload: [],
    unloadedLatency: null,
    unloadedJitter: null,
    unloadedLatencyPoints: [],
    unloadedJitterPoints: [],
    downloadedLatency: null,
    downloadedJitter: null,
    downloadedLatencyPoints: [],
    downloadedJitterPoints: [],
    uploadedLatency: null,
    uploadedJitter: null,
    uploadedLatencyPoints: [],
    uploadedJitterPoints: [],
    packetLoss: null,
    packetLossDetails: null,
    scores: null,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);

  const startTest = () => {
    setIsRunning(true);
    setError(null);

    const speedtest = new SpeedTest({
      autoStart: true,
      measurements: [
        { type: 'latency', numPackets: 10 },
        { type: 'download', bytes: 1e5, count: 10 }, // 100 KB
        { type: 'download', bytes: 1e6, count: 10 }, // 1 MB
        { type: 'download', bytes: 1e7, count: 10 }, // 10 MB
        { type: 'download', bytes: 2.5e7, count: 10 }, // 25 MB
        { type: 'download', bytes: 1e8, count: 10 }, // 100 MB
        { type: 'upload', bytes: 1e5, count: 10 },   // 100 KB
        { type: 'upload', bytes: 1e6, count: 10 },   // 1 MB
        { type: 'upload', bytes: 1e7, count: 10 },   // 10 MB
        { type: 'upload', bytes: 2.5e7, count: 10 }, // 25 MB
        { type: 'upload', bytes: 5e7, count: 10 },   // 50 MB
      ],
    });

    speedtest.onFinish = (results) => {
      // console.log('SpeedTest results:', results); // Log results for debugging

      const downloadPoints = results.getDownloadBandwidthPoints();
      const uploadPoints = results.getUploadBandwidthPoints();
      const unloadedLatency = results.getUnloadedLatency();
      const unloadedJitter = results.getUnloadedJitter();
      const unloadedLatencyPoints = results.getUnloadedLatencyPoints ? results.getUnloadedLatencyPoints() : [];
      const unloadedJitterPoints = results.getUnloadedJitterPoints ? results.getUnloadedJitterPoints() : [];
      const downloadedLatency = results.getDownLoadedLatency();
      const downloadedJitter = results.getDownLoadedJitter();
      const downloadedLatencyPoints = results.getDownloadedLatencyPoints ? results.getDownloadedLatencyPoints() : [];
      const downloadedJitterPoints = results.getDownloadedJitterPoints ? results.getDownloadedJitterPoints() : [];
      const uploadedLatency = results.getUpLoadedLatency();
      const uploadedJitter = results.getUpLoadedJitter();
      const uploadedLatencyPoints = results.getUpLoadedLatencyPoints ? results.getUpLoadedLatencyPoints() : [];
      const uploadedJitterPoints = results.getUpLoadedJitterPoints ? results.getUpLoadedJitterPoints() : [];
      const packetLoss = results.getPacketLoss ? results.getPacketLoss() : 'No data'; // Get packet loss ratio
      const packetLossDetails = results.getPacketLossDetails ? results.getPacketLossDetails() : 'No details available'; // Get packet loss details
      const scores = results.getScores();

      console.log('Packet Loss:', results.getPacketLoss);
      console.log('Packet Loss Details:', results.getPacketLossDetails);

  

      setResults({
        download: downloadPoints,
        upload: uploadPoints,
        unloadedLatency,
        unloadedJitter,
        unloadedLatencyPoints,
        unloadedJitterPoints,
        downloadedLatency,
        downloadedJitter,
        downloadedLatencyPoints,
        downloadedJitterPoints,
        uploadedLatency,
        uploadedJitter,
        uploadedLatencyPoints,
        uploadedJitterPoints,
        packetLoss,
        packetLossDetails,
        scores,
      });
      setIsRunning(false);
    };

    speedtest.onError = (err) => {
      console.error("Cloudflare SpeedTest error:", err);
      setError(`Cloudflare SpeedTest error: ${err.message}`);
      setIsRunning(false);
    };

    speedtest.play();
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isRunning) {
        console.log('Test timed out');
        setError('Test timed out. Please try again.');
        setIsRunning(false);
      }
    }, 300000); // Increased timeout to 300 seconds

    return () => clearTimeout(timeout);
  }, [isRunning]);

  const testResults = (type, size) => {
    const points = results[type].filter((p) => p.bytes === size);
    // console.log(`${type} ${size} results:`, points); // Log test results for debugging
    const average = calculateAverage(points);
    return {
      count: points.length,
      average: formatNumber(average, 2),
      max: points.length ? bpsToMbps(Math.max(...points.map((p) => p.bps))) : 'No data',
      min: points.length ? bpsToMbps(Math.min(...points.map((p) => p.bps))) : 'No data',
    };
  };

  const formatTableRows = (points) => {
    if (!points || points.length === 0) return <tr><td colSpan="4">No data available</td></tr>;
  
    return points.map((point, index) => (
      <tr key={index}>
        <td>{index + 1}</td>
        <td>{bpsToMbps(point.bps)}</td>
      </tr>
    ));
  };

  const renderMetrics = (type, sizes) => {
    return sizes.map((size) => {
      const { count, average, max, min } = testResults(type, size);
      const points = results[type].filter((p) => p.bytes === size);
    
      return (
        <div key={size} className="metric-report">
                    <h4>{sizeToLabel(size)} Test Results</h4>

          <p>
            <strong>Number of Tests:</strong> {count > 0 ? count : 'No tests performed'}
          </p>
          <p>
            <strong>Average Speed:</strong> {average} Mbps
          </p>
          <p>
            <strong>Max Speed:</strong> {max}
          </p>
          <p>
            <strong>Min Speed:</strong> {min}
          </p>

      <table className="results-table">
        <thead>
          <tr>
            <th>Test Number</th>
            <th>Speed (Mbps)</th>
          </tr>
        </thead>
        <tbody>
          {formatTableRows(points)}
        </tbody>
        <tfoot>
          <tr>
            <td><strong>Average:</strong></td>
            <td>{formatNumber(average, 2)} Mbps</td>
          </tr>
          <tr>
            <td><strong>Max:</strong></td>
            <td>{max}</td>
          </tr>
          <tr>
            <td><strong>Min:</strong></td>
            <td>{min}</td>
          </tr>
        </tfoot>
      </table>
        </div>
        
      );
    });
  };

  const sizeToLabel = (size) => {
    switch (size) {
      case 1e5:
        return '100kB';
      case 1e6:
        return '1MB';
      case 1e7:
        return '10MB';
      case 2.5e7:
        return '25MB';
      case 1e8:
        return '100MB';
      case 5e7:
        return '50MB';
      default:
        return '';
    }
  };

  return (
    <div className="container">
      <h1 className="title">Speed Test</h1>
      <button className="start-button" onClick={startTest} disabled={isRunning}>
        {isRunning ? 'Running...' : 'Start Test'}
      </button>
      {error && <p className="error-message">Error: {error}</p>}
      {!isRunning && results && (
        <div className="results">
          <h2 className="results-title">Results</h2>

          <h3>Overall Averages</h3>
          <p>
            <strong>Download:</strong>{' '}
            {formatNumber(calculateAverage(results.download), 2)} Mbps
          </p>
          <p>
            <strong>Upload:</strong>{' '}
            {formatNumber(calculateAverage(results.upload), 2)} Mbps
          </p>

          <h3>Download Measurements</h3>
          {renderMetrics('download', [1e5, 1e6, 1e7, 2.5e7, 1e8])}

          <h3>Upload Measurements</h3>
          {renderMetrics('upload', [1e5, 1e6, 1e7, 2.5e7, 5e7])}

          <h3>Unloaded Latency & Jitter</h3>
            <p><strong>Unloaded Latency:</strong> {results.unloadedLatency}</p>
            <p><strong>Unloaded Jitter:</strong> {results.unloadedJitter}</p>
          
          
          <h3>Unloaded Latency</h3>

          <table className="latency-table">
            <thead>
              <tr>
                <th>Packet #</th>
                <th>Latency (ms)</th>
              </tr>
            </thead>
            <tbody>{formatLatencyResults(results.unloadedLatencyPoints)}</tbody>
          </table>
        

          <h3>Loaded Latency & Jitter (Download)</h3>
          <p><strong>Download Latency:</strong> {results.downloadedLatency}</p>
          <p><strong>Download Jitter:</strong> {results.downloadedJitter}</p>
         

          <h3>Loaded Latency & Jitter (Upload)</h3>
          <p><strong>Download Latency:</strong> {results.uploadedLatency}</p>
          <p><strong>Download Jitter:</strong> {results.uploadedJitter}</p>
          <table className="latency-table">
            <thead>
              <tr>
                <th>Packet #</th>
                <th>Latency (ms)</th>
              </tr>
            </thead>
            <tbody>{formatLatencyResults(results.uploadedLatencyPoints)}</tbody>
          </table>
         
         

<h3>Overall Scores</h3>
{results.scores && (
  <div>
   

    {/* Adding scores for gaming, streaming, and rtc */}
    {results.scores.gaming && (
      <div>
        <h4>Gaming</h4>
        <p><strong>Points:</strong> {results.scores.gaming.points}</p>
        <p><strong>Classification:</strong> {results.scores.gaming.classificationName} ({results.scores.gaming.classificationIdx})</p>
      </div>
    )}
    
    {results.scores.streaming && (
      <div>
        <h4>Streaming</h4>
        <p><strong>Points:</strong> {results.scores.streaming.points}</p>
        <p><strong>Classification:</strong> {results.scores.streaming.classificationName} ({results.scores.streaming.classificationIdx})</p>
      </div>
    )}

    {results.scores.rtc && (
      <div>
        <h4>RTC (Real-Time Communication)</h4>
        <p><strong>Points:</strong> {results.scores.rtc.points}</p>
        <p><strong>Classification:</strong> {results.scores.rtc.classificationName} ({results.scores.rtc.classificationIdx})</p>
      </div>
    )}
  </div>
)}

        </div>
      )}
    </div>
  );
}

export default App;
