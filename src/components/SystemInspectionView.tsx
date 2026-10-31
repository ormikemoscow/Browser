import React from 'react';
import { BrowserDetails, GpuDetails, StorageQuotaDetails } from '../types/browser';
import { detectWebCapabilities } from '../utils/browserDetector';
import {
  Cpu,
  Monitor,
  HardDrive,
  Globe,
  Radio,
  Check,
  X,
  Copy,
  CheckCircle,
} from 'lucide-react';

interface SystemInspectionViewProps {
  browser: BrowserDetails;
  gpu: GpuDetails;
  storage: StorageQuotaDetails;
}

export const SystemInspectionView: React.FC<SystemInspectionViewProps> = ({
  browser,
  gpu,
  storage,
}) => {
  const [copiedUa, setCopiedUa] = React.useState(false);
  const capabilities = React.useMemo(() => detectWebCapabilities(), []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUa(true);
    setTimeout(() => setCopiedUa(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <div className="text-xs text-slate-400">Системные характеристики</div>
        <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
          Полная спецификация браузера и среды
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Точные параметры движка, аппаратные ресурсы, графический рендерер и квоты постоянного хранилища.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: Browser & Platform Engine */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2.5 text-slate-200 font-semibold mb-4">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Движок и идентификация браузера</span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Определенный браузер</span>
              <span className="text-slate-100 font-medium">{browser.name}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Версия сборки</span>
              <span className="font-mono text-cyan-400 font-medium tabular-nums">{browser.version}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Движок рендеринга</span>
              <span className="text-slate-200 font-medium">{browser.engine}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Операционная система</span>
              <span className="text-slate-200 font-medium">{browser.os}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Язык интерфейса</span>
              <span className="text-slate-200 font-mono text-xs">{browser.language} ({browser.languages.join(', ')})</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Поддержка Cookies</span>
              <span className={browser.cookieEnabled ? 'text-emerald-400' : 'text-rose-400'}>
                {browser.cookieEnabled ? 'Включены' : 'Отключены'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-400">Встроенный просмотр PDF</span>
              <span className={browser.pdfViewerEnabled ? 'text-emerald-400' : 'text-slate-400'}>
                {browser.pdfViewerEnabled ? 'Поддерживается' : 'Нет'}
              </span>
            </div>
          </div>

          {/* User Agent Block */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Полная строка User-Agent:</span>
              <button
                onClick={() => copyToClipboard(browser.userAgent)}
                className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {copiedUa ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUa ? 'Скопировано' : 'Копировать'}</span>
              </button>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80 font-mono text-xs text-slate-300 break-all select-all leading-relaxed">
              {browser.userAgent}
            </div>
          </div>
        </div>

        {/* Module 2: Hardware & Display Specs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2.5 text-slate-200 font-semibold mb-4">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Аппаратные ресурсы и экран</span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Логические ядра CPU</span>
              <span className="font-mono text-slate-100 font-medium tabular-nums">
                {browser.hardwareConcurrency} потоков
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Оперативная память устройства</span>
              <span className="font-mono text-slate-100 font-medium tabular-nums">
                {browser.deviceMemory ? `≥ ${browser.deviceMemory} ГБ RAM` : 'Скрыто браузером (защита)'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Разрешение экрана</span>
              <span className="font-mono text-slate-200 tabular-nums">{browser.screenResolution}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Масштаб пикселей (DPI Scale)</span>
              <span className="font-mono text-slate-200 tabular-nums">{browser.pixelRatio}x</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Глубина цвета</span>
              <span className="font-mono text-slate-200 tabular-nums">{browser.colorDepth} бит</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Сенсорные точки касания</span>
              <span className="font-mono text-slate-200 tabular-nums">{browser.maxTouchPoints}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-400">Тип устройства</span>
              <span className="text-slate-200">{browser.isMobile ? 'Мобильное устройство' : 'Десктоп / ПК'}</span>
            </div>
          </div>
        </div>

        {/* Module 3: GPU & WebGL Diagnostics */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5 text-slate-200 font-semibold">
              <Monitor className="w-4 h-4 text-cyan-400" />
              <span>Графический ускоритель (GPU & WebGL)</span>
            </div>
            <span
              className={`text-xs px-2.5 py-0.5 rounded font-medium ${
                gpu.isHardwareAccelerated
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {gpu.isHardwareAccelerated ? 'Hardware ускорение активно' : 'Программный рендер'}
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Unmasked видеокарта</span>
              <span className="font-mono text-xs text-slate-100 font-medium text-right max-w-xs truncate" title={gpu.unmaskedRenderer}>
                {gpu.unmaskedRenderer}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Производитель чипа (Vendor)</span>
              <span className="text-slate-200 font-medium">{gpu.unmaskedVendor}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Контекст WebGL</span>
              <span className="text-cyan-400 font-mono font-medium">{gpu.webglVersion}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Максимальный размер текстуры</span>
              <span className="font-mono text-slate-200 tabular-nums">{gpu.maxTextureSize} × {gpu.maxTextureSize} px</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-400">Поддерживаемые WebGL расширения</span>
              <span className="font-mono text-slate-200 tabular-nums">{gpu.extensionsCount} модулей</span>
            </div>
          </div>
        </div>

        {/* Module 4: Storage Quotas & Network */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2.5 text-slate-200 font-semibold mb-4">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <span>Квота дискового хранилища (Origin Storage)</span>
          </div>

          {storage.supported ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span>Заполнение квоты</span>
                  <span className="font-mono text-slate-200 tabular-nums">{storage.percentUsed}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(2, storage.percentUsed)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2.5 text-sm pt-2">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Использовано</span>
                  <span className="font-mono text-slate-200 tabular-nums">{storage.usageFormatted}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Выделенная квота</span>
                  <span className="font-mono text-slate-200 tabular-nums">{storage.quotaFormatted}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-400">Постоянное хранение (Persistent)</span>
                  <span className={storage.isPersistent ? 'text-emerald-400' : 'text-slate-400'}>
                    {storage.isPersistent ? 'Разрешено' : 'Временное (Best Effort)'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 p-4 bg-slate-950 rounded border border-slate-800">
              API оценки квоты (StorageManager) заблокирован или не поддерживается данным браузером.
            </div>
          )}

          {/* Network details strip */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>Сетевой стек</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <div className="text-slate-500">Тип канала</div>
                <div className="text-slate-200 font-mono font-medium mt-0.5">
                  {browser.connectionType ? browser.connectionType.toUpperCase() : 'Wi-Fi / Ethernet'}
                </div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <div className="text-slate-500">RTT (Пинг) / Скорость</div>
                <div className="text-slate-200 font-mono font-medium mt-0.5 tabular-nums">
                  {browser.rtt ? `${browser.rtt} мс` : '—'} · {browser.downlink ? `${browser.downlink} Мбит/с` : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Web Capabilities Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-base font-semibold text-white mb-2">
          Поддержка современных браузерных API и стандартов
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Аудит наличия прогрессивных интерфейсов для рендеринга, изоляции и параллельных вычислений.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(capabilities).map(([feature, isSupported]) => (
            <div
              key={feature}
              className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 flex items-center justify-between"
            >
              <span className="text-xs font-medium text-slate-300">{feature}</span>
              {isSupported ? (
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>Да</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                  <X className="w-3.5 h-3.5" />
                  <span>Нет</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
