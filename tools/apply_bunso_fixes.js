#!/usr/bin/env node
// Apply 総合科目 rewrites / option notes, then rebalance answer positions.
// Usage: node tools/apply_bunso_fixes.js
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FILES = ['bank.js', 'bank2.js', 'bank_core.js', 'bank3.js'];
const rewrites = require('./bunso_rewrites.js');
const notes = require('./bunso_option_notes.js');

function load(file) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const start = src.search(/^\[|= \[$/m) + (src.match(/^\[|= \[$/m)[0].length - 1);
  const end = src.lastIndexOf(']');
  return {src, head: src.slice(0, start), tail: src.slice(end + 1), cards: JSON.parse(src.slice(start, end + 1))};
}

function save(file, {head, tail, cards}) {
  fs.writeFileSync(path.join(ROOT, file), head + JSON.stringify(cards, null, 2) + tail);
}

const stripLabel = s => String(s).replace(/^选项\(\d\)\s*(?:正确|错误|【答案】|【排除】)?[：:]?\s*/, '');

function applyContent(c) {
  const rw = rewrites[c.id];
  if (rw) {
    c.q = rw.q;
    c.q_cn = rw.q_cn;
    c.choices = rw.options.map(o => o[0]);
    c.choices_cn = rw.options.map(o => o[1]);
    c.optExpl = rw.options.map(o => o[2]);
    c.a = 0;
  }
  const stem = rewrites.stems[c.id];
  if (stem) [c.q, c.q_cn] = stem;
  const nt = notes[c.id];
  if (nt) {
    c.choices = c.choices.map(ch => (ch === 'どれも50分の1' ? '予算の議決' : ch));
    const miss = c.choices.filter(ch => !nt[ch]);
    if (miss.length) throw new Error(`${c.id}: no note for ${miss.join(', ')}`);
    c.choices_cn = c.choices.map(ch => nt[ch][0]);
    c.optExpl = c.choices.map(ch => nt[ch][1]);
  }
  if (notes.q_cn[c.id]) c.q_cn = notes.q_cn[c.id];
  if ('back' in c) c.back = c.choices[c.a];
}

// Move the correct option to `target`, keeping the other options in their relative order
function moveAnswer(c, target) {
  const order = [...Array(c.choices.length).keys()].filter(i => i !== c.a);
  order.splice(target, 0, c.a);
  for (const f of ['choices', 'choices_cn', 'optExpl']) {
    if (Array.isArray(c[f]) && c[f].length === order.length) c[f] = order.map(i => c[f][i]);
  }
  c.a = target;
}

function relabel(c) {
  if (!Array.isArray(c.optExpl)) return;
  c.optExpl = c.optExpl.map((e, i) => `选项(${i + 1}) ${i === c.a ? '【答案】' : '【排除】'}${stripLabel(e)}`);
}

const banks = FILES.map(f => [f, load(f)]);
let n = 0;
for (const [, bank] of banks) {
  for (const c of bank.cards) {
    if (c.type !== 'mcq' || /数/.test(c.deck)) continue;
    applyContent(c);
    moveAnswer(c, n % 4);
    relabel(c);
    n++;
  }
}
for (const [f, bank] of banks) save(f, bank);

const missing = [...Object.keys(rewrites).filter(k => k !== 'stems'), ...Object.keys(rewrites.stems),
  ...Object.keys(notes).filter(k => k !== 'q_cn'), ...Object.keys(notes.q_cn)]
  .filter(id => !banks.some(([, b]) => b.cards.some(c => c.id === id)));
if (missing.length) throw new Error('unknown ids: ' + missing.join(' '));
console.log(`updated ${n} 総合科目 cards`);
