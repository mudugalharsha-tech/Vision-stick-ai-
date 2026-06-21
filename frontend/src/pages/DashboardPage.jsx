import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

import { useCamera }    from '../hooks/useCamera';
import { useDetection } from '../hooks/useDetection';
import { useVoice }     from '../hooks/useVoice';
import { useCooldown }  from '../hooks/useCooldown';
import { buildSummary } from '../utils/riskEngine';
import { renderDetections } from '../utils/canvasRenderer';
import { useToast } from '../components/Toast';

const C = {
  bg:'#111318', surface:'#1c1e26', surface2:'#22242f', border:'#2a2d3a',
  blue:'#3b5bdb', blueL:'#748ffc', text:'#e8eaf0', muted:'#8b8fa8', dim:'#555870',
  green:'#40c057', orange:'#fd7e14', red:'#fa5252', yellow:'#fab005',
};
const MONO = 'JetBrains Mono, monospace';

export default function DashboardPage() {
  const { toast }  = useToast();
  const canvasRef  = useRef(null);
  const sessionId  = useRef(null);
  const alertBuf   = useRef([]);
  const detSnap    = useRef([]);
  const clearTimer = useRef(null);
  const pathClearAnnounced = useRef(true);

  const [running,   setRunning]   = useState(false);
  const [videoReady,setVideoReady]  = useState(false);
  const [alertHist, setAlertHist] = useState([]);
  const [tab,       setTab]       = useState('objects');
  const [dets,      setDets]      = useState([]);

  const { videoRef, cameraOn, cameraErr, startCamera, stopCamera } = useCamera();
  const {
    modelReady, modelLoading, modelError,
    fps, framesTotal, startDetection, stopDetection,
  } = useDetection();
  const { muted, currentMsg, toggleMute, speakDetections, speakStatus, repeat, say, stop: stopVoice } = useVoice();
  const { should, record, evict, reset: resetCooldown } = useCooldown();

  useEffect(() => { detSnap.current = dets; }, [dets]);

  // ── Handle new detections from TF.js ─────────────────
  const onDetections = useCallback((newDets) => {
    const ids = new Set(newDets.map(d => d.id));
    evict(ids);

    // Filter by cooldown
    const announceable = newDets.filter(d => should(d.id, d.distance, d.zone));

    if (announceable.length > 0) {
      const msg = speakDetections(newDets, announceable);
      if (msg) {
        announceable.forEach(d => record(d.id, d.distance, d.zone));
        const entry = {
          msg,
          time: new Date().toLocaleTimeString(),
          color: announceable[0]?.rm?.color ?? C.green,
          zone:  announceable[0]?.zone ?? 'WARNING',
        };
        setAlertHist(h => [entry, ...h.slice(0, 19)]);
        alertBuf.current.push({
          message:    msg,
          objectType: announceable[0]?.type,
          zone:       announceable[0]?.zone,
          path:       announceable[0]?.path,
          distance:   announceable[0]?.distance,
          riskScore:  announceable[0]?.score,
        });

        // Streaming alert to backend removed for standalone prototype
      }
    }

    // "Path clear" after 3s with no detections
    if (newDets.length === 0) {
      if (!pathClearAnnounced.current && !clearTimer.current) {
        clearTimer.current = setTimeout(() => {
          say('Path clear.');
          pathClearAnnounced.current = true;
          clearTimer.current = null;
        }, 3000);
      }
    } else {
      pathClearAnnounced.current = false;
      if (clearTimer.current) { clearTimeout(clearTimer.current); clearTimer.current = null; }
    }

    setDets(newDets);

    // Render bounding boxes onto canvas
    const cv = canvasRef.current;
    if (cv) {
      const ctx = cv.getContext('2d');
      renderDetections(ctx, cv.width, cv.height, newDets);
    }
  }, [evict, should, speakDetections, record, say]);

  // ── Start session ─────────────────────────────────────
  const handleStart = useCallback(async () => {
    const camOk = await startCamera();

    // Removed backend session creation for standalone prototype
    sessionId.current = Date.now().toString(); // Use a local ID instead

    alertBuf.current = [];
    resetCooldown();
    setAlertHist([]);
    setDets([]);
    pathClearAnnounced.current = true;
    setRunning(true);
    say('VisionStick AI activated. Navigation assistance is now active.', true);
  }, [startCamera, resetCooldown, say, toast]);

  // ── Stop session ──────────────────────────────────────
  const handleStop = useCallback(async () => {
    stopDetection();
    stopCamera();
    stopVoice();
    if (clearTimer.current) { clearTimeout(clearTimer.current); clearTimer.current = null; }
    setRunning(false);
    setDets([]);

    // Removed backend session ending for standalone prototype
    sessionId.current = null;
  }, [stopDetection, stopCamera, stopVoice, framesTotal]);

  // ── Start TF.js detection once camera is on & model ready ─
  useEffect(() => {
    if (!running || !cameraOn || !videoReady || !modelReady || !videoRef.current || !canvasRef.current) return;
    startDetection(videoRef.current, canvasRef.current, onDetections);
    return () => stopDetection();
  }, [running, cameraOn, videoReady, modelReady, startDetection, stopDetection, onDetections]);

  // Cleanup on unmount
  useEffect(() => () => handleStop(), []);

  // ── Derived state ─────────────────────────────────────
  const summary   = useMemo(() => buildSummary(dets), [dets]);
  const crit      = dets.filter(d => d.zone === 'CRITICAL');
  const warn      = dets.filter(d => d.zone === 'WARNING');
  const isCrit    = crit.length > 0;
  const pathData  = useMemo(() => ['left','center','right'].map(p => ({
    p,
    count:   dets.filter(d => d.path === p).length,
    blocked: dets.some(d => d.path === p && (d.zone === 'CRITICAL' || d.zone === 'WARNING')),
  })), [dets]);

  // ── Render ────────────────────────────────────────────
  return (
    <div style={{ padding: '20px 16px' }}>

      {/* Title */}
      <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>
        Live Detection Dashboard
      </h1>
      <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.55, marginBottom: 18 }}>
        Intelligent environment analysis with zone-based voice guidance.
      </p>

      {/* Model status */}
      {modelError && (
        <div className="card" style={{ border:'1px solid rgba(250,82,82,0.35)', background:'rgba(250,82,82,0.07)', marginBottom:12 }}>
          <div style={{ fontSize:13, color:C.red, fontWeight:600, marginBottom:4 }}>⚠ AI Model Error</div>
          <div style={{ fontSize:12, color:C.muted }}>{modelError}</div>
        </div>
      )}

      {/* Camera view */}
      <div style={{
        borderRadius: 14, overflow: 'hidden', position: 'relative',
        border: `1px solid ${isCrit ? 'rgba(250,82,82,0.45)' : C.border}`,
        background: '#0d0f14', marginBottom: 12,
        transition: 'border-color 0.3s',
      }}>
        {running && <div className="scan-line"/>}
        <video ref={videoRef} onPlaying={() => setVideoReady(true)} style={{ width:'100%', height:'100%', display:'block', objectFit:'contain' }} playsInline muted autoPlay/>
        <canvas
          ref={canvasRef}
          width={440} height={280}
          style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', display:'block', pointerEvents:'none', objectFit:'contain' }}
        />

        {/* Offline state */}
        {!running && (
          <div style={{
            position:'absolute', inset:0,
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            background:'rgba(13,15,20,0.95)', gap:10,
          }}>
            <div style={{ fontSize:48, color:C.dim }}>📷</div>
            <div style={{ fontSize:16, color:C.muted, fontWeight:600 }}>Camera is offline</div>
            <div style={{ fontSize:13, color:C.dim }}>Tap "Start Detection" to begin</div>
          </div>
        )}

        {/* Camera error overlay */}
        {cameraErr && running && (
          <div style={{
            position:'absolute', top:8, left:8, right:8,
            background:'rgba(253,126,20,0.15)', border:'1px solid rgba(253,126,20,0.35)',
            borderRadius:8, padding:'8px 11px', fontSize:11, color:'#fdba74', fontFamily:MONO,
          }}>⚠ {cameraErr}</div>
        )}

        {/* Distance zone legend */}
        <div style={{ position:'absolute', bottom:7, left:7, display:'flex', gap:5, flexWrap:'wrap' }}>
          {[['<1m','#fa5252'],['1–3m','#fd7e14'],['3–5m','#fab005']].map(([l,c])=>(
            <div key={l} style={{
              background:'rgba(13,15,20,0.85)', border:`1px solid ${c}44`,
              borderRadius:4, padding:'2px 7px', fontSize:8, color:c, fontFamily:MONO,
            }}>● {l}</div>
          ))}
        </div>

        {/* FPS chip */}
        {running && (
          <div style={{
            position:'absolute', top:8, right:8,
            background:'rgba(13,15,20,0.82)', border:`1px solid ${C.border}`,
            borderRadius:5, padding:'2px 8px', fontFamily:MONO, fontSize:9, color:C.blueL,
          }}>{fps} fps</div>
        )}
      </div>

      {/* Start / Stop button */}
      <button
        className={`btn ${running ? 'btn-danger' : 'btn-primary'}`}
        onClick={running ? handleStop : handleStart}
        disabled={modelLoading || !!modelError}
        style={{ marginBottom:12, fontSize:15 }}
      >
        <span style={{ fontSize:18 }}>{running ? '⏹' : '⏻'}</span>
        {modelLoading ? 'Loading AI Model…' : running ? 'Stop Detection' : 'Start Detection'}
      </button>

      {/* Environment summary */}
      <div className="card">
        <div className="card-label">⊙ Environment Summary</div>
        <div style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:8 }}>{summary.text}</div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div className="dot" style={{
              background: summary.color,
              boxShadow: `0 0 7px ${summary.color}`,
            }}/>
            <span style={{ fontSize:13, color:C.muted }}>{summary.risk}</span>
          </div>
          <span style={{ fontSize:20 }}>{summary.color === '#40c057' ? '🛡' : '⚠️'}</span>
        </div>
      </div>

      {/* Voice alert */}
      <div className="card" style={{
        background: isCrit ? 'rgba(250,82,82,0.07)' : C.surface,
        border: `1px solid ${isCrit ? 'rgba(250,82,82,0.3)' : C.border}`,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:8 }}>
          <span className="card-label" style={{ marginBottom:0 }}>🔊 Voice Alert</span>
          {muted && <span className="badge badge-red" style={{ fontSize:9 }}>MUTED</span>}
        </div>

        {isCrit && (
          <div style={{ position:'relative', width:16, height:16, display:'inline-block', marginBottom:6 }}>
            <div style={{ position:'absolute', inset:-3, borderRadius:'50%',
              border:'2px solid rgba(250,82,82,0.5)', animation:'pulse 1s ease-out infinite' }}/>
          </div>
        )}

        <div style={{
          fontSize:16, fontWeight:700, lineHeight:1.35, marginBottom:12,
          color: isCrit ? C.red : C.text,
        }}>
          {currentMsg}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => speakStatus(summary.text)}>
            📊 Status
          </button>
          <button className="btn btn-secondary btn-sm" onClick={repeat}>
            🔁 Repeat
          </button>
          <button
            className={`btn btn-sm ${muted ? 'btn-danger' : 'btn-secondary'}`}
            onClick={toggleMute}
            style={{ minWidth:42 }}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      {/* Walking path analysis */}
      <div className="card">
        <div className="card-label">Walking Path</div>
        <div className="path-grid">
          {pathData.map(({ p, blocked }) => (
            <div key={p} className={`path-cell ${blocked ? 'blocked' : 'clear'}`}>
              <div style={{ fontSize:20 }}>{blocked ? '🚫' : '✅'}</div>
              <div style={{
                fontSize:13, fontWeight:800, textTransform:'uppercase', marginTop:5,
                color: blocked ? C.red : C.green,
              }}>
                {p === 'center' ? 'CENTER' : p[0].toUpperCase()}
              </div>
            </div>
          ))}
        </div>
        <div className="path-label-row">
          {['Left','Center','Right'].map(l => (
            <span key={l} style={{ fontSize:11, color:C.muted }}>{l}</span>
          ))}
        </div>
      </div>

      {/* System status */}
      <div className="card">
        <div className="card-label">System Status</div>
        {[
          { l:'AI Model',    v: modelLoading ? 'Loading…' : modelReady ? 'Ready' : 'Error',
            vc: modelReady ? C.green : C.red, badge: modelReady },
          { l:'Camera',      v: cameraOn ? 'Active' : 'Off',       vc: cameraOn ? C.green : C.muted },
          { l:'Processing',  v: running  ? 'Running' : 'Stopped',  vc: running  ? C.green : C.muted },
          { l:'Confidence',  v:'≥ 60%',                            vc: C.muted },
          { l:'FPS',         v: `${fps}`,                          vc: C.blueL },
          { l:'Alerts',      v: `${alertHist.length}`,             vc: C.yellow },
          { l:'Frames',      v: `${framesTotal}`,                  vc: C.muted },
        ].map(({ l, v, vc, badge }, i, arr) => (
          <div key={l} style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            paddingBottom: i < arr.length-1 ? 10 : 0,
            marginBottom:  i < arr.length-1 ? 10 : 0,
            borderBottom:  i < arr.length-1 ? `1px solid ${C.border}` : 'none',
          }}>
            <span style={{ fontSize:14, color:C.text }}>{l}</span>
            {badge ? (
              <span className="badge badge-green">{v}</span>
            ) : (
              <span style={{ fontSize:14, color:vc, fontWeight:600, fontFamily:MONO }}>{v}</span>
            )}
          </div>
        ))}
      </div>

      {/* Stat chips */}
      <div className="stat-grid">
        {[
          { v:crit.length, l:'Critical Zone', c:C.red    },
          { v:warn.length, l:'Warning Zone',  c:C.orange  },
          { v:dets.length, l:'Objects Detected', c:C.blueL },
          { v:alertHist.length, l:'Total Alerts', c:C.green },
        ].map(({ v, l, c }) => (
          <div key={l} className="stat-card" style={{ border:`1px solid ${c}22` }}>
            <div className="stat-value" style={{ color:c }}>{v}</div>
            <div className="stat-label">{l}</div>
          </div>
        ))}
      </div>

      {/* Tabbed panel — Objects / History / Cooldown */}
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div className="tab-bar">
          {[['objects','OBJECTS'],['history','HISTORY']].map(([id,lbl])=>(
            <button key={id} className={`tab-btn ${tab===id?'active':''}`} onClick={()=>setTab(id)}>
              {lbl}
            </button>
          ))}
        </div>

        {/* Objects tab */}
        {tab === 'objects' && (
          <div style={{ maxHeight:280, overflowY:'auto' }}>
            {!dets.length ? (
              <div style={{ padding:'24px', textAlign:'center' }}>
                <div style={{ fontSize:32, color:C.dim, marginBottom:8 }}>ⓘ</div>
                <div style={{ fontSize:13, color:C.dim }}>Start detection to view objects</div>
              </div>
            ) : dets.map((d, i) => (
              <div key={`${d.id}-${i}`} className="animate-fadeup" style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'11px 16px',
                borderBottom: i < dets.length-1 ? `1px solid ${C.border}` : 'none',
              }}>
                <div style={{
                  width:38, height:38, borderRadius:9, flexShrink:0,
                  background:d.rm.bg, border:`1px solid ${d.rm.color}30`,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:17,
                }}>{d.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{d.label}</div>
                  <div style={{ fontSize:10, color:C.muted, fontFamily:MONO, marginTop:1 }}>
                    {d.path.toUpperCase()} · {d.distance}m · {Math.round(d.conf*100)}%
                  </div>
                  <div className="risk-bar-track">
                    <div className="risk-bar-fill" style={{ width:`${d.score}%`, background:d.rm.color }}/>
                  </div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <span className="badge" style={{
                    color:d.rm.color, background:d.rm.bg,
                    border:`1px solid ${d.rm.color}44`, display:'block', marginBottom:3,
                  }}>{d.rm.label.toUpperCase()}</span>
                  <span style={{ fontSize:9, color:C.dim, fontFamily:MONO }}>{d.zone}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* History tab */}
        {tab === 'history' && (
          <div style={{ maxHeight:280, overflowY:'auto' }}>
            {!alertHist.length ? (
              <div style={{ padding:'24px', textAlign:'center', color:C.dim, fontSize:13 }}>
                No alerts yet
              </div>
            ) : alertHist.map((h, i) => (
              <div key={i} className="animate-fadeup" style={{
                display:'flex', alignItems:'center', gap:9, padding:'10px 16px',
                borderBottom: i < alertHist.length-1 ? `1px solid ${C.border}` : 'none',
              }}>
                <div className="dot" style={{ background:h.color, boxShadow:`0 0 5px ${h.color}` }}/>
                <div style={{ flex:1, fontSize:12, color:C.muted, lineHeight:1.4 }}>{h.msg}</div>
                <div style={{ fontSize:9, color:C.dim, fontFamily:MONO, flexShrink:0, whiteSpace:'nowrap' }}>
                  {h.time}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
