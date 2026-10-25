// 数学コース1 解法卡 + 公式闪卡（由 tools/build_method_cards.py 生成，请勿手改；改内容请改脚本再重新生成）
window.EJU_METHOD_CARDS = [
 {
  "id": "quad-interval",
  "ch": "2次関数",
  "title": "区间最值（定义域限制的最大・最小）",
  "topics": "区間|最大|最小|値域|最大値",
  "use": "$y=ax^2+bx+c$ 在 $m\\le x\\le n$ 上求最大/最小值，或已知最值反求 $a,b$。",
  "steps": [
   "求对称轴 $x=-\\dfrac{b}{2a}$，看开口：$a>0$ 向上，$a<0$ 向下。",
   "看对称轴在不在区间里。在 → 顶点就是一个极值（向上=最小，向下=最大）；不在 → 区间内单调，最值都在两个端点。",
   "另一个极值在端点：比较两端点到对称轴的距离，离轴远的端点值更极端。",
   "反求系数：每个「最值=某数」写成一条方程（顶点一条、端点一条），联立；别漏掉端点那条。",
   "解出后回代检验：顶点是否真在区间内、端点是否真是离轴远的那个。"
  ],
  "formulas": [
   "$x=-\\dfrac{b}{2a}$，顶点 $\\left(-\\dfrac{b}{2a},\\ c-\\dfrac{b^2}{4a}\\right)$"
  ],
  "traps": [
   "系数含文字时，$a>0$ 与 $a<0$ 要分开做，只做一种会丢分。",
   "对称轴在区间外时，顶点值不是最值。"
  ],
  "example": {
   "id": "real-2024-1-1",
   "text": "例（2024第1回 I问1）$y=ax^2-6ax+2b,\\ 1\\le x\\le4$，最大 6、最小 $-2$：轴 $x=3$ 在区间内，顶点 $(3,\\,-9a+2b)$。$a>0$：最小在顶点，$-9a+2b=-2$；离轴远的端点是 $x=1$，$-5a+2b=6$ ⇒ $a=2,\\ b=8$。$a<0$：最大在顶点 $-9a+2b=6$，最小在 $x=1$：$-5a+2b=-2$ ⇒ $a=-2,\\ b=-6$。"
  },
  "ex": [
   "real-2024-1-1",
   "real-2023-2-1",
   "real-2021-1-II2",
   "real-2021-2-1",
   "var-math-001"
  ]
 },
 {
  "id": "quad-shift",
  "ch": "2次関数",
  "title": "顶点・平移・对称移动",
  "topics": "平行移動|頂点|対称|軸方向|動く軸",
  "use": "配方求顶点；两条抛物线之间的平移/对称关系。",
  "steps": [
   "配方：$y=a(x-p)^2+q$，顶点 $(p,q)$。",
   "平移：向 $x$ 正方向 $s$、向 $y$ 正方向 $t$：顶点变成 $(p+s,\\ q+t)$，函数 $y-t=a(x-s-p)^2+q$。",
   "对称：关于 $x$ 轴 $y\\to -y$（$a$ 变号、顶点 $y$ 变号）；关于 $y$ 轴 $x\\to -x$（顶点 $x$ 变号）。",
   "两条抛物线 $|a|$ 相同 → 先看顶点怎么移，再看开口有没有翻转。"
  ],
  "formulas": [
   "$y=a(x-p)^2+q$，顶点 $(p,q)$",
   "平移 $(s,t)$：顶点 $(p+s,\\ q+t)$"
  ],
  "traps": [
   "向右平移 $s$ 是 $x\\to x-s$，不是 $x+s$。",
   "关于 $x$ 轴对称后 $a$ 变号，开口翻转。"
  ],
  "example": {
   "id": "real-2024-1-1",
   "text": "例（2024第1回 I问1 (4)）$f=2x^2-12x+16=2(x-3)^2-2$，$g=-2x^2+12x-12$。$-f=-2(x-3)^2+2$，而 $g=-2(x-3)^2+6$，所以 $g$ 是 $f$ 关于 $x$ 轴对称后再向 $y$ 轴方向平移 4。"
  },
  "ex": [
   "real-2024-1-1",
   "real-2025-1-1b",
   "real-2023-2-1",
   "real-2023-1-1",
   "real-2022-1-I1",
   "real-2021-2-1"
  ]
 },
 {
  "id": "quad-roots",
  "ch": "2次関数",
  "title": "判别式・解与系数・解的配置",
  "topics": "共有点|切り取|判別式|解の|実数解|x軸|2次方程式|線分の長さ",
  "use": "与 $x$ 轴交点个数、实数解条件、两解的符号或位置、截线段长。",
  "steps": [
   "判别式 $D=b^2-4ac$：$D>0$ 两交点，$D=0$ 相切，$D<0$ 无交点。",
   "解与系数：$\\alpha+\\beta=-\\dfrac ba,\\ \\alpha\\beta=\\dfrac ca$。",
   "解的配置（设 $a>0$）：两解都 $>k$：$D\\ge0$、轴 $>k$、$f(k)>0$；一个 $>k$ 一个 $<k$：$f(k)<0$；两正解：$D\\ge0$、$\\alpha+\\beta>0$、$\\alpha\\beta>0$；异号：$\\alpha\\beta<0$。",
   "截线段长：$|\\alpha-\\beta|=\\dfrac{\\sqrt D}{|a|}$。",
   "区间 $[m,n]$ 内有交点：单调时看端点符号 $f(m)f(n)\\le0$，否则轴、$D$、端点三样一起看。"
  ],
  "formulas": [
   "$D=b^2-4ac$",
   "$\\alpha+\\beta=-\\dfrac ba,\\ \\alpha\\beta=\\dfrac ca$",
   "$|\\alpha-\\beta|=\\dfrac{\\sqrt D}{|a|}$"
  ],
  "traps": [
   "解的配置别漏 $D\\ge0$，只写轴和 $f(k)$ 不够。",
   "「所有 $a$ 都有实数解」类题：把 $D\\ge0$ 当成关于 $a$ 的不等式再做。"
  ],
  "example": {
   "id": "real-2025-1-1a",
   "text": "例（2025第1回 I问1(1)）$y=3x^2+5x-2a$ 在 $2\\le x\\le5$ 与 $x$ 轴有公共点：轴 $x=-\\dfrac56$ 在区间左侧，区间内一路上升，所以 $f(2)\\le0$ 且 $f(5)\\ge0$，得 $11\\le a\\le50$。"
  },
  "ex": [
   "real-2025-1-1a",
   "real-2024-2-2",
   "real-2023-1-II2",
   "real-2022-2-II2",
   "real-2022-1-2b",
   "real-2022-2-I1",
   "var-math-002"
  ]
 },
 {
  "id": "quad-ineq",
  "ch": "2次関数",
  "title": "2次不等式与恒成立",
  "topics": "2次不等式|不等式：文字|包含関係|すべての",
  "use": "解 $ax^2+bx+c>0$（或 $<0$）；对所有实数 $x$ 恒成立的条件。",
  "steps": [
   "先化成 $a>0$ 的形式（负的两边乘 $-1$ 并反号）。",
   "解 $f(x)=0$ 得 $\\alpha<\\beta$。",
   "$f>0$ → $x<\\alpha$ 或 $x>\\beta$；$f<0$ → $\\alpha<x<\\beta$（含等号同理）。",
   "$D<0$：$f>0$ 恒成立，$f<0$ 无解；$D=0$：$f>0$ 的解是 $x\\ne\\alpha$。",
   "含文字系数：先单独看 $a=0$ 的情形，再看 $a\\ne0$。"
  ],
  "formulas": [
   "恒成立 $ax^2+bx+c>0$ ⇔ $a>0$ 且 $D<0$"
  ],
  "traps": [
   "乘以负数要反号；含文字系数时别忘了 $a=0$。",
   "两个不等式的解集有包含关系时，用数轴比较端点，端点取不取等要单独看。"
  ],
  "example": {
   "id": "var-math-003",
   "text": "例：对所有实数 $x$ 有 $x^2+kx+k+3>0$ ⇔ $D=k^2-4(k+3)<0$ ⇔ $-2<k<6$。"
  },
  "ex": [
   "real-2023-2-II2",
   "real-2023-1-II2",
   "var-math-003",
   "real-2025-2-2"
  ]
 },
 {
  "id": "expr-factor",
  "ch": "数と式",
  "title": "因数分解（含两个以上文字）",
  "topics": "因数分解|展開|循環小数",
  "use": "把含两三个文字的整式分解成两个一次式的积；再用它判断有理数/整数条件。",
  "steps": [
   "先提公因式。",
   "选次数最低的那个文字以外的文字，按这个文字降幂整理，其余字母当常数。",
   "常数项如果是另一个文字的式子，先把它分解，再配十字相乘。",
   "展开检验。",
   "有理数/整数的条件：分解后各因子分别满足条件。"
  ],
  "formulas": [
   "$(a\\pm b)^2=a^2\\pm2ab+b^2$",
   "$a^2-b^2=(a+b)(a-b)$",
   "$a^3\\pm b^3=(a\\pm b)(a^2\\mp ab+b^2)$"
  ],
  "traps": [
   "首项系数不是 1 时十字相乘要试因数对，先把系数写成因数表再试。",
   "常数项里含另一个文字时，别忘了它自己也要先分解。"
  ],
  "example": {
   "id": "real-2025-2-1a",
   "text": "例（2025第2回 II问1）$6x^2+5xy-6y^2+8x-y+2$：按 $x$ 降幂 $=6x^2+(5y+8)x-(3y+2)(2y-1)$，十字相乘得 $(2x+3y+2)(3x-2y+1)$。"
  },
  "ex": [
   "real-2025-2-1a",
   "real-2023-1-II1",
   "real-2023-2-2"
  ]
 },
 {
  "id": "expr-sqrt",
  "ch": "数と式",
  "title": "根号・有理化・整数部分与小数部分",
  "topics": "有理化|二重根号|整数部分|平方根|対称式|次数下げ",
  "use": "分母有理化、二重根号、整数部分/小数部分、对称式求值、根号大小比较。",
  "steps": [
   "分母 $\\sqrt a+\\sqrt b$：分子分母同乘共轭 $\\sqrt a-\\sqrt b$。",
   "二重根号：找两个数，和=$a+b$、积=$ab$，则 $\\sqrt{(a+b)+2\\sqrt{ab}}=\\sqrt a+\\sqrt b$（减号时取 $\\sqrt a-\\sqrt b$，$a>b$）。",
   "整数部分、小数部分：先夹逼 $n\\le x<n+1$，整数部分是 $n$，小数部分是 $x-n$。",
   "对称式：先求 $x+y$、$xy$，再用 $x^2+y^2=(x+y)^2-2xy$。",
   "比较大小：平方或作差。"
  ],
  "formulas": [
   "$\\dfrac{1}{\\sqrt a+\\sqrt b}=\\dfrac{\\sqrt a-\\sqrt b}{a-b}$",
   "$\\sqrt{(a+b)+2\\sqrt{ab}}=\\sqrt a+\\sqrt b$",
   "$x^2+y^2=(x+y)^2-2xy$"
  ],
  "traps": [
   "小数部分是 $x-n$，不是去掉小数点。",
   "二重根号里系数不是 2 时，先把根号外的数乘进去凑成「2√」的形式。"
  ],
  "example": {
   "id": "real-2022-1-2a",
   "text": "例：$\\sqrt{5+2\\sqrt6}$：和 5、积 6 的两数是 3 与 2，所以 $=\\sqrt3+\\sqrt2$；$\\dfrac1{\\sqrt3+\\sqrt2}=\\sqrt3-\\sqrt2$。"
  },
  "ex": [
   "real-2025-2-1b",
   "real-2022-1-2a",
   "real-2024-2-1",
   "real-2021-1-II1",
   "real-2021-2-2"
  ]
 },
 {
  "id": "ineq-abs",
  "ch": "数と式",
  "title": "绝对值与连立不等式",
  "topics": "絶対値|連立不等式|不等式：",
  "use": "含绝对值的不等式；多个不等式联立；整数解的个数。",
  "steps": [
   "$|x-a|<k\\iff a-k<x<a+k$；$|x-a|>k\\iff x<a-k$ 或 $x>a+k$（$k>0$）。",
   "绝对值里是式子：按零点分段（$x\\ge a$ 与 $x<a$）去掉绝对值，每段只在该段范围内成立。",
   "连立：各不等式的解画在同一条数轴上取共通部分。",
   "整数解个数：在数轴上标出边界，看端点取不取到。"
  ],
  "formulas": [
   "$|x-a|<k\\iff a-k<x<a+k$",
   "$|x-a|>k\\iff x<a-k\\ \\text{或}\\ x>a+k$"
  ],
  "traps": [
   "乘除负数要反号。",
   "分段后算出的解要和该段的范围取交集。"
  ],
  "example": {
   "id": "real-2022-2-1",
   "text": "例：$|x-2|<3$ ⇒ $-1<x<5$，整数解 $0,1,2,3,4$ 共 5 个。"
  },
  "ex": [
   "real-2025-2-2",
   "real-2022-2-1"
  ]
 },
 {
  "id": "geo-trig",
  "ch": "図形と計量",
  "title": "正弦・余弦定理与面积",
  "topics": "図形と計量|余弦定理|正弦定理|cos|角の二等分線|外接円|内接円|三角形",
  "use": "已知若干边、角，求其余的边、角、面积、外接/内切圆半径。",
  "steps": [
   "画图，把已知边、角、外接圆半径标上。",
   "两边夹角或三边：余弦定理；两角一边或对角对边：正弦定理。",
   "面积：$S=\\tfrac12bc\\sin A$；三边已知时先用余弦定理求 $\\cos A$，再 $\\sin A=\\sqrt{1-\\cos^2A}$，或用海伦公式。",
   "内切圆 $S=rs$（$s=\\tfrac{a+b+c}2$），外接圆 $R=\\dfrac{a}{2\\sin A}$。",
   "特殊角的值直接代入，别现算。"
  ],
  "formulas": [
   "$\\dfrac a{\\sin A}=\\dfrac b{\\sin B}=\\dfrac c{\\sin C}=2R$",
   "$a^2=b^2+c^2-2bc\\cos A$",
   "$S=\\tfrac12bc\\sin A=rs=\\dfrac{abc}{4R}$",
   "$\\sin15^\\circ=\\dfrac{\\sqrt6-\\sqrt2}4,\\ \\cos15^\\circ=\\dfrac{\\sqrt6+\\sqrt2}4$"
  ],
  "traps": [
   "由 $\\sin A$ 求角有两个可能（$A$ 与 $180^\\circ-A$），用大边对大角或内角和排除。",
   "$\\cos A<0$ 即钝角。"
  ],
  "example": {
   "id": "real-2023-2-4",
   "text": "例：$15^\\circ$ 可以用 $45^\\circ-30^\\circ$ 求：$\\sin15^\\circ=\\dfrac{\\sqrt6-\\sqrt2}4$，$\\cos15^\\circ=\\dfrac{\\sqrt6+\\sqrt2}4$。"
  },
  "ex": [
   "real-2025-4",
   "real-2024-4",
   "real-2023-2-4",
   "real-2021-1-4",
   "real-2021-2-4",
   "real-2022-1-4",
   "real-2023-1-4",
   "real-2023-2-4b",
   "real-2022-1-4b",
   "real-2021-1-4b",
   "real-2022-2-4",
   "var-math-004"
  ]
 },
 {
  "id": "geo-circle",
  "ch": "図形と計量",
  "title": "角平分线・内切圆・外接圆・圆内接四边形",
  "topics": "角の二等分線|内心|内接|接する|外接円|五角形|四角形",
  "use": "有圆（内切/外接）或角平分线的几何计算。",
  "steps": [
   "角平分线定理：$BD:DC=AB:AC$。",
   "内切圆：$r=\\dfrac{2S}{a+b+c}$；从顶点 $A$ 到切点的切线长 $=s-a$。",
   "外接圆：$R=\\dfrac a{2\\sin A}$。",
   "圆内接四边形：对角和 $180^\\circ$，所以 $\\cos C=-\\cos A$；在对角线两侧的两个三角形各用一次余弦定理联立。",
   "圆周角：同弧所对的圆周角相等，圆心角是圆周角的 2 倍。"
  ],
  "formulas": [
   "$BD:DC=AB:AC$",
   "$r=\\dfrac{2S}{a+b+c}$，切线长 $s-a$",
   "圆内接四边形：$\\cos C=-\\cos A$"
  ],
  "traps": [
   "切线长是 $s-a$（$a$ 是对边），不是 $s-b$。",
   "圆内接四边形里对角互补，所以两个余弦互为相反数。"
  ],
  "example": {
   "id": "real-2024-4",
   "text": "例：3-4-5 直角三角形：$S=6$，$r=\\dfrac{12}{12}=1$；直角顶点的切线长 $s-5=1$，与 $r$ 相等（因为是直角）。"
  },
  "ex": [
   "real-2024-4",
   "real-2024-4b",
   "real-2025-4b",
   "real-2023-1-4",
   "real-2022-1-4",
   "real-2021-1-4b"
  ]
 },
 {
  "id": "geo-props",
  "ch": "図形の性質",
  "title": "方べき・メネラウス・チェバ・接弦",
  "topics": "図形の性質|方べき|メネラウス|チェバ|接弦|接線",
  "use": "圆与割线/切线的线段乘积；三角形被直线截或三线共点时的线段比。",
  "steps": [
   "看到圆和两条割线（或割线+切线）：用方べきの定理。",
   "三角形被一条直线截：メネラウス，沿三角形走一圈写三个比的积 $=1$。",
   "三条线共点：チェバ，同样三个比的积 $=1$。",
   "求比：同高三角形的面积比等于底边比。"
  ],
  "formulas": [
   "弦/割线：$PA\\cdot PB=PC\\cdot PD$",
   "切线：$PT^2=PA\\cdot PB$",
   "メネラウス：$\\dfrac{AF}{FB}\\cdot\\dfrac{BD}{DC}\\cdot\\dfrac{CE}{EA}=1$",
   "重心：中线分成 $2:1$"
  ],
  "traps": [
   "メネラウス要沿同一个方向走一圈，每个比的分子分母别倒着写。",
   "方べき是 $PA\\cdot PB$ 的积，不是 $PA+PB$。"
  ],
  "example": {
   "id": "var-math-006",
   "text": "例：$PA=2,\\ PB=8$ 的割线，切线长 $PT=\\sqrt{PA\\cdot PB}=4$。"
  },
  "ex": [
   "var-math-006"
  ]
 },
 {
  "id": "count",
  "ch": "場合の数と確率",
  "title": "场合の数（排列组合・数字・涂色）",
  "topics": "場合の数|集合と場合|塗り分け|使えない数字",
  "use": "数个数：排列、组合、数字问题、涂色、相邻/不相邻。",
  "steps": [
   "先定「分类相加」还是「分步相乘」。",
   "有顺序用 $P$，无顺序用 $C$。",
   "受限制的位置先排（如首位不能为 0）；相邻用「捆绑」，不相邻用「插空」。",
   "「少なくとも」「…でない」：用余事象，总数减去不满足的。",
   "涂色/旋转：固定一个位置先涂，或「总数 ÷ 旋转数」（正四面体 12，立方体 24，只在每种涂法转后互不相同时可用）。"
  ],
  "formulas": [
   "${}_nP_r=\\dfrac{n!}{(n-r)!}$，${}_nC_r=\\dfrac{n!}{r!(n-r)!}$",
   "重复排列 $n^r$，圆排列 $(n-1)!$",
   "含相同物的排列 $\\dfrac{n!}{a!\\,b!\\,c!}$"
  ],
  "traps": [
   "区分「可重复」与「不可重复」。",
   "用对称性除法前，先确认没有转后重合的涂法。"
  ],
  "example": {
   "id": "real-2023-1-3",
   "text": "例：$_5P_2=20$，$_5C_2=10$；4 个字 AABB 的排列数 $\\dfrac{4!}{2!\\,2!}=6$。"
  },
  "ex": [
   "real-2023-1-3",
   "real-2023-2-I2"
  ]
 },
 {
  "id": "prob",
  "ch": "場合の数と確率",
  "title": "确率（加法・乘法・反复试行・条件付き）",
  "topics": "確率",
  "use": "等可能的事件概率、反复试行、条件付き确率、期望值。",
  "steps": [
   "先明确试验，并保证「所有结果等可能」（球、卡要当作有区别的）。",
   "把目标事件拆成互斥的几类。",
   "每一类里，按步骤相乘（独立事件）。",
   "各类相加；复杂时用余事象 $1-P(\\bar A)$。",
   "条件付き确率的分母是「条件事件的概率」，不是全体。"
  ],
  "formulas": [
   "$P(\\bar A)=1-P(A)$",
   "互斥：$P(A\\cup B)=P(A)+P(B)$；独立：$P(A\\cap B)=P(A)P(B)$",
   "反复试行：${}_nC_r\\,p^r(1-p)^{n-r}$",
   "$P(B|A)=\\dfrac{P(A\\cap B)}{P(A)}$，期望 $E=\\sum xP(x)$"
  ],
  "traps": [
   "分母分子要用同一种数法（都区分或都不区分）。",
   "反复试行：成功次数的位置有 $_nC_r$ 种，别漏。"
  ],
  "example": {
   "id": "real-2025-1-2",
   "text": "例：硬币投 3 次，恰好 2 次正面：${}_3C_2\\left(\\dfrac12\\right)^2\\cdot\\dfrac12=\\dfrac38$。"
  },
  "ex": [
   "real-2025-1-2",
   "real-2024-1-2",
   "real-2023-1-I2",
   "real-2022-2-I2",
   "real-2022-1-I2",
   "real-2021-1-I2"
  ]
 },
 {
  "id": "int-euclid",
  "ch": "整数の性質",
  "title": "最大公约数・互除法・一次不定方程式",
  "topics": "最大公約数|最小公倍数|不定方程式|互除法|一次不定",
  "use": "求 gcd/lcm；解 $ax+by=c$ 的整数解。",
  "steps": [
   "先求 $g=\\gcd(a,b)$，$g\\nmid c$ 则无整数解。",
   "互除法回代（或观察）得一组特解 $(x_0,y_0)$。",
   "写通解 $x=x_0+\\dfrac bgt,\\ y=y_0-\\dfrac agt$，再按范围取 $t$。",
   "用 $a(x-x_0)=-b(y-y_0)$ 的形式也行：利用互素性得出整除关系。",
   "两数问题：设 $a=gA,\\ b=gB$（$A,B$ 互素），$\\mathrm{lcm}=gAB$。"
  ],
  "formulas": [
   "$a=bq+r\\Rightarrow\\gcd(a,b)=\\gcd(b,r)$",
   "$ab=\\gcd(a,b)\\cdot\\mathrm{lcm}(a,b)$（两数）",
   "通解 $x=x_0+\\dfrac bgt,\\ y=y_0-\\dfrac agt$"
  ],
  "traps": [
   "别忘了先检查 $\\gcd\\mid c$。",
   "通解里 $t$ 前面的系数是除以 $g$ 后的数。"
  ],
  "example": {
   "id": "var-math-005",
   "text": "例：$5x+7y=1$ 一组特解 $(3,-2)$，通解 $x=3+7t,\\ y=-2-5t$。"
  },
  "ex": [
   "real-2024-3",
   "real-2023-2-3",
   "var-math-005"
  ]
 },
 {
  "id": "int-mod",
  "ch": "整数の性質",
  "title": "余数・倍数・n 进制・个数",
  "topics": "余り|進法|互いに素|割り切れない|整数：|整数部分",
  "use": "余数条件、倍数判定、n 进制互化、「…でも…でもない」的个数。",
  "steps": [
   "余数条件：设 $n=kq+r$，再代入其他条件。",
   "n 进制：先展开成十进制式子 $(abc)_n=an^2+bn+c$ 再列方程。",
   "个数：用包含排除，$k$ 的倍数在 $1\\sim N$ 里有 $\\lfloor N/k\\rfloor$ 个。",
   "分数式为整数：分离出整数部分，分母整除剩下的部分。"
  ],
  "formulas": [
   "$(abc)_n=an^2+bn+c$",
   "3、9 的倍数：数字和；4：末两位；11：奇数位数字和与偶数位数字和之差",
   "「3 でも 5 でも割り切れない」：$N-\\lfloor\\tfrac N3\\rfloor-\\lfloor\\tfrac N5\\rfloor+\\lfloor\\tfrac N{15}\\rfloor$"
  ],
  "traps": [
   "包含排除要加回「两个都满足」的重复部分。",
   "n 进制的各位数字必须小于 $n$。"
  ],
  "example": {
   "id": "real-2022-2-3",
   "text": "例：$1\\sim100$ 里不被 3 也不被 5 整除的有 $100-33-20+6=53$ 个。"
  },
  "ex": [
   "real-2022-2-3",
   "real-2022-1-3",
   "real-2021-1-3",
   "real-2025-3"
  ]
 },
 {
  "id": "set-prop",
  "ch": "集合と命題",
  "title": "集合・命题・充分必要条件",
  "topics": "集合|命題|包含関係|必要条件|十分条件",
  "use": "集合的个数、补集、命题的逆裏対偶、充分/必要条件。",
  "steps": [
   "把条件化成集合（解不等式得区间）。",
   "判断两个集合的包含关系。",
   "用数轴比较端点，端点取不取等要单独看。",
   "否定一个命题：找反例；证明可用对偶（与原命题等价）。"
  ],
  "formulas": [
   "$n(A\\cup B)=n(A)+n(B)-n(A\\cap B)$",
   "$\\overline{A\\cup B}=\\overline A\\cap\\overline B,\\ \\overline{A\\cap B}=\\overline A\\cup\\overline B$",
   "$p\\Rightarrow q$ 的对偶是 $\\bar q\\Rightarrow\\bar p$（与原命题同真假）"
  ],
  "traps": [
   "$p\\Rightarrow q$ 真：$p$ 是 $q$ 的充分条件，$q$ 是 $p$ 的必要条件；别说反。",
   "逆命题、裏命题与原命题不一定同真假。"
  ],
  "example": {
   "id": "real-2023-2-II2",
   "text": "例：$P=\\{x\\mid x>2\\}\\subset Q=\\{x\\mid x>1\\}$，所以 $x>2$ 是 $x>1$ 的充分条件。"
  },
  "ex": [
   "real-2023-2-II2"
  ]
 }
];
window.EJU_BANK = (window.EJU_BANK || []).concat([
 {
  "id": "fm-quad-interval-1",
  "deck": "公式",
  "topic": "数学1·2次関数",
  "type": "flip",
  "q": "二次函数 $y=ax^2+bx+c$ 的对称轴和顶点？",
  "back": "对称轴 $x=-\\dfrac{b}{2a}$；顶点 $\\left(-\\dfrac{b}{2a},\\ c-\\dfrac{b^2}{4a}\\right)$",
  "source": "解法卡",
  "mid": "quad-interval"
 },
 {
  "id": "fm-quad-interval-2",
  "deck": "公式",
  "topic": "数学1·2次関数",
  "type": "flip",
  "q": "区间最值第一步做什么？",
  "back": "先求对称轴并看开口，再看对称轴在不在区间里",
  "source": "解法卡",
  "mid": "quad-interval"
 },
 {
  "id": "fm-quad-interval-3",
  "deck": "公式",
  "topic": "数学1·2次関数",
  "type": "flip",
  "q": "$a>0$、对称轴在区间内：最大值在哪？",
  "back": "离对称轴更远的那个端点（最小值在顶点）",
  "source": "解法卡",
  "mid": "quad-interval"
 },
 {
  "id": "fm-quad-interval-4",
  "deck": "公式",
  "topic": "数学1·2次関数",
  "type": "flip",
  "q": "已知最大值、最小值，反求 $a,b$：怎么列式？",
  "back": "每个最值一条方程（顶点一条、远端点一条），联立；别漏端点那条",
  "source": "解法卡",
  "mid": "quad-interval"
 },
 {
  "id": "fm-quad-shift-1",
  "deck": "公式",
  "topic": "数学1·2次関数",
  "type": "flip",
  "q": "$y=a(x-p)^2+q$ 向右 $s$、向上 $t$ 平移后的顶点？",
  "back": "$(p+s,\\ q+t)$",
  "source": "解法卡",
  "mid": "quad-shift"
 },
 {
  "id": "fm-quad-shift-2",
  "deck": "公式",
  "topic": "数学1·2次関数",
  "type": "flip",
  "q": "抛物线关于 $x$ 轴对称，函数怎么变？",
  "back": "$y\\to -y$：$a$ 变号，顶点的 $y$ 坐标变号",
  "source": "解法卡",
  "mid": "quad-shift"
 },
 {
  "id": "fm-quad-shift-3",
  "deck": "公式",
  "topic": "数学1·2次関数",
  "type": "flip",
  "q": "抛物线关于 $y$ 轴对称，函数怎么变？",
  "back": "$x\\to -x$：顶点的 $x$ 坐标变号，$a$ 不变",
  "source": "解法卡",
  "mid": "quad-shift"
 },
 {
  "id": "fm-quad-roots-1",
  "deck": "公式",
  "topic": "数学1·2次関数",
  "type": "flip",
  "q": "$ax^2+bx+c=0$ 的判别式，以及它和解的个数的关系？",
  "back": "$D=b^2-4ac$：$D>0$ 两解，$D=0$ 重解，$D<0$ 无实数解",
  "source": "解法卡",
  "mid": "quad-roots"
 },
 {
  "id": "fm-quad-roots-2",
  "deck": "公式",
  "topic": "数学1·2次関数",
  "type": "flip",
  "q": "两个解的和与积？",
  "back": "$\\alpha+\\beta=-\\dfrac ba,\\ \\alpha\\beta=\\dfrac ca$",
  "source": "解法卡",
  "mid": "quad-roots"
 },
 {
  "id": "fm-quad-roots-3",
  "deck": "公式",
  "topic": "数学1·2次関数",
  "type": "flip",
  "q": "$a>0$，两个解都大于 $k$ 的条件？",
  "back": "$D\\ge0$，轴 $-\\dfrac b{2a}>k$，$f(k)>0$",
  "source": "解法卡",
  "mid": "quad-roots"
 },
 {
  "id": "fm-quad-roots-4",
  "deck": "公式",
  "topic": "数学1·2次関数",
  "type": "flip",
  "q": "抛物线被 $x$ 轴截下的线段有多长？",
  "back": "$|\\alpha-\\beta|=\\dfrac{\\sqrt D}{|a|}$",
  "source": "解法卡",
  "mid": "quad-roots"
 },
 {
  "id": "fm-quad-ineq-1",
  "deck": "公式",
  "topic": "数学1·2次関数",
  "type": "flip",
  "q": "$a>0$ 时 $ax^2+bx+c>0$ 的解（两根 $\\alpha<\\beta$）？",
  "back": "$x<\\alpha$ 或 $x>\\beta$",
  "source": "解法卡",
  "mid": "quad-ineq"
 },
 {
  "id": "fm-quad-ineq-2",
  "deck": "公式",
  "topic": "数学1·2次関数",
  "type": "flip",
  "q": "$a>0$ 时 $ax^2+bx+c<0$ 的解？",
  "back": "$\\alpha<x<\\beta$",
  "source": "解法卡",
  "mid": "quad-ineq"
 },
 {
  "id": "fm-quad-ineq-3",
  "deck": "公式",
  "topic": "数学1·2次関数",
  "type": "flip",
  "q": "$ax^2+bx+c>0$ 对所有实数 $x$ 成立的条件？",
  "back": "$a>0$ 且 $D<0$（系数含文字时先单独看 $a=0$）",
  "source": "解法卡",
  "mid": "quad-ineq"
 },
 {
  "id": "fm-expr-factor-1",
  "deck": "公式",
  "topic": "数学1·数と式",
  "type": "flip",
  "q": "$a^2-b^2$ 的因数分解？",
  "back": "$(a+b)(a-b)$",
  "source": "解法卡",
  "mid": "expr-factor"
 },
 {
  "id": "fm-expr-factor-2",
  "deck": "公式",
  "topic": "数学1·数と式",
  "type": "flip",
  "q": "$a^3+b^3$ 与 $a^3-b^3$ 的因数分解？",
  "back": "$a^3\\pm b^3=(a\\pm b)(a^2\\mp ab+b^2)$",
  "source": "解法卡",
  "mid": "expr-factor"
 },
 {
  "id": "fm-expr-factor-3",
  "deck": "公式",
  "topic": "数学1·数と式",
  "type": "flip",
  "q": "两个以上文字的因数分解，第一步？",
  "back": "按次数最低的文字以外的文字降幂整理，其余当常数，再十字相乘",
  "source": "解法卡",
  "mid": "expr-factor"
 },
 {
  "id": "fm-expr-sqrt-1",
  "deck": "公式",
  "topic": "数学1·数と式",
  "type": "flip",
  "q": "$\\dfrac{1}{\\sqrt a+\\sqrt b}$ 有理化？",
  "back": "$\\dfrac{\\sqrt a-\\sqrt b}{a-b}$",
  "source": "解法卡",
  "mid": "expr-sqrt"
 },
 {
  "id": "fm-expr-sqrt-2",
  "deck": "公式",
  "topic": "数学1·数と式",
  "type": "flip",
  "q": "$\\sqrt{(a+b)+2\\sqrt{ab}}$ 化简？",
  "back": "$\\sqrt a+\\sqrt b$（找和为 $a+b$、积为 $ab$ 的两个数）",
  "source": "解法卡",
  "mid": "expr-sqrt"
 },
 {
  "id": "fm-expr-sqrt-3",
  "deck": "公式",
  "topic": "数学1·数と式",
  "type": "flip",
  "q": "$x$ 的整数部分 $n$ 与小数部分？",
  "back": "$n\\le x<n+1$；小数部分 $=x-n$",
  "source": "解法卡",
  "mid": "expr-sqrt"
 },
 {
  "id": "fm-expr-sqrt-4",
  "deck": "公式",
  "topic": "数学1·数と式",
  "type": "flip",
  "q": "$x^2+y^2$ 怎样用 $x+y$、$xy$ 表示？",
  "back": "$(x+y)^2-2xy$",
  "source": "解法卡",
  "mid": "expr-sqrt"
 },
 {
  "id": "fm-ineq-abs-1",
  "deck": "公式",
  "topic": "数学1·数と式",
  "type": "flip",
  "q": "$|x-a|<k$ 的解？",
  "back": "$a-k<x<a+k$",
  "source": "解法卡",
  "mid": "ineq-abs"
 },
 {
  "id": "fm-ineq-abs-2",
  "deck": "公式",
  "topic": "数学1·数と式",
  "type": "flip",
  "q": "$|x-a|>k$ 的解？",
  "back": "$x<a-k$ 或 $x>a+k$",
  "source": "解法卡",
  "mid": "ineq-abs"
 },
 {
  "id": "fm-ineq-abs-3",
  "deck": "公式",
  "topic": "数学1·数と式",
  "type": "flip",
  "q": "绝对值里是一次式：怎么去掉？",
  "back": "按零点分段，每段只在该段范围内成立",
  "source": "解法卡",
  "mid": "ineq-abs"
 },
 {
  "id": "fm-geo-trig-1",
  "deck": "公式",
  "topic": "数学1·図形と計量",
  "type": "flip",
  "q": "余弦定理（求 $a$ 与求 $\\cos A$）？",
  "back": "$a^2=b^2+c^2-2bc\\cos A$；$\\cos A=\\dfrac{b^2+c^2-a^2}{2bc}$",
  "source": "解法卡",
  "mid": "geo-trig"
 },
 {
  "id": "fm-geo-trig-2",
  "deck": "公式",
  "topic": "数学1·図形と計量",
  "type": "flip",
  "q": "正弦定理？",
  "back": "$\\dfrac a{\\sin A}=\\dfrac b{\\sin B}=\\dfrac c{\\sin C}=2R$",
  "source": "解法卡",
  "mid": "geo-trig"
 },
 {
  "id": "fm-geo-trig-3",
  "deck": "公式",
  "topic": "数学1·図形と計量",
  "type": "flip",
  "q": "三角形面积的三种写法？",
  "back": "$S=\\tfrac12bc\\sin A=rs=\\dfrac{abc}{4R}$",
  "source": "解法卡",
  "mid": "geo-trig"
 },
 {
  "id": "fm-geo-trig-4",
  "deck": "公式",
  "topic": "数学1·図形と計量",
  "type": "flip",
  "q": "$\\sin15^\\circ$ 与 $\\cos15^\\circ$？",
  "back": "$\\dfrac{\\sqrt6-\\sqrt2}4$；$\\dfrac{\\sqrt6+\\sqrt2}4$",
  "source": "解法卡",
  "mid": "geo-trig"
 },
 {
  "id": "fm-geo-trig-5",
  "deck": "公式",
  "topic": "数学1·図形と計量",
  "type": "flip",
  "q": "$30^\\circ,45^\\circ,60^\\circ$ 的 $\\sin$ 值？",
  "back": "$\\dfrac12,\\ \\dfrac{\\sqrt2}2,\\ \\dfrac{\\sqrt3}2$（$\\cos$ 反过来）",
  "source": "解法卡",
  "mid": "geo-trig"
 },
 {
  "id": "fm-geo-circle-1",
  "deck": "公式",
  "topic": "数学1·図形と計量",
  "type": "flip",
  "q": "角平分线定理？",
  "back": "$BD:DC=AB:AC$",
  "source": "解法卡",
  "mid": "geo-circle"
 },
 {
  "id": "fm-geo-circle-2",
  "deck": "公式",
  "topic": "数学1·図形と計量",
  "type": "flip",
  "q": "内切圆半径与顶点的切线长？",
  "back": "$r=\\dfrac{2S}{a+b+c}$；顶点 $A$ 的切线长 $=s-a$",
  "source": "解法卡",
  "mid": "geo-circle"
 },
 {
  "id": "fm-geo-circle-3",
  "deck": "公式",
  "topic": "数学1·図形と計量",
  "type": "flip",
  "q": "圆内接四边形对角的余弦关系？",
  "back": "对角和 $180^\\circ$，$\\cos C=-\\cos A$",
  "source": "解法卡",
  "mid": "geo-circle"
 },
 {
  "id": "fm-geo-props-1",
  "deck": "公式",
  "topic": "数学1·図形の性質",
  "type": "flip",
  "q": "方べきの定理（割线与割线、割线与切线）？",
  "back": "$PA\\cdot PB=PC\\cdot PD$；$PT^2=PA\\cdot PB$",
  "source": "解法卡",
  "mid": "geo-props"
 },
 {
  "id": "fm-geo-props-2",
  "deck": "公式",
  "topic": "数学1·図形の性質",
  "type": "flip",
  "q": "メネラウスの定理？",
  "back": "$\\dfrac{AF}{FB}\\cdot\\dfrac{BD}{DC}\\cdot\\dfrac{CE}{EA}=1$（沿三角形走一圈）",
  "source": "解法卡",
  "mid": "geo-props"
 },
 {
  "id": "fm-geo-props-3",
  "deck": "公式",
  "topic": "数学1·図形の性質",
  "type": "flip",
  "q": "重心把中线分成的比？",
  "back": "$2:1$（顶点侧长）",
  "source": "解法卡",
  "mid": "geo-props"
 },
 {
  "id": "fm-count-1",
  "deck": "公式",
  "topic": "数学1·場合の数と確率",
  "type": "flip",
  "q": "排列 $_nP_r$ 与组合 $_nC_r$ 的公式？",
  "back": "$\\dfrac{n!}{(n-r)!}$；$\\dfrac{n!}{r!(n-r)!}$",
  "source": "解法卡",
  "mid": "count"
 },
 {
  "id": "fm-count-2",
  "deck": "公式",
  "topic": "数学1·場合の数と確率",
  "type": "flip",
  "q": "含相同物的排列公式？",
  "back": "$\\dfrac{n!}{a!\\,b!\\,c!}$（$a,b,c$ 为各相同物的个数）",
  "source": "解法卡",
  "mid": "count"
 },
 {
  "id": "fm-count-3",
  "deck": "公式",
  "topic": "数学1·場合の数と確率",
  "type": "flip",
  "q": "「少なくとも…」类题怎么算？",
  "back": "用余事象：总数减去「一个都没有」的个数",
  "source": "解法卡",
  "mid": "count"
 },
 {
  "id": "fm-count-4",
  "deck": "公式",
  "topic": "数学1·場合の数と確率",
  "type": "flip",
  "q": "数字问题（如首位不能为 0）先排哪一位？",
  "back": "先排受限制的位置",
  "source": "解法卡",
  "mid": "count"
 },
 {
  "id": "fm-prob-1",
  "deck": "公式",
  "topic": "数学1·場合の数と確率",
  "type": "flip",
  "q": "反复试行：$n$ 次中恰好 $r$ 次成功（概率 $p$）？",
  "back": "${}_nC_r\\,p^r(1-p)^{n-r}$",
  "source": "解法卡",
  "mid": "prob"
 },
 {
  "id": "fm-prob-2",
  "deck": "公式",
  "topic": "数学1·場合の数と確率",
  "type": "flip",
  "q": "条件付き确率 $P(B|A)$？",
  "back": "$\\dfrac{P(A\\cap B)}{P(A)}$（分母是条件事件的概率）",
  "source": "解法卡",
  "mid": "prob"
 },
 {
  "id": "fm-prob-3",
  "deck": "公式",
  "topic": "数学1·場合の数と確率",
  "type": "flip",
  "q": "独立事件同时发生的概率？互斥事件的和？",
  "back": "$P(A\\cap B)=P(A)P(B)$；$P(A\\cup B)=P(A)+P(B)$",
  "source": "解法卡",
  "mid": "prob"
 },
 {
  "id": "fm-prob-4",
  "deck": "公式",
  "topic": "数学1·場合の数と確率",
  "type": "flip",
  "q": "期望值的公式？",
  "back": "$E=\\sum x\\,P(x)$",
  "source": "解法卡",
  "mid": "prob"
 },
 {
  "id": "fm-int-euclid-1",
  "deck": "公式",
  "topic": "数学1·整数の性質",
  "type": "flip",
  "q": "互除法的原理？",
  "back": "$a=bq+r\\Rightarrow\\gcd(a,b)=\\gcd(b,r)$",
  "source": "解法卡",
  "mid": "int-euclid"
 },
 {
  "id": "fm-int-euclid-2",
  "deck": "公式",
  "topic": "数学1·整数の性質",
  "type": "flip",
  "q": "$ax+by=c$ 有整数解的条件？",
  "back": "$\\gcd(a,b)\\mid c$",
  "source": "解法卡",
  "mid": "int-euclid"
 },
 {
  "id": "fm-int-euclid-3",
  "deck": "公式",
  "topic": "数学1·整数の性質",
  "type": "flip",
  "q": "$ax+by=c$ 的通解（特解 $(x_0,y_0)$，$g=\\gcd$）？",
  "back": "$x=x_0+\\dfrac bgt,\\ y=y_0-\\dfrac agt$",
  "source": "解法卡",
  "mid": "int-euclid"
 },
 {
  "id": "fm-int-euclid-4",
  "deck": "公式",
  "topic": "数学1·整数の性質",
  "type": "flip",
  "q": "两数的积与 gcd、lcm 的关系？",
  "back": "$ab=\\gcd\\times\\mathrm{lcm}$",
  "source": "解法卡",
  "mid": "int-euclid"
 },
 {
  "id": "fm-int-mod-1",
  "deck": "公式",
  "topic": "数学1·整数の性質",
  "type": "flip",
  "q": "$(abc)_n$ 转成十进制？",
  "back": "$an^2+bn+c$",
  "source": "解法卡",
  "mid": "int-mod"
 },
 {
  "id": "fm-int-mod-2",
  "deck": "公式",
  "topic": "数学1·整数の性質",
  "type": "flip",
  "q": "$1\\sim N$ 里不被 3 也不被 5 整除的个数？",
  "back": "$N-\\lfloor\\tfrac N3\\rfloor-\\lfloor\\tfrac N5\\rfloor+\\lfloor\\tfrac N{15}\\rfloor$",
  "source": "解法卡",
  "mid": "int-mod"
 },
 {
  "id": "fm-int-mod-3",
  "deck": "公式",
  "topic": "数学1·整数の性質",
  "type": "flip",
  "q": "怎样判断一个数能否被 3、4、11 整除？",
  "back": "3：数字和；4：末两位；11：奇偶位数字和之差",
  "source": "解法卡",
  "mid": "int-mod"
 },
 {
  "id": "fm-set-prop-1",
  "deck": "公式",
  "topic": "数学1·集合と命題",
  "type": "flip",
  "q": "$n(A\\cup B)$ 怎么算？",
  "back": "$n(A)+n(B)-n(A\\cap B)$",
  "source": "解法卡",
  "mid": "set-prop"
 },
 {
  "id": "fm-set-prop-2",
  "deck": "公式",
  "topic": "数学1·集合と命題",
  "type": "flip",
  "q": "德摩根定律？",
  "back": "$\\overline{A\\cup B}=\\overline A\\cap\\overline B$；$\\overline{A\\cap B}=\\overline A\\cup\\overline B$",
  "source": "解法卡",
  "mid": "set-prop"
 },
 {
  "id": "fm-set-prop-3",
  "deck": "公式",
  "topic": "数学1·集合と命題",
  "type": "flip",
  "q": "$p\\Rightarrow q$ 成立：$p$ 是 $q$ 的什么条件？",
  "back": "充分条件（$q$ 是 $p$ 的必要条件）；对偶 $\\bar q\\Rightarrow\\bar p$ 同样成立",
  "source": "解法卡",
  "mid": "set-prop"
 }
]);

// ── 运行时：给数学题挂解法卡、给公式闪卡挂完整流程 ────────────────────────────────
(function () {
  const OPEN_KEY = 'eju-mcard-open';
  const METHODS = window.EJU_METHOD_CARDS || [];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const byId = id => METHODS.find(m => m.id === id);

  // 真题优先按 ex 清单对应；没列进清单的题再按 topic 正则匹配。最多 2 张。
  function matchFor(card) {
    if (!card) return [];
    const listed = METHODS.filter(m => m.ex.includes(card.id));
    const byTopic = METHODS.filter(m => !m.ex.includes(card.id) && new RegExp(m.topics).test(card.topic || ''));
    return [...listed, ...byTopic].slice(0, 2);
  }

  function isOpen() {
    try { return localStorage.getItem(OPEN_KEY) !== '0'; } catch (_) { return true; }
  }

  function bodyHtml(m, card, withExample) {
    const steps = m.steps.map(s => `<li>${esc(s)}</li>`).join('');
    const fs = m.formulas.map(f => `<span class="mc-f">${esc(f)}</span>`).join('');
    const traps = m.traps.map(t => `<li>${esc(t)}</li>`).join('');
    // 这道题本身就是卡里的例题时，题面上方不放答案（做完在解析里再看）
    const showEx = m.example && (withExample || !card || m.example.id !== card.id);
    return `<p class="mc-use">${esc(m.use)}</p>
      <ol class="mc-steps">${steps}</ol>
      <div class="mc-formulas">${fs}</div>
      <ul class="mc-traps">${traps}</ul>
      ${showEx ? `<p class="mc-ex">${esc(m.example.text)}</p>` : ''}`;
  }

  // 题面上方的解法卡（折叠状态记在 localStorage，默认展开）
  function htmlFor(card) {
    const ms = matchFor(card);
    if (!ms.length) return '';
    // 只有第一张按记住的状态展开，第二张默认折叠（两张都展开会把题面挤到一屏以下）
    return ms.map((m, i) => `<details class="mcard"${i === 0 ? ' data-primary="1"' : ''}${i === 0 && isOpen() ? ' open' : ''}>
      <summary><span class="mc-tag">解法卡</span>${esc(m.ch)} · ${esc(m.title)}</summary>
      ${bodyHtml(m, card, false)}
    </details>`).join('');
  }

  // 公式闪卡答完后显示完整流程
  function flowHtml(card) {
    const m = byId(card && card.mid);
    if (!m) return '';
    return `<details class="mc-flow"><summary>看完整解法卡：${esc(m.ch)} · ${esc(m.title)}</summary>${bodyHtml(m, card, true)}</details>`;
  }

  document.addEventListener('toggle', e => {
    const d = e.target;
    if (!d || !d.classList || !d.classList.contains('mcard') || !d.dataset.primary) return;
    try { localStorage.setItem(OPEN_KEY, d.open ? '1' : '0'); } catch (_) {}
  }, true);

  window.EJU_METHODS = {all: METHODS, byId, matchFor, htmlFor, flowHtml};
})();
