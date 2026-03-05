const PATTERN_NAMES = {
  '2-4-5-rest': 'CPR / FBR Reference',
  '3-3-4':      'Phone Number Format',
  '4-4-4-4':    'Credit Card Format',
  '5-7-1':      'CNIC Pakistan',
};

function parsePattern(str) {
  return str.split('-').map(p => p.toLowerCase() === 'rest' ? 'rest' : parseInt(p, 10));
}

function applyPattern(raw, segments) {
  let result = '', pos = 0;
  for (const seg of segments) {
    if (pos >= raw.length) break;
    const chunk = seg === 'rest' ? raw.slice(pos) : raw.slice(pos, pos + seg);
    pos += seg === 'rest' ? chunk.length : seg;
    if (!chunk.length) break;
    if (result) result += '-';
    result += chunk;
  }
  return result;
}

function formatPreview(value, patternStr) {
  return applyPattern(value.replace(/-/g, '').toUpperCase(), parsePattern(patternStr));
}

document.addEventListener('DOMContentLoaded', () => {
  const toggle    = document.getElementById('enableToggle');
  const card      = document.getElementById('toggleCard');
  const orb       = document.getElementById('statusOrb');
  const title     = document.getElementById('statusTitle');
  const sub       = document.getElementById('statusSub');
  const patDisp   = document.getElementById('patternDisplay');
  const patDesc   = document.getElementById('patternDesc');
  const demoIn    = document.getElementById('demoInput');
  const demoOut   = document.getElementById('demoOutput');

  let currentPattern = '2-4-5-rest';

  chrome.storage.sync.get(['smartIDSettings'], (result) => {
    const s = result.smartIDSettings || {};
    currentPattern = s.pattern || '2-4-5-rest';
    const enabled = s.enabled !== false;
    toggle.checked = enabled;
    updateStatus(enabled);
    patDisp.textContent = currentPattern;
    patDesc.textContent = PATTERN_NAMES[currentPattern] || 'Custom Pattern';
  });

  function updateStatus(on) {
    if (on) {
      orb.className = 'status-orb on';
      title.textContent = 'Formatter Active';
      sub.textContent = 'Formatting ID fields on this page';
      card.classList.add('active');
    } else {
      orb.className = 'status-orb';
      title.textContent = 'Formatter Disabled';
      sub.textContent = 'Toggle to activate';
      card.classList.remove('active');
    }
  }

  toggle.addEventListener('change', () => {
    updateStatus(toggle.checked);
    chrome.storage.sync.get(['smartIDSettings'], (result) => {
      const s = result.smartIDSettings || {};
      s.enabled = toggle.checked;
      chrome.storage.sync.set({ smartIDSettings: s });
    });
  });

  demoIn.addEventListener('input', () => {
    const v = demoIn.value;
    if (!v.trim()) {
      demoOut.textContent = 'Formatted result appears here';
      demoOut.classList.add('empty');
      return;
    }
    demoOut.textContent = formatPreview(v, currentPattern);
    demoOut.classList.remove('empty');
  });

  document.getElementById('openOptions').addEventListener('click', () => chrome.runtime.openOptionsPage());
  document.getElementById('openHelp').addEventListener('click', () => chrome.tabs.create({ url: chrome.runtime.getURL('guide.html') }));
});
