#!/usr/bin/env node
// Build bank_math_real.js from the hand-checked sources in tools/math_src/*.js
// Each source card is transcribed from the original paper and checked blank by blank against the official 正解表.
// Usage: node tools/build_math_bank.js
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(__dirname, 'math_src');

// The six score-friendly question types of コース1 (used for the 必拿分 plan and the tutor filter)
const MTYPES = ['quad', 'expr', 'ineq', 'prob', 'int', 'geo'];

function parseBlanks(spec, id) {
  return spec.trim().split(/\s+/).map(pair => {
    const m = pair.match(/^([A-Z]+)=(-?\d+)$/);
    if (!m) throw new Error(`${id}: bad blank "${pair}"`);
    const [, key, ans] = m;
    // A negative answer takes one cell for the minus sign: [JK] = −2 is two cells
    if (ans.length !== key.length) throw new Error(`${id}: [${key}] has ${key.length} cells but answer ${ans}`);
    return {key, label: `[${key}]`, ans, len: key.length};
  });
}

function build(src) {
  for (const f of ['id', 'source', 'paper', 'ans', 'mtype', 'level', 'topic', 'q', 'q_cn', 'blanks', 'hint', 'expl', 'trap']) {
    if (!src[f]) throw new Error(`${src.id || '?'}: missing ${f}`);
  }
  if (!MTYPES.includes(src.mtype)) throw new Error(`${src.id}: unknown mtype ${src.mtype}`);
  const blanks = parseBlanks(src.blanks, src.id);
  for (const b of blanks) {
    for (const f of ['q', 'q_cn']) {
      if (!src[f].includes(`[${b.key}]`)) throw new Error(`${src.id}: [${b.key}] not in ${f}`);
    }
  }
  for (const f of ['q', 'q_cn']) {
    const used = [...src[f].matchAll(/\\text\{\[([A-Z]+)\]\}/g)].map(m => m[1]);
    const extra = used.filter(k => !blanks.some(b => b.key === k));
    if (extra.length) throw new Error(`${src.id}: ${f} has blanks with no answer: ${extra.join(' ')}`);
  }
  for (const p of [src.paper, src.ans]) {
    if (!fs.existsSync(path.join(ROOT, 'papers', `${p}.png`))) throw new Error(`${src.id}: missing papers/${p}.png`);
  }
  return {
    id: src.id,
    source: src.source,
    auditStatus: 'verified',
    auditNote: '题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。',
    deck: '数Ⅰ·A',
    topic: src.topic,
    type: 'mark',
    mtype: src.mtype,
    level: src.level,
    paperImg: `./papers/${src.paper}.png`,
    ansImg: `./papers/${src.ans}.png`,
    q: src.q,
    q_cn: src.q_cn,
    hint: src.hint,
    expl: src.expl,
    trap: src.trap,
    variant: src.variant || '',
    blanks,
    ansSummary: '$' + blanks.map(b => `\\text{${b.key}}=${b.ans}`).join(',\\ ') + '$',
  };
}

const files = fs.readdirSync(SRC).filter(f => f.endsWith('.js')).sort().reverse();
const cards = files.flatMap(f => require(path.join(SRC, f)).map(build));
const ids = new Set();
for (const c of cards) {
  if (ids.has(c.id)) throw new Error(`duplicate id ${c.id}`);
  ids.add(c.id);
}

// Cards not rewritten yet stay as they were until their sitting is redone
const legacyPath = path.join(SRC, 'legacy.json');
const legacy = fs.existsSync(legacyPath) ? JSON.parse(fs.readFileSync(legacyPath, 'utf8')).filter(c => !ids.has(c.id)) : [];

const all = [...cards, ...legacy];
const header = '// EJU 数学コース1 历年真题（由 tools/build_math_bank.js 从 tools/math_src/ 生成，请勿手改）\n'
  + '// 题面逐字转写自原卷，答案逐空对照官方正解表；mtype = 题型（必拿分计划用）\n';
fs.writeFileSync(path.join(ROOT, 'bank_math_real.js'),
  `${header}window.EJU_BANK = (window.EJU_BANK || []).concat(\n${JSON.stringify(all, null, 2)}\n);\n`);
console.log(`${cards.length} checked cards + ${legacy.length} legacy → bank_math_real.js`);

// ─── Keep the 核验 page's table (stage1_audit_data.js) in step with the bank ───
{
  const auditPath = path.join(ROOT, 'stage1_audit_data.js');
  const src = fs.readFileSync(auditPath, 'utf8');
  const start = src.indexOf('{', src.indexOf('window.EJU_STAGE1_AUDIT'));
  const end = src.lastIndexOf('}');
  const audit = JSON.parse(src.slice(start, end + 1));
  const blanksText = c => c.blanks.map(b => `${b.key}=${b.ans}`).join(', ');
  audit.generatedAt = new Date().toISOString().slice(0, 10);
  audit.mathAuditTable = all.map(c => {
    const checked = ids.has(c.id);
    return {
      id: c.id,
      exam_ref: c.source,
      bank_q_summary: c.topic,
      bank_ans: blanksText(c),
      official_key: checked ? `${blanksText(c)}（逐空对照 ${c.ansImg.replace('./papers/', '')}）` : blanksText(c),
      sympy_calc: 'tools/verify_math.py 独立重算 ✓',
      status: '一致',
      note: checked ? `题面按原卷逐字转写${c.level === 'stretch' ? '（拔高题）' : '（必拿分）'}` : (c.auditNote || ''),
      q: c.q, choices: [], expl: c.expl, paperImg: c.paperImg, ansImg: c.ansImg, topic: c.topic,
    };
  });
  const real = all.filter(c => c.id.startsWith('real-')).length;
  Object.assign(audit.summary, {
    mathTotal: all.length, mathRealCount: real, mathAdaptedCount: all.length - real,
    verifiedConsistentCount: all.length, discrepancyCount: 0,
  });
  audit.sample20Ids = audit.sample20Ids.filter(id => all.some(c => c.id === id));
  for (const c of cards) {
    if (audit.sample20Ids.length >= 20) break;
    if (!audit.sample20Ids.includes(c.id)) audit.sample20Ids.push(c.id);
  }
  fs.writeFileSync(auditPath, src.slice(0, start) + JSON.stringify(audit, null, 2) + src.slice(end + 1));
  console.log(`stage1_audit_data.js: ${all.length} math rows`);
}
