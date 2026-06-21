# VisionStick AI - Features & Future Roadmap

This document outlines the current capabilities of the VisionStick AI application, as well as the planned features and long-term roadmap for future development.

## 🌟 Current Features

### Core AI & Detection
- **Real-Time Object Detection**: Uses TensorFlow.js and the COCO-SSD model to detect objects directly in the browser with zero server-side latency.
- **Smart Risk Engine**: Calculates a risk score (0-100) based on object proximity and size.
- **Zone-Based Alerts**: Categorizes threats into Critical, Warning, Awareness, and Monitor zones.
- **Intelligent Cooldown System**: Prevents voice spam by implementing a 6-second cooldown for repeated object detections unless the object gets significantly closer.

### Accessibility & Feedback
- **Voice Output**: Uses the native Web Speech API to provide clear, spoken alerts (e.g., "Person approaching, close").
- **High-Contrast UI**: Designed for maximum visibility with a sleek, dark-mode aesthetic.
- **Responsive Design**: Works on desktops, tablets, and mobile phones seamlessly.

### Backend & Analytics (Full-Stack Mode)
- **User Authentication**: Secure JWT-based login, registration, and session management.
- **Session Tracking**: Logs when detection sessions start, end, and how long they last.
- **Analytics Dashboard**: Tracks the most frequently encountered objects and the total number of alerts generated over time.
- **Containerized Deployment**: Fully dockerized with Nginx, Node.js, and MongoDB for easy production deployment.

---

## 🚀 Future Development Plans

### Phase 1: Mobile & Hardware Integration
- **Progressive Web App (PWA)**: Allow users to install the app directly to their home screen for offline capability and native-app feel.
- **Haptic Feedback**: Integrate the browser Vibration API to provide physical buzzing feedback on mobile devices when objects are in the Critical zone.
- **Low-Light Enhancement**: Add brightness/contrast filters to the camera feed before running inferences to improve detection in dark environments.

### Phase 2: Advanced AI & Sensing
- **Depth & Distance Estimation**: Implement advanced heuristics or integrate with LiDAR/ToF sensors on modern smartphones to give exact distance metrics (e.g., "Car, 3 meters away").
- **Model Upgrades**: Transition from COCO-SSD to faster, more accurate models (like YOLOv8 or MediaPipe) tailored for edge devices.
- **Custom Object Training**: Allow users to train the model to recognize specific personal items (e.g., "My Keys", "My Front Door").

### Phase 3: Navigation & Safety
- **GPS & Wayfinding**: Combine object detection with turn-by-turn walking directions using Google Maps or Mapbox APIs.
- **Emergency SOS Feature**: Implement a voice-activated command or a large panic button that instantly texts a predefined emergency contact with the user's current GPS location.
- **Multi-Language Support (i18n)**: Expand the voice output engine to support multiple languages and dialects globally.

### Phase 4: Community & Cloud
- **Crowdsourced Hazard Mapping**: Allow devices to anonymously log static hazards (like a broken sidewalk or construction zone) to warn other VisionStick users in the area.
- **Caregiver Dashboard**: A separate portal where family members or caregivers can monitor route history, safety alerts, and battery status.
