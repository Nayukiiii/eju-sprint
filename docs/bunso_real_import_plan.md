# 文综真题导入方案（给接手的 agent 读）

## 现状
- 用户本机有 2005–2025 年文综（総合科目）真题 PDF 共 39 份，以及对应的答案 PDF 39 份，另有 2002–2004 的合订本。文件名如 `2005平成17年第1回文综.pdf` ↔ `2005平成17年第1回答案.pdf`；2024、2025 年只有一回，没有「第N回」。
- 这些 PDF 不在仓库里（太大）。仓库里目前的文综题库（`bank*.js`，227 题）全部是自编题，`source:"未核实"`，所以文综模考页只能叫「仿真卷」。**目标：把真题导入题库，标成「已核实」，让文综模考能按整回真题出卷。**
- 数学真题已按同样思路完成，可对照：`tools/math_src/*.js` → `tools/build_math_bank.js` → `bank_math_real.js`；数学模考 `mock.js`；文综仿真卷 `mock_bunso.js`。

## 实测结论（用 2023 第1回文综、第2回正解表这两份扫描件试过）
- PDF 是纯扫描件（没有文字层）。Tesseract 日文 OCR 对普通正文还行，但**选项编号 ①②③④、箭头 →、正解表的表格基本读不准**（例如 ①B→A→C 被读成「BAっC」，正解表读成乱码），个别页（有书脊阴影）整页是乱码。所以扫描件必须用 `--vision`（视觉模型逐页读图），Tesseract 只能当参考。
- 用户传来的两份文件**不是一对**：一份是 2023 第1回文综题卷，另一份是 2023 第2回正解表。需要同回的题卷和正解表才能核对答案。
- 每回约 25 页题卷、8 页正解表（正解表含日本語/理科/総合科目/数学四张表，只取「総合科目 Japan and the World」那张）。

## 分工
**用户在本机（Windows）做：转写草稿**
1. `pip install pymupdf pytesseract requests`；扫描件另装 Tesseract 和日文语言包 `jpn`。
2. `python tools/ocr_bunso.py "…\【1】文综真题" --answers "…\【2】文综答案" --out ocr_out --llm`（需 `DEEPSEEK_API_KEY`）。先只放 1–2 份 PDF 试跑，看结果再批量。建议优先 2019–2025（近年题型最接近考试）。
3. 脚本每份真题输出：`text.txt`、逐页 `pNN.png`、`draft.json`（题目草稿，`a` 优先取正解表，`aSource:"正解表"`）、`answers.json`、`report.md`（没有答案/依赖图表/重复题号清单）。
4. 把每回的 `draft.json`、`report.md` 和**需要核对的页图**放进仓库 `bunso_ocr/<年份-回>/`（页图用 `--dpi 120` 重新生成或压缩，单回不要超过几 MB），提交。

**agent 做：核对 → 生成题库 → 接进模考**
1. 读 `bunso_ocr/<回>/report.md`，按它列的疑点处理，再抽查其余题：对着页图核对题干、选项、答案（答案以官方正解表为准，不以 LLM 为准；答案与 `aFromQuestion` 不一致的一律以正解表为准并记录）。
2. 把核对好的题写成 `tools/bunso_src/<年份_回>.json`：
   `{id:"real-b-2024-1-12", source:"2024第1回 問12", deck:<学科>, topic, type:"mcq", q, choices[], a, auditStatus:"verified", auditNote:"题面按原卷转写，答案对照官方正解表", paperImg:"./papers_b/…png", ansImg, q_cn, choices_cn, expl, trap}`。`deck` 沿用现有分类（地理/歴史/政治/経済/社会/条約/旧地名/時事）；真题没有对应分类时按学科归入。
3. 写 `tools/build_bunso_bank.js`（仿 `build_math_bank.js`）生成 `bank_bunso_real.js`，并在 `index.html` / `sw.js`（`ASSETS` 加文件、缓存版本号 +1）里引入；页图放 `papers_b/`（只放题目页和正解表页，且压缩）。
4. 依赖图表/地图/年表的题：保留页图（`paperImg`），题干里写明「见原卷图」，模考页在这些题上默认展开原卷图。**不要凭 OCR 猜图表内容。**
5. 中文翻译 `q_cn`/`choices_cn`、解析 `expl`、易错 `trap`：可以后补（`tools/check_cn.js` 会检查完整性），但不要因此拖延真题上线；没有中文时模考的日文优先模式要能正常工作。
6. 改 `mock_bunso.js`：开考页增加「真题（按整回）/ 仿真卷（自编）」切换。真题模式下：按 `source` 的「YYYY第N回」归组，整回出卷、按原卷题号顺序、时长 80 分钟、报告按科目（地理/歴史/政治経済）出正确率，**不再写「非真题」**；仿真卷模式保持现状。`state.mocks` 记录里 `real:true` 与 `kind:'bunso'` 同时存在时，`app.js` 的 `renderMocksList` 和 `mock_bunso.js` 的记录行都要正确区分（真题 vs 仿真）。
7. 把核对过的真题的 `source` 不再是「未核实」，所以会自动计入掌握率——确认 `app.js` 里 `isUnverified` 的逻辑对这些卡片行为正确，并更新核验页的统计与文案。
8. 测试：仿照 `tools/tests/mockb.test.js` 写真题模式的 Playwright 测试；390px 手机宽度截图；`node tools/check_cn.js` 通过。完成后提交、开 PR，说明里写清楚导入了哪几回、哪些题因为图表题只带页图。

## 注意
- 不要把 PDF 原文件和大图提交进仓库；不引入外部 CDN。
- 脚本产物是「待核对」，没人对着原卷核对过的题不得标 `verified`。
- 答案以官方正解表为准；`draft.json` 里 `a:null` 的题必须手工补。
- 用户在中国使用，别加任何要访问境外资源的依赖。
- 进度写在本文件末尾「进度」一节，方便下一位接手。

## 进度
- [x] `tools/ocr_bunso.py`（含答案 PDF 配对）已写好，用假数据测过；真实 PDF 尚未跑。
- [ ] 用户跑脚本并提交 `bunso_ocr/`
- [ ] 核对并生成 `bank_bunso_real.js`
- [ ] 文综模考页加「真题 / 仿真卷」切换
