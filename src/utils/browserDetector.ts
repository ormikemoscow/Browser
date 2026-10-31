import { BrowserDetails, GpuDetails, StorageQuotaDetails } from '../types/browser';

export function detectBrowserDetails(): BrowserDetails {
  const ua = navigator.userAgent;
  let name = 'Неизвестный браузер';
  let version = 'Не определена';
  let engine = 'Неизвестный движок';

  // Specific browser detection
  if (ua.includes('Edg/')) {
    name = 'Microsoft Edge';
    const match = ua.match(/Edg\/([\d.]+)/);
    if (match) version = match[1];
    engine = 'Blink (Chromium)';
  } else if (ua.includes('YaBrowser/')) {
    name = 'Яндекс Браузер';
    const match = ua.match(/YaBrowser\/([\d.]+)/);
    if (match) version = match[1];
    engine = 'Blink (Chromium)';
  } else if (ua.includes('OPR/') || ua.includes('Opera/')) {
    name = 'Opera';
    const match = ua.match(/(?:OPR|Opera)\/([\d.]+)/);
    if (match) version = match[1];
    engine = 'Blink (Chromium)';
  } else if (ua.includes('Vivaldi/')) {
    name = 'Vivaldi';
    const match = ua.match(/Vivaldi\/([\d.]+)/);
    if (match) version = match[1];
    engine = 'Blink (Chromium)';
  } else if ((navigator as unknown as { brave?: { isBrave?: () => Promise<boolean> } }).brave) {
    name = 'Brave';
    const match = ua.match(/Chrome\/([\d.]+)/);
    if (match) version = match[1];
    engine = 'Blink (Chromium)';
  } else if (ua.includes('Chrome/') && !ua.includes('Chromium/')) {
    name = 'Google Chrome';
    const match = ua.match(/Chrome\/([\d.]+)/);
    if (match) version = match[1];
    engine = 'Blink (Chromium)';
  } else if (ua.includes('Firefox/')) {
    name = 'Mozilla Firefox';
    const match = ua.match(/Firefox\/([\d.]+)/);
    if (match) version = match[1];
    engine = 'Gecko';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    name = 'Apple Safari';
    const match = ua.match(/Version\/([\d.]+)/);
    if (match) version = match[1];
    engine = 'WebKit';
  }

  // OS detection
  let os = 'Неизвестная ОС';
  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux') && !ua.includes('Android')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) os = 'iOS / iPadOS';

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

  // Network connection
  const conn = (navigator as unknown as {
    connection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
    };
  }).connection;

  return {
    name,
    version,
    engine,
    os,
    userAgent: ua,
    isMobile,
    language: navigator.language || 'ru-RU',
    languages: Array.from(navigator.languages || [navigator.language]),
    cookieEnabled: navigator.cookieEnabled,
    pdfViewerEnabled: (navigator as unknown as { pdfViewerEnabled?: boolean }).pdfViewerEnabled ?? false,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    hardwareConcurrency: navigator.hardwareConcurrency || 4,
    deviceMemory: (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? null,
    screenResolution: `${window.screen.width} × ${window.screen.height}`,
    colorDepth: window.screen.colorDepth || 24,
    pixelRatio: window.devicePixelRatio || 1,
    isOnline: navigator.onLine,
    connectionType: conn?.effectiveType,
    downlink: conn?.downlink,
    rtt: conn?.rtt,
    saveData: conn?.saveData,
  };
}

export function detectGpuDetails(): GpuDetails {
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;

    if (!gl) {
      return {
        supported: false,
        webglVersion: 'Не поддерживается',
        vendor: 'Не определен',
        renderer: 'Не определен',
        unmaskedVendor: 'Не определен',
        unmaskedRenderer: 'Не определен',
        maxTextureSize: 0,
        isHardwareAccelerated: false,
        extensionsCount: 0,
      };
    }

    const isWebGl2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
    const vendor = gl.getParameter(gl.VENDOR) || 'Unknown';
    const renderer = gl.getParameter(gl.RENDERER) || 'Unknown';

    // Unmasked vendor & renderer extension
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const unmaskedVendor = ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : vendor;
    const unmaskedRenderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : renderer;
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 0;
    const extensions = gl.getSupportedExtensions() || [];

    // Hardware acceleration heuristic: software renderers usually report SwiftShader, llvmpipe, Mesa, or Softpipe
    const isSoftware = /swiftshader|llvmpipe|software|mesa x11|microsoft basic render/i.test(
      `${unmaskedRenderer} ${renderer}`
    );

    return {
      supported: true,
      webglVersion: isWebGl2 ? 'WebGL 2.0' : 'WebGL 1.0',
      vendor: String(vendor),
      renderer: String(renderer),
      unmaskedVendor: String(unmaskedVendor),
      unmaskedRenderer: String(unmaskedRenderer),
      maxTextureSize: Number(maxTextureSize),
      isHardwareAccelerated: !isSoftware,
      extensionsCount: extensions.length,
    };
  } catch {
    return {
      supported: false,
      webglVersion: 'Ошибка инициализации',
      vendor: 'Unknown',
      renderer: 'Unknown',
      unmaskedVendor: 'Unknown',
      unmaskedRenderer: 'Unknown',
      maxTextureSize: 0,
      isHardwareAccelerated: false,
      extensionsCount: 0,
    };
  }
}

export async function detectStorageQuota(): Promise<StorageQuotaDetails> {
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const isPersistent = navigator.storage.persisted ? await navigator.storage.persisted() : false;

      const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 MB';
        const mb = bytes / (1024 * 1024);
        if (mb < 1000) return `${mb.toFixed(1)} МБ`;
        return `${(mb / 1024).toFixed(2)} ГБ`;
      };

      const percent = quota > 0 ? (usage / quota) * 100 : 0;

      return {
        supported: true,
        usageBytes: usage,
        quotaBytes: quota,
        usageFormatted: formatSize(usage),
        quotaFormatted: formatSize(quota),
        percentUsed: Math.min(100, Number(percent.toFixed(2))),
        isPersistent,
      };
    } catch {
      // Fallback
    }
  }

  return {
    supported: false,
    usageBytes: 0,
    quotaBytes: 0,
    usageFormatted: 'Недоступно',
    quotaFormatted: 'Недоступно',
    percentUsed: 0,
    isPersistent: false,
  };
}

export function detectWebCapabilities(): Record<string, boolean> {
  return {
    'WebAssembly': typeof WebAssembly !== 'undefined',
    'Service Worker': 'serviceWorker' in navigator,
    'Web Workers': typeof Worker !== 'undefined',
    'SharedArrayBuffer': typeof SharedArrayBuffer !== 'undefined',
    'OffscreenCanvas': typeof OffscreenCanvas !== 'undefined',
    'WebRTC': typeof RTCPeerConnection !== 'undefined',
    'Web Audio API': typeof AudioContext !== 'undefined' || typeof (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext !== 'undefined',
    'WebGPU': 'gpu' in navigator,
    'IndexedDB': typeof indexedDB !== 'undefined',
    'PerformanceObserver': typeof PerformanceObserver !== 'undefined',
    'Fullscreen API': document.fullscreenEnabled || (document as unknown as { webkitFullscreenEnabled?: boolean }).webkitFullscreenEnabled || false,
    'Clipboard API': 'clipboard' in navigator,
  };
}
