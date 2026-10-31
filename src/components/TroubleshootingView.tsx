import React, { useState, useEffect } from 'react';
import {
  TROUBLESHOOTING_TOPICS,
  INITIAL_OPTIMIZATION_CHECKLIST,
  TroubleshootingTopic,
} from '../data/troubleshootingGuides';
import { OptimizationChecklistItem } from '../types/browser';
import {
  HelpCircle,
  Search,
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertCircle,
  CheckSquare,
  Square,
  Sparkles,
  Command,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const TroubleshootingView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Checklist state persisted in localStorage
  const [checklist, setChecklist] = useState<OptimizationChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem('__browserdiag_checklist__');
      if (saved) return JSON.parse(saved);
    } catch {
      //
    }
    return INITIAL_OPTIMIZATION_CHECKLIST;
  });

  useEffect(() => {
    try {
      localStorage.setItem('__browserdiag_checklist__', JSON.stringify(checklist));
    } catch {
      //
    }
  }, [checklist]);

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const completedCount = checklist.filter((item) => item.completed).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  // Filter topics
  const filteredTopics = TROUBLESHOOTING_TOPICS.filter((topic) => {
    const matchesCategory =
      selectedCategory === 'all' || topic.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      topic.title.toLowerCase().includes(query) ||
      topic.rootCause.toLowerCase().includes(query) ||
      topic.symptoms.some((s) => s.toLowerCase().includes(query));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <div className="text-xs text-slate-400">База знаний и решений</div>
        <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
          Устранение неполадок, сбоев и ускорение работы
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Инструкции по решению проблем с памятью, графикой, зависаниями расширений и готовый чеклист тюнинга.
        </p>
      </div>

      {/* Interactive 5-Minute Checklist Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">План ускорения и оптимизации браузера</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Выполните эти 6 шагов, чтобы освободить до 2 ГБ оперативной памяти и устранить 90% рывков в браузере.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-lg shrink-0">
            <div>
              <div className="text-xs text-slate-500">Выполнено шагов</div>
              <div className="text-lg font-bold font-mono text-white tabular-nums">
                {completedCount} <span className="text-xs font-normal text-slate-500">/ {checklist.length}</span>
              </div>
            </div>
            <div className="w-20 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleChecklistItem(item.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                item.completed
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-70'
                  : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  className="mt-0.5 text-cyan-400 focus:outline-none"
                >
                  {item.completed ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500 hover:text-cyan-400" />
                  )}
                </button>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        item.completed ? 'line-through text-slate-500' : 'text-slate-100'
                      }`}
                    >
                      {item.title}
                    </span>
                    <span
                      className={`text-xs font-mono px-1.5 py-0.2 rounded ${
                        item.impact === 'high'
                          ? 'text-rose-400 bg-rose-500/10'
                          : 'text-amber-400 bg-amber-500/10'
                      }`}
                    >
                      {item.impact === 'high' ? 'High Impact' : 'Medium'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">{item.description}</p>

                  {item.shortcutUrl && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="pt-2 flex items-center justify-between text-xs"
                    >
                      <button
                        onClick={() => copyUrl(item.shortcutUrl!)}
                        className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-mono text-xs transition-colors"
                      >
                        {copiedUrl === item.shortcutUrl ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Скопировано в буфер</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{item.shortcutUrl}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Troubleshooting Guides & Search */}
      <div className="space-y-4">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по симптомам (видео, память, формы, расширения)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Category Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'Все темы' },
              { id: 'extensions', label: 'Расширения' },
              { id: 'performance', label: 'Память и CPU' },
              { id: 'security', label: 'Безопасность' },
              { id: 'crashes', label: 'Сбои сайтов' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-slate-800 text-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Guides List */}
        <div className="space-y-4">
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white">{topic.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">Симптомы:</span>
                    {topic.symptoms.map((s, idx) => (
                      <span key={idx} className="text-xs text-slate-300">
                        {s}
                        {idx < topic.symptoms.length - 1 ? ' · ' : ''}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {topic.keyboardShortcut && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                      {topic.keyboardShortcut}
                    </span>
                  )}
                  {topic.directUrl && (
                    <button
                      onClick={() => copyUrl(topic.directUrl!)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded bg-slate-950 border border-slate-800 text-cyan-400 hover:text-cyan-300 transition-colors"
                      title="Скопировать адрес для вставки в строку браузера"
                    >
                      {copiedUrl === topic.directUrl ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Скопировано</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>{topic.directUrl}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Причина проблемы: </span>
                {topic.rootCause}
              </div>

              {/* Steps */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-slate-300">Алгоритм устранения:</div>
                <div className="space-y-1.5">
                  {topic.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Browser specifics strip if present */}
              {topic.browserSpecifics && (
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Прямые ссылки:</span>
                  {Object.entries(topic.browserSpecifics).map(([bName, address]) => (
                    <button
                      key={bName}
                      onClick={() => copyUrl(address)}
                      className="font-mono hover:text-cyan-400 transition-colors"
                    >
                      <span className="capitalize">{bName}</span>: {address}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {filteredTopics.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-400">
              По вашему запросу «{searchQuery}» статей не найдено. Попробуйте изменить ключевые слова.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
