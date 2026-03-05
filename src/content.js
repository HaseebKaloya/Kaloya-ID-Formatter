(function () {
  'use strict';

  const ID_KEYWORDS = [
    'cpr', 'cnic', 'ntn', 'reference', 'ref', 'receipt', 'token',
    'invoice', ' id', '_id', '-id', 'payment', 'tracking', 'code',
    'serial', 'registration', 'reg', 'number', 'num', 'fbr', 'tax'
  ];

  let settings = {
    enabled: true,
    pattern: '2-4-5-rest',
    whitelist: [],
    useWhitelist: false,
    smartDetect: true
  };

  function loadSettings(cb) {
    chrome.storage.sync.get(['smartIDSettings'], (result) => {
      if (result.smartIDSettings) {
        settings = Object.assign({}, settings, result.smartIDSettings);
      }
      if (cb) cb();
    });
  }

  function isAllowedOnCurrentSite() {
    if (!settings.useWhitelist) return true;

    const list = Array.isArray(settings.whitelist) ? settings.whitelist : [];
    const cleanList = list.map(s => s.trim().toLowerCase()).filter(Boolean);

    if (cleanList.length === 0) return false;

    const currentHost = window.location.hostname.toLowerCase().replace(/^www\./, '');

    return cleanList.some(entry => {
      const cleanEntry = entry.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
      return currentHost === cleanEntry || currentHost.endsWith('.' + cleanEntry);
    });
  }

  function isIDField(input) {
    if (!settings.smartDetect) return true;

    const attrs = [
      input.name || '',
      input.id || '',
      input.placeholder || '',
      input.getAttribute('aria-label') || '',
      input.className || ''
    ].join(' ').toLowerCase();

    let labelText = '';
    if (input.id) {
      const label = document.querySelector(`label[for="${CSS.escape(input.id)}"]`);
      if (label) labelText = label.textContent.toLowerCase();
    }

    const combined = attrs + ' ' + labelText;
    return ID_KEYWORDS.some(kw => combined.includes(kw));
  }

  function handleInput(event) {
    if (!settings.enabled) return;
    if (!isAllowedOnCurrentSite()) return;

    const input = event.target;
    if (!isIDField(input)) return;

    const value = input.value;
    const cursorPos = input.selectionStart;

    const { formatted, newCursor } = window.KaloyaIDFormatter.formatValue(
      value,
      settings.pattern,
      cursorPos
    );

    if (formatted !== value) {
      input.value = formatted;
      input.setSelectionRange(newCursor, newCursor);
    }
  }

  function attachListeners() {
    document.querySelectorAll('input[type="text"], input[type="search"], input:not([type]), textarea').forEach(input => {
      if (!input.dataset.kaloyaAttached) {
        input.addEventListener('input', handleInput);
        input.dataset.kaloyaAttached = 'true';
      }
    });
  }

  const observer = new MutationObserver(() => {
    attachListeners();
  });

  loadSettings(() => {
    attachListeners();
    observer.observe(document.body, { childList: true, subtree: true });
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.smartIDSettings) {
      settings = Object.assign({}, settings, changes.smartIDSettings.newValue);
    }
  });

})();
