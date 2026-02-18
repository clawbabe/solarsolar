const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
const fragmentPath = path.join(__dirname, 'cards_fragment.txt');
const countsPath = path.join(__dirname, 'tab_counts.json');

let html = fs.readFileSync(indexPath, 'utf8');
const cards = fs.readFileSync(fragmentPath, 'utf8');
const { countAll, countCard, countSale } = JSON.parse(fs.readFileSync(countsPath, 'utf8'));

// 기존 카드 영역 찾기: grid 또는 space-y-4부터 aside 직전까지
let startMarker = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="쿠폰 목록">';
let endMarker = '      <aside class="space-y-5">';

let startIdx = html.indexOf(startMarker);
if (startIdx === -1) {
  // grid가 없으면 space-y-4로 찾기
  startMarker = '<div class="space-y-4" role="list" aria-label="쿠폰 목록">';
  startIdx = html.indexOf(startMarker);
}

const endIdx = html.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
  const before = html.substring(0, startIdx);
  const after = html.substring(endIdx);
  
  const newContent = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="쿠폰 목록">
${cards.trimEnd()}
      </div>

      `;
  
  html = before + newContent + after;
} else {
  console.log('⚠️ Warning: Could not find markers. startIdx:', startIdx, 'endIdx:', endIdx);
}

// auto-rows-min, items-start 제거
html = html.replace(/grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min items-start/g, 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4');
html = html.replace(/grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min/g, 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4');
html = html.replace(/grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start/g, 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4');

// 쿠폰 개수 업데이트
html = html.replace(/총 <span class="font-bold text-rakuten">\d+개<\/span> 프로모션/, `총 <span class="font-bold text-rakuten">${countAll}개</span> 프로모션`);
html = html.replace(/전체 \(\d+\)/, `전체 (${countAll})`);
html = html.replace(/id="tab-card">카드 \(\d+\)/, `id="tab-card">카드 (${countCard})`);
html = html.replace(/id="tab-sale">특가\/세일 \(\d+\)/, `id="tab-sale">특가/세일 (${countSale})`);
html = html.replace(/id="tab-all">전체 \(\d+\)/, `id="tab-all">전체 (${countAll})`);

fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ Injected', countAll, 'cards.');
console.log('   Card:', countCard, '| Sale:', countSale);
console.log('   Converted to 3-column grid layout');
