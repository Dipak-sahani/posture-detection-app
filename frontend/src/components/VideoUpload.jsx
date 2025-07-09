import React, { useState, useRef } from 'react';

const VideoUpload = ({ activity, setFeedback, setLoading }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
    }
  };

  const analyzeFrame = async () => {
    if (!videoRef.current) return;
    
    setLoading(true);
    
    // Capture current frame
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    // Send to backend
    try {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');
      formData.append('activity', activity);
      
      const response = await fetch('http://localhost:5000/analyze_frame', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      setFeedback(data);
      
      // Draw landmarks on canvas
      if (data.landmarks && canvasRef.current) {
        const feedbackCtx = canvasRef.current.getContext('2d');
        feedbackCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        feedbackCtx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Draw key points
        for (const [key, value] of Object.entries(data.landmarks)) {
          if (value.x && value.y) {
            const x = value.x * canvasRef.current.width;
            const y = value.y * canvasRef.current.height;
            
            feedbackCtx.beginPath();
            feedbackCtx.arc(x, y, 5, 0, 2 * Math.PI);
            feedbackCtx.fillStyle = 'red';
            feedbackCtx.fill();
          }
        }
      }
    } catch (err) {
      console.error("Error analyzing frame:", err);
      setFeedback({ error: 'Failed to analyze posture' });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadedMetadata = () => {
    // Set up video information when metadata is loaded
    setTotalFrames(Math.floor(videoRef.current.duration * 30)); // Assuming 30fps
  };

  const handleTimeUpdate = () => {
    setCurrentFrame(Math.floor(videoRef.current.currentTime * 30));
  };

  const seekToFrame = (frame) => {
    if (videoRef.current) {
      videoRef.current.currentTime = frame / 30;
    }
  };

  return (
    <div className="video-upload">
      <h2>Video Upload</h2>
      
      <input type="file" accept="video/*" onChange={handleFileChange} />
      
      {videoUrl && (
        <>
          <div className="video-container">
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
            />
            <canvas 
              ref={canvasRef} 
              width="640" 
              height="480"
            />
          </div>
          
          <div className="video-controls">
            <button onClick={analyzeFrame}>Analyze Current Frame</button>
            
            {totalFrames > 0 && (
              <div className="frame-slider">
                <input
                  type="range"
                  min="0"
                  max={totalFrames}
                  value={currentFrame}
                  onChange={(e) => seekToFrame(e.target.value)}
                />
                <span>Frame: {currentFrame}/{totalFrames}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default VideoUpload;