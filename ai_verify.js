// AI 交叉核验（文综）：用大模型盲答每道総合科目题，与题库答案比对。
// 支持 DeepSeek / OpenAI 兼容接口（接口地址、模型名都可以自己填）和 Anthropic。
// API Key 和全部结果只保存在本浏览器；选「经本站中转」时 Key 只是经过你自己的服务器转发，不保存、不写日志。
import { Anthropic, jsonSchemaOutputFormat } from './vendor/anthropic-sdk.js';

const KEY_PREFIX = 'eju-ai-key';         // + '-' + provider
const CFG_STORAGE = 'eju-ai-cfg';
const RESULT_STORAGE = 'eju-ai-verify-v1';
const DECISION_STORAGE = 'eju-ai-decisions-v1';
const CONCURRENCY = 3;

const PROVIDERS = {
  deepseek: {label: 'DeepSeek', base: 'https://api.deepseek.com', model: 'deepseek-chat', style: 'openai', keyHint: 'sk-…'},
  openai: {label: 'OpenAI 兼容（通义、Kimi、中转站等）', base: 'https://api.openai.com/v1', model: 'gpt-4o', style: 'openai', keyHint: 'sk-…'},
  anthropic: {label: 'Anthropic Claude', base: 'https://api.anthropic.com', model: 'claude-opus-5-5', style: 'anthropic', keyHint: 'sk-ant-…'},
};

// OpenAI-style endpoints have no schema-enforced output, so the shape is spelled out in the prompt
const JSON_SHAPE_NOTE = `

Reply with ONE JSON object and nothing else, in exactly this shape:
{"options":[{"number":1,"statement_true":true,"reason":"…"},{"number":2,…},{"number":3,…},{"number":4,…}],"answer":1,"confidence":"high|medium|low","ambiguous":false,"ambiguity_note":"","outdated_risk":false,"outdated_note":"","summary":"…"}
"answer" and every "number" are 1–4. Always include all four options. Leave a note empty ("") when it does not apply.`;

const SYSTEM_PROMPT = `You are checking practice questions for the EJU 総合科目 exam (the Japanese university entrance exam for international students; social studies: politics, economics, geography, history and current affairs).

Work out each question yourself from your own knowledge; you are not shown the answer key. Judge every option on its own: is the statement it makes factually accurate? Then pick the option that answers the question as asked — for 「誤っているもの」「含まれないもの」「適当でないもの」 questions that is the false or non-matching option.

Set ambiguous to true when more than one option could reasonably be the answer, or none can. Set outdated_risk to true when the answer depends on facts that may have changed (latest statistics, office holders, recent treaties, policy rates, recent renamings). If you are not sure of a fact, use confidence "low" rather than answering confidently.

Write every reason and note in Simplified Chinese, one or two short sentences each.`;

const RESULT_SCHEMA = {
  type: 'object',
  properties: {
    options: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          number: {type: 'integer', enum: [1, 2, 3, 4]},
          statement_true: {type: 'boolean'},
          reason: {type: 'string'},
        },
        required: ['number', 'statement_true', 'reason'],
        additionalProperties: false,
      },
    },
    answer: {type: 'integer', enum: [1, 2, 3, 4]},
    confidence: {type: 'string', enum: ['high', 'medium', 'low']},
    ambiguous: {type: 'boolean'},
    ambiguity_note: {type: 'string'},
    outdated_risk: {type: 'boolean'},
    outdated_note: {type: 'string'},
    summary: {type: 'string'},
  },
  required: ['options', 'answer', 'confidence', 'ambiguous', 'ambiguity_note', 'outdated_risk', 'outdated_note', 'summary'],
  additionalProperties: false,
};

const VERDICT_LABEL = {agree: '一致', doubt: '存疑', disagree: '不一致', error: '出错', stale: '题目已修改'};

// ─── Storage (every access guarded: private mode or blocked storage must not break the page) ───
function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_) {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {}
}

function readText(key) {
  try {
    return localStorage.getItem(key) || '';
  } catch (_) {
    return '';
  }
}

function writeText(key, value) {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch (_) {}
}

let results = readJson(RESULT_STORAGE, {});
let decisions = readJson(DECISION_STORAGE, {});

function loadCfg() {
  const saved = readJson(CFG_STORAGE, {});
  const provider = PROVIDERS[saved.provider] ? saved.provider : 'deepseek';
  const def = PROVIDERS[provider];
  return {provider, base: saved.base || def.base, model: saved.model || def.model, via: saved.via === 'relay' ? 'relay' : 'direct'};
}

function saveCfg(cfg) {
  writeJson(CFG_STORAGE, cfg);
}

const keyFor = provider => readText(`${KEY_PREFIX}-${provider}`) || (provider === 'anthropic' ? readText(KEY_PREFIX) : '');

// A result belongs to one exact version of the question; edits to the stem, options or key make it stale
function cardFingerprint(card) {
  const text = JSON.stringify([card.q, card.choices, card.a]);
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16);
}

function bunsoCards() {
  return (window.EJU_BANK || []).filter(c => c.type === 'mcq' && !/数/.test(c.deck));
}

function resultFor(card) {
  const r = results[card.id];
  if (!r) return null;
  if (r.fingerprint !== cardFingerprint(card)) return {...r, verdict: 'stale'};
  return r;
}

function judge(card, out) {
  if (out.answer !== card.a + 1) return 'disagree';
  if (out.ambiguous || out.outdated_risk || out.confidence === 'low') return 'doubt';
  return 'agree';
}

// ─── One blind check ───
class ApiFailure extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function questionText(card) {
  return [`問題：${card.q}`, ...card.choices.map((ch, i) => `${i + 1}. ${ch}`)].join('\n');
}

// Accept what a model returns even when it is slightly off-shape; reject what cannot be judged
function normalizeOut(raw) {
  const out = raw && typeof raw === 'object' ? raw : null;
  if (!out) return null;
  const answer = Number(out.answer);
  if (![1, 2, 3, 4].includes(answer)) return null;
  const options = Array.isArray(out.options) ? out.options.map(o => ({
    number: Number(o.number),
    statement_true: o.statement_true === true || o.statement_true === 'true',
    reason: String(o.reason || ''),
  })).filter(o => [1, 2, 3, 4].includes(o.number)) : [];
  return {
    options,
    answer,
    confidence: ['high', 'medium', 'low'].includes(out.confidence) ? out.confidence : 'medium',
    ambiguous: out.ambiguous === true,
    ambiguity_note: String(out.ambiguity_note || ''),
    outdated_risk: out.outdated_risk === true,
    outdated_note: String(out.outdated_note || ''),
    summary: String(out.summary || ''),
  };
}

function extractJson(text) {
  const t = String(text || '').trim();
  try { return JSON.parse(t); } catch (_) {}
  const fenced = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) { try { return JSON.parse(fenced[1]); } catch (_) {} }
  const a = t.indexOf('{');
  const b = t.lastIndexOf('}');
  if (a >= 0 && b > a) { try { return JSON.parse(t.slice(a, b + 1)); } catch (_) {} }
  return null;
}

function groupToken() {
  try { return JSON.parse(localStorage.getItem('eju-group-token') || 'null'); } catch (_) { return null; }
}

// One HTTPS call to an OpenAI-style endpoint, directly or through our own server
async function openAiRequest(cfg, apiKey, body) {
  const url = `${cfg.base.replace(/\/+$/, '')}/chat/completions`;
  let res;
  try {
    if (cfg.via === 'relay') {
      const token = groupToken();
      if (!token) throw new ApiFailure(0, '「经本站中转」需要先加入小组（登录后才能用中转）。');
      res = await fetch('/api/v2/relay', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
        body: JSON.stringify({url, headers: {Authorization: `Bearer ${apiKey}`}, body}),
      });
    } else {
      res = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}`},
        body: JSON.stringify(body),
      });
    }
  } catch (err) {
    if (err instanceof ApiFailure) throw err;
    // fetch rejects with a bare TypeError for both "offline" and "blocked by CORS"
    throw new ApiFailure(0, `连不上 ${cfg.base}。如果网络正常，多半是该接口不允许浏览器直接访问（跨域限制），请把「连接方式」改成「经本站中转」。`);
  }
  let data = {};
  try { data = await res.json(); } catch (_) {}
  if (!res.ok) throw new ApiFailure(res.status, data.error?.message || data.error || `HTTP ${res.status}`);
  return data;
}

async function verifyCardOpenAi(cfg, apiKey, card) {
  const data = await openAiRequest(cfg, apiKey, {
    model: cfg.model,
    temperature: 0,
    max_tokens: 4000,
    response_format: {type: 'json_object'},
    messages: [
      {role: 'system', content: SYSTEM_PROMPT + JSON_SHAPE_NOTE},
      {role: 'user', content: questionText(card)},
    ],
  });
  const choice = data.choices?.[0];
  const usage = {input: data.usage?.prompt_tokens || 0, output: data.usage?.completion_tokens || 0};
  if (choice?.finish_reason === 'length') return {verdict: 'error', error: '输出被截断', usage};
  const out = normalizeOut(extractJson(choice?.message?.content));
  if (!out) return {verdict: 'error', error: '模型没有返回可解析的 JSON', usage};
  return {verdict: judge(card, out), out, usage, servedBy: data.model};
}

async function verifyCardAnthropic(cfg, apiKey, card) {
  const client = new Anthropic({apiKey, dangerouslyAllowBrowser: true, maxRetries: 3,
    ...(cfg.base !== PROVIDERS.anthropic.base ? {baseURL: cfg.base} : {})});
  const fallbacks = /^claude-(opus|sonnet)/.test(cfg.model);
  const params = {
    model: cfg.model,
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    output_config: {effort: 'medium', format: jsonSchemaOutputFormat(RESULT_SCHEMA)},
    messages: [{role: 'user', content: questionText(card)}],
  };
  let response;
  try {
    response = fallbacks
      ? await client.beta.messages.parse({...params, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default'})
      : await client.messages.parse(params);
  } catch (err) {
    if (err instanceof Anthropic.APIConnectionError) throw new ApiFailure(0, `连不上 ${cfg.base}。请检查网络。`);
    if (err instanceof Anthropic.APIError) throw new ApiFailure(err.status || 0, err.message);
    throw err;
  }
  const usage = {input: response.usage?.input_tokens || 0, output: response.usage?.output_tokens || 0};
  if (response.stop_reason === 'refusal') return {verdict: 'error', error: '模型拒绝回答此题', usage};
  if (response.stop_reason === 'max_tokens' || !response.parsed_output) return {verdict: 'error', error: '输出被截断或无法解析', usage};
  return {verdict: judge(card, response.parsed_output), out: response.parsed_output, usage, servedBy: response.model};
}

const verifyCard = (cfg, apiKey, card) =>
  PROVIDERS[cfg.provider].style === 'anthropic' ? verifyCardAnthropic(cfg, apiKey, card) : verifyCardOpenAi(cfg, apiKey, card);

// ─── Run state ───
let running = false;
let stopRequested = false;
let session = {done: 0, total: 0, input: 0, output: 0};

// Only the Claude price list is known; for other providers the panel shows tokens, not dollars
const CLAUDE_PRICES = {opus: [4, 20], sonnet: [2, 10], haiku: [0.1, 0.5]};
function costText(cfg, input, output) {
  const tier = Object.keys(CLAUDE_PRICES).find(t => cfg.model.includes(t));
  if (cfg.provider === 'anthropic' && tier) {
    const [pi, po] = CLAUDE_PRICES[tier];
    return `约 $${((input * pi + output * po) / 1e6).toFixed(2)}`;
  }
  return '费用以服务商账单为准';
}

async function runVerification(scope) {
  const cfg = loadCfg();
  const apiKey = keyFor(cfg.provider);
  if (!apiKey) {
    setStatus(`请先填写并保存 ${PROVIDERS[cfg.provider].label} 的 API Key。`, 'warn');
    return;
  }
  const deck = $('#aiDeckSelect')?.value || '';
  const queue = bunsoCards().filter(card => {
    if (deck && card.deck !== deck) return false;
    const r = resultFor(card);
    if (scope === 'all') return true;
    if (scope === 'flagged') return r && r.verdict !== 'agree';
    return !r || r.verdict === 'stale' || r.verdict === 'error';
  });
  if (!queue.length) {
    setStatus(scope === 'flagged' ? '没有需要复核的题目。' : '这个范围的题目都已核验过。如需重跑请选「全部重新核验」。', 'ok');
    return;
  }

  running = true;
  stopRequested = false;
  session = {done: 0, total: queue.length, input: 0, output: 0};
  syncButtons();
  setStatus(`正在核验 0 / ${queue.length} …`);

  let fatal = null;
  const worker = async () => {
    while (queue.length && !stopRequested && !fatal) {
      const card = queue.shift();
      let r;
      try {
        r = await verifyCard(cfg, apiKey, card);
      } catch (err) {
        const status = err.status;
        if (status === 401) fatal = 'API Key 无效或已被撤销（401）。请检查后重新保存。';
        else if (status === 402) fatal = '账户余额不足（402）。';
        else if (status === 403) fatal = '这个 Key 没有权限调用该模型，或被服务商拒绝（403）。';
        else if (status === 404) fatal = `找不到模型或接口（404）：${cfg.model} @ ${cfg.base}`;
        else if (status === 0) fatal = err.message;
        else if (status === 429) r = {verdict: 'error', error: '请求过于频繁（429），稍后可用「核验未完成的题」继续'};
        else r = {verdict: 'error', error: `API 错误 ${status || ''}：${err.message}`};
      }
      if (!r) continue;
      results[card.id] = {...r, fingerprint: cardFingerprint(card), model: `${cfg.provider}/${cfg.model}`, at: new Date().toISOString()};
      writeJson(RESULT_STORAGE, results);
      session.done++;
      session.input += r.usage?.input || 0;
      session.output += r.usage?.output || 0;
      setStatus(`正在核验 ${session.done} / ${session.total} … ${costText(cfg, session.input, session.output)}`);
      renderReport();
    }
  };
  await Promise.all(Array.from({length: CONCURRENCY}, worker));

  running = false;
  syncButtons();
  const spent = `用量：输入 ${session.input.toLocaleString()} / 输出 ${session.output.toLocaleString()} tokens，${costText(cfg, session.input, session.output)}`;
  if (fatal) setStatus(`已停止：${fatal}`, 'bad');
  else if (stopRequested) setStatus(`已暂停（完成 ${session.done} / ${session.total}）。${spent}`, 'warn');
  else setStatus(`核验完成 ${session.done} 题。${spent}`, 'ok');
  window.dispatchEvent(new CustomEvent('eju-ai-verify-updated'));
}

// 「测试连接」：发一个很小的请求，告诉用户地址、Key、模型、跨域是否都通
async function testConnection() {
  const cfg = loadCfg();
  const apiKey = keyFor(cfg.provider);
  if (!apiKey) return setStatus('先保存 API Key 再测试。', 'warn');
  setStatus('测试中…');
  const t0 = performance.now();
  try {
    const sample = bunsoCards()[0];
    const r = await verifyCard(cfg, apiKey, sample);
    const ms = Math.round(performance.now() - t0);
    if (r.verdict === 'error') setStatus(`能连上（${ms} ms），但这次返回的内容有问题：${r.error}。可以再试一次，或换一个模型。`, 'warn');
    else setStatus(`连接正常：${PROVIDERS[cfg.provider].label} · ${cfg.model} · ${cfg.via === 'relay' ? '经本站中转' : '直连'} · ${ms} ms`, 'ok');
  } catch (err) {
    setStatus(`连接失败${err.status ? `（${err.status}）` : ''}：${err.message}`, 'bad');
  }
}

// ─── UI ───
const $ = sel => document.querySelector(sel);
let reportFilter = 'problems';

function escapeHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function setStatus(text, tone = '') {
  const el = $('#aiVerifyStatus');
  if (!el) return;
  el.textContent = text;
  el.className = `ai-status${tone ? ` is-${tone}` : ''}`;
}

function syncButtons() {
  for (const id of ['aiRunPendingBtn', 'aiRunFlaggedBtn', 'aiRunAllBtn', 'aiClearBtn', 'aiSaveKeyBtn', 'aiTestBtn']) {
    const b = document.getElementById(id);
    if (b) b.disabled = running;
  }
  const stop = $('#aiStopBtn');
  if (stop) stop.hidden = !running;
}

function counts() {
  const c = {agree: 0, doubt: 0, disagree: 0, error: 0, stale: 0, none: 0};
  for (const card of bunsoCards()) {
    const r = resultFor(card);
    c[r ? r.verdict : 'none']++;
  }
  return c;
}

const DECISION_LABEL = {adopt: '已采纳 AI', keep: '已保留题库答案', delete: '已标记删除'};

function decisionBar(card, r) {
  if (r.verdict !== 'disagree' && r.verdict !== 'doubt') return '';
  const cur = decisions[card.id]?.action;
  const btn = (action, text) => `<button type="button" class="btn btn-sm${cur === action ? ' is-picked' : ''}" data-ai-decide="${action}" data-card="${escapeHtml(card.id)}">${text}</button>`;
  const aiAnswer = r.out ? `（AI 认为是 (${r.out.answer})）` : '';
  return `<div class="ai-decide">
    ${r.verdict === 'disagree' ? btn('adopt', `采纳 AI${aiAnswer}`) : ''}${btn('keep', '保留题库答案')}${btn('delete', '标记删除')}
    <span class="ai-hint">这里只是记下你的决定，点「导出修订清单」发给我，我再改进题库。</span>
  </div>`;
}

function renderReport() {
  const list = $('#aiVerifyList');
  const summary = $('#aiVerifySummary');
  if (!list || !summary) return;
  const c = counts();
  const total = bunsoCards().length;
  summary.innerHTML = `
    <span class="ai-pill is-agree">一致 ${c.agree}</span>
    <span class="ai-pill is-doubt">存疑 ${c.doubt}</span>
    <span class="ai-pill is-disagree">不一致 ${c.disagree}</span>
    <span class="ai-pill">出错 ${c.error}</span>
    <span class="ai-pill">题目已修改 ${c.stale}</span>
    <span class="ai-pill">未核验 ${c.none} / ${total}</span>
    <span class="ai-pill">已处理 ${Object.keys(decisions).length}</span>`;

  const rows = bunsoCards()
    .map(card => ({card, r: resultFor(card)}))
    .filter(({r}) => {
      if (!r) return false;
      if (reportFilter === 'problems') return r.verdict === 'disagree' || r.verdict === 'doubt' || r.verdict === 'error';
      if (reportFilter === 'all') return true;
      return r.verdict === reportFilter;
    })
    .sort((x, y) => ['disagree', 'doubt', 'error', 'stale', 'agree'].indexOf(x.r.verdict) - ['disagree', 'doubt', 'error', 'stale', 'agree'].indexOf(y.r.verdict));

  if (!rows.length) {
    list.innerHTML = `<p class="ai-empty">${Object.keys(results).length ? '这个筛选下没有题目。' : '还没有核验结果。'}</p>`;
    return;
  }

  list.innerHTML = rows.map(({card, r}) => {
    const out = r.out;
    const options = card.choices.map((ch, i) => {
      const o = out?.options?.find(x => x.number === i + 1);
      const marks = [
        i === card.a ? '<span class="ai-mark is-key">题库答案</span>' : '',
        out && out.answer === i + 1 ? '<span class="ai-mark is-ai">AI 答案</span>' : '',
      ].join('');
      const truth = o ? (o.statement_true ? '叙述正确' : '叙述错误') : '';
      return `<li><div class="ai-opt-head"><b>(${i + 1})</b> ${escapeHtml(ch)} ${marks}</div>${o ? `<div class="ai-opt-reason"><em>${truth}</em>：${escapeHtml(o.reason)}</div>` : ''}</li>`;
    }).join('');
    const notes = [
      out?.ambiguous ? `<p class="ai-note"><b>多解/无解风险：</b>${escapeHtml(out.ambiguity_note)}</p>` : '',
      out?.outdated_risk ? `<p class="ai-note"><b>可能过时：</b>${escapeHtml(out.outdated_note)}</p>` : '',
      r.error ? `<p class="ai-note"><b>出错：</b>${escapeHtml(r.error)}</p>` : '',
    ].join('');
    return `
      <details class="ai-row is-${r.verdict}">
        <summary>
          <span class="ai-verdict">${VERDICT_LABEL[r.verdict]}</span>
          ${decisions[card.id] ? `<span class="ai-decided">${DECISION_LABEL[decisions[card.id].action]}</span>` : ''}
          <code>${escapeHtml(card.id)}</code>
          <span class="ai-q">${escapeHtml(card.q)}</span>
          ${out ? `<span class="ai-conf">把握：${{high: '高', medium: '中', low: '低'}[out.confidence]}</span>` : ''}
        </summary>
        <div class="ai-body">
          ${decisionBar(card, r)}
          ${out?.summary ? `<p class="ai-summary">${escapeHtml(out.summary)}</p>` : ''}
          ${notes}
          <ol class="ai-opts">${options}</ol>
          <p class="ai-meta">${escapeHtml(r.model || '')}${r.servedBy && r.servedBy !== r.model ? `（由 ${escapeHtml(r.servedBy)} 回答）` : ''} · ${r.at ? new Date(r.at).toLocaleString() : ''}</p>
        </div>
      </details>`;
  }).join('');
}

function exportResults() {
  const blob = new Blob([JSON.stringify({exportedAt: new Date().toISOString(), results}, null, 2)], {type: 'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `eju-ai-verify-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function exportRevisions() {
  const items = Object.entries(decisions).map(([id, d]) => {
    const card = (window.EJU_BANK || []).find(c => c.id === id);
    const r = results[id];
    return {
      id, action: d.action, decidedAt: d.at,
      question: card?.q, bankAnswer: card ? `(${card.a + 1}) ${card.choices[card.a]}` : null,
      aiAnswer: r?.out ? `(${r.out.answer}) ${card?.choices?.[r.out.answer - 1] || ''}` : null,
      aiSummary: r?.out?.summary || null,
    };
  });
  if (!items.length) return setStatus('还没有处理过的题。在「不一致 / 存疑」的题里选「采纳 AI / 保留 / 标记删除」。', 'warn');
  const blob = new Blob([JSON.stringify({exportedAt: new Date().toISOString(), revisions: items}, null, 2)], {type: 'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `eju-revisions-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function init() {
  const panel = $('#aiVerifyPanel');
  if (!panel) return;

  const cfg = loadCfg();
  const providerSel = $('#aiProviderSelect');
  providerSel.innerHTML = Object.entries(PROVIDERS).map(([id, p]) => `<option value="${id}">${p.label}</option>`).join('');
  const baseInput = $('#aiBaseInput');
  const modelInput = $('#aiModelInput');
  const viaSel = $('#aiViaSelect');
  const fill = c => {
    providerSel.value = c.provider;
    baseInput.value = c.base;
    modelInput.value = c.model;
    viaSel.value = c.via;
    $('#aiKeyInput').placeholder = PROVIDERS[c.provider].keyHint;
    showKeyState();
  };
  const current = () => ({provider: providerSel.value, base: baseInput.value.trim(), model: modelInput.value.trim(), via: viaSel.value});
  const persist = () => saveCfg(current());
  providerSel.addEventListener('change', () => {
    // Switching provider loads that provider's defaults (the key is kept per provider)
    const def = PROVIDERS[providerSel.value];
    fill({provider: providerSel.value, base: def.base, model: def.model, via: viaSel.value});
    persist();
  });
  for (const el of [baseInput, modelInput, viaSel]) el.addEventListener('change', persist);

  const decks = [...new Set(bunsoCards().map(c => c.deck))];
  $('#aiDeckSelect').innerHTML = '<option value="">全部科目</option>' + decks.map(d => `<option>${escapeHtml(d)}</option>`).join('');

  const keyInput = $('#aiKeyInput');
  function showKeyState() {
    const k = keyFor(providerSel.value);
    $('#aiKeyState').textContent = k ? `已保存（…${k.slice(-4)}）` : '未保存';
  }
  fill(cfg);
  $('#aiSaveKeyBtn').addEventListener('click', () => {
    const v = keyInput.value.trim();
    if (!v) return;
    writeText(`${KEY_PREFIX}-${providerSel.value}`, v);
    keyInput.value = '';
    showKeyState();
    setStatus('API Key 已保存在本浏览器。', 'ok');
  });
  $('#aiForgetKeyBtn').addEventListener('click', () => {
    writeText(`${KEY_PREFIX}-${providerSel.value}`, '');
    if (providerSel.value === 'anthropic') writeText(KEY_PREFIX, '');
    showKeyState();
    setStatus('已从本浏览器删除 API Key。');
  });
  $('#aiTestBtn').addEventListener('click', () => { persist(); testConnection(); });
  $('#aiRevisionsBtn').addEventListener('click', exportRevisions);
  $('#aiVerifyList').addEventListener('click', e => {
    const b = e.target.closest('[data-ai-decide]');
    if (!b) return;
    e.preventDefault();
    const id = b.dataset.card;
    if (decisions[id]?.action === b.dataset.aiDecide) delete decisions[id];
    else decisions[id] = {action: b.dataset.aiDecide, at: new Date().toISOString()};
    writeJson(DECISION_STORAGE, decisions);
    renderReport();
  });

  $('#aiRunPendingBtn').addEventListener('click', () => runVerification('pending'));
  $('#aiRunFlaggedBtn').addEventListener('click', () => runVerification('flagged'));
  $('#aiRunAllBtn').addEventListener('click', () => {
    if (confirm('将重新核验全部文综题，会再次产生 API 费用。继续吗？')) runVerification('all');
  });
  $('#aiStopBtn').addEventListener('click', () => {
    stopRequested = true;
    setStatus('正在停止（等待进行中的请求返回）…', 'warn');
  });
  $('#aiExportBtn').addEventListener('click', exportResults);
  $('#aiClearBtn').addEventListener('click', () => {
    if (!confirm('删除本浏览器中保存的全部 AI 核验结果？')) return;
    results = {};
    writeJson(RESULT_STORAGE, results);
    renderReport();
    window.dispatchEvent(new CustomEvent('eju-ai-verify-updated'));
  });
  for (const b of document.querySelectorAll('[data-ai-filter]')) {
    b.addEventListener('click', () => {
      reportFilter = b.dataset.aiFilter;
      document.querySelectorAll('[data-ai-filter]').forEach(x => x.classList.toggle('is-active', x === b));
      renderReport();
    });
  }
  syncButtons();
  renderReport();
}

// Lets the study view show the AI verdict for the card on screen
window.EJU_AI_VERIFY = {
  verdictFor(cardId) {
    const card = bunsoCards().find(c => c.id === cardId);
    const r = card && resultFor(card);
    return r ? {verdict: r.verdict, label: VERDICT_LABEL[r.verdict], summary: r.out?.summary || r.error || ''} : null;
  },
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
