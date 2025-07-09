import React from 'react';

const PostureFeedback = ({ feedback, activity }) => {
  if (!feedback) return null;
  
  if (feedback.error) {
    return <div className="feedback error">{feedback.error}</div>;
  }
  
  return (
    <div className={`feedback ${feedback.analysis?.bad_posture ? 'bad' : 'good'}`}>
      <h3>Posture Analysis</h3>
      
      {activity === 'squat' && (
        <>
          <p>Back Angle: {feedback.analysis?.angles?.back_angle?.toFixed(1) || 'N/A'}°</p>
          {feedback.analysis?.angles?.back_angle < 150 && (
            <p className="warning">⚠️ Back angle too small (should be ≥150°)</p>
          )}
        </>
      )}
      
      {activity === 'sitting' && (
        <>
          
          
          {feedback.analysis?.angles?.neck_angle > 30 && (
            <p className="warning">⚠️ Neck bending too much (should be ≤30°)</p>
          )}
          
          {feedback.analysis?.angles?.back_angle < 160 && (
            <p className="warning">⚠️ Back not straight (should be ≥160°)</p>
          )}
        </>
      )}
      
      {feedback.analysis?.messages?.map((msg, i) => (
        <p key={i} className="warning">⚠️ {msg}</p>
      ))}
      
      {feedback.analysis && !feedback.analysis.bad_posture && (
        <p className="success">✅ Good posture detected!</p>
      )}
    </div>
  );
};

export default PostureFeedback;