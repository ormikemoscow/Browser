import { DetectedExtensionArtifact, ExtensionOverheadResult } from '../types/browser';

export interface KnownExtensionPattern {
  id: string;
  name: string;
  category: DetectedExtensionArtifact['category'];
  riskLevel: DetectedExtensionArtifact['riskLevel'];
  description: string;
  impactOnPerformance: string;
  recommendation: string;
  testGlobal?: string[];
  testDomSelector?: string[];
}

export const KNOWN_EXTENSION_PATTERNS: KnownExtensionPattern[] = [
  {
    id: 'metamask',
    name: 'MetaMask / Web3 кошелёк',
    category: 'wallet',
    riskLevel: 'medium',
    description: 'Внедряет провайдер window.ethereum во все посещаемые вкладки.',
    impactOnPerformance: 'Увеличивает начальное время инициализации страницы на 10-40 мс.',
    recommendation: 'В настройках кошелька включите "Доступ только при клике" (Site access: On click), чтобы скрипт не внедрялся на не-крипто сайты.',
    testGlobal: ['ethereum', 'web3', 'ethereumProvider'],
  },
  {
    id: 'phantom',
    name: 'Phantom / Solana Wallet',
    category: 'wallet',
    riskLevel: 'medium',
    description: 'Внедряет провайдер window.phantom / window.solana на страницы.',
    impactOnPerformance: 'Незначительное потребление памяти, возможны конфликты с другими Web3-библиотеками.',
    recommendation: 'Ограничьте права доступа к сайтам через меню расширения браузера.',
    testGlobal: ['phantom', 'solana'],
  },
  {
    id: 'bitwarden',
    name: 'Bitwarden Password Manager',
    category: 'password_manager',
    riskLevel: 'low',
    description: 'Менеджер паролей. Автоматически сканирует поля ввода <input> в DOM.',
    impactOnPerformance: 'Низкая нагрузка, но при очень больших формах может вызывать микрозадержки рендера.',
    recommendation: 'Регулярно обновляйте; настройте автозаполнение по сочетанию клавиш вместо автоматического фокуса.',
    testGlobal: ['bitwarden', '_bwLoaded'],
    testDomSelector: ['[data-bitwarden-watching]', 'bitwarden-notification-host'],
  },
  {
    id: 'lastpass',
    name: 'LastPass',
    category: 'password_manager',
    riskLevel: 'medium',
    description: 'Внедряет иконки и оверлеи в поля ввода паролей.',
    impactOnPerformance: 'Может вызывать перерисовку (layout reflow) и ломать стилизацию кастомных полей ввода.',
    recommendation: 'Отключите автозаполнение на сложных веб-приложениях или используйте встроенный менеджер браузера.',
    testGlobal: ['__lastpass'],
    testDomSelector: ['[data-lastpass-root]', '[data-lastpass-icon-root]'],
  },
  {
    id: '1password',
    name: '1Password',
    category: 'password_manager',
    riskLevel: 'low',
    description: 'Интеграция 1Password в браузер для безопасного сохранения и вставки паролей.',
    impactOnPerformance: 'Оптимизированное внедрение, минимальное влияние на FPS.',
    recommendation: 'Оставьте активным, держите обновлённым.',
    testGlobal: ['OPX', '__1password'],
    testDomSelector: ['[data-onepassword-root]'],
  },
  {
    id: 'grammarly',
    name: 'Grammarly / Language Assistant',
    category: 'grammar',
    riskLevel: 'medium',
    description: 'Проверяет орфографию через сканирование textarea и contenteditable элементов.',
    impactOnPerformance: 'Высокая нагрузка на CPU при редактировании длинных документов; частые мутации DOM.',
    recommendation: 'Отключите на сайтах с тяжёлыми редакторами (Figma, Notion, Google Docs) или включайте по требованию.',
    testGlobal: ['__grammarly', 'Grammarly'],
    testDomSelector: ['[data-grammarly-part]', 'grammarly-desktop-integration', 'grammarly-extension'],
  },
  {
    id: 'react_devtools',
    name: 'React Developer Tools',
    category: 'devtools',
    riskLevel: 'info',
    description: 'Инструмент разработчика React. Перехватывает вызовы React Fiber и хуков.',
    impactOnPerformance: 'Увеличивает потребление памяти во время сессий разработки.',
    recommendation: 'Для чистого тестирования производительности клиентских сайтов используйте режим Инкогнито без DevTools.',
    testGlobal: ['__REACT_DEVTOOLS_GLOBAL_HOOK__'],
  },
  {
    id: 'redux_devtools',
    name: 'Redux DevTools',
    category: 'devtools',
    riskLevel: 'info',
    description: 'Инспектирует хранилище состояний Redux.',
    impactOnPerformance: 'Может накапливать большой стек истории действий (action log), увеличивая heap памяти.',
    recommendation: 'Ограничивайте глубину истории actions в настройках расширения (maxAge: 30).',
    testGlobal: ['__REDUX_DEVTOOLS_EXTENSION__'],
  },
];

export async function scanForExtensionArtifacts(): Promise<DetectedExtensionArtifact[]> {
  const detected: DetectedExtensionArtifact[] = [];

  // 1. Check known patterns
  for (const pattern of KNOWN_EXTENSION_PATTERNS) {
    let isFound = false;
    let foundSignature = '';

    // Check globals
    if (pattern.testGlobal) {
      for (const globalKey of pattern.testGlobal) {
        if (globalKey in window && (window as unknown as Record<string, unknown>)[globalKey] !== undefined) {
          isFound = true;
          foundSignature = `window.${globalKey}`;
          break;
        }
      }
    }

    // Check DOM selectors
    if (!isFound && pattern.testDomSelector) {
      for (const selector of pattern.testDomSelector) {
        try {
          if (document.querySelector(selector)) {
            isFound = true;
            foundSignature = `DOM: ${selector}`;
            break;
          }
        } catch {
          // invalid selector safety
        }
      }
    }

    if (isFound) {
      detected.push({
        id: pattern.id,
        name: pattern.name,
        category: pattern.category,
        detectedVia: foundSignature,
        signature: foundSignature,
        riskLevel: pattern.riskLevel,
        description: pattern.description,
        impactOnPerformance: pattern.impactOnPerformance,
        recommendation: pattern.recommendation,
      });
    }
  }

  // 2. Check AdBlocker presence via decoy bait element
  const adBlockDetected = await checkAdBlockerPresence();
  if (adBlockDetected) {
    detected.push({
      id: 'adblocker',
      name: 'Блокировщик рекламы (uBlock / AdGuard / AdBlock)',
      category: 'adblocker',
      detectedVia: 'Косметический фильтр селекторов рекламы',
      signature: 'Bait Element Filtered',
      riskLevel: 'low',
      description: 'Активный блокировщик сетевых запросов и рекламных DOM-элементов.',
      impactOnPerformance: 'Снижает сетевой трафик, но при тысячах правил фильтрации может добавлять задержку разбора DOM.',
      recommendation: 'Если сайты не загружаются или ломается видеоплеер, добавьте домен в белый список расширения.',
    });
  }

  // 3. Check for arbitrary injected content-script markers on <body> or <html>
  const bodyDataset = document.body ? Object.keys(document.body.dataset) : [];
  for (const key of bodyDataset) {
    if (key.toLowerCase().includes('extension') || key.toLowerCase().includes('adblock') || key.toLowerCase().includes('grammarly')) {
      if (!detected.some((d) => d.name.toLowerCase().includes(key.toLowerCase()))) {
        detected.push({
          id: `injected-${key}`,
          name: `Сторонний атрибут: data-${key}`,
          category: 'unknown',
          detectedVia: `document.body.dataset.${key}`,
          signature: `data-${key}`,
          riskLevel: 'low',
          description: 'Расширение внедрило модификатор в корневой тег body.',
          impactOnPerformance: 'Незначительное.',
          recommendation: 'Проверьте установленные расширения в браузере, если этот атрибут вам незнаком.',
        });
      }
    }
  }

  return detected;
}

export async function checkAdBlockerPresence(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const bait = document.createElement('div');
      bait.className = 'ad_unit ad-banner adsbox ad-placement doubleclick pub_300x250';
      bait.setAttribute(
        'style',
        'width: 1px !important; height: 1px !important; position: absolute !important; left: -10000px !important; top: -1000px !important;'
      );
      document.body.appendChild(bait);

      // Give browser one tick to apply cosmetic stylesheet filters
      setTimeout(() => {
        const isHidden =
          bait.offsetParent === null ||
          bait.offsetHeight === 0 ||
          bait.offsetLeft === 0 ||
          window.getComputedStyle(bait).display === 'none' ||
          window.getComputedStyle(bait).visibility === 'hidden';

        if (bait.parentNode) {
          bait.parentNode.removeChild(bait);
        }

        resolve(isHidden);
      }, 50);
    } catch {
      resolve(false);
    }
  });
}

export async function measureExtensionOverhead(): Promise<ExtensionOverheadResult> {
  // Test 1: DOM query latency with high mutation load
  const startDom = performance.now();
  const testContainer = document.createElement('div');
  testContainer.id = '__diag_extension_test_container__';
  testContainer.style.display = 'none';
  document.body.appendChild(testContainer);

  for (let i = 0; i < 500; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.name = `test_input_${i}`;
    input.setAttribute('autocomplete', 'username');
    testContainer.appendChild(input);
  }
  const domLatency = performance.now() - startDom;

  // Test 2: Mutation dispatch overhead
  const startMutation = performance.now();
  for (let i = 0; i < 200; i++) {
    const child = testContainer.children[i];
    if (child) {
      child.setAttribute('data-tested', `${i}`);
    }
  }
  const mutationLatency = performance.now() - startMutation;

  // Test 3: Storage access
  const startStorage = performance.now();
  try {
    sessionStorage.setItem('__diag_perf__', 'test');
    sessionStorage.getItem('__diag_perf__');
    sessionStorage.removeItem('__diag_perf__');
  } catch {
    //
  }
  const storageLatency = performance.now() - startStorage;

  // Clean up
  if (testContainer.parentNode) {
    testContainer.parentNode.removeChild(testContainer);
  }

  // Calculate composite overhead score
  // Typical clean browser without heavy mutation listeners: domLatency < 10ms, mutation < 5ms
  const totalMs = domLatency + mutationLatency + storageLatency;
  let score = Math.min(100, Math.round(totalMs * 4));
  if (score < 10) score = 10; // Baseline

  let rating: ExtensionOverheadResult['overheadRating'] = 'minimal';
  let details = 'Скрипты расширений не перегружают DOM и обработку мутаций.';

  if (score > 60) {
    rating = 'critical';
    details = 'Обнаружена существенная задержка при мутациях элементов DOM. Возможно, активны тяжелые расширения проверки текста, автозаполнения или скрейпинга.';
  } else if (score > 35) {
    rating = 'high';
    details = 'Умеренная задержка при манипуляциях с DOM. Активные контент-скрипты реагируют на новые элементы формы.';
  } else if (score > 20) {
    rating = 'moderate';
    details = 'Небольшое влияние на отклик страницы. Находится в пределах нормы для нескольких активных плагинов.';
  }

  return {
    domQueryLatencyMs: Number(domLatency.toFixed(2)),
    mutationDispatchLatencyMs: Number(mutationLatency.toFixed(2)),
    storageAccessLatencyMs: Number(storageLatency.toFixed(2)),
    detectedOverheadScore: score,
    overheadRating: rating,
    details,
  };
}
