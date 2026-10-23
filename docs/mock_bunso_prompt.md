# 任务书：「文综仿真卷」模考（与数学真题模考完全分开）

> **进度**：基础版已完成并合并（`mock_bunso.js`：开考页、考试页、倒计时自动交卷、刷新续考、日文优先「看不懂」、报告、错题入错题本、记录同步）。**还没做**：方案页成绩记录里数学/文综分两栏 + 正确率趋势图；「只含已核实」范围选项；手机宽度下导航 8 个标签的溢出检查；文综模考的 Playwright 测试没有存进仓库。接手的 agent 先读 `mock_bunso.js` 和下面的要求，补齐这些再说。

## 背景
仓库 `Nayukiiii/eju-sprint`（EJU 备考静态站，原生 JS，无构建，用户在中国访问，**禁止任何外部 CDN**）。
数学真题模考已完成：`mock.js`（路由 `mock`，页面 `#view-mock`，容器 `#mockRoot`，样式 `styles.css` 末尾 `.mock-*`）。**先完整读一遍 `mock.js`，文综模考照它的结构写，但必须是独立模块和独立入口，不要改坏数学模考。**

## 为什么不能和数学混在一起
- 数学：マーク式填空（`type:'mark'`，`blanks[{key,label,ans,len}]`），题目来自历年真题，按整回出卷。
- 文综：四选一选择题（`type:'mcq'`，字段 `q, choices[], a(正确选项下标), expl, trap, optExpl, q_cn, choices_cn`），题库里**没有真题**，全部是自编题，`source` 多为「未核实」。所以文综模考只能叫「仿真卷」，页面和报告里必须明确写「仿真卷，非真题」。
- 两者的题型、计时、答题方式、成绩口径都不同，因此分成两个入口、两个模块、两种记录（`state.mocks` 里用 `kind` 区分，见下）。

## 入口与文件
1. `index.html` 导航：把现有「模考」改名为「数学模考」（`data-route="mock"` 不变），新增「文综模考」`data-route="mockb"`，对应 `#view-mockb` / 容器 `#mockbRoot`；手机端 `nav-short` 用「数模」「文模」，并确认 390px 宽导航不换行溢出（可横向滚动）。
2. 新建 `mock_bunso.js`，导出 `window.EJU_MOCKB = {render}`；在 `app.js` 的 `switchRoute` 里加 `route === 'mockb'` 分支；`index.html` 与 `sw.js`（`ASSETS` 加文件、缓存版本号 +1）同步更新。
3. 可复用的 `window.EJU_APP` 接口：`getState / saveState / recordCardGrade / switchRoute / renderMath / today / openTutorCard / currentRoute`；不够用就在 `app.js` 末尾的 `window.EJU_APP` 里补，不要复制应用内部逻辑。

## 题库现状（`window.EJU_BANK` 里 `type==='mcq'` 的卡片，共 227 题）
deck 分布：条約35、旧地名18、政治37、経済41、地理34、歴史24、社会15、時事23。`deck` 就是学科/分组依据。
语言：`langMode`（bi 双语 / jp 日文优先 / cn）已存在，模考界面要支持「日文优先」——题干和选项先只显示日文，点「看不懂」才显示 `q_cn` / `choices_cn`，并调用 `recordLangHelp`（看 `app.js` 里的用法）把看不懂的题记下来。

## 功能要求
**开考页**：选择题量（20 / 38 / 自定义）、时长（默认按每题约 2 分 6 秒折算，38 题 = 80 分钟；可选不限时）、范围（全部 / 只含已核实 / 只含未做过的优先）、语言模式。抽题按 `deck` 比例分层随机，同一场不重复题，同一选项位置分布不要被固定（保持原选项顺序即可，不要打乱，因为 `a` 是下标，若打乱需同步映射）。
**考试页**：倒计时到 0 自动交卷；刷新后用 `startedAt` 继续（进行中的考试存 `localStorage` 键 `eju-mockb-run`，不要与数学的 `eju-mock-run` 冲突）；题号导航（已答/未答/待检查三种状态）、上一题/下一题、标记待检查、**考试中不显示对错也不显示解析**；选项可改选；快捷键 1–4 选择，左右方向键换题。
**交卷**：未答题数提示确认；评分每题 1 分。
**报告页**：总正确率；按 `deck` 的分科目正确率条；每题用时（找出最慢的 3 题）；错题列表（你的选项 / 正确选项 / `expl` / `trap`，用 `renderMath` 渲染）；「看不懂」使用次数；一键把错题加入错题本（`recordCardGrade(card,'again')`，答对的用 `'good'`）；一键把错题发给老师布置为作业（`window.EJU_HW.quickAssign(ids,title)`，仅当 `window.EJU_SYNC.isTeacher()` 或已入组时显示）。**不要换算成 EJU 的分数**，只显示题数和正确率，并写明原因。
**记录**：`state.mocks.push({mid, kind:'bunso', subject:'総合科目（仿真）', real:false, correct, total, byDeck:{deck:[对,总]}, wrongIds, spentMs, note, date, by})`。`mid` 用 `'b'+Date.now().toString(36)`。注意：数学的记录是 `real:true` 且含 `sitting`；`app.js` 的 `renderMocksList`（方案页「成绩记录」）和 `mock.js` 的 `recentRow` 都要改成按 `kind` 分别显示（文综显示「仿真卷 正确 x/y」），并确保 `sync.js` 的 `mock` 事件同步照常工作（它按 `mid` 去重）。
**首页入口**：今日页英雄区不必改；方案页成绩记录里数学与文综分两栏显示，各自最近 6 条，并各画一条正确率折线或小柱状图（纯 CSS/SVG，不用图表库）。

## 验收（提交前必须自己跑）
- Playwright（`PW=$(npm root -g)/playwright`，静态服务 `python3 -m http.server 8765`）走完整流程：开考 → 作答 → 刷新续考 → 日文优先下点「看不懂」→ 交卷 → 报告 → 错题进错题本 → 方案页记录；再让倒计时到 0 验证自动交卷（可临时把时长设成几秒）。
- 390px 手机宽度截图检查（导航、选项、报告都不能横向溢出）。
- 确认数学模考不受影响（`mock.js` 的流程仍通过）、控制台无报错。
- 不要改 `bank*.js` 的题目内容；不要引入构建工具或外部依赖。
- 提交到新分支并开 PR，说明里写清楚做了什么、没做什么。
