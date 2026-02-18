const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
const fragmentPath = path.join(__dirname, 'cards_fragment.txt');
const countsPath = path.join(__dirname, 'tab_counts.json');

let html = fs.readFileSync(indexPath, 'utf8');
const cards = fs.readFileSync(fragmentPath, 'utf8');
const { countAll, countCard, countSale, countBh } = JSON.parse(fs.readFileSync(countsPath, 'utf8'));

const gridStart = '        <!-- 메가 세일 -->';
const sidebarMarker = '      <!-- Sidebar -->';
const re = new RegExp(
  gridStart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?(?=' + sidebarMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')'
);

const newGridContent = cards.trimEnd() + '\n\n      </div>\n\n      <!-- Sidebar -->';
html = html.replace(re, newGridContent);

// auto-rows-min 제거 (토글 시 같은 행 카드들이 함께 늘어나도록)
html = html.replace(/grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min/g, 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4');
html = html.replace(/grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start/g, 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4');

html = html.replace(/총 <span class="font-bold text-agoda">\d+개<\/span> 프로모션/, `총 <span class="font-bold text-agoda">${countAll}개</span> 프로모션`);
html = html.replace(/전체 \(\d+\)/, `전체 (${countAll})`);
html = html.replace(/id="tab-card">카드 \(\d+\)/, `id="tab-card">카드 (${countCard})`);
html = html.replace(/id="tab-sale">특가\/세일 \(\d+\)/, `id="tab-sale">특가/세일 (${countSale + countBh})`);

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Injected', countAll, 'cards. Tabs: all', countAll, 'card', countCard, 'sale', countSale, 'benefitshub', countBh);
