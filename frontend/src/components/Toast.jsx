import { useState, useCallback, useEffect } from 'react';

let _add = null;
let _queue = [];

export function useToast() {
  const add = useCallback((message, type = 'info') => {
    if (_add) {
      _add({ message, type, id: Date.now() });
    } else {
      _queue.push({ message, type, id: Date.now() });
    }
  }, []);

  const toastObj = Object.assign(add, {
    success: msg => add(msg, 'success'),
    error:   msg => add(msg, 'error'),
    info:    msg => add(msg, 'info'),
  });

  return {
    toast: toastObj,
    success: toastObj.success,
    error:   toastObj.error,
    info:    toastObj.info,
  };
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    _add = (t) => {
      setToasts(prev => [...prev, t]);
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 3200);
    };

    if (_queue.length) {
      _queue.forEach(_add);
      _queue = [];
    }

    return () => { _add = null; };
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
