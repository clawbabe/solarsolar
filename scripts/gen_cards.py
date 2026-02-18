#!/usr/bin/env python3
"""Generate coupon card HTML from CSV. Usage: python gen_cards.py <merchant_slug> <csv_path>"""
import csv
import sys
import html

CONFIG = {
    "yes24": {"class": "yes24", "url": "https://www.yes24.com", "cta": "예스24에서 보기"},
    "kyobobook": {"class": "kyobobook", "url": "https://www.kyobobook.com", "cta": "인터넷 교보문고에서 보기"},
    "auction": {"class": "auction", "url": "https://www.auction.co.kr", "cta": "옥션에서 보기"},
    "wconcept": {"class": "wconcept", "url": "https://www.wconcept.co.kr", "cta": "더블유컨셉코리아에서 보기"},
    "lotteon": {"class": "lotteon", "url": "https://www.lotteon.com", "cta": "롯데온에서 보기"},
    "lottehomeshopping": {"class": "lottehomeshopping", "url": "https://www.lottehomeshopping.com", "cta": "롯데 홈쇼핑에서 보기"},
    "emart": {"class": "emart", "url": "https://www.emart.com", "cta": "이마트 인터넷 쇼핑몰에서 보기"},
    "farfetch": {"class": "farfetch", "url": "https://www.farfetch.com", "cta": "파페치에서 보기"},
}

def esc(s):
    return html.escape(str(s).strip()) if s else ""

def card_html(c, slug):
    cfg = CONFIG[slug]
    cls = cfg["class"]
    # CSV columns vary by merchant
    if slug == "yes24":
        name = esc(c.get("프로모션명", ""))
        benefit = esc(c.get("할인혜택", ""))
        period = esc(c.get("기간", ""))
        detail = esc(c.get("사용조건/유의사항", ""))
    elif slug == "kyobobook":
        name = esc(c.get("프로모션명", ""))
        benefit = esc(c.get("혜택", ""))
        period = esc(c.get("기간", ""))
        detail = esc(c.get("조건", ""))
    elif slug in ("auction", "lottehomeshopping"):
        name = esc(c.get("프로모션명", ""))
        benefit = esc(c.get("할인율/금액", ""))
        period = esc(c.get("유효기간", ""))
        detail = esc(c.get("사용조건", "") or c.get("조건", "")) + " " + esc(c.get("제외사항", "") or c.get("제외조건", ""))
    elif slug in ("wconcept", "lotteon", "emart"):
        name = esc(c.get("프로모션명", ""))
        benefit = esc(c.get("할인율/금액", ""))
        period = esc(c.get("기간", ""))
        detail = esc(c.get("사용조건", "") or c.get("조건", ""))
    elif slug == "farfetch":
        name = esc(c.get("프로모션 명", "") or c.get("프로모션명", ""))
        benefit = esc(c.get("할인율/금액", ""))
        period = esc(c.get("유효 기간", "") or c.get("유효기간", ""))
        detail = esc(c.get("사용 조건", "") or c.get("사용조건", ""))
    else:
        name = benefit = period = detail = ""
    return f'''        <div class="coupon-card relative rounded-lg border bg-card text-card-foreground shadow-sm p-5" role="listitem" data-filter="all">
          <div class="flex flex-col min-h-[320px]">
            <div class="flex flex-wrap gap-2 mb-3">
              <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-700">✓ 검증됨</span>
            </div>
            <div class="mb-3"><span class="text-2xl font-bold text-{cls}">{benefit or "—"}</span></div>
            <h2 class="font-bold mb-2 text-sm">{name or "—"}</h2>
            <details class="mb-3">
              <summary class="text-xs text-{cls} cursor-pointer hover:underline mb-2 flex items-center gap-1">📋 유의사항 상세보기</summary>
              <div class="text-xs text-gray-600 space-y-2 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p>{detail or "상세 페이지 참조"}</p>
              </div>
            </details>
            <div class="space-y-1 text-xs text-gray-400 mb-4 mt-auto">
              <div class="flex justify-between"><span>기간:</span><span>{period or "—"}</span></div>
            </div>
            <a href="{cfg['url']}" target="_blank" rel="noopener" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-{cls} text-white hover:bg-{cls}/90 h-9 px-4 py-2 w-full">{cfg['cta']}</a>
          </div>
        </div>'''

def main():
    slug = sys.argv[1]
    path = sys.argv[2]
    with open(path, "r", encoding="utf-8") as f:
        r = csv.DictReader(f)
        rows = list(r)
    for row in rows:
        print(card_html(row, slug))

if __name__ == "__main__":
    main()
