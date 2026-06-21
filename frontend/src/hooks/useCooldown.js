import { useRef, useCallback } from 'react';

const COOLDOWN_MS  = 6000;
const STALE_MS     = 10000;
const DIST_RETRIGGER = 0.8;

export function useCooldown() {
  const map = useRef(new Map());

  const should = useCallback((id, dist, zone) => {
    if (zone === 'MONITOR' || zone === 'AWARENESS') return false;
    const r = map.current.get(id);
    if (!r) return true;
    const elapsed = Date.now() - r.ts;
    if (elapsed > COOLDOWN_MS) return true;
    if (r.dist - dist > DIST_RETRIGGER) return true;
    if (r.zone !== 'CRITICAL' && zone === 'CRITICAL') return true;
    return false;
  }, []);

  const record = useCallback((id, dist, zone) => {
    map.current.set(id, { ts: Date.now(), dist, zone });
  }, []);

  const evict = useCallback((activeIds) => {
    const now = Date.now();
    for (const [id, r] of map.current) {
      if (!activeIds.has(id) && now - r.ts > STALE_MS) {
        map.current.delete(id);
      }
    }
  }, []);

  const reset = useCallback(() => {
    map.current.clear();
  }, []);

  const getStatus = useCallback(() => {
    return [...map.current.entries()].map(([id, r]) => ({
      id,
      dist: r.dist,
      zone: r.zone,
      rem:  Math.max(0, (COOLDOWN_MS - (Date.now() - r.ts)) / 1000).toFixed(1),
      pct:  Math.max(0, 1 - (Date.now() - r.ts) / COOLDOWN_MS),
    }));
  }, []);

  return { should, record, evict, reset, getStatus };
}
