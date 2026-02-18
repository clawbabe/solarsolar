# 아고다 할인 정보 – CSV 기반 업데이트

매월 머천트 할인 정보를 CSV로 받으면, 이 폴더의 스크립트로 `index.html` 쿠폰을 갱신합니다.

## 흐름

1. **CSV 교체**  
   `agoda_promotion.csv`를 당월 데이터로 덮어씁니다.

2. **카드 생성**  
   ```bash
   cd agoda
   node gen-cards.js
   ```  
   → `cards_fragment.txt`, `tab_counts.json` 생성

3. **페이지 반영**  
   ```bash
   node inject-cards.js
   ```  
   → `index.html` 그리드·탭 숫자 갱신

## CSV 형식

**고정 규칙 없음.**  
매달 받는 CSV마다 컬럼 이름·순서·개수가 다를 수 있으므로, **그때그때 첫 행(헤더)을 읽어서** 필요한 필드를 찾아 매핑합니다.

- `gen-cards.js`는 헤더에서 예: 프로모션명/이름, 카드사/제휴사, 할인율, 할인금액, 유효기간, 적용조건, 프로모션코드, 추가정보, URL 등과 **이름이 비슷한 컬럼**을 찾아 사용합니다.
- 컬럼명이 바뀌었으면 해당 월에 받은 CSV에 맞춰 `gen-cards.js`의 `findCol(headerRow, ['키워드1','키워드2',...])` 키워드만 추가/수정하면 됩니다.

이미 생성된 `cards_fragment.txt`, `tab_counts.json`은 스크립트가 덮어쓰는 산출물이므로, 버전 관리에서 제외해도 됩니다.
