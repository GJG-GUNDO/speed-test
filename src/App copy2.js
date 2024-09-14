// import React, { useState, useEffect } from 'react';
// import SpeedTest from '@cloudflare/speedtest';
// import './App.css';

// const formatNumber = (num, decimals) => {
//   if (num == null || isNaN(num)) return "0";
//   return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
// };

// const bpsToMbps = (bps) => formatNumber(bps / 1e6, 2);

// const calculateAverage = (points) => {
//   if (!points || points.length === 0) return 0;
//   const sum = points.reduce((acc, point) => acc + point.bps, 0);
//   return sum / points.length;
// };

// const formatLatencyResults = (points) => {
//   if (!points || points.length === 0) return <tr><td colSpan="2">No latency data available</td></tr>;
  
//   return points.map((point, index) => (
//     <tr key={index}>
//       <td>{index + 1}</td>
//       <td>{formatNumber(point, 2)} ms</td> 
//     </tr>
//   ));
// };

// const formatJitterResults = (points) => {
//   if (!points || points.length === 0) return <tr><td colSpan="2">No jitter data available</td></tr>;
  
//   return points.map((point, index) => (
//     <tr key={index}>
//       <td>{index + 1}</td>
//       <td>{formatNumber(point, 2)} ms</td> 
//     </tr>
//   ));
// };

// function App() {
//   const [results, setResults] = useState({
//     download: {},
//     upload: {},
//     unloadedLatency: null,
//     unloadedJitter: null,
//     unloadedLatencyPoints: [],
//     unloadedJitterPoints: [],
//     downloadedLatency: null,
//     downloadedJitter: null,
//     downloadedLatencyPoints: [],
//     downloadedJitterPoints: [],
//     uploadedLatency: null,
//     uploadedJitter: null,
//     uploadedLatencyPoints: [],
//     uploadedJitterPoints: [],
//     packetLoss: null,
//     packetLossDetails: null,
//     scores: null,
//   });
//   const [isRunning, setIsRunning] = useState(false);
//   const [error, setError] = useState(null);
//   const [testSizeIndex, setTestSizeIndex] = useState(0);
//   const [progress, setProgress] = useState("Initializing...");
//   const sizes = [1e5, 1e6, 1e7, 2.5e7, 1e8, 5e7];
  
//   const startTest = () => {
//     setIsRunning(true);
//     setError(null);

//     const size = sizes[testSizeIndex];
//     setProgress(`Testing size ${size}...`);

//     const speedtest = new SpeedTest({
//       autoStart: true,
//       measurements: [
//         { type: 'latency', numPackets: 10 },
//         { type: 'download', bytes: size, count: 10 },
//         { type: 'upload', bytes: size, count: 10 },
//       ],
//     });

//     speedtest.onProgress = (progress) => {
//       // Handle progress updates
//       console.log('Test progress:', progress);
//     };

//     speedtest.onFinish = (results) => {
//       const downloadPoints = results.getDownloadBandwidthPoints();
//       const uploadPoints = results.getUploadBandwidthPoints();
//       const unloadedLatency = results.getUnloadedLatency();
//       const unloadedJitter = results.getUnloadedJitter();
//       const unloadedLatencyPoints = results.getUnloadedLatencyPoints ? results.getUnloadedLatencyPoints() : [];
//       const unloadedJitterPoints = results.getUnloadedJitterPoints ? results.getUnloadedJitterPoints() : [];
//       const downloadedLatency = results.getDownLoadedLatency();
//       const downloadedJitter = results.getDownLoadedJitter();
//       const downloadedLatencyPoints = results.getDownloadedLatencyPoints ? results.getDownloadedLatencyPoints() : [];
//       const downloadedJitterPoints = results.getDownloadedJitterPoints ? results.getDownloadedJitterPoints() : [];
//       const uploadedLatency = results.getUpLoadedLatency();
//       const uploadedJitter = results.getUpLoadedJitter();
//       const uploadedLatencyPoints = results.getUpLoadedLatencyPoints ? results.getUpLoadedLatencyPoints() : [];
//       const uploadedJitterPoints = results.getUpLoadedJitterPoints ? results.getUpLoadedJitterPoints() : [];
//       const packetLoss = results.getPacketLoss ? results.getPacketLoss() : 'No data';
//       const packetLossDetails = results.getPacketLossDetails ? results.getPacketLossDetails() : 'No details available';
//       const scores = results.getScores();

//       // Update results in real-time
//       setResults(prevResults => ({
//         ...prevResults,
//         download: { ...prevResults.download, [size]: downloadPoints },
//         upload: { ...prevResults.upload, [size]: uploadPoints },
//         unloadedLatency,
//         unloadedJitter,
//         unloadedLatencyPoints,
//         unloadedJitterPoints,
//         downloadedLatency,
//         downloadedJitter,
//         downloadedLatencyPoints,
//         downloadedJitterPoints,
//         uploadedLatency,
//         uploadedJitter,
//         uploadedLatencyPoints,
//         uploadedJitterPoints,
//         packetLoss,
//         packetLossDetails,
//         scores,
//       }));

//       if (testSizeIndex < sizes.length - 1) {
//         setTestSizeIndex(testSizeIndex + 1);
//         setProgress(`Testing size ${sizes[testSizeIndex + 1]}...`);
//         startTest(); // Start the next test
//       } else {
//         setIsRunning(false);
//         setProgress("Test completed.");
//       }
//     };

//     speedtest.onError = (err) => {
//       console.error("Cloudflare SpeedTest error:", err);
//       setError(`Cloudflare SpeedTest error: ${err.message}`);
//       setIsRunning(false);
//       setProgress("Test failed.");
//     };

//     speedtest.play();
//   };

//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       if (isRunning) {
//         console.log('Test timed out');
//         setError('Test timed out. Please try again.');
//         setIsRunning(false);
//         setProgress("Test timed out.");
//       }
//     }, 300000); // Increased timeout to 300 seconds

//     return () => clearTimeout(timeout);
//   }, [isRunning]);

//   const testResults = (type, size) => {
//     const points = results[type][size] || [];
//     const average = calculateAverage(points);
//     return {
//       count: points.length,
//       average: formatNumber(average, 2),
//       max: points.length ? bpsToMbps(Math.max(...points.map((p) => p.bps))) : 'No data',
//       min: points.length ? bpsToMbps(Math.min(...points.map((p) => p.bps))) : 'No data',
//     };
//   };

//   const formatTableRows = (points) => {
//     if (!points || points.length === 0) return <tr><td colSpan="4">No data available</td></tr>;
  
//     return points.map((point, index) => (
//       <tr key={index}>
//         <td>{index + 1}</td>
//         <td>{bpsToMbps(point.bps)}</td>
//       </tr>
//     ));
//   };

//   const renderMetrics = (type, sizes) => {
//     return sizes.map((size) => {
//       const { count, average, max, min } = testResults(type, size);
//       const points = results[type][size] || [];
    
//       return (
//         <div key={size} className="metric-report">
//           <h4>{sizeToLabel(size)} Test Results</h4>

//           <p>
//             <strong>Number of Tests:</strong> {count > 0 ? count : 'No tests performed'}
//           </p>
//           <p>
//             <strong>Average Speed:</strong> {average} Mbps
//           </p>
//           <p>
//             <strong>Max Speed:</strong> {max}
//           </p>
//           <p>
//             <strong>Min Speed:</strong> {min}
//           </p>

//           <table className="results-table">
//             <thead>
//               <tr>
//                 <th>Test Number</th>
//                 <th>Speed (Mbps)</th>
//               </tr>
//             </thead>
//             <tbody>
//               {formatTableRows(points)}
//             </tbody>
//             <tfoot>
//               <tr>
//                 <td><strong>Average:</strong></td>
//                 <td>{formatNumber(average, 2)} Mbps</td>
//               </tr>
//               <tr>
//                 <td><strong>Max:</strong></td>
//                 <td>{max}</td>
//               </tr>
//               <tr>
//                 <td><strong>Min:</strong></td>
//                 <td>{min}</td>
//               </tr>
//             </tfoot>
//           </table>
//         </div>
//       );
//     });
//   };

//   const sizeToLabel = (size) => {
//     switch (size) {
//       case 1e5:
//         return '100kB';
//       case 1e6:
//         return '1MB';
//       case 1e7:
//         return '10MB';
//       case 2.5e7:
//         return '25MB';
//       case 1e8:
//         return '100MB';
//       default:
//         return 'Unknown';
//     }
//   };

//   return (
//     <div className="App">
//       <h1>Speed Test Results</h1>
//       <button onClick={startTest} disabled={isRunning}>Start Speed Test</button>
//       <p>{progress}</p>
//       {error && <p style={{ color: 'red' }}>{error}</p>}
      
//       <div className="metrics-container">
//         {renderMetrics('download', sizes)}
//         {renderMetrics('upload', sizes)}
//       </div>
//     </div>
//   );
// }

// export default App;
