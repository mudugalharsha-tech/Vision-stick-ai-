import { useRef, useCallback, useState } from 'react';
import { buildVoiceMessage } from '../utils/voiceBuilder';

export function useVoice() {
  const queue   = useRef([]);
  const speaking = useRef(false);
  const enabled  = useRef(true);
  const [muted, setMuted] = useState(false);
  const [currentMsg, setCurrentMsg] = useState('Path clear');
  const [lastMsg,    setLastMsg]    = useState('');

  const processQueue = useCallback(() => {
    if (speaking.current || !queue.current.length || !enabled.current) return;
    const text = queue.current.shift();
    const utt  = new SpeechSynthesisUtterance(text);
    utt.rate   = 1.0;
    utt.pitch  = 1.0;
    utt.volume = 1.0;
    // Prefer a local voice if available
    const voices = window.speechSynthesis.getVoices();
    const pref   = voices.find(v => v.lang === 'en-US' && v.localService);
    if (pref) utt.voice = pref;
    utt.onstart = () => { speaking.current = true; };
    utt.onend   = utt.onerror = () => { speaking.current = false; processQueue(); };
    window.speechSynthesis.speak(utt);
  }, []);

  const say = useCallback((text, priority = false) => {
    if (!text) return;
    setCurrentMsg(text);
    setLastMsg(text);
    if (!enabled.current || !window.speechSynthesis) return;

    if (priority) {
      window.speechSynthesis.cancel();
      queue.current = [];
      speaking.current = false;
    }
    if (queue.current.includes(text)) return;
    queue.current.push(text);
    processQueue();
  }, [processQueue]);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    queue.current = [];
    speaking.current = false;
  }, []);

  const toggleMute = useCallback(() => {
    const next = !enabled.current;
    // next=true means we are UNmuting, false means muting
    const nowMuted = !next;
    enabled.current = next;
    setMuted(nowMuted);
    if (nowMuted) stop();
    else say('Voice enabled.');
  }, [stop, say]);

  const speakDetections = useCallback((dets, announceable) => {
    const msg = buildVoiceMessage(announceable);
    if (!msg) return null;
    const isPriority = announceable.some(d => d.zone === 'CRITICAL');
    say(msg, isPriority);
    return msg;
  }, [say]);

  const speakStatus = useCallback((summaryText) => {
    say(summaryText, true);
  }, [say]);

  const repeat = useCallback(() => {
    if (lastMsg) say(lastMsg, true);
  }, [lastMsg, say]);

  return {
    muted,
    currentMsg,
    lastMsg,
    say,
    stop,
    toggleMute,
    speakDetections,
    speakStatus,
    repeat,
  };
}
