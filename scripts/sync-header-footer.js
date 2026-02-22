#!/usr/bin/env node
/**
 * _shared/header.html, _shared/footer.html 내용을 모든 페이지에 동일하게 적용합니다.
 * 사용: node scripts/sync-header-footer.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SHARED_HEADER = path.join(ROOT, '_shared', 'header.html');
const SHARED_FOOTER = path.join(ROOT, '_shared', 'footer.html');

function findHtmlFiles(dir, list = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '_shared', 'scripts', 'images', 'mcps', '.git'].includes(e.name)) continue;
      findHtmlFiles(full, list);
    } else if (e.name === 'index.html') {
      list.push(full);
    }
  }
  return list;
}

function getHeaderEndIndex(content, headerStart) {
  const mainMarkers = ['<main', '<section', '<article'];
  let mainStart = content.length;
  for (const m of mainMarkers) {
    const i = content.indexOf(m, headerStart);
    if (i !== -1 && i < mainStart) mainStart = i;
  }
  let lastScriptEnd = -1;
  let pos = content.indexOf('</script>', headerStart);
  while (pos !== -1 && pos < mainStart) {
    lastScriptEnd = pos;
    pos = content.indexOf('</script>', pos + 1);
  }
  return lastScriptEnd === -1 ? -1 : lastScriptEnd + 9;
}

function replaceHeader(content, sharedHeader) {
  const headerStart = content.indexOf('<header');
  if (headerStart === -1) return content;
  const optionalComment = content.indexOf('  <!-- Header -->');
  const start = (optionalComment !== -1 && optionalComment < headerStart) ? optionalComment : headerStart;
  const end = getHeaderEndIndex(content, headerStart);
  if (end === -1) return content;
  return content.slice(0, start) + sharedHeader + '\n' + content.slice(end);
}

function replaceFooter(content, sharedFooter) {
  const footerStart = content.indexOf('<footer');
  if (footerStart === -1) return content;
  const footerEnd = content.indexOf('</footer>', footerStart);
  if (footerEnd === -1) return content;
  return content.slice(0, footerStart) + sharedFooter.trim() + '\n' + content.slice(footerEnd + 9);
}

function main() {
  const headerHtml = fs.readFileSync(SHARED_HEADER, 'utf8');
  const footerHtml = fs.readFileSync(SHARED_FOOTER, 'utf8');

  const files = findHtmlFiles(ROOT);
  const indexRoot = path.join(ROOT, 'index.html');
  if (!files.includes(indexRoot)) files.unshift(indexRoot);

  let done = 0;
  let skipped = 0;
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.indexOf('<header') === -1) {
      skipped++;
      continue;
    }
    const afterHeader = replaceHeader(content, headerHtml);
    const afterFooter = replaceFooter(afterHeader, footerHtml);
    if (afterFooter !== content) {
      fs.writeFileSync(file, afterFooter, 'utf8');
      done++;
      console.log('Updated:', path.relative(ROOT, file));
    }
  }
  console.log('Done. Updated %d files, skipped %d.', done, skipped);
}

main();
