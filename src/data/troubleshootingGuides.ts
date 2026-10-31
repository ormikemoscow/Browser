import { OptimizationChecklistItem } from '../types/browser';

export interface TroubleshootingTopic {
  id: string;
  title: string;
  category: 'extensions' | 'performance' | 'security' | 'crashes';
  severity: 'high' | 'medium' | 'low';
  symptoms: string[];
  rootCause: string;
  directUrl?: string;
  keyboardShortcut?: string;
  steps: string[];
  browserSpecifics?: {
    chrome?: string;
    edge?: string;
    firefox?: string;
    yandex?: string;
  };
}

export const TROUBLESHOOTING_TOPICS: TroubleshootingTopic[] = [
  {
    id: 'extension_conflict_binary_search',
    title: 'Метод бинарного поиска для поиска сбойного расширения',
    category: 'extensions',
    severity: 'high',
    symptoms: [
      'Сайты перестают отвечать или ломаются кнопки',
      'Выскакивают ошибки скриптов в консоли',
      'Страница бесконечно перезагружается',
    ],
    rootCause: 'Несколько расширений одновременно перехватывают одни и те же события ввода или изменяют структуру DOM.',
    directUrl: 'chrome://extensions/',
    keyboardShortcut: 'Shift + Esc (Диспетчер задач браузера)',
    steps: [
      'Шаг 1. Откройте проблемную страницу в Режиме Инкогнито (Ctrl + Shift + N / Cmd + Shift + N). Если ошибка исчезла, виновато одно из установленных расширений.',
      'Шаг 2. Откройте Диспетчер задач браузера по Shift + Esc и отсортируйте процессы по колонке "ЦП" и "Память", чтобы увидеть фоновые страницы расширений.',
      'Шаг 3. Метод 50%: Отключите ровно половину ваших расширений на странице chrome://extensions/.',
      'Шаг 4. Перезагрузите сайт. Если ошибка осталась — виновник среди включенной половины; если исчезла — среди отключенной.',
      'Шаг 5. Повторяйте деление пополам, пока не определите одно конкретное расширение за 3-4 шага.',
    ],
    browserSpecifics: {
      chrome: 'chrome://extensions/ и Shift + Esc',
      edge: 'edge://extensions/ и Shift + Esc',
      firefox: 'about:addons и Shift + Esc',
      yandex: 'browser://tune/ и Shift + Esc',
    },
  },
  {
    id: 'memory_saver_tab_discarding',
    title: 'Устранение избыточного расхода оперативной памяти (RAM)',
    category: 'performance',
    severity: 'high',
    symptoms: [
      'Браузер занимает 4+ ГБ оперативной памяти',
      'Вкладки аварийно закрываются с кодом "Aw, Snap!" или "Out of Memory"',
      'Компьютер сильно шумит кулерами при открытии нескольких вкладок',
    ],
    rootCause: 'Фоновые вкладки продолжают выполнять JavaScript-таймеры, анимации и держать в памяти тяжёлые деревья DOM.',
    directUrl: 'chrome://settings/performance',
    steps: [
      'Шаг 1. Включите встроенный режим "Экономия памяти" (Memory Saver): откройте Настройки -> Производительность.',
      'Шаг 2. Задайте список исключений для критически важных вкладок (CRM, почта, плееры), которые не должны засыпать.',
      'Шаг 3. Включите флаг выгрузки памяти: перейдите по адресу chrome://flags/#high-efficiency-mode-available и активируйте его.',
      'Шаг 4. Отключите фоновые расширения, которыми не пользуетесь ежедневно.',
      'Шаг 5. Перезагружайте браузер хотя бы раз в несколько дней для очистки утечек памяти (Garbage Collection Heap).',
    ],
    browserSpecifics: {
      chrome: 'chrome://settings/performance',
      edge: 'edge://settings/system (Спящие вкладки Sleeping Tabs)',
      firefox: 'about:config -> browser.tabs.unloadOnLowMemory = true',
      yandex: 'browser://settings/tools -> Оптимизация памяти',
    },
  },
  {
    id: 'gpu_acceleration_video_stutter',
    title: 'Рывки в видео, артефакты и сбои аппаратного ускорения (GPU)',
    category: 'performance',
    severity: 'medium',
    symptoms: [
      'Видео на YouTube или VK Video подтормаживает или рассинхронизируется со звуком',
      'Зеленые полосы или черные квадраты при прокрутке',
      'Высокая загрузка центрального процессора (CPU 100%) при просмотре видео',
    ],
    rootCause: 'Сбой или несовместимость видеодрайвера с аппаратным ускорением Chromium / WebGL или отсутствие поддержки кодека AV1/VP9.',
    directUrl: 'chrome://gpu',
    steps: [
      'Шаг 1. Проверьте текущий статус видеокарты: откройте страницу chrome://gpu и найдите секцию "Graphics Feature Status". Все пункты должны быть зелеными (Hardware accelerated).',
      'Шаг 2. Если в пунктах указано "Software only" или "Disabled", перейдите в chrome://flags/#ignore-gpu-blocklist и установите в "Enabled".',
      'Шаг 3. Включите растрирование через GPU: установите chrome://flags/#enable-gpu-rasterization в "Enabled".',
      'Шаг 4. Если артефакты продолжаются, временно отключите "Использовать аппаратное ускорение" в Настройках системы браузера и обновите видеодрайвер NVIDIA/AMD/Intel.',
    ],
  },
  {
    id: 'react_dom_hydration_extension_break',
    title: 'Поломка веб-форм и SPA-приложений из-за менеджеров паролей',
    category: 'extensions',
    severity: 'medium',
    symptoms: [
      'Кнопки оформления заказа или входа не нажимаются',
      'Поля даты или выпадающие списки сбрасывают введённое значение',
      'Консоль выдает ошибку "Hydration failed" или "Node.insertBefore error"',
    ],
    rootCause: 'Менеджеры паролей, переводчики и расширения автозаполнения насильно внедряют свои <div> и <svg> внутрь полей до загрузки клиентского React/Vue бандла.',
    directUrl: 'chrome://extensions/',
    steps: [
      'Шаг 1. Если на форме не работает кнопка или валидация — отключите автоматическое заполнение форм в настройках расширения.',
      'Шаг 2. Для переводчиков (Google Translate / DeepL / Яндекс.Перевод): отключите автоперевод страниц, так как изменение текстовых узлов ломает Virtual DOM современных сайтов.',
      'Шаг 3. Используйте клик правой кнопкой мыши по полю -> пункт меню менеджера паролей для разовой вставки вместо авто-сканирования.',
    ],
  },
  {
    id: 'extension_permissions_security_audit',
    title: 'Аудит опасных разрешений и защита от троянских расширений',
    category: 'security',
    severity: 'high',
    symptoms: [
      'Неожиданная смена поисковой системы по умолчанию',
      'Появление посторонней рекламы и баннеров поверх чистых страниц',
      'Несанкционированные перенаправления (редиректы) по партнерским ссылкам',
    ],
    rootCause: 'Расширение с разрешением "<all_urls>" или "webRequest" было продано новому владельцу или содержит вредоносный код.',
    directUrl: 'chrome://extensions/',
    steps: [
      'Шаг 1. Перейдите в список расширений (chrome://extensions/) и нажмите "Подробнее" (Details) у каждого расширения.',
      'Шаг 2. Найдите пункт "Доступ к сайту" (Site Access). Замените "На всех сайтах" (On all sites) на "При нажатии" (On click) или "На определенных сайтах".',
      'Шаг 3. Удалите все неиспользуемые VPN-расширения и бесплатные скачиватели видео — это самая частая категория взломанных расширений.',
      'Шаг 4. Включите функцию "Улучшенная защита" (Enhanced Safe Browsing) в настройках безопасности браузера.',
    ],
    browserSpecifics: {
      chrome: 'chrome://settings/security -> Улучшенная защита',
      edge: 'edge://settings/privacy -> Безопасность',
      firefox: 'about:preferences#privacy -> Улучшенная защита от отслеживания',
      yandex: 'browser://settings/protect -> Технология Protect',
    },
  },
  {
    id: 'cache_storage_corruption_reset',
    title: 'Очистка поврежденного кэша и Service Worker без потери паролей',
    category: 'crashes',
    severity: 'medium',
    symptoms: [
      'Сайт открывается белым экраном или в устаревшей версии',
      'Ошибка "Network Error" или "ERR_FAILED" только на одном конкретном сайте',
      'Бесконечный цикл редиректа при входе',
    ],
    rootCause: 'Поврежденная запись в CacheStorage или зависший Service Worker, перехватывающий сетевые запросы.',
    keyboardShortcut: 'F12 -> вкладка Application -> Storage -> Clear site data',
    steps: [
      'Шаг 1. Откройте сбойный сайт, нажмите клавишу F12 (Инструменты разработчика).',
      'Шаг 2. Перейдите на вкладку "Application" (Приложение) или "Хранилище".',
      'Шаг 3. В левом меню нажмите на пункт "Storage" (Хранилище).',
      'Шаг 4. Нажмите кнопку "Clear site data" (Очистить данные сайта). Это удалит битый кэш и Service Worker только этого домена, не трогая другие сайты.',
      'Шаг 5. Зажмите Ctrl + F5 (или Shift + F5) для жесткой перезагрузки страницы в обход кэша.',
    ],
  },
];

export const INITIAL_OPTIMIZATION_CHECKLIST: OptimizationChecklistItem[] = [
  {
    id: 'enable_memory_saver',
    title: 'Включить режим экономии оперативной памяти (Memory Saver)',
    category: 'memory',
    impact: 'high',
    description: 'Освобождает ОЗУ за счет автоматической выгрузки неактивных вкладок.',
    actionText: 'Открыть настройки производительности',
    shortcutUrl: 'chrome://settings/performance',
    completed: false,
  },
  {
    id: 'restrict_extension_site_access',
    title: 'Ограничить права расширений (доступ "Только по клику")',
    category: 'security',
    impact: 'high',
    description: 'Запретит расширениям внедряться на страницы онлайн-банков, почты и криптокошельков без вашего разрешения.',
    actionText: 'Настроить разрешения',
    shortcutUrl: 'chrome://extensions/',
    completed: false,
  },
  {
    id: 'verify_hardware_acceleration',
    title: 'Проверить аппаратное ускорение видеокарты',
    category: 'performance',
    impact: 'high',
    description: 'Снижает нагрузку на процессор при воспроизведении 4K-видео и анимаций в 5-10 раз.',
    actionText: 'Проверить chrome://gpu',
    shortcutUrl: 'chrome://gpu',
    completed: false,
  },
  {
    id: 'enable_doh_dns',
    title: 'Включить безопасный DNS (DNS-over-HTTPS)',
    category: 'security',
    impact: 'medium',
    description: 'Защищает историю посещаемых сайтов от перехвата интернет-провайдером и подделки DNS.',
    actionText: 'Включить в настройках безопасности',
    shortcutUrl: 'chrome://settings/security',
    completed: false,
  },
  {
    id: 'audit_idle_extensions',
    title: 'Удалить неиспользуемые и сомнительные расширения',
    category: 'extensions',
    impact: 'high',
    description: 'Каждое расширение потребляет 30-150 МБ оперативной памяти и задерживает рендер страниц.',
    actionText: 'Управление расширениями',
    shortcutUrl: 'chrome://extensions/',
    completed: false,
  },
  {
    id: 'enable_gpu_rasterization',
    title: 'Активировать GPU Rasterization в флагах',
    category: 'performance',
    impact: 'medium',
    description: 'Ускоряет отрисовку тяжелых страниц и плавность скролла за счет графического процессора.',
    actionText: 'Включить флаг',
    shortcutUrl: 'chrome://flags/#enable-gpu-rasterization',
    completed: false,
  },
];
