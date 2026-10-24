#!/usr/bin/env node
// Check that every question has a usable Chinese translation (question + each choice).
// Usage: node tools/check_cn.js   (exit code 1 when something is missing)
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
global.window = global;
for (const f of ['bank.js', 'bank2.js', 'bank3.js', 'bank_math_real.js', 'bank_bunso_real.js', 'bank_bunso_extra.js', 'bank_core.js']) {
  eval(fs.readFileSync(path.join(ROOT, f), 'utf8'));
}

const kana = /[\u3041-\u30fa\u30fc-\u30ff]/; // kana, not the ・ separator
const norm = t => String(t).replace(/[·・\s「」（）()]/g, '');
const problems = [];
for (const c of window.EJU_BANK) {
  if (!c.q_cn || norm(c.q_cn) === norm(c.q)) problems.push(`${c.id}: 题干没有中文`);
  if (!Array.isArray(c.choices)) continue;
  if (!Array.isArray(c.choices_cn) || c.choices_cn.length !== c.choices.length) {
    problems.push(`${c.id}: 选项中文数量不对`);
    continue;
  }
  c.choices.forEach((ja, i) => {
    const cn = c.choices_cn[i];
    // Same text is fine for numbers and kanji-only names (公明党, 所得税); text with kana needs a translation
    if (!cn || (norm(cn) === norm(ja) && kana.test(ja))) problems.push(`${c.id}: 选项 ${i + 1}「${ja}」没有中文`);
  });
}
if (problems.length) {
  console.log(problems.join('\n'));
  console.log(`\n${problems.length} 处缺中文`);
  process.exit(1);
}
console.log(`${window.EJU_BANK.length} 题的中文都齐了`);
