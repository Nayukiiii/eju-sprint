# 「刷真题 / 模考」功能 —— 给其他 agent 的任务书

仓库 `Nayukiiii/eju-sprint`（EJU 备考静态站，原生 JS，无构建）。先读 `app.js`（`state`、`recordCardGrade`、`switchRoute`、`window.EJU_APP`）、`homework.js`（独立模块写法范例）、`bank_math_real.js`（真题卡片：`blanks[{key,label,ans,len}]`、`source`、`paperImg`、`ansImg`）、`sync.js`（`state.mocks` 以 `kind:'mock'` 事件同步）。

## 目标：真正模拟 EJU 数学コース1
- 计时 80 分钟，倒计时，到 0 自动交卷；刷新页面后继续（用 `startedAt` 推算剩余时间）。
- 按原卷顺序出题：I問1 / I問2 / II / III / IV（用 `source` 里的 `YYYY第N回` 归组，沿用题库顺序）。
- マーク式答题卡：每空 `len` 个格子，键盘/软键盘只能填 `-` 和 `0-9`；考试中**不显示对错**；可跳题、可「待检查」标记、可随时看原卷图。
- 交卷后报告：正确空数 / 总空数、各大问正确率、每题用时、错题明细（你的答案 vs 正解）；错题进错题本（`recordCardGrade(card,'again')`）；可跳到讲题台看逐步解析；成绩写入 `state.mocks`（`{mid, subject:'数学コース1', real:true, sitting, correct, total, wrongIds, spentMs, note, date}`），在方案页成绩记录里显示。**不要编造 200 分制换算**，只显示空数和正确率。
- 老师角色能看到学生的模考记录，并可把错题一键布置为作业（`EJU_HW.quickAssign`）。

## 第二阶段：文综仿真卷
复用同一套考场界面（选择题版）：从文综题库按学科比例抽 38 题、80 分钟、交卷后出分科目正确率。页面必须明确标注「仿真卷，非真题」。

## 约束
- 不引外部 CDN（要在中国访问）；改动后更新 `sw.js` 的缓存版本号与 `ASSETS`。
- 不改 `bank_math_real.js`（由 `tools/build_math_bank.js` 生成）。
- 提交前用 Playwright 过一遍：开考→作答→刷新续考→交卷→报告→错题本，手机宽度 390px 也要检查。
