/**
 * 트립닷컴 쿠폰 카드 HTML 생성 (CSV → cards_fragment.txt)
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

function esc(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 카테고리 분류: 카드사 할인, 일반 할인, 신규회원
function category(issuer, name) {
  const n = (name || '').toLowerCase();
  if (n.includes('신규회원') || n.includes('신규 회원')) return 'new';
  if (issuer && issuer.trim() && issuer !== '일반' && issuer !== '트립닷컴') return 'card';
  return 'sale';
}

// 카드사별 색상
const CARD_COLORS = {
  'KB국민': 'yellow', VISA: 'blue', 신한: 'rose', BC: 'red', 우리: 'lime',
  현대: 'cyan', 마스터: 'orange', 롯데: 'rose', 삼성: 'purple'
};

function cardBadgeClass(issuer) {
  if (!issuer) return 'border-gray-200 bg-white text-gray-700';
  const key = Object.keys(CARD_COLORS).find(k => issuer.includes(k));
  const c = key ? CARD_COLORS[key] : 'gray';
  return `border-transparent bg-${c}-100 text-${c}-700`;
}

function getBadges(name, issuer, target, code) {
  const badges = [];
  badges.push({ label: '✓ 검증됨', class: 'border-transparent bg-green-100 text-green-700' });

  const n = (name || '').toLowerCase();
  const t = (target || '').toLowerCase();
  const combined = n + ' ' + t;

  if (issuer && issuer.trim() && issuer !== '일반' && issuer !== '트립닷컴') {
    badges.push({ label: '💳 ' + issuer.trim(), class: cardBadgeClass(issuer) });
  } else {
    if (combined.includes('신규회원') || combined.includes('신규 회원')) {
      badges.push({ label: '🎁 신규회원', class: 'border-transparent bg-pink-100 text-pink-700' });
    }
    if (combined.includes('항공')) badges.push({ label: '✈️ 항공권', class: 'border-transparent bg-blue-100 text-blue-700' });
    if (combined.includes('호텔')) badges.push({ label: '🏨 호텔', class: 'border-transparent bg-purple-100 text-purple-700' });
    if (combined.includes('액티비티')) badges.push({ label: '🎭 액티비티', class: 'border-transparent bg-amber-100 text-amber-700' });
    if (combined.includes('렌터카')) badges.push({ label: '🚗 렌터카', class: 'border-transparent bg-teal-100 text-teal-700' });
    if (combined.includes('앱') || combined.includes('모바일')) {
      badges.push({ label: '📱 앱 전용', class: 'border-transparent bg-blue-100 text-blue-700' });
    }
    if (code && String(code).trim()) {
      badges.push({ label: '🔑 코드 입력', class: 'border-transparent bg-amber-100 text-amber-700' });
    }
  }

  if (badges.length === 1) {
    badges.push({ label: '⚡ 자동 적용', class: 'border-gray-200 bg-white text-gray-700' });
  }

  return badges;
}

function get(row, idx) {
  if (idx < 0 || !row || idx >= row.length) return '';
  const v = row[idx];
  return v != null ? String(v).trim() : '';
}

// ---- CSV 읽기 ----
const csvPath = path.join(__dirname, 'trip_discounts.csv');
const raw = fs.readFileSync(csvPath, 'utf8');
const lines = raw.split(/\r?\n/).filter(l => l.length > 0);
const headerRow = parseCSVLine(lines[0]);
const dataRows = lines.slice(1).map(l => parseCSVLine(l));

// 컬럼 인덱스
const col = {
  name: 0,        // 프로모션명
  issuer: 1,      // 카드사
  code: 2,        // 할인코드
  rate: 3,        // 할인율/금액
  target: 4,      // 적용대상
  bookStart: 5,   // 예약기간
  travelPeriod: 6, // 투숙/탑승기간
  minAmount: 7,   // 최소구매금액
  currency: 8,    // 결제통화
  useCond: 9,     // 사용조건
  exclude: 10,    // 제외조건
  notice: 11      // 유의사항
};

const cards = [];

for (const row of dataRows) {
  const name = get(row, col.name);
  if (!name) continue;

  const issuer = get(row, col.issuer);
  const code = get(row, col.code);
  const rate = get(row, col.rate);
  const target = get(row, col.target);
  const bookStart = get(row, col.bookStart);
  const travelPeriod = get(row, col.travelPeriod);
  const minAmount = get(row, col.minAmount);
  const currency = get(row, col.currency);
  const useCond = get(row, col.useCond);
  const exclude = get(row, col.exclude);
  const notice = get(row, col.notice);

  const cat = category(issuer, name);
  const link = 'http://app.ac/2qp4OR273';
  const rateDisplay = rate || '—';

  // 예약기간 포맷팅
  const bookPeriod = bookStart.replace(/~/g, ' ~ ').replace(/-/g, '.');

  // 적용대상
  const targetDisplay = target || '프로모션 대상 상품';

  const badges = getBadges(name, issuer, target, code);
  const badgeSpans = badges.map(b => 
    `<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${b.class}">${esc(b.label)}</span>`
  ).join('\n              ');

  const meta = [];
  if (bookPeriod && bookPeriod !== '~') {
    meta.push(`<div class="flex justify-between"><span>예약기간:</span><span>${esc(bookPeriod)}</span></div>`);
  }
  if (travelPeriod && travelPeriod !== '~') {
    meta.push(`<div class="flex justify-between"><span>이용기간:</span><span>${esc(travelPeriod)}</span></div>`);
  }
  meta.push(`<div class="flex justify-between"><span>적용대상:</span><span>${esc(targetDisplay)}</span></div>`);
  if (minAmount) {
    meta.push(`<div class="flex justify-between"><span>최소결제:</span><span>${esc(minAmount)}</span></div>`);
  }
  if (currency && currency !== '모든통화') {
    meta.push(`<div class="flex justify-between"><span>결제통화:</span><span>${esc(currency)}</span></div>`);
  }
  if (cat === 'card' && issuer) {
    meta.push(`<div class="flex justify-between"><span>카드사:</span><span>${esc(issuer)}</span></div>`);
  }
  if (code) {
    meta.push(`<div class="flex justify-between"><span>할인코드:</span><span class="text-[#0f294d] font-medium">${esc(code)}</span></div>`);
  } else {
    meta.push(`<div class="flex justify-between"><span>할인코드:</span><span class="text-[#0f294d] font-medium">자동 적용</span></div>`);
  }

  const metaHtml = meta.join('\n              ');

  // 상세 정보 토글
  const detailSections = [];
  if (useCond && useCond.trim() && useCond !== '-') {
    detailSections.push(`<p><strong>사용조건:</strong> ${esc(useCond)}</p>`);
  }
  if (exclude && exclude.trim() && exclude !== '-') {
    detailSections.push(`<p><strong>제외조건:</strong> ${esc(exclude)}</p>`);
  }
  if (notice && notice.trim() && notice !== '-') {
    detailSections.push(`<p><strong>유의사항:</strong> ${esc(notice)}</p>`);
  }

  const detailsHtml = detailSections.length > 0
    ? `<details class="mb-3">
        <summary class="text-xs text-[#0f294d] cursor-pointer hover:underline mb-2 flex items-center gap-1">
          📋 유의사항 상세보기
        </summary>
        <div class="text-xs text-gray-600 space-y-2 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          ${detailSections.join('\n          ')}
        </div>
      </details>`
    : '';

  // 버튼: 코드가 있으면 복사하기, 없으면 적용하기
  const buttonHtml = code
    ? `<button onclick="copyCode('${esc(code)}', this)" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-[#0f294d] text-white hover:bg-[#0a1f3a] h-9 px-4 py-2 w-full">복사하기</button>`
    : `<a href="${esc(link)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-[#0f294d] text-white hover:bg-[#0a1f3a] h-9 px-4 py-2 w-full">적용하기</a>`;

  const card = `        <!-- ${esc(name)} -->
        <div class="coupon-card relative rounded-lg border bg-card text-card-foreground shadow-sm p-5 active" role="listitem" data-category="${cat}">
          <div class="flex flex-col min-h-[320px]">
            <div class="flex flex-wrap gap-2 mb-3">
              ${badgeSpans}
            </div>
            <div class="mb-3">
              <span class="text-2xl font-bold text-[#0f294d]">${esc(rateDisplay)}</span>
            </div>
            <h2 class="font-bold mb-2 text-sm">${esc(name)}</h2>
            ${detailsHtml}
            <div class="space-y-1 text-xs text-gray-400 mb-4 mt-auto">
              ${metaHtml}
            </div>
            ${buttonHtml}
          </div>
        </div>
`;
  cards.push(card);
}

const countAll = cards.length;
const countCard = cards.filter(c => c.includes('data-category="card"')).length;
const countSale = cards.filter(c => c.includes('data-category="sale"')).length;
const countNew = cards.filter(c => c.includes('data-category="new"')).length;

fs.writeFileSync(path.join(__dirname, 'cards_fragment.txt'), cards.join(''), 'utf8');
fs.writeFileSync(path.join(__dirname, 'tab_counts.json'), JSON.stringify({ countAll, countCard, countSale, countNew }), 'utf8');
console.log('✅ Cards generated:', countAll, '| Card:', countCard, '| Sale:', countSale, '| New:', countNew);
