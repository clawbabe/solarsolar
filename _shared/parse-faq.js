const fs = require('fs');
const path = require('path');
let csv = fs.readFileSync(path.join(__dirname, 'faq_data.csv'), 'utf8');
// Normalize: replace real newlines with space so we have one long line, then split by literal \n (row separator)
const oneline = csv.replace(/\r?\n/g, ' ');
const rows = oneline.split('\\n').map(s => s.trim()).filter(Boolean);
const byMerchant = {};
function parseRow(rowStr) {
  if (!rowStr || rowStr.startsWith('Merchant,')) return null;
  // Row is "Merchant","Question","Answer" or \"Merchant\",\"Question\",\"Answer\"
  const unesc = rowStr.replace(/^\\"/, '"').replace(/\\"/g, '"');
  const q2 = unesc.indexOf('","', 1);
  const q3 = unesc.indexOf('","', q2 + 3);
  if (q2 === -1 || q3 === -1) return null;
  const merchant = unesc.slice(1, q2).trim();
  const question = unesc.slice(q2 + 3, q3).replace(/""/g, '"').trim();
  const lastQuote = unesc.lastIndexOf('"');
  const answer = unesc.slice(q3 + 3, lastQuote).replace(/""/g, '"').trim();
  return { merchant, question, answer };
}
for (const rowStr of rows) {
  const parsed = parseRow(rowStr);
  if (parsed) {
    if (!byMerchant[parsed.merchant]) byMerchant[parsed.merchant] = [];
    byMerchant[parsed.merchant].push({ question: parsed.question, answer: parsed.answer });
  }
}
fs.writeFileSync(path.join(__dirname, 'faq_parsed.json'), JSON.stringify(byMerchant, null, 2), 'utf8');
console.log(Object.keys(byMerchant).join(', '));
console.log('Total merchants:', Object.keys(byMerchant).length);
