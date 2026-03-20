document.addEventListener('DOMContentLoaded', () => {
  const quoteTableBody = document.getElementById('quoteTableBody');
  const selectedCountPill = document.getElementById('selectedCountPill');
  const totalFeePill = document.getElementById('totalFeePill');
  const quoteStatusText = document.getElementById('quoteStatusText');
  const requestQuoteBtn = document.getElementById('requestQuoteBtn');

  function setText(el, text) {
    if (el) el.textContent = text;
  }

  function formatNumber(value) {
    const num = Number(String(value).replace(/,/g, ''));
    if (Number.isNaN(num)) return value;
    return num.toLocaleString('ko-KR');
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  const selected = JSON.parse(localStorage.getItem('selectedInfluencersForQuote') || '[]');

  if (!selected.length) {
    if (quoteTableBody) {
      quoteTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="empty">
            선택된 인플루언서가 없습니다. 랭킹 페이지에서 먼저 선택해주세요.
          </td>
        </tr>
      `;
    }

    setText(selectedCountPill, '0명 선택');
    setText(totalFeePill, '총 비용: 0원');
    setText(quoteStatusText, '선택된 데이터 없음');
    return;
  }

  const totalFee = selected.reduce((sum, item) => sum + Number(item.fee || 0), 0);

  if (quoteTableBody) {
    quoteTableBody.innerHTML = selected.map((item) => `
      <tr>
        <td>${escapeHtml(item.nickname)}</td>
        <td>${escapeHtml(item.category)}</td>
        <td class="text-right">${escapeHtml(formatNumber(item.followers))}</td>
        <td>${escapeHtml(item.grade)}</td>
        <td class="text-right">${escapeHtml(formatNumber(item.fee))}원</td>
      </tr>
    `).join('');
  }

  setText(selectedCountPill, `${selected.length}명 선택`);
  setText(totalFeePill, `총 비용: ${formatNumber(totalFee)}원`);
  setText(quoteStatusText, '견적 확인 비용이 계산되었습니다.');

  requestQuoteBtn?.addEventListener('click', () => {
    alert(`견적 확인 진행 예정입니다.\n총 결제 금액: ${formatNumber(totalFee)}원`);
  });
});