import { Link } from 'react-router-dom';

const C = {
  bg:'#111318', surface:'#1c1e26', border:'#2a2d3a',
  blue:'#3b5bdb', blueL:'#748ffc', text:'#e8eaf0', muted:'#8b8fa8', green:'#40c057',
};

function Card({ children, style={} }) {
  return (
    <div style={{
      background:C.surface, border:`1px solid ${C.border}`,
      borderRadius:14, padding:'20px', marginBottom:12, ...style,
    }}>
      {children}
    </div>
  );
}

function IconBox({ icon }) {
  return (
    <div style={{
      width:44, height:44, borderRadius:10,
      background:'rgba(59,91,219,0.14)', border:'1px solid rgba(59,91,219,0.25)',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:20, marginBottom:12,
    }}>{icon}</div>
  );
}

// ══════════════════════════════════════════════════════════
// HOME PAGE
// ══════════════════════════════════════════════════════════
export function HomePage() {
  return (
    <div style={{ padding:'0 18px' }}>

      {/* Hero */}
      <div style={{ paddingTop:32, paddingBottom:24, textAlign:'center' }}>
        <div style={{
          width:96, height:96, borderRadius:'50%', margin:'0 auto 22px',
          background:'linear-gradient(135deg,rgba(59,91,219,0.3),rgba(116,143,252,0.1))',
          border:'2px solid rgba(59,91,219,0.4)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:44, boxShadow:'0 0 40px rgba(59,91,219,0.28)',
        }}>👁️</div>

        <div style={{
          display:'inline-flex', alignItems:'center', gap:6,
          background:'rgba(59,91,219,0.1)', border:'1px solid rgba(59,91,219,0.28)',
          borderRadius:20, padding:'5px 14px', marginBottom:18,
        }}>
          <div style={{ width:6,height:6,borderRadius:'50%',background:C.green,boxShadow:`0 0 6px ${C.green}` }}/>
          <span style={{ fontSize:12, color:C.blueL, fontWeight:500 }}>Accessible Navigation Assistant</span>
        </div>

        <h1 style={{ fontSize:28, fontWeight:900, color:C.text, lineHeight:1.2, marginBottom:10 }}>
          AI-Powered Smart Navigation for the{' '}
          <span style={{ color:C.blueL }}>Visually Impaired</span>
        </h1>
        <p style={{ fontSize:14, color:C.muted, lineHeight:1.65, marginBottom:28, maxWidth:340, margin:'0 auto 28px' }}>
          Real-time obstacle detection and intelligent voice guidance designed to provide safety, independence, and peace of mind.
        </p>

        <Link to="/detect" className="btn btn-primary" style={{ textDecoration:'none', marginBottom:10 }}>
          Start Detection →
        </Link>
        <Link to="/how-it-works" className="btn btn-secondary" style={{ textDecoration:'none' }}>
          Learn More ⓘ
        </Link>
      </div>

      {/* Quick stats */}
      <div className="stats-grid">
        {[['30+','Objects'],['≥60%','Confidence'],['6s','Cooldown']].map(([v,l])=>(
          <Card key={l} style={{ padding:'14px 8px', textAlign:'center', marginBottom:0 }}>
            <div style={{ fontSize:18, fontWeight:800, color:C.blueL, fontFamily:'monospace' }}>{v}</div>
            <div style={{ fontSize:10, color:C.muted, marginTop:3 }}>{l}</div>
          </Card>
        ))}
      </div>

      {/* Obstacle Detected chip */}
      <div style={{ display:'flex', justifyContent:'center', marginBottom:24 }}>
        <div style={{
          display:'inline-flex', alignItems:'center', gap:8,
          background:C.surface, border:`1px solid ${C.border}`,
          borderRadius:30, padding:'10px 18px', fontSize:14, color:C.text, fontWeight:500,
        }}>
          <div style={{ width:10,height:10,borderRadius:'50%',background:'#fa5252',boxShadow:'0 0 8px #fa5252' }}/>
          Obstacle Detected
        </div>
      </div>

      {/* Feature highlights */}
      <h2 style={{ fontSize:18, fontWeight:700, color:C.text, marginBottom:6 }}>Engineered for Reliability</h2>
      <p style={{ fontSize:13, color:C.muted, lineHeight:1.6, marginBottom:16 }}>
        Built with carefully considered constraints to provide maximum assistance without overwhelming the user.
      </p>

      <div className="features-grid" style={{ marginBottom: 24 }}>
        {[
          {icon:'👁',t:'Real-Time Obstacle Detection',d:'AI running entirely in your browser. No data ever leaves your device.'},
          {icon:'📍',t:'Distance Estimation',d:'Estimates proximity using spatial analysis — warns you before you encounter obstacles.'},
          {icon:'🔊',t:'Smart Voice Guidance',d:'Speaks only when action is needed. Clear, concise, speaker-only output.'},
        ].map(f=>(
          <Card key={f.t} style={{ marginBottom: 0 }}>
            <IconBox icon={f.icon}/>
            <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:6 }}>{f.t}</div>
            <div style={{ fontSize:13, color:C.muted, lineHeight:1.6 }}>{f.d}</div>
          </Card>
        ))}
      </div>

      <Link to="/features" className="btn btn-secondary" style={{ textDecoration:'none', marginBottom:24 }}>
        See All Features →
      </Link>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// FEATURES PAGE
// ══════════════════════════════════════════════════════════
export function FeaturesPage() {
  const feats = [
    {icon:'👁',t:'Real-Time Obstacle Detection',d:'Detects obstacles instantly using COCO-SSD AI running entirely in your browser. No internet required after initial load.'},
    {icon:'📍',t:'Distance Estimation',d:'Estimates how close obstacles are based on bounding-box spatial analysis, giving you a warning before you encounter them.'},
    {icon:'🔊',t:'Smart Voice Guidance',d:'Provides alerts only when necessary using the Web Speech API. Designed to be clear, concise, and unobtrusive.'},
    {icon:'👤',t:'Human Detection Priority',d:'Prioritises people and moving vehicles over static objects to ensure safety in dynamic environments.'},
    {icon:'⚡',t:'Fast Processing',d:'Processes every 3rd frame using lite_mobilenet_v2 for low-latency performance on mobile and desktop.'},
    {icon:'⏱',t:'Smart Cooldown System',d:'6-second per-object cooldown prevents alert fatigue. Re-announces if distance drops by >0.8m or zone escalates to Critical.'},
    {icon:'🛤',t:'Path Zone Analysis',d:'Divides the camera view into Left, Center, and Right paths. Center path always gets highest priority in risk scoring.'},
    {icon:'📊',t:'Dynamic Risk Scoring',d:'Each detection receives a risk score (0–100) based on distance, path position, object type, and priority class.'},
    {icon:'🔐',t:'Secure User Accounts',d:'JWT authentication with rotating refresh tokens, bcrypt hashing, and email verification.'},
    {icon:'📈',t:'Session Analytics',d:'Every navigation session is logged with alerts, detected objects, duration, and risk distribution.'},
  ];

  return (
    <div style={{ padding:'24px 18px' }}>
      <h1 style={{ fontSize:24, fontWeight:800, color:C.text, marginBottom:8 }}>Features</h1>
      <p style={{ fontSize:13, color:C.muted, lineHeight:1.6, marginBottom:20 }}>
        Every feature is designed to maximise safety while minimising cognitive load.
      </p>
      <div className="features-grid" style={{ marginBottom: 24 }}>
        {feats.map(f=>(
          <Card key={f.t} style={{ marginBottom: 0 }}>
            <IconBox icon={f.icon}/>
            <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:6 }}>{f.t}</div>
            <div style={{ fontSize:13, color:C.muted, lineHeight:1.6 }}>{f.d}</div>
          </Card>
        ))}
      </div>
      <Link to="/detect" className="btn btn-primary" style={{ textDecoration:'none', marginBottom:8 }}>
        Try Live Detection →
      </Link>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// HOW IT WORKS PAGE
// ══════════════════════════════════════════════════════════
export function HowItWorks() {
  const steps = [
    {
      n:1, icon:'📷', t:'Capture Camera Frame',
      d:"Your device's camera captures the environment in real-time and streams it to the AI pipeline.",
      note:'Requires camera permission. Rear-facing camera preferred. Resolution up to 1280×720. Every 3rd frame is processed to balance accuracy and CPU usage.',
    },
    {
      n:2, icon:'⚙️', t:'AI Object Analysis',
      d:'COCO-SSD (lite_mobilenet_v2) identifies obstacles, people, and vehicles entirely in the browser — no data leaves your device.',
      note:'Only detections with ≥60% confidence are processed. Recognised classes include: person, car, motorcycle, bus, truck, bicycle, chair, bench, couch, potted plant, traffic light, stop sign, suitcase, backpack, and more.',
    },
    {
      n:3, icon:'🎯', t:'Zone & Path Risk Scoring',
      d:'Each detection is classified by distance zone and walking path position (Left / Center / Right) to compute a dynamic risk score.',
      note:'Distance estimated from bounding-box height: >35% of frame = Critical (0–1 m), 12–35% = Warning (1–3 m), 4–12% = Awareness (3–5 m), <4% = Monitor. Center-path objects are weighted +16 points.',
    },
    {
      n:4, icon:'🔊', t:'Intelligent Voice Guidance',
      d:"Context-aware voice messages are spoken only when action is needed — with path hints like 'move right' to guide navigation.",
      note:"Requires Web Speech API (Chrome, Edge, Safari). Critical zone always speaks. Warning zone speaks for center-path objects. Awareness zone is dashboard-only. Each object has a 6-second cooldown; resets if risk escalates. 'Path clear' is announced after 3 seconds of no detections.",
    },
  ];

  return (
    <div style={{ padding:'24px 18px' }}>
      <h1 style={{ fontSize:24, fontWeight:800, color:C.text, marginBottom:8 }}>How It Works</h1>
      <p style={{ fontSize:13, color:C.muted, lineHeight:1.6, marginBottom:28, textAlign:'center' }}>
        A four-stage pipeline from camera capture to voice guidance, running entirely on your device for privacy and low latency.
      </p>

      {steps.map((s, i) => (
        <div key={s.n} style={{ display:'flex', gap:14, marginBottom:4 }}>
          {/* Connector column */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:52, flexShrink:0 }}>
            <div style={{
              width:48, height:48, borderRadius:'50%', position:'relative',
              background:'rgba(59,91,219,0.14)', border:'2px solid rgba(59,91,219,0.35)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
            }}>
              {s.icon}
              <div style={{
                position:'absolute', top:-2, right:-2,
                width:18, height:18, borderRadius:'50%',
                background:C.blue, display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:10, fontWeight:700, color:'#fff',
              }}>{s.n}</div>
            </div>
            {i < steps.length-1 && (
              <div style={{ width:2, flex:1, minHeight:20, background:C.border, margin:'4px 0' }}/>
            )}
          </div>

          {/* Content */}
          <div style={{ flex:1, paddingTop:4, paddingBottom:24 }}>
            <div style={{ fontSize:17, fontWeight:700, color:C.text, marginBottom:6 }}>{s.t}</div>
            <div style={{ fontSize:13, color:C.muted, lineHeight:1.65, marginBottom:10 }}>{s.d}</div>
            <div style={{
              background:'#22242f', border:`1px solid ${C.border}`,
              borderRadius:10, padding:'12px 14px',
            }}>
              <div style={{ fontSize:10, color:C.blueL, fontWeight:700, letterSpacing:'.1em', marginBottom:6 }}>
                SYSTEM ASSUMPTION
              </div>
              <div style={{ fontSize:12, color:C.muted, lineHeight:1.65 }}>{s.note}</div>
            </div>
          </div>
        </div>
      ))}

      <Link to="/detect" className="btn btn-primary" style={{ textDecoration:'none', marginTop:4 }}>
        Try It Now →
      </Link>
    </div>
  );
}

export default HomePage;
