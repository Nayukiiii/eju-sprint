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
  let lastPassageCn = '';
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

    if (c.passage_cn === 'SAME_AS_PREV') {
      c.passage_cn = lastPassageCn;
    } else if (c.passage_cn) {
      lastPassageCn = c.passage_cn;
    } else {
      lastPassageCn = '';
    }
    if (c.passage && !c.passage_cn) throw new Error(`${c.id}: has passage but no passage_cn`);
    if (!c.q_cn || !c.expl_cn || !Array.isArray(c.choices_cn) || c.choices_cn.length !== 4) {
      throw new Error(`${c.id}: missing q_cn / expl_cn / choices_cn`);
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
    liftStatementChoices(c);
    allCards.push(c);
  }
}


// 选项只有 Ａ～Ｄ 字母、而 Ａ～Ｄ 的陈述写在题干里时（如 2023第2回 問2(2)、問5），把陈述挪进选项，题干只留引导句
function liftStatementChoices(c) {
  const lift = (q, choices) => {
    if (!choices.every(x => /^[ＡＢＣＤA-D]$/.test(String(x).trim()))) return null;
    const lines = String(q).split('\n');
    const found = {};
    const rest = [];
    for (const line of lines) {
      const m = line.match(/^([ＡＢＣＤA-D])[：:]\s*(.+)$/);
      if (m) found[m[1].normalize('NFKC')] = m[2].trim();
      else rest.push(line);
    }
    if (Object.keys(found).length !== 4) return null;
    return {q: rest.join('\n').replace(/\s+$/, ''), choices: choices.map(x => `${String(x).trim()}：${found[String(x).trim().normalize('NFKC')]}`)};
  };
  const ja = lift(c.q, c.choices);
  const cn = lift(c.q_cn, c.choices_cn);
  if (ja && cn) {
    c.q = ja.q; c.choices = ja.choices;
    c.q_cn = cn.q; c.choices_cn = cn.choices;
  } else if (ja || cn) {
    throw new Error(`${c.id}: 日文和中文题干的 Ａ～Ｄ 陈述不一致，无法移入选项`);
  }
}

const header = '// EJU 総合科目（文综）历年真题（由 tools/build_bunso_bank.js 从 tools/bunso_src/ 生成，请勿手改）\n'
  + '// 答案逐题对照官方正解表；题面与选项由 AI 转写，尚未人工逐字校对。\n';

const outPath = path.join(ROOT, 'bank_bunso_real.js');
fs.writeFileSync(outPath, `${header}window.EJU_BANK = (window.EJU_BANK || []).concat(\n${JSON.stringify(allCards, null, 2)}\n);\n`, 'utf8');

console.log(`Successfully built ${allCards.length} verified bunso cards into bank_bunso_real.js`);
