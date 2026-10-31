import React from 'react';
import { Activity, Download, RefreshCw } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onRunScan: () => void;
  onOpenExport: () => void;
  isScanning: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onRunScan,
  onOpenExport,
  isScanning,
}) => {
  const navItems = [
    { id: 'overview', label: 'Обзор' },
    { id: 'system', label: 'Спецификация' },
    { id: 'extensions', label: 'Аудит расширений' },
    { id: 'performance', label: 'Бенчмарки' },
    { id: 'security', label: 'Безопасность' },
    { id: 'troubleshooting', label: 'Устранение неполадок' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onTabChange('overview');
              }}
              className="text-base font-bold tracking-tight text-slate-100 hover:text-white whitespace-nowrap"
            >
              BrowserDiag
            </a>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                    isActive
                      ? 'text-cyan-400 border-cyan-500 font-semibold'
                      : 'border-transparent hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onRunScan}
              disabled={isScanning}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700/80 rounded-lg hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
              title="Пересканировать текущие параметры"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-cyan-400' : ''}`} />
              <span className="hidden sm:inline">Сканировать</span>
            </button>

            <button
              onClick={onOpenExport}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-cyan-900/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Отчёт</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav strip */}
      <div className="md:hidden flex items-center overflow-x-auto gap-4 px-4 py-2 border-t border-slate-900 text-xs font-medium text-slate-400 no-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`whitespace-nowrap shrink-0 px-2 py-1 rounded ${
              activeTab === item.id ? 'bg-cyan-500/10 text-cyan-400' : 'hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
