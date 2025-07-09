from flask import Flask, request, jsonify
import cv2
import numpy as np
import mediapipe as mp
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(min_detection_confidence=0.7, min_tracking_confidence=0.7)

def calculate_angle(a, b, c):
    """Calculate angle between three points (in degrees)"""
    a, b, c = np.array(a), np.array(b), np.array(c)
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians*180.0/np.pi)
    return min(angle, 360-angle)

@app.route('/analyze_frame', methods=['POST'])
def analyze_frame():
    try:
        file = request.files['file']
        img = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = pose.process(img_rgb)

        if not results.pose_landmarks:
            return jsonify({'error': 'No person detected'}), 200

        landmarks = results.pose_landmarks.landmark
        activity = request.form.get('activity', 'sitting')
        
        # Key points extraction
        nose = landmarks[mp_pose.PoseLandmark.NOSE.value]
        left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
        right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
        left_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
        right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]
        left_knee = landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value]
        right_knee = landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value]
        left_ankle = landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value]
        right_ankle = landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value]

        analysis = {'bad_posture': False, 'messages': []}

        if activity == 'sitting':
            # Neck angle (ideal: <25°)
            ls_neck_angle = calculate_angle(
                [left_shoulder.x ,left_shoulder.y],
                [right_shoulder.x, right_shoulder.y],
                [nose.x, nose.y]  # Point above nose
            )

            rs_neck_angle =calculate_angle(
                [right_shoulder.x, right_shoulder.y],
                [left_shoulder.x ,left_shoulder.y],
                [nose.x, nose.y]  # Point above nose
            )
            if ls_neck_angle < 35 :
                analysis['bad_posture'] = True
                analysis['messages'].append(f"Neck bent {int(ls_neck_angle)}° (should be <30°)")
            if  rs_neck_angle <35:
                analysis['bad_posture'] = True
                analysis['messages'].append(f"Neck bent {int(rs_neck_angle)}° (should be <30°)")

            # Back angle (ideal: >160°)
            back_angle = calculate_angle(
                [(left_shoulder.x + right_shoulder.x)/2, (left_shoulder.y + right_shoulder.y)/2],
                [(left_hip.x + right_hip.x)/2, (left_hip.y + right_hip.y)/2],
                [(left_hip.x + right_hip.x)/2, (left_hip.y + right_hip.y)/2 + 0.1]  # Point below hips
            )
            if back_angle < 150:
                analysis['bad_posture'] = True
                analysis['messages'].append(f"Back hunched {int(back_angle)}° (should be >160°)")

        elif activity == 'squat':
            # Knee over toe check
            if (left_knee.x > left_ankle.x) or (right_knee.x > right_ankle.x):
                analysis['bad_posture'] = True
                analysis['messages'].append("Knees over toes")

            # Hip-knee-ankle alignment (ideal: 80-100° at bottom)
            squat_angle = calculate_angle(
                [left_hip.x, left_hip.y],
                [left_knee.x, left_knee.y],
                [left_ankle.x, left_ankle.y]
            )
            if squat_angle < 70 or squat_angle > 110:
                analysis['bad_posture'] = True
                analysis['messages'].append(f"Poor squat depth ({int(squat_angle)}°)")

        return jsonify({
            'analysis': analysis,
            'landmarks': {str(i): [lm.x, lm.y] for i, lm in enumerate(landmarks)}
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)