/**
 * 클룩 프로모션 CSV → 카드 HTML 생성
 * 실행: node gen-cards.js → cards_fragment.txt 생성
 */

const fs = require('fs');
const path = require('path');

function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function normalizeHeader(h) {
  return h.toLowerCase().replace(/[\s\/]/g, '');
}

function findCol(headerRow, keywords) {
  const normalized = headerRow.map(h => normalizeHeader(h));
  for (const kw of keywords) {
    const idx = normalized.findIndex(h => h.includes(normalizeHeader(kw)));
    if (idx !== -1) return idx;
  }
  return -1;
}

// CSV 읽기 (UTF-8 변환본 우선, 없으면 원본 시도)
let csvPath = path.join(__dirname, 'klook_utf8.csv');
if (!fs.existsSync(csvPath)) {
  csvPath = path.join(__dirname, '클룩_할인정보_수집.csv');
}
const raw = fs.readFileSync(csvPath, 'utf8');
const lines = raw.split(/\r?\n/).filter(l => l.length > 0);

const headerRow = parseCSVLine(lines[0]);
const dataRows = lines.slice(1).map(l => parseCSVLine(l));

const col = {
  name: findCol(headerRow, ['프로모션이름', '프로모션명', '이름', 'name']),
  code: findCol(headerRow, ['할인코드', '쿠폰코드', 'code']),
  rate: findCol(headerRow, ['할인율', 'rate']),
  amount: findCol(headerRow, ['할인금액', 'amount']),
  minAmount: findCol(headerRow, ['최소구매금액', '최소금액', 'min']),
  period: findCol(headerRow, ['유효기간', '기간', 'period']),
  condition: findCol(headerRow, ['적용조건', '사용조건', '조건', 'condition']),
  exclude: findCol(headerRow, ['제외조건', 'exclude']),
  target: findCol(headerRow, ['적용대상', '대상', 'target']),
  url: findCol(headerRow, ['출처url', 'url', '출처'])
};

function get(row, idx) {
  return idx !== -1 && row[idx] ? row[idx].replace(/^없음$/, '') : '';
}

const BRAND_COLOR = '#ff5722';
const BRAND_CLASS = 'klook';

const cards = [];
const counts = { all: 0, card: 0, payment: 0, sale: 0, partnership: 0 };

for (const row of dataRows) {
  const name = get(row, col.name);
  if (!name) continue;

  const code = get(row, col.code);
  const rate = get(row, col.rate);
  const amount = get(row, col.amount);
  const minAmount = get(row, col.minAmount);
  const period = get(row, col.period);
  const condition = get(row, col.condition);
  const exclude = get(row, col.exclude);
  const target = get(row, col.target);
  const url = get(row, col.url);

  // 카테고리 결정
  let category = 'sale';
  const nameLower = name.toLowerCase();
  if (nameLower.includes('kb') || nameLower.includes('국민카드') || nameLower.includes('신한') || nameLower.includes('유니온페이') || nameLower.includes('visa')) {
    category = 'card';
  } else if (nameLower.includes('토스페이') || nameLower.includes('네이버페이') || nameLower.includes('카카오페이')) {
    category = 'payment';
  } else if (nameLower.includes('롯데면세점') || nameLower.includes('민다')) {
    category = 'partnership';
  }

  counts[category] = (counts[category] || 0) + 1;
  counts.all++;

  // 뱃지 생성
  const badges = ['✓ 검증됨'];
  
  if (category === 'card') {
    if (nameLower.includes('kb') || nameLower.includes('국민카드')) badges.push('💳 KB국민카드');
    else if (nameLower.includes('신한')) badges.push('💳 신한카드');
    else if (nameLower.includes('유니온페이')) badges.push('💳 유니온페이');
  } else if (category === 'payment') {
    if (nameLower.includes('토스페이')) badges.push('💰 토스페이');
    else if (nameLower.includes('네이버페이')) badges.push('💚 네이버페이');
  } else if (category === 'partnership') {
    badges.push('🤝 제휴');
  }

  if (code) badges.push('🔑 코드 입력');
  else badges.push('⚡ 자동 적용');

  // 추가 뱃지
  if (nameLower.includes('100%')) badges.push('🎉 100% 할인');
  else if (nameLower.includes('50%') && !badges.some(b => b.includes('50%'))) badges.push('🔥 50% 할인');
  if (nameLower.includes('먼데이')) badges.push('📅 먼데이 특가');
  if (nameLower.includes('일본')) badges.push('🇯🇵 일본');
  else if (nameLower.includes('유럽')) badges.push('🇪🇺 유럽');
  else if (nameLower.includes('마카오')) badges.push('🏯 마카오');

  const badgeSpans = badges.map((b, i) => {
    let cls = 'border-gray-200 bg-white text-gray-700';
    if (i === 0) cls = 'border-transparent bg-green-100 text-green-700';
    else if (b.includes('💳')) {
      if (b.includes('KB')) cls = 'border-transparent bg-yellow-100 text-yellow-700';
      else if (b.includes('신한')) cls = 'border-transparent bg-indigo-100 text-indigo-700';
      else if (b.includes('유니온')) cls = 'border-transparent bg-sky-100 text-sky-700';
    } else if (b.includes('💰') || b.includes('토스')) cls = 'border-transparent bg-blue-100 text-blue-700';
    else if (b.includes('💚') || b.includes('네이버')) cls = 'border-transparent bg-green-100 text-green-700';
    else if (b.includes('🤝')) cls = 'border-transparent bg-cyan-100 text-cyan-700';
    else if (b.includes('🔑')) cls = 'border-transparent bg-amber-100 text-amber-700';
    else if (b.includes('🎉') || b.includes('🔥')) cls = 'border-transparent bg-red-100 text-red-700';
    else if (b.includes('📅')) cls = 'border-transparent bg-purple-100 text-purple-700';
    return `<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}">${esc(b)}</span>`;
  }).join('\n              ');

  // 할인율/금액 표시
  let displayRate = '';
  if (rate && rate !== '미표시') {
    displayRate = rate;
  } else if (amount && amount !== '미표시') {
    displayRate = amount;
  } else {
    displayRate = '특가';
  }

  // 간단 요약
  let shortDesc = '';
  if (target && target !== '미표시') {
    shortDesc = `${target} 대상`;
    if (rate && rate !== '미표시') shortDesc += ` ${rate} 할인`;
    else if (amount && amount !== '미표시') shortDesc += ` ${amount} 할인`;
  } else {
    shortDesc = name;
  }

  // 메타 정보
  const metaRows = [];
  if (period && period !== '미표시') metaRows.push(`<div class="flex justify-between items-start gap-2"><span class="flex-shrink-0 text-gray-500">유효기간:</span><span class="text-right">${esc(period)}</span></div>`);
  if (target && target !== '미표시') metaRows.push(`<div class="flex justify-between items-start gap-2"><span class="flex-shrink-0 text-gray-500">적용대상:</span><span class="text-right">${esc(target)}</span></div>`);
  if (minAmount && minAmount !== '미표시') metaRows.push(`<div class="flex justify-between items-start gap-2"><span class="flex-shrink-0 text-gray-500">최소금액:</span><span class="text-right">${esc(minAmount)}</span></div>`);
  if (code) {
    metaRows.push(`<div class="flex justify-between items-start gap-2"><span class="flex-shrink-0 text-gray-500">할인코드:</span><span class="text-${BRAND_CLASS} font-medium text-right">${esc(code)}</span></div>`);
  } else {
    metaRows.push(`<div class="flex justify-between items-start gap-2"><span class="flex-shrink-0 text-gray-500">할인코드:</span><span class="text-${BRAND_CLASS} font-medium text-right">자동 적용</span></div>`);
  }
  const metaHtml = metaRows.join('\n              ');

  // 상세 정보 토글 (전체 내용 - 절대 축소 금지!)
  const detailSections = [];
  if (condition) {
    detailSections.push(`<p><strong>적용조건:</strong> ${esc(condition)}</p>`);
  }
  if (exclude) {
    detailSections.push(`<p><strong>제외조건:</strong> ${esc(exclude)}</p>`);
  }
  if (target && target !== '미표시') {
    detailSections.push(`<p><strong>적용대상:</strong> ${esc(target)}</p>`);
  }
  if (minAmount && minAmount !== '미표시') {
    detailSections.push(`<p><strong>최소구매금액:</strong> ${esc(minAmount)}</p>`);
  }
  if (amount && amount !== '미표시' && rate) {
    detailSections.push(`<p><strong>할인금액:</strong> ${esc(amount)}</p>`);
  }
  const detailsHtml = detailSections.length > 0
    ? `<details class="mb-3">
              <summary class="text-xs text-${BRAND_CLASS} cursor-pointer hover:underline mb-2 flex items-center gap-1">
                📋 유의사항 상세보기
              </summary>
              <div class="text-xs text-gray-600 space-y-2 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                ${detailSections.join('\n                ')}
              </div>
            </details>`
    : '';

  // 버튼 (할인코드 유무에 따라)
  const linkUrl = url || 'https://www.klook.com/ko/';
  const actionBtn = code
    ? `<button class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-[${BRAND_COLOR}] text-white hover:bg-[#e64a19] h-9 px-4 py-2 w-full" onclick="copyCode('${esc(code)}', this)">복사하기</button>`
    : `<a href="${esc(linkUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-[${BRAND_COLOR}] text-white hover:bg-[#e64a19] h-9 px-4 py-2 w-full text-center">적용하기</a>`;

  const card = `        <!-- ${name} -->
        <div class="coupon-card relative rounded-lg border bg-card text-card-foreground shadow-sm p-5 active" role="listitem" data-category="${category}">
          <div class="flex flex-col h-full min-h-[360px]">
            <div class="flex flex-wrap gap-2 mb-3">
              ${badgeSpans}
            </div>
            <div class="mb-3">
              <span class="text-2xl font-bold text-${BRAND_CLASS}">${esc(displayRate)}</span>
            </div>
            <h2 class="font-bold mb-2 text-sm">${esc(name)}</h2>
            <p class="text-xs text-gray-500 mb-2">${esc(shortDesc)}</p>
            ${detailsHtml}
            <div class="space-y-1 text-xs text-gray-400 mb-4 mt-auto">
              ${metaHtml}
            </div>
            ${actionBtn}
          </div>
        </div>
`;

  cards.push(card);
}

fs.writeFileSync(path.join(__dirname, 'cards_fragment.txt'), cards.join('\n'), 'utf8');
fs.writeFileSync(path.join(__dirname, 'tab_counts.json'), JSON.stringify(counts, null, 2), 'utf8');
console.log('Generated', cards.length, 'cards.', JSON.stringify(counts));
