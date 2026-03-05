const PRESETS = [
  { name: 'CPR / FBR Reference', value: '2-4-5-rest', example: 'AB-CDEF-GHIJK-LMN' },
  { name: 'Phone (3-3-4)',        value: '3-3-4',      example: '051-234-5678' },
  { name: 'Credit Card (4-4-4-4)',value: '4-4-4-4',    example: '1234-5678-9012-3456' },
  { name: 'CNIC Pakistan (5-7-1)', value: '5-7-1',     example: '35202-1234567-8' },
];

const DEFAULTS = {
  enabled: true,
  pattern: '2-4-5-rest',
  whitelist: [],
  useWhitelist: false,
  smartDetect: true,
  customPatterns: [...PRESETS],
};

let settings = { ...DEFAULTS };

function renderPresets() {
  const grid = document.getElementById('presetGrid');
  grid.innerHTML = '';
  PRESETS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'preset-card' + (settings.pattern === p.value ? ' active' : '');
    card.innerHTML = `<div class="preset-val">${p.value}</div><div class="preset-name">${p.name}</div><div class="preset-ex">${p.example}</div>`;
    card.addEventListener('click', () => {
      settings.pattern = p.value;
      document.getElementById('customPatternInput').value = p.value;
      renderPresets();
    });
    grid.appendChild(card);
  });
}

function renderTags() {
  const list = document.getElementById('tagList');
  list.innerHTML = '';
  const sites = Array.isArray(settings.whitelist) ? settings.whitelist : [];
  if (sites.length === 0) {
    list.innerHTML = '<span class="tag-empty">No websites added yet.</span>';
    return;
  }
  sites.forEach((site, idx) => {
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.innerHTML = `
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/>
        <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" stroke="currentColor" stroke-width="1.6"/>
      </svg>
      ${site}
      <button class="tag-remove" data-idx="${idx}" title="Remove">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    `;
    list.appendChild(tag);
  });
  list.querySelectorAll('.tag-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      settings.whitelist.splice(parseInt(btn.dataset.idx), 1);
      renderTags();
    });
  });
}

function renderCustomPatterns() {
  const list = document.getElementById('customPatternList');
  list.innerHTML = '';
  const patterns = settings.customPatterns || [];
  if (patterns.length === 0) {
    list.innerHTML = '<div class="no-patterns">No saved patterns yet. Add one above.</div>';
    return;
  }
  patterns.forEach((p, idx) => {
    const item = document.createElement('div');
    item.className = 'custom-item';
    item.innerHTML = `
      <span class="ci-name">${p.name}</span>
      <span class="ci-val">${p.value}</span>
      <button class="btn-ci-use" data-val="${p.value}">Use</button>
      <button class="btn-ci-del" data-idx="${idx}" title="Delete">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    `;
    list.appendChild(item);
  });
  list.querySelectorAll('.btn-ci-use').forEach(btn => {
    btn.addEventListener('click', () => {
      settings.pattern = btn.dataset.val;
      document.getElementById('customPatternInput').value = btn.dataset.val;
      renderPresets();
    });
  });
  list.querySelectorAll('.btn-ci-del').forEach(btn => {
    btn.addEventListener('click', () => {
      settings.customPatterns.splice(parseInt(btn.dataset.idx), 1);
      renderCustomPatterns();
    });
  });
}

function updateWhitelistVisibility() {
  const section = document.getElementById('whitelistSection');
  const on = document.getElementById('useWhitelist').checked;
  section.classList.toggle('visible', on);
}

function loadUI() {
  document.getElementById('customPatternInput').value = settings.pattern || '2-4-5-rest';
  document.getElementById('smartDetect').checked   = settings.smartDetect !== false;
  document.getElementById('enabledToggle').checked = settings.enabled !== false;
  document.getElementById('useWhitelist').checked  = !!settings.useWhitelist;
  if (!Array.isArray(settings.whitelist)) settings.whitelist = [];
  updateWhitelistVisibility();
  renderPresets();
  renderTags();
  renderCustomPatterns();
}

chrome.storage.sync.get(['smartIDSettings'], (result) => {
  if (result.smartIDSettings) {
    settings = Object.assign({}, DEFAULTS, result.smartIDSettings);
    if (!Array.isArray(settings.whitelist)) settings.whitelist = [];
  }
  loadUI();
});

document.getElementById('customPatternInput').addEventListener('input', (e) => {
  settings.pattern = e.target.value.trim();
  renderPresets();
});

document.getElementById('useWhitelist').addEventListener('change', updateWhitelistVisibility);

document.getElementById('addSiteBtn').addEventListener('click', () => {
  const raw = document.getElementById('siteInput').value.trim();
  if (!raw) return;
  const clean = raw.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
  if (!clean) return;
  if (!Array.isArray(settings.whitelist)) settings.whitelist = [];
  if (!settings.whitelist.includes(clean)) {
    settings.whitelist.push(clean);
    renderTags();
  }
  document.getElementById('siteInput').value = '';
});

document.getElementById('siteInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('addSiteBtn').click();
});

document.getElementById('addPatternBtn').addEventListener('click', () => {
  const name = document.getElementById('newPatternName').value.trim();
  const val  = document.getElementById('newPatternVal').value.trim();
  if (!name || !val) return;
  if (!settings.customPatterns) settings.customPatterns = [];
  settings.customPatterns.push({ name, value: val });
  document.getElementById('newPatternName').value = '';
  document.getElementById('newPatternVal').value  = '';
  renderCustomPatterns();
});

document.getElementById('saveBtn').addEventListener('click', () => {
  settings.smartDetect  = document.getElementById('smartDetect').checked;
  settings.enabled      = document.getElementById('enabledToggle').checked;
  settings.useWhitelist = document.getElementById('useWhitelist').checked;
  settings.pattern      = document.getElementById('customPatternInput').value.trim() || '2-4-5-rest';

  chrome.storage.sync.set({ smartIDSettings: settings }, () => {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2600);
  });
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('Reset all settings to factory defaults?')) {
    settings = { ...DEFAULTS, whitelist: [], customPatterns: [...PRESETS] };
    chrome.storage.sync.set({ smartIDSettings: settings });
    loadUI();
  }
});
