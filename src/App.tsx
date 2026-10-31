import React, { useState, useEffect, useCallback } from 'react';
import {
  BrowserDetails,
  GpuDetails,
  StorageQuotaDetails,
  DetectedExtensionArtifact,
  ExtensionOverheadResult,
  BenchmarkMetrics,
  SecurityPrivacyStatus,
} from './types/browser';
import {
  detectBrowserDetails,
  detectGpuDetails,
  detectStorageQuota,
} from './utils/browserDetector';
import {
  scanForExtensionArtifacts,
  measureExtensionOverhead,
} from './utils/extensionScanner';
import { runSecurityAudit } from './utils/securityAuditor';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { SystemInspectionView } from './components/SystemInspectionView';
import { ExtensionInspectorView } from './components/ExtensionInspectorView';
import { PerformanceBenchmarkView } from './components/PerformanceBenchmarkView';
import { SecurityAuditView } from './components/SecurityAuditView';
import { TroubleshootingView } from './components/TroubleshootingView';
import { ExportModal } from './components/ExportModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isRetestingOverhead, setIsRetestingOverhead] = useState<boolean>(false);

  // Core Diagnostic States
  const [browser, setBrowser] = useState<BrowserDetails>(() => detectBrowserDetails());
  const [gpu, setGpu] = useState<GpuDetails>(() => detectGpuDetails());
  const [storage, setStorage] = useState<StorageQuotaDetails>({
    supported: false,
    usageBytes: 0,
    quotaBytes: 0,
    usageFormatted: 'Загрузка...',
    quotaFormatted: 'Загрузка...',
    percentUsed: 0,
    isPersistent: false,
  });
  const [extensions, setExtensions] = useState<DetectedExtensionArtifact[]>([]);
  const [overhead, setOverhead] = useState<ExtensionOverheadResult | null>(null);
  const [benchmarks, setBenchmarks] = useState<BenchmarkMetrics>({
    domThrashTimeMs: null,
    jsComputeTimeMs: null,
    webglFps: null,
    webglMinFps: null,
    memoryHeapUsedMb: null,
    memoryHeapTotalMb: null,
    overallScore: null,
  });
  const [security, setSecurity] = useState<SecurityPrivacyStatus | null>(null);

  // Full scan workflow
  const runFullScan = useCallback(async () => {
    setIsScanning(true);
    try {
      const bDetails = detectBrowserDetails();
      const gDetails = detectGpuDetails();
      setBrowser(bDetails);
      setGpu(gDetails);

      const [sDetails, extList, ovResult, secStatus] = await Promise.all([
        detectStorageQuota(),
        scanForExtensionArtifacts(),
        measureExtensionOverhead(),
        runSecurityAudit(),
      ]);

      setStorage(sDetails);
      setExtensions(extList);
      setOverhead(ovResult);
      setSecurity(secStatus);
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    runFullScan();
  }, [runFullScan]);

  const handleRetestOverhead = async () => {
    setIsRetestingOverhead(true);
    try {
      const result = await measureExtensionOverhead();
      setOverhead(result);
    } finally {
      setIsRetestingOverhead(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRunScan={runFullScan}
        onOpenExport={() => setIsExportOpen(true)}
        isScanning={isScanning}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <DashboardOverview
            browser={browser}
            gpu={gpu}
            storage={storage}
            extensions={extensions}
            overhead={overhead}
            benchmarks={benchmarks}
            security={security}
            onNavigate={setActiveTab}
            onRunBenchmark={() => setActiveTab('performance')}
          />
        )}

        {activeTab === 'system' && (
          <SystemInspectionView
            browser={browser}
            gpu={gpu}
            storage={storage}
          />
        )}

        {activeTab === 'extensions' && (
          <ExtensionInspectorView
            extensions={extensions}
            overhead={overhead}
            onRetestOverhead={handleRetestOverhead}
            isRetesting={isRetestingOverhead}
          />
        )}

        {activeTab === 'performance' && (
          <PerformanceBenchmarkView
            benchmarks={benchmarks}
            onUpdateBenchmarks={setBenchmarks}
          />
        )}

        {activeTab === 'security' && (
          <SecurityAuditView
            security={security}
            onRerunAudit={runFullScan}
            isAuditing={isScanning}
          />
        )}

        {activeTab === 'troubleshooting' && <TroubleshootingView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">BrowserDiag Studio</span>
            <span>·</span>
            <span>Автономная клиентская диагностика браузера</span>
          </div>
          <div>
            <span>Конфиденциальность: все тесты проводятся локально в песочнице браузера без отправки персональных данных</span>
          </div>
        </div>
      </footer>

      {/* Export Report Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        browser={browser}
        gpu={gpu}
        storage={storage}
        extensions={extensions}
        overhead={overhead}
        benchmarks={benchmarks}
        security={security}
      />
    </div>
  );
}
