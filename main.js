const CONFIG = {
  SHEET_ID: '1WULcOtmX-UoH5huTAr6umW0rs27QeIYrEs8eDszT-JA',
  SHEET_NAME: 'Influencer list',
  HEADER_ROW: 1,
  REFRESH_CACHE_BUSTER: true,
  PREMIUM_PREVIEW_DEFAULT: false
};

const columnMap = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
  G: 6,
  H: 7,
  I: 8,
  J: 9
};

const premiumHeaders = ['G', 'H', 'I', 'J'];

const state = {
  rawRows: [],
  filteredRows: [],
  sortKey: 'A',
  sortDir: 'asc',
  page: 1,
  pageSize: 20,
  lastLoadedAt: null,
  premiumPreview: CONFIG.PREMIUM_PREVIEW_DEFAULT
};

const $ = (id) => document.getElementById(id);
const tableBody = $('tableBody');
const categoryFilter = $('categoryFilter');
const searchInput = $('searchInput');
const pageSize = $('pageSize');
const statusText = $('statusText');
const updatedPill = $('updatedPill');
const countPill = $('countPill');
const pagePill = $('pagePill');
const planPill = $('planPill');
const lockChip = $('lockChip');
const previewPremiumBtn = $('previewPremiumBtn');

function buildSheetUrl() {
  const base = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq`;
  const params = new URLSearchParams({
    tqx: 'out:json',
    sheet: CONFIG.SHEET_NAME,
    headers: String(CONFIG.HEADER_ROW)
  });
  if (CONFIG.REFRESH_CACHE_BUSTER) {
    params.set('_', String(Date.now()));
  }
  return `${base}?${params.toString()}`;
}

async function fetchSheetData() {
  setStatus('Google Sheets 데이터를 불러오는 중...');
  tableBody.innerHTML = `<tr><td colspan="10" class="loading">데이터를 불러오는 중입니다...</td></tr>`;

  try {
    const res = await fetch(buildSheetUrl());
    const text = await res.text();
    const jsonText = text.match(/google\.visualization\.Query\.setResponse\((.*)\);?$/s)?.[1];
    if (!jsonText) throw new Error('Google Sheets 응답을 해석할 수 없습니다.');

    const json = JSON.parse(jsonText);
    const rows = json.table.rows || [];

    state.rawRows = rows.map((row, idx) => {
      const cells = row.c || [];
      const getValue = (i) => {
        const cell = cells[i];
        if (!cell) return '';
        if (cell.f != null) return String(cell.f).trim();
        if (cell.v == null) return '';
        return String(cell.v).trim();
      };

      return {
        _sheetIdx: idx + 2, // 1-based index where idx 0 is row 2
        A: getValue(columnMap.A),
        B: getValue(columnMap.B),
        C: getValue(columnMap.C),
        D: getValue(columnMap.D),
        E: getValue(columnMap.E),
        F: getValue(columnMap.F),
        G: getValue(columnMap.G),
        H: getValue(columnMap.H),
        I: getValue(columnMap.I),
        J: getValue(columnMap.J)
      };
    }).filter(item => {
      // Exclude sheet row 2 (which is idx 0 in our mapping since header is row 1)
      const isNotSheetRow2 = item._sheetIdx !== 2;
      const isNotEmpty = [item.B, item.C, item.D, item.E, item.F].some(v => String(v).trim() !== '');
      return isNotSheetRow2 && isNotEmpty;
    });

    state.lastLoadedAt = new Date();
    populateCategoryFilter();
    applyFilters();
    updatedPill.textContent = `Updated: ${formatDateTime(state.lastLoadedAt)}`;
    setStatus('최신 시트 데이터를 불러왔습니다.');
  } catch (error) {
    console.error(error);
    tableBody.innerHTML = `<tr><td colspan="10" class="empty">데이터를 불러오지 못했습니다.<br>시트가 공개 상태인지, 시트명이 정확히 <strong>Influencer list</strong>인지 확인해주세요.</td></tr>`;
    setStatus(`오류: ${error.message}`);
  }
}

function populateCategoryFilter() {
  const current = categoryFilter.value;
  const unique = [...new Set(state.rawRows.map(r => r.C).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ko'));
  categoryFilter.innerHTML = `<option value="">전체</option>` + unique.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('');
  if (unique.includes(current)) categoryFilter.value = current;
}

function applyFilters() {
  const keyword = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  state.pageSize = Number(pageSize.value || 20);

  let rows = [...state.rawRows];

  if (category) {
    rows = rows.filter(r => r.C === category);
  }

  if (keyword) {
    rows = rows.filter(r => [r.B, r.C, r.D, r.E, r.F, r.G, r.H, r.I, r.J].some(v => String(v).toLowerCase().includes(keyword)));
  }

  rows.sort((a, b) => compareValues(getSortValue(a), getSortValue(b), state.sortDir));
  state.filteredRows = rows;

  const totalPages = Math.max(1, Math.ceil(rows.length / state.pageSize));
  if (state.page > totalPages) state.page = totalPages;
  renderTable();
}

function getSortValue(row) {
  if (state.sortKey === 'A') return row._idx;
  return row[state.sortKey] ?? '';
}

function renderTable() {
  const total = state.filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
  const start = (state.page - 1) * state.pageSize;
  const pageRows = state.filteredRows.slice(start, start + state.pageSize);

  countPill.textContent = `${total} rows`;
  pagePill.textContent = `Page ${state.page} / ${totalPages}`;
  planPill.textContent = `Current View: ${state.premiumPreview ? 'Premium Preview' : 'Free'}`;
  lockChip.textContent = state.premiumPreview ? 'Unlocked Preview' : 'Locked';

  if (!pageRows.length) {
    tableBody.innerHTML = `<tr><td colspan="10" class="empty">조건에 맞는 데이터가 없습니다.</td></tr>`;
    return;
  }

  tableBody.innerHTML = pageRows.map((row, idx) => `
    <tr>
      <td>${renderCell('A', start + idx + 1)}</td>
      <td>${renderCell('B', row.B)}</td>
      <td>${renderCell('C', row.C)}</td>
      <td>${renderCell('D', row.D)}</td>
      <td>${renderCell('E', row.E)}</td>
      <td>${renderCell('F', row.F)}</td>
      ${premiumHeaders.map(key => `<td class="premium-col ${state.premiumPreview ? 'premium-unlocked' : 'premium-locked'}">${renderCell(key, row[key])}</td>`).join('')}
    </tr>
  `).join('');
}

function renderCell(key, value) {
  if (key === 'A') {
    return `<span class="rank">${escapeHtml(value)}</span>`;
  }

  if (key === 'F') {
    if (!value) return '-';
    const url = isUrl(value) ? normalizeUrl(value) : `https://${String(value).trim()}`;
    return `<a class="link-btn" href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">Link</a>`;
  }

  if (premiumHeaders.includes(key)) {
    if (!value) {
      return state.premiumPreview ? '-' : `<span class="lock-chip">Premium</span>`;
    }
    return state.premiumPreview ? escapeHtml(value) : `<span class="lock-chip">Premium</span>`;
  }

  if (!value) return '-';
  if (isUrl(value)) {
    return `<a class="link" href="${escapeAttr(normalizeUrl(value))}" target="_blank" rel="noopener noreferrer">${escapeHtml(value)}</a>`;
  }

  return escapeHtml(value);
}

function compareValues(a, b, dir = 'asc') {
  const aa = String(a ?? '').trim();
  const bb = String(b ?? '').trim();
  const na = Number(aa.replace(/,/g, ''));
  const nb = Number(bb.replace(/,/g, ''));

  let result;
  if (!Number.isNaN(na) && !Number.isNaN(nb) && aa !== '' && bb !== '') {
    result = na - nb;
  } else {
    result = aa.localeCompare(bb, 'ko', { numeric: true, sensitivity: 'base' });
  }

  return dir === 'asc' ? result : -result;
}

function setStatus(text) {
  statusText.textContent = text;
}

function formatDateTime(date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(date);
}

function isUrl(value) {
  return /^https?:\/\//i.test(value) || /^www\./i.test(value);
}

function normalizeUrl(value) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(str) {
  return escapeHtml(str);
}

function togglePremiumPreview(event) {
  event.preventDefault();
  state.premiumPreview = !state.premiumPreview;
  previewPremiumBtn.textContent = state.premiumPreview ? 'Free 화면으로 보기' : '미리보기 전환';
  renderTable();
}

document.querySelectorAll('thead th').forEach(th => {
  th.addEventListener('click', () => {
    const key = th.dataset.key;
    if (state.sortKey === key) {
      state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      state.sortKey = key;
      state.sortDir = 'asc';
    }
    applyFilters();
  });
});

searchInput.addEventListener('input', () => {
  state.page = 1;
  applyFilters();
});

categoryFilter.addEventListener('change', () => {
  state.page = 1;
  applyFilters();
});

pageSize.addEventListener('change', () => {
  state.page = 1;
  applyFilters();
});

$('prevBtn').addEventListener('click', () => {
  if (state.page > 1) {
    state.page -= 1;
    renderTable();
  }
});

$('nextBtn').addEventListener('click', () => {
  const totalPages = Math.max(1, Math.ceil(state.filteredRows.length / state.pageSize));
  if (state.page < totalPages) {
    state.page += 1;
    renderTable();
  }
});

$('resetBtn').addEventListener('click', () => {
  searchInput.value = '';
  categoryFilter.value = '';
  pageSize.value = '20';
  state.page = 1;
  state.sortKey = 'A';
  state.sortDir = 'asc';
  applyFilters();
});

$('refreshBtn').addEventListener('click', fetchSheetData);
previewPremiumBtn.addEventListener('click', togglePremiumPreview);

fetchSheetData();
setInterval(fetchSheetData, 5 * 60 * 1000);

/**
 * Disqus Comments
 */
(function() {
  const d = document, s = d.createElement('script');
  s.src = 'https://thai-influencer.disqus.com/embed.js';
  s.setAttribute('data-timestamp', +new Date());
  (d.head || d.body).appendChild(s);
})();
