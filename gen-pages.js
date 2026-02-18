const fs = require('fs');
const path = require('path');

const merchants = [
  { slug: 'usimsa', name: '유심사', color: '#0ea5e9' },
  { slug: 'soomgo', name: '숨고', color: '#2dd4bf' },
  { slug: 'gmarket', name: '지마켓', color: '#e11d48' },
  { slug: 'hmall', name: '현대H몰', color: '#002c5f' },
  { slug: 'himart', name: '하이마트 쇼핑몰', color: '#e31837' },
  { slug: 'yes24', name: '예스24', color: '#e51937' },
  { slug: 'kyobobook', name: '인터넷 교보문고', color: '#333333' },
  { slug: 'auction', name: '옥션', color: '#e31837' },
  { slug: 'wconcept', name: '더블유컨셉코리아', color: '#000000' },
  { slug: 'lotteon', name: '롯데온', color: '#c8102e' },
  { slug: 'lottehomeshopping', name: '롯데 홈쇼핑', color: '#c8102e' },
  { slug: 'emart', name: '이마트 인터넷 쇼핑몰', color: '#e31837' },
  { slug: 'farfetch', name: '파페치', color: '#6366f1' },
];

const basePath = __dirname;
const base = fs.readFileSync(path.join(basePath, 'coupang', 'index.html'), 'utf8');

function escapeHex(c) {
  return c.replace('#', '%23');
}

merchants.forEach(m => {
  const dir = path.join(basePath, m.slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let html = base;

  // 1) Replace merchant-specific strings (order matters: specific first)
  html = html.replace(/https:\/\/solar-revival\.co\.kr\/coupang\//g, 'https://solar-revival.co.kr/' + m.slug + '/');
  html = html.replace(/solar-revival\.co\.kr\/coupang/g, 'solar-revival.co.kr/' + m.slug);
  html = html.replace(/\/coupang\//g, '/' + m.slug + '/');
  html = html.replace(/og-coupang\.webp/g, 'og-' + m.slug + '.webp');
  html = html.replace(/images\/logos\/coupang\.png/g, 'images/logos/solar.svg');
  html = html.replace(/coupang\.com/g, m.slug + '.com');
  html = html.replace(/\bcoupang\b/g, m.slug);
  html = html.replace(/쿠팡/g, m.name);
  html = html.replace(/Coupang/g, m.name);
  html = html.replace(/#ff5722/g, m.color);
  html = html.replace(/coupang:/g, m.slug + ':');
  html = html.replace(/border-coupang|bg-coupang\/|text-coupang|from-coupang|to-orange-50|border-coupang/g, (match) => {
    if (match === 'to-orange-50') return 'to-gray-100';
    return match.replace(/coupang/g, m.slug);
  });

  // 2) Single filter tab: "전체 (3)"
  const tabSection = '<div class="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="쿠폰 필터">\n      <button type="button" class="' + m.slug + '-filter-tab inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border tab-active" role="tab" aria-selected="true" data-filter="all">전체 (3)</button>\n    </div>';
  html = html.replace(/<div class="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="쿠폰 필터">[\s\S]*?data-filter="brand">브랜드·기타 \(4\)<\/button>\s*<\/div>/, tabSection);

  // 3) Replace 9 coupon cards with 3 dummy cards
  const cardStart = html.indexOf('<div class="coupon-card relative rounded-lg border bg-card text-card-foreground shadow-sm p-5" role="listitem" data-filter="wow">');
  const gridEndMarker = '      </div>\n      \n      <aside';
  const gridEnd = html.indexOf(gridEndMarker);
  const afterGrid = '      </div>\n      \n      ';

  const dummyCards = [
    { discount: '10%', title: '더미 프로모션 1', detail: '자동 적용' },
    { discount: '5,000원', title: '더미 프로모션 2', detail: '30,000원 이상' },
    { discount: '최대 20%', title: '더미 프로모션 3', detail: '자동 적용' },
  ].map(d => `
        <div class="coupon-card relative rounded-lg border bg-card text-card-foreground shadow-sm p-5" role="listitem" data-filter="all">
          <div class="flex flex-col min-h-[320px]">
            <div class="flex flex-wrap gap-2 mb-3">
              <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700">✓ 검증됨</span>
            </div>
            <div class="mb-3"><span class="text-2xl font-bold" style="color:${m.color}">${d.discount}</span></div>
            <h2 class="font-bold mb-2 text-sm">${d.title}</h2>
            <details class="mb-3">
              <summary class="text-xs cursor-pointer hover:underline mb-2 flex items-center gap-1" style="color:${m.color}">📋 유의사항 상세보기</summary>
              <div class="text-xs text-gray-600 space-y-2 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p>더미 유의사항 내용입니다.</p>
              </div>
            </details>
            <div class="space-y-1 text-xs text-gray-400 mb-4 mt-auto">
              <div class="flex justify-between"><span>유효기간:</span><span>~2026.12.31</span></div>
              <div class="flex justify-between"><span>할인코드:</span><span class="font-medium" style="color:${m.color}">${d.detail}</span></div>
            </div>
            <a href="#" target="_blank" rel="noopener" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-9 px-4 py-2 w-full text-white hover:opacity-90" style="background-color:${m.color}">적용하기</a>
          </div>
        </div>`).join('\n');

  if (cardStart !== -1 && gridEnd !== -1) {
    html = html.slice(0, cardStart) + dummyCards + '\n      ' + afterGrid + html.slice(gridEnd + afterGrid.length);
  }

  // 4) Filter script: use slug class
  html = html.replace("document.querySelectorAll('.coupang-filter-tab')", "document.querySelectorAll('." + m.slug + "-filter-tab')");

  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log('OK', m.slug);
});

console.log('Done. New merchant pages:', merchants.length);
