// AI 交叉核验（文综）：用 Claude 盲答每道総合科目题，与题库答案比对，结果只保存在本浏览器。
// The API key and all results live in this browser's localStorage; nothing is sent to our server.
import { Anthropic, jsonSchemaOutputFormat } from './vendor/anthropic-sdk.js';

const KEY_STORAGE = 'eju-ai-key';
const MODEL_STORAGE = 'eju-ai-model';
const RESULT_STORAGE = 'eju-ai-verify-v1';
const CONCURRENCY = 3;

// Per-1M-token prices, used only for the running cost estimate shown in the panel
const MODELS = {
  'claude-opus-5-5': {label: 'Claude Opus 5.5（推荐，最准）', input: 4, output: 20, fallbacks: true},
  'claude-sonnet-5-5': {label: 'Claude Sonnet 5.5（约一半价格）', input: 2, output: 10, fallbacks: true},
  'claude-haiku-5-5': {label: 'Claude Haiku 5.5（最便宜，准确度较低）', input: 0.1, output: 0.5, fallbacks: false},
};

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
async function verifyCard(client, model, card) {
  const question = [
    `問題：${card.q}`,
    ...card.choices.map((ch, i) => `${i + 1}. ${ch}`),
  ].join('\n');

  const params = {
    model,
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    output_config: {effort: 'medium', format: jsonSchemaOutputFormat(RESULT_SCHEMA)},
    messages: [{role: 'user', content: question}],
  };
  // Server-side fallback on a safety decline (not offered for Haiku)
  const response = MODELS[model].fallbacks
    ? await client.beta.messages.parse({...params, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default'})
    : await client.messages.parse(params);

  const usage = {input: response.usage?.input_tokens || 0, output: response.usage?.output_tokens || 0};
  if (response.stop_reason === 'refusal') {
    return {verdict: 'error', error: '模型拒绝回答此题', usage};
  }
  if (response.stop_reason === 'max_tokens' || !response.parsed_output) {
    return {verdict: 'error', error: '输出被截断或无法解析', usage};
  }
  const out = response.parsed_output;
  return {verdict: judge(card, out), out, usage, servedBy: response.model};
}

// ─── Run state ───
let running = false;
let stopRequested = false;
let session = {done: 0, total: 0, input: 0, output: 0};

function costOf(model, input, output) {
  const m = MODELS[model];
  return (input * m.input + output * m.output) / 1e6;
}

async function runVerification(scope) {
  const apiKey = readText(KEY_STORAGE);
  const model = readText(MODEL_STORAGE) || 'claude-opus-5-5';
  if (!apiKey) {
    setStatus('请先填写并保存 API Key。', 'warn');
    return;
  }
  const all = bunsoCards();
  const queue = all.filter(card => {
    const r = resultFor(card);
    if (scope === 'all') return true;
    if (scope === 'flagged') return r && r.verdict !== 'agree';
    return !r || r.verdict === 'stale' || r.verdict === 'error';
  });
  if (!queue.length) {
    setStatus(scope === 'flagged' ? '没有需要复核的题目。' : '全部题目都已核验过。如需重跑请选「全部重新核验」。', 'ok');
    return;
  }

  const client = new Anthropic({apiKey, dangerouslyAllowBrowser: true, maxRetries: 3});
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
        r = await verifyCard(client, model, card);
      } catch (err) {
        if (err instanceof Anthropic.AuthenticationError) {
          fatal = 'API Key 无效或已被撤销（401）。请检查后重新保存。';
        } else if (err instanceof Anthropic.PermissionDeniedError) {
          fatal = '这个 API Key 没有调用该模型的权限（403）。';
        } else if (err instanceof Anthropic.NotFoundError) {
          fatal = `找不到模型 ${model}（404）。`;
        } else if (err instanceof Anthropic.RateLimitError) {
          r = {verdict: 'error', error: '请求过于频繁（429），稍后可用「只核验未完成的」继续'};
        } else if (err instanceof Anthropic.APIConnectionError) {
          fatal = '连不上 api.anthropic.com。请检查网络，或服务器的 Content-Security-Policy 是否允许该域名。';
        } else if (err instanceof Anthropic.APIError) {
          r = {verdict: 'error', error: `API 错误 ${err.status || ''}：${err.message}`};
        } else {
          r = {verdict: 'error', error: String(err && err.message || err)};
        }
      }
      if (!r) continue;
      results[card.id] = {...r, fingerprint: cardFingerprint(card), model, at: new Date().toISOString()};
      writeJson(RESULT_STORAGE, results);
      session.done++;
      session.input += r.usage?.input || 0;
      session.output += r.usage?.output || 0;
      setStatus(`正在核验 ${session.done} / ${session.total} … 本次约 $${costOf(model, session.input, session.output).toFixed(2)}`);
      renderReport();
    }
  };
  await Promise.all(Array.from({length: CONCURRENCY}, worker));

  running = false;
  syncButtons();
  const spent = `本次用量：输入 ${session.input.toLocaleString()} / 输出 ${session.output.toLocaleString()} tokens，约 $${costOf(model, session.input, session.output).toFixed(2)}`;
  if (fatal) setStatus(`已停止：${fatal}`, 'bad');
  else if (stopRequested) setStatus(`已暂停（完成 ${session.done} / ${session.total}）。${spent}`, 'warn');
  else setStatus(`核验完成 ${session.done} 题。${spent}`, 'ok');
  window.dispatchEvent(new CustomEvent('eju-ai-verify-updated'));
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
  for (const id of ['aiRunPendingBtn', 'aiRunFlaggedBtn', 'aiRunAllBtn', 'aiClearBtn', 'aiSaveKeyBtn']) {
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
    <span class="ai-pill">未核验 ${c.none} / ${total}</span>`;

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
          <code>${escapeHtml(card.id)}</code>
          <span class="ai-q">${escapeHtml(card.q)}</span>
          ${out ? `<span class="ai-conf">把握：${{high: '高', medium: '中', low: '低'}[out.confidence]}</span>` : ''}
        </summary>
        <div class="ai-body">
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

function init() {
  const panel = $('#aiVerifyPanel');
  if (!panel) return;

  const modelSel = $('#aiModelSelect');
  modelSel.innerHTML = Object.entries(MODELS).map(([id, m]) => `<option value="${id}">${m.label}</option>`).join('');
  modelSel.value = readText(MODEL_STORAGE) || 'claude-opus-5-5';
  modelSel.addEventListener('change', () => writeText(MODEL_STORAGE, modelSel.value));

  const keyInput = $('#aiKeyInput');
  const showKeyState = () => {
    const k = readText(KEY_STORAGE);
    $('#aiKeyState').textContent = k ? `已保存（…${k.slice(-4)}）` : '未保存';
  };
  showKeyState();
  $('#aiSaveKeyBtn').addEventListener('click', () => {
    const v = keyInput.value.trim();
    if (!v) return;
    writeText(KEY_STORAGE, v);
    keyInput.value = '';
    showKeyState();
    setStatus('API Key 已保存在本浏览器。', 'ok');
  });
  $('#aiForgetKeyBtn').addEventListener('click', () => {
    writeText(KEY_STORAGE, '');
    showKeyState();
    setStatus('已从本浏览器删除 API Key。');
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
