import React, { useState } from 'react';
import {
  BrowserDetails,
  GpuDetails,
  StorageQuotaDetails,
  DetectedExtensionArtifact,
  ExtensionOverheadResult,
  BenchmarkMetrics,
  SecurityPrivacyStatus,
} from '../types/browser';
import { X, Copy, Download, Printer, CheckCircle2 } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  browser: BrowserDetails;
  gpu: GpuDetails;
  storage: StorageQuotaDetails;
  extensions: DetectedExtensionArtifact[];
  overhead: ExtensionOverheadResult | null;
  benchmarks: BenchmarkMetrics;
  security: SecurityPrivacyStatus | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  browser,
  gpu,
  storage,
  extensions,
  overhead,
  benchmarks,
  security,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const diagnosticReport = {
    generatedAt: new Date().toISOString(),
    system: {
      browser: browser.name,
      version: browser.version,
      engine: browser.engine,
      os: browser.os,
      hardwareConcurrency: browser.hardwareConcurrency,
      deviceMemoryGb: browser.deviceMemory,
      screenResolution: browser.screenResolution,
      userAgent: browser.userAgent,
    },
    gpu: {
      renderer: gpu.unmaskedRenderer,
      vendor: gpu.unmaskedVendor,
      webgl: gpu.webglVersion,
      isHardwareAccelerated: gpu.isHardwareAccelerated,
      maxTextureSize: gpu.maxTextureSize,
    },
    storage: {
      usageFormatted: storage.usageFormatted,
      quotaFormatted: storage.quotaFormatted,
      percentUsed: storage.percentUsed,
    },
    extensions: {
      detectedArtifactsCount: extensions.length,
      detectedList: extensions.map((e) => ({
        name: e.name,
        signature: e.signature,
        category: e.category,
        riskLevel: e.riskLevel,
      })),
      domOverhead: overhead,
    },
    benchmarks: {
      overallScore: benchmarks.overallScore,
      domThrashMs: benchmarks.domThrashTimeMs,
      jsComputeMs: benchmarks.jsComputeTimeMs,
      webglFps: benchmarks.webglFps,
      webglMinFps: benchmarks.webglMinFps,
      memoryHeapUsedMb: benchmarks.memoryHeapUsedMb,
    },
    security: {
      isSecureContext: security?.isSecureContext,
      canvasFingerprintHash: security?.canvasFingerprintHash,
      canvasPoisoningDetected: security?.canvasPoisoningDetected,
      audioFingerprintHash: security?.audioFingerprintHash,
      webRtcIpLeakDetected: security?.webRtcIpLeakDetected,
      permissions: security?.permissions,
    },
  };

  const jsonString = JSON.stringify(diagnosticReport, null, 2);

  const copyReport = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `browser-diagnostic-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white">Экспорт диагностического отчёта</h2>
            <div className="text-xs text-slate-400 mt-0.5">
              Сводка параметров для передачи в техническую поддержку или архива
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs">
          <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-slate-300 overflow-x-auto selection:bg-cyan-500/20 leading-relaxed">
            {jsonString}
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <button
              onClick={copyReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Скопировано</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Копировать JSON</span>
                </>
              )}
            </button>

            <button
              onClick={downloadJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать .json</span>
            </button>
          </div>

          <button
            onClick={printReport}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Печать / PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
