import { SecurityPrivacyStatus } from '../types/browser';

// Quick djb2 string hashing function
function hashString(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16).toUpperCase();
}

export function testCanvasFingerprint(): { hash: string; isPoisoned: boolean } {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { hash: 'UNSUPPORTED', isPoisoned: false };

    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('BrowserDiag Fingerprint 2026', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('BrowserDiag Fingerprint 2026', 4, 17);

    const dataUrl1 = canvas.toDataURL();

    // Check for canvas noise injection / spoofing (Brave, Canvas Defender, Privacy extensions)
    // Repeat render: deterministic canvas will produce identical dataURL; poisoned canvas often alters pixels each run
    const canvas2 = document.createElement('canvas');
    canvas2.width = 200;
    canvas2.height = 50;
    const ctx2 = canvas2.getContext('2d');
    if (ctx2) {
      ctx2.textBaseline = 'top';
      ctx2.font = "14px 'Arial'";
      ctx2.textBaseline = 'alphabetic';
      ctx2.fillStyle = '#f60';
      ctx2.fillRect(125, 1, 62, 20);
      ctx2.fillStyle = '#069';
      ctx2.fillText('BrowserDiag Fingerprint 2026', 2, 15);
      ctx2.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx2.fillText('BrowserDiag Fingerprint 2026', 4, 17);
      const dataUrl2 = canvas2.toDataURL();
      const isPoisoned = dataUrl1 !== dataUrl2;
      return { hash: hashString(dataUrl1), isPoisoned };
    }

    return { hash: hashString(dataUrl1), isPoisoned: false };
  } catch {
    return { hash: 'BLOCKED', isPoisoned: true };
  }
}

export async function testAudioFingerprint(): Promise<string> {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return 'UNSUPPORTED';

    const context = new AudioCtx();
    const oscillator = context.createOscillator();
    const analyser = context.createAnalyser();
    const gain = context.createGain();
    const scriptProcessor = context.createScriptProcessor(4096, 1, 1);

    gain.gain.value = 0; // mute
    oscillator.type = 'triangle';
    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gain);
    gain.connect(context.destination);

    return new Promise((resolve) => {
      let resolved = false;
      scriptProcessor.onaudioprocess = (bins) => {
        if (resolved) return;
        resolved = true;
        const output = bins.inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < output.length; i++) {
          sum += Math.abs(output[i]);
        }
        oscillator.stop();
        context.close().catch(() => {});
        resolve(hashString(sum.toString()));
      };

      oscillator.start(0);

      // Timeout fallback
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          try {
            oscillator.stop();
            context.close().catch(() => {});
          } catch {
            //
          }
          resolve('TIMEOUT_OR_BLOCKED');
        }
      }, 500);
    });
  } catch {
    return 'BLOCKED';
  }
}

export async function testWebRtcLeak(): Promise<{ leakDetected: boolean; candidateCount: number }> {
  return new Promise((resolve) => {
    if (typeof RTCPeerConnection === 'undefined') {
      resolve({ leakDetected: false, candidateCount: 0 });
      return;
    }

    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      let candidateCount = 0;
      let leakDetected = false;

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          candidateCount++;
          const cand = e.candidate.candidate;
          // Check if local IPv4 pattern is exposed
          if (/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/.test(cand)) {
            leakDetected = true;
          }
        } else {
          // Candidates gathering completed
          pc.close();
          resolve({ leakDetected, candidateCount });
        }
      };

      pc.createDataChannel('leakTest');
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(() => {
          resolve({ leakDetected: false, candidateCount: 0 });
        });

      // Safety timeout
      setTimeout(() => {
        try {
          pc.close();
        } catch {
          //
        }
        resolve({ leakDetected, candidateCount });
      }, 800);
    } catch {
      resolve({ leakDetected: false, candidateCount: 0 });
    }
  });
}

export async function auditSitePermissions(): Promise<Record<string, 'granted' | 'denied' | 'prompt' | 'unsupported'>> {
  const permissionNames = [
    'camera',
    'microphone',
    'geolocation',
    'notifications',
    'clipboard-read',
    'clipboard-write',
    'persistent-storage',
  ];

  const results: Record<string, 'granted' | 'denied' | 'prompt' | 'unsupported'> = {};

  if (!navigator.permissions || !navigator.permissions.query) {
    for (const name of permissionNames) {
      results[name] = 'unsupported';
    }
    return results;
  }

  for (const name of permissionNames) {
    try {
      // PermissionDescriptor type casting
      const status = await navigator.permissions.query({ name: name as PermissionName });
      results[name] = status.state;
    } catch {
      results[name] = 'unsupported';
    }
  }

  return results;
}

export async function runSecurityAudit(): Promise<SecurityPrivacyStatus> {
  const canvasResult = testCanvasFingerprint();
  const audioHash = await testAudioFingerprint();
  const webRtcResult = await testWebRtcLeak();
  const permissions = await auditSitePermissions();

  const gpc = (navigator as unknown as { globalPrivacyControl?: boolean }).globalPrivacyControl ?? null;
  const dnt = navigator.doNotTrack || (window as unknown as { doNotTrack?: string }).doNotTrack || null;

  return {
    isSecureContext: window.isSecureContext,
    globalPrivacyControl: gpc,
    doNotTrack: dnt,
    canvasFingerprintHash: canvasResult.hash,
    canvasPoisoningDetected: canvasResult.isPoisoned,
    audioFingerprintHash: audioHash,
    webRtcIpLeakDetected: webRtcResult.leakDetected,
    webRtcCandidateCount: webRtcResult.candidateCount,
    permissions,
    thirdPartyCookiesPartioned: true,
  };
}
