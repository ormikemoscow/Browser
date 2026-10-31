import React, { useState } from 'react';
import { DetectedExtensionArtifact, ExtensionOverheadResult } from '../types/browser';
import {
  Layers,
  Zap,
  AlertTriangle,
  ShieldAlert,
  Info,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface ExtensionInspectorViewProps {
  extensions: DetectedExtensionArtifact[];
  overhead: ExtensionOverheadResult | null;
  onRetestOverhead: () => void;
  isRetesting: boolean;
}

export const ExtensionInspectorView: React.FC<ExtensionInspectorViewProps> = ({
  extensions,
  overhead,
  onRetestOverhead,
  isRetesting,
}) => {
  // Triage Wizard State
  const [selectedSymptom, setSelectedSymptom] = useState<string>('form_broken');

  // Permission Risk Calculator State
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'all_urls',
    'cookies',
  ]);

  const permissionDefinitions = [
    {
      id: 'all_urls',
      name: '<all_urls> / *://*/*',
      title: 'Доступ ко всем сайтам',
      risk: 40,
      description: 'Позволяет читать и изменять текст, пароли и данные форм на любых страницах.',
    },
    {
      id: 'webRequestBlocking',
      name: 'webRequestBlocking',
      title: 'Блокировка и перехват трафика',
      risk: 30,
      description: 'Может перехватывать сетевые запросы до их отправки, читать заголовки и токены.',
    },
    {
      id: 'cookies',
      name: 'cookies',
      title: 'Чтение и запись Cookies',
      risk: 25,
      description: 'Позволяет скопировать сессионные cookies и войти в ваши аккаунты без пароля.',
    },
    {
      id: 'clipboardRead',
      name: 'clipboardRead',
      title: 'Чтение буфера обмена',
      risk: 20,
      description: 'Может прочитать скопированные пароли, номера карт или приватные ключи.',
    },
    {
      id: 'nativeMessaging',
      name: 'nativeMessaging',
      title: 'Обмен данными с программами ОС',
      risk: 25,
      description: 'Позволяет расширению запускать исполняемые файлы вне песочницы браузера.',
    },
    {
      id: 'activeTab',
      name: 'activeTab',
      title: 'Доступ только к активной вкладке по клику',
      risk: 5,
      description: 'Безопасное разрешение: работает только когда пользователь сам кликает на значок.',
    },
    {
      id: 'declarativeNetRequest',
      name: 'declarativeNetRequest',
      title: 'Декларативная блокировка (Manifest V3)',
      risk: 5,
      description: 'Браузер сам блокирует рекламу по правилам, не отдавая расширению доступ к данным.',
    },
    {
      id: 'storage',
      name: 'storage',
      title: 'Локальное хранилище настроек',
      risk: 0,
      description: 'Хранение настроек расширения в изолированной базе данных браузера.',
    },
  ];

  const togglePermission = (id: string) => {
    if (selectedPermissions.includes(id)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== id));
    } else {
      setSelectedPermissions([...selectedPermissions, id]);
    }
  };

  const calculatedRiskScore = Math.min(
    100,
    selectedPermissions.reduce((total, id) => {
      const perm = permissionDefinitions.find((p) => p.id === id);
      return total + (perm ? perm.risk : 0);
    }, 0)
  );

  const getRiskLabel = (score: number) => {
    if (score >= 60) return { label: 'Критический риск безопасности', color: 'text-rose-400', bg: 'bg-rose-500/10' };
    if (score >= 35) return { label: 'Повышенный уровень риска', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    if (score >= 15) return { label: 'Умеренный риск', color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
    return { label: 'Минимальный риск (Безопасно)', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
  };

  const riskLabel = getRiskLabel(calculatedRiskScore);

  const triageOptions = [
    {
      id: 'form_broken',
      title: 'Ломаются кнопки, поля ввода или валидация форм',
      rootCause: 'Менеджеры паролей или переводчики внедряют свои элементы прямо в структуру <input> и <form>, ломая Virtual DOM сайтов.',
      steps: [
        'Шаг 1: Проверьте сайт в режиме Инкогнито (Ctrl+Shift+N). Если форма работает — дело в расширении.',
        'Шаг 2: Временно отключите автозаполнение паролей в LastPass / Bitwarden / 1Password.',
        'Шаг 3: Отключите автоперевод страниц (Google Translate, Яндекс.Переводчик) — он повреждает текстовые узлы.',
        'Шаг 4: Настройте менеджер паролей на вставку по клику правой кнопкой мыши вместо автоматического сканирования полей.',
      ],
    },
    {
      id: 'video_broken',
      title: 'Не воспроизводится видео плеер или заблокирован контент',
      rootCause: 'Блокировщик рекламы (uBlock, AdGuard) ошибочно заблокировал CDN-сервер видеопотока или файл манифеста плеера.',
      steps: [
        'Шаг 1: Нажмите на значок блокировщика рекламы в правом верхнем углу браузера.',
        'Шаг 2: Нажмите большую круглую кнопку выключения для текущего домена (добавление в белый список).',
        'Шаг 3: Перезагрузите страницу с зажатой клавишей Ctrl (жесткое обновление кэша).',
        'Шаг 4: Если помогло, обновите фильтры в настройках расширения (Очистить кэш -> Обновить списки фильтров).',
      ],
    },
    {
      id: 'high_cpu_lag',
      title: 'Вкладка тормозит, скроллинг рывками или вентилятор шумит',
      rootCause: 'Расширение для проверки орфографии, поиска скидок или скрейпинга сканирует каждую мутацию DOM на странице.',
      steps: [
        'Шаг 1: Нажмите Shift + Esc, чтобы открыть встроенный Диспетчер задач браузера.',
        'Шаг 2: Кликните по колонке "ЦП" (CPU) для сортировки по убыванию.',
        'Шаг 3: Найдите процесс со значком "Расширение: [Имя]". Если оно постоянно держит 15-50% CPU — нажмите "Завершить процесс".',
        'Шаг 4: Зайдите в chrome://extensions/ и ограничьте расширению доступ: "Доступ к сайту: при нажатии".',
      ],
    },
    {
      id: 'cors_redirect_loop',
      title: 'Бесконечная перезагрузка страницы или сетевая ошибка CORS',
      rootCause: 'VPN-расширения, прокси или модификаторы HTTP-заголовков (ModHeader) ломают токены безопасности Origin.',
      steps: [
        'Шаг 1: Отключите все активные VPN и анти-блокировочные расширения.',
        'Шаг 2: Откройте chrome://net-internals/#dns и нажмите кнопку "Clear host cache" для сброса DNS-кеша браузера.',
        'Шаг 3: Нажмите F12 -> вкладка Application -> Storage -> Clear site data для сброса битой сессии.',
      ],
    },
  ];

  const currentTriage = triageOptions.find((t) => t.id === selectedSymptom) || triageOptions[0];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <div className="text-xs text-slate-400">Анализ стороннего кода</div>
        <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
          Исследование расширений, утечек и конфликтов
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Аудит активных внедрённых скриптов, замер задержки на мутации DOM и интерактивный мастер устранения ошибок.
        </p>
      </div>

      {/* Module 1: Detected Injected Artifacts */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>Обнаруженные сигнатуры расширений в контексте вкладки</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Браузерная песочница защищает прямой список расширений, но их выдают глобальные переменные и изменения в DOM.
            </p>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Найдено: <span className="text-cyan-400 font-semibold">{extensions.length}</span>
          </div>
        </div>

        {extensions.length === 0 ? (
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-6 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-200">
              Посторонних глобальных скриптов не обнаружено
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              В текущей вкладке не зафиксировано внедрения Web3-кошельков, менеджеров паролей или блокировщиков. Вкладка работает на максимальной чистой скорости.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {extensions.map((ext) => (
              <div
                key={ext.id}
                className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-semibold text-white">{ext.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 font-mono text-cyan-400">
                      {ext.detectedVia}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{ext.description}</p>
                  <div className="text-xs text-slate-400 pt-1">
                    <span className="text-amber-400/90 font-medium">Влияние:</span> {ext.impactOnPerformance}
                  </div>
                  <div className="text-xs text-slate-400">
                    <span className="text-cyan-400/90 font-medium">Рекомендация:</span> {ext.recommendation}
                  </div>
                </div>

                <div className="shrink-0 flex items-center md:flex-col items-end gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      ext.riskLevel === 'high'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : ext.riskLevel === 'medium'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {ext.riskLevel === 'high' ? 'Высокий риск' : ext.riskLevel === 'medium' ? 'Внимание' : 'Штатно'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Module 2: Extension Mutation & DOM Overhead Benchmark */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span>Замер задержки (Overhead Benchmark) на манипуляции DOM</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Тест генерирует 500 полей ввода и 200 мутаций атрибутов для оценки задержки, вносимой слушателями расширений.
            </p>
          </div>

          <button
            onClick={onRetestOverhead}
            disabled={isRetesting}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetesting ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isRetesting ? 'Тестирование...' : 'Повторить тест'}</span>
          </button>
        </div>

        {overhead && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-500">Задержка создания 500 узлов</div>
              <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
                {overhead.domQueryLatencyMs} <span className="text-xs font-normal text-slate-500">мс</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">Норма: &lt; 15 мс</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-500">Задержка диспетчера мутаций</div>
              <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
                {overhead.mutationDispatchLatencyMs} <span className="text-xs font-normal text-slate-500">мс</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">Норма: &lt; 8 мс</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-500">Доступ к хранилищу сессии</div>
              <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
                {overhead.storageAccessLatencyMs} <span className="text-xs font-normal text-slate-500">мс</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">Норма: &lt; 3 мс</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-500">Индикатор нагрузки расширений</div>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-1 tabular-nums">
                {overhead.detectedOverheadScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
              </div>
              <div className="text-xs font-medium text-emerald-400 mt-1 capitalize">
                {overhead.overheadRating}
              </div>
            </div>
          </div>
        )}

        {overhead && (
          <div className="mt-4 p-3 bg-slate-950/50 border border-slate-800/80 rounded-lg text-xs text-slate-300">
            {overhead.details}
          </div>
        )}
      </div>

      {/* Module 3: Interactive Triage Wizard */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <span>Мастер устранения неполадок и конфликтов расширений</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Выберите симптом сбоя на странице, чтобы получить пошаговый алгоритм решения без сброса паролей.
          </p>
        </div>

        {/* Symptoms Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
          {triageOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedSymptom(opt.id)}
              className={`p-3 text-left rounded-lg border text-xs font-medium transition-colors ${
                selectedSymptom === opt.id
                  ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-slate-200">{opt.title}</div>
            </button>
          ))}
        </div>

        {/* Triage Detail Content */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-amber-400">Первопричина сбоя:</div>
              <div className="text-xs text-slate-300 mt-0.5">{currentTriage.rootCause}</div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-200">Пошаговый план исправления:</div>
            {currentTriage.steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Module 4: Extension Permission Risk Calculator */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              <span>Калькулятор риска разрешений расширений</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Отметьте разрешения, которые запрашивает расширение при установке, чтобы рассчитать индекс безопасности.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg shrink-0">
            <div>
              <div className="text-xs text-slate-500">Индекс риска</div>
              <div className="text-xl font-bold font-mono text-white tabular-nums">
                {calculatedRiskScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
              </div>
            </div>
            <div className={`text-xs px-2.5 py-1 rounded font-medium ${riskLabel.bg} ${riskLabel.color}`}>
              {riskLabel.label}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {permissionDefinitions.map((perm) => {
            const isChecked = selectedPermissions.includes(perm.id);
            return (
              <label
                key={perm.id}
                className={`p-3 rounded-lg border cursor-pointer flex items-start gap-3 transition-colors ${
                  isChecked
                    ? 'bg-cyan-950/30 border-cyan-500/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => togglePermission(perm.id)}
                  className="mt-1 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">{perm.title}</span>
                    <span className="text-xs font-mono text-slate-400">{perm.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{perm.description}</p>
                </div>
              </label>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200">Золотое правило безопасности расширений:</span> Если расширение (например, калькулятор или темная тема) запрашивает разрешение <code>&lt;all_urls&gt;</code> или <code>cookies</code>, оно способно перехватить любую вашу сессию. Всегда ограничивайте доступ в настройках: <span className="text-cyan-400 font-mono">«Доступ к сайту: при нажатии»</span>.
          </div>
        </div>
      </div>
    </div>
  );
};
