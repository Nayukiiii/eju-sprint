#!/usr/bin/env node
// Build bank3.js (時事) from tools/news_2026.js. Then run tools/apply_bunso_fixes.js to place answers.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const items = require('./news_2026.js');

const cards = items.map(([id, topic, q, qCn, options, expl, trap]) => {
  if (options.length !== 4) throw new Error(`${id}: needs 4 options`);
  const card = {
    id,
    source: '未核实',
    deck: '時事',
    topic,
    type: 'mcq',
    q,
    q_cn: qCn,
    choices: options.map(o => o[0]),
    choices_cn: options.map(o => o[1]),
    a: 0,
    expl: `${expl}（截至 2026 年 10 月，经网络报道核对，非官方真题）`,
    optExpl: options.map(o => o[2]),
  };
  if (trap) card.trap = trap;
  return card;
});

const out = '// 時事（2025–2026 年），由 tools/build_news_bank.js 从 tools/news_2026.js 生成；无官方真题出处，标「未核实」。\n'
  + 'window.EJU_BANK = (window.EJU_BANK || []).concat(\n' + JSON.stringify(cards, null, 2) + '\n);\n';
fs.writeFileSync(path.join(ROOT, 'bank3.js'), out);
console.log(`wrote ${cards.length} cards to bank3.js`);
