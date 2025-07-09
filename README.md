# Posture Detection App

A full-stack web application that analyzes posture in real-time using rule-based logic with MediaPipe and OpenCV. Detects bad posture during sitting and squatting activities.

![App Screenshot](https://via.placeholder.com/800x400?text=Posture+Detection+App+Screenshot)

## Features
- **Real-time posture analysis** from webcam or video upload
- **Rule-based detection** for:
  - Sitting: Neck bending, back hunching
  - Squatting: Knee-over-toe, squat depth
- **Visual feedback** with pose landmarks
- **Cross-platform** (works on Windows, macOS, Linux)

## Tech Stack
- **Frontend**: React.js
- **Backend**: Flask (Python)
- **Computer Vision**: MediaPipe, OpenCV
- **Deployment**: Docker

## Installation

### Prerequisites
- Docker
- Node.js (for frontend development)
- Python 3.10 (for backend development)

### With Docker (Recommended)
```bash
# Clone the repository
git clone https://github.com/yourusername/posture-detection-app.git
cd posture-detection-app

# Build and run containers
docker-compose up --build