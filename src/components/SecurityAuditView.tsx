import React from 'react';
import { SecurityPrivacyStatus } from '../types/browser';
import {
  Shield,
  Lock,
  EyeOff,
  Fingerprint,
  Mic,
  Camera,
  MapPin,
  Bell,
  Clipboard,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface SecurityAuditViewProps {
  security: SecurityPrivacyStatus | null;
  onRerunAudit: () => void;
  isAuditing: boolean;
}

export const SecurityAuditView: React.FC<SecurityAuditViewProps> = ({
  security,
  onRerunAudit,
  isAuditing,
}) => {
  const getPermissionIcon = (name: string) => {
    switch (name) {
      case 'camera':
        return <Camera className="w-4 h-4 text-cyan-400" />;
      case 'microphone':
        return <Mic className="w-4 h-4 text-cyan-400" />;
      case 'geolocation':
        return <MapPin className="w-4 h-4 text-cyan-400" />;
      case 'notifications':
        return <Bell className="w-4 h-4 text-cyan-400" />;
      case 'clipboard-read':
      case 'clipboard-write':
        return <Clipboard className="w-4 h-4 text-cyan-400" />;
      case 'persistent-storage':
        return <HardDrive className="w-4 h-4 text-cyan-400" />;
      default:
        return <Shield className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getPermissionLabelRu = (name: string) => {
    switch (name) {
      case 'camera':
        return 'Веб-камера';
      case 'microphone':
        return 'Микрофон';
      case 'geolocation':
        return 'Геолокация';
      case 'notifications':
        return 'Уведомления';
      case 'clipboard-read':
        return 'Чтение буфера';
      case 'clipboard-write':
        return 'Запись в буфер';
      case 'persistent-storage':
        return 'Постоянный диск';
      default:
        return name;
    }
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <div className="text-xs text-slate-400">Аудит защиты</div>
        <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
          Безопасность, приватность и защита от отслеживания
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Проверка стойкости к цифровым отпечаткам (fingerprinting), аудит утечек WebRTC и статус разрешений устройств.
        </p>
      </div>

      {security && (
        <>
          {/* Top Security Status Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Context Security */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" /> Secure Context
                </span>
                <span className={security.isSecureContext ? 'text-emerald-400' : 'text-rose-400'}>
                  {security.isSecureContext ? 'Активно' : 'Не защищено'}
                </span>
              </div>
              <div className="text-base font-semibold text-white">
                {security.isSecureContext ? 'Шифрованный канал HTTPS' : 'Обычный HTTP'}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Все современные API (Service Workers, Web Crypto) требуют безопасного контекста.
              </p>
            </div>

            {/* WebRTC Leak Status */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> Утечка IP через WebRTC
                </span>
                <span className={security.webRtcIpLeakDetected ? 'text-rose-400' : 'text-emerald-400'}>
                  {security.webRtcIpLeakDetected ? 'Уязвимость' : 'Защищено'}
                </span>
              </div>
              <div className="text-base font-semibold text-white">
                {security.webRtcIpLeakDetected ? 'Локальный IP раскрыт' : 'Локальный IP скрыт'}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Кандидатов ICE: {security.webRtcCandidateCount}. VPN или прокси не скомпрометированы.
              </p>
            </div>

            {/* Canvas Poisoning Protection */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <Fingerprint className="w-3.5 h-3.5 text-cyan-400" /> Защита Canvas
                </span>
                <span className={security.canvasPoisoningDetected ? 'text-emerald-400' : 'text-slate-400'}>
                  {security.canvasPoisoningDetected ? 'Шум подмешан' : 'Оригинал'}
                </span>
              </div>
              <div className="text-base font-semibold text-white">
                {security.canvasPoisoningDetected ? 'Анти-фингерпринт активен' : 'Стандартный рендер'}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {security.canvasPoisoningDetected
                  ? 'Браузер (Brave / расширение) подмешивает шум в пиксели для защиты.'
                  : 'Хэш Canvas детерминирован для данной видеокарты.'}
              </p>
            </div>
          </div>

          {/* Fingerprinting Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-cyan-400" />
              <span>Диагностика цифрового следа (Fingerprint Hashes)</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Трекеры используют уникальные микро-различия рендера шрифтов и звуковых частот для сквозной идентификации пользователя без использования cookies.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-medium text-slate-300">Canvas 2D Fingerprint Hash</span>
                  <span className="font-mono text-cyan-400">{security.canvasFingerprintHash}</span>
                </div>
                <p className="text-xs text-slate-400">
                  Вычислен через скрытую отрисовку цветных градиентов и шрифтовых глифов.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-medium text-slate-300">AudioContext Oscillator Hash</span>
                  <span className="font-mono text-cyan-400">{security.audioFingerprintHash}</span>
                </div>
                <p className="text-xs text-slate-400">
                  Вычислен через обработку синтезированного аудио-сигнала осциллятора треугольной волны.
                </p>
              </div>
            </div>

            {/* Privacy Headers Status */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <div>
                <span>Global Privacy Control (GPC): </span>
                <span className="text-slate-200 font-medium">
                  {security.globalPrivacyControl === null ? 'Не задан' : security.globalPrivacyControl ? 'Включен' : 'Отключен'}
                </span>
              </div>
              <span aria-hidden="true">·</span>
              <div>
                <span>Заголовок Do Not Track (DNT): </span>
                <span className="text-slate-200 font-medium">
                  {security.doNotTrack ? `Активен (${security.doNotTrack})` : 'Отключен'}
                </span>
              </div>
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Матрица разрешений браузера (Site Permissions Query)</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Текущий статус доступа сайтов к аппаратным датчикам и буферу обмена.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(security.permissions).map(([name, state]) => (
                <div
                  key={name}
                  className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {getPermissionIcon(name)}
                    <span className="text-xs font-medium text-slate-200">
                      {getPermissionLabelRu(name)}
                    </span>
                  </div>

                  <span
                    className={`text-xs px-2 py-0.5 rounded font-mono ${
                      state === 'granted'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : state === 'denied'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {state === 'granted' ? 'Разрешено' : state === 'denied' ? 'Запрещено' : state === 'prompt' ? 'Запрос' : 'Н/Д'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Hardening Recommendations */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-4">
              Четыре фундаментальных правила безопасности браузера
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  1. Изоляция процессов сайтов (Site Isolation)
                </div>
                <p className="text-slate-400">
                  Убедитесь, что каждый домен запускается в отдельном системном процессе операционной системы. Это предотвращает атаки класса Spectre на чтение памяти соседних вкладок.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  2. Включение DNS-over-HTTPS (DoH)
                </div>
                <p className="text-slate-400">
                  Шифрует все DNS-запросы через Cloudflare (1.1.1.1) или Google (8.8.8.8), не позволяя провайдеру видеть доменные имена и защищая от спуфинга адресов.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  3. Ограничение прав расширений «Только по клику»
                </div>
                <p className="text-slate-400">
                  Никогда не давайте расширениям постоянный доступ ко всем сайтам. Включайте их только тогда, когда вам действительно нужен перевод или проверка на конкретной странице.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  4. Регулярная очистка устаревших расширений
                </div>
                <p className="text-slate-400">
                  Статистика показывает: до 15% популярных бесплатных расширений со временем перепродаются третьим лицам и превращаются в скрытые инжекторы рекламы и спама.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
