// ── Obstacle registry ──────────────────────────────────────
export const REGISTRY = {
  person:               { label:'Person',          pri:1, type:'human',    base:80, icon:'👤' },
  stairs:               { label:'Stairs',          pri:2, type:'hazard',   base:90, icon:'🪜' },
  pothole:              { label:'Pothole',         pri:2, type:'hazard',   base:88, icon:'⚠️' },
  car:                  { label:'Car',             pri:3, type:'vehicle',  base:78, icon:'🚗' },
  truck:                { label:'Truck',           pri:3, type:'vehicle',  base:82, icon:'🚚' },
  bus:                  { label:'Bus',             pri:3, type:'vehicle',  base:80, icon:'🚌' },
  motorcycle:           { label:'Motorcycle',      pri:3, type:'vehicle',  base:74, icon:'🏍' },
  bicycle:              { label:'Bicycle',         pri:3, type:'vehicle',  base:62, icon:'🚲' },
  bench:                { label:'Bench',           pri:4, type:'obstacle', base:45, icon:'🪑' },
  chair:                { label:'Chair',           pri:4, type:'obstacle', base:42, icon:'🪑' },
  'fire hydrant':       { label:'Fire Hydrant',   pri:4, type:'obstacle', base:58, icon:'🔴' },
  'stop sign':          { label:'Stop Sign',      pri:4, type:'obstacle', base:32, icon:'🛑' },
  'traffic light':      { label:'Traffic Light',  pri:3, type:'hazard',   base:38, icon:'🚦' },
  'parking meter':      { label:'Parking Meter',  pri:4, type:'obstacle', base:50, icon:'🅿️' },
  suitcase:             { label:'Suitcase',        pri:4, type:'obstacle', base:36, icon:'🧳' },
  backpack:             { label:'Backpack',        pri:5, type:'obstacle', base:28, icon:'🎒' },
  dog:                  { label:'Dog',             pri:5, type:'animal',   base:55, icon:'🐕' },
  cat:                  { label:'Cat',             pri:5, type:'animal',   base:30, icon:'🐈' },
  couch:                { label:'Couch',           pri:4, type:'obstacle', base:44, icon:'🛋' },
  'potted plant':       { label:'Plant',           pri:5, type:'obstacle', base:30, icon:'🪴' },
  'cell phone':         { label:'Phone (dropped)', pri:5, type:'obstacle', base:20, icon:'📱' },
  umbrella:             { label:'Umbrella',        pri:5, type:'obstacle', base:28, icon:'☂️' },
  'sports ball':        { label:'Ball',            pri:5, type:'obstacle', base:25, icon:'⚽' },
  skateboard:           { label:'Skateboard',      pri:4, type:'obstacle', base:40, icon:'🛹' },
  'traffic cone':       { label:'Traffic Cone',   pri:4, type:'hazard',   base:65, icon:'🔺' },
  'construction barrier':{ label:'Barrier',       pri:4, type:'hazard',   base:78, icon:'🚧' },
  pole:                 { label:'Pole',            pri:4, type:'obstacle', base:62, icon:'⬛' },
  wall:                 { label:'Wall',            pri:4, type:'obstacle', base:72, icon:'🧱' },
  'trash can':          { label:'Trash Can',      pri:4, type:'obstacle', base:48, icon:'🗑' },
};

// ── Zone classification ────────────────────────────────────
export function getZone(dist) {
  if (dist <= 1) return 'CRITICAL';
  if (dist <= 3) return 'WARNING';
  if (dist <= 5) return 'AWARENESS';
  return 'MONITOR';
}

// ── Distance from bounding box ─────────────────────────────
export function estimateDist(bboxH, canvasH) {
  if (bboxH <= 0) return 10;
  const ratio = bboxH / canvasH;
  return parseFloat(Math.max(0.3, 1.8 / (ratio * 6 + 0.12)).toFixed(1));
}

// ── Path zone from x-center ────────────────────────────────
export function getPath(bboxX, bboxW, canvasW) {
  const cx = bboxX + bboxW / 2;
  if (cx < canvasW / 3) return 'left';
  if (cx > (2 * canvasW) / 3) return 'right';
  return 'center';
}

// ── Risk score 0–100 ──────────────────────────────────────
export function calcScore({ base, zone, path, pri }) {
  let s = base;
  s += { CRITICAL:22, WARNING:12, AWARENESS:-8, MONITOR:-28 }[zone] ?? 0;
  s += path === 'center' ? 16 : -8;
  s += pri === 1 ? 10 : pri === 2 ? 6 : 0;
  return Math.min(100, Math.max(0, Math.round(s)));
}

// ── Risk metadata ──────────────────────────────────────────
export function riskMeta(score) {
  if (score >= 80) return { label:'Critical', color:'#fa5252', bg:'rgba(250,82,82,0.12)'  };
  if (score >= 60) return { label:'High',     color:'#fd7e14', bg:'rgba(253,126,20,0.12)' };
  if (score >= 40) return { label:'Medium',   color:'#fab005', bg:'rgba(250,176,5,0.12)'  };
  return                  { label:'Low',      color:'#40c057', bg:'rgba(64,192,87,0.12)'  };
}

// ── Build full detection object ────────────────────────────
export function buildDetection(raw, canvasW, canvasH) {
  // raw = { class, score, bbox: [x,y,w,h] }
  const meta = REGISTRY[raw.class] ?? { label: raw.class, pri:5, type:'obstacle', base:40, icon:'📦' };
  const [bx, by, bw, bh] = raw.bbox;
  const dist  = estimateDist(bh, canvasH);
  const zone  = getZone(dist);
  const path  = getPath(bx, bw, canvasW);
  const score = calcScore({ ...meta, zone, path });
  const rm    = riskMeta(score);
  return {
    ...meta,
    class: raw.class,
    conf: raw.score,
    bbox: [bx, by, bw, bh],
    distance: dist,
    zone,
    path,
    score,
    rm,
    id: `${raw.class}::${path}`,
  };
}

// ── Environment summary ────────────────────────────────────
export function buildSummary(dets) {
  if (!dets.length) return { text: 'Path clear', risk: 'Clear', color: '#40c057' };
  const h  = dets.filter(d => d.type === 'human');
  const hz = dets.filter(d => d.type === 'hazard');
  const v  = dets.filter(d => d.type === 'vehicle');
  const o  = dets.filter(d => d.type === 'obstacle');
  const parts = [];
  if (h.length)  parts.push(`${h.length} person${h.length > 1 ? 's' : ''} detected`);
  if (hz.length) parts.push(hz.map(x => x.label).join(' & ') + ' ahead');
  if (v.length)  parts.push(`${v.length} vehicle${v.length > 1 ? 's' : ''} nearby`);
  if (o.length)  parts.push(`${o.length} obstacle${o.length > 1 ? 's' : ''}`);
  const top = dets[0];
  return { text: parts.join('. ') + '.', risk: top.rm.label, color: top.rm.color };
}
