function parsePattern(patternStr) {
  return patternStr.split('-').map(p => (p.toLowerCase() === 'rest' ? 'rest' : parseInt(p, 10)));
}

function applyPattern(raw, segments) {
  let result = '';
  let pos = 0;
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

function formattedToRawPos(formattedPos, formattedStr) {
  let raw = 0;
  for (let i = 0; i < formattedPos && i < formattedStr.length; i++) {
    if (formattedStr[i] !== '-') raw++;
  }
  return raw;
}

function rawToFormattedPos(rawPos, formattedStr) {
  let raw = 0;
  for (let i = 0; i < formattedStr.length; i++) {
    if (raw >= rawPos) return i;
    if (formattedStr[i] !== '-') raw++;
  }
  return formattedStr.length;
}

function formatValue(value, patternStr, cursorPos) {
  const segments = parsePattern(patternStr);
  const raw = value.replace(/-/g, '');
  const rawCursor = formattedToRawPos(cursorPos, value);
  const formatted = applyPattern(raw, segments);
  const newCursor = rawToFormattedPos(rawCursor, formatted);
  return { formatted, newCursor };
}

window.KaloyaIDFormatter = { formatValue, parsePattern, applyPattern };
