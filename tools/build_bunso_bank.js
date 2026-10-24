#!/usr/bin/env node
// Build bank_bunso_real.js from tools/bunso_src/*.json
// Each card is transcribed from original exam papers and verified against official 正解表.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(__dirname, 'bunso_src');

if (!fs.existsSync(SRC)) {
  console.error('Source directory does not exist:', SRC);
  process.exit(1);
}

const files = fs.readdirSync(SRC).filter(f => f.endsWith('.json')).sort();
const allCards = [];
const seenIds = new Set();

for (const file of files) {
  const filePath = path.join(SRC, file);
  const cards = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`Processing ${file}: ${cards.length} cards`);
  
  let lastPassage = '';
  for (const c of cards) {
    if (!c.id) throw new Error(`${file}: card missing id`);
    if (seenIds.has(c.id)) throw new Error(`Duplicate id: ${c.id}`);
    seenIds.add(c.id);

    if (c.passage === 'SAME_AS_PREV') {
      c.passage = lastPassage;
    } else if (c.passage) {
      lastPassage = c.passage;
    } else {
      lastPassage = '';
    }

    if (!Array.isArray(c.choices) || c.choices.length !== 4) {
      throw new Error(`${c.id}: choices must be an array of 4 items`);
    }
    if (typeof c.a !== 'number' || c.a < 0 || c.a > 3) {
      throw new Error(`${c.id}: answer index 'a' must be integer 0..3, got ${c.a}`);
    }
    if (c.hasFigure && c.paperImg) {
      const imgPath = path.join(ROOT, c.paperImg.replace(/^\.\//, ''));
      if (!fs.existsSync(imgPath)) {
        throw new Error(`${c.id}: referenced paperImg not found: ${imgPath}`);
      }
    }
    allCards.push(c);
  }
}

const header = '// EJU 総合科目（文综）历年真题（由 tools/build_bunso_bank.js 从 tools/bunso_src/ 生成，请勿手改）\n'
  + '// 答案逐题对照官方正解表；题面与选项由 AI 转写，尚未人工逐字校对。\n';

const outPath = path.join(ROOT, 'bank_bunso_real.js');
fs.writeFileSync(outPath, `${header}window.EJU_BANK = (window.EJU_BANK || []).concat(\n${JSON.stringify(allCards, null, 2)}\n);\n`, 'utf8');

console.log(`Successfully built ${allCards.length} verified bunso cards into bank_bunso_real.js`);
