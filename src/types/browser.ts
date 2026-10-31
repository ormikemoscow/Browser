export interface BrowserDetails {
  name: string;
  version: string;
  engine: string;
  os: string;
  userAgent: string;
  isMobile: boolean;
  language: string;
  languages: string[];
  cookieEnabled: boolean;
  pdfViewerEnabled: boolean;
  maxTouchPoints: number;
  hardwareConcurrency: number;
  deviceMemory: number | null;
  screenResolution: string;
  colorDepth: number;
  pixelRatio: number;
  isOnline: boolean;
  connectionType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

export interface GpuDetails {
  supported: boolean;
  webglVersion: string;
  vendor: string;
  renderer: string;
  unmaskedVendor: string;
  unmaskedRenderer: string;
  maxTextureSize: number;
  isHardwareAccelerated: boolean;
  extensionsCount: number;
}

export interface StorageQuotaDetails {
  supported: boolean;
  usageBytes: number;
  quotaBytes: number;
  usageFormatted: string;
  quotaFormatted: string;
  percentUsed: number;
  isPersistent: boolean;
}

export interface DetectedExtensionArtifact {
  id: string;
  name: string;
  category: 'wallet' | 'password_manager' | 'devtools' | 'grammar' | 'adblocker' | 'translation' | 'unknown';
  detectedVia: string;
  signature: string;
  riskLevel: 'low' | 'medium' | 'high' | 'info';
  description: string;
  impactOnPerformance: string;
  recommendation: string;
}

export interface ExtensionOverheadResult {
  domQueryLatencyMs: number;
  mutationDispatchLatencyMs: number;
  storageAccessLatencyMs: number;
  detectedOverheadScore: number; // 0 (ideal) to 100 (heavy overhead)
  overheadRating: 'minimal' | 'moderate' | 'high' | 'critical';
  details: string;
}

export interface BenchmarkMetrics {
  domThrashTimeMs: number | null;
  jsComputeTimeMs: number | null;
  webglFps: number | null;
  webglMinFps: number | null;
  memoryHeapUsedMb: number | null;
  memoryHeapTotalMb: number | null;
  overallScore: number | null;
}

export interface SecurityPrivacyStatus {
  isSecureContext: boolean;
  globalPrivacyControl: boolean | null;
  doNotTrack: string | null;
  canvasFingerprintHash: string;
  canvasPoisoningDetected: boolean;
  audioFingerprintHash: string;
  webRtcIpLeakDetected: boolean;
  webRtcCandidateCount: number;
  permissions: Record<string, 'granted' | 'denied' | 'prompt' | 'unsupported'>;
  thirdPartyCookiesPartioned: boolean;
}

export interface OptimizationChecklistItem {
  id: string;
  title: string;
  category: 'performance' | 'security' | 'extensions' | 'memory';
  impact: 'high' | 'medium' | 'low';
  description: string;
  actionText: string;
  shortcutUrl?: string;
  completed: boolean;
}
