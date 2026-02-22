'use strict';

const STORAGE_KEY = 'espresso-shots';
const BLEND_KEY   = 'espresso-blend';

// ── Storage ──────────────────────────────────────────────────────────────────

function loadShots() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveShots(shots) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shots));
}

function loadBlend() {
  return localStorage.getItem(BLEND_KEY) || '';
}

function saveBlend(blend) {
  localStorage.setItem(BLEND_KEY, blend);
}

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem('espresso-prefs')) || {};
  } catch {
    return {};
  }
}

function savePrefs(prefs) {
  localStorage.setItem('espresso-prefs', JSON.stringify(prefs));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function ratio(dose, yieldG) {
  return dose > 0 ? `1\u202f:\u202f${(yieldG / dose).toFixed(1)}` : '—';
}

function bar(value) {
  const pct = ((value - 1) / 4) * 100;
  return `<div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>`;
}

// ── Render history list ───────────────────────────────────────────────────────

function renderShots() {
  const shots = loadShots().slice().sort((a, b) => b.ts - a.ts);
  const container = document.getElementById('shot-list');

  if (shots.length === 0) {
    container.innerHTML = '<p class="empty-state">No shots logged yet — pull your first!</p>';
    return;
  }

  container.innerHTML = shots.map(s => `
    <div class="shot-card">
      <div class="card-header">
        <span class="card-date">${formatDateTime(s.datetime)}</span>
        <button class="del-btn" title="Delete shot" data-id="${s.id}">&#x2715;</button>
      </div>
      <div class="card-stats">
        ${s.blend ? `<div class="stat stat-blend"><span class="stat-label">Blend</span><span class="stat-value">${escapeHtml(s.blend)}</span></div>` : ''}
        <div class="stat"><span class="stat-label">Grind</span><span class="stat-value">${s.grind}</span></div>
        <div class="stat"><span class="stat-label">Dose</span><span class="stat-value">${s.dose}&thinsp;g</span></div>
        <div class="stat"><span class="stat-label">Yield</span><span class="stat-value">${s.yield}&thinsp;g</span></div>
        <div class="stat"><span class="stat-label">Ratio</span><span class="stat-value">${ratio(s.dose, s.yield)}</span></div>
        <div class="stat"><span class="stat-label">Time</span><span class="stat-value">${s.time}&thinsp;s</span></div>
      </div>
      <div class="card-flavour">
        <div class="flavour-row">
          <span class="flavour-name">Acidity</span>${bar(s.acidity)}<span class="flavour-num">${s.acidity}/5</span>
        </div>
        <div class="flavour-row">
          <span class="flavour-name">Sweetness</span>${bar(s.sweetness)}<span class="flavour-num">${s.sweetness}/5</span>
        </div>
        <div class="flavour-row">
          <span class="flavour-name">Bitterness</span>${bar(s.bitterness)}<span class="flavour-num">${s.bitterness}/5</span>
        </div>
        <div class="flavour-row">
          <span class="flavour-name">Body</span>${bar(s.body)}<span class="flavour-num">${s.body}/5</span>
        </div>
      </div>
      ${s.notes ? `<div class="card-notes">${escapeHtml(s.notes)}</div>` : ''}
    </div>
  `).join('');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Delete ────────────────────────────────────────────────────────────────────

document.getElementById('shot-list').addEventListener('click', e => {
  const btn = e.target.closest('.del-btn');
  if (!btn) return;
  if (!confirm('Delete this shot?')) return;
  const shots = loadShots().filter(s => s.id !== btn.dataset.id);
  saveShots(shots);
  renderShots();
});

// ── Form submission ───────────────────────────────────────────────────────────

document.getElementById('shot-form').addEventListener('submit', e => {
  e.preventDefault();

  const blendVal = document.getElementById('blend').value.trim();
  const grindVal = document.getElementById('grind').value.trim();
  const doseVal  = document.getElementById('dose').value;
  saveBlend(blendVal);
  savePrefs({ grind: grindVal, dose: doseVal });

  const shot = {
    id:        crypto.randomUUID(),
    ts:        Date.now(),
    datetime:  document.getElementById('datetime').value,
    blend:     blendVal,
    grind:     document.getElementById('grind').value.trim(),
    dose:      parseFloat(document.getElementById('dose').value),
    yield:     parseFloat(document.getElementById('yield-g').value),
    time:      parseInt(document.getElementById('extime').value, 10),
    acidity:   parseInt(document.getElementById('acidity').value, 10),
    sweetness: parseInt(document.getElementById('sweetness').value, 10),
    bitterness:parseInt(document.getElementById('bitterness').value, 10),
    body:      parseInt(document.getElementById('body').value, 10),
    notes:     document.getElementById('notes').value.trim(),
  };

  const shots = loadShots();
  shots.push(shot);
  saveShots(shots);
  renderShots();

  // Reset form, then restore fields that persist
  e.target.reset();
  setNow();
  resetSliders();
  document.getElementById('blend').value = blendVal;
  document.getElementById('grind').value = grindVal;
  document.getElementById('dose').value  = doseVal;

  document.querySelector('section.panel:last-of-type')
    .scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ── Slider live display ───────────────────────────────────────────────────────

['acidity', 'sweetness', 'bitterness', 'body'].forEach(id => {
  const input   = document.getElementById(id);
  const display = document.getElementById(`${id}-display`);
  input.addEventListener('input', () => { display.textContent = input.value; });
});

function resetSliders() {
  ['acidity', 'sweetness', 'bitterness', 'body'].forEach(id => {
    document.getElementById(id).value = 3;
    document.getElementById(`${id}-display`).textContent = '3';
  });
}

// ── Pre-fill datetime ─────────────────────────────────────────────────────────

function setNow() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  document.getElementById('datetime').value =
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

// ── Init ──────────────────────────────────────────────────────────────────────

setNow();
document.getElementById('blend').value = loadBlend();
const prefs = loadPrefs();
document.getElementById('grind').value = prefs.grind || '';
document.getElementById('dose').value  = prefs.dose  || '';
renderShots();
