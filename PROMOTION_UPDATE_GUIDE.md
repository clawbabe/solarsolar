# 솔라 할인코드 - 프로모션 업데이트 가이드

**중요: 프로모션 정보 업데이트 작업 시 이 파일을 항상 먼저 읽고 진행할 것**

## 기본 원칙

### 1. 절대 금지 사항 (매우 중요!)
- ❌ **내용 축소 절대 금지**: 설명, 조건, 대상 등 어떤 텍스트도 축소하거나 생략하지 말 것
- ❌ **말줄임표(...) 사용 절대 금지**: "KB국민카드 개인 신용카드 …" 같은 형태 절대 금지
- ❌ **텍스트 잘림 절대 금지**: `text-truncate`, `overflow-hidden`, `line-clamp` 등 CSS 속성 절대 사용 금지
- ❌ **JavaScript로 텍스트 자르기 금지**: `.slice()`, `.substring()` 등으로 텍스트 축소 금지
- ⚠️ **중요**: 사용자가 이 부분에 매우 민감함. 절대 어기지 말 것!

### 2. 필수 준수 사항
- ✅ **전체 내용 표시**: 모든 텍스트는 전체 길이 그대로 표시
- ✅ **내용 상세화**: 부실한 내용은 더 상세하게 설명하고 정리
- ✅ **정보 추가**: 필요시 조건, 제외사항, 특이사항 등 보완
- ✅ **토글 형식 사용**: 긴 설명은 "유의사항 상세보기" 토글로 처리 (아래 상세 설명 참조)

## 헤더/푸터 관리 (중요!)

### 공통 헤더/푸터 유지 규칙
- **모든 페이지는 동일한 헤더/푸터를 사용해야 함**
- 템플릿 위치: `_shared/header.html`, `_shared/footer.html`
- 각 페이지에 직접 복사되는 방식 (include 아님)

### 헤더/푸터 수정 시 필수 절차

**1단계: 템플릿 수정**
```bash
# 헤더 수정
_shared/header.html 편집

# 푸터 수정
_shared/footer.html 편집
```

**2단계: 동기화 스크립트 실행**
```bash
node sync_all_headers_footers.js
```

**3단계: 결과 확인**
- 17개 페이지 모두 업데이트 확인
- 메인페이지, 루트 index.html 반영 확인

### 동기화 스크립트 생성 방법
헤더/푸터 수정 시 아래 스크립트를 생성하여 실행:

```javascript
// sync_all_headers_footers.js
const fs = require('fs');
const path = require('path');

// Read shared templates
const sharedHeader = fs.readFileSync('_shared/header.html', 'utf8');
const sharedFooter = fs.readFileSync('_shared/footer.html', 'utf8');

const pages = ['agoda','expedia','hotelscom','myrealtrip','tripcom','klook','kkday','temu','speak','nol','airalo','rakuten','aliexpress','dutyfree','bookingcom','coupang','mainpage'];

pages.forEach(page => {
  const filePath = path.join(page, 'index.html');
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${page} - file not found`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  // Replace header
  const headerRegex = /<!-- Header -->[\s\S]*?<\/header>/;
  if (headerRegex.test(content)) {
    content = content.replace(headerRegex, sharedHeader);
    updated = true;
  }
  
  // Replace footer
  const footerRegex = /<footer[^>]*>[\s\S]*?<\/footer>/;
  if (footerRegex.test(content)) {
    content = content.replace(footerRegex, sharedFooter);
    updated = true;
  }
  
  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated ${page}`);
  } else {
    console.log(`- No changes in ${page}`);
  }
});

// Update root index.html from mainpage
const mainpageContent = fs.readFileSync('mainpage/index.html', 'utf8');
fs.writeFileSync('index.html', mainpageContent, 'utf8');
console.log('✓ Updated root index.html from mainpage');

console.log('\nDone! All pages now use shared header and footer.');
```

**⚠️ 중요 알림:**
- 헤더/푸터를 직접 수정한 경우 반드시 스크립트를 실행해야 함
- 한 페이지만 수정하면 다른 페이지와 불일치 발생
- 새 페이지 추가 시 `pages` 배열에 폴더명 추가

## 작업 순서

### 0단계: 작업 시작 전 필수!
**⚠️ 모든 프로모션 업데이트 작업 시작 전에 이 파일(PROMOTION_UPDATE_GUIDE.md)을 먼저 읽고 최신 지침을 확인할 것!**

### 1단계: CSV/MD 파일 확인
```bash
# CSV 파일이 있는 경우
node gen-cards.js

# MD 파일이 있는 경우  
node gen-cards-md.js
```

### 2단계: 카드 HTML 생성
- `cards_fragment.txt` 생성 확인
- `tab_counts.json` 생성 확인
- 생성된 카드 개수 확인

### 3단계: index.html 주입
```bash
node inject-cards.js
```

**중요**: inject-cards.js에서 카드 주입 시 반드시 다음을 확인:
- 카드 그리드 컨테이너(`</div>`)가 제대로 닫히는지 확인
- 사이드바가 카드 그리드와 **같은 레벨**에 있어야 함
- 구조: `<div grid>[카드들...]</div> <aside>사이드바</aside>`
- **그리드 클래스 정리**: `auto-rows-min`, `items-start` 자동 제거 로직 포함 필수

**inject-cards.js 필수 로직:**
```javascript
// 카드 주입 전에 그리드 클래스 정리
html = html.replace(/grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min items-start/g, 
  'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4');
html = html.replace(/grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min/g, 
  'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4');
html = html.replace(/grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start/g, 
  'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4');
```

### 4단계: JSON-LD Schema 업데이트
프로모션 정보 변경 시 `<head>` 내의 JSON-LD Schema도 함께 업데이트:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "Offer",
      "name": "프로모션명",
      "description": "프로모션 설명",
      "discountCode": "CODE123",
      "validFrom": "2026-02-01",
      "validThrough": "2026-02-28",
      "seller": {"@type": "Organization", "name": "브랜드명"}
    }
    // ... 주요 프로모션 5-10개 정도
  ]
}
</script>
```

### 5단계: Hero 섹션 정보 업데이트
**필수**: 업데이트 날짜와 프로모션 개수를 최신화
```html
<div class="flex items-center gap-3 p-4 bg-[brand]/5 rounded-lg border ...">
  <p class="text-sm">
    최근 업데이트: <span class="font-bold text-[brand]">2026년 2월 16일</span> · 
    총 <span class="font-bold text-[brand]">24개</span> 프로모션
  </p>
</div>
```
- 날짜: 현재 날짜로 업데이트
- 개수: `tab_counts.json`의 `all` 값 사용

### 4단계: 레이아웃 검증
- 3단 그리드 레이아웃 확인: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- `auto-rows-min items-start` 적용 확인
- 카드 높이: `min-h-[320px]` (외부에 `h-full` 사용 금지)
- 사이드바 분리 확인

### 5단계: 필터 탭 확인
```html
<!-- 표준 필터 탭 구조 -->
<div class="flex flex-wrap gap-2 mb-6" role="tablist">
  <button class="tab-active px-4 py-2 border-b-2 ..." id="tab-all" onclick="filterCoupons('all')">
    전체 <span class="ml-1 text-xs text-gray-500">N</span>
  </button>
  <!-- 추가 탭들... -->
</div>
```

### 6단계: CSS 스타일 확인
```css
.tab-active {
  border-color: [브랜드색] !important;
  background-color: [브랜드색] !important;
  color: white !important; /* 또는 적절한 대비색 */
}
.coupon-card {
  display: none;
}
.coupon-card.active {
  display: block;
}
```

### 7단계: JavaScript 기능 확인
```javascript
function filterCoupons(category) {
  document.querySelectorAll('.coupon-card').forEach(card => {
    const cat = card.dataset.category;
    const show = category === 'all' || cat === category;
    card.classList.toggle('active', show);
  });
  // 탭 active 토글
}

function copyCode(code, btn) {
  navigator.clipboard.writeText(code).then(() => {
    showToast('코드가 복사되었습니다: ' + code);
    if (btn) {
      const original = btn.textContent;
      btn.textContent = '✓ 복사됨';
      setTimeout(() => { btn.textContent = original; }, 2000);
    }
  });
}
```

## 템플릿 기준

### 기준 페이지
- **1차 기준**: `travel/agoda/index.html`
- 모든 할인코드 페이지는 이 템플릿을 따름

### 페이지 구조 (순서 엄수)
1. Header (로고 + 메뉴)
2. Hero (브레드크럼 + **브랜드 로고 이미지** + 업데이트 날짜)
3. Main Content (필터 탭 + 쿠폰 리스트 + 사이드바)
4. 구분선 (border-b)
5. FAQ (자주 묻는 질문)
6. 사용방법 (스텝 바이 스텝 이미지형)
7. 할인코드 사용이 안되는 경우 (트러블슈팅)
8. 유사 플랫폼
9. Footer

### Hero 섹션 브랜드 로고
**중요**: H1 제목 옆의 아이콘은 반드시 **실제 로고 이미지**를 사용할 것

```html
<div class="flex items-center justify-center gap-4 mb-6">
  <div class="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden">
    <img src="/images/logos/[merchant].png" alt="[브랜드명] 로고" class="w-full h-full object-contain">
  </div>
  <h1 class="text-5xl font-black bg-gradient-to-r from-[brand] to-[color] bg-clip-text text-transparent">[브랜드명]</h1>
</div>
```

**금지**: 
- ❌ Lucide 아이콘 사용 (`<i data-lucide="...">`)
- ❌ 텍스트 문자 사용 (`<span>a</span>`, `<span>KK</span>` 등)
- ✅ 반드시 `/images/logos/` 경로의 실제 로고 이미지 사용

### 컨테이너 기준
- 모든 섹션: `max-w-6xl mx-auto px-4`
- FAQ 내용만: `max-w-3xl mx-auto` (가독성)

### 그리드 레이아웃 규칙
**중요**: 카드 그리드는 다음 클래스만 사용:
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

**절대 금지**:
- ❌ `auto-rows-min` 사용 금지
- ❌ `items-start` 사용 금지
- ❌ `h-full` 외부 카드 div에 사용 금지

**이유**: 토글을 열었을 때 같은 행(row)의 모든 카드가 함께 늘어나야 함. `auto-rows-min`이나 `items-start`를 사용하면 개별 카드만 늘어남.

### 카드 구조 (토글 방식)
```html
<div class="coupon-card ... active" data-category="[category]">
  <div class="flex flex-col min-h-[320px]">
    <!-- 뱃지 -->
    <div class="flex flex-wrap gap-2 mb-3">...</div>
    
    <!-- 할인율/금액 -->
    <div class="mb-3">
      <span class="text-2xl font-bold text-[brand]">[할인율]</span>
    </div>
    
    <!-- 제목 -->
    <h2 class="font-bold mb-2 text-sm">[프로모션명]</h2>
    
    <!-- 간단 설명 (1-2줄 요약만) -->
    <p class="text-xs text-gray-500 mb-2">[짧은 요약 설명]</p>
    
    <!-- 유의사항 토글 (전체 내용 표시) -->
    <details class="mb-3">
      <summary class="text-xs text-[brand] cursor-pointer hover:underline mb-2">
        📋 유의사항 상세보기
      </summary>
      <div class="text-xs text-gray-600 space-y-2 mt-2 p-3 bg-gray-50 rounded-lg">
        <p><strong>사용조건:</strong> [전체 조건 내용 - 절대 축소 금지]</p>
        <p><strong>제외조건:</strong> [전체 제외 내용 - 절대 축소 금지]</p>
        <p><strong>특이사항:</strong> [전체 특이사항 - 절대 축소 금지]</p>
      </div>
    </details>
    
    <!-- 메타 정보 (기본 정보만) -->
    <div class="space-y-1 text-xs text-gray-400 mb-4">
      <div class="flex justify-between"><span>유효기간:</span><span>...</span></div>
      <div class="flex justify-between"><span>할인코드:</span><span>...</span></div>
    </div>
    
    <!-- 버튼 -->
    <button onclick="copyCode('CODE', this)">코드 복사</button>
  </div>
</div>
```

**토글 방식 핵심 규칙:**
1. `<details>` + `<summary>` 태그 사용 (JavaScript 불필요)
2. 토글 내부에는 **전체 텍스트를 그대로 표시** (축소 절대 금지)
3. 간단 설명은 1-2줄 핵심 요약만 (예: "삼성카드로 결제 시 할인")
4. 모든 상세 내용(조건, 제외, 특이사항)은 토글 안에 **전체 표시**

### 메타 정보 처리
```javascript
// 기본 메타 정보는 간단하게 (유효기간, 할인코드, 카드사 등)
html = `<div class="flex justify-between items-start gap-2">
  <span class="flex-shrink-0">라벨:</span>
  <span class="text-right">${text}</span>
</div>`;

// 긴 내용(조건, 제외사항, 특이사항)은 토글 안에 전체 표시
// 절대 축소하거나 생략하지 말 것!
```

## 카테고리 분류

### 일반적인 카테고리
- `card`: 카드사 제휴 할인
- `sale`: 시즌 할인, 특가
- `partnership`: 제휴사 할인
- `flight`: 항공권 할인
- `payment`: 결제 수단 할인
- `billing`: 청구할인
- `installment`: 무이자 할부
- `deal`: 특가/딜

### 카테고리 결정 로직 예시
```javascript
let category = 'sale'; // 기본값

if (issuer && issuer.includes('카드')) {
  category = 'card';
} else if (name.includes('항공')) {
  category = 'flight';
} else if (name.includes('무이자')) {
  category = 'installment';
}
```

## 뱃지 시스템

### 필수 뱃지
- ✓ 검증됨 (모든 카드에 기본)

### 조건부 뱃지
- 💳 카드사명 (카드사 할인인 경우)
- ✈️ 항공권 (항공 관련)
- 🤝 제휴 (제휴사 할인)
- 🔑 코드 입력 (쿠폰코드 있음)
- ⚡ 자동 적용 (쿠폰코드 없음)
- 📱 앱 전용 (앱에서만 사용)
- 🌿 에코 (친환경 프로모션)
- 👑 VIP (VIP 전용)

### 뱃지 색상 예시
```javascript
const CARD_COLORS = {
  '삼성': 'blue',
  '현대': 'purple',
  '신한': 'indigo',
  'KB': 'yellow',
  '롯데': 'red',
  '하나': 'teal',
  'NH': 'emerald',
  'VISA': 'sky',
  'Mastercard': 'orange'
};
```

## 빌드 파일 관리

### .gitignore 추가
```
# [머천트명] 빌드 파일
[merchant]/cards_fragment.txt
[merchant]/gen-cards.js (또는 gen-cards-md.js)
[merchant]/inject-cards.js
[merchant]/tab_counts.json
```

## 검증 체크리스트

### 시각적 검증
- [ ] 3단 그리드가 반응형으로 정상 작동 (1→2→3열)
- [ ] 필터 탭 클릭 시 정상 필터링
- [ ] 카드 높이가 균일함 (늘어남 없음)
- [ ] 사이드바가 우측에 올바르게 배치
- [ ] 모든 텍스트가 완전히 표시됨 (축소 없음)

### 기능 검증
- [ ] 필터 탭 클릭 시 해당 카테고리만 표시
- [ ] "코드 복사" 버튼 클릭 시 클립보드 복사 및 "✓ 복사됨" 표시
- [ ] 토스트 메시지 정상 표시
- [ ] 사이드바 "URL 복사하기" 정상 작동

### 데이터 검증
- [ ] 업데이트 날짜가 최신 날짜로 표시
- [ ] 프로모션 개수가 정확히 표시
- [ ] 각 필터 탭의 개수가 정확함
- [ ] 모든 할인코드가 정확히 표시

## 브랜드 색상 참고

| 브랜드 | 메인 색상 | CSS 클래스명 |
|--------|----------|--------------|
| 아고다 | #007cc2 | text-agoda |
| 익스피디아 | #ffcb00 | text-expedia |
| 마이리얼트립 | #ff6b35 | text-myrealtrip |
| 클룩 | #ff6f00 | text-klook |
| 트립닷컴 | #2577e3 | text-tripcom |

## 주의사항

1. **설명 텍스트 축소 금지**: 사용자가 이 부분에 매우 민감함. 절대 축소하지 말 것
2. **flex 줄바꿈 문제**: 긴 텍스트는 수직 레이아웃으로 변경
3. **카드 높이 늘어남**: `auto-rows-min items-start` 사용, 외부 div에 `h-full` 사용 금지
4. **필터 작동 안 함**: `.tab-active`, `.coupon-card.active` CSS 및 `filterCoupons` 함수 확인
5. **복사 피드백 없음**: `copyCode(code, btn)` 두 번째 파라미터 전달 확인

## 문제 해결

### 카드가 세로로 늘어남
```css
/* 그리드 컨테이너에 추가 */
.grid {
  auto-rows-min;
  items-start;
}

/* 카드 내부 flex에만 min-h 사용 */
.coupon-card > div {
  min-h-[320px];
}
```

### 필터가 작동하지 않음
1. CSS에 `.coupon-card { display: none; }` 확인
2. JavaScript `filterCoupons` 함수 존재 확인
3. 카드의 `data-category` 속성 확인
4. 초기 `active` 클래스 존재 확인

### 텍스트가 잘림
1. `line-clamp`, `truncate` 클래스 제거
2. `overflow-hidden` 제거
3. `max-w-*` 제거
4. 긴 텍스트는 세로 배치로 변경

---

## 📝 이 가이드 관리 규칙

### 중요 원칙
1. **사용자가 지시하는 모든 새로운 사항은 이 MD 파일에 즉시 추가**
2. **작업 시작 전 항상 이 파일을 읽고 최신 지침 확인**
3. **기존 지침과 충돌하는 새 지침이 있으면 새 지침을 우선**
4. **중요한 실수나 교훈은 "주의사항" 섹션에 추가**

### 업데이트 이력
- 2026-02-16 (v1.0): 초기 가이드 작성
- 2026-02-16 (v1.1): JSON-LD Schema 및 Hero 섹션 업데이트 지침 추가
- 2026-02-16 (v1.2): MD 파일 관리 규칙 추가

---

### 업데이트 이력
- 2026-02-16 (v1.0): 초기 가이드 작성
- 2026-02-16 (v1.1): JSON-LD Schema 및 Hero 섹션 업데이트 지침 추가
- 2026-02-16 (v1.2): MD 파일 관리 규칙 추가
- 2026-02-16 (v1.3): **토글 형식 도입 - 내용 축소 절대 금지 재강조**
- 2026-02-16 (v1.4): **그리드 레이아웃 규칙 추가 - auto-rows-min 금지**

---

**마지막 업데이트**: 2026-02-16 (v1.4)  
**작성자**: AI Agent  
**버전 관리**: 중요 변경사항은 업데이트 이력에 기록

## ⚠️ 긴급 주의사항

### 텍스트 축소 관련 (매우 중요!)
사용자가 **텍스트 축소/생략에 매우 민감**합니다. 다음 사항을 반드시 준수하세요:

1. **절대 금지**: `...`, `…`, "더보기" 같은 형태로 텍스트 축소 금지
2. **해결 방법**: 토글(`<details>`) 사용 - 전체 내용을 토글 안에 표시
3. **JavaScript 금지**: `.slice()`, `.substring()` 등으로 텍스트 자르기 금지
4. **CSS 금지**: `text-truncate`, `line-clamp`, `overflow-hidden` 사용 금지
5. **카드 크기**: 내용이 많으면 토글로 처리, 카드 높이는 `min-h-[320px]` 유지
6. **그리드 레이아웃**: `auto-rows-min`, `items-start` 절대 사용 금지 (토글 시 같은 행 카드들이 함께 늘어나야 함)

**토글 내부에는 반드시 전체 텍스트를 표시할 것!**

## 🎯 그리드 레이아웃 주의사항 (중요!)

### 토글 동작 일관성
토글을 열었을 때 **같은 행(row)에 있는 모든 카드가 함께 늘어나야** 합니다.

**올바른 그리드 클래스:**
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
  <!-- 카드들... -->
</div>
```

**금지된 클래스:**
- ❌ `auto-rows-min` - 각 행이 최소 높이로 고정되어 개별 카드만 늘어남
- ❌ `items-start` - 카드들이 독립적으로 정렬되어 함께 늘어나지 않음
- ❌ `h-full` (외부 카드 div) - 카드 높이가 고정되어 토글이 작동하지 않음

**허용된 클래스:**
- ✅ `min-h-[320px]` (내부 flex container만) - 최소 높이 보장하되 늘어날 수 있음

## 🔘 버튼 규칙 (매우 중요!)

### 할인코드 유무에 따른 버튼 구분

**규칙**: 할인코드가 있으면 "복사하기" 버튼, 없으면 "적용하기" 버튼

```javascript
// 할인코드가 있는 경우
const buttonHtml = code 
  ? `<button onclick="copyCode('${esc(code)}', this)" class="... bg-[#brand-color] ...">복사하기</button>`
  : `<a href="${esc(link)}" target="_blank" rel="noopener noreferrer" class="... bg-[#brand-color] ...">적용하기</a>`;
```

**예시:**
- ✅ 할인코드 "SSCARD7" 있음 → "복사하기" 버튼 (onclick)
- ✅ 할인코드 없음, 자동 적용 → "적용하기" 링크 (href)

**copyCode 함수 (버튼 피드백 필수):**
```javascript
function copyCode(code, btn) {
  navigator.clipboard.writeText(code).then(() => {
    showToast('코드가 복사되었습니다: ' + code);
    if (btn) {
      const original = btn.textContent;
      btn.textContent = '✓ 복사됨';
      setTimeout(() => { btn.textContent = original; }, 2000);
    }
  });
}
```

**금지**:
- ❌ 할인코드가 있는데 "적용하기" 버튼 사용 (호텔스닷컴 초기 실수)
- ❌ `copyCode()` 호출 시 두 번째 파라미터(`btn`) 누락

## 🧩 공통 헤더/푸터 (모든 페이지 동일)

### 헤더 구조 (Header)

모든 페이지는 동일한 헤더를 사용합니다. **드롭다운 메뉴 구조:**
- **여행**: agoda, tripcom, expedia, hotelscom, bookingcom, myrealtrip, klook, kkday, airalo, nol, rakuten, dutyfree, coupang
- **쇼핑**: aliexpress, temu, speak

**중요:**
- ❗ `<button>` 대신 `<a href="#">` 사용 (불필요한 페이지 이동 방지)
- ❗ `<i data-lucide="chevron-down">` 대신 SVG 직접 삽입 (아이콘 초기화 불필요)
- ❗ `backdrop-blur-sm` 클래스 추가 (배경 블러 효과)

```html
<!-- Header -->
<header class="sticky top-0 bg-white/95 backdrop-blur-sm border-b z-50" role="banner">
  <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
    <a href="/" class="flex items-center gap-2" aria-label="쿠키스페이스 홈">
      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-pink-400 flex items-center justify-center">
        <i data-lucide="cookie" class="w-5 h-5 text-white"></i>
      </div>
      <span class="text-xl font-bold">쿠키스페이스</span>
    </a>
    <nav class="hidden md:flex gap-6" aria-label="메인 메뉴">
      <a href="/" class="text-gray-600 hover:text-primary transition-colors">홈</a>
      
      <!-- 여행 드롭다운 -->
      <div class="relative group">
        <a href="#" class="text-gray-600 hover:text-primary transition-colors flex items-center gap-1">
          여행
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="m6 9 6 6 6-6"/></svg>
        </a>
        <div class="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-lg border py-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          <a href="/agoda" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">아고다</a>
          <a href="/tripcom" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">트립닷컴</a>
          <a href="/expedia" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">익스피디아</a>
          <a href="/hotelscom" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">호텔스닷컴</a>
          <a href="/bookingcom" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">부킹닷컴</a>
          <a href="/myrealtrip" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">마이리얼트립</a>
          <a href="/klook" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">클룩</a>
          <a href="/kkday" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">케이케이데이</a>
          <a href="/airalo" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">에어알로</a>
          <a href="/yanolja" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">놀</a>
          <a href="/rakuten" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">라쿠텐</a>
          <a href="/dfs" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">면세점</a>
          <a href="/coupang" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">쿠팡</a>
        </div>
      </div>
      
      <!-- 쇼핑 드롭다운 -->
      <div class="relative group">
        <a href="#" class="text-gray-600 hover:text-primary transition-colors flex items-center gap-1">
          쇼핑
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="m6 9 6 6 6-6"/></svg>
        </a>
        <div class="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-lg border py-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          <a href="/ali" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">알리익스프레스</a>
          <a href="/temu" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">테무</a>
          <a href="/speak" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">스픽</a>
        </div>
      </div>
    </nav>
  </div>
</header>
```

### 푸터 구조 (Footer)

모든 페이지는 동일한 푸터를 사용합니다. **4열 그리드 구조:**
- 로고 & 설명 (2열)
- 여행 플랫폼 (1열, 13개 링크)
- 쇼핑 플랫폼 (1열, 3개 링크)

```html
<footer class="bg-gray-900 text-white py-12 md:py-16" role="contentinfo">
  <div class="max-w-6xl mx-auto px-4">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
      <!-- Logo & Description -->
      <div class="md:col-span-2">
        <a href="/" class="flex items-center gap-2 mb-4" aria-label="쿠키스페이스 홈">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-pink-400 flex items-center justify-center">
            <i data-lucide="cookie" class="w-5 h-5 text-white"></i>
          </div>
          <span class="text-2xl font-bold">쿠키스페이스</span>
        </a>
        <p class="text-gray-400 leading-relaxed max-w-md">신뢰할 수 있는 검증된 할인코드만을 제공하는 쿠키스페이스입니다. 여행과 쇼핑을 더욱 스마트하게 즐기세요.</p>
      </div>
      
      <!-- 여행 플랫폼 -->
      <div>
        <h4 class="font-bold text-lg mb-4">여행</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="/agoda" class="text-gray-400 hover:text-primary transition-colors">아고다</a></li>
          <li><a href="/tripcom" class="text-gray-400 hover:text-primary transition-colors">트립닷컴</a></li>
          <li><a href="/expedia" class="text-gray-400 hover:text-primary transition-colors">익스피디아</a></li>
          <li><a href="/hotelscom" class="text-gray-400 hover:text-primary transition-colors">호텔스닷컴</a></li>
          <li><a href="/bookingcom" class="text-gray-400 hover:text-primary transition-colors">부킹닷컴</a></li>
          <li><a href="/myrealtrip" class="text-gray-400 hover:text-primary transition-colors">마이리얼트립</a></li>
          <li><a href="/klook" class="text-gray-400 hover:text-primary transition-colors">클룩</a></li>
          <li><a href="/kkday" class="text-gray-400 hover:text-primary transition-colors">케이케이데이</a></li>
          <li><a href="/airalo" class="text-gray-400 hover:text-primary transition-colors">에어알로</a></li>
          <li><a href="/yanolja" class="text-gray-400 hover:text-primary transition-colors">놀</a></li>
          <li><a href="/rakuten" class="text-gray-400 hover:text-primary transition-colors">라쿠텐</a></li>
          <li><a href="/dfs" class="text-gray-400 hover:text-primary transition-colors">면세점</a></li>
          <li><a href="/coupang" class="text-gray-400 hover:text-primary transition-colors">쿠팡</a></li>
        </ul>
      </div>
      
      <!-- 쇼핑 플랫폼 -->
      <div>
        <h4 class="font-bold text-lg mb-4">쇼핑</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="/ali" class="text-gray-400 hover:text-primary transition-colors">알리익스프레스</a></li>
          <li><a href="/temu" class="text-gray-400 hover:text-primary transition-colors">테무</a></li>
          <li><a href="/speak" class="text-gray-400 hover:text-primary transition-colors">스픽</a></li>
        </ul>
      </div>
    </div>
    
    <!-- Bottom Bar -->
    <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <p class="text-gray-500 text-sm">© 2026 쿠키스페이스. All rights reserved.</p>
      <div class="flex items-center gap-6">
        <a href="/privacy" class="text-gray-500 hover:text-white text-sm transition-colors">개인정보처리방침</a>
        <a href="/terms" class="text-gray-500 hover:text-white text-sm transition-colors">이용약관</a>
        <a href="/contact" class="text-gray-500 hover:text-white text-sm transition-colors">문의하기</a>
      </div>
    </div>
  </div>
</footer>
```

**참고:**
- 헤더/푸터 템플릿은 `_shared/header.html`, `_shared/footer.html`에 저장됨
- 새 페이지 생성 시 이 템플릿을 복사하여 사용
- **절대 독자적인 헤더/푸터를 만들지 말 것**
- 새로운 플랫폼 추가 시 **반드시** 헤더 드롭다운과 푸터 목록 모두 업데이트

## 📐 메인페이지 SEO 계층 구조

### HTML 헤딩 구조 (필수)

메인페이지(`mainpage/index.html`, `index.html`)는 다음 계층 구조를 따릅니다:

```html
<h2>인기 할인코드</h2>
  <h3>여행 할인코드</h3>
    <h4>아고다</h4>
    <h4>트립닷컴</h4>
    <h4>익스피디아</h4>
    <h4>호텔스닷컴</h4>
    <h4>부킹닷컴</h4>
    <h4>마이리얼트립</h4>
    <h4>클룩</h4>
    <h4>케이케이데이</h4>
    <h4>라쿠텐</h4>
    <h4>에어알로</h4>
    <h4>면세점</h4>
    <h4>놀</h4>
    <h4>쿠팡</h4>
  <h3>쇼핑 할인코드</h3>
    <h4>테무</h4>
    <h4>알리익스프레스</h4>
    <h4>스픽</h4>
```

**규칙:**
- ✅ h2: 전체 섹션 제목 "인기 할인코드"
- ✅ h3: 카테고리 "여행 할인코드", "쇼핑 할인코드"
- ✅ h4: 각 플랫폼 이름 (카드 내부)
- ❌ 플랫폼 이름에 h3 사용 금지 (SEO 계층 구조 위반)
