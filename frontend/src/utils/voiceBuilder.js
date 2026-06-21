export function buildVoiceMessage(dets) {
  if (!dets.length) return null;
  const s   = [...dets].sort((a, b) => b.score - a.score);
  const top = s[0];
  const lC  = !s.some(d => d.path === 'left'  && d.zone !== 'MONITOR' && d.zone !== 'AWARENESS');
  const rC  = !s.some(d => d.path === 'right' && d.zone !== 'MONITOR' && d.zone !== 'AWARENESS');
  const cen = s.filter(d => d.path === 'center' && d.zone !== 'MONITOR');

  // Humans — highest priority
  if (top.type === 'human') {
    const n = s.filter(d => d.type === 'human').length;
    if (top.zone === 'CRITICAL') {
      return top.path === 'center'
        ? (n > 1 ? 'Group of people directly ahead. Stop.' : 'Person directly ahead. Stop.')
        : `Person on your ${top.path}. Caution.`;
    }
    if (top.zone === 'WARNING') {
      return top.path === 'center'
        ? (n > 1 ? 'People ahead. Slow down.' : 'Person approaching. Slow down.')
        : `Person on ${top.path} side.`;
    }
  }

  // Stairs
  if (top.label === 'Stairs') {
    if (top.zone === 'CRITICAL') return 'Steps immediately ahead. Stop and feel with foot.';
    if (top.zone === 'WARNING')  return 'Stairs ahead. Slow down.';
  }

  // Pothole
  if (top.label === 'Pothole') {
    if (top.zone === 'CRITICAL') return 'Pothole right ahead. Step carefully.';
    if (top.zone === 'WARNING')  return 'Pothole ahead. Watch your step.';
  }

  // Vehicles
  if (top.type === 'vehicle') {
    if (top.zone === 'CRITICAL') return `${top.label} very close. Stop immediately.`;
    if (top.zone === 'WARNING')  return `${top.label} ahead.`;
  }

  // Multiple center obstacles
  if (cen.length > 1) {
    if (lC) return 'Obstacles ahead. Move left.';
    if (rC) return 'Obstacles ahead. Move right.';
    return 'Obstacles ahead. Proceed slowly.';
  }

  // Single obstacle
  if (top.zone === 'CRITICAL' || top.zone === 'WARNING') {
    if (top.path === 'center') {
      if (lC) return `${top.label} ahead. Move slightly left.`;
      if (rC) return `${top.label} ahead. Move slightly right.`;
      return `${top.label} ahead. Slow down.`;
    }
    if (top.distance <= 2) return `${top.label} on your ${top.path}.`;
  }

  return null;
}
