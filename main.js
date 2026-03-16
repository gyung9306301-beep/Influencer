/*
  =============================
  반드시 수정해야 하는 부분
  =============================
  1) 아래 SHEET_ID 확인
  2) Google Sheet를 웹에 공개(Publish 또는 Anyone with the link can view)해야 합니다.
  3) 시트 이름이 정확히 "Influencer list" 이어야 합니다.

  현재 사용자 링크 기준 SHEET_ID:
  1WULcOtmX-UoH5huTAr6umW0rs27QeIYrEs8eDszT-JA
*/

const CONFIG = {
  SHEET_ID: '1WULcOtmX-UoH5huTAr6umW0rs27QeIYrEs8eDszT-JA',
  SHEET_NAME: 'Influencer list',
  HEADER_ROW: 1,
  REFRESH_CACHE_BUSTER: true
};

// A, B, C, D, E, F 표시
const columnMap = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5
};

const state = {
  rawRows: [],
  filteredRows: [],
  sortKey: 'A',
  sortDir: 'asc',
  page: 1,
  pageSize: 20,
  lastLoadedAt: null
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
  tableBody.innerHTML = `<tr><td colspan="6" class="loading">데이터를 불러오는 중입니다...</td></tr>`;

  try {
    const res = await fetch(buildSheetUrl());
    const text = await res.text();

    // gviz 응답은 JS 래퍼 형태이므로 JSON 부분만 추출
    const jsonText = text.match(/google\.visualization\.Query\.setResponse\((.*)\);?$/s)?.[1];
    if (!jsonText) throw new Error('Google Sheets 응답을 해석할 수 없습니다.');

    const json = JSON.parse(jsonText);
    const rows = json.table.rows || [];
    const cols = json.table.cols || [];

    const headerNames = cols.map((c, i) => c.label || String.fromCharCode(65 + i));

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
        _sheetIdx: idx + 2, // Sheet row number (Row 1 is header, Row 2 is idx 0)
        A: getValue(columnMap.A),
        B: getValue(columnMap.B),
        C: getValue(columnMap.C),
        D: getValue(columnMap.D),
        E: getValue(columnMap.E),
        F: getValue(columnMap.F),
        _headers: headerNames
      };
    }).filter(item => {
      // Exclude sheet row 2 and empty rows
      const isNotSheetRow2 = item._sheetIdx !== 2;
      const isNotEmpty = Object.values(item).some(v => typeof v === 'string' && v !== '');
      return isNotSheetRow2 && isNotEmpty;
    });

    state.lastLoadedAt = new Date();
    populateCategoryFilter();
    applyFilters();
    updatedPill.textContent = `Updated: ${formatDateTime(state.lastLoadedAt)}`;
    setStatus('최신 시트 데이터를 불러왔습니다.');
  } catch (error) {
    console.error(error);
    tableBody.innerHTML = `<tr><td colspan="6" class="empty">데이터를 불러오지 못했습니다.<br>시트가 공개 상태인지, 시트명이 정확히 <strong>Influencer list</strong>인지 확인해주세요.</td></tr>`;
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
    rows = rows.filter(r => [r.A, r.B, r.C, r.D, r.E, r.F].some(v => String(v).toLowerCase().includes(keyword)));
  }

  rows.sort((a, b) => compareValues(a[state.sortKey], b[state.sortKey], state.sortDir));

  state.filteredRows = rows;
  const totalPages = Math.max(1, Math.ceil(rows.length / state.pageSize));
  if (state.page > totalPages) state.page = totalPages;
  renderTable();
}

function renderTable() {
  const total = state.filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
  const start = (state.page - 1) * state.pageSize;
  const pageRows = state.filteredRows.slice(start, start + state.pageSize);

  countPill.textContent = `${total} rows`;
  pagePill.textContent = `Page ${state.page} / ${totalPages}`;

  if (!pageRows.length) {
    tableBody.innerHTML = `<tr><td colspan="6" class="empty">조건에 맞는 데이터가 없습니다.</td></tr>`;
    return;
  }

  tableBody.innerHTML = pageRows.map((row, idx) => `
    <tr>
      <td>${renderCell('A', row.A)}</td>
      <td>${renderCell('B', row.B)}</td>
      <td>${renderCell('C', row.C)}</td>
      <td>${renderCell('D', row.D)}</td>
      <td>${renderCell('E', row.E)}</td>
      <td>${renderCell('F', row.F)}</td>
    </tr>
  `).join('');
}

function renderCell(key, value) {
  if (!value) return '-';

  if (key === 'A' && /^\d+$/.test(String(value))) {
    return `<span class="rank">${escapeHtml(value)}</span>`;
  }

  if (key === 'F') {
    const url = isUrl(value) ? normalizeUrl(value) : `https://${String(value).trim()}`;
    return `<a class="link-btn" href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">Link</a>`;
  }

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

fetchSheetData();

// 선택: 5분마다 자동 갱신
setInterval(fetchSheetData, 5 * 60 * 1000);
