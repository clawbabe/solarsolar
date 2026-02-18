const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
const fragmentPath = path.join(__dirname, 'cards_fragment.txt');
const countsPath = path.join(__dirname, 'tab_counts.json');

let html = fs.readFileSync(indexPath, 'utf8');
const cards = fs.readFileSync(fragmentPath, 'utf8');
const { countAll, countCard, countSale, countNew } = JSON.parse(fs.readFileSync(countsPath, 'utf8'));

// 기존 카드 영역 찾기: <!-- Coupons --> 부터 <!-- Sidebar --> 전까지
const startMarker = '      <!-- Coupons -->';
const endMarker = '      <!-- Sidebar -->';

// space-y-4를 grid로 변경
const oldPattern = new RegExp(
  startMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + 
  '[\\s\\S]*?' +
  '(?=' + endMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')'
);

const newContent = `      <!-- Coupons -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="쿠폰 목록">
${cards.trimEnd()}
      </div>

      `;

html = html.replace(oldPattern, newContent);

// auto-rows-min, items-start 제거
html = html.replace(/grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min items-start/g, 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4');
html = html.replace(/grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min/g, 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4');
html = html.replace(/grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start/g, 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4');

fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ Injected', countAll, 'cards.');
console.log('   Card:', countCard, '| Sale:', countSale, '| New:', countNew);
console.log('   Converted to 3-column grid layout');
