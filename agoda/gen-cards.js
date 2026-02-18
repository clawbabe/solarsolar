/**
 * 아고다 쿠폰 카드 HTML 생성 (CSV → cards_fragment.txt)
 * 매월 CSV 전달 시 형식이 달라질 수 있음. 첫 행을 헤더로 읽고, 컬럼명으로 그때그때 매핑함.
 * 실행: node gen-cards.js → cards_fragment.txt, tab_counts.json 생성 후 node inject-cards.js
 */

const fs = require('fs');
const path = require('path');

function parseCSVLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') inQ = !inQ;
    else if (c === ',' && !inQ) {
      out.push(cur.trim());
      cur = '';
    } else cur += c;
  }
  out.push(cur.trim());
  return out;
}

function normalizeHeader(h) {
  return (h || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/** 헤더 문자열이 주어진 키워드 중 하나를 포함하면 해당 필드로 매핑 (헤더 ↔ 키워드 포함 관계) */
function findCol(headerRow, keywords) {
  const lower = keywords.map(k => k.toLowerCase().trim());
  for (let i = 0; i < headerRow.length; i++) {
    const h = normalizeHeader(headerRow[i]);
    if (!h) continue;
    if (lower.some(k => h.includes(k))) return i;
  }
  return -1;
}

/** URL 컬럼: 헤더에 url/link 포함하거나, 값이 http로 시작하는 마지막 컬럼 */
function findUrlCol(headerRow, row) {
  const urlHeader = findCol(headerRow, ['url', 'link', '링크']);
  if (urlHeader >= 0) return urlHeader;
  for (let i = (row || []).length - 1; i >= 0; i--) {
    if (row[i] && String(row[i]).trim().startsWith('http')) return i;
  }
  return -1;
}

function esc(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function category(issuer, url) {
  if (issuer && String(issuer).trim() !== '아고다') return 'card';
  if (url && String(url).includes('benefitshub')) return 'benefitshub';
  return 'sale';
}

const CARD_COLORS = {
  삼성: 'purple', 마스터: 'orange', 하나: 'teal', 유니온: 'indigo', 'KB국민': 'yellow',
  비자: 'sky', 신한: 'rose', 'NH농협': 'amber', 현대: 'cyan', 우리: 'lime', 토스: 'blue'
};

function cardBadgeClass(issuer) {
  if (!issuer) return 'border-gray-200 bg-white text-gray-700';
  const key = Object.keys(CARD_COLORS).find(k => issuer.includes(k));
  const c = key ? CARD_COLORS[key] : 'gray';
  return `border-transparent bg-${c}-100 text-${c}-700`;
}

function getBadges(name, issuer, cond, info, code, cat) {
  const n = (name || '').toLowerCase();
  const c = (cond || '').toLowerCase();
  const i = (info || '').toLowerCase();
  const combined = n + ' ' + c + ' ' + i;
  const badges = [];

  badges.push({ label: '✓ 검증됨', class: 'border-transparent bg-green-100 text-green-700' });

  if (issuer && String(issuer).trim() !== '아고다') {
    badges.push({ label: '💳 ' + String(issuer).trim(), class: cardBadgeClass(issuer) });
  } else {
    if (combined.includes('항공권')) badges.push({ label: '✈️ 항공권', class: 'border-transparent bg-blue-100 text-blue-700' });
    if (combined.includes('한정') || combined.includes('시간 한정')) badges.push({ label: '시간 한정', class: 'border-transparent bg-red-100 text-red-700' });
    if (combined.includes('에코') || combined.includes('eco') || combined.includes('wwf') || combined.includes('기부')) badges.push({ label: '🌿 에코', class: 'border-transparent bg-emerald-100 text-emerald-700' });
    if (combined.includes('vip')) badges.push({ label: '👑 VIP', class: 'border-transparent bg-amber-100 text-amber-700' });
    if (combined.includes('앱') || combined.includes('모바일')) badges.push({ label: '📱 앱 전용', class: 'border-transparent bg-blue-100 text-blue-700' });
    if (combined.includes('미드나이트') || combined.includes('자정')) badges.push({ label: '🌙 심야 할인', class: 'border-transparent bg-indigo-100 text-indigo-700' });
    if (combined.includes('나이트 아울') || (combined.includes('저녁') && combined.includes('시'))) badges.push({ label: '🌙 저녁 타임', class: 'border-transparent bg-violet-100 text-violet-700' });
    if (code && String(code).trim()) badges.push({ label: '🔑 코드 입력', class: 'border-transparent bg-amber-100 text-amber-700' });
    if (badges.length === 1) badges.push({ label: '⚡ 자동 적용', class: 'border-gray-200 bg-white text-gray-700' });
  }

  return badges;
}

function validRange(start, end) {
  if (!start && !end) return '';
  return end ? `~${String(end).replace(/-/g, '.')}` : (start || '').replace(/-/g, '.');
}

function extractMinAmount(cond) {
  if (!cond) return '';
  const m = String(cond).match(/(\d{5,})원/);
  return m ? `₩${m[1].replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : '';
}

function get(row, idx) {
  if (idx < 0 || !row || idx >= row.length) return '';
  const v = row[idx];
  return v != null ? String(v).trim() : '';
}

// ---- CSV 읽기 및 헤더 매핑 ----
const csvPath = path.join(__dirname, 'agoda_promotion.csv');
const raw = fs.readFileSync(csvPath, 'utf8');
const lines = raw.split(/\r?\n/).filter(l => l.length > 0);
const headerRow = parseCSVLine(lines[0]);
const dataRows = lines.slice(1).map(l => parseCSVLine(l));

const col = {
  name: findCol(headerRow, ['프로모션명', '이름', 'name', '프로모션']),
  issuer: findCol(headerRow, ['카드사', '제휴사', 'issuer', '카드사/제휴사']),
  rate: findCol(headerRow, ['할인율', 'rate']),
  amount: findCol(headerRow, ['할인금액', 'amount', '금액']),
  start: findCol(headerRow, ['유효기간_시작', '시작', 'start', '유효기간']),
  end: findCol(headerRow, ['유효기간_종료', '종료', 'end']),
  cond: findCol(headerRow, ['적용조건', '조건', 'cond', '적용']),
  target: findCol(headerRow, ['적용대상', '대상', 'target']),
  exclude: findCol(headerRow, ['제외조건', '제외', 'exclude']),
  code: findCol(headerRow, ['프로모션코드', '코드', 'code']),
  info: findCol(headerRow, ['추가정보', '정보', 'info', '비고']),
};

const cards = [];
for (const row of dataRows) {
  const name = get(row, col.name);
  if (!name) continue;

  let issuer = get(row, col.issuer);
  let rate = get(row, col.rate);
  let amount = get(row, col.amount);
  const start = get(row, col.start);
  const end = get(row, col.end);
  const cond = get(row, col.cond);
  const target = get(row, col.target);
  const exclude = get(row, col.exclude);
  const code = get(row, col.code);
  let info = get(row, col.info);
  
  // benefitshub.co.kr/agoda-promo-code URL 필터링
  if (info && info.includes('benefitshub.co.kr/agoda-promo-code')) {
    info = '';
  }

  const urlIdx = findUrlCol(headerRow, row);
  let url = urlIdx >= 0 ? get(row, urlIdx) : '';
  if (!url && row) {
    const httpCols = row.map((c, i) => (c && String(c).trim().startsWith('http') ? i : -1)).filter(i => i >= 0);
    if (httpCols.length) url = get(row, httpCols[httpCols.length - 1]);
  }
  
  // benefitshub.co.kr/agoda-promo-code URL 필터링
  if (url && url.includes('benefitshub.co.kr/agoda-promo-code')) {
    url = '';
  }

  const cat = category(issuer, url);
  const link = url || 'https://www.agoda.com/ko-kr/deals';
  const rateDisplay = rate || amount || '—';
  const valid = validRange(start, end);
  const minAmount = extractMinAmount(cond);
  const descSrc = cond || info || '';
  const desc = descSrc.length > 120 ? descSrc.slice(0, 120) + '…' : descSrc;

  // 적용대상 로직: target 컬럼 우선, 없으면 info, 둘 다 없으면 cond에서 추출하되 사용조건과 중복 방지
  let applyTarget = target || '';
  
  // info가 URL이 아니면 사용
  if (!applyTarget && info && !info.startsWith('http')) {
    applyTarget = info;
  }
  
  // 적용대상이 없거나 사용조건과 동일하면 기본값 또는 name에서 추출
  if (!applyTarget || applyTarget === cond || applyTarget.startsWith('http')) {
    if (name.includes('국내')) applyTarget = '국내 호텔 & 리조트';
    else if (name.includes('해외')) applyTarget = '해외 호텔 & 리조트';
    else if (name.includes('일본')) applyTarget = '일본 숙소';
    else if (name.includes('항공권')) applyTarget = '항공권';
    else if (cat === 'card') applyTarget = '전세계 숙소';
    else applyTarget = '프로모션 대상 숙소';
  }
  
  const applyTargetStr = applyTarget.length > 50 ? applyTarget.slice(0, 50) + '…' : applyTarget;

  const badges = getBadges(name, issuer, cond, info, code, cat);
  const badgeSpans = badges.map(b => `<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${b.class}">${esc(b.label)}</span>`).join('\n              ');

  const meta = [];
  if (valid) meta.push(`<div class="flex justify-between"><span>유효기간:</span><span>${esc(valid)}</span></div>`);
  meta.push(`<div class="flex justify-between"><span>적용대상:</span><span>${esc(applyTargetStr)}</span></div>`);
  if (amount) meta.push(`<div class="flex justify-between"><span>할인금액:</span><span>${esc(amount)}</span></div>`);
  if (minAmount) meta.push(`<div class="flex justify-between"><span>최소결제:</span><span>${minAmount}</span></div>`);
  if (cat === 'card' && issuer) meta.push(`<div class="flex justify-between"><span>카드사:</span><span>${esc(issuer)}</span></div>`);
  if (code) meta.push(`<div class="flex justify-between"><span>할인코드:</span><span class="text-agoda font-medium">${esc(code)}</span></div>`);
  else if (cat === 'sale' || cat === 'benefitshub') meta.push(`<div class="flex justify-between"><span>할인코드:</span><span class="text-agoda font-medium">자동 적용</span></div>`);

  const metaHtml = meta.join('\n              ');

  // 간단 요약 (1줄)
  const shortDesc = (issuer && issuer !== '아고다') ? `${issuer} 할인` : (cat === 'card' ? '카드사 할인' : '특가 프로모션');
  
  // 상세 정보 토글 (조건/대상/특이사항 전체 표시 - 절대 축소 금지!)
  const detailSections = [];
  if (cond && cond.trim() && cond !== '-') {
    detailSections.push(`<p><strong>사용조건:</strong> ${esc(cond)}</p>`);
  }
  // 적용대상은 target 또는 exclude가 있을 때만 표시 (cond와 중복 방지)
  if (target && target.trim() && target !== '-' && target !== cond) {
    detailSections.push(`<p><strong>적용대상:</strong> ${esc(target)}</p>`);
  }
  if (exclude && exclude.trim() && exclude !== '-') {
    detailSections.push(`<p><strong>제외조건:</strong> ${esc(exclude)}</p>`);
  }
  if (info && info.trim() && info !== '-' && !info.startsWith('http')) {
    detailSections.push(`<p><strong>특이사항:</strong> ${esc(info)}</p>`);
  }
  
  const detailsHtml = detailSections.length > 0 
    ? `<details class="mb-3">
        <summary class="text-xs text-agoda cursor-pointer hover:underline mb-2 flex items-center gap-1">
          📋 유의사항 상세보기
        </summary>
        <div class="text-xs text-gray-600 space-y-2 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          ${detailSections.join('\n          ')}
        </div>
      </details>`
    : '';

  const card = `        <!-- ${esc(name)} -->
        <div class="coupon-card relative rounded-lg border bg-card text-card-foreground shadow-sm p-5 active" role="listitem" data-category="${cat}">
          <div class="flex flex-col h-full">
            <div class="flex flex-wrap gap-2 mb-3">
              ${badgeSpans}
            </div>
            <div class="mb-3">
              <span class="text-2xl font-bold text-agoda">${esc(rateDisplay)}</span>
            </div>
            <h2 class="font-bold mb-2 text-sm">${esc(name)}</h2>
            <p class="text-xs text-gray-500 mb-2">${shortDesc}</p>
            ${detailsHtml}
            <div class="space-y-1 text-xs text-gray-400 mb-4 mt-auto">
              ${metaHtml}
            </div>
            <a href="${esc(link)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-[#007cc2] text-white hover:bg-[#0069a8] h-9 px-4 py-2 w-full">적용하기</a>
          </div>
        </div>
`;
  cards.push(card);
}

const countAll = cards.length;
const countCard = cards.filter(c => c.includes('data-category="card"')).length;
const countSale = cards.filter(c => c.includes('data-category="sale"')).length;
const countBh = cards.filter(c => c.includes('data-category="benefitshub"')).length;

fs.writeFileSync(path.join(__dirname, 'cards_fragment.txt'), cards.join(''), 'utf8');
fs.writeFileSync(path.join(__dirname, 'tab_counts.json'), JSON.stringify({ countAll, countCard, countSale, countBh }), 'utf8');
console.log('Cards:', countAll, 'Card:', countCard, 'Sale:', countSale, 'BenefitsHub:', countBh);
