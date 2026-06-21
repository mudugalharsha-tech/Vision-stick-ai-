import { useState, useEffect, useRef, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { buildDetection } from '../utils/riskEngine';

const CONF_THRESHOLD = 0.60;
const FRAME_SKIP     = 3;

// Global cache for the model so it doesn't reload when navigating between pages
let globalModel = null;
let globalModelLoading = false;
let globalModelPromise = null;

export function useDetection() {
  const modelRef   = useRef(null);
  const rafRef     = useRef(null);
  const frameCount = useRef(0);
  const fpsCount   = useRef({ c: 0, last: Date.now() });

  const [modelReady,  setModelReady]  = useState(false);
  const [modelLoading,setModelLoading]= useState(false);
  const [modelError,  setModelError]  = useState(null);
  const [detections,  setDetections]  = useState([]);
  const [fps,         setFps]         = useState(0);
  const [framesTotal, setFramesTotal] = useState(0);

  // ── Load model ─────────────────────────────────────────
  const loadModel = useCallback(async () => {
    // 1. If already loaded globally, use it instantly
    if (globalModel) {
      modelRef.current = globalModel;
      setModelReady(true);
      return;
    }

    // 2. If currently loading in another instance, wait for that promise
    if (globalModelLoading) {
      setModelLoading(true);
      try {
        await globalModelPromise;
        modelRef.current = globalModel;
        setModelReady(true);
      } catch (err) {
        setModelError('Failed to load AI model: ' + err.message);
      } finally {
        setModelLoading(false);
      }
      return;
    }

    // 3. Otherwise, load it for the first time
    globalModelLoading = true;
    setModelLoading(true);
    setModelError(null);

    globalModelPromise = (async () => {
      try {
        await tf.ready();
        // Prefer WebGL for GPU acceleration
        await tf.setBackend('webgl');
        globalModel = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
        modelRef.current = globalModel;
        setModelReady(true);
      } catch (err) {
        // Fallback to WASM
        try {
          await tf.setBackend('wasm');
          globalModel = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
          modelRef.current = globalModel;
          setModelReady(true);
        } catch (e2) {
          setModelError('Failed to load AI model: ' + e2.message);
          throw e2;
        }
      } finally {
        globalModelLoading = false;
        setModelLoading(false);
      }
    })();
  }, []);

  useEffect(() => { loadModel(); }, []);

  // ── Run detection loop ─────────────────────────────────
  const startDetection = useCallback((videoEl, canvasEl, onDetections) => {
    if (!modelRef.current || !videoEl || !canvasEl) return;

    const W   = canvasEl.width;
    const H   = canvasEl.height;
    const ctx = canvasEl.getContext('2d');

    const loop = async () => {
      // FPS counter
      fpsCount.current.c++;
      const now = Date.now();
      if (now - fpsCount.current.last >= 1000) {
        setFps(fpsCount.current.c);
        fpsCount.current.c    = 0;
        fpsCount.current.last = now;
      }

      if (videoEl.readyState < 2) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      // Do not draw video frame to canvas anymore, we will use the native <video> element
      // and overlay the canvas on top of it.

      // Skip frames for performance
      frameCount.current++;
      setFramesTotal(f => f + 1);
      if (frameCount.current % FRAME_SKIP !== 0) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      try {
        const raw = await modelRef.current.detect(videoEl);
        
        // Scale bboxes from video intrinsic size to canvas size
        const vW = videoEl.videoWidth;
        const vH = videoEl.videoHeight;
        const scaleX = W / vW;
        const scaleY = H / vH;

        const dets = raw
          .filter(r => r.score >= CONF_THRESHOLD)
          .map(r => {
            const [x, y, w, h] = r.bbox;
            return buildDetection({
              class: r.class,
              score: r.score,
              bbox:  [x * scaleX, y * scaleY, w * scaleX, h * scaleY],
            }, W, H);
          })
          .sort((a, b) => b.score - a.score);

        setDetections(dets);
        onDetections?.(dets);
      } catch (err) {
        console.error('Detection error:', err);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    frameCount.current = 0;
    loop();
  }, []);

  const stopDetection = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setDetections([]);
  }, []);

  return {
    modelReady,
    modelLoading,
    modelError,
    detections,
    fps,
    framesTotal,
    startDetection,
    stopDetection,
    reloadModel: loadModel,
  };
}
