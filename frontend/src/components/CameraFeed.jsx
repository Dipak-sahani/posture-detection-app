import React, { useRef, useEffect,useState } from 'react';

const CameraFeed = ({ activity, setFeedback, setLoading }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsCameraOn(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      setIsCameraOn(false);
    }
  };

  const captureAndAnalyze = async () => {
  const canvas = document.createElement('canvas');
  canvas.width = videoRef.current.videoWidth;
  canvas.height = videoRef.current.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);


  // Convert to JPEG (quality 90)
  const blob = await new Promise(resolve => 
    canvas.toBlob(resolve, 'image/jpeg', 0.9)
  );

  const formData = new FormData();
  formData.append('file', blob, 'frame.jpg');
  formData.append('activity', activity);

  try {
    const response = await fetch('http://localhost:5000/analyze_frame', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();  // Parse JSON only if response is OK
    setFeedback(data);
  } catch (err) {
    console.error("Error:", err);
    setFeedback({ error: `Failed: ${err.message}` });
  }
};


  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="camera-feed">
      <h2>Camera Feed</h2>
      <div className="video-container">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          style={{ display: isCameraOn ? 'block' : 'none' }}
        />
        {/* <canvas 
          ref={canvasRef} 
          width="640" 
          height="480"
          style={{ display: isCameraOn ? 'block' : 'none' }}
        /> */}
        {!isCameraOn && <div className="camera-placeholder">Camera is off</div>}
      </div>
      
      <div className="camera-controls">
        {!isCameraOn ? (
          <button onClick={startCamera}>Start Camera</button>
        ) : (
          <>
            <button onClick={captureAndAnalyze}>Analyze Posture</button>
            <button onClick={stopCamera}>Stop Camera</button>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraFeed;