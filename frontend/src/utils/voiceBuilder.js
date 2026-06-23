export function buildVoiceMessage(dets) {
  if (!dets.length) return null;
  const s   = [...dets].sort((a, b) => b.score - a.score);
  const top = s[0];
  const lC  = !s.some(d => d.path === 'left'  && d.zone !== 'MONITOR' && d.zone !== 'AWARENESS');
  const rC  = !s.some(d => d.path === 'right' && d.zone !== 'MONITOR' && d.zone !== 'AWARENESS');
  const cen = s.filter(d => d.path === 'center' && d.zone !== 'MONITOR');

  const getNavAdvice = () => {
    if (lC && rC) return ' Safe to move left or right.';
    if (lC) return ' Safe to move left.';
    if (rC) return ' Safe to move right.';
    return ' Stop, path blocked.';
  };

  let baseMessage = null;

  // Humans — highest priority
  if (top.type === 'human') {
    const n = s.filter(d => d.type === 'human').length;
    if (top.zone === 'CRITICAL') {
      baseMessage = top.path === 'center'
        ? (n > 1 ? 'Group of people directly ahead. Stop.' : 'Person directly ahead. Stop.')
        : `Person on your ${top.path}. Caution.`;
    } else if (top.zone === 'WARNING') {
      baseMessage = top.path === 'center'
        ? (n > 1 ? 'People ahead. Slow down.' : 'Person approaching. Slow down.')
        : `Person on ${top.path} side.`;
    }
  }

  // Stairs
  else if (top.label === 'Stairs') {
    if (top.zone === 'CRITICAL') baseMessage = 'Steps immediately ahead. Stop and feel with foot.';
    else if (top.zone === 'WARNING')  baseMessage = 'Stairs ahead. Slow down.';
  }

  // Pothole
  else if (top.label === 'Pothole') {
    if (top.zone === 'CRITICAL') baseMessage = 'Pothole right ahead. Step carefully.';
    else if (top.zone === 'WARNING')  baseMessage = 'Pothole ahead. Watch your step.';
  }

  // Vehicles
  else if (top.type === 'vehicle') {
    if (top.zone === 'CRITICAL') baseMessage = `${top.label} very close. Stop immediately.`;
    else if (top.zone === 'WARNING')  baseMessage = `${top.label} ahead.`;
  }

  // Multiple center obstacles
  else if (cen.length > 1) {
    if (lC) baseMessage = 'Obstacles ahead. Move left.';
    else if (rC) baseMessage = 'Obstacles ahead. Move right.';
    else baseMessage = 'Obstacles ahead. Proceed slowly.';
  }

  // Single obstacle
  else if (top.zone === 'CRITICAL' || top.zone === 'WARNING') {
    if (top.path === 'center') {
      if (lC) baseMessage = `${top.label} ahead. Move slightly left.`;
      else if (rC) baseMessage = `${top.label} ahead. Move slightly right.`;
      else baseMessage = `${top.label} ahead. Slow down.`;
    } else {
      if (top.distance <= 2) baseMessage = `${top.label} on your ${top.path}.`;
    }
  }

  if (!baseMessage) return null;

  // Append safe navigation advice if it doesn't already have 'Move' instructions
  if (!baseMessage.includes('Move ')) {
    if (top.path === 'center') {
      baseMessage += getNavAdvice();
    } else if (top.path === 'left' && rC) {
      baseMessage += ' Safe to move right.';
    } else if (top.path === 'right' && lC) {
      baseMessage += ' Safe to move left.';
    }
  }

  return baseMessage;
}
