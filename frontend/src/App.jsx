import React, { useState } from 'react';
import CameraFeed from './components/CameraFeed';
import VideoUpload from './components/VideoUpload';
import PostureFeedback from './components/PostureFeedback';
import './App.css';

function App() {
  const [activity, setActivity] = useState('sitting');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="app">
      <h1>Posture Detection App</h1>
      
      <div className="activity-selector">
        <label>
          Activity:
          <select value={activity} onChange={(e) => setActivity(e.target.value)}>
            <option value="sitting">Desk Sitting</option>
            <option value="squat">Squat</option>
          </select>
        </label>
      </div>
      
      <div className="input-methods">
        <CameraFeed 
          activity={activity} 
          setFeedback={setFeedback} 
          setLoading={setLoading}
        />

        {/* this part if you want to send a video */}


        {/* <VideoUpload 
          activity={activity} 
          setFeedback={setFeedback} 
          setLoading={setLoading}
        /> */}
      </div>
      
      {loading && <div className="loading">Analyzing posture...</div>}
      
      <PostureFeedback feedback={feedback} activity={activity} />
    </div>
  );
}

export default App;