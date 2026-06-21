import { useRef, useState, useCallback, useEffect } from 'react';

export function useCamera() {
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const [cameraOn,  setCameraOn]  = useState(false);
  const [cameraErr, setCameraErr] = useState(null);

  const startCamera = useCallback(async () => {
    setCameraErr(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width:      { ideal: 1280, max: 1920 },
          height:     { ideal: 720,  max: 1080 },
          frameRate:  { ideal: 30 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
      return true;
    } catch (err) {
      const msg = err.name === 'NotAllowedError'
        ? 'Camera permission denied. Please allow camera access in your browser settings.'
        : err.name === 'NotFoundError'
        ? 'No camera found on this device.'
        : `Camera error: ${err.message}`;
      setCameraErr(msg);
      setCameraOn(false);
      return false;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), [stopCamera]);

  return { videoRef, cameraOn, cameraErr, startCamera, stopCamera };
}
