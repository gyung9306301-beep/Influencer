import { checkUser, showLoginModal, initAuthUI } from './auth.js';

const CONFIG = {
  SHEET_ID: '1WULcOtmX-UoH5huTAr6umW0rs27QeIYrEs8eDszT-JA',
  SHEET_NAME: 'Influencer list',
  HEADER_ROW: 3,
  REFRESH_CACHE_BUSTER: false
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
  I: 8
};

const state = {
  rawRows: [],
  filteredRows: [],
  sortKey: 'A',
  sortDir: 'asc',
  page: 1,
  pageSize: 10,
  lastLoadedAt: null,
  selectedNicknames: new Set()
};

const $ = (id) => document.getElementById(id);

document.addEventListener('DOMContentLoaded', () => {
  const tableBody = $('tableBody');
  const categoryFilter = $('categoryFilter');
  const searchInput = $('searchInput');
  const pageSize = $('pageSize');
  const statusText = $('statusText');
  const updatedPill = $('updatedPill');
  const countPill = $('countPill');
  const pagePill = $('pagePill');
  const planPill = $('planPill');
  const selectionPill = $('selectionPill');
  const resetSelectionBtn = $('resetSelectionBtn');
  const checkQuoteBtn = $('checkQuoteBtn');
  const refreshBtn = $('refreshBtn');
  const prevBtn = $('prevBtn');
  const nextBtn = $('nextBtn');
  const resetBtn = $('resetBtn');

  function setText(el, text) {
    if (el) el.textContent = text;
  }

  function setHtml(el, html) {
    if (el) el.innerHTML = html;
  }

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
    setHtml(
      tableBody,
      `<tr><td colspan="10" class="loading">데이터를 불러오는 중입니다...</td></tr>`
    );

    try {
      const res = await fetch(buildSheetUrl());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const text = await res.text();
      const jsonText = text.match(/google\.visualization\.Query\.setResponse\((.*)\);?$/s)?.[1];

      if (!jsonText) {
        throw new Error('Google Sheets 응답을 해석할 수 없습니다.');
      }

      const json = JSON.parse(jsonText);
      const rows = json.table?.rows || [];

      state.rawRows = rows
        .map((row, idx) => {
          const cells = row.c || [];

          const getValue = (i) => {
            const cell = cells[i];
            if (!cell) return '';
            if (cell.f != null) return String(cell.f).trim();
            if (cell.v != null) return String(cell.v).trim();
            return '';
          };

          return {
            _sheetIdx: idx + 2,
            A: getValue(columnMap.A),
            B: getValue(columnMap.B),
            C: getValue(columnMap.C),
            D: getValue(columnMap.D),
            E: getValue(columnMap.E),
            F: getValue(columnMap.F),
            G: getValue(columnMap.G),
            H: getValue(columnMap.H),
            I: getValue(columnMap.I)
          };
        })
        .filter((item) => {
          const isNotSheetRow2 = item._sheetIdx !== 2;
          const isNotEmpty = [item.B, item.C, item.D, item.E, item.F].some(
            (v) => String(v).trim() !== ''
          );
          return isNotSheetRow2 && isNotEmpty;
        });

      state.lastLoadedAt = new Date();
      populateCategoryFilter();
      applyFilters();
      setText(updatedPill, `Updated: ${formatDateTime(state.lastLoadedAt)}`);
      setText(planPill, 'Current View: Open');
      setStatus('최신 시트 데이터를 불러왔습니다.');
    } catch (error) {
      console.error(error);
      setHtml(
        tableBody,
        `<tr><td colspan="10" class="empty">데이터를 불러오지 못했습니다.<br>시트가 공개 상태인지, 시트명이 정확히 <strong>Influencer list</strong>인지 확인해주세요.</td></tr>`
      );
      setStatus(`오류: ${error.message}`);
    }
  }

  function populateCategoryFilter() {
    if (!categoryFilter) return;

    const current = categoryFilter.value;
    const unique = [...new Set(state.rawRows.map((r) => r.C).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, 'ko')
    );

    categoryFilter.innerHTML =
      `<option value="">전체</option>` +
      unique.map((v) => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('');

    if (unique.includes(current)) {
      categoryFilter.value = current;
    }
  }

  function applyFilters() {
    const keyword = (searchInput?.value || '').trim().toLowerCase();
    const category = categoryFilter?.value || '';
    state.pageSize = Number(pageSize?.value || 10);

    let rows = [...state.rawRows];

    if (category) {
      rows = rows.filter((r) => r.C === category);
    }

    if (keyword) {
      rows = rows.filter((r) =>
        [r.B, r.C, r.D, r.E, r.F, r.G, r.H, r.I].some((v) =>
          String(v).toLowerCase().includes(keyword)
        )
      );
    }

    rows.sort((a, b) => compareValues(getSortValue(a), getSortValue(b), state.sortDir));
    state.filteredRows = rows;

    const totalPages = Math.max(1, Math.ceil(rows.length / state.pageSize));
    if (state.page > totalPages) state.page = totalPages;

    renderTable();
  }

  function getSortValue(row) {
    if (state.sortKey === 'A') return row._sheetIdx;
    return row[state.sortKey] ?? '';
  }

  function renderTable() {
    const total = state.filteredRows.length;
    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    const start = (state.page - 1) * state.pageSize;
    const pageRows = state.filteredRows.slice(start, start + state.pageSize);

    setText(countPill, `${total} rows`);
    setText(pagePill, `Page ${state.page} / ${totalPages}`);
    updateSelectionCount();

    if (!pageRows.length) {
      setHtml(tableBody, `<tr><td colspan="10" class="empty">조건에 맞는 데이터가 없습니다.</td></tr>`);
      return;
    }

    setHtml(
      tableBody,
      pageRows.map((row, idx) => `
        <tr>
          <td>${renderCell('A', start + idx + 1)}</td>
          <td>${renderCell('B', row.B)}</td>
          <td>${renderCell('C', row.C)}</td>
          <td class="text-right">${renderCell('D', row.D)}</td>
          <td>${renderCell('E', row.E)}</td>
          <td>${renderCell('F', row.F)}</td>
          <td class="text-center">
            <input type="checkbox" class="row-checkbox" data-nickname="${escapeAttr(row.B)}" ${state.selectedNicknames.has(row.B) ? 'checked' : ''}>
          </td>
          <td class="text-right">${renderCell('G', row.G)}</td>
          <td class="text-right">${renderCell('H', row.H)}</td>
          <td class="text-right">${renderCell('I', row.I)}</td>
        </tr>
      `).join('')
    );
  }

  function updateSelectionCount() {
    setText(selectionPill, `선택 된 인플루언서 총 ${state.selectedNicknames.size}명`);
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
    setText(statusText, text);
  }

  function formatDateTime(date) {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
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

  function getQuoteFeeByGrade(grade) {
    const normalized = String(grade || '').trim().toLowerCase();

    if (normalized === 'mega') return 3000;
    if (normalized === 'macro') return 2000;
    if (normalized === 'micro') return 1000;
    return 0;
  }

  async function goToQuotePage() {
    const user = await checkUser();
    if (!user) {
      showLoginModal();
      return;
    }

    const selectedRows = state.rawRows.filter((row) => state.selectedNicknames.has(row.B));

    if (selectedRows.length === 0) {
      alert('인플루언서를 먼저 선택해주세요.');
      return;
    }

    const payload = selectedRows.map((row) => ({
      nickname: row.B,
      category: row.C,
      followers: row.D,
      grade: row.E,
      fee: getQuoteFeeByGrade(row.E)
    }));

    localStorage.setItem('selectedInfluencersForQuote', JSON.stringify(payload));
    window.location.href = 'quote.html';
  }

  document.querySelectorAll('thead th').forEach((th) => {
    th.addEventListener('click', () => {
      const key = th.dataset.key;
      if (!key) return;

      if (state.sortKey === key) {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortKey = key;
        state.sortDir = 'asc';
      }
      applyFilters();
    });
  });

  searchInput?.addEventListener('input', () => {
    state.page = 1;
    applyFilters();
  });

  categoryFilter?.addEventListener('change', () => {
    state.page = 1;
    applyFilters();
  });

  pageSize?.addEventListener('change', () => {
    state.page = 1;
    applyFilters();
  });

  prevBtn?.addEventListener('click', () => {
    if (state.page > 1) {
      state.page -= 1;
      renderTable();
    }
  });

  nextBtn?.addEventListener('click', () => {
    const totalPages = Math.max(1, Math.ceil(state.filteredRows.length / state.pageSize));
    if (state.page < totalPages) {
      state.page += 1;
      renderTable();
    }
  });

  resetBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (pageSize) pageSize.value = '10';

    state.page = 1;
    state.sortKey = 'A';
    state.sortDir = 'asc';
    applyFilters();
  });

  tableBody?.addEventListener('change', (e) => {
    if (e.target.classList.contains('row-checkbox')) {
      const nickname = e.target.dataset.nickname;
      if (!nickname) return;

      if (e.target.checked) {
        state.selectedNicknames.add(nickname);
      } else {
        state.selectedNicknames.delete(nickname);
      }
      updateSelectionCount();
    }
  });

  refreshBtn?.addEventListener('click', fetchSheetData);

  resetSelectionBtn?.addEventListener('click', () => {
    state.selectedNicknames.clear();
    updateSelectionCount();
    renderTable();
  });

  checkQuoteBtn?.addEventListener('click', goToQuotePage);

  fetchSheetData();

  (function initVisitorCounter() {
    const todayKey = 'visit_today';
    const totalKey = 'visit_total';
    const dateKey = 'visit_date';
    const timeKey = 'visit_last_time';

    const todayEl = $('todayCount');
    const totalEl = $('totalCount');
    if (!todayEl || !totalEl) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const savedDate = localStorage.getItem(dateKey);
    const lastVisitTime = parseInt(localStorage.getItem(timeKey) || '0', 10);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    let todayCount = parseInt(localStorage.getItem(todayKey) || '0', 10);
    let totalCount = parseInt(localStorage.getItem(totalKey) || '0', 10);

    if (savedDate !== todayStr) {
      todayCount = 0;
      localStorage.setItem(dateKey, todayStr);
    }

    if (now - lastVisitTime > oneHour) {
      todayCount += 1;
      totalCount += 1;

      localStorage.setItem(todayKey, todayCount);
      localStorage.setItem(totalKey, totalCount);
      localStorage.setItem(timeKey, now.toString());
    }

    todayEl.textContent = todayCount;
    totalEl.textContent = totalCount;
  })();

  initAuthUI();

  window.loadDisqus = function () {
  const d = document;
  const s = d.createElement('script');
  s.src = 'https://thai-influencer.disqus.com/embed.js';
  s.setAttribute('data-timestamp', String(+new Date()));
  (d.head || d.body).appendChild(s);
};
  });
