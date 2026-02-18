const fs = require('fs');
const path = require('path');

// Read shared templates
const sharedHeader = fs.readFileSync('_shared/header.html', 'utf8');
const sharedFooter = fs.readFileSync('_shared/footer.html', 'utf8');

const pages = ['agoda','expedia','hotelscom','myrealtrip','tripcom','klook','kkday','temu','speak','nol','airalo','rakuten','aliexpress','dutyfree','bookingcom','coupang','gmarket','usimsa','soomgo','hmall','himart','yes24','kyobobook','auction','wconcept','lotteon','lottehomeshopping','emart','farfetch','mainpage'];

pages.forEach(page => {
  const filePath = path.join(page, 'index.html');
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${page} - file not found`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  // Replace header (new format with <!-- /Header --> end marker)
  const headerRegexNew = /<!-- Header -->[\s\S]*?<!-- \/Header -->/;
  // Fallback: old format ending with </header>
  const headerRegexOld = /<!-- Header -->[\s\S]*?<\/header>\s*(?:<script>[\s\S]*?<\/script>\s*)?/;
  
  if (headerRegexNew.test(content)) {
    content = content.replace(headerRegexNew, sharedHeader);
    updated = true;
  } else if (headerRegexOld.test(content)) {
    content = content.replace(headerRegexOld, sharedHeader);
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

// Root index.html is maintained separately (do not overwrite from mainpage)
console.log('\nDone! All merchant pages now use shared header and footer.');
