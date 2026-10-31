import { BenchmarkMetrics } from '../types/browser';

export async function runDomThrashBenchmark(elementCount = 1500): Promise<number> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      document.body.appendChild(container);

      const startTime = performance.now();

      // Create and append elements
      const fragment = document.createDocumentFragment();
      const elements: HTMLElement[] = [];

      for (let i = 0; i < elementCount; i++) {
        const el = document.createElement('div');
        el.className = 'benchmark-node';
        el.textContent = `Item ${i}`;
        el.style.width = `${(i % 100) + 10}px`;
        el.style.height = '15px';
        fragment.appendChild(el);
        elements.push(el);
      }
      container.appendChild(fragment);

      // Force layout thrashing (interleaved write-read)
      for (let i = 0; i < Math.min(250, elementCount); i++) {
        elements[i].style.width = `${(i % 50) + 20}px`;
        // Read forces synchronous reflow
        const offset = elements[i].offsetWidth;
        if (offset < 0) {
          console.log(offset);
        }
      }

      const totalTime = performance.now() - startTime;

      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }

      resolve(Number(totalTime.toFixed(2)));
    });
  });
}

export function runJsComputeBenchmark(iterations = 350000): number {
  const startTime = performance.now();

  let accumulator = 0;
  const arr: number[] = new Array(10000);

  // Math & loop JIT test
  for (let i = 0; i < 10000; i++) {
    arr[i] = Math.sqrt(i * 3.14159) * Math.sin(i);
  }

  // Processing & object allocation
  for (let i = 0; i < iterations; i++) {
    accumulator += Math.hypot(arr[i % 10000], i % 100);
    if (i % 25000 === 0) {
      const tempObj = { id: i, val: accumulator, time: Date.now() };
      accumulator += Object.keys(tempObj).length;
    }
  }

  // String serialization stress
  const testObj = { data: arr.slice(0, 100) };
  for (let i = 0; i < 200; i++) {
    const json = JSON.stringify(testObj);
    JSON.parse(json);
  }

  return Number((performance.now() - startTime).toFixed(2));
}

export function measureMemoryHeap(): { usedMb: number | null; totalMb: number | null } {
  const perf = window.performance as unknown as {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  };

  if (perf && perf.memory) {
    return {
      usedMb: Number((perf.memory.usedJSHeapSize / (1024 * 1024)).toFixed(1)),
      totalMb: Number((perf.memory.totalJSHeapSize / (1024 * 1024)).toFixed(1)),
    };
  }

  return { usedMb: null, totalMb: null };
}

export interface WebGlTestProgress {
  currentFps: number;
  progressPercent: number;
}

export async function runWebGlFpsStressTest(
  canvas: HTMLCanvasElement,
  onProgress?: (p: WebGlTestProgress) => void,
  durationMs = 2500
): Promise<{ avgFps: number; minFps: number }> {
  return new Promise((resolve) => {
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) {
      resolve({ avgFps: 60, minFps: 60 });
      return;
    }
    const ctx = canvasCtx;

    const width = canvas.width;
    const height = canvas.height;
    const particleCount = 400;

    // Initialize particles
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      radius: Math.random() * 3 + 1,
      color: `hsl(${Math.random() * 360}, 80%, 60%)`,
    }));

    const frameDeltas: number[] = [];
    let lastTime = performance.now();
    const startTime = performance.now();
    let minFps = 120;

    function render(currentTime: number) {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      if (delta > 0) {
        const instantFps = 1000 / delta;
        frameDeltas.push(instantFps);
        if (frameDeltas.length > 5 && instantFps < minFps) {
          minFps = instantFps;
        }
      }

      // Physics update & render
      ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Connect adjacent particles
        if (i % 6 === 0 && i < particleCount - 1) {
          const next = particles[i + 1];
          const dist = Math.hypot(p.x - next.x, p.y - next.y);
          if (dist < 60) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(next.x, next.y);
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
            ctx.stroke();
          }
        }
      }

      const elapsed = currentTime - startTime;
      const progress = Math.min(100, Math.round((elapsed / durationMs) * 100));
      const currentFps = frameDeltas.length > 0 ? frameDeltas[frameDeltas.length - 1] : 60;

      if (onProgress) {
        onProgress({
          currentFps: Math.round(currentFps),
          progressPercent: progress,
        });
      }

      if (elapsed < durationMs) {
        requestAnimationFrame(render);
      } else {
        const sum = frameDeltas.reduce((a, b) => a + b, 0);
        const avg = frameDeltas.length > 0 ? sum / frameDeltas.length : 60;
        resolve({
          avgFps: Math.min(144, Math.round(avg)),
          minFps: Math.max(1, Math.round(minFps)),
        });
      }
    }

    requestAnimationFrame(render);
  });
}

export function calculateOverallPerformanceScore(
  domTime: number,
  computeTime: number,
  fps: number
): number {
  // DOM: < 40ms is 100, > 250ms is 30
  let domScore = 100 - ((domTime - 25) / 200) * 60;
  domScore = Math.max(20, Math.min(100, domScore));

  // Compute: < 35ms is 100, > 200ms is 30
  let compScore = 100 - ((computeTime - 20) / 180) * 60;
  compScore = Math.max(20, Math.min(100, compScore));

  // FPS: 60+ is 100, 30 is 50
  let fpsScore = (fps / 60) * 100;
  fpsScore = Math.max(20, Math.min(100, fpsScore));

  const total = Math.round(domScore * 0.35 + compScore * 0.35 + fpsScore * 0.3);
  return Math.max(10, Math.min(100, total));
}
