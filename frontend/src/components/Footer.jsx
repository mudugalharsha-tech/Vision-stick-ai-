import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: '#0a0c12',
      borderTop: '1px solid #2a2d3a',
      padding: '28px 20px',
      textAlign: 'center',
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:8 }}>
        <div style={{ width:28, height:28, borderRadius:7, background:'#3b5bdb',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>👁</div>
        <span style={{ fontSize:15, fontWeight:700, color:'#748ffc' }}>VisionStick AI</span>
      </div>
      <p style={{ fontSize:12, color:'#555870', marginBottom:14 }}>
        AI for Accessible Navigation. Built with TensorFlow.js.
      </p>
      <div style={{ display:'flex', justifyContent:'center', gap:20, flexWrap:'wrap', marginBottom:14 }}>
        {[
          ['/', 'Home'],
          ['/features', 'Features'],
          ['/how-it-works', 'How It Works'],
          ['/detect', 'Live Detection'],
        ].map(([to, label]) => (
          <Link key={to} to={to} style={{
            fontSize:12, color:'#555870', textDecoration:'underline', textUnderlineOffset:3,
          }}>{label}</Link>
        ))}
      </div>
      <p style={{ fontSize:10, color:'#2a2d3a', fontFamily:'monospace', letterSpacing:'.07em' }}>
        SPEAKER-ONLY · YOLOv8n / COCO-SSD READY · CONF ≥ 60% · EVERY 3RD FRAME
      </p>
      <p style={{ fontSize:11, color:'#2a2d3a', marginTop:8 }}>
        © {new Date().getFullYear()} VisionStick AI. MIT License.
      </p>
    </footer>
  );
}
