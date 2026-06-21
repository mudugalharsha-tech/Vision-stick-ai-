export function renderDetections(ctx, W, H, dets) {
  ctx.clearRect(0, 0, W, H);
  
  // Path zone overlay
  ctx.globalAlpha = 0.04;
  ctx.fillStyle = '#3b5bdb';
  ctx.fillRect(W / 3, 0, W / 3, H);
  ctx.globalAlpha = 1;

  // Divider lines
  ctx.setLineDash([3, 7]);
  ctx.strokeStyle = 'rgba(59,91,219,0.2)';
  ctx.lineWidth = 1;
  [W / 3, (2 * W) / 3].forEach(x => {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  });
  ctx.setLineDash([]);

  // Path labels
  ctx.font = '9px monospace';
  ctx.fillStyle = 'rgba(116,143,252,0.4)';
  ctx.textAlign = 'left';   ctx.fillText('L', 6, 13);
  ctx.textAlign = 'center'; ctx.fillText('C', W / 2, 13);
  ctx.textAlign = 'right';  ctx.fillText('R', W - 6, 13);
  ctx.textAlign = 'left';

  // Distance arcs
  [
    { r: H * 0.50, label: '1m', c: 'rgba(250,82,82,0.38)'  },
    { r: H * 0.72, label: '3m', c: 'rgba(253,126,20,0.28)' },
    { r: H * 0.88, label: '5m', c: 'rgba(250,176,5,0.2)'   },
  ].forEach(({ r, label, c }) => {
    ctx.beginPath();
    ctx.arc(W / 2, H, r, Math.PI, 0);
    ctx.strokeStyle = c; ctx.lineWidth = 1;
    ctx.setLineDash([2, 7]); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = c; ctx.font = '8px monospace';
    ctx.fillText(label, W / 2 + r - 10, H - 4);
  });

  // Draw each detection
  dets.forEach(d => {
    const [x, y, w, h] = d.bbox;
    const c  = d.rm.color;
    const cs = 11;

    // Glow + box
    ctx.shadowColor = c; ctx.shadowBlur = 10;
    ctx.strokeStyle = c; ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.shadowBlur = 0;

    // Corner accents
    ctx.lineWidth = 2.5; ctx.strokeStyle = c;
    ctx.beginPath();
    ctx.moveTo(x, y + cs); ctx.lineTo(x, y); ctx.lineTo(x + cs, y);
    ctx.moveTo(x + w - cs, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cs);
    ctx.moveTo(x, y + h - cs); ctx.lineTo(x, y + h); ctx.lineTo(x + cs, y + h);
    ctx.moveTo(x + w - cs, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - cs);
    ctx.stroke();

    // Label pill
    const txt = `${d.icon} ${d.label}  ${d.distance}m`;
    ctx.font = 'bold 10px monospace';
    const tw = ctx.measureText(txt).width + 10;
    const ly = y > 22 ? y - 4 : y + h + 18;
    ctx.fillStyle = c;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, ly - 13, tw, 16, 3);
    else ctx.rect(x, ly - 13, tw, 16);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.fillText(txt, x + 5, ly);

    // Confidence bar
    ctx.fillStyle = c + '28'; ctx.fillRect(x, y + h - 3, w, 3);
    ctx.fillStyle = c;        ctx.fillRect(x, y + h - 3, w * d.conf, 3);

    // Risk badge
    ctx.fillStyle = c + '20'; ctx.strokeStyle = c; ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x + w - 48, y + 5, 44, 15, 3);
    else ctx.rect(x + w - 48, y + 5, 44, 15);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = c; ctx.font = '8px monospace';
    ctx.fillText(d.rm.label.toUpperCase(), x + w - 44, y + 15);
  });
}
