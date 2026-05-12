const SR = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;

export function isSupported() {
  return Boolean(SR);
}

export function recognize({ expected, timeoutMs = 5000 } = {}) {
  return new Promise((resolve) => {
    if (!SR) {
      resolve({ supported: false, matched: false, transcript: '' });
      return;
    }
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    let settled = false;
    const settle = (result) => {
      if (settled) return;
      settled = true;
      try { recognition.stop(); } catch {}
      resolve(result);
    };

    const timer = setTimeout(() => settle({ supported: true, matched: false, transcript: '', reason: 'timeout' }), timeoutMs);

    recognition.onresult = (event) => {
      clearTimeout(timer);
      const alternatives = Array.from(event.results[0]).map(r => r.transcript.trim().toLowerCase());
      const target = (expected || '').trim().toLowerCase();
      const matched = target ? alternatives.some(a => a === target || a.includes(target)) : true;
      settle({ supported: true, matched, transcript: alternatives[0] || '' });
    };
    recognition.onerror = () => {
      clearTimeout(timer);
      settle({ supported: true, matched: false, transcript: '', reason: 'error' });
    };
    recognition.onend = () => {
      clearTimeout(timer);
      // If we got here without a result, treat as no match
      settle({ supported: true, matched: false, transcript: '', reason: 'end' });
    };

    try {
      recognition.start();
    } catch (e) {
      clearTimeout(timer);
      settle({ supported: true, matched: false, transcript: '', reason: 'start-error' });
    }
  });
}
