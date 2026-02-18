/**
 * 라쿠텐트래블 쿠폰 카드 HTML 생성 (CSV → cards_fragment.txt)
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

// 카테고리 분류: 카드사 할인, 일반 할인
function category(issuer) {
  if (issuer && issuer.trim() && issuer !== '일반' && issuer !== '라쿠텐') return 'card';
  return 'sale';
}

// 카드사별 색상
const CARD_COLORS = {
  'KB국민': 'yellow', '마스터': 'orange'
};

function cardBadgeClass(issuer) {
  if (!issuer) return 'border-gray-200 bg-white text-gray-700';
  const key = Object.keys(CARD_COLORS).find(k => issuer.includes(k));
  const c = key ? CARD_COLORS[key] : 'gray';
  return `border-transparent bg-${c}-100 text-${c}-700`;
}

function getBadges(name, issuer, code) {
  const badges = [];
  badges.push({ label: '✓ 검증됨', class: 'border-transparent bg-green-100 text-green-700' });

  const n = (name || '').toLowerCase();

  if (issuer && issuer.trim() && issuer !== '일반' && issuer !== '라쿠텐') {
    badges.push({ label: '💳 ' + issuer.trim(), class: cardBadgeClass(issuer) });
  } else {
    if (n.includes('seasonal') || n.includes('시즌')) {
      badges.push({ label: '🌸 시즌 특가', class: 'border-transparent bg-pink-100 text-pink-700' });
    }
    if (n.includes('앱')) {
      badges.push({ label: '📱 앱 전용', class: 'border-transparent bg-blue-100 text-blue-700' });
    }
    if (n.includes('규슈')) {
      badges.push({ label: '🏝️ 규슈 지역', class: 'border-transparent bg-teal-100 text-teal-700' });
    }
    if (n.includes('더블')) {
      badges.push({ label: '✨ 더블 할인', class: 'border-transparent bg-purple-100 text-purple-700' });
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
const csvPath = path.join(__dirname, 'rakuten_travel_discounts_complete.csv');
const raw = fs.readFileSync(csvPath, 'utf8');
const lines = raw.split(/\r?\n/).filter(l => l.length > 0);
const headerRow = parseCSVLine(lines[0]);
const dataRows = lines.slice(1).map(l => parseCSVLine(l));

// 컬럼 인덱스 (rakuten_travel_discounts_complete.csv)
const col = {
  name: 0,        // 프로모션명
  code: 1,        // 할인코드
  rate: 2,        // 할인율
  amount: 3,      // 할인금액
  target: 4,      // 적용대상
  bookStart: 5,   // 예약기간(사용가능기간)
  travelPeriod: 6, // 투숙기간(탑승기간)
  minAmount: 7,   // 최소구매금액
  notice: 8       // 사용조건및유의사항
};

const cards = [];

for (const row of dataRows) {
  const name = get(row, col.name);
  if (!name) continue;

  const code = get(row, col.code);
  const rate = get(row, col.rate);
  const amount = get(row, col.amount);
  const target = get(row, col.target);
  const bookStart = get(row, col.bookStart);
  const travelPeriod = get(row, col.travelPeriod);
  const minAmount = get(row, col.minAmount);
  const notice = get(row, col.notice);

  // 카드사 추출 (프로모션명에서)
  let issuer = '';
  if (name.includes('KB국민')) issuer = 'KB국민 마스터카드';
  else if (name.includes('마스터카드')) issuer = '마스터카드';

  const cat = category(issuer);
  const link = 'https://travel.rakuten.co.kr/';
  
  // 할인율 표시: rate + amount 조합
  let rateDisplay = '';
  if (rate) rateDisplay = rate;
  if (amount) rateDisplay = rateDisplay ? `${rateDisplay} (${amount})` : amount;
  if (!rateDisplay) rateDisplay = '—';

  // 예약기간 포맷팅
  const bookPeriod = bookStart.replace(/~/g, ' ~ ').replace(/-/g, '.');

  // 적용대상
  const targetDisplay = target || '프로모션 대상 숙소';

  const badges = getBadges(name, issuer, code);
  const badgeSpans = badges.map(b => 
    `<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${b.class}">${esc(b.label)}</span>`
  ).join('\n              ');

  const meta = [];
  if (bookPeriod && bookPeriod !== '~') {
    meta.push(`<div class="flex justify-between"><span>예약기간:</span><span>${esc(bookPeriod)}</span></div>`);
  }
  if (travelPeriod && travelPeriod !== '~') {
    meta.push(`<div class="flex justify-between"><span>투숙기간:</span><span>${esc(travelPeriod)}</span></div>`);
  }
  meta.push(`<div class="flex justify-between"><span>적용대상:</span><span>${esc(targetDisplay)}</span></div>`);
  if (minAmount) {
    meta.push(`<div class="flex justify-between"><span>최소결제:</span><span>${esc(minAmount)}</span></div>`);
  }
  if (cat === 'card' && issuer) {
    meta.push(`<div class="flex justify-between"><span>카드사:</span><span>${esc(issuer)}</span></div>`);
  }
  if (code) {
    meta.push(`<div class="flex justify-between"><span>할인코드:</span><span class="text-[#bf0000] font-medium">${esc(code)}</span></div>`);
  } else {
    meta.push(`<div class="flex justify-between"><span>할인코드:</span><span class="text-[#bf0000] font-medium">쿠폰 다운로드</span></div>`);
  }

  const metaHtml = meta.join('\n              ');

  // 상세 정보 토글
  const detailSections = [];
  if (notice && notice.trim() && notice !== '-') {
    detailSections.push(`<p><strong>사용조건 및 유의사항:</strong> ${esc(notice)}</p>`);
  }

  const detailsHtml = detailSections.length > 0
    ? `<details class="mb-3">
        <summary class="text-xs text-[#bf0000] cursor-pointer hover:underline mb-2 flex items-center gap-1">
          📋 유의사항 상세보기
        </summary>
        <div class="text-xs text-gray-600 space-y-2 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          ${detailSections.join('\n          ')}
        </div>
      </details>`
    : '';

  // 버튼: 코드가 있으면 복사하기, 없으면 적용하기
  const buttonHtml = code
    ? `<button onclick="copyCode('${esc(code)}', this)" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-[#bf0000] text-white hover:bg-[#a00000] h-9 px-4 py-2 w-full">복사하기</button>`
    : `<a href="${esc(link)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-[#bf0000] text-white hover:bg-[#a00000] h-9 px-4 py-2 w-full">적용하기</a>`;

  const card = `        <!-- ${esc(name)} -->
        <div class="coupon-card relative rounded-lg border bg-card text-card-foreground shadow-sm p-5 active" role="listitem" data-category="${cat}">
          <div class="flex flex-col min-h-[320px]">
            <div class="flex flex-wrap gap-2 mb-3">
              ${badgeSpans}
            </div>
            <div class="mb-3">
              <span class="text-2xl font-bold text-[#bf0000]">${esc(rateDisplay)}</span>
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

fs.writeFileSync(path.join(__dirname, 'cards_fragment.txt'), cards.join(''), 'utf8');
fs.writeFileSync(path.join(__dirname, 'tab_counts.json'), JSON.stringify({ countAll, countCard, countSale }), 'utf8');
console.log('✅ Cards generated:', countAll, '| Card:', countCard, '| Sale:', countSale);
