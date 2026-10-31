import React from 'react';
import {
  BrowserDetails,
  GpuDetails,
  StorageQuotaDetails,
  DetectedExtensionArtifact,
  ExtensionOverheadResult,
  BenchmarkMetrics,
  SecurityPrivacyStatus,
} from '../types/browser';
import {
  Cpu,
  Monitor,
  Shield,
  Layers,
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  Zap,
  ArrowRight,
  Gauge,
  Wifi,
} from 'lucide-react';

interface DashboardOverviewProps {
  browser: BrowserDetails;
  gpu: GpuDetails;
  storage: StorageQuotaDetails;
  extensions: DetectedExtensionArtifact[];
  overhead: ExtensionOverheadResult | null;
  benchmarks: BenchmarkMetrics;
  security: SecurityPrivacyStatus | null;
  onNavigate: (tab: string) => void;
  onRunBenchmark: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  browser,
  gpu,
  storage,
  extensions,
  overhead,
  benchmarks,
  security,
  onNavigate,
  onRunBenchmark,
}) => {
  // Calculate a composite health index
  let healthScore = 80;
  if (gpu.isHardwareAccelerated) healthScore += 10;
  else healthScore -= 20;

  if (overhead && overhead.overheadRating === 'critical') healthScore -= 25;
  else if (overhead && overhead.overheadRating === 'high') healthScore -= 15;
  else healthScore += 5;

  if (security && !security.webRtcIpLeakDetected) healthScore += 5;
  if (storage.supported && storage.percentUsed > 85) healthScore -= 10;
  healthScore = Math.max(20, Math.min(100, healthScore));

  const getHealthStatus = (score: number) => {
    if (score >= 85) return { label: 'Отличное состояние', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (score >= 65) return { label: 'Хорошее состояние', color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
    if (score >= 45) return { label: 'Требуется оптимизация', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    return { label: 'Критические неполадки', color: 'text-rose-400', bg: 'bg-rose-500/10' };
  };

  const status = getHealthStatus(healthScore);

  return (
    <div className="space-y-8">
      {/* Hero Diagnostic Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
              <span>Диагностическая сессия</span>
              <span aria-hidden="true">·</span>
              <span>Движок: {browser.engine}</span>
              <span aria-hidden="true">·</span>
              <span>Платформа: {browser.os}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              {browser.name} <span className="text-cyan-400 font-mono text-xl">{browser.version}</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Анализ текущего окружения браузера, проверка стабильности расширений, нагрузочные замеры и аудит безопасности.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 px-5 py-4 rounded-xl shrink-0">
            <div>
              <div className="text-xs text-slate-500 font-medium">Индекс здоровья браузера</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-bold font-mono text-white tabular-nums">{healthScore}</span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
              <div className={`text-xs font-medium mt-1 ${status.color}`}>
                {status.label}
              </div>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center bg-slate-900 text-cyan-400">
              <Gauge className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Diagnostic Vital Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Card 1: Hardware & Threads */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Процессор & Память
              </span>
            </div>
            <div className="text-base font-semibold text-slate-200">
              {browser.hardwareConcurrency} потоков ЦП
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>{browser.deviceMemory ? `≈ ${browser.deviceMemory} ГБ RAM` : 'ОЗУ скрыто браузером'}</span>
              <span aria-hidden="true">·</span>
              <span>{browser.screenResolution}</span>
            </div>
          </div>

          {/* Card 2: GPU Acceleration */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Monitor className="w-3.5 h-3.5 text-cyan-400" /> Графика (GPU)
              </span>
              {gpu.isHardwareAccelerated ? (
                <span className="text-emerald-400 text-xs">Активно</span>
              ) : (
                <span className="text-amber-400 text-xs">Программный</span>
              )}
            </div>
            <div className="text-base font-semibold text-slate-200 truncate" title={gpu.unmaskedRenderer}>
              {gpu.unmaskedRenderer || 'Рендерер не определен'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {gpu.webglVersion} · Текстуры: {gpu.maxTextureSize}px
            </div>
          </div>

          {/* Card 3: Extensions Health */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Layers className="w-3.5 h-3.5 text-cyan-400" /> Расширения
              </span>
              <span className="text-xs font-mono text-cyan-400 tabular-nums">
                {extensions.length} артефактов
              </span>
            </div>
            <div className="text-base font-semibold text-slate-200">
              {overhead ? `${overhead.detectedOverheadScore}/100 задержка` : 'Сканирование...'}
            </div>
            <div className="text-xs text-slate-400 mt-1 truncate">
              {overhead?.overheadRating === 'minimal'
                ? 'Низкий оверхед на DOM'
                : overhead?.overheadRating === 'critical'
                ? 'Высокая задержка мутаций'
                : 'Умеренная нагрузка'}
            </div>
          </div>

          {/* Card 4: Storage & Quota */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <HardDrive className="w-3.5 h-3.5 text-cyan-400" /> Квота хранилища
              </span>
              <span className="text-xs font-mono text-slate-400 tabular-nums">
                {storage.percentUsed}%
              </span>
            </div>
            <div className="text-base font-semibold text-slate-200">
              {storage.usageFormatted} занято
            </div>
            <div className="text-xs text-slate-400 mt-1">
              из {storage.quotaFormatted} доступных
            </div>
          </div>
        </div>
      </div>

      {/* Critical Warnings & Attention Banner */}
      {!gpu.isHardwareAccelerated && (
        <div className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-amber-200">
              Аппаратное ускорение графики отключено или сброшено на программный рендер
            </h2>
            <p className="text-xs text-amber-300/80 mt-1">
              Отрисовка видео, анимаций и WebGL выполняется центральным процессором вместо видеокарты ({gpu.unmaskedRenderer}). Это приводит к рывкам при скроллинге и быстрому разряду батареи.
            </p>
            <button
              onClick={() => onNavigate('troubleshooting')}
              className="mt-2 text-xs font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 transition-colors"
            >
              Инструкция по включению ускорения GPU <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {overhead && overhead.overheadRating === 'critical' && (
        <div className="bg-rose-950/30 border border-rose-800/60 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-rose-200">
              Высокая задержка DOM-операций из-за скриптов расширений
            </h2>
            <p className="text-xs text-rose-300/80 mt-1">
              Зафиксирована повышенная задержка ({overhead.domQueryLatencyMs} мс) при вставке элементов формы и обработке мутаций. Некоторые расширения замедляют работу веб-страниц.
            </p>
            <button
              onClick={() => onNavigate('extensions')}
              className="mt-2 text-xs font-semibold text-rose-400 hover:text-rose-300 inline-flex items-center gap-1 transition-colors"
            >
              Открыть мастер разрешения конфликтов <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Feature Deep-Dive Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Module 1: Extension Audit */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center text-cyan-400 mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Аудит конфликтов расширений</h2>
            <p className="text-xs text-slate-400 mt-2 line-clamp-3">
              Сканирование внедрённых глобальных переменных (Web3, менеджеры паролей, DevTools, AdBlock), диагностика сбоев вёрстки и калькулятор риска разрешений.
            </p>

            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Обнаружено сигнатур:</span>
              <span className="font-mono font-medium text-slate-200 tabular-nums">{extensions.length}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('extensions')}
            className="mt-5 w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Исследовать расширения</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Module 2: Performance Benchmarks */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400 mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Тесты производительности</h2>
            <p className="text-xs text-slate-400 mt-2 line-clamp-3">
              Стресс-тестирование DOM Thrashing, вычислений JavaScript JIT, замер частоты кадров WebGL (FPS) и мониторинг кучи памяти (JS Heap).
            </p>

            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Стресс-тест FPS:</span>
              <span className="font-mono font-medium text-slate-200 tabular-nums">
                {benchmarks.webglFps ? `${benchmarks.webglFps} кадр/с` : 'Не запущен'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              onNavigate('performance');
              onRunBenchmark();
            }}
            className="mt-5 w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Запустить бенчмарки</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Module 3: Security & Privacy */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-purple-950/60 border border-purple-800/50 flex items-center justify-center text-purple-400 mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Безопасность и приватность</h2>
            <p className="text-xs text-slate-400 mt-2 line-clamp-3">
              Анализ защиты от фингерпринтинга (Canvas/Audio), утечки локального IP через WebRTC, проверка Secure Context и разрешений сайта.
            </p>

            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Утечка WebRTC:</span>
              <span className="font-mono font-medium text-slate-200">
                {security ? (security.webRtcIpLeakDetected ? 'Обнаружена' : 'Защищено') : 'Проверка...'}
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('security')}
            className="mt-5 w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Проверить безопасность</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Troubleshooting & Optimization Prompt */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">
              Готовый 5-минутный чеклист оптимизации браузера
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Включение Memory Saver, очистка фоновых расширений и настройка безопасного DNS.
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('troubleshooting')}
          className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          Открыть чеклист оптимизации
        </button>
      </div>
    </div>
  );
};
