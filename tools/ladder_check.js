// 校验阶梯学习数据：node tools/ladder_check.js（在仓库根目录运行）
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
global.window = {};
const load = f => (new Function(fs.readFileSync(path.join(root, f), 'utf8')))();
['bank.js', 'bank2.js', 'bank3.js', 'bank_math_real.js', 'bank_bunso_real.js', 'bank_bunso_extra.js', 'bank_core.js'].forEach(load);
const baseIds = new Set(window.EJU_BANK.map(c => c.id));
const before = window.EJU_BANK.length;
load('ladder_cards.js');
load('ladder_data.js');

let bad = 0;
const err = m => { bad++; console.error('✗', m); };
const added = window.EJU_BANK.slice(before);
const seen = new Set();
for (const c of added) {
  if (!/^lad-/.test(c.id)) err(`先修卡 id 缺少 lad- 前缀：${c.id}`);
  if (baseIds.has(c.id) || seen.has(c.id)) err(`先修卡 id 重复：${c.id}`);
  seen.add(c.id);
  if (c.source !== '未核实') err(`${c.id} source 必须是「未核实」`);
  if (!Array.isArray(c.choices) || c.choices.length !== 4 || !(c.a >= 0 && c.a < 4)) err(`${c.id} 选项/答案不合法`);
  if (!c.q_cn || !c.expl) err(`${c.id} 缺 q_cn 或 expl`);
  if (c.choices_cn && c.choices_cn.length !== 4) err(`${c.id} choices_cn 长度不是4`);
}
const all = new Map(window.EJU_BANK.map(c => [c.id, c]));
const L = window.EJU_LADDER;
const used = new Set();
for (const [cid, c] of Object.entries(L.concepts)) {
  if (c.id !== cid) err(`概念 key 与 id 不一致：${cid}`);
  for (const k of ['deck', 'titleCn', 'titleJp', 'desc']) if (!c[k]) err(`概念 ${cid} 缺 ${k}`);
  if (!c.cardIds.length || c.cardIds.length > 3) err(`概念 ${cid} 的先修卡数应为 1～3，实际 ${c.cardIds.length}`);
  for (const id of c.cardIds) {
    used.add(id);
    const card = all.get(id);
    if (!card) err(`概念 ${cid} 的先修卡不存在：${id}`);
    else if (/^real-/.test(id)) err(`概念 ${cid} 不应把真题当先修卡：${id}`);
  }
}
const realIds = new Set(window.EJU_BANK.filter(c => /^real-b-/.test(c.id)).map(c => c.id));
let tagged = 0;
for (const [rid, r] of Object.entries(L.real)) {
  tagged++;
  if (!realIds.has(rid)) err(`真题不存在：${rid}`);
  if (!r.concepts.length || r.concepts.length > 3) err(`${rid} 概念数应为 1～3`);
  for (const c of r.concepts) if (!L.concepts[c]) err(`${rid} 引用了不存在的概念：${c}`);
}
const orphan = added.filter(c => !used.has(c.id)).map(c => c.id);
const unusedConcepts = Object.keys(L.concepts).filter(c => !Object.values(L.real).some(r => r.concepts.includes(c)));
console.log(`概念 ${Object.keys(L.concepts).length} 个，新先修卡 ${added.length} 张，已标注真题 ${tagged}/${realIds.size}`);
if (orphan.length) console.log('未被任何概念使用的新卡：', orphan.join(' '));
if (unusedConcepts.length) console.log('没有被任何真题引用的概念：', unusedConcepts.join(' '));
if (bad) { console.error(`${bad} 个问题`); process.exit(1); }
console.log('OK');
