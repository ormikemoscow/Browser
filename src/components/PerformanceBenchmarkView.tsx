import React, { useState, useRef } from 'react';
import { BenchmarkMetrics } from '../types/browser';
import {
  runDomThrashBenchmark,
  runJsComputeBenchmark,
  runWebGlFpsStressTest,
  measureMemoryHeap,
  calculateOverallPerformanceScore,
  WebGlTestProgress,
} from '../utils/benchmarks';
import {
  Zap,
  Play,
  RotateCcw,
  Gauge,
  Cpu,
  Layers,
  Monitor,
  HardDrive,
  CheckCircle2,
} from 'lucide-react';

interface PerformanceBenchmarkViewProps {
  benchmarks: BenchmarkMetrics;
  onUpdateBenchmarks: (metrics: BenchmarkMetrics) => void;
}

export const PerformanceBenchmarkView: React.FC<PerformanceBenchmarkViewProps> = ({
  benchmarks,
  onUpdateBenchmarks,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [testProgress, setTestProgress] = useState<number>(0);
  const [liveFps, setLiveFps] = useState<number>(60);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const runAllBenchmarks = async () => {
    setIsRunning(true);
    setTestProgress(10);
    setCurrentStep('Тестирование DOM Thrashing & Reflow...');

    // 1. DOM Benchmark
    await new Promise((r) => setTimeout(r, 100));
    const domTime = await runDomThrashBenchmark(1500);

    setTestProgress(35);
    setCurrentStep('Стресс-тест CPU & JavaScript JIT вычислений...');

    // 2. JS Compute Benchmark
    await new Promise((r) => setTimeout(r, 100));
    const computeTime = runJsComputeBenchmark(350000);

    setTestProgress(60);
    setCurrentStep('Рендеринг физики частиц WebGL/Canvas (замер FPS)...');

    // 3. WebGL Canvas Test
    let fpsResult = { avgFps: 60, minFps: 55 };
    if (canvasRef.current) {
      fpsResult = await runWebGlFpsStressTest(
        canvasRef.current,
        (p: WebGlTestProgress) => {
          setLiveFps(p.currentFps);
          setTestProgress(60 + Math.round((p.progressPercent / 100) * 35));
        },
        2500
      );
    }

    setTestProgress(95);
    setCurrentStep('Снятие метрик памяти кучи (JS Heap)...');

    // 4. Memory Heap
    const memory = measureMemoryHeap();

    // 5. Composite Score
    const totalScore = calculateOverallPerformanceScore(
      domTime,
      computeTime,
      fpsResult.avgFps
    );

    const newMetrics: BenchmarkMetrics = {
      domThrashTimeMs: domTime,
      jsComputeTimeMs: computeTime,
      webglFps: fpsResult.avgFps,
      webglMinFps: fpsResult.minFps,
      memoryHeapUsedMb: memory.usedMb,
      memoryHeapTotalMb: memory.totalMb,
      overallScore: totalScore,
    };

    onUpdateBenchmarks(newMetrics);
    setTestProgress(100);
    setCurrentStep('Тестирование успешно завершено');
    setIsRunning(false);
  };

  const getPerformanceGrade = (score: number | null) => {
    if (!score) return { grade: '—', label: 'Тест не пройден', color: 'text-slate-400' };
    if (score >= 90) return { grade: 'A+', label: 'Высшая производительность', color: 'text-emerald-400' };
    if (score >= 75) return { grade: 'A', label: 'Отличная скорость', color: 'text-cyan-400' };
    if (score >= 55) return { grade: 'B', label: 'Хорошая производительность', color: 'text-blue-400' };
    if (score >= 40) return { grade: 'C', label: 'Заметные просадки скорости', color: 'text-amber-400' };
    return { grade: 'D', label: 'Критическое троттлинг-замедление', color: 'text-rose-400' };
  };

  const perfGrade = getPerformanceGrade(benchmarks.overallScore);

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <div className="text-xs text-slate-400">Стресс-тестирование</div>
        <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
          Лаборатория производительности браузера
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Реальные замеры скорости рендеринга DOM, вычислений JavaScript, графического фреймрейта и распределения памяти.
        </p>
      </div>

      {/* Main Benchmark Control Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
              Комплексный профилировщик
            </div>
            <h2 className="text-xl font-bold text-white">
              Тест нагрузки на движок и графический чип
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Проверяет устойчивость браузера к тяжелым DOM-деревьям, сложной векторной графике и оценивает задержки сборщика мусора.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={runAllBenchmarks}
              disabled={isRunning}
              className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-cyan-900/30 whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Выполняется тест...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Запустить полный тест</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress & Active Status */}
        {isRunning && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-medium text-cyan-400">{currentStep}</span>
              <span className="font-mono tabular-nums">{testProgress}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${testProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Scoreboard Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Card 1: Overall Performance Score */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium">Общий балл скорости</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold font-mono text-white tabular-nums">
                  {benchmarks.overallScore ?? '—'}
                </span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
              <div className={`text-xs font-medium mt-1 ${perfGrade.color}`}>
                Класс {perfGrade.grade} · {perfGrade.label}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center text-cyan-400 bg-slate-900">
              <Gauge className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: DOM Thrash Latency */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="flex items-center gap-1 font-medium text-slate-400">
                <Layers className="w-3.5 h-3.5 text-cyan-400" /> DOM Reflow
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
              {benchmarks.domThrashTimeMs !== null ? `${benchmarks.domThrashTimeMs}` : '—'}
              <span className="text-xs font-normal text-slate-500 ml-1">мс</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">1500 узлов со смещением</div>
          </div>

          {/* Card 3: JS Compute Engine */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="flex items-center gap-1 font-medium text-slate-400">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" /> CPU & JIT
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
              {benchmarks.jsComputeTimeMs !== null ? `${benchmarks.jsComputeTimeMs}` : '—'}
              <span className="text-xs font-normal text-slate-500 ml-1">мс</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">350к математических циклов</div>
          </div>

          {/* Card 4: WebGL FPS */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="flex items-center gap-1 font-medium text-slate-400">
                <Monitor className="w-3.5 h-3.5 text-cyan-400" /> WebGL FPS
              </span>
              {isRunning && <span className="text-xs text-cyan-400 font-mono animate-pulse">{liveFps} FPS</span>}
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
              {benchmarks.webglFps !== null ? `${benchmarks.webglFps}` : '—'}
              <span className="text-xs font-normal text-slate-500 ml-1">кадр/с</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {benchmarks.webglMinFps ? `Минимум: ${benchmarks.webglMinFps} FPS` : 'Плавность 60 FPS'}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Live Particle Canvas Sandbox */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Monitor className="w-4 h-4 text-cyan-400" />
              <span>Тестовый холст графической подсистемы (400 динамических частиц)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Этот холст используется во время теста для замера просадок FPS и стабильности кадровой синхронизации (V-Sync).
            </p>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Разрешение холста: <span className="text-cyan-400">800 × 260 px</span>
          </div>
        </div>

        <div className="w-full bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex justify-center items-center">
          <canvas
            ref={canvasRef}
            width={800}
            height={260}
            className="w-full h-[220px] object-cover"
          />
        </div>
      </div>

      {/* Memory Heap & Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Memory Heap Inspection */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2 text-slate-200 font-semibold mb-4">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <span>Память JavaScript (JS Heap Allocation)</span>
          </div>

          {benchmarks.memoryHeapUsedMb !== null ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Занято памяти кучи</span>
                  <span className="font-mono text-slate-200 tabular-nums">
                    {benchmarks.memoryHeapUsedMb} МБ / {benchmarks.memoryHeapTotalMb} МБ
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-emerald-400 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        benchmarks.memoryHeapTotalMb
                          ? (benchmarks.memoryHeapUsedMb / benchmarks.memoryHeapTotalMb) * 100
                          : 50
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded border border-slate-800">
                Показания получены через Chromium <code>performance.memory</code> API. При закрытии неиспользуемых вкладок браузер автоматически вызывает Garbage Collector для возврата оперативной памяти операционной системе.
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 bg-slate-950 p-4 rounded border border-slate-800 leading-relaxed">
              В браузерах Firefox и Safari API <code>performance.memory</code> намеренно скрыт из соображений защиты от межсайтовых атак по времени (timing attacks).
            </div>
          )}
        </div>

        {/* Optimization Tips from Results */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2 text-slate-200 font-semibold mb-4">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Интерпретация результатов тестирования</span>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">DOM Thrashing &lt; 80 мс:</span> Движок отлично справляется с быстрой перерисовкой вкладок, таблиц и админ-панелей.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">FPS &gt; 55 кадров:</span> Аппаратное ускорение видеокарты работает стабильно без термального троттлинга.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">JS Compute &lt; 50 мс:</span> Быстродействие JIT-компилятора V8/SpiderMonkey оптимально для сложных веб-приложений.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
