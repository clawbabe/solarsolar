/**
 * cards_fragment.txt → klook/index.html 주입
 * 실행: node inject-cards.js
 */

const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
const cardsPath = path.join(__dirname, 'cards_fragment.txt');
const countsPath = path.join(__dirname, 'tab_counts.json');

let html = fs.readFileSync(htmlPath, 'utf8');
const cards = fs.readFileSync(cardsPath, 'utf8');
const counts = JSON.parse(fs.readFileSync(countsPath, 'utf8'));

const BRAND_COLOR = '#ff5722';
const BRAND_CLASS = 'klook';
const TODAY = '2026년 3월 1일';

// 메인 컨텐츠 섹션 교체 (<!-- Main Content with Sidebar --> ~ <!-- 구분선 -->)
const mainStart = html.indexOf('<!-- Main Content with Sidebar -->');
const dividerStart = html.indexOf('<!-- 구분선 -->');

if (mainStart === -1 || dividerStart === -1) {
  console.error('Cannot find main content markers.');
  console.error('mainStart:', mainStart, 'dividerStart:', dividerStart);
  process.exit(1);
}

// 새로운 메인 컨텐츠 섹션 생성
const filterTabs = `    <!-- Filter Tabs -->
    <div class="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="쿠폰 필터">
      <button id="tab-all" class="tab-active px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors border" onclick="filterCoupons('all')">전체 <span class="ml-1 text-xs">${counts.all}</span></button>
      <button id="tab-card" class="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors border border-gray-200 text-gray-600 hover:bg-gray-50" onclick="filterCoupons('card')">카드사 <span class="ml-1 text-xs text-gray-500">${counts.card}</span></button>
      <button id="tab-payment" class="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors border border-gray-200 text-gray-600 hover:bg-gray-50" onclick="filterCoupons('payment')">결제수단 <span class="ml-1 text-xs text-gray-500">${counts.payment}</span></button>
      <button id="tab-sale" class="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors border border-gray-200 text-gray-600 hover:bg-gray-50" onclick="filterCoupons('sale')">세일/이벤트 <span class="ml-1 text-xs text-gray-500">${counts.sale}</span></button>
      <button id="tab-partnership" class="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors border border-gray-200 text-gray-600 hover:bg-gray-50" onclick="filterCoupons('partnership')">제휴 <span class="ml-1 text-xs text-gray-500">${counts.partnership}</span></button>
    </div>`;

const newMainContent = `<!-- Main Content with Sidebar -->
<section class="py-8">
  <div class="max-w-6xl mx-auto px-4">
${filterTabs}

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
      <!-- Coupons Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-start" role="list" aria-label="쿠폰 목록">
${cards}
      </div>

      <!-- Sidebar -->
      <aside class="space-y-5">
        <!-- Klook Rewards -->
        <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-5">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-10 h-10 rounded-full bg-${BRAND_CLASS}/10 flex items-center justify-center">
              <i data-lucide="gift" class="w-5 h-5 text-${BRAND_CLASS}"></i>
            </div>
            <h3 class="font-bold">Klook Rewards</h3>
          </div>
          <div class="space-y-3">
            <div class="p-3 bg-${BRAND_CLASS}/5 rounded-lg border border-${BRAND_CLASS}/10">
              <div class="flex justify-between mb-1">
                <span class="text-sm">예약 시</span>
                <span class="font-bold text-${BRAND_CLASS}">최대 5%</span>
              </div>
              <p class="text-xs text-gray-500">Klook Credits 적립</p>
            </div>
            <div class="p-3 bg-${BRAND_CLASS}/5 rounded-lg border border-${BRAND_CLASS}/10">
              <div class="flex justify-between mb-1">
                <span class="text-sm">후기 작성</span>
                <span class="font-bold text-${BRAND_CLASS}">추가 적립</span>
              </div>
              <p class="text-xs text-gray-500">최대 200 Credits</p>
            </div>
          </div>
        </div>

        <!-- Share -->
        <div class="bg-gradient-to-br from-${BRAND_CLASS}/5 to-orange-50 rounded-lg p-5 border border-${BRAND_CLASS}/20">
          <div class="w-12 h-12 rounded-full bg-${BRAND_CLASS}/10 flex items-center justify-center mb-4">
            <i data-lucide="share-2" class="w-6 h-6 text-${BRAND_CLASS}"></i>
          </div>
          <h3 class="font-bold mb-2">친구에게 공유하기</h3>
          <p class="text-sm text-gray-600 mb-4">클룩 할인코드를 친구와 공유하세요</p>
          <button class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full" onclick="sharePage()">
            <i data-lucide="share" class="w-4 h-4 mr-2"></i>
            URL 복사하기
          </button>
        </div>

        <!-- Quick Links -->
        <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-5">
          <h3 class="font-bold mb-4 flex items-center gap-2">
            <i data-lucide="link" class="w-5 h-5 text-${BRAND_CLASS}"></i>
            인기 할인코드
          </h3>
          <div class="space-y-2">
            <a href="/agoda" class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-sm text-gray-600">
              <i data-lucide="ticket" class="w-4 h-4"></i>
              아고다 할인코드
            </a>
            <a href="/tripcom" class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-sm text-gray-600">
              <i data-lucide="ticket" class="w-4 h-4"></i>
              트립닷컴 할인코드
            </a>
            <a href="/myrealtrip" class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-sm text-gray-600">
              <i data-lucide="ticket" class="w-4 h-4"></i>
              마이리얼트립 할인코드
            </a>
            <a href="/kkday" class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-sm text-gray-600">
              <i data-lucide="ticket" class="w-4 h-4"></i>
              KKday 할인코드
            </a>
          </div>
        </div>
      </aside>
    </div>
  </div>
</section>

`;

html = html.slice(0, mainStart) + newMainContent + html.slice(dividerStart);

// Hero 섹션 업데이트 - 날짜 및 쿠폰 갯수
html = html.replace(
  /최근 업데이트: <span class="font-bold text-klook">[^<]*<\/span>/,
  `최근 업데이트: <span class="font-bold text-klook">${TODAY}</span> · 총 <span class="font-bold text-klook">${counts.all}개</span> 프로모션`
);

// CSS 추가 - 필터 탭 및 카드 스타일
const cssToAdd = `    .tab-active {
      border-color: ${BRAND_COLOR} !important;
      background-color: ${BRAND_COLOR} !important;
      color: white !important;
    }
    .coupon-card {
      display: none;
    }
    .coupon-card.active {
      display: block;
    }`;

html = html.replace(
  /(\* \{ font-family: 'Pretendard', sans-serif; \})/,
  `$1\n${cssToAdd}`
);

// JavaScript 교체 - 기존 showCode/toggleDetails를 새로운 filterCoupons/copyCode로
const scriptStart = html.indexOf('<script>\n  lucide.createIcons();');
const scriptEnd = html.indexOf('</script>', scriptStart);

if (scriptStart !== -1 && scriptEnd !== -1) {
  const newScript = `<script>
  lucide.createIcons();

  function filterCoupons(category) {
    document.querySelectorAll('.coupon-card').forEach(function(card) {
      var cat = card.dataset.category;
      var show = category === 'all' || cat === category;
      card.classList.toggle('active', show);
    });

    document.querySelectorAll('[role="tablist"] button').forEach(function(btn) {
      btn.classList.remove('tab-active');
      btn.classList.add('border-gray-200', 'text-gray-600', 'hover:bg-gray-50');
    });

    var activeBtn = document.getElementById('tab-' + category);
    if (activeBtn) {
      activeBtn.classList.add('tab-active');
      activeBtn.classList.remove('border-gray-200', 'text-gray-600', 'hover:bg-gray-50');
    }
  }

  function copyCode(code, btn) {
    navigator.clipboard.writeText(code).then(function() {
      showToast('코드가 복사되었습니다: ' + code);
      if (btn) {
        var original = btn.textContent;
        btn.textContent = '✓ 복사됨';
        setTimeout(function() { btn.textContent = original; }, 2000);
      }
    });
  }

  function showToast(message) {
    var toast = document.getElementById('toast');
    var toastMessage = document.getElementById('toast-message');
    if (toast && toastMessage) {
      toastMessage.textContent = message;
      toast.classList.remove('translate-y-20', 'opacity-0');
      setTimeout(function() {
        toast.classList.add('translate-y-20', 'opacity-0');
      }, 3000);
    }
  }

  function sharePage() {
    var url = window.location.href;
    navigator.clipboard.writeText(url).then(function() {
      showToast('URL이 복사되었습니다');
    }).catch(function() {
      showToast('URL 복사에 실패했습니다');
    });
  }
</script>`;

  html = html.slice(0, scriptStart) + newScript + html.slice(scriptEnd + '</script>'.length);
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Injected cards into index.html');
console.log('Updated tab counts:', JSON.stringify(counts));
console.log('Updated hero date:', TODAY);
