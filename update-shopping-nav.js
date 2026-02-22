const fs = require('fs');
const path = require('path');

const basePath = __dirname;

const headerDropdownNew = `        <div class="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-lg border py-2 w-56 max-h-[70vh] overflow-y-auto opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          <a href="/coupang" class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"><img src="/images/logos/coupang.png" class="w-5 h-5 object-contain rounded" alt="">쿠팡</a>
          <a href="/ali" class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"><img src="/images/logos/aliexpress.png" class="w-5 h-5 object-contain rounded" alt="">알리익스프레스</a>
          <a href="/temu" class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"><img src="/images/logos/temu.png" class="w-5 h-5 object-contain rounded" alt="">테무</a>
          <a href="/speak" class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"><img src="/images/logos/speak.png" class="w-5 h-5 object-contain rounded" alt="">스픽</a>
          <a href="/usimsa" class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"><img src="/images/logos/usimsa.png" class="w-5 h-5 object-contain rounded" alt="">유심사</a>
          <a href="/soomgo" class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"><img src="/images/logos/solar.svg" class="w-5 h-5 object-contain rounded" alt="">숨고</a>
          <a href="/gmarket" class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"><img src="/images/logos/solar.svg" class="w-5 h-5 object-contain rounded" alt="">지마켓</a>
          <a href="/hmall" class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"><img src="/images/logos/solar.svg" class="w-5 h-5 object-contain rounded" alt="">현대H몰</a>
          <a href="/himart" class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"><img src="/images/logos/solar.svg" class="w-5 h-5 object-contain rounded" alt="">하이마트 쇼핑몰</a>
          <a href="/yes24" class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"><img src="/images/logos/solar.svg" class="w-5 h-5 object-contain rounded" alt="">예스24</a>
          <a href="/kyobobook" class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"><img src="/images/logos/solar.svg" class="w-5 h-5 object-contain rounded" alt="">인터넷 교보문고</a>
          <a href="/auction" class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"><img src="/images/logos/solar.svg" class="w-5 h-5 object-contain rounded" alt="">옥션</a>
          <a href="/wconcept" class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"><img src="/images/logos/solar.svg" class="w-5 h-5 object-contain rounded" alt="">더블유컨셉코리아</a>
          <a href="/lotteon" class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"><img src="/images/logos/solar.svg" class="w-5 h-5 object-contain rounded" alt="">롯데온</a>
          <a href="/lottehomeshopping" class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"><img src="/images/logos/solar.svg" class="w-5 h-5 object-contain rounded" alt="">롯데 홈쇼핑</a>
          <a href="/emart" class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"><img src="/images/logos/solar.svg" class="w-5 h-5 object-contain rounded" alt="">이마트 인터넷 쇼핑몰</a>
          <a href="/farfetch" class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"><img src="/images/logos/farfetch.png" class="w-5 h-5 object-contain rounded" alt="">파페치</a>
        </div>`;

const mobileShoppingNew = `        <div id="shopping-mobile" class="hidden pl-2 pb-2 max-h-64 overflow-y-auto">
          <a href="/coupang" class="flex items-center gap-3 text-gray-700 hover:text-primary py-2.5 px-2 rounded-lg hover:bg-gray-50"><img src="/images/logos/coupang.png" class="w-6 h-6 object-contain rounded" alt="">쿠팡</a>
          <a href="/ali" class="flex items-center gap-3 text-gray-700 hover:text-primary py-2.5 px-2 rounded-lg hover:bg-gray-50"><img src="/images/logos/aliexpress.png" class="w-6 h-6 object-contain rounded" alt="">알리익스프레스</a>
          <a href="/temu" class="flex items-center gap-3 text-gray-700 hover:text-primary py-2.5 px-2 rounded-lg hover:bg-gray-50"><img src="/images/logos/temu.png" class="w-6 h-6 object-contain rounded" alt="">테무</a>
          <a href="/speak" class="flex items-center gap-3 text-gray-700 hover:text-primary py-2.5 px-2 rounded-lg hover:bg-gray-50"><img src="/images/logos/speak.png" class="w-6 h-6 object-contain rounded" alt="">스픽</a>
          <a href="/usimsa" class="flex items-center gap-3 text-gray-700 hover:text-primary py-2.5 px-2 rounded-lg hover:bg-gray-50"><img src="/images/logos/usimsa.png" class="w-6 h-6 object-contain rounded" alt="">유심사</a>
          <a href="/soomgo" class="flex items-center gap-3 text-gray-700 hover:text-primary py-2.5 px-2 rounded-lg hover:bg-gray-50"><img src="/images/logos/solar.svg" class="w-6 h-6 object-contain rounded" alt="">숨고</a>
          <a href="/gmarket" class="flex items-center gap-3 text-gray-700 hover:text-primary py-2.5 px-2 rounded-lg hover:bg-gray-50"><img src="/images/logos/solar.svg" class="w-6 h-6 object-contain rounded" alt="">지마켓</a>
          <a href="/hmall" class="flex items-center gap-3 text-gray-700 hover:text-primary py-2.5 px-2 rounded-lg hover:bg-gray-50"><img src="/images/logos/solar.svg" class="w-6 h-6 object-contain rounded" alt="">현대H몰</a>
          <a href="/himart" class="flex items-center gap-3 text-gray-700 hover:text-primary py-2.5 px-2 rounded-lg hover:bg-gray-50"><img src="/images/logos/solar.svg" class="w-6 h-6 object-contain rounded" alt="">하이마트 쇼핑몰</a>
          <a href="/yes24" class="flex items-center gap-3 text-gray-700 hover:text-primary py-2.5 px-2 rounded-lg hover:bg-gray-50"><img src="/images/logos/solar.svg" class="w-6 h-6 object-contain rounded" alt="">예스24</a>
          <a href="/kyobobook" class="flex items-center gap-3 text-gray-700 hover:text-primary py-2.5 px-2 rounded-lg hover:bg-gray-50"><img src="/images/logos/solar.svg" class="w-6 h-6 object-contain rounded" alt="">인터넷 교보문고</a>
          <a href="/auction" class="flex items-center gap-3 text-gray-700 hover:text-primary py-2.5 px-2 rounded-lg hover:bg-gray-50"><img src="/images/logos/solar.svg" class="w-6 h-6 object-contain rounded" alt="">옥션</a>
          <a href="/wconcept" class="flex items-center gap-3 text-gray-700 hover:text-primary py-2.5 px-2 rounded-lg hover:bg-gray-50"><img src="/images/logos/solar.svg" class="w-6 h-6 object-contain rounded" alt="">더블유컨셉코리아</a>
          <a href="/lotteon" class="flex items-center gap-3 text-gray-700 hover:text-primary py-2.5 px-2 rounded-lg hover:bg-gray-50"><img src="/images/logos/solar.svg" class="w-6 h-6 object-contain rounded" alt="">롯데온</a>
          <a href="/lottehomeshopping" class="flex items-center gap-3 text-gray-700 hover:text-primary py-2.5 px-2 rounded-lg hover:bg-gray-50"><img src="/images/logos/solar.svg" class="w-6 h-6 object-contain rounded" alt="">롯데 홈쇼핑</a>
          <a href="/emart" class="flex items-center gap-3 text-gray-700 hover:text-primary py-2.5 px-2 rounded-lg hover:bg-gray-50"><img src="/images/logos/solar.svg" class="w-6 h-6 object-contain rounded" alt="">이마트 인터넷 쇼핑몰</a>
          <a href="/farfetch" class="flex items-center gap-3 text-gray-700 hover:text-primary py-2.5 px-2 rounded-lg hover:bg-gray-50"><img src="/images/logos/farfetch.png" class="w-6 h-6 object-contain rounded" alt="">파페치</a>
        </div>`;

const footerShoppingNew = `        <h4 class="font-bold text-lg mb-4">쇼핑</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="/coupang" class="text-gray-400 hover:text-primary transition-colors">쿠팡</a></li>
          <li><a href="/ali" class="text-gray-400 hover:text-primary transition-colors">알리익스프레스</a></li>
          <li><a href="/temu" class="text-gray-400 hover:text-primary transition-colors">테무</a></li>
          <li><a href="/speak" class="text-gray-400 hover:text-primary transition-colors">스픽</a></li>
          <li><a href="/usimsa" class="text-gray-400 hover:text-primary transition-colors">유심사</a></li>
          <li><a href="/soomgo" class="text-gray-400 hover:text-primary transition-colors">숨고</a></li>
          <li><a href="/gmarket" class="text-gray-400 hover:text-primary transition-colors">지마켓</a></li>
          <li><a href="/hmall" class="text-gray-400 hover:text-primary transition-colors">현대H몰</a></li>
          <li><a href="/himart" class="text-gray-400 hover:text-primary transition-colors">하이마트 쇼핑몰</a></li>
          <li><a href="/yes24" class="text-gray-400 hover:text-primary transition-colors">예스24</a></li>
          <li><a href="/kyobobook" class="text-gray-400 hover:text-primary transition-colors">인터넷 교보문고</a></li>
          <li><a href="/auction" class="text-gray-400 hover:text-primary transition-colors">옥션</a></li>
          <li><a href="/wconcept" class="text-gray-400 hover:text-primary transition-colors">더블유컨셉코리아</a></li>
          <li><a href="/lotteon" class="text-gray-400 hover:text-primary transition-colors">롯데온</a></li>
          <li><a href="/lottehomeshopping" class="text-gray-400 hover:text-primary transition-colors">롯데 홈쇼핑</a></li>
          <li><a href="/emart" class="text-gray-400 hover:text-primary transition-colors">이마트 인터넷 쇼핑몰</a></li>
          <li><a href="/farfetch" class="text-gray-400 hover:text-primary transition-colors">파페치</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-bold text-lg mb-4">유용한 사이트</h4>`;

const headerDropdownRe = /<div class="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-lg border py-2 w-56 (?:max-h-\[70vh\] overflow-y-auto )?opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">\s*\n\s*<a href="[^"]*"[^>]*>[\s\S]*?<\/a>\s*\n\s*<a href="\/ali\/"[\s\S]*?<a href="\/speak\/"[\s\S]*?<\/a>\s*\n\s*<\/div>/;
const mobileShoppingRe = /<div id="shopping-mobile" class="hidden pl-2 pb-2(?: max-h-64 overflow-y-auto)?">\s*\n\s*<a href="[^"]*"[^>]*>[\s\S]*?<\/a>\s*\n\s*<a href="\/ali\/"[\s\S]*?<a href="\/speak\/"[\s\S]*?<\/a>\s*\n\s*<\/div>/;
const footerShoppingRe = /<h4 class="font-bold text-lg mb-4">쇼핑<\/h4>\s*\n\s*<ul class="space-y-2 text-sm">\s*\n\s*<li><a href="[^"]*"[^>]*>[^<]+<\/a><\/li>\s*\n\s*<li><a href="\/ali\/"[\s\S]*?<li><a href="\/speak\/"[\s\S]*?<\/ul>\s*\n\s*<\/div>\s*\n\s*<div>\s*\n\s*<h4 class="font-bold text-lg mb-4">유용한 사이트<\/h4>/;

const dirs = ['tripcom', 'agoda', 'bookingcom', 'ali', 'temu', 'speak', 'usimsa', 'soomgo', 'hmall', 'himart', 'yes24', 'kyobobook', 'auction', 'wconcept', 'lotteon', 'lottehomeshopping', 'emart', 'farfetch'];

dirs.forEach(dir => {
  const filePath = path.join(basePath, dir, 'index.html');
  if (!fs.existsSync(filePath)) { console.log('skip', dir); return; }
  let html = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  if (headerDropdownRe.test(html)) {
    html = html.replace(headerDropdownRe, headerDropdownNew);
    changed = true;
  }
  if (mobileShoppingRe.test(html)) {
    html = html.replace(mobileShoppingRe, mobileShoppingNew);
    changed = true;
  }
  if (footerShoppingRe.test(html)) {
    html = html.replace(footerShoppingRe, footerShoppingNew);
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(filePath, html);
    console.log('OK', dir);
  } else {
    console.log('no match', dir);
  }
});

console.log('Done.');
