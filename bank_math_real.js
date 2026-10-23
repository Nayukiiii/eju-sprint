// EJU 数学コース1 历年真题（由 tools/build_math_bank.js 从 tools/math_src/ 生成，请勿手改）
// 题面逐字转写自原卷，答案逐空对照官方正解表；mtype = 题型（必拿分计划用）
window.EJU_BANK = (window.EJU_BANK || []).concat(
[
  {
    "id": "real-2025-1-1a",
    "source": "2025第1回 I問1(1)",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "2次関数：区間内でx軸と共有点",
    "type": "mark",
    "mtype": "quad",
    "level": "core",
    "paperImg": "./papers/2025_1_q_p03.png",
    "ansImg": "./papers/2025_1_q_p10.png",
    "q": "【2025第1回 I問1(1)】$a$ を定数とし，2次関数 $y = 3x^2 + 5x - 2a$ のグラフを $G$ とする。$G$ が $2 \\le x \\le 5$ の範囲で $x$ 軸と共有点をもつような $a$ の値の範囲を求めよう。$G$ の軸は直線 $x = -\\dfrac{\\text{[A]}}{\\text{[B]}}$ である。$f(x) = 3x^2 + 5x - 2a$ とおくと，求める条件は $f(\\text{[C]}) \\le 0$ かつ $f(\\text{[D]}) \\ge 0$ である。したがって $\\text{[EF]} \\le a \\le \\text{[GH]}$ である。",
    "q_cn": "【2025第1回 I问1(1)】$a$ 为常数，二次函数 $y = 3x^2 + 5x - 2a$ 的图象记为 $G$。求使 $G$ 在 $2 \\le x \\le 5$ 范围内与 $x$ 轴有公共点的 $a$ 的取值范围。$G$ 的对称轴是直线 $x = -\\dfrac{\\text{[A]}}{\\text{[B]}}$。设 $f(x) = 3x^2 + 5x - 2a$，所求条件为 $f(\\text{[C]}) \\le 0$ 且 $f(\\text{[D]}) \\ge 0$，因此 $\\text{[EF]} \\le a \\le \\text{[GH]}$。",
    "hint": "对称轴 x = −b/(2a)。对称轴在区间左边 → 区间内函数一路上升 → 只看两个端点：左端 ≦ 0，右端 ≧ 0。",
    "expl": "【步骤1：对称轴】\nx = −5/(2×3) = −5/6，所以 A=5，B=6。\n\n【步骤2：判断区间内的增减】\n开口向上，对称轴 x = −5/6 在区间 2 ≦ x ≦ 5 的左边，所以在这个区间里 f(x) 一直增大。\n\n【步骤3：一直增大的函数在区间内碰到 x 轴 ⇔ 左端 ≦ 0 且 右端 ≧ 0】\nf(2) ≦ 0 且 f(5) ≧ 0，所以 C=2，D=5。\n\n【步骤4：解不等式】\nf(2) = 12 + 10 − 2a = 22 − 2a ≦ 0 ⇒ a ≧ 11\nf(5) = 75 + 25 − 2a = 100 − 2a ≧ 0 ⇒ a ≦ 50\n所以 11 ≦ a ≦ 50，EF=11，GH=50。",
    "trap": "100 − 2a ≧ 0 解出来是 a ≦ 50（不是 25）。左端 ≦ 0、右端 ≧ 0 的方向别写反。",
    "variant": "如果对称轴落在区间里面，就要同时看「顶点 ≦ 0」和端点，情况会变多；这题对称轴在区间外，只看两端。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "B",
        "label": "[B]",
        "ans": "6",
        "len": 1
      },
      {
        "key": "C",
        "label": "[C]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "D",
        "label": "[D]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "EF",
        "label": "[EF]",
        "ans": "11",
        "len": 2
      },
      {
        "key": "GH",
        "label": "[GH]",
        "ans": "50",
        "len": 2
      }
    ],
    "ansSummary": "$\\text{A}=5,\\ \\text{B}=6,\\ \\text{C}=2,\\ \\text{D}=5,\\ \\text{EF}=11,\\ \\text{GH}=50$"
  },
  {
    "id": "real-2025-1-1b",
    "source": "2025第1回 I問1(2)",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "2次関数：x軸方向の平行移動",
    "type": "mark",
    "mtype": "quad",
    "level": "core",
    "paperImg": "./papers/2025_1_q_p03.png",
    "ansImg": "./papers/2025_1_q_p10.png",
    "q": "【2025第1回 I問1(2)】(1) の $G$ を $x$ 軸方向に $p$ だけ平行移動した放物線が，2 点 $(2,\\,0)$，$(5,\\,0)$ を通るとき，$p = \\dfrac{\\text{[IJ]}}{\\text{[K]}}$，$a = \\dfrac{\\text{[L]}}{\\text{[M]}}$ である。",
    "q_cn": "【2025第1回 I问1(2)】把 (1) 中的 $G$ 沿 $x$ 轴方向平移 $p$ 后得到的抛物线经过 $(2,\\,0)$，$(5,\\,0)$ 两点时，$p = \\dfrac{\\text{[IJ]}}{\\text{[K]}}$，$a = \\dfrac{\\text{[L]}}{\\text{[M]}}$。",
    "hint": "沿 x 轴平移：形状和高度都不变，只是整条抛物线左右滑动。所以「与 x 轴两个交点的距离」不变，对称轴移动了 p。",
    "expl": "【步骤1：平移后的抛物线】\n平移后经过 (2,0) 和 (5,0)，x² 的系数仍是 3，所以 y = 3(x − 2)(x − 5) = 3x² − 21x + 30。\n它的对称轴是 x = (2 + 5)/2 = 7/2。\n\n【步骤2：求 p（看对称轴移动了多少）】\n原来的对称轴是 x = −5/6，移动后是 x = 7/2。\np = 7/2 − (−5/6) = 21/6 + 5/6 = 26/6 = 13/3，所以 IJ=13，K=3。\n\n【步骤3：求 a（沿 x 轴平移，顶点的高度不变）】\n平移后的顶点 y 坐标：x = 7/2 代入 3(x − 2)(x − 5) = 3 × (3/2) × (−3/2) = −27/4。\n原来 G 的顶点 y 坐标：y = 3(x + 5/6)² − 25/12 − 2a，顶点高度 = −25/12 − 2a。\n−25/12 − 2a = −27/4 = −81/12 ⇒ 2a = 56/12 ⇒ a = 7/3，所以 L=7，M=3。",
    "trap": "只沿 x 轴平移时 y 方向不动，所以「顶点高度相同」是求 a 的关键；别把 y = 3(x−2)(x−5) 直接当成原来的 G。",
    "variant": "另一种做法：G 与 x 轴两交点的距离 = √(25 + 24a)/3，平移后距离是 5 − 2 = 3，所以 25 + 24a = 81，a = 7/3。",
    "blanks": [
      {
        "key": "IJ",
        "label": "[IJ]",
        "ans": "13",
        "len": 2
      },
      {
        "key": "K",
        "label": "[K]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "L",
        "label": "[L]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "M",
        "label": "[M]",
        "ans": "3",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{IJ}=13,\\ \\text{K}=3,\\ \\text{L}=7,\\ \\text{M}=3$"
  },
  {
    "id": "real-2025-1-2",
    "source": "2025第1回 I問2",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "確率：コインの取り合い",
    "type": "mark",
    "mtype": "prob",
    "level": "core",
    "paperImg": "./papers/2025_1_q_p04.png",
    "ansImg": "./papers/2025_1_q_p10.png",
    "q": "【2025第1回 I問2】1人が2枚のコイン，もう1人が1枚のコインをもっている。2人がコインをすべて投げ，表の数の多い方が相手から1枚のコインを取り，同数のときはそのまま（引き分け）とする試行をくり返し，どちらかが3枚のコインを得るまで続ける。(1) 1回の試行において，(i) コインを2枚もっている方が相手からコインを取る確率は $\\dfrac{\\text{[N]}}{\\text{[O]}}$，(ii) 1枚もっている方が相手からコインを取る確率は $\\dfrac{\\text{[P]}}{\\text{[Q]}}$，(iii) 引き分けになる確率は $\\dfrac{\\text{[R]}}{\\text{[S]}}$ である。(2) はじめに A さんが2枚，B さんが1枚もっているとする。2回目の試行で A さんが3枚のコインを得る確率は $\\dfrac{\\text{[T]}}{\\text{[UV]}}$，2回目の試行で B さんが3枚のコインを得る確率は $\\dfrac{\\text{[W]}}{\\text{[XY]}}$ である。",
    "q_cn": "【2025第1回 I问2】一人有 2 枚硬币，另一人有 1 枚。两人把手上的硬币全部抛出，正面多的一方从对方拿走 1 枚，正面数相同则不变（平局）。重复这个试验，直到某一方拿到 3 枚为止。(1) 一次试验中，(i) 持 2 枚的一方拿走对方硬币的概率为 $\\dfrac{\\text{[N]}}{\\text{[O]}}$，(ii) 持 1 枚的一方拿走对方硬币的概率为 $\\dfrac{\\text{[P]}}{\\text{[Q]}}$，(iii) 平局的概率为 $\\dfrac{\\text{[R]}}{\\text{[S]}}$。(2) 开始时 A 有 2 枚、B 有 1 枚。第 2 次试验时 A 拿到 3 枚的概率为 $\\dfrac{\\text{[T]}}{\\text{[UV]}}$，第 2 次试验时 B 拿到 3 枚的概率为 $\\dfrac{\\text{[W]}}{\\text{[XY]}}$。",
    "hint": "一共 3 枚硬币，2³ = 8 种结果，全部列出来最稳。算完 (1) 检查三个概率加起来是不是 1。",
    "expl": "【步骤1：列出一次试验的 8 种结果】\n持 2 枚的一方正面数：2（1/4），1（2/4），0（1/4）\n持 1 枚的一方正面数：1（1/2），0（1/2）\n\n【步骤2：(1) 三种情况】\n持 2 枚的赢：2 对 1、2 对 0、1 对 0 → (1×2 + 2×1)/8 = 4/8 = 1/2，N=1，O=2\n持 1 枚的赢：0 对 1 → 1/8，P=1，Q=8\n平局：1 对 1、0 对 0 → (2 + 1)/8 = 3/8，R=3，S=8\n检查：1/2 + 1/8 + 3/8 = 1。\n\n【步骤3：(2) A 在第 2 次拿到 3 枚】\nA 要在第 2 次赢，第 1 次只能是平局（A 仍有 2 枚），第 2 次 A（持 2 枚）赢：\n3/8 × 1/2 = 3/16，T=3，UV=16。\n（第 1 次 A 赢就在第 1 次结束；第 1 次 B 赢则 A 只剩 1 枚，第 2 次最多到 2 枚。）\n\n【步骤4：(2) B 在第 2 次拿到 3 枚】\nB 要先在第 1 次赢（变成 2 枚，概率 1/8），第 2 次 B 作为持 2 枚的一方再赢（1/2）：\n1/8 × 1/2 = 1/16，W=1，XY=16。",
    "trap": "第 2 次结束要求「第 1 次没结束」：A 第 1 次就赢的话游戏已经结束了，不能算进第 2 次。",
    "variant": "这类「重复试验到某人凑齐」的题，画一棵两层的树：第 1 层三种结果，只沿着还没结束的分支往下走。",
    "blanks": [
      {
        "key": "N",
        "label": "[N]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "O",
        "label": "[O]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "P",
        "label": "[P]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "Q",
        "label": "[Q]",
        "ans": "8",
        "len": 1
      },
      {
        "key": "R",
        "label": "[R]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "S",
        "label": "[S]",
        "ans": "8",
        "len": 1
      },
      {
        "key": "T",
        "label": "[T]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "UV",
        "label": "[UV]",
        "ans": "16",
        "len": 2
      },
      {
        "key": "W",
        "label": "[W]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "XY",
        "label": "[XY]",
        "ans": "16",
        "len": 2
      }
    ],
    "ansSummary": "$\\text{N}=1,\\ \\text{O}=2,\\ \\text{P}=1,\\ \\text{Q}=8,\\ \\text{R}=3,\\ \\text{S}=8,\\ \\text{T}=3,\\ \\text{UV}=16,\\ \\text{W}=1,\\ \\text{XY}=16$"
  },
  {
    "id": "real-2025-2-1a",
    "source": "2025第1回 II問1（前半）",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "数と式：2文字の因数分解",
    "type": "mark",
    "mtype": "expr",
    "level": "core",
    "paperImg": "./papers/2025_1_q_p05.png",
    "ansImg": "./papers/2025_1_q_p10.png",
    "q": "【2025第1回 II問1 前半】整式 $P = 6x^2 + 5xy - 6y^2 + 8x - y + 2$ について，まず $P$ を $x$ について降べきの順に整理すると $P = 6x^2 + (5y + 8)x - (\\text{[A]}y + \\text{[B]})(\\text{[C]}y - \\text{[D]})$ となる。したがって，$P$ を因数分解すると $P = (\\text{[E]}x + \\text{[A]}y + \\text{[B]})(\\text{[F]}x - \\text{[C]}y + \\text{[D]})$ ……① である。",
    "q_cn": "【2025第1回 II问1 前半】对整式 $P = 6x^2 + 5xy - 6y^2 + 8x - y + 2$，先按 $x$ 的降幂整理：$P = 6x^2 + (5y + 8)x - (\\text{[A]}y + \\text{[B]})(\\text{[C]}y - \\text{[D]})$。因此因式分解为 $P = (\\text{[E]}x + \\text{[A]}y + \\text{[B]})(\\text{[F]}x - \\text{[C]}y + \\text{[D]})$ ……①。",
    "hint": "把 x 当主角：先把不含 x 的项 −6y² − y + 2 因式分解，再对 x 做十字相乘。",
    "expl": "【步骤1：按 x 整理】\nP = 6x² + (5y + 8)x + (−6y² − y + 2)\n\n【步骤2：分解不含 x 的部分】\n−6y² − y + 2 = −(6y² + y − 2) = −(3y + 2)(2y − 1)，所以 A=3，B=2，C=2，D=1。\n\n【步骤3：对 x 十字相乘】\n要把 6x² + (5y + 8)x − (3y + 2)(2y − 1) 写成 (Ex + 3y + 2)(Fx − 2y + 1)：\nx² 的系数：E × F = 6\nx 的系数：E(−2y + 1) + F(3y + 2) = 5y + 8\n试 E=2，F=3：2(−2y + 1) + 3(3y + 2) = −4y + 2 + 9y + 6 = 5y + 8，正确。\n所以 P = (2x + 3y + 2)(3x − 2y + 1)，E=2，F=3。",
    "trap": "−6y² − y + 2 前面有负号，先整体提出 −1 再分解，最容易丢符号。",
    "variant": "检验因式分解：随便代 x=1，y=1，原式 6 + 5 − 6 + 8 − 1 + 2 = 14，分解后 (2+3+2)(3−2+1) = 7×2 = 14，一致。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "B",
        "label": "[B]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "C",
        "label": "[C]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "D",
        "label": "[D]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "E",
        "label": "[E]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "F",
        "label": "[F]",
        "ans": "3",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{A}=3,\\ \\text{B}=2,\\ \\text{C}=2,\\ \\text{D}=1,\\ \\text{E}=2,\\ \\text{F}=3$"
  },
  {
    "id": "real-2025-2-1b",
    "source": "2025第1回 II問1（後半）",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "数と式：分母の有理化と式の値",
    "type": "mark",
    "mtype": "expr",
    "level": "core",
    "paperImg": "./papers/2025_1_q_p05.png",
    "ansImg": "./papers/2025_1_q_p10.png",
    "q": "【2025第1回 II問1 後半】$P = 6x^2 + 5xy - 6y^2 + 8x - y + 2 = (2x + 3y + 2)(3x - 2y + 1)$ ……① とする。$x = \\dfrac{\\sqrt{5} - 3}{\\sqrt{5} + 1} = \\text{[G]} - \\sqrt{\\text{[H]}}$，$y = \\dfrac{\\sqrt{30} - \\sqrt{6} + 4}{\\sqrt{6} + \\sqrt{5} + 1} = \\dfrac{(\\sqrt{30} - \\sqrt{6} + 4)\\{\\sqrt{6} - (\\sqrt{5} + 1)\\}}{(\\sqrt{6} + \\sqrt{5} + 1)\\{\\sqrt{6} - (\\sqrt{5} + 1)\\}} = \\sqrt{\\text{[I]}} - \\text{[J]}$ である。これらを ① に代入して，$P = \\text{[K]} - \\text{[L]}\\sqrt{\\text{[M]}}$ を得る。",
    "q_cn": "【2025第1回 II问1 后半】已知 $P = (2x + 3y + 2)(3x - 2y + 1)$ ……①。$x = \\dfrac{\\sqrt{5} - 3}{\\sqrt{5} + 1} = \\text{[G]} - \\sqrt{\\text{[H]}}$，$y = \\dfrac{\\sqrt{30} - \\sqrt{6} + 4}{\\sqrt{6} + \\sqrt{5} + 1} = \\sqrt{\\text{[I]}} - \\text{[J]}$（分子分母同乘 $\\sqrt{6} - (\\sqrt{5} + 1)$）。代入 ① 得 $P = \\text{[K]} - \\text{[L]}\\sqrt{\\text{[M]}}$。",
    "hint": "有理化：分母是 √5 + 1 就乘 √5 − 1；三项的分母把 (√5 + 1) 看成一块，乘 √6 − (√5 + 1)。最后代入因式分解后的 ①，比代原式快得多。",
    "expl": "【步骤1：x 的有理化】\nx = (√5 − 3)(√5 − 1) / ((√5 + 1)(√5 − 1)) = (5 − √5 − 3√5 + 3)/4 = (8 − 4√5)/4 = 2 − √5\nG=2，H=5。\n\n【步骤2：y 的分母】\n(√6 + √5 + 1)(√6 − √5 − 1) = 6 − (√5 + 1)² = 6 − (6 + 2√5) = −2√5\n\n【步骤3：y 的分子】\n(√30 − √6 + 4)(√6 − √5 − 1)\n= √180 − √150 − √30 − 6 + √30 + √6 + 4√6 − 4√5 − 4\n= 6√5 − 5√6 − 6 + 5√6 − 4√5 − 4\n= 2√5 − 10\n\n【步骤4：y】\ny = (2√5 − 10)/(−2√5) = −1 + 10/(2√5) = −1 + √5，即 y = √5 − 1，I=5，J=1。\n\n【步骤5：代入 ①】\n2x + 3y + 2 = 4 − 2√5 + 3√5 − 3 + 2 = 3 + √5\n3x − 2y + 1 = 6 − 3√5 − 2√5 + 2 + 1 = 9 − 5√5\nP = (3 + √5)(9 − 5√5) = 27 − 15√5 + 9√5 − 25 = 2 − 6√5\nK=2，L=6，M=5。",
    "trap": "√180 = 6√5，√150 = 5√6，化简根号时把平方数提出来；分母是负数 −2√5，符号别丢。",
    "variant": "EJU 的「先因式分解，再代入带根号的数」是固定套路：代入分解后的两个括号，每个括号先化简，最后只乘一次。",
    "blanks": [
      {
        "key": "G",
        "label": "[G]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "H",
        "label": "[H]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "I",
        "label": "[I]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "J",
        "label": "[J]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "K",
        "label": "[K]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "L",
        "label": "[L]",
        "ans": "6",
        "len": 1
      },
      {
        "key": "M",
        "label": "[M]",
        "ans": "5",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{G}=2,\\ \\text{H}=5,\\ \\text{I}=5,\\ \\text{J}=1,\\ \\text{K}=2,\\ \\text{L}=6,\\ \\text{M}=5$"
  },
  {
    "id": "real-2025-2-2",
    "source": "2025第1回 II問2",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "不等式：2次不等式と絶対値の連立",
    "type": "mark",
    "mtype": "ineq",
    "level": "core",
    "paperImg": "./papers/2025_1_q_p06.png",
    "ansImg": "./papers/2025_1_q_p10.png",
    "q": "【2025第1回 II問2】$a$ は実数とする。$x$ に関する2つの不等式 $x^2 + 2x < 8$ ……①，$|a - 2 - x| < 3$ ……② を同時に満たす解が存在するような $a$ の範囲を求めよう。不等式①は $(x + \\text{[N]})(x - \\text{[O]}) < 0$ と表されるので $-\\text{[N]} < x < \\text{[O]}$。不等式②を解くと $\\text{[P]} < x < \\text{[Q]}$ となる。したがって，(i) $a \\le -\\text{[R]}$ のとき，①と②を同時に満たす解は存在しない。(ii) $-\\text{[R]} < a \\le \\text{[S]}$ のとき，解は $-\\text{[T]} < x < \\text{[Q]}$。(iii) $\\text{[S]} < a < \\text{[U]}$ のとき，解は $\\text{[P]} < x < \\text{[V]}$。(iv) $\\text{[U]} \\le a$ のとき，解は存在しない。以上より，解が存在する $a$ の範囲は $-\\text{[W]} < a < \\text{[X]}$。また，解の中に $x = 0$ が含まれない $a$ の範囲は $-\\text{[W]} < a \\le -\\text{[Y]}$，$\\text{[Z]} \\le a < \\text{[X]}$ である。（$\\text{[P]}$，$\\text{[Q]}$ は選択肢から選ぶ：⓪ $5-a$　① $3-a$　② $1-a$　③ $-1-a$　④ $-3-a$　⑤ $a-5$　⑥ $a-3$　⑦ $a-1$　⑧ $a+1$　⑨ $a+3$）",
    "q_cn": "【2025第1回 II问2】$a$ 为实数。求使关于 $x$ 的两个不等式 $x^2 + 2x < 8$ ……① 与 $|a - 2 - x| < 3$ ……② 有公共解的 $a$ 的范围。① 可写成 $(x + \\text{[N]})(x - \\text{[O]}) < 0$，即 $-\\text{[N]} < x < \\text{[O]}$。② 的解为 $\\text{[P]} < x < \\text{[Q]}$。(i) $a \\le -\\text{[R]}$ 时无公共解；(ii) $-\\text{[R]} < a \\le \\text{[S]}$ 时公共解为 $-\\text{[T]} < x < \\text{[Q]}$；(iii) $\\text{[S]} < a < \\text{[U]}$ 时为 $\\text{[P]} < x < \\text{[V]}$；(iv) $\\text{[U]} \\le a$ 时无公共解。所以有公共解的范围是 $-\\text{[W]} < a < \\text{[X]}$；公共解中不含 $x = 0$ 的范围是 $-\\text{[W]} < a \\le -\\text{[Y]}$，$\\text{[Z]} \\le a < \\text{[X]}$。（$\\text{[P]}$，$\\text{[Q]}$ 从选项中选：⓪ $5-a$　① $3-a$　② $1-a$　③ $-1-a$　④ $-3-a$　⑤ $a-5$　⑥ $a-3$　⑦ $a-1$　⑧ $a+1$　⑨ $a+3$）",
    "hint": "|A − x| < 3 就是「x 到 A 的距离小于 3」。两个区间画在一条数轴上，让第二个区间左右滑动，看什么时候重叠。",
    "expl": "【步骤1：解 ①】\nx² + 2x − 8 < 0 ⇒ (x + 4)(x − 2) < 0 ⇒ −4 < x < 2，N=4，O=2。\n\n【步骤2：解 ②】\n|a − 2 − x| = |x − (a − 2)| < 3 ⇒ a − 5 < x < a + 1\nP 选 ⑤（a − 5），Q 选 ⑧（a + 1）。\n\n【步骤3：区间 (a − 5, a + 1) 从左往右滑】\n(i) 右端 a + 1 ≦ −4，即 a ≦ −5：完全在 −4 左边，没有公共解，R=5。\n(ii) −5 < a ≦ 1：此时 a − 5 ≦ −4，公共部分是 −4 < x < a + 1，S=1，T=4。\n(iii) 1 < a < 7：a − 5 > −4 且 a + 1 > 2，公共部分是 a − 5 < x < 2，U=7，V=2。\n(iv) a ≧ 7：左端 a − 5 ≧ 2，没有公共解。\n\n【步骤4：有解的范围】\n−5 < a < 7，W=5，X=7。\n\n【步骤5：公共解不含 x = 0】\n(ii) 中 −4 < x < a + 1 不含 0 ⇔ a + 1 ≦ 0 ⇔ a ≦ −1 → −5 < a ≦ −1，Y=1\n(iii) 中 a − 5 < x < 2 不含 0 ⇔ a − 5 ≧ 0 ⇔ a ≧ 5 → 5 ≦ a < 7，Z=5",
    "trap": "P、Q 是选项编号（⑤、⑧），不是数字 5 和 1。开区间端点相等时没有公共部分，所以 a + 1 = −4 时也没有解（a ≦ −5 含等号）。",
    "variant": "「同时满足的整数 x 恰有 k 个」也是同样画数轴：固定 ① 的区间，滑动 ② 的区间数里面的整数。",
    "blanks": [
      {
        "key": "N",
        "label": "[N]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "O",
        "label": "[O]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "P",
        "label": "[P]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "Q",
        "label": "[Q]",
        "ans": "8",
        "len": 1
      },
      {
        "key": "R",
        "label": "[R]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "S",
        "label": "[S]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "T",
        "label": "[T]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "U",
        "label": "[U]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "V",
        "label": "[V]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "W",
        "label": "[W]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "X",
        "label": "[X]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "Y",
        "label": "[Y]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "Z",
        "label": "[Z]",
        "ans": "5",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{N}=4,\\ \\text{O}=2,\\ \\text{P}=5,\\ \\text{Q}=8,\\ \\text{R}=5,\\ \\text{S}=1,\\ \\text{T}=4,\\ \\text{U}=7,\\ \\text{V}=2,\\ \\text{W}=5,\\ \\text{X}=7,\\ \\text{Y}=1,\\ \\text{Z}=5$"
  },
  {
    "id": "real-2025-3",
    "source": "2025第1回 III",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "整数：分数式が整数になる条件",
    "type": "mark",
    "mtype": "int",
    "level": "core",
    "paperImg": "./papers/2025_1_q_p08.png",
    "ansImg": "./papers/2025_1_q_p10.png",
    "q": "【2025第1回 III】$P = \\dfrac{n^2 + 188n + 267}{n^2 + 3n + 2}$ が整数となるような自然数 $n$ をすべて求め，そのときの $P$ の値を求めよう。$P$ を変形すると $P = \\text{[A]} + \\dfrac{\\text{[BC]}}{n+1} + \\dfrac{\\text{[DEF]}}{n+2}$ である。$n+1$ と $n+2$ は互いに素であるから，$P$ が整数であるための必要十分条件は，$\\dfrac{\\text{[BC]}}{n+1}$ と $\\dfrac{\\text{[DEF]}}{n+2}$ がともに整数であることである。$\\text{[BC]}$ を素因数分解すると $\\text{[BC]} = \\text{[G]}^{\\text{[H]}} \\cdot \\text{[I]}$ であるから正の約数は $\\text{[JK]}$ 個。$\\text{[DEF]} = \\text{[L]} \\cdot \\text{[M]} \\cdot \\text{[N]}$（$\\text{[L]} < \\text{[M]} < \\text{[N]}$）であるから正の約数は $\\text{[O]}$ 個。これらを用いて調べると，$n$ は $\\text{[P]}$，$\\text{[Q]}$，$\\text{[RS]}$（$\\text{[P]} < \\text{[Q]}$）であり，$n = \\text{[P]}$ のとき $P = \\text{[TU]}$，$n = \\text{[Q]}$ のとき $P = \\text{[VW]}$，$n = \\text{[RS]}$ のとき $P = \\text{[XY]}$ である。",
    "q_cn": "【2025第1回 III】求使 $P = \\dfrac{n^2 + 188n + 267}{n^2 + 3n + 2}$ 为整数的所有自然数 $n$ 及对应的 $P$。变形得 $P = \\text{[A]} + \\dfrac{\\text{[BC]}}{n+1} + \\dfrac{\\text{[DEF]}}{n+2}$。$n+1$ 与 $n+2$ 互素，所以 $P$ 为整数的充要条件是两个分式都是整数。$\\text{[BC]} = \\text{[G]}^{\\text{[H]}} \\cdot \\text{[I]}$，正约数有 $\\text{[JK]}$ 个；$\\text{[DEF]} = \\text{[L]} \\cdot \\text{[M]} \\cdot \\text{[N]}$（$\\text{[L]} < \\text{[M]} < \\text{[N]}$），正约数有 $\\text{[O]}$ 个。由此 $n = \\text{[P]},\\ \\text{[Q]},\\ \\text{[RS]}$（$\\text{[P]} < \\text{[Q]}$），对应 $P = \\text{[TU]},\\ \\text{[VW]},\\ \\text{[XY]}$。",
    "hint": "分式先「拆」：分子减去分母的整数倍，剩下的部分分成 X/(n+1) + Y/(n+2)。然后 n+1 要整除 80，n+2 要整除 105，两张约数表对一对。",
    "expl": "【步骤1：拆成整数 + 两个分式】\n分子 − 分母 = (n² + 188n + 267) − (n² + 3n + 2) = 185n + 265，所以 A=1。\n设 X/(n+1) + Y/(n+2) = (185n + 265)/((n+1)(n+2))，即 X(n+2) + Y(n+1) = 185n + 265。\nn = −1：X = −185 + 265 = 80\nn = −2：−Y = −370 + 265 = −105 ⇒ Y = 105\nBC=80，DEF=105。\n\n【步骤2：约数个数】\n80 = 2⁴ × 5，约数个数 (4+1)(1+1) = 10，G=2，H=4，I=5，JK=10。\n105 = 3 × 5 × 7，约数个数 2×2×2 = 8，L=3，M=5，N=7，O=8。\n\n【步骤3：找 n（n 是自然数，所以 n+1 ≧ 2，n+2 ≧ 3）】\n105 的约数中 ≧ 3 的：3, 5, 7, 15, 21, 35, 105 → n = 1, 3, 5, 13, 19, 33, 103\n再看 n+1 是否整除 80：n+1 = 2, 4, 6, 14, 20, 34, 104 → 能整除 80 的只有 2, 4, 20\n所以 n = 1, 3, 19，P=1，Q=3，RS=19。\n\n【步骤4：代入求 P】\nn = 1：1 + 80/2 + 105/3 = 1 + 40 + 35 = 76\nn = 3：1 + 80/4 + 105/5 = 1 + 20 + 21 = 42\nn = 19：1 + 80/20 + 105/21 = 1 + 4 + 5 = 10\nTU=76，VW=42，XY=10。",
    "trap": "n 是自然数，所以 n+2 不能取 1，n+1 不能取 1；从约数较少的 105 一侧列举，再去 80 那边检查，最省时间。",
    "variant": "约数个数公式：N = p^a × q^b × r^c 时，正约数有 (a+1)(b+1)(c+1) 个。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "BC",
        "label": "[BC]",
        "ans": "80",
        "len": 2
      },
      {
        "key": "DEF",
        "label": "[DEF]",
        "ans": "105",
        "len": 3
      },
      {
        "key": "G",
        "label": "[G]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "H",
        "label": "[H]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "I",
        "label": "[I]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "JK",
        "label": "[JK]",
        "ans": "10",
        "len": 2
      },
      {
        "key": "L",
        "label": "[L]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "M",
        "label": "[M]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "N",
        "label": "[N]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "O",
        "label": "[O]",
        "ans": "8",
        "len": 1
      },
      {
        "key": "P",
        "label": "[P]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "Q",
        "label": "[Q]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "RS",
        "label": "[RS]",
        "ans": "19",
        "len": 2
      },
      {
        "key": "TU",
        "label": "[TU]",
        "ans": "76",
        "len": 2
      },
      {
        "key": "VW",
        "label": "[VW]",
        "ans": "42",
        "len": 2
      },
      {
        "key": "XY",
        "label": "[XY]",
        "ans": "10",
        "len": 2
      }
    ],
    "ansSummary": "$\\text{A}=1,\\ \\text{BC}=80,\\ \\text{DEF}=105,\\ \\text{G}=2,\\ \\text{H}=4,\\ \\text{I}=5,\\ \\text{JK}=10,\\ \\text{L}=3,\\ \\text{M}=5,\\ \\text{N}=7,\\ \\text{O}=8,\\ \\text{P}=1,\\ \\text{Q}=3,\\ \\text{RS}=19,\\ \\text{TU}=76,\\ \\text{VW}=42,\\ \\text{XY}=10$"
  },
  {
    "id": "real-2025-4",
    "source": "2025第1回 IV（前半）",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "図形と計量：余弦定理・面積・外接円・内接円",
    "type": "mark",
    "mtype": "geo",
    "level": "core",
    "paperImg": "./papers/2025_1_q_p09.png",
    "ansImg": "./papers/2025_1_q_p10.png",
    "q": "【2025第1回 IV 前半】$\\text{AB} = 3$，$\\text{BC} = 8$，$\\text{CA} = 7$ となる三角形 ABC を考える。$\\angle\\text{ABC} = \\text{[AB]}^\\circ$ であり，三角形 ABC の面積は $\\text{[C]}\\sqrt{\\text{[D]}}$，外接円の半径は $\\dfrac{\\text{[E]}\\sqrt{\\text{[F]}}}{\\text{[G]}}$，内接円の半径は $\\dfrac{\\text{[H]}\\sqrt{\\text{[I]}}}{\\text{[J]}}$ である。",
    "q_cn": "【2025第1回 IV 前半】考虑 $\\text{AB} = 3$，$\\text{BC} = 8$，$\\text{CA} = 7$ 的三角形 ABC。$\\angle\\text{ABC} = \\text{[AB]}^\\circ$，面积为 $\\text{[C]}\\sqrt{\\text{[D]}}$，外接圆半径为 $\\dfrac{\\text{[E]}\\sqrt{\\text{[F]}}}{\\text{[G]}}$，内切圆半径为 $\\dfrac{\\text{[H]}\\sqrt{\\text{[I]}}}{\\text{[J]}}$。",
    "hint": "三边已知的「全家桶」：余弦定理求角 → S = ½·ab·sinC → 正弦定理 a/sinA = 2R → S = ½·r·(a+b+c)。",
    "expl": "【步骤1：余弦定理求 ∠B】\n∠B 夹在 AB=3 和 BC=8 之间，对边 CA=7：\ncos B = (3² + 8² − 7²)/(2×3×8) = (9 + 64 − 49)/48 = 24/48 = 1/2 ⇒ ∠B = 60°，AB=60。\n\n【步骤2：面积】\nS = ½ × 3 × 8 × sin60° = 12 × √3/2 = 6√3，C=6，D=3。\n\n【步骤3：外接圆半径】\n2R = CA/sin B = 7 ÷ (√3/2) = 14/√3 ⇒ R = 7/√3 = 7√3/3，E=7，F=3，G=3。\n\n【步骤4：内切圆半径】\nS = ½ × r × (3 + 8 + 7) = 9r ⇒ 6√3 = 9r ⇒ r = 2√3/3，H=2，I=3，J=3。",
    "trap": "正弦定理用的是「角 B 的对边」CA = 7，不是 BC。分母有理化 7/√3 = 7√3/3。",
    "variant": "3, 7, 8 和 3, 5, 7 是 EJU 常用三角形：前者有 60°，后者最大角 120°。",
    "blanks": [
      {
        "key": "AB",
        "label": "[AB]",
        "ans": "60",
        "len": 2
      },
      {
        "key": "C",
        "label": "[C]",
        "ans": "6",
        "len": 1
      },
      {
        "key": "D",
        "label": "[D]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "E",
        "label": "[E]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "F",
        "label": "[F]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "G",
        "label": "[G]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "H",
        "label": "[H]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "I",
        "label": "[I]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "J",
        "label": "[J]",
        "ans": "3",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{AB}=60,\\ \\text{C}=6,\\ \\text{D}=3,\\ \\text{E}=7,\\ \\text{F}=3,\\ \\text{G}=3,\\ \\text{H}=2,\\ \\text{I}=3,\\ \\text{J}=3$"
  },
  {
    "id": "real-2025-4b",
    "source": "2025第1回 IV（後半）",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "図形と計量：円に内接する四角形",
    "type": "mark",
    "mtype": "geo",
    "level": "stretch",
    "paperImg": "./papers/2025_1_q_p09.png",
    "ansImg": "./papers/2025_1_q_p10.png",
    "q": "【2025第1回 IV 後半】$\\text{AB} = 3$，$\\text{BC} = 8$，$\\text{CA} = 7$，$\\angle\\text{ABC} = 60^\\circ$ の三角形 ABC の外接円の，点 B を含まない弧 AC 上に点 D をとり，線分 AC と線分 BD の交点を E とする。(1) 辺 AD と辺 BC が平行になる場合，$\\angle\\text{BCD} = \\text{[KL]}^\\circ$ となり，$\\text{AD} = \\text{[M]}$ である。したがって $\\text{AE} = \\dfrac{\\text{[NO]}}{\\text{[PQ]}}$ である。(2) 四角形 ABCD の面積が最大になる場合，$\\angle\\text{ADC} = 180^\\circ - 60^\\circ$ であることから $\\angle\\text{DAC} = \\text{[RS]}^\\circ$，$\\text{AD} = \\dfrac{\\text{[T]}\\sqrt{\\text{[U]}}}{\\text{[V]}}$ となる。したがって，$\\angle\\text{DBC} = \\text{[RS]}^\\circ$ より $\\text{AE} = \\dfrac{\\text{[WX]}}{\\text{[YZ]}}$ である。",
    "q_cn": "【2025第1回 IV 后半】在 $\\text{AB} = 3$，$\\text{BC} = 8$，$\\text{CA} = 7$，$\\angle\\text{ABC} = 60^\\circ$ 的三角形 ABC 的外接圆上，在不含 B 的弧 AC 上取点 D，AC 与 BD 交于 E。(1) AD ∥ BC 时，$\\angle\\text{BCD} = \\text{[KL]}^\\circ$，$\\text{AD} = \\text{[M]}$，所以 $\\text{AE} = \\dfrac{\\text{[NO]}}{\\text{[PQ]}}$。(2) 四边形 ABCD 面积最大时，由 $\\angle\\text{ADC} = 120^\\circ$ 得 $\\angle\\text{DAC} = \\text{[RS]}^\\circ$，$\\text{AD} = \\dfrac{\\text{[T]}\\sqrt{\\text{[U]}}}{\\text{[V]}}$；又 $\\angle\\text{DBC} = \\text{[RS]}^\\circ$，所以 $\\text{AE} = \\dfrac{\\text{[WX]}}{\\text{[YZ]}}$。",
    "hint": "圆内接四边形：对角互补；同弧所对的圆周角相等。AD ∥ BC 时是等腰梯形；面积最大时 D 在弧 AC 的正中间（AD = DC）。",
    "expl": "【步骤1：(1) 等腰梯形】\nAD ∥ BC 的圆内接四边形是等腰梯形，∠BCD = ∠ABC = 60°，KL=60，且 CD = AB = 3。\n从 A、D 向 BC 作垂线，两侧各截去 3 × cos60° = 3/2：\nAD = 8 − 3/2 − 3/2 = 5，M=5。\n\n【步骤2：(1) 求 AE】\nAD ∥ BC，所以 △AED ∽ △CEB，AE : EC = AD : BC = 5 : 8。\nAE = 7 × 5/13 = 35/13，NO=35，PQ=13。\n\n【步骤3：(2) 面积最大的位置】\nAC 固定，△ACD 的面积在 D 离 AC 最远时最大，也就是 D 在弧 AC 中点，AD = DC。\n∠ADC = 180° − 60° = 120°，等腰三角形 ADC 底角 ∠DAC = (180° − 120°)/2 = 30°，RS=30。\n\n【步骤4：(2) 求 AD】\nAD = (AC/2) ÷ cos30° = (7/2) ÷ (√3/2) = 7/√3 = 7√3/3，T=7，U=3，V=3。\n\n【步骤5：(2) 求 AE】\n∠DBC = ∠DAC = 30°（同弧 DC），而 ∠ABC = 60°，所以 BD 平分 ∠ABC。\n角平分线定理：AE : EC = BA : BC = 3 : 8 ⇒ AE = 7 × 3/11 = 21/11，WX=21，YZ=11。",
    "trap": "(2) 中 ∠DBC = ∠DAC 是「同一条弧 DC 上的圆周角」，看出 BD 是角平分线后直接用 3 : 8 分 AC。",
    "variant": "圆内接四边形的三件套：对角和 180°、同弧圆周角相等、托勒密定理（选学）。",
    "blanks": [
      {
        "key": "KL",
        "label": "[KL]",
        "ans": "60",
        "len": 2
      },
      {
        "key": "M",
        "label": "[M]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "NO",
        "label": "[NO]",
        "ans": "35",
        "len": 2
      },
      {
        "key": "PQ",
        "label": "[PQ]",
        "ans": "13",
        "len": 2
      },
      {
        "key": "RS",
        "label": "[RS]",
        "ans": "30",
        "len": 2
      },
      {
        "key": "T",
        "label": "[T]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "U",
        "label": "[U]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "V",
        "label": "[V]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "WX",
        "label": "[WX]",
        "ans": "21",
        "len": 2
      },
      {
        "key": "YZ",
        "label": "[YZ]",
        "ans": "11",
        "len": 2
      }
    ],
    "ansSummary": "$\\text{KL}=60,\\ \\text{M}=5,\\ \\text{NO}=35,\\ \\text{PQ}=13,\\ \\text{RS}=30,\\ \\text{T}=7,\\ \\text{U}=3,\\ \\text{V}=3,\\ \\text{WX}=21,\\ \\text{YZ}=11$"
  },
  {
    "id": "real-2024-1-1",
    "source": "2024第1回 I問1",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "2次関数：区間での最大・最小（係数に文字）",
    "type": "mark",
    "mtype": "quad",
    "level": "core",
    "paperImg": "./papers/2024_1_q_p04.png",
    "ansImg": "./papers/2024_1_q_p31.png",
    "q": "【2024第1回 I問1】2次関数 $y = ax^2 - 6ax + 2b$ の $1 \\le x \\le 4$ における最大値が $6$，最小値が $-2$ となるような $a$，$b$ を求めよう。(1) この2次関数のグラフの頂点の座標は $(\\text{[A]},\\ -\\text{[B]}a + \\text{[C]}b)$ である。(2) $a > 0$ の場合，$1 \\le x \\le 4$ において $x = \\text{[D]}$ のとき最大値，$x = \\text{[E]}$ のとき最小値をとるので，$a = \\text{[F]}$，$b = \\text{[G]}$ である。(3) $a < 0$ の場合，$x = \\text{[H]}$ のとき最大値，$x = \\text{[I]}$ のとき最小値をとるので，$a = \\text{[JK]}$，$b = \\text{[LM]}$ である。(4) (2) で求めた2次関数を $f(x)$，(3) で求めた2次関数を $g(x)$ とすると，$g(x)$ のグラフは $f(x)$ のグラフを $x$ 軸に関して対称移動し，$y$ 軸方向に $\\text{[N]}$ だけ平行移動したものである。",
    "q_cn": "【2024第1回 I问1】求使二次函数 $y = ax^2 - 6ax + 2b$ 在 $1 \\le x \\le 4$ 上最大值为 $6$、最小值为 $-2$ 的 $a$，$b$。(1) 顶点坐标为 $(\\text{[A]},\\ -\\text{[B]}a + \\text{[C]}b)$。(2) $a > 0$ 时，在 $x = \\text{[D]}$ 取最大值，$x = \\text{[E]}$ 取最小值，$a = \\text{[F]}$，$b = \\text{[G]}$。(3) $a < 0$ 时，在 $x = \\text{[H]}$ 取最大值，$x = \\text{[I]}$ 取最小值，$a = \\text{[JK]}$，$b = \\text{[LM]}$。(4) 设 (2) 的函数为 $f(x)$，(3) 的为 $g(x)$，则 $g(x)$ 的图象是把 $f(x)$ 的图象关于 $x$ 轴对称后，再沿 $y$ 轴方向平移 $\\text{[N]}$ 得到的。",
    "hint": "先把 a 提出来配方：对称轴是固定的 x = 3。区间 [1, 4] 包含 3，而 1 比 4 离对称轴远。",
    "expl": "【步骤1：配方】\ny = a(x² − 6x) + 2b = a(x − 3)² − 9a + 2b，顶点 (3, −9a + 2b)，A=3，B=9，C=2。\n\n【步骤2：比较端点】\n对称轴 x = 3 在区间 1 ≦ x ≦ 4 里面；x = 1 离 3 是 2，x = 4 离 3 是 1，所以 x = 1 更远。\n\n【步骤3：a > 0（开口向上）】\n最小值在顶点 x = 3，最大值在离得远的 x = 1，D=1，E=3。\n顶点：−9a + 2b = −2\nx = 1：a − 6a + 2b = −5a + 2b = 6\n两式相减：4a = 8 ⇒ a = 2，代回 2b = 16 ⇒ b = 8，F=2，G=8。\n\n【步骤4：a < 0（开口向下）】\n最大值在顶点 x = 3，最小值在 x = 1，H=3，I=1。\n−9a + 2b = 6，−5a + 2b = −2 ⇒ 4a = −8 ⇒ a = −2，2b = 6 − 18 = −12 ⇒ b = −6，JK=−2，LM=−6。\n\n【步骤5：(4) 两条抛物线的关系】\nf(x) = 2x² − 12x + 16，g(x) = −2x² + 12x − 12。\nf 关于 x 轴对称：y = −2x² + 12x − 16，再加 4 就是 g，N=4。",
    "trap": "JK = −2 要占两格：第一格涂「−」，第二格涂 2。a < 0 时最大值在顶点，不要套用 a > 0 的结论。",
    "variant": "如果对称轴含 a（如 y = x² − 2ax），就要按「轴在区间左边 / 中间 / 右边」分三种情况讨论。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "B",
        "label": "[B]",
        "ans": "9",
        "len": 1
      },
      {
        "key": "C",
        "label": "[C]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "D",
        "label": "[D]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "E",
        "label": "[E]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "F",
        "label": "[F]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "G",
        "label": "[G]",
        "ans": "8",
        "len": 1
      },
      {
        "key": "H",
        "label": "[H]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "I",
        "label": "[I]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "JK",
        "label": "[JK]",
        "ans": "-2",
        "len": 2
      },
      {
        "key": "LM",
        "label": "[LM]",
        "ans": "-6",
        "len": 2
      },
      {
        "key": "N",
        "label": "[N]",
        "ans": "4",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{A}=3,\\ \\text{B}=9,\\ \\text{C}=2,\\ \\text{D}=1,\\ \\text{E}=3,\\ \\text{F}=2,\\ \\text{G}=8,\\ \\text{H}=3,\\ \\text{I}=1,\\ \\text{JK}=-2,\\ \\text{LM}=-6,\\ \\text{N}=4$"
  },
  {
    "id": "real-2024-1-2",
    "source": "2024第1回 I問2",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "確率：色と数字のカード",
    "type": "mark",
    "mtype": "prob",
    "level": "core",
    "paperImg": "./papers/2024_1_q_p06.png",
    "ansImg": "./papers/2024_1_q_p31.png",
    "q": "【2024第1回 I問2】袋の中に，白いカードが2枚，赤いカードが3枚，青いカードが4枚，計9枚のカードが入っている。2枚の白いカードには 1，2 の数字が，3枚の赤いカードには 3，4，5 の数字が，4枚の青いカードには 6，7，8，9 の数字が1つずつ書かれている。その袋から3枚のカードを同時に取り出す。(1) 取り出された3枚のカードの色がすべて同じである確率は $\\dfrac{\\text{[O]}}{\\text{[PQ]}}$ である。また，3枚のカードの色がすべて異なる確率は $\\dfrac{\\text{[R]}}{\\text{[S]}}$ である。(2) 取り出された3枚のカードに書かれた数の和が 10 である確率は $\\dfrac{\\text{[T]}}{\\text{[UV]}}$ である。(3) 取り出された3枚のカードには，異なる色のカードが少なくとも2枚含まれていて，さらに偶数のカードが少なくとも1枚含まれている確率は $\\dfrac{\\text{[WX]}}{\\text{[YZ]}}$ である。",
    "q_cn": "【2024第1回 I问2】袋中有白卡 2 张（写 1，2）、红卡 3 张（写 3，4，5）、蓝卡 4 张（写 6，7，8，9），共 9 张。同时取出 3 张。(1) 3 张颜色全相同的概率为 $\\dfrac{\\text{[O]}}{\\text{[PQ]}}$；3 张颜色全不同的概率为 $\\dfrac{\\text{[R]}}{\\text{[S]}}$。(2) 3 张数字之和为 10 的概率为 $\\dfrac{\\text{[T]}}{\\text{[UV]}}$。(3) 3 张中至少有 2 种不同颜色，并且至少有 1 张偶数卡的概率为 $\\dfrac{\\text{[WX]}}{\\text{[YZ]}}$。",
    "hint": "分母固定：9C3 = 84。「至少」类的条件用反面：「至少两种颜色」= 全部 − 同色；「至少一张偶数」= 全部 − 全奇数。",
    "expl": "【步骤1：总数】\n9C3 = 84。\n\n【步骤2：(1) 同色】\n白只有 2 张，取不出 3 张；红 3C3 = 1，蓝 4C3 = 4，共 5 种 ⇒ 5/84，O=5，PQ=84。\n\n【步骤3：(1) 三种颜色各一张】\n2 × 3 × 4 = 24 ⇒ 24/84 = 2/7，R=2，S=7。\n\n【步骤4：(2) 和为 10】\n从 1〜9 中取 3 个不同的数，和为 10：(1,2,7)，(1,3,6)，(1,4,5)，(2,3,5)，共 4 种 ⇒ 4/84 = 1/21，T=1，UV=21。\n\n【步骤5：(3) 用反面数】\n「至少两种颜色」= 84 − 5 = 79 种。\n其中再去掉「三张全是奇数」的：奇数卡是 1，3，5，7，9 共 5 张，5C3 = 10 种；这 10 种都不是同色（同色的奇数卡最多 2 张），所以都在 79 种里面。\n79 − 10 = 69 ⇒ 69/84 = 23/28，WX=23，YZ=28。",
    "trap": "(3) 减去「全奇数」之前，要确认这些情况确实包含在「至少两种颜色」里，否则会多减。",
    "variant": "同时满足两个「至少」：先用第一个条件的反面缩小范围，再在里面用第二个条件的反面。",
    "blanks": [
      {
        "key": "O",
        "label": "[O]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "PQ",
        "label": "[PQ]",
        "ans": "84",
        "len": 2
      },
      {
        "key": "R",
        "label": "[R]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "S",
        "label": "[S]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "T",
        "label": "[T]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "UV",
        "label": "[UV]",
        "ans": "21",
        "len": 2
      },
      {
        "key": "WX",
        "label": "[WX]",
        "ans": "23",
        "len": 2
      },
      {
        "key": "YZ",
        "label": "[YZ]",
        "ans": "28",
        "len": 2
      }
    ],
    "ansSummary": "$\\text{O}=5,\\ \\text{PQ}=84,\\ \\text{R}=2,\\ \\text{S}=7,\\ \\text{T}=1,\\ \\text{UV}=21,\\ \\text{WX}=23,\\ \\text{YZ}=28$"
  },
  {
    "id": "real-2024-2-1",
    "source": "2024第1回 II問1",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "数と式：整数部分・小数部分と有理数の条件",
    "type": "mark",
    "mtype": "expr",
    "level": "core",
    "paperImg": "./papers/2024_1_q_p08.png",
    "ansImg": "./papers/2024_1_q_p31.png",
    "q": "【2024第1回 II問1】$3\\sqrt{5} + 2$ の整数部分を $a$，小数部分を $b$ とする。このとき，$\\dfrac{x}{b} + \\dfrac{b}{y} = a$ を満たす有理数 $x$，$y$ の値を求めよう。まず，$a$ と $b$ を求める。$\\text{[A]} < 3\\sqrt{5} < \\text{[A]} + 1$ であるから $a = \\text{[B]}$，$b = 3\\sqrt{5} - \\text{[C]}$ である。よって $\\dfrac{x}{b} + \\dfrac{b}{y} = \\dfrac{(xy + \\text{[D]})\\sqrt{5} + \\text{[E]}(xy - \\text{[F]})}{\\text{[G]}\\,y}$ となるが，この値が整数 $\\text{[B]}$ であるから，$xy + \\text{[D]} = \\text{[H]}$ かつ $xy - \\text{[F]} = \\text{[IJ]}\\,y$ が得られる。したがって $x = \\text{[K]}$，$y = -\\dfrac{\\text{[L]}}{\\text{[M]}}$ である。",
    "q_cn": "【2024第1回 II问1】设 $3\\sqrt{5} + 2$ 的整数部分为 $a$，小数部分为 $b$。求满足 $\\dfrac{x}{b} + \\dfrac{b}{y} = a$ 的有理数 $x$，$y$。由 $\\text{[A]} < 3\\sqrt{5} < \\text{[A]} + 1$ 得 $a = \\text{[B]}$，$b = 3\\sqrt{5} - \\text{[C]}$。于是 $\\dfrac{x}{b} + \\dfrac{b}{y} = \\dfrac{(xy + \\text{[D]})\\sqrt{5} + \\text{[E]}(xy - \\text{[F]})}{\\text{[G]}\\,y}$，它等于整数 $\\text{[B]}$，所以 $xy + \\text{[D]} = \\text{[H]}$ 且 $xy - \\text{[F]} = \\text{[IJ]}\\,y$。因此 $x = \\text{[K]}$，$y = -\\dfrac{\\text{[L]}}{\\text{[M]}}$。",
    "hint": "3√5 = √45，夹在 √36 和 √49 之间。「有理数 p, q 满足 p + q√5 = 0 ⇒ p = q = 0」是这题的钥匙。",
    "expl": "【步骤1：整数部分和小数部分】\n3√5 = √45，36 < 45 < 49 ⇒ 6 < 3√5 < 7，A=6。\n8 < 3√5 + 2 < 9 ⇒ a = 8，b = 3√5 + 2 − 8 = 3√5 − 6，B=8，C=6。\n\n【步骤2：x/b 的有理化】\n1/b = 1/(3√5 − 6) = (3√5 + 6)/(45 − 36) = (3√5 + 6)/9\n\n【步骤3：通分】\nx/b + b/y = x(3√5 + 6)/9 + (3√5 − 6)/y\n= [xy(3√5 + 6) + 9(3√5 − 6)] / (9y)\n= [3(xy + 9)√5 + 6(xy − 9)] / (9y)\n= [(xy + 9)√5 + 2(xy − 9)] / (3y)\nD=9，E=2，F=9，G=3。\n\n【步骤4：等于 8，比较有理部分和 √5 的系数】\n(xy + 9)√5 + 2(xy − 9) = 24y\nx, y 是有理数，所以 √5 的系数为 0：xy + 9 = 0，H=0；\n有理部分：2(xy − 9) = 24y ⇒ xy − 9 = 12y，IJ=12。\n\n【步骤5：解出 x, y】\nxy = −9 ⇒ −9 − 9 = 12y ⇒ y = −3/2，L=3，M=2\nx = −9/y = −9 ÷ (−3/2) = 6，K=6。",
    "trap": "b 是「原数 − 整数部分」= 3√5 + 2 − 8，别漏掉原来的 +2。",
    "variant": "凡是「有理数 x, y 满足 (…) + (…)√k = 0」，直接让两部分分别为 0，得到两个方程。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "6",
        "len": 1
      },
      {
        "key": "B",
        "label": "[B]",
        "ans": "8",
        "len": 1
      },
      {
        "key": "C",
        "label": "[C]",
        "ans": "6",
        "len": 1
      },
      {
        "key": "D",
        "label": "[D]",
        "ans": "9",
        "len": 1
      },
      {
        "key": "E",
        "label": "[E]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "F",
        "label": "[F]",
        "ans": "9",
        "len": 1
      },
      {
        "key": "G",
        "label": "[G]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "H",
        "label": "[H]",
        "ans": "0",
        "len": 1
      },
      {
        "key": "IJ",
        "label": "[IJ]",
        "ans": "12",
        "len": 2
      },
      {
        "key": "K",
        "label": "[K]",
        "ans": "6",
        "len": 1
      },
      {
        "key": "L",
        "label": "[L]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "M",
        "label": "[M]",
        "ans": "2",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{A}=6,\\ \\text{B}=8,\\ \\text{C}=6,\\ \\text{D}=9,\\ \\text{E}=2,\\ \\text{F}=9,\\ \\text{G}=3,\\ \\text{H}=0,\\ \\text{IJ}=12,\\ \\text{K}=6,\\ \\text{L}=3,\\ \\text{M}=2$"
  },
  {
    "id": "real-2024-2-2",
    "source": "2024第1回 II問2",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "2次方程式：解の符号と解の配置",
    "type": "mark",
    "mtype": "ineq",
    "level": "core",
    "paperImg": "./papers/2024_1_q_p10.png",
    "ansImg": "./papers/2024_1_q_p31.png",
    "q": "【2024第1回 II問2】$a$ は実数の定数とし，$f(x) = 2x^2 - 4ax + 2a^2 + a - 3$ とする。2次方程式 $f(x) = 0$ ……① について答えよ。(1) ① が異なる2つの実数解をもつような $a$ の値の範囲は $a < \\text{[N]}$ である。(2) ① が異なる2つの実数解をもち，それらがともに正であるような $a$ の範囲は $\\text{[O]} < a < \\text{[P]}$ である。(3) ① が異なる2つの実数解をもち，そのうち一方が正で他方が負であるような $a$ の範囲は $\\dfrac{\\text{[QR]}}{\\text{[S]}} < a < \\text{[T]}$ である。(4) ① が異なる2つの実数解をもち，そのうち一方が $0 < x < 2$ の範囲にあり，他方が $x > 2$ の範囲にあるような $a$ の範囲は $\\text{[U]} < a < \\dfrac{\\text{[V]}}{\\text{[W]}}$ である。",
    "q_cn": "【2024第1回 II问2】$a$ 为实常数，$f(x) = 2x^2 - 4ax + 2a^2 + a - 3$，考虑二次方程 $f(x) = 0$ ……①。(1) ① 有两个不同实数解的 $a$ 的范围是 $a < \\text{[N]}$。(2) ① 有两个不同实数解且都为正的范围是 $\\text{[O]} < a < \\text{[P]}$。(3) ① 有两个不同实数解且一正一负的范围是 $\\dfrac{\\text{[QR]}}{\\text{[S]}} < a < \\text{[T]}$。(4) ① 有两个不同实数解，一个在 $0 < x < 2$ 内、另一个在 $x > 2$ 内的范围是 $\\text{[U]} < a < \\dfrac{\\text{[V]}}{\\text{[W]}}$。",
    "hint": "根的位置题看三样：判别式、对称轴、端点函数值。「一正一负」只需 f(0) < 0；「一个在 (0,2)、一个在 (2,∞)」只需 f(0) > 0 且 f(2) < 0。",
    "expl": "【步骤1：(1) 判别式】\nD/4 = (2a)² − 2(2a² + a − 3) = −2a + 6 > 0 ⇒ a < 3，N=3。\n\n【步骤2：(2) 两根都正】\n对称轴 x = a > 0，且 f(0) = 2a² + a − 3 = (a − 1)(2a + 3) > 0 ⇒ a > 1 或 a < −3/2。\n与 a < 3、a > 0 合起来：1 < a < 3，O=1，P=3。\n\n【步骤3：(3) 一正一负】\n开口向上，只要 f(0) < 0：(a − 1)(2a + 3) < 0 ⇒ −3/2 < a < 1，QR=−3，S=2，T=1。\n（此时判别式自动为正。）\n\n【步骤4：(4) 一个在 (0, 2)，一个在 (2, ∞)】\n开口向上，只要 f(0) > 0 且 f(2) < 0。\nf(2) = 8 − 8a + 2a² + a − 3 = 2a² − 7a + 5 = (a − 1)(2a − 5) < 0 ⇒ 1 < a < 5/2\nf(0) > 0 ⇒ a > 1 或 a < −3/2\n合起来：1 < a < 5/2，U=1，V=5，W=2。",
    "trap": "QR = −3 占两格（−，3）。(3) 中 f(0) < 0 已经保证有两个不同实根，不用再算判别式。",
    "variant": "口诀：两根在同一侧 → 判别式 + 对称轴 + 端点；两根分在 k 两侧 → 只看 f(k) 的符号。",
    "blanks": [
      {
        "key": "N",
        "label": "[N]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "O",
        "label": "[O]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "P",
        "label": "[P]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "QR",
        "label": "[QR]",
        "ans": "-3",
        "len": 2
      },
      {
        "key": "S",
        "label": "[S]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "T",
        "label": "[T]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "U",
        "label": "[U]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "V",
        "label": "[V]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "W",
        "label": "[W]",
        "ans": "2",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{N}=3,\\ \\text{O}=1,\\ \\text{P}=3,\\ \\text{QR}=-3,\\ \\text{S}=2,\\ \\text{T}=1,\\ \\text{U}=1,\\ \\text{V}=5,\\ \\text{W}=2$"
  },
  {
    "id": "real-2024-3",
    "source": "2024第1回 III",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "整数：余りの条件と一次不定方程式",
    "type": "mark",
    "mtype": "int",
    "level": "core",
    "paperImg": "./papers/2024_1_q_p12.png",
    "ansImg": "./papers/2024_1_q_p31.png",
    "q": "【2024第1回 III】次の条件を満たす整数を考える。[条件] 3 で割り切れ，5 で割ると 3 余り，7 で割ると 4 余る。(1) 条件を満たす3桁の最小の自然数を求めよう。条件を満たす整数を $N$ とすれば，$N$ は $x,\\ y,\\ z$ を整数として $N = 3x$ ……①，$N = 5y + 3$ ……②，$N = 7z + 4$ ……③ と表される。①，② により $\\text{[A]}(x - \\text{[B]}) = \\text{[C]}\\,y$ であるから，$k$ を整数として $y = \\text{[D]}\\,k$ と表される。②，③ により $\\text{[E]}(z - \\text{[F]}) = 5(y - \\text{[G]})$ であるから，$\\ell$ を整数として $y = \\text{[H]}\\,\\ell + \\text{[I]}$ と表される。したがって $\\text{[H]}\\,\\ell + \\text{[I]} = \\text{[D]}\\,k$ であるから $\\text{[H]}\\,\\ell = \\text{[D]}(k - \\text{[J]})$ となる。よって，$m$ を整数として $k = \\text{[K]}\\,m + 1$ となる。② の $y$ に $\\text{[D]}\\,k$ を代入すれば $N = \\text{[LMN]}\\,m + \\text{[OP]}$ である。したがって，条件を満たす3桁の最小の自然数は $\\text{[QRS]}$ である。(2) 条件を満たす整数の中で 500 以下の自然数は $\\text{[T]}$ 個あり，そのうち一番大きい自然数は $\\text{[UVW]}$ である。",
    "q_cn": "【2024第1回 III】考虑满足条件「能被 3 整除，除以 5 余 3，除以 7 余 4」的整数。(1) 求满足条件的最小三位自然数。设 $N = 3x$ ……①，$N = 5y + 3$ ……②，$N = 7z + 4$ ……③（$x, y, z$ 为整数）。由 ①② 得 $\\text{[A]}(x - \\text{[B]}) = \\text{[C]}\\,y$，所以 $y = \\text{[D]}\\,k$（$k$ 为整数）。由 ②③ 得 $\\text{[E]}(z - \\text{[F]}) = 5(y - \\text{[G]})$，所以 $y = \\text{[H]}\\,\\ell + \\text{[I]}$。于是 $\\text{[H]}\\,\\ell = \\text{[D]}(k - \\text{[J]})$，得 $k = \\text{[K]}\\,m + 1$。代入 ② 得 $N = \\text{[LMN]}\\,m + \\text{[OP]}$，最小三位自然数为 $\\text{[QRS]}$。(2) 满足条件的 500 以下自然数有 $\\text{[T]}$ 个，其中最大的是 $\\text{[UVW]}$。",
    "hint": "两两联立，消掉 N，得到「a × (…) = b × (…)」，a 和 b 互素就能推出整除关系。最后 N 每 105（= 3×5×7）重复一次。",
    "expl": "【步骤1：① 和 ②】\n3x = 5y + 3 ⇒ 3(x − 1) = 5y，A=3，B=1，C=5。\n3 和 5 互素，所以 y 是 3 的倍数：y = 3k，D=3。\n\n【步骤2：② 和 ③】\n5y + 3 = 7z + 4 ⇒ 5y − 15 = 7z − 14 ⇒ 7(z − 2) = 5(y − 3)，E=7，F=2，G=3。\n7 和 5 互素，所以 y − 3 是 7 的倍数：y = 7ℓ + 3，H=7，I=3。\n\n【步骤3：合并两个 y】\n7ℓ + 3 = 3k ⇒ 7ℓ = 3(k − 1)，J=1。\n所以 k − 1 是 7 的倍数：k = 7m + 1，K=7。\n\n【步骤4：写出 N】\nN = 5y + 3 = 5 × 3(7m + 1) + 3 = 105m + 18，LMN=105，OP=18。\n验证 N = 18：18 = 3×6 ✓，18 = 5×3 + 3 ✓，18 = 7×2 + 4 ✓。\n最小三位数：m = 1 时 N = 123，QRS=123。\n\n【步骤5：(2) 500 以下】\n105m + 18 ≦ 500 ⇒ m ≦ 4.59…，自然数 N 对应 m = 0, 1, 2, 3, 4，共 5 个，T=5。\n最大的是 105 × 4 + 18 = 438，UVW=438。",
    "trap": "N = 18（m = 0）也是自然数，(2) 别漏数；但 m = −1 时 N 为负，不算。",
    "variant": "考场快法：列出「除以 7 余 4」的数 4, 11, 18, 25…，找第一个同时满足另外两个条件的 18，之后每次加 105。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "B",
        "label": "[B]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "C",
        "label": "[C]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "D",
        "label": "[D]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "E",
        "label": "[E]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "F",
        "label": "[F]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "G",
        "label": "[G]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "H",
        "label": "[H]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "I",
        "label": "[I]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "J",
        "label": "[J]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "K",
        "label": "[K]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "LMN",
        "label": "[LMN]",
        "ans": "105",
        "len": 3
      },
      {
        "key": "OP",
        "label": "[OP]",
        "ans": "18",
        "len": 2
      },
      {
        "key": "QRS",
        "label": "[QRS]",
        "ans": "123",
        "len": 3
      },
      {
        "key": "T",
        "label": "[T]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "UVW",
        "label": "[UVW]",
        "ans": "438",
        "len": 3
      }
    ],
    "ansSummary": "$\\text{A}=3,\\ \\text{B}=1,\\ \\text{C}=5,\\ \\text{D}=3,\\ \\text{E}=7,\\ \\text{F}=2,\\ \\text{G}=3,\\ \\text{H}=7,\\ \\text{I}=3,\\ \\text{J}=1,\\ \\text{K}=7,\\ \\text{LMN}=105,\\ \\text{OP}=18,\\ \\text{QRS}=123,\\ \\text{T}=5,\\ \\text{UVW}=438$"
  },
  {
    "id": "real-2024-4",
    "source": "2024第1回 IV (1)(2)",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "図形と計量：角の二等分線と余弦定理",
    "type": "mark",
    "mtype": "geo",
    "level": "core",
    "paperImg": "./papers/2024_1_q_p14.png",
    "ansImg": "./papers/2024_1_q_p31.png",
    "q": "【2024第1回 IV (1)(2)】三角形 ABC は $\\text{AB} = 4$，$\\text{BC} = 2$，$\\text{CA} = 3$ を満たしている。辺 BC の延長上に $\\angle\\text{CAD} = \\angle\\text{BAC}$ となるような点 D をとる。(1) 線分 AD の長さ $x$ と，線分 CD の長さ $y$ を求めよう。$\\cos\\angle\\text{BAC} = \\dfrac{\\text{[A]}}{\\text{[B]}}$ であるから，$x$，$y$ は関係式 $x^2 - y^2 - \\dfrac{\\text{[CD]}}{\\text{[E]}}x + \\text{[F]} = 0$ を満たす。さらに，$x$，$y$ は $x = \\text{[G]}\\,y$ を満たす。したがって，この2式より $x = \\text{[H]}$，$y = \\dfrac{\\text{[I]}}{\\text{[J]}}$ を得る。(2) 三角形 ABC と三角形 ABD の面積をそれぞれ $S_1$，$S_2$ とおき，内接円の半径をそれぞれ $r_1$，$r_2$ とおく。このとき $\\dfrac{r_2}{r_1} = \\dfrac{\\text{[K]}\\,S_2}{\\text{[L]}\\,S_1} = \\dfrac{\\text{[M]}}{\\text{[N]}}$ である。",
    "q_cn": "【2024第1回 IV (1)(2)】三角形 ABC 满足 $\\text{AB} = 4$，$\\text{BC} = 2$，$\\text{CA} = 3$。在 BC 的延长线上取点 D，使 $\\angle\\text{CAD} = \\angle\\text{BAC}$。(1) 设 $\\text{AD} = x$，$\\text{CD} = y$。$\\cos\\angle\\text{BAC} = \\dfrac{\\text{[A]}}{\\text{[B]}}$，所以 $x^2 - y^2 - \\dfrac{\\text{[CD]}}{\\text{[E]}}x + \\text{[F]} = 0$；又 $x = \\text{[G]}\\,y$，由此 $x = \\text{[H]}$，$y = \\dfrac{\\text{[I]}}{\\text{[J]}}$。(2) 设三角形 ABC、ABD 的面积为 $S_1$，$S_2$，内切圆半径为 $r_1$，$r_2$，则 $\\dfrac{r_2}{r_1} = \\dfrac{\\text{[K]}\\,S_2}{\\text{[L]}\\,S_1} = \\dfrac{\\text{[M]}}{\\text{[N]}}$。",
    "hint": "∠CAD = ∠BAC 说明 AC 平分 ∠BAD → 角平分线定理 BC : CD = AB : AD。内切圆半径 r = 2S / 周长。",
    "expl": "【步骤1：cos∠BAC】\ncos∠BAC = (4² + 3² − 2²)/(2×4×3) = 21/24 = 7/8，A=7，B=8。\n\n【步骤2：在 △ACD 中用余弦定理】\n∠CAD = ∠BAC，cos = 7/8：\ny² = 3² + x² − 2 × 3 × x × 7/8 = x² − (21/4)x + 9\n⇒ x² − y² − (21/4)x + 9 = 0，CD=21，E=4，F=9。\n\n【步骤3：角平分线定理】\nAC 平分 ∠BAD，所以 AB : AD = BC : CD ⇒ 4 : x = 2 : y ⇒ x = 2y，G=2。\n\n【步骤4：联立，并排除假解】\n代入：4y² − y² − (21/2)y + 9 = 0 ⇒ 2y² − 7y + 6 = 0 ⇒ (2y − 3)(y − 2) = 0 ⇒ y = 3/2 或 y = 2。\n若 y = 2，则 x = 4，△ACD 与 △ACB 三边相同（3, 4, 2），D 就是 B 关于 AC 的对称点，不在直线 BC 上，舍去。\n（也可以用 ∠ACD = 180° − ∠ACB 检验：cos∠ACB = (9 + 4 − 16)/12 = −1/4，所以 cos∠ACD = 1/4，只有 y = 3/2 满足。）\n所以 x = 3，y = 3/2，H=3，I=3，J=2。\n\n【步骤5：(2) 内切圆半径之比】\nr = 2S / 周长。△ABC 周长 4 + 2 + 3 = 9；△ABD 周长 4 + (2 + 3/2) + 3 = 21/2。\nr₂/r₁ = (2S₂ ÷ 21/2)/(2S₁ ÷ 9) = 9S₂/((21/2)S₁) = 6S₂/(7S₁)，K=6，L=7。\n两个三角形同高（从 A 到直线 BD），S₂/S₁ = BD/BC = (7/2)/2 = 7/4。\nr₂/r₁ = 6/7 × 7/4 = 3/2，M=3，N=2。",
    "trap": "二次方程有两个解时，要回到图形检验：D 必须在 BC 的延长线上。",
    "variant": "共顶点、底边在同一直线上的两个三角形，面积比 = 底边比。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "B",
        "label": "[B]",
        "ans": "8",
        "len": 1
      },
      {
        "key": "CD",
        "label": "[CD]",
        "ans": "21",
        "len": 2
      },
      {
        "key": "E",
        "label": "[E]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "F",
        "label": "[F]",
        "ans": "9",
        "len": 1
      },
      {
        "key": "G",
        "label": "[G]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "H",
        "label": "[H]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "I",
        "label": "[I]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "J",
        "label": "[J]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "K",
        "label": "[K]",
        "ans": "6",
        "len": 1
      },
      {
        "key": "L",
        "label": "[L]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "M",
        "label": "[M]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "N",
        "label": "[N]",
        "ans": "2",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{A}=7,\\ \\text{B}=8,\\ \\text{CD}=21,\\ \\text{E}=4,\\ \\text{F}=9,\\ \\text{G}=2,\\ \\text{H}=3,\\ \\text{I}=3,\\ \\text{J}=2,\\ \\text{K}=6,\\ \\text{L}=7,\\ \\text{M}=3,\\ \\text{N}=2$"
  },
  {
    "id": "real-2024-4b",
    "source": "2024第1回 IV (3)",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "図形と計量：2つの内心を結ぶ線分",
    "type": "mark",
    "mtype": "geo",
    "level": "stretch",
    "paperImg": "./papers/2024_1_q_p15.png",
    "ansImg": "./papers/2024_1_q_p31.png",
    "q": "【2024第1回 IV (3)】（$\\text{AB} = 4$，$\\text{BC} = 2$，$\\text{CA} = 3$，$\\text{AD} = 3$，$\\text{CD} = \\dfrac{3}{2}$，$\\dfrac{r_2}{r_1} = \\dfrac{3}{2}$）三角形 ABC と三角形 ABD の内心をそれぞれ $\\text{I}_1$，$\\text{I}_2$ とおく。このとき，線分 $\\text{I}_1\\text{I}_2$ の長さを求めよう。線分 $\\text{BI}_2$ の長さを $\\ell$ とおくと，三角形 $\\text{ABI}_2$ に余弦定理を適用して $\\ell = \\sqrt{\\text{[O]}}$ を得る。また $\\dfrac{\\text{I}_1\\text{I}_2}{\\text{BI}_1} = \\dfrac{\\text{[P]}}{\\text{[Q]}}$ であるから，$\\text{I}_1\\text{I}_2 = \\dfrac{\\sqrt{\\text{[R]}}}{\\text{[S]}}$ である。",
    "q_cn": "【2024第1回 IV (3)】（已知 $\\text{AB} = 4$，$\\text{BC} = 2$，$\\text{CA} = 3$，$\\text{AD} = 3$，$\\text{CD} = \\dfrac{3}{2}$，$\\dfrac{r_2}{r_1} = \\dfrac{3}{2}$）设三角形 ABC、ABD 的内心为 $\\text{I}_1$，$\\text{I}_2$，求线段 $\\text{I}_1\\text{I}_2$ 的长。设 $\\text{BI}_2 = \\ell$，得 $\\ell = \\sqrt{\\text{[O]}}$。又 $\\dfrac{\\text{I}_1\\text{I}_2}{\\text{BI}_1} = \\dfrac{\\text{[P]}}{\\text{[Q]}}$，所以 $\\text{I}_1\\text{I}_2 = \\dfrac{\\sqrt{\\text{[R]}}}{\\text{[S]}}$。",
    "hint": "两个三角形在 B 处的角相同，所以两个内心都在 ∠B 的平分线上：B、I₁、I₂ 共线。到 B 的距离和内切圆半径成正比。",
    "expl": "【步骤1：B、I₁、I₂ 在同一条线上】\nC 在 BD 上，△ABC 和 △ABD 在 B 处是同一个角，内心都在这个角的平分线上。\n设半角为 θ，BI = r / sinθ，所以 BI₂ / BI₁ = r₂ / r₁ = 3/2。\n\n【步骤2：求 ℓ = BI₂（切线长 + 勾股定理）】\n△ABD 三边：AB = 4，BD = 7/2，AD = 3。\n从 B 到内切圆的切线长 = (AB + BD − AD)/2 = (4 + 7/2 − 3)/2 = 9/4。\nS₁ 用海伦公式：s = 9/2，S₁ = √(9/2 × 5/2 × 3/2 × 1/2) = 3√15/4；S₂ = (7/4)S₁ = 21√15/16。\nr₂ = 2S₂ / (21/2) = √15/4。\nℓ² = (9/4)² + (√15/4)² = 81/16 + 15/16 = 6 ⇒ ℓ = √6，O=6。\n\n【步骤3：I₁I₂ / BI₁】\nI₁I₂ = BI₂ − BI₁，I₁I₂/BI₁ = BI₂/BI₁ − 1 = 3/2 − 1 = 1/2，P=1，Q=2。\n\n【步骤4：I₁I₂】\nBI₂ = BI₁ + I₁I₂ = 3 × I₁I₂ ⇒ I₁I₂ = √6/3，R=6，S=3。",
    "trap": "原卷用的是 △ABI₂ 的余弦定理；用「切线长 + 半径」的直角三角形更快，两种方法结果相同。",
    "variant": "切线长公式：从顶点 B 出发的两条切线长都等于 (夹 B 的两边之和 − 对边)/2。",
    "blanks": [
      {
        "key": "O",
        "label": "[O]",
        "ans": "6",
        "len": 1
      },
      {
        "key": "P",
        "label": "[P]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "Q",
        "label": "[Q]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "R",
        "label": "[R]",
        "ans": "6",
        "len": 1
      },
      {
        "key": "S",
        "label": "[S]",
        "ans": "3",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{O}=6,\\ \\text{P}=1,\\ \\text{Q}=2,\\ \\text{R}=6,\\ \\text{S}=3$"
  },
  {
    "id": "real-2023-2-1",
    "source": "2023第2回 I問1",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "2次関数：平行移動と区間の最大値",
    "type": "mark",
    "mtype": "quad",
    "level": "core",
    "paperImg": "./papers/2023_2_q_p03.png",
    "ansImg": "./papers/2023_2_ans_p05.png",
    "q": "【2023第2回 I問1】2次関数 $f(x) = -x^2 + 4x + 5$ を考える。(1) 放物線 $y = f(x)$ の頂点の座標は $(\\text{[A]},\\ \\text{[B]})$ である。(2) 放物線 $y = f(x)$ を $x$ 軸方向に $k$，$y$ 軸方向に $-4$ だけ平行移動して得られる放物線を $y = g(x)$ とすると $g(x) = -(x - \\text{[C]} - k)^2 + \\text{[D]}$ である。(3) 関数 $g(x)$ の $-1 \\le x \\le 4$ における最大値が $3$ となるような $k$ の値を求めよう。関数 $g(x)$ の最大値は $\\text{[D]}$ であるから，$k$ は条件 $\\text{[E]}$ または $\\text{[F]}$ を満たす。したがって $k = -\\text{[G]} - \\sqrt{\\text{[H]}}$，$k = \\text{[I]} + \\sqrt{\\text{[J]}}$ である。（$\\text{[E]}$ は ⓪〜④，$\\text{[F]}$ は ⑤〜⑨ から選ぶ：⓪ $k<-5$ かつ $k^2+6k+7=0$　① $k<-5$ かつ $k^2-4k+2=0$　② $k<-3$ かつ $k^2+7k+6=0$　③ $k<-3$ かつ $k^2+6k+7=0$　④ $k<-3$ かつ $k^2-4k+2=0$　⑤ $k>2$ かつ $k^2-6k+4=0$　⑥ $k>2$ かつ $k^2+6k+7=0$　⑦ $k>2$ かつ $k^2-4k+2=0$　⑧ $k>4$ かつ $k^2-4k+2=0$　⑨ $k>4$ かつ $k^2+6k+7=0$）",
    "q_cn": "【2023第2回 I问1】考虑二次函数 $f(x) = -x^2 + 4x + 5$。(1) 抛物线 $y = f(x)$ 的顶点为 $(\\text{[A]},\\ \\text{[B]})$。(2) 把它沿 $x$ 轴方向平移 $k$、沿 $y$ 轴方向平移 $-4$ 得到 $y = g(x)$，则 $g(x) = -(x - \\text{[C]} - k)^2 + \\text{[D]}$。(3) 求使 $g(x)$ 在 $-1 \\le x \\le 4$ 上的最大值为 $3$ 的 $k$。$g(x)$ 本身的最大值是 $\\text{[D]}$，所以 $k$ 满足条件 $\\text{[E]}$ 或 $\\text{[F]}$，得 $k = -\\text{[G]} - \\sqrt{\\text{[H]}}$，$k = \\text{[I]} + \\sqrt{\\text{[J]}}$。（$\\text{[E]}$ 从 ⓪〜④、$\\text{[F]}$ 从 ⑤〜⑨ 中选，选项见日文题面）",
    "hint": "平移只看顶点：(2, 9) → (2 + k, 5)。区间上的最大值 3 比顶点高度 5 小，说明顶点不在区间里，最大值在离顶点近的端点。",
    "expl": "【步骤1：顶点】\nf(x) = −(x − 2)² + 9，顶点 (2, 9)，A=2，B=9。\n\n【步骤2：平移】\n顶点移到 (2 + k, 9 − 4) = (2 + k, 5)：g(x) = −(x − 2 − k)² + 5，C=2，D=5。\n\n【步骤3：为什么顶点不在区间里】\n如果对称轴 x = 2 + k 在 −1 ≦ x ≦ 4 里面，最大值就是 5，不可能是 3。\n所以轴在区间左边（2 + k < −1，即 k < −3）或右边（2 + k > 4，即 k > 2）。\n\n【步骤4：轴在左边 → 左端 x = −1 最高】\ng(−1) = −(−3 − k)² + 5 = 3 ⇒ (k + 3)² = 2 ⇒ k² + 6k + 7 = 0，且 k < −3：选 ③，E=3。\nk = −3 ± √2，满足 k < −3 的是 k = −3 − √2，G=3，H=2。\n\n【步骤5：轴在右边 → 右端 x = 4 最高】\ng(4) = −(2 − k)² + 5 = 3 ⇒ (k − 2)² = 2 ⇒ k² − 4k + 2 = 0，且 k > 2：选 ⑦，F=7。\nk = 2 ± √2，满足 k > 2 的是 k = 2 + √2，I=2，J=2。",
    "trap": "E、F 是选项编号。开口向下时，轴在区间左边，区间里函数一直下降，最大值在左端点 −1（不是右端点）。",
    "variant": "「区间最大值比顶点值小」⇒ 顶点在区间外，这是 EJU 二次函数里反复出现的判断。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "B",
        "label": "[B]",
        "ans": "9",
        "len": 1
      },
      {
        "key": "C",
        "label": "[C]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "D",
        "label": "[D]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "E",
        "label": "[E]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "F",
        "label": "[F]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "G",
        "label": "[G]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "H",
        "label": "[H]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "I",
        "label": "[I]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "J",
        "label": "[J]",
        "ans": "2",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{A}=2,\\ \\text{B}=9,\\ \\text{C}=2,\\ \\text{D}=5,\\ \\text{E}=3,\\ \\text{F}=7,\\ \\text{G}=3,\\ \\text{H}=2,\\ \\text{I}=2,\\ \\text{J}=2$"
  },
  {
    "id": "real-2023-2-I2",
    "source": "2023第2回 I問2",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "場合の数：正四面体・立方体の塗り分け",
    "type": "mark",
    "mtype": "prob",
    "level": "core",
    "paperImg": "./papers/2023_2_q_p05.png",
    "ansImg": "./papers/2023_2_ans_p05.png",
    "q": "【2023第2回 I問2】赤，青，黄，緑，橙，紫の6色を使って，正多面体（正四面体，立方体）の各面に，隣り合った面の色が異なるように色を塗る。ただし，正多面体を回転させて一致する塗り方は同じとみなす。(1) 正四面体の各面を，6色を使って塗る方法について考える。まず，6色のうち使える4色の組み合わせは $\\text{[KL]}$ 通りある。このうち，赤，青，黄，緑の4色を使って塗る方法は，赤で塗った面を底面に固定して，他の3面を残りの色で塗ればよいので $\\text{[M]}$ 通りある。したがって，正四面体の各面を6色を使って塗る方法は $\\text{[NO]}$ 通りある。(2) (i) 立方体において，6色をすべて使って塗る方法は $\\text{[PQ]}$ 通りある。(ii) 立方体において，紫を除いた5色をすべて使って塗る方法は $\\text{[RS]}$ 通りある。",
    "q_cn": "【2023第2回 I问2】用红、蓝、黄、绿、橙、紫 6 种颜色给正多面体（正四面体、正方体）的各面涂色，相邻面颜色不同；旋转后一致的涂法看作同一种。(1) 正四面体：从 6 色中选 4 色的组合有 $\\text{[KL]}$ 种；用红、蓝、黄、绿 4 色时，把红色面固定在底面，其余 3 面用剩下的颜色涂，有 $\\text{[M]}$ 种；所以用 6 色给正四面体涂色共 $\\text{[NO]}$ 种。(2) (i) 正方体用全部 6 色涂，有 $\\text{[PQ]}$ 种；(ii) 正方体用除紫色外的 5 色（全部用上）涂，有 $\\text{[RS]}$ 种。",
    "hint": "旋转算同一种：先把一种颜色固定在底面，剩下的侧面是「圆排列」(n − 1)!。立方体用 5 色时，必有一种颜色用两次，而且只能涂在相对的两个面上。",
    "expl": "【步骤1：(1) 选 4 色】\n6C4 = 15，KL=15。\n\n【步骤2：(1) 4 色涂正四面体】\n红色面放底面；另外 3 个面绕着底面转一圈，是 3 个颜色的圆排列：(3 − 1)! = 2，M=2。\n15 × 2 = 30，NO=30。\n\n【步骤3：(2)(i) 6 色涂立方体】\n红色面放底面；顶面从剩下 5 色中选：5 种；\n侧面 4 个面绕一圈，是 4 色的圆排列：(4 − 1)! = 6。\n5 × 6 = 30，PQ=30。\n\n【步骤4：(2)(ii) 5 色涂立方体】\n6 个面只有 5 色 ⇒ 恰有 1 种颜色用两次；相邻面不能同色，所以这两面必须相对。\n选出用两次的颜色：5 种，把它放在上下两面。\n剩下 4 色涂侧面一圈：圆排列 (4 − 1)! = 6，但上下同色，把立方体翻过来（上下对调）会和镜像的排列重合，所以再除以 2：6 ÷ 2 = 3。\n5 × 3 = 15，RS=15。",
    "trap": "(ii) 中上下两面颜色相同，立方体可以上下翻转，所以侧面的排列要像「项链」一样除以 2。",
    "variant": "常用结论：n 个不同的珠子排成一圈 (n − 1)! 种；可以翻面的项链 (n − 1)!/2 种。",
    "blanks": [
      {
        "key": "KL",
        "label": "[KL]",
        "ans": "15",
        "len": 2
      },
      {
        "key": "M",
        "label": "[M]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "NO",
        "label": "[NO]",
        "ans": "30",
        "len": 2
      },
      {
        "key": "PQ",
        "label": "[PQ]",
        "ans": "30",
        "len": 2
      },
      {
        "key": "RS",
        "label": "[RS]",
        "ans": "15",
        "len": 2
      }
    ],
    "ansSummary": "$\\text{KL}=15,\\ \\text{M}=2,\\ \\text{NO}=30,\\ \\text{PQ}=30,\\ \\text{RS}=15$"
  },
  {
    "id": "real-2023-2-2",
    "source": "2023第2回 II問1",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "数と式：展開の係数・循環小数",
    "type": "mark",
    "mtype": "expr",
    "level": "core",
    "paperImg": "./papers/2023_2_q_p07.png",
    "ansImg": "./papers/2023_2_ans_p05.png",
    "q": "【2023第2回 II問1】次の各問いに答えなさい。(1) $(-x + 2y + 3z)(2x - 3y + 4z)(3x + 4y - 5z)$ を展開したとき，$xyz$ の係数は $\\text{[ABC]}$ である。(2) $\\dfrac{479}{700}$ を小数で表したとき，小数第 2023 位の数字は $\\text{[D]}$ である。(3) 循環小数を $0.121212\\cdots = 0.\\dot{1}\\dot{2}$，$0.345345345\\cdots = 0.\\dot{3}4\\dot{5}$ のように書き表すことにする。$a = 0.\\dot{2}2\\dot{8}$，$b = 0.\\dot{3}3524\\dot{4}$ のとき，$x = 2a - b$ を循環小数で表すと $x = 0.\\dot{\\text{[E]}}\\dot{\\text{[F]}}$ である。ここで $100x = \\text{[GH]} + x$ であることに注意すると，$x$ は既約分数として $x = \\dfrac{\\text{[I]}}{\\text{[JK]}}$ と表される。",
    "q_cn": "【2023第2回 II问1】(1) 展开 $(-x + 2y + 3z)(2x - 3y + 4z)(3x + 4y - 5z)$，$xyz$ 的系数为 $\\text{[ABC]}$。(2) 把 $\\dfrac{479}{700}$ 写成小数，小数点后第 2023 位数字为 $\\text{[D]}$。(3) 循环小数记法：$0.121212\\cdots = 0.\\dot{1}\\dot{2}$，$0.345345\\cdots = 0.\\dot{3}4\\dot{5}$。设 $a = 0.\\dot{2}2\\dot{8}$，$b = 0.\\dot{3}3524\\dot{4}$，则 $x = 2a - b = 0.\\dot{\\text{[E]}}\\dot{\\text{[F]}}$；由 $100x = \\text{[GH]} + x$ 得 $x = \\dfrac{\\text{[I]}}{\\text{[JK]}}$（既约分数）。",
    "hint": "(1) xyz 只能是「每个括号各出一个不同的字母」，3! = 6 种组合加起来。(2) 先找不循环的部分和循环节。(3) 三位循环 = 三位数/999，六位循环 = 六位数/999999。",
    "expl": "【步骤1：(1) xyz 的系数】\n三个括号的 x, y, z 系数：第1个 (−1, 2, 3)，第2个 (2, −3, 4)，第3个 (3, 4, −5)。\n各取一个不同字母的 6 种取法：\nx,y,z：(−1)(−3)(−5) = −15\nx,z,y：(−1)(4)(4) = −16\ny,x,z：(2)(2)(−5) = −20\ny,z,x：(2)(4)(3) = 24\nz,x,y：(3)(2)(4) = 24\nz,y,x：(3)(−3)(3) = −27\n合计 −15 − 16 − 20 + 24 + 24 − 27 = −30，ABC=−30。\n\n【步骤2：(2) 479/700】\n479/700 = 4.79/7 = 0.68428571428571…\n小数前两位 6, 8 不循环，从第 3 位起 428571 六位循环。\n第 2023 位是循环部分的第 2023 − 2 = 2021 个；2021 = 6 × 336 + 5，取循环节第 5 个数字 7，D=7。\n\n【步骤3：(3) 化成分数】\na = 228/999 = 228228/999999，b = 335244/999999\n2a − b = (456456 − 335244)/999999 = 121212/999999 = 0.121212…\n所以 x = 0.1̇2̇，E=1，F=2。\n\n【步骤4：(3) 化成既约分数】\n100x = 12.1212… = 12 + x，GH=12。\n99x = 12 ⇒ x = 12/99 = 4/33，I=4，JK=33。",
    "trap": "ABC = −30 占三格（−，3，0）。(2) 一定先扣掉不循环的两位再除以 6。",
    "variant": "快速核对循环节：1/7 = 0.142857…，分母含因数 7 的分数循环节都是这 6 个数字的轮换。",
    "blanks": [
      {
        "key": "ABC",
        "label": "[ABC]",
        "ans": "-30",
        "len": 3
      },
      {
        "key": "D",
        "label": "[D]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "E",
        "label": "[E]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "F",
        "label": "[F]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "GH",
        "label": "[GH]",
        "ans": "12",
        "len": 2
      },
      {
        "key": "I",
        "label": "[I]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "JK",
        "label": "[JK]",
        "ans": "33",
        "len": 2
      }
    ],
    "ansSummary": "$\\text{ABC}=-30,\\ \\text{D}=7,\\ \\text{E}=1,\\ \\text{F}=2,\\ \\text{GH}=12,\\ \\text{I}=4,\\ \\text{JK}=33$"
  },
  {
    "id": "real-2023-2-II2",
    "source": "2023第2回 II問2",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "不等式：文字を含む2次不等式と包含関係",
    "type": "mark",
    "mtype": "ineq",
    "level": "core",
    "paperImg": "./papers/2023_2_q_p09.png",
    "ansImg": "./papers/2023_2_ans_p05.png",
    "q": "【2023第2回 II問2】$x$ についての2次不等式 $x^2 - 3x + 2 < 0$ ……①，$x^2 - 2ax - 3a^2 < 0$ ……② を考える。(1) 不等式①の解は $\\text{[L]} < x < \\text{[M]}$ である。(2) 不等式②の解は，$a > \\text{[N]}$ のとき $\\text{[O]}$，$a = \\text{[N]}$ のとき $\\text{[P]}$，$a < \\text{[N]}$ のとき $\\text{[Q]}$ である。（$\\text{[O]}$〜$\\text{[Q]}$ は選択肢から選ぶ：⓪ $a<x<-3a$　① $-a<x<3a$　② $-2a<x<3a$　③ $1<x<3a^2$　④ $3a<x<-a$　⑤ $-3<x<a^2$　⑥ $-3a<x<-a$　⑦ $3a<x<a$　⑧ すべての実数　⑨ 解はなし）(3) ①を満たすすべての $x$ に対して②が成り立つような $a$ の値の範囲は $a \\le \\text{[RS]}$，$a \\ge \\dfrac{\\text{[T]}}{\\text{[U]}}$ である。(4) ①と②の両方を満たす実数 $x$ が存在しないような $a$ の値の範囲は $\\text{[VW]} \\le a \\le \\dfrac{\\text{[X]}}{\\text{[Y]}}$ である。",
    "q_cn": "【2023第2回 II问2】考虑关于 $x$ 的二次不等式 $x^2 - 3x + 2 < 0$ ……① 与 $x^2 - 2ax - 3a^2 < 0$ ……②。(1) ① 的解为 $\\text{[L]} < x < \\text{[M]}$。(2) ② 的解：$a > \\text{[N]}$ 时为 $\\text{[O]}$，$a = \\text{[N]}$ 时为 $\\text{[P]}$，$a < \\text{[N]}$ 时为 $\\text{[Q]}$（从选项中选，见日文题面）。(3) 使满足 ① 的所有 $x$ 都满足 ② 的 $a$ 的范围是 $a \\le \\text{[RS]}$，$a \\ge \\dfrac{\\text{[T]}}{\\text{[U]}}$。(4) 使 ① 与 ② 没有公共解的范围是 $\\text{[VW]} \\le a \\le \\dfrac{\\text{[X]}}{\\text{[Y]}}$。",
    "hint": "② 左边因式分解成 (x + a)(x − 3a)，两根 −a 和 3a 谁大取决于 a 的符号。「①的解全在②里」= 区间包含；「没有公共解」= 两区间不重叠。",
    "expl": "【步骤1：(1)】\n(x − 1)(x − 2) < 0 ⇒ 1 < x < 2，L=1，M=2。\n\n【步骤2：(2) 分 a 的符号】\nx² − 2ax − 3a² = (x + a)(x − 3a)，两根是 −a 和 3a。N=0。\na > 0：−a < 3a，解为 −a < x < 3a，选 ①，O=1。\na = 0：x² < 0，没有解，选 ⑨，P=9。\na < 0：3a < −a，解为 3a < x < −a，选 ④，Q=4。\n\n【步骤3：(3) 区间 (1, 2) 完全包含在 ② 的解里】\na > 0：−a ≦ 1 且 3a ≧ 2 ⇒ a ≧ 2/3。\na < 0：3a ≦ 1（自动成立）且 −a ≧ 2 ⇒ a ≦ −2。\na = 0：② 无解，不行。\n所以 a ≦ −2 或 a ≧ 2/3，RS=−2，T=2，U=3。\n\n【步骤4：(4) 没有公共解】\na > 0：区间 (−a, 3a) 与 (1, 2) 不重叠 ⇔ 3a ≦ 1 ⇔ a ≦ 1/3。\na < 0：区间 (3a, −a) 与 (1, 2) 不重叠 ⇔ −a ≦ 1 ⇔ a ≧ −1。\na = 0：② 无解，当然没有公共解。\n合起来 −1 ≦ a ≦ 1/3，VW=−1，X=1，Y=3。",
    "trap": "a = 0 时 ② 是 x² < 0，没有解：在 (3) 中不行，在 (4) 中却算「没有公共解」，两问结论相反，别漏。",
    "variant": "含参数的二次不等式先因式分解，两根大小随参数变化时按参数的符号分类。",
    "blanks": [
      {
        "key": "L",
        "label": "[L]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "M",
        "label": "[M]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "N",
        "label": "[N]",
        "ans": "0",
        "len": 1
      },
      {
        "key": "O",
        "label": "[O]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "P",
        "label": "[P]",
        "ans": "9",
        "len": 1
      },
      {
        "key": "Q",
        "label": "[Q]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "RS",
        "label": "[RS]",
        "ans": "-2",
        "len": 2
      },
      {
        "key": "T",
        "label": "[T]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "U",
        "label": "[U]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "VW",
        "label": "[VW]",
        "ans": "-1",
        "len": 2
      },
      {
        "key": "X",
        "label": "[X]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "Y",
        "label": "[Y]",
        "ans": "3",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{L}=1,\\ \\text{M}=2,\\ \\text{N}=0,\\ \\text{O}=1,\\ \\text{P}=9,\\ \\text{Q}=4,\\ \\text{RS}=-2,\\ \\text{T}=2,\\ \\text{U}=3,\\ \\text{VW}=-1,\\ \\text{X}=1,\\ \\text{Y}=3$"
  },
  {
    "id": "real-2023-2-3",
    "source": "2023第2回 III",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "整数：最大公約数・最小公倍数と不定方程式",
    "type": "mark",
    "mtype": "int",
    "level": "core",
    "paperImg": "./papers/2023_2_q_p11.png",
    "ansImg": "./papers/2023_2_ans_p05.png",
    "q": "【2023第2回 III】2つの整数 $a = 588$，$b = 1260$ を考える。(1) $a$，$b$ を素因数分解すると $a = 2^{\\text{[A]}} \\cdot 3 \\cdot \\text{[B]}^{\\text{[C]}}$，$b = 2^{\\text{[D]}} \\cdot 3^{\\text{[E]}} \\cdot \\text{[F]} \\cdot \\text{[G]}$（$\\text{[F]} < \\text{[G]}$）である。よって，$a$，$b$ の最大公約数は $\\text{[HI]}$ である。(2) 次の条件 (i)，(ii) を満たす正の整数 $c$ を考える。(i) $a,\\ b,\\ c$ の最大公約数は，$a,\\ b$ の最大公約数に等しい。(ii) $a,\\ b,\\ c$ の最小公倍数は，$a,\\ b$ の最小公倍数の 4 倍である。条件 (i)，(ii) を満たすような $c$ は全部で $\\text{[J]}$ 個ある。そのような $c$ の中で最小のものは $\\text{[KLM]}$ である。(3) 方程式 $ax - by = \\text{[KLM]}$ ……① の整数解 $x,\\ y$ を求めよう。そのためには，方程式 $\\text{[N]}x - \\text{[OP]}y = \\text{[Q]}$ ……② の整数解を求めればよい。② を満たすような正の整数 $x,\\ y$ で，$y$ が最も小さいものは $x = \\text{[R]}$，$y = \\text{[S]}$ である。したがって，① の整数解は $x = \\text{[T]} + \\text{[UV]}k$，$y = \\text{[W]} + \\text{[X]}k$（$k$ は整数）である。",
    "q_cn": "【2023第2回 III】考虑整数 $a = 588$，$b = 1260$。(1) 质因数分解：$a = 2^{\\text{[A]}} \\cdot 3 \\cdot \\text{[B]}^{\\text{[C]}}$，$b = 2^{\\text{[D]}} \\cdot 3^{\\text{[E]}} \\cdot \\text{[F]} \\cdot \\text{[G]}$（$\\text{[F]} < \\text{[G]}$），最大公约数为 $\\text{[HI]}$。(2) 正整数 $c$ 满足：(i) $a, b, c$ 的最大公约数等于 $a, b$ 的最大公约数；(ii) $a, b, c$ 的最小公倍数是 $a, b$ 的最小公倍数的 4 倍。这样的 $c$ 共有 $\\text{[J]}$ 个，最小的是 $\\text{[KLM]}$。(3) 求方程 $ax - by = \\text{[KLM]}$ ……① 的整数解：只需解 $\\text{[N]}x - \\text{[OP]}y = \\text{[Q]}$ ……②。② 的正整数解中 $y$ 最小的是 $x = \\text{[R]}$，$y = \\text{[S]}$。所以 ① 的整数解为 $x = \\text{[T]} + \\text{[UV]}k$，$y = \\text{[W]} + \\text{[X]}k$（$k$ 为整数）。",
    "hint": "最大公约数：每个质因数取「小的指数」；最小公倍数：取「大的指数」。(2) 对每个质因数分别看 c 的指数可以取几种值，再相乘。",
    "expl": "【步骤1：(1) 质因数分解】\n588 = 4 × 147 = 2² × 3 × 7²，A=2，B=7，C=2。\n1260 = 4 × 315 = 2² × 3² × 5 × 7，D=2，E=2，F=5，G=7。\n最大公约数 = 2² × 3 × 7 = 84，HI=84。\n\n【步骤2：(2) 逐个质因数决定 c 的指数】\n最小公倍数 L = 2² × 3² × 5 × 7² ，4L = 2⁴ × 3² × 5 × 7²。\n2：最小公倍数要到 2⁴，a、b 只有 2²，所以 c 必须恰好含 2⁴（1 种）。\n3：最大公约数里要有 3¹ ⇒ c 至少 3¹；最小公倍数是 3² ⇒ c 至多 3²：2 种。\n5：最大公约数里没有 5（a 没有）；最小公倍数是 5¹ ⇒ c 含 5⁰ 或 5¹：2 种。\n7：最大公约数里要有 7¹ ⇒ c 至少 7¹；最小公倍数 7² ⇒ 至多 7²：2 种。\n其他质因数都不能有。\n1 × 2 × 2 × 2 = 8，J=8。最小的 c = 2⁴ × 3 × 7 = 336，KLM=336。\n\n【步骤3：(3) 两边除以 84】\n588x − 1260y = 336 ⇒ 7x − 15y = 4，N=7，OP=15，Q=4。\n\n【步骤4：找一组正整数解】\n7x = 15y + 4：y = 1 → 19，y = 2 → 34，y = 3 → 49 = 7 × 7 ✓\nx = 7，y = 3，R=7，S=3。\n\n【步骤5：一般解】\n7x − 15y = 4 与 7 × 7 − 15 × 3 = 4 相减：7(x − 7) = 15(y − 3)。\n7 和 15 互素 ⇒ x − 7 = 15k，y − 3 = 7k。\nx = 7 + 15k，y = 3 + 7k，T=7，UV=15，W=3，X=7。",
    "trap": "(2) 中 c 不能含 a、b 以外的质因数（比如 11），否则最小公倍数会变；2 的指数必须正好是 4。",
    "variant": "一次不定方程 ax − by = c 的三步：约去公约数 → 试出一组特解 → 相减后用互素写出通解。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "B",
        "label": "[B]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "C",
        "label": "[C]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "D",
        "label": "[D]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "E",
        "label": "[E]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "F",
        "label": "[F]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "G",
        "label": "[G]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "HI",
        "label": "[HI]",
        "ans": "84",
        "len": 2
      },
      {
        "key": "J",
        "label": "[J]",
        "ans": "8",
        "len": 1
      },
      {
        "key": "KLM",
        "label": "[KLM]",
        "ans": "336",
        "len": 3
      },
      {
        "key": "N",
        "label": "[N]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "OP",
        "label": "[OP]",
        "ans": "15",
        "len": 2
      },
      {
        "key": "Q",
        "label": "[Q]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "R",
        "label": "[R]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "S",
        "label": "[S]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "T",
        "label": "[T]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "UV",
        "label": "[UV]",
        "ans": "15",
        "len": 2
      },
      {
        "key": "W",
        "label": "[W]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "X",
        "label": "[X]",
        "ans": "7",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{A}=2,\\ \\text{B}=7,\\ \\text{C}=2,\\ \\text{D}=2,\\ \\text{E}=2,\\ \\text{F}=5,\\ \\text{G}=7,\\ \\text{HI}=84,\\ \\text{J}=8,\\ \\text{KLM}=336,\\ \\text{N}=7,\\ \\text{OP}=15,\\ \\text{Q}=4,\\ \\text{R}=7,\\ \\text{S}=3,\\ \\text{T}=7,\\ \\text{UV}=15,\\ \\text{W}=3,\\ \\text{X}=7$"
  },
  {
    "id": "real-2023-2-4",
    "source": "2023第2回 IV (1)",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "図形と計量：正弦定理と cos15°",
    "type": "mark",
    "mtype": "geo",
    "level": "core",
    "paperImg": "./papers/2023_2_q_p13.png",
    "ansImg": "./papers/2023_2_ans_p05.png",
    "q": "【2023第2回 IV (1)】三角形 ABC の外接円 O の直径 AD と辺 BC との交点を E とおく。ここで，$\\text{AC} = 2\\sqrt{3}$，$\\angle\\text{BAD} = 15^\\circ$ かつ外接円 O の半径を $\\sqrt{6}$ とする。（図：A は円の上方，BC は円の下寄りの弦，D は B の下方の円周上）(1) 正弦定理より，$\\angle\\text{ABC} = \\text{[AB]}^\\circ$，$\\text{BC} = \\text{[C]}\\sqrt{\\text{[D]}}$ である。さらに，余弦定理より $\\text{AB} = \\sqrt{\\text{[E]}} + \\text{[F]}$ が得られる。よって $\\cos 15^\\circ = \\dfrac{\\sqrt{\\text{[G]}} + \\sqrt{\\text{[H]}}}{\\text{[I]}}$（$\\text{[G]} < \\text{[H]}$）である。",
    "q_cn": "【2023第2回 IV (1)】三角形 ABC 的外接圆 O 的直径 AD 与边 BC 交于 E。已知 $\\text{AC} = 2\\sqrt{3}$，$\\angle\\text{BAD} = 15^\\circ$，外接圆半径为 $\\sqrt{6}$。(1) 由正弦定理，$\\angle\\text{ABC} = \\text{[AB]}^\\circ$，$\\text{BC} = \\text{[C]}\\sqrt{\\text{[D]}}$；再由余弦定理得 $\\text{AB} = \\sqrt{\\text{[E]}} + \\text{[F]}$。所以 $\\cos 15^\\circ = \\dfrac{\\sqrt{\\text{[G]}} + \\sqrt{\\text{[H]}}}{\\text{[I]}}$（$\\text{[G]} < \\text{[H]}$）。",
    "hint": "正弦定理 AC/sin B = 2R 先求 ∠B。AD 是直径 ⇒ ∠ABD = 90°，所以 AB = AD·cos15°，反过来求 cos15°。",
    "expl": "【步骤1：∠ABC】\nAC/sin B = 2R ⇒ sin B = 2√3/(2√6) = 1/√2 ⇒ ∠B = 45°（图中是锐角），AB=45。\n\n【步骤2：∠BAC 和 BC】\nAD 是直径，所以 ∠ABD = 90°。△ABE 中 ∠BAE = 15°，∠ABE = 45°。\n∠ACB 与 ∠ADB 对同一条弧 AB，∠ADB = 90° − 15° = 75°，所以 ∠C = 75°，∠A = 180° − 45° − 75° = 60°。\nBC = 2R sin A = 2√6 × √3/2 = √18 = 3√2，C=3，D=2。\n\n【步骤3：AB（余弦定理）】\nAC² = AB² + BC² − 2·AB·BC·cos45°：12 = AB² + 18 − 2·AB·3√2·(√2/2) = AB² − 6AB + 18\nAB² − 6AB + 6 = 0 ⇒ AB = 3 ± √3。\n∠C = 75° 是最大角，AB 是最长边，AB > BC = 3√2 ≈ 4.24，所以 AB = 3 + √3，E=3，F=3。\n\n【步骤4：cos15°】\n直角三角形 ABD：AB = AD·cos15° = 2√6·cos15°\ncos15° = (3 + √3)/(2√6) = (3 + √3)√6/12 = (3√6 + √18)/12 = (3√6 + 3√2)/12 = (√2 + √6)/4\nG=2，H=6，I=4。",
    "trap": "sin B = 1/√2 时 B 也可能是 135°，要结合图形（或三角形内角和）判断；AB 的两个候选 3 ± √3 要用「大角对大边」排除。",
    "variant": "记住：cos15° = sin75° = (√6 + √2)/4，sin15° = cos75° = (√6 − √2)/4。",
    "blanks": [
      {
        "key": "AB",
        "label": "[AB]",
        "ans": "45",
        "len": 2
      },
      {
        "key": "C",
        "label": "[C]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "D",
        "label": "[D]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "E",
        "label": "[E]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "F",
        "label": "[F]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "G",
        "label": "[G]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "H",
        "label": "[H]",
        "ans": "6",
        "len": 1
      },
      {
        "key": "I",
        "label": "[I]",
        "ans": "4",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{AB}=45,\\ \\text{C}=3,\\ \\text{D}=2,\\ \\text{E}=3,\\ \\text{F}=3,\\ \\text{G}=2,\\ \\text{H}=6,\\ \\text{I}=4$"
  },
  {
    "id": "real-2023-2-4b",
    "source": "2023第2回 IV (2)",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "図形と計量：直径と弦が作る三角形の面積比",
    "type": "mark",
    "mtype": "geo",
    "level": "stretch",
    "paperImg": "./papers/2023_2_q_p13.png",
    "ansImg": "./papers/2023_2_ans_p05.png",
    "q": "【2023第2回 IV (2)】（$\\text{AC} = 2\\sqrt{3}$，$\\angle\\text{BAD} = 15^\\circ$，外接円の半径 $\\sqrt{6}$，$\\angle\\text{ABC} = 45^\\circ$，$\\text{BC} = 3\\sqrt{2}$，AD は直径，E は AD と BC の交点）$\\angle\\text{AEC} = \\text{[JK]}^\\circ$ なので，$\\text{CE} = \\text{[L]}\\sqrt{\\text{[M]}}$ であり，$\\text{DE} = \\sqrt{\\text{[N]}} - \\sqrt{\\text{[O]}}$ となる。したがって $\\triangle\\text{ABC} : \\triangle\\text{EAC} : \\triangle\\text{EBD} = \\text{[P]} : \\text{[Q]} : (\\text{[R]} - \\sqrt{\\text{[S]}})$ である。",
    "q_cn": "【2023第2回 IV (2)】（已知 $\\text{AC} = 2\\sqrt{3}$，$\\angle\\text{BAD} = 15^\\circ$，外接圆半径 $\\sqrt{6}$，$\\angle\\text{ABC} = 45^\\circ$，$\\text{BC} = 3\\sqrt{2}$，AD 为直径，E 为 AD 与 BC 的交点）$\\angle\\text{AEC} = \\text{[JK]}^\\circ$，所以 $\\text{CE} = \\text{[L]}\\sqrt{\\text{[M]}}$，$\\text{DE} = \\sqrt{\\text{[N]}} - \\sqrt{\\text{[O]}}$。因此 $\\triangle\\text{ABC} : \\triangle\\text{EAC} : \\triangle\\text{EBD} = \\text{[P]} : \\text{[Q]} : (\\text{[R]} - \\sqrt{\\text{[S]}})$。",
    "hint": "∠AEC 是 △ABE 的外角。同高的三角形面积比 = 底边比；对顶角相同的两个三角形面积比 = 夹角两边乘积之比。",
    "expl": "【步骤1：∠AEC】\n△ABE 的外角：∠AEC = ∠BAE + ∠ABE = 15° + 45° = 60°，JK=60。\n\n【步骤2：CE（△AEC 用正弦定理）】\n△AEC：∠EAC = 60° − 15° = 45°，∠AEC = 60°。\nCE/sin45° = AC/sin60° ⇒ CE = 2√3 × (√2/2) ÷ (√3/2) = 2√2，L=2，M=2。\n\n【步骤3：DE】\nAE/sin∠ACE = AC/sin60°，∠ACE = 75°：AE = 2√3 × sin75° ÷ (√3/2) = 4 sin75° = √6 + √2。\nDE = AD − AE = 2√6 − (√6 + √2) = √6 − √2，N=6，O=2。\n\n【步骤4：面积比】\n△ABC 与 △EAC 同高（从 A 到 BC）：面积比 = BC : EC = 3√2 : 2√2 = 3 : 2。\nBE = BC − CE = √2。△EBD 与 △EAC 在 E 处的角是对顶角：\n△EBD/△EAC = (EB × ED)/(EA × EC) = √2(√6 − √2) / ((√6 + √2) × 2√2) = (√6 − √2)/(2(√6 + √2))\n= (√6 − √2)²/(2 × 4) = (8 − 4√3)/8 = (2 − √3)/2。\n所以 △ABC : △EAC : △EBD = 3 : 2 : (2 − √3)，P=3，Q=2，R=2，S=3。",
    "trap": "(√6 − √2)/(√6 + √2) 有理化时上下乘 (√6 − √2)，分母是 6 − 2 = 4。",
    "variant": "相交弦定理 EA·ED = EB·EC 可以用来检查：(√6 + √2)(√6 − √2) = 4，√2 × 2√2 = 4，一致。",
    "blanks": [
      {
        "key": "JK",
        "label": "[JK]",
        "ans": "60",
        "len": 2
      },
      {
        "key": "L",
        "label": "[L]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "M",
        "label": "[M]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "N",
        "label": "[N]",
        "ans": "6",
        "len": 1
      },
      {
        "key": "O",
        "label": "[O]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "P",
        "label": "[P]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "Q",
        "label": "[Q]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "R",
        "label": "[R]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "S",
        "label": "[S]",
        "ans": "3",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{JK}=60,\\ \\text{L}=2,\\ \\text{M}=2,\\ \\text{N}=6,\\ \\text{O}=2,\\ \\text{P}=3,\\ \\text{Q}=2,\\ \\text{R}=2,\\ \\text{S}=3$"
  },
  {
    "id": "real-2023-1-1",
    "source": "2023第1回 I問1",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "2次関数：2つの放物線の交点と最大・最小",
    "type": "mark",
    "mtype": "quad",
    "level": "core",
    "paperImg": "./papers/2023_1_q_p04.png",
    "ansImg": "./papers/2023_1_ans_p05.png",
    "q": "【2023第1回 I問1】2つの2次関数 $f(x) = \\dfrac{1}{3}x^2 + ax - b$，$g(x) = -x^2 + cx + b$ が，次の2つの条件 (A)，(B) を満たすような $a,\\ b,\\ c$ を求めよう。(A) グラフ $y = f(x)$ とグラフ $y = g(x)$ は2つの直線 $x = -1$，$x = 3$ 上で交わっている。(B) $g(x)$ の最大値と $f(x)$ の最小値の差は $\\dfrac{16}{3}$ である。条件 (A) より2つのグラフは直線 $x = -1$ 上で交わっているから $3a + \\text{[A]}b - \\text{[B]}c = \\text{[C]}$ ……① であり，また直線 $x = 3$ 上で交わっているから $\\text{[D]}a - 2b - \\text{[E]}c = -12$ ……② を得る。①と②より $b = \\text{[F]}$ である。次に，条件 (B) と $b = \\text{[F]}$ より $\\text{[G]}a^2 + 3c^2 = \\text{[HI]}$ を得る。これらから $a = -\\dfrac{\\text{[J]}}{\\text{[K]}}$，$c = \\text{[L]}$ となる。",
    "q_cn": "【2023第1回 I问1】求使两个二次函数 $f(x) = \\dfrac{1}{3}x^2 + ax - b$，$g(x) = -x^2 + cx + b$ 满足下面两个条件的 $a,\\ b,\\ c$。(A) 两图象在直线 $x = -1$ 和 $x = 3$ 上相交；(B) $g(x)$ 的最大值与 $f(x)$ 的最小值之差为 $\\dfrac{16}{3}$。由在 $x = -1$ 上相交得 $3a + \\text{[A]}b - \\text{[B]}c = \\text{[C]}$ ……①，由在 $x = 3$ 上相交得 $\\text{[D]}a - 2b - \\text{[E]}c = -12$ ……②。由 ①② 得 $b = \\text{[F]}$。再由 (B) 与 $b = \\text{[F]}$ 得 $\\text{[G]}a^2 + 3c^2 = \\text{[HI]}$。所以 $a = -\\dfrac{\\text{[J]}}{\\text{[K]}}$，$c = \\text{[L]}$。",
    "hint": "「在直线 x = −1 上相交」就是 f(−1) = g(−1)。最大值、最小值都用配方后的顶点高度表示。",
    "expl": "【步骤1：x = −1 上相交】\nf(−1) = 1/3 − a − b，g(−1) = −1 − c + b\n1/3 − a − b = −1 − c + b ⇒ −a − 2b + c = −4/3 ⇒ 两边乘 −3：3a + 6b − 3c = 4，A=6，B=3，C=4。\n\n【步骤2：x = 3 上相交】\nf(3) = 3 + 3a − b，g(3) = −9 + 3c + b\n3 + 3a − b = −9 + 3c + b ⇒ 3a − 2b − 3c = −12，D=3，E=3。\n\n【步骤3：求 b】\n① − ②：8b = 16 ⇒ b = 2，F=2。\n\n【步骤4：条件 (B)】\nf(x) = (1/3)(x + 3a/2)² − 3a²/4 − b，最小值 −3a²/4 − b\ng(x) = −(x − c/2)² + c²/4 + b，最大值 c²/4 + b\n差：c²/4 + b − (−3a²/4 − b) = c²/4 + 3a²/4 + 2b = 16/3\nb = 2：c²/4 + 3a²/4 = 4/3 ⇒ 乘 12：9a² + 3c² = 16，G=9，HI=16。\n\n【步骤5：联立】\n① 中 b = 2：3a − 3c = −8 ⇒ c = a + 8/3\n9a² + 3(a + 8/3)² = 16 ⇒ 12a² + 16a + 64/3 = 16 ⇒ 36a² + 48a + 16 = 0 ⇒ (3a + 2)² = 0\na = −2/3，c = 2，J=2，K=3，L=2。",
    "trap": "f(x) 的 x² 系数是 1/3，配方时 x 的系数 a 要除以 2/3：顶点在 x = −3a/2，最小值是 −3a²/4 − b。",
    "variant": "两个二次函数「在 x = p 上相交」→ 代入 p 列等式；两个交点就两条方程。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "6",
        "len": 1
      },
      {
        "key": "B",
        "label": "[B]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "C",
        "label": "[C]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "D",
        "label": "[D]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "E",
        "label": "[E]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "F",
        "label": "[F]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "G",
        "label": "[G]",
        "ans": "9",
        "len": 1
      },
      {
        "key": "HI",
        "label": "[HI]",
        "ans": "16",
        "len": 2
      },
      {
        "key": "J",
        "label": "[J]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "K",
        "label": "[K]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "L",
        "label": "[L]",
        "ans": "2",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{A}=6,\\ \\text{B}=3,\\ \\text{C}=4,\\ \\text{D}=3,\\ \\text{E}=3,\\ \\text{F}=2,\\ \\text{G}=9,\\ \\text{HI}=16,\\ \\text{J}=2,\\ \\text{K}=3,\\ \\text{L}=2$"
  },
  {
    "id": "real-2023-1-I2",
    "source": "2023第1回 I問2",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "確率：3つの箱から取り出すカード",
    "type": "mark",
    "mtype": "prob",
    "level": "core",
    "paperImg": "./papers/2023_1_q_p06.png",
    "ansImg": "./papers/2023_1_ans_p05.png",
    "q": "【2023第1回 I問2】A，B，C の3つの箱に，それぞれ9枚のカードが入っている。9枚のカードには，1 から 9 の数字が1つずつ書かれている。(1) A，B，C の箱から順に1枚ずつカードを取り出し，それらのカードに書かれた数字をそれぞれ $a,\\ b,\\ c$ とする。(i) $a = b \\ne c$ である確率は $\\text{[M]}$ である。(ii) $a,\\ b,\\ c$ の中に同じものがない確率は $\\text{[N]}$ である。(iii) $a > 2b > 3c$ となる確率 $p$ を求めよう。条件を満たす $a,\\ b,\\ c$ の組が存在するような $b$ の範囲は $\\text{[O]} \\le b \\le \\text{[P]}$ である。このことに注目して $p = \\text{[Q]}$ を得る。(2) A から3枚，B から2枚，合わせて5枚のカードを取り出す。(i) 取り出した5枚のカードの中に奇数が4枚，偶数が1枚ある確率は $\\text{[R]}$ である。(ii) 取り出した5枚のカードの中に奇数が少なくとも1枚ある確率は $\\text{[S]}$ である。（$\\text{[O]}$，$\\text{[P]}$ は数を入れ，その他は選択肢から選ぶ：⓪ $\\frac{8}{81}$　① $\\frac{14}{81}$　② $\\frac{56}{81}$　③ $\\frac{64}{81}$　④ $\\frac{25}{126}$　⑤ $\\frac{35}{126}$　⑥ $\\frac{115}{126}$　⑦ $\\frac{125}{126}$　⑧ $\\frac{8}{729}$　⑨ $\\frac{10}{729}$）",
    "q_cn": "【2023第1回 I问2】A、B、C 三个箱子里各有 9 张卡，分别写着 1 到 9。(1) 依次从 A、B、C 各取一张，数字记为 $a,\\ b,\\ c$。(i) $a = b \\ne c$ 的概率为 $\\text{[M]}$；(ii) $a,\\ b,\\ c$ 互不相同的概率为 $\\text{[N]}$；(iii) 求 $a > 2b > 3c$ 的概率 $p$：存在满足条件的组合时 $b$ 的范围是 $\\text{[O]} \\le b \\le \\text{[P]}$，由此 $p = \\text{[Q]}$。(2) 从 A 取 3 张、从 B 取 2 张，共 5 张。(i) 恰好 4 张奇数、1 张偶数的概率为 $\\text{[R]}$；(ii) 至少有 1 张奇数的概率为 $\\text{[S]}$。（$\\text{[O]}$，$\\text{[P]}$ 填数，其余从选项中选，选项见日文题面）",
    "hint": "(1) 三个箱子独立，总数 9³ = 729。(iii) 按 b 分类数个数。(2) 1〜9 中奇数 5 张、偶数 4 张，A 取 3 张是 9C3 = 84，B 取 2 张是 9C2 = 36。",
    "expl": "【步骤1：(i) a = b ≠ c】\nb 和 a 相同：1/9；c 和它们不同：8/9 ⇒ 8/81，选 ⓪，M=0。\n\n【步骤2：(ii) 三个都不同】\n1 × 8/9 × 7/9 = 56/81，选 ②，N=2。\n\n【步骤3：(iii) b 的范围】\nc ≧ 1 ⇒ 2b > 3c ≧ 3 ⇒ b ≧ 2；a ≦ 9 ⇒ 2b < 9 ⇒ b ≦ 4。O=2，P=4。\n\n【步骤4：(iii) 按 b 数】\nb = 2：2b = 4 > 3c ⇒ c = 1；a > 4 ⇒ a = 5〜9，5 种\nb = 3：6 > 3c ⇒ c = 1；a > 6 ⇒ 3 种\nb = 4：8 > 3c ⇒ c = 1, 2；a > 8 ⇒ a = 9，2 种\n合计 10 种 ⇒ p = 10/729，选 ⑨，Q=9。\n\n【步骤5：(2)(i) 4 奇 1 偶】\nA 3 奇、B 1 奇 1 偶：5C3/84 × (5 × 4)/36 = 10/84 × 20/36\nA 2 奇 1 偶、B 2 奇：(5C2 × 4)/84 × 5C2/36 = 40/84 × 10/36\n合计 (200 + 400)/3024 = 600/3024 = 25/126，选 ④，R=4。\n\n【步骤6：(2)(ii) 至少 1 张奇数】\n反面「全是偶数」：4C3/84 × 4C2/36 = 4/84 × 6/36 = 1/126\n1 − 1/126 = 125/126，选 ⑦，S=7。",
    "trap": "M、N、Q、R、S 填的是选项编号，不是分子。(2) 的两个箱子分别计算，不能当成从 18 张里取 5 张。",
    "variant": "「至少一个」先算反面「一个都没有」；多个箱子各自独立，概率相乘。",
    "blanks": [
      {
        "key": "M",
        "label": "[M]",
        "ans": "0",
        "len": 1
      },
      {
        "key": "N",
        "label": "[N]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "O",
        "label": "[O]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "P",
        "label": "[P]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "Q",
        "label": "[Q]",
        "ans": "9",
        "len": 1
      },
      {
        "key": "R",
        "label": "[R]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "S",
        "label": "[S]",
        "ans": "7",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{M}=0,\\ \\text{N}=2,\\ \\text{O}=2,\\ \\text{P}=4,\\ \\text{Q}=9,\\ \\text{R}=4,\\ \\text{S}=7$"
  },
  {
    "id": "real-2023-1-II1",
    "source": "2023第1回 II問1",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "数と式：3文字の因数分解と有理数の条件",
    "type": "mark",
    "mtype": "expr",
    "level": "core",
    "paperImg": "./papers/2023_1_q_p08.png",
    "ansImg": "./papers/2023_1_ans_p05.png",
    "q": "【2023第1回 II問1】$a$ は有理数とする。$x = 3 + \\sqrt{5}$，$y = a + \\sqrt{5}$，$z = -3 + \\sqrt{5}$ に対して $P = 2x^2 + 12y^2 - 2z^2 - 11xy + 5yz$ が有理数となる $a$ の値を求めよう。まず，$P$ の $x$ を含まない項の和を $12y^2 + 5yz - 2z^2 = (\\text{[A]}y - z)(\\text{[B]}y + \\text{[C]}z)$ と因数分解する。さらに，$P$ を $x$ について整理すると，$P$ は $P = \\text{[D]}$ と因数分解できる。ここで，$x - z = \\text{[E]}$，$x + z = \\text{[F]}\\sqrt{\\text{[G]}}$ と $y = a + \\sqrt{5}$ を上式に代入すると，$P$ は $P = \\text{[H]}(\\text{[I]}a + \\sqrt{5})(a - \\text{[J]} + \\sqrt{5})$ と表される。この右辺を展開し整理すると，$P$ が有理数となる $a$ の値として $a = \\dfrac{\\text{[K]}}{\\text{[L]}}$ が得られる。（$\\text{[D]}$ は選択肢から選ぶ：⓪ $(x-4y+z)(x+3y+2z)$　① $(x-4y+z)(2x-3y-2z)$　② $(x+4y-z)(x+3y+2z)$　③ $(x+4y-z)(2x+3y+2z)$　④ $(2x-4y+z)(x-3y-2z)$　⑤ $(2x-4y+z)(2x-3y-2z)$　⑥ $(2x+4y-z)(x+3y+2z)$　⑦ $(2x+4y-z)(2x+3y+2z)$）",
    "q_cn": "【2023第1回 II问1】$a$ 为有理数。对 $x = 3 + \\sqrt{5}$，$y = a + \\sqrt{5}$，$z = -3 + \\sqrt{5}$，求使 $P = 2x^2 + 12y^2 - 2z^2 - 11xy + 5yz$ 为有理数的 $a$。先把不含 $x$ 的项分解：$12y^2 + 5yz - 2z^2 = (\\text{[A]}y - z)(\\text{[B]}y + \\text{[C]}z)$；再按 $x$ 整理，$P = \\text{[D]}$（从选项中选，见日文题面）。$x - z = \\text{[E]}$，$x + z = \\text{[F]}\\sqrt{\\text{[G]}}$，代入得 $P = \\text{[H]}(\\text{[I]}a + \\sqrt{5})(a - \\text{[J]} + \\sqrt{5})$。展开整理，$P$ 为有理数时 $a = \\dfrac{\\text{[K]}}{\\text{[L]}}$。",
    "hint": "三个字母的二次式：选一个字母（x）当主角，把剩下的部分先分解，再十字相乘。最后「有理数 + (…)√5 为有理数」⇒ √5 的系数为 0。",
    "expl": "【步骤1：不含 x 的部分】\n12y² + 5yz − 2z² = (4y − z)(3y + 2z)，A=4，B=3，C=2。\n\n【步骤2：按 x 十字相乘】\nP = 2x² − 11yx + (4y − z)(3y + 2z)\n试 (x − 4y + z)(2x − 3y − 2z)：\nx 的一次项：x(−3y − 2z) + 2x(−4y + z) = −11xy + 0·xz ✓\n所以 P = (x − 4y + z)(2x − 3y − 2z)，选 ①，D=1。\n\n【步骤3：代入 x, z】\nx − z = 6，x + z = 2√5，E=6，F=2，G=5。\nx − 4y + z = (x + z) − 4y = 2√5 − 4a − 4√5 = −2(2a + √5)\n2x − 3y − 2z = 2(x − z) − 3y = 12 − 3a − 3√5 = −3(a − 4 + √5)\nP = 6(2a + √5)(a − 4 + √5)，H=6，I=2，J=4。\n\n【步骤4：展开看 √5 的系数】\n(2a + √5)(a − 4 + √5) = 2a² − 8a + 2a√5 + a√5 − 4√5 + 5 = (2a² − 8a + 5) + (3a − 4)√5\na 有理 ⇒ 要 P 有理，需 3a − 4 = 0 ⇒ a = 4/3，K=4，L=3。",
    "trap": "x − 4y + z 与 2x − 3y − 2z 都可以先提出负号整理成题目给的形式，两个负号相乘是正的 6。",
    "variant": "选择题型因式分解：直接把选项展开核对 x² 系数和 xy、xz 系数，最快。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "B",
        "label": "[B]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "C",
        "label": "[C]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "D",
        "label": "[D]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "E",
        "label": "[E]",
        "ans": "6",
        "len": 1
      },
      {
        "key": "F",
        "label": "[F]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "G",
        "label": "[G]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "H",
        "label": "[H]",
        "ans": "6",
        "len": 1
      },
      {
        "key": "I",
        "label": "[I]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "J",
        "label": "[J]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "K",
        "label": "[K]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "L",
        "label": "[L]",
        "ans": "3",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{A}=4,\\ \\text{B}=3,\\ \\text{C}=2,\\ \\text{D}=1,\\ \\text{E}=6,\\ \\text{F}=2,\\ \\text{G}=5,\\ \\text{H}=6,\\ \\text{I}=2,\\ \\text{J}=4,\\ \\text{K}=4,\\ \\text{L}=3$"
  },
  {
    "id": "real-2023-1-II2",
    "source": "2023第1回 II問2",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "2次方程式：すべての a で実数解をもつ条件",
    "type": "mark",
    "mtype": "ineq",
    "level": "stretch",
    "paperImg": "./papers/2023_1_q_p10.png",
    "ansImg": "./papers/2023_1_ans_p05.png",
    "q": "【2023第1回 II問2】$a,\\ b$ は実数とし，2つの2次方程式 $x^2 + (a - 1)x - a + 1 = 0$ ……①，$4x^2 - 4ax + 4ab - 1 = 0$ ……② を考える。(1) 方程式①が実数解をもつための条件は $a$ が不等式 $\\text{[M]} \\ge 0$ を満たすことである。したがって $a$ の範囲は $\\text{[N]}$ である。（⓪ $a^2-2a-3$　① $a^2+2a-3$　② $a^2-3a-2$　③ $a^2+3a-2$　④ $-1 \\le a \\le 3$　⑤ $a \\le -1,\\ 3 \\le a$　⑥ $-3 \\le a \\le 1$　⑦ $a \\le -3,\\ 1 \\le a$　⑧ $1 \\le a \\le 2$　⑨ $a \\le 1,\\ 2 \\le a$）(2) [条件] 方程式①が実数解をもつようなすべての $a$ に対して，方程式②が実数解をもつ。この条件を満たす $b$ の範囲を求めよう。(i) 方程式②が実数解をもつための条件は $a,\\ b$ が不等式 $\\text{[O]} \\ge 0$ を満たすことである。この左辺を $a$ の2次関数とみなし $f(a)$ とおき，平方完成して $f(a) = \\text{[P]}$ を得る。（$\\text{[O]}$：⓪ $a^2-2ab+1$　① $a^2+2ab-1$　② $a^2-4ab+\\frac{1}{4}$　③ $a^2-4ab+1$　④ $a^2+4ab-1$；$\\text{[P]}$：⑤ $(a-b)^2-b^2+1$　⑥ $(a+b)^2-b^2-1$　⑦ $(a-2b)^2-4b^2-\\frac{1}{4}$　⑧ $(a-2b)^2-4b^2+1$　⑨ $(a+2b)^2-4b^2-1$）(ii) 関数 $f(a)$ のグラフの軸の位置に注目して，範囲 $\\text{[N]}$ における $f(a)$ の最小値 $m$ を求めると，$b \\le \\text{[Q]}$ のとき $m = \\text{[R]}$，$\\text{[Q]} < b \\le \\text{[S]}$ のとき $m = \\text{[T]}$，$\\text{[S]} < b \\le \\text{[U]}$ のとき $m = \\text{[V]}$，$\\text{[U]} < b$ のとき $m = \\text{[W]}$ である。以上より，[条件] を満たす $b$ の範囲は $\\text{[X]} \\le b \\le \\text{[Y]}$ である。（$\\text{[Q]}$〜$\\text{[Y]}$：⓪ $-\\frac{19}{12}$　① $-\\frac{3}{2}$　② $-\\frac{5}{6}$　③ $-\\frac{1}{2}$　④ $\\frac{1}{2}$　⑤ $-4b+2$　⑥ $6b+8$　⑦ $12b+10$　⑧ $-2b^2+1$　⑨ $-4b^2+1$）",
    "q_cn": "【2023第1回 II问2】$a,\\ b$ 为实数，考虑二次方程 $x^2 + (a - 1)x - a + 1 = 0$ ……① 与 $4x^2 - 4ax + 4ab - 1 = 0$ ……②。(1) ① 有实数解的条件是 $\\text{[M]} \\ge 0$，所以 $a$ 的范围是 $\\text{[N]}$。(2) [条件] 对所有使 ① 有实数解的 $a$，② 都有实数解。求满足条件的 $b$ 的范围。(i) ② 有实数解的条件是 $\\text{[O]} \\ge 0$；把左边看成 $a$ 的二次函数 $f(a)$，配方得 $f(a) = \\text{[P]}$。(ii) 关注 $f(a)$ 的对称轴位置，求 $f(a)$ 在范围 $\\text{[N]}$ 上的最小值 $m$：$b \\le \\text{[Q]}$ 时 $m = \\text{[R]}$；$\\text{[Q]} < b \\le \\text{[S]}$ 时 $m = \\text{[T]}$；$\\text{[S]} < b \\le \\text{[U]}$ 时 $m = \\text{[V]}$；$\\text{[U]} < b$ 时 $m = \\text{[W]}$。所以满足条件的 $b$ 的范围是 $\\text{[X]} \\le b \\le \\text{[Y]}$。（全部为选项编号，选项见日文题面）",
    "hint": "「对所有满足 ① 的 a，② 的判别式 ≧ 0」= 判别式 f(a) 在 a 的范围上的最小值 ≧ 0。f(a) 的对称轴 a = 2b 随 b 移动，范围是两段 a ≦ −3 和 a ≧ 1，中间的空档要特别处理。",
    "expl": "【步骤1：(1) ① 的判别式】\nD = (a − 1)² − 4(−a + 1) = a² + 2a − 3 ≧ 0，选 ①，M=1。\n(a + 3)(a − 1) ≧ 0 ⇒ a ≦ −3 或 a ≧ 1，选 ⑦，N=7。\n\n【步骤2：(2)(i) ② 的判别式】\nD/4 = 4a² − 4(4ab − 1) = 4(a² − 4ab + 1) ≧ 0，选 ③，O=3。\nf(a) = a² − 4ab + 1 = (a − 2b)² − 4b² + 1，选 ⑧，P=8。\n\n【步骤3：(ii) 对称轴 a = 2b 的位置】\n范围是 a ≦ −3 和 a ≧ 1，中间空档 (−3, 1) 的中点是 −1。\n2b ≦ −3（b ≦ −3/2）：轴在左段里，m = f(2b) = −4b² + 1。Q 选 ①，R 选 ⑨。\n−3 < 2b ≦ −1（−3/2 < b ≦ −1/2）：轴在空档里且靠近 −3，m = f(−3) = 9 + 12b + 1 = 12b + 10。S 选 ③，T 选 ⑦。\n−1 < 2b ≦ 1（−1/2 < b ≦ 1/2）：轴在空档里且靠近 1，m = f(1) = 2 − 4b。U 选 ④，V 选 ⑤。\n2b > 1（b > 1/2）：轴在右段里，m = −4b² + 1。W 选 ⑨。\n\n【步骤4：m ≧ 0】\nb ≦ −3/2：−4b² + 1 ≧ 0 要 |b| ≦ 1/2，不可能。\n−3/2 < b ≦ −1/2：12b + 10 ≧ 0 ⇒ b ≧ −5/6 ⇒ −5/6 ≦ b ≦ −1/2。\n−1/2 < b ≦ 1/2：2 − 4b ≧ 0 ⇒ b ≦ 1/2，全部成立。\nb > 1/2：−4b² + 1 < 0，不行。\n合起来 −5/6 ≦ b ≦ 1/2，X 选 ②，Y 选 ④。",
    "trap": "a 的范围中间有空档，对称轴落在空档里时，最小值取「离轴较近的那个端点」，以空档中点 −1 为分界。",
    "variant": "「对所有 x，f(x) ≧ 0」= 最小值 ≧ 0；「存在 x 使 f(x) ≧ 0」= 最大值 ≧ 0。",
    "blanks": [
      {
        "key": "M",
        "label": "[M]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "N",
        "label": "[N]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "O",
        "label": "[O]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "P",
        "label": "[P]",
        "ans": "8",
        "len": 1
      },
      {
        "key": "Q",
        "label": "[Q]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "R",
        "label": "[R]",
        "ans": "9",
        "len": 1
      },
      {
        "key": "S",
        "label": "[S]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "T",
        "label": "[T]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "U",
        "label": "[U]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "V",
        "label": "[V]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "W",
        "label": "[W]",
        "ans": "9",
        "len": 1
      },
      {
        "key": "X",
        "label": "[X]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "Y",
        "label": "[Y]",
        "ans": "4",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{M}=1,\\ \\text{N}=7,\\ \\text{O}=3,\\ \\text{P}=8,\\ \\text{Q}=1,\\ \\text{R}=9,\\ \\text{S}=3,\\ \\text{T}=7,\\ \\text{U}=4,\\ \\text{V}=5,\\ \\text{W}=9,\\ \\text{X}=2,\\ \\text{Y}=4$"
  },
  {
    "id": "real-2023-1-3",
    "source": "2023第1回 III",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "集合と場合の数：使えない数字がある数",
    "type": "mark",
    "mtype": "int",
    "level": "core",
    "paperImg": "./papers/2023_1_q_p12.png",
    "ansImg": "./papers/2023_1_ans_p05.png",
    "q": "【2023第1回 III】1 から 999 までの自然数の集合 $U$ を全体集合とする。$U$ から 7，8，9 のいずれかの数字が使われている数をすべて除いた集合を $A$ とし，3，6，9 のいずれかの数字が使われている数をすべて除いた集合を $B$ とする。(1) $A$ の要素は $\\text{[ABC]}$ 個あり，$A$ と $B$ の共通部分 $A \\cap B$ の要素は $\\text{[DEF]}$ 個ある。また，$A$ の補集合と $B$ の共通部分 $\\overline{A} \\cap B$ の要素は $\\text{[GHI]}$ 個ある。(2) $A$ の要素を小さい順に並べたときの 160 番目の要素は $\\text{[JKL]}$ であり，$B$ の要素を小さい順に並べたときの 160 番目の要素は $\\text{[MNO]}$ である。(3) $B$ に属する3桁の数の中で，2番目に大きい 9 の倍数は $\\text{[PQR]}$ であり，2番目に小さい 18 の倍数は $\\text{[STU]}$ である。",
    "q_cn": "【2023第1回 III】全集 $U$ 为 1 到 999 的自然数。从 $U$ 中去掉含有 7、8、9 中任一数字的数，得到集合 $A$；去掉含有 3、6、9 中任一数字的数，得到集合 $B$。(1) $A$ 有 $\\text{[ABC]}$ 个元素，$A \\cap B$ 有 $\\text{[DEF]}$ 个元素，$\\overline{A} \\cap B$ 有 $\\text{[GHI]}$ 个元素。(2) $A$ 的元素从小到大排列，第 160 个是 $\\text{[JKL]}$；$B$ 的第 160 个是 $\\text{[MNO]}$。(3) $B$ 中的三位数里，第二大的 9 的倍数是 $\\text{[PQR]}$，第二小的 18 的倍数是 $\\text{[STU]}$。",
    "hint": "把 1〜999 补零看成三位数（001〜999）。A 只能用 0〜6 这 7 个数字 → 就是「七进制」；B 能用 0,1,2,4,5,7,8 也是 7 个数字。最后别忘了去掉 000。",
    "expl": "【步骤1：(1) 个数】\nA：每位只能用 {0,1,2,3,4,5,6}，7³ = 343，去掉 000：342，ABC=342。\nA ∩ B：每位只能用 {0,1,2,4,5}，5³ − 1 = 124，DEF=124。\nB：每位只能用 {0,1,2,4,5,7,8}，7³ − 1 = 342；Ā ∩ B = B − (A ∩ B) = 342 − 124 = 218，GHI=218。\n\n【步骤2：(2) A 的第 160 个】\nA 的数（含 000 时）正好按七进制 000, 001, …排列；去掉 000 后，第 160 个对应七进制的 160。\n160 = 3 × 49 + 1 × 7 + 6 ⇒ 七进制 316 ⇒ A 中第 160 个就是 316，JKL=316。\n\n【步骤3：(2) B 的第 160 个】\nB 的 7 个数字按大小编号：0→0，1→1，2→2，4→3，5→4，7→5，8→6。\n七进制 316 的各位 3, 1, 6 换回 B 的数字：3→4，1→1，6→8 ⇒ 418，MNO=418。\n\n【步骤4：(3) 9 的倍数（各位数字和是 9 的倍数）】\nB 的数字最大是 8，三位数字和最大 24，所以只能是 9 或 18。\n百位 8、数字和 18：后两位和为 10：(8,2)，(5,5)，(2,8) ⇒ 882，855，828。\n最大 882，第二大 855，PQR=855。\n\n【步骤5：(3) 18 的倍数（偶数且数字和是 9 的倍数）】\n从小找：108（1+0+8 = 9，偶数，数字都可用）是最小的；\n117 是奇数，126 含 6，135 含 3；144（1+4+4 = 9，偶数）是第二小，STU=144。",
    "trap": "补零后 000 不是自然数，计数时要减 1；七进制对应要从「含 000」开始数，去掉 000 后第 160 个正好对应 160。",
    "variant": "「只能用 k 个数字」的数，按大小排列就是 k 进制：第 n 个数 = n 的 k 进制表示再把数字换回来。",
    "blanks": [
      {
        "key": "ABC",
        "label": "[ABC]",
        "ans": "342",
        "len": 3
      },
      {
        "key": "DEF",
        "label": "[DEF]",
        "ans": "124",
        "len": 3
      },
      {
        "key": "GHI",
        "label": "[GHI]",
        "ans": "218",
        "len": 3
      },
      {
        "key": "JKL",
        "label": "[JKL]",
        "ans": "316",
        "len": 3
      },
      {
        "key": "MNO",
        "label": "[MNO]",
        "ans": "418",
        "len": 3
      },
      {
        "key": "PQR",
        "label": "[PQR]",
        "ans": "855",
        "len": 3
      },
      {
        "key": "STU",
        "label": "[STU]",
        "ans": "144",
        "len": 3
      }
    ],
    "ansSummary": "$\\text{ABC}=342,\\ \\text{DEF}=124,\\ \\text{GHI}=218,\\ \\text{JKL}=316,\\ \\text{MNO}=418,\\ \\text{PQR}=855,\\ \\text{STU}=144$"
  },
  {
    "id": "real-2023-1-4",
    "source": "2023第1回 IV",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "図形と計量：円に内接する五角形",
    "type": "mark",
    "mtype": "geo",
    "level": "core",
    "paperImg": "./papers/2023_1_q_p14.png",
    "ansImg": "./papers/2023_1_ans_p05.png",
    "q": "【2023第1回 IV】円 O に内接する五角形 ABCDE において $\\text{AB} = \\sqrt{3}$，$\\text{BC} = 4$，$\\text{DE} = \\sqrt{7}$，$\\text{EA} = 1$，$\\angle\\text{EAB} = 150^\\circ$ とする。このとき，円 O の半径，辺 CD の長さ，および五角形 ABCDE の面積を求めよう。(1) $\\text{EB} = \\sqrt{\\text{[A]}}$ であり，円 O の半径は $\\sqrt{\\text{[B]}}$ である。(2) $\\angle\\text{BDE} = \\text{[CD]}^\\circ$ であるから，三角形 BDE について，$\\angle\\text{DEB} = \\text{[EFG]}^\\circ$ であり，$\\text{BD} = \\sqrt{\\text{[HI]}}$ である。(3) $\\angle\\text{BCD} = \\text{[JK]}^\\circ$ である。三角形 BCD について，$\\text{CD} = x$ とおいて余弦定理を用いると，$x$ の2次方程式 $x^2 - \\text{[L]}x - \\text{[M]} = 0$ を得る。$x > 0$ であるから $x = \\text{[N]}$ である。(4) 五角形 ABCDE の面積は $\\text{[O]}\\sqrt{\\text{[P]}}$ である。",
    "q_cn": "【2023第1回 IV】圆 O 的内接五边形 ABCDE 中，$\\text{AB} = \\sqrt{3}$，$\\text{BC} = 4$，$\\text{DE} = \\sqrt{7}$，$\\text{EA} = 1$，$\\angle\\text{EAB} = 150^\\circ$。求圆 O 的半径、边 CD 的长以及五边形的面积。(1) $\\text{EB} = \\sqrt{\\text{[A]}}$，圆 O 的半径为 $\\sqrt{\\text{[B]}}$。(2) $\\angle\\text{BDE} = \\text{[CD]}^\\circ$，所以在三角形 BDE 中 $\\angle\\text{DEB} = \\text{[EFG]}^\\circ$，$\\text{BD} = \\sqrt{\\text{[HI]}}$。(3) $\\angle\\text{BCD} = \\text{[JK]}^\\circ$。设 $\\text{CD} = x$，在三角形 BCD 中用余弦定理得 $x^2 - \\text{[L]}x - \\text{[M]} = 0$，$x > 0$ 所以 $x = \\text{[N]}$。(4) 五边形 ABCDE 的面积为 $\\text{[O]}\\sqrt{\\text{[P]}}$。",
    "hint": "连对角线 EB、BD，把五边形切成三个三角形：ABE、BDE、BCD。圆内接四边形对角互补；同一条弦对的圆周角，一侧是 θ，另一侧是 180° − θ。",
    "expl": "【步骤1：(1) EB 和半径】\n△ABE：EB² = 1² + (√3)² − 2 × 1 × √3 × cos150° = 1 + 3 + 3 = 7 ⇒ EB = √7，A=7。\n正弦定理：EB/sin150° = 2R ⇒ √7 ÷ (1/2) = 2R ⇒ R = √7，B=7。\n\n【步骤2：(2) ∠BDE】\n弦 EB 在 A 一侧的圆周角是 150°，在另一侧（D 一侧）的圆周角是 180° − 150° = 30°，CD=30。\n\n【步骤3：(2) △BDE】\nDE = √7 = EB，△BDE 是等腰三角形，∠DBE = ∠BDE = 30°，∠DEB = 120°，EFG=120。\nBD² = 7 + 7 − 2 × 7 × cos120° = 14 + 7 = 21 ⇒ BD = √21，HI=21。\n\n【步骤4：(3) ∠BCD】\n四边形 BCDE 内接于圆，对角互补：∠BCD = 180° − ∠BED = 180° − 120° = 60°，JK=60。\n\n【步骤5：(3) CD】\nBD² = BC² + CD² − 2·BC·CD·cos60°：21 = 16 + x² − 4x ⇒ x² − 4x − 5 = 0，L=4，M=5。\n(x − 5)(x + 1) = 0，x > 0 ⇒ x = 5，N=5。\n\n【步骤6：(4) 面积】\n△ABE = ½ × 1 × √3 × sin150° = √3/4\n△BDE = ½ × √7 × √7 × sin120° = 7√3/4\n△BCD = ½ × 4 × 5 × sin60° = 5√3\n合计 √3/4 + 7√3/4 + 5√3 = 2√3 + 5√3 = 7√3，O=7，P=3。",
    "trap": "∠BDE 是弦 EB 在「另一侧」的圆周角，所以是 30° 不是 150°。",
    "variant": "多边形内接于圆：用对角线切成三角形，每个三角形都用「两边夹角」求面积。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "B",
        "label": "[B]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "CD",
        "label": "[CD]",
        "ans": "30",
        "len": 2
      },
      {
        "key": "EFG",
        "label": "[EFG]",
        "ans": "120",
        "len": 3
      },
      {
        "key": "HI",
        "label": "[HI]",
        "ans": "21",
        "len": 2
      },
      {
        "key": "JK",
        "label": "[JK]",
        "ans": "60",
        "len": 2
      },
      {
        "key": "L",
        "label": "[L]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "M",
        "label": "[M]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "N",
        "label": "[N]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "O",
        "label": "[O]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "P",
        "label": "[P]",
        "ans": "3",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{A}=7,\\ \\text{B}=7,\\ \\text{CD}=30,\\ \\text{EFG}=120,\\ \\text{HI}=21,\\ \\text{JK}=60,\\ \\text{L}=4,\\ \\text{M}=5,\\ \\text{N}=5,\\ \\text{O}=7,\\ \\text{P}=3$"
  },
  {
    "id": "real-2022-2-I1",
    "source": "2022第2回 I問1",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "2次関数：直線で切り取られる線分の長さ",
    "type": "mark",
    "mtype": "quad",
    "level": "core",
    "paperImg": "./papers/2022_2_q_p03.png",
    "ansImg": "./papers/2022_2_ans_p05.png",
    "q": "【2022第2回 I問1】$a \\ne 0$ とし，2次関数 $y = ax^2 + bx + c$ ……① を考える。この関数のグラフ $C$ は，直線 $y = 1$ と2点で交わり，その2点間の距離は 4，さらに，直線 $y = 3$ と2点で交わり，その2点間の距離は 6 であるとする。(1) $C$ の頂点の座標を $(p,\\ q)$ とおく。このとき，$C$ と直線 $y = 1$ との交点のひとつをとり，その $x$ 座標を $\\alpha$ とおくと $|\\alpha - p| = \\text{[A]}$ であるから，2次関数①を $a,\\ p,\\ q$ を使って表した式に交点の座標 $(\\alpha,\\ 1)$ を代入すれば，等式 $\\text{[B]}a + q = \\text{[C]}$ が成り立つことがわかる。$C$ と直線 $y = 3$ との交点に対しても同様にして，等式 $\\text{[D]}a + q = \\text{[E]}$ が成り立つ。したがって，これら2式より $a = \\dfrac{\\text{[F]}}{\\text{[G]}}$，$q = -\\dfrac{\\text{[H]}}{\\text{[I]}}$ を得る。(2) さらに，$C$ が点 $\\left(2,\\ -\\dfrac{1}{5}\\right)$ を通り，$C$ の頂点の $x$ 座標 $p$ が 2 より小さいとすると $b = -\\dfrac{\\text{[J]}}{\\text{[K]}}$，$c = -\\dfrac{\\text{[L]}}{\\text{[M]}}$ である。",
    "q_cn": "【2022第2回 I问1】$a \\ne 0$，考虑二次函数 $y = ax^2 + bx + c$ ……①。其图象 $C$ 与直线 $y = 1$ 交于两点，两点距离为 4；与直线 $y = 3$ 交于两点，距离为 6。(1) 设 $C$ 的顶点为 $(p,\\ q)$。取 $C$ 与 $y = 1$ 的一个交点，横坐标为 $\\alpha$，则 $|\\alpha - p| = \\text{[A]}$；把 $(\\alpha,\\ 1)$ 代入用 $a,\\ p,\\ q$ 表示的式子，得 $\\text{[B]}a + q = \\text{[C]}$。同理由 $y = 3$ 得 $\\text{[D]}a + q = \\text{[E]}$。所以 $a = \\dfrac{\\text{[F]}}{\\text{[G]}}$，$q = -\\dfrac{\\text{[H]}}{\\text{[I]}}$。(2) 若 $C$ 还经过点 $\\left(2,\\ -\\dfrac{1}{5}\\right)$，且顶点横坐标 $p$ 小于 2，则 $b = -\\dfrac{\\text{[J]}}{\\text{[K]}}$，$c = -\\dfrac{\\text{[L]}}{\\text{[M]}}$。",
    "hint": "抛物线左右对称：被水平线截出的两点关于对称轴对称，每个交点到对称轴的距离是线段长的一半。用顶点式 y = a(x − p)² + q 代入。",
    "expl": "【步骤1：交点到对称轴的距离】\ny = 1 截出长 4，两个交点关于 x = p 对称，所以 |α − p| = 2，A=2。\n\n【步骤2：代入顶点式】\ny = a(x − p)² + q，代入 (α, 1)：a(α − p)² + q = 1 ⇒ 4a + q = 1，B=4，C=1。\ny = 3 截出长 6，到轴的距离 3：9a + q = 3，D=9，E=3。\n\n【步骤3：解方程组】\n两式相减：5a = 2 ⇒ a = 2/5，F=2，G=5。\nq = 1 − 4 × 2/5 = −3/5，H=3，I=5。\n\n【步骤4：(2) 用点 (2, −1/5) 求 p】\ny = (2/5)(x − p)² − 3/5，代入 x = 2：(2/5)(2 − p)² − 3/5 = −1/5 ⇒ (2 − p)² = 1 ⇒ p = 1 或 3。\np < 2 ⇒ p = 1。\n\n【步骤5：展开求 b, c】\ny = (2/5)(x − 1)² − 3/5 = (2/5)x² − (4/5)x + 2/5 − 3/5 = (2/5)x² − (4/5)x − 1/5\nb = −4/5，c = −1/5，J=4，K=5，L=1，M=5。",
    "trap": "|α − p| 是线段长的一半（2），不是 4。",
    "variant": "「被直线截得的弦长」→ 一半长度就是交点到对称轴的距离，配合顶点式最快。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "B",
        "label": "[B]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "C",
        "label": "[C]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "D",
        "label": "[D]",
        "ans": "9",
        "len": 1
      },
      {
        "key": "E",
        "label": "[E]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "F",
        "label": "[F]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "G",
        "label": "[G]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "H",
        "label": "[H]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "I",
        "label": "[I]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "J",
        "label": "[J]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "K",
        "label": "[K]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "L",
        "label": "[L]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "M",
        "label": "[M]",
        "ans": "5",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{A}=2,\\ \\text{B}=4,\\ \\text{C}=1,\\ \\text{D}=9,\\ \\text{E}=3,\\ \\text{F}=2,\\ \\text{G}=5,\\ \\text{H}=3,\\ \\text{I}=5,\\ \\text{J}=4,\\ \\text{K}=5,\\ \\text{L}=1,\\ \\text{M}=5$"
  },
  {
    "id": "real-2022-2-I2",
    "source": "2022第2回 I問2",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "確率：つながっている目が続く試行",
    "type": "mark",
    "mtype": "prob",
    "level": "core",
    "paperImg": "./papers/2022_2_q_p04.png",
    "ansImg": "./papers/2022_2_ans_p05.png",
    "q": "【2022第2回 I問2】2つの整数 $m$ と $n$ が「つながっている」とは，$n$ が $m-1,\\ m,\\ m+1$ のどれかであることと定義する。1つのサイコロを投げる操作を繰り返す試行を行う。まず1回目を投げる。2回目以降の操作では，直前の操作で出た目とつながっている目が出たならば次の操作に進むが，つながっていない目が出たならばそこで試行は終了とする。(1) 2回目の操作を終えた時点で，試行が終了していない確率は $\\dfrac{\\text{[N]}}{\\text{[O]}}$ である。(2) 2回目の操作で，試行が終了する確率は $\\dfrac{\\text{[P]}}{\\text{[Q]}}$ である。(3) 3回目の操作を終えた時点で，試行が終了していない確率は $\\text{[R]}$ である。(4) 3回以下の操作で，試行が終了する確率は $\\text{[S]}$ である。(5) 3回目の操作で，試行が終了する確率は $\\text{[T]}$ である。（$\\text{[R]}$，$\\text{[S]}$，$\\text{[T]}$ は選択肢から選ぶ：⓪ $\\frac{12}{27}$　① $\\frac{16}{27}$　② $\\frac{11}{54}$　③ $\\frac{13}{54}$　④ $\\frac{19}{54}$　⑤ $\\frac{37}{54}$　⑥ $\\frac{41}{54}$　⑦ $\\frac{43}{54}$　⑧ $\\frac{49}{108}$　⑨ $\\frac{71}{108}$）",
    "q_cn": "【2022第2回 I问2】定义两个整数 $m$ 和 $n$「相连」：$n$ 是 $m-1,\\ m,\\ m+1$ 中的一个。反复掷一颗骰子：先掷第 1 次；从第 2 次起，若掷出的点数与前一次相连就继续，不相连则试验结束。(1) 第 2 次掷完时试验还没结束的概率为 $\\dfrac{\\text{[N]}}{\\text{[O]}}$。(2) 在第 2 次结束的概率为 $\\dfrac{\\text{[P]}}{\\text{[Q]}}$。(3) 第 3 次掷完时还没结束的概率为 $\\text{[R]}$。(4) 在 3 次以内结束的概率为 $\\text{[S]}$。(5) 恰好在第 3 次结束的概率为 $\\text{[T]}$。（$\\text{[R]}$，$\\text{[S]}$，$\\text{[T]}$ 从选项中选，见日文题面）",
    "hint": "和 m 相连的点数个数：m = 1 或 6 时只有 2 个，m = 2〜5 时有 3 个。三次都相连时，按中间那次的点数分类：前后各有 d(m) 种。",
    "expl": "【步骤1：相连的点数个数 d(m)】\nd(1) = d(6) = 2，d(2) = d(3) = d(4) = d(5) = 3。\n\n【步骤2：(1)(2) 两次】\n两次相连的组合数：Σ d(m) = 2 + 3 × 4 + 2 = 16 ⇒ 16/36 = 4/9，N=4，O=9。\n第 2 次结束：1 − 4/9 = 5/9，P=5，Q=9。\n\n【步骤3：(3) 三次都相连】\n以第 2 次的点数 m 为中心：第 1 次有 d(m) 种，第 3 次也有 d(m) 种。\nΣ d(m)² = 4 + 9 × 4 + 4 = 44 ⇒ 44/216 = 11/54，选 ②，R=2。\n\n【步骤4：(4) 3 次以内结束】\n1 − 11/54 = 43/54，选 ⑦，S=7。\n\n【步骤5：(5) 恰好第 3 次结束】\n「第 2 次后还没结束」−「第 3 次后还没结束」= 4/9 − 11/54 = 24/54 − 11/54 = 13/54，选 ③，T=3。",
    "trap": "R、S、T 是选项编号；「第 3 次结束」= 第 2 次没结束且第 3 次结束，用两个「没结束」概率相减最快。",
    "variant": "连续试验的概率，抓「中间那一步」分类，前后对称地计数。",
    "blanks": [
      {
        "key": "N",
        "label": "[N]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "O",
        "label": "[O]",
        "ans": "9",
        "len": 1
      },
      {
        "key": "P",
        "label": "[P]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "Q",
        "label": "[Q]",
        "ans": "9",
        "len": 1
      },
      {
        "key": "R",
        "label": "[R]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "S",
        "label": "[S]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "T",
        "label": "[T]",
        "ans": "3",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{N}=4,\\ \\text{O}=9,\\ \\text{P}=5,\\ \\text{Q}=9,\\ \\text{R}=2,\\ \\text{S}=7,\\ \\text{T}=3$"
  },
  {
    "id": "real-2022-2-1",
    "source": "2022第2回 II問1",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "不等式：連立不等式の整数解（文章題）",
    "type": "mark",
    "mtype": "ineq",
    "level": "core",
    "paperImg": "./papers/2022_2_q_p05.png",
    "ansImg": "./papers/2022_2_ans_p05.png",
    "q": "【2022第2回 II問1】数字 3 が書いてある青いカードと，数字 2 が書いてある赤いカードが何枚かある。赤いカードの枚数は青いカードの枚数より多く，青いカードの枚数の 2 倍より少ない。また，全部のカードに書いてある数の和は 70 とする。それぞれの色のカードの枚数を求めよう。青いカードの枚数を $x$，赤いカードの枚数を $y$ とすると $x < y < \\text{[A]}x$，$\\text{[B]}x + \\text{[C]}y = 70$ が成り立つ。したがって，2つの式から $y$ を消去すると $\\text{[D]}x < 70 < \\text{[E]}x$ が得られる。よって $\\text{[FG]} < x < \\text{[HI]}$ である。また，等式 $\\text{[B]}x + \\text{[C]}y = 70$ より，$x$ は $\\text{[J]}$ の倍数であるから $x = \\text{[KL]}$，$y = \\text{[MN]}$ である。",
    "q_cn": "【2022第2回 II问1】有写着 3 的蓝卡和写着 2 的红卡若干张。红卡比蓝卡多，但少于蓝卡的 2 倍；所有卡上数字之和为 70。设蓝卡 $x$ 张、红卡 $y$ 张，则 $x < y < \\text{[A]}x$，$\\text{[B]}x + \\text{[C]}y = 70$。消去 $y$ 得 $\\text{[D]}x < 70 < \\text{[E]}x$，所以 $\\text{[FG]} < x < \\text{[HI]}$。又由等式知 $x$ 是 $\\text{[J]}$ 的倍数，所以 $x = \\text{[KL]}$，$y = \\text{[MN]}$。",
    "hint": "把 x < y < 2x 两边乘 2，再把 2y 换成 70 − 3x，y 就消掉了。",
    "expl": "【步骤1：列式】\nx < y < 2x，3x + 2y = 70，A=2，B=3，C=2。\n\n【步骤2：消去 y】\n2x < 2y < 4x，而 2y = 70 − 3x：2x < 70 − 3x < 4x ⇒ 5x < 70 < 7x，D=5，E=7。\n\n【步骤3：x 的范围】\n5x < 70 ⇒ x < 14；70 < 7x ⇒ x > 10。10 < x < 14，FG=10，HI=14。\n\n【步骤4：奇偶性】\n3x = 70 − 2y 是偶数 ⇒ x 是偶数，J=2。11, 12, 13 中只有 x = 12。\ny = (70 − 36)/2 = 17，KL=12，MN=17。\n检查：12 < 17 < 24 ✓。",
    "trap": "消 y 时三边都乘 2，再用等式替换，别只换一边。",
    "variant": "应用题中的整数解：先用不等式卡范围，再用整除（奇偶、倍数）锁定。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "B",
        "label": "[B]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "C",
        "label": "[C]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "D",
        "label": "[D]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "E",
        "label": "[E]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "FG",
        "label": "[FG]",
        "ans": "10",
        "len": 2
      },
      {
        "key": "HI",
        "label": "[HI]",
        "ans": "14",
        "len": 2
      },
      {
        "key": "J",
        "label": "[J]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "KL",
        "label": "[KL]",
        "ans": "12",
        "len": 2
      },
      {
        "key": "MN",
        "label": "[MN]",
        "ans": "17",
        "len": 2
      }
    ],
    "ansSummary": "$\\text{A}=2,\\ \\text{B}=3,\\ \\text{C}=2,\\ \\text{D}=5,\\ \\text{E}=7,\\ \\text{FG}=10,\\ \\text{HI}=14,\\ \\text{J}=2,\\ \\text{KL}=12,\\ \\text{MN}=17$"
  },
  {
    "id": "real-2022-2-II2",
    "source": "2022第2回 II問2",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "2次方程式：解の差が整数になる条件",
    "type": "mark",
    "mtype": "ineq",
    "level": "core",
    "paperImg": "./papers/2022_2_q_p06.png",
    "ansImg": "./papers/2022_2_ans_p05.png",
    "q": "【2022第2回 II問2】$x$ の2次方程式 $x^2 + 2ax + 4a^2 - 10a + 7 = 0$ が異なる2つの実数解 $\\alpha,\\ \\beta\\ (\\alpha > \\beta)$ をもつとき，$\\alpha - \\beta$ が整数で，かつ，2の倍数であるような定数 $a$ の値を求めよう。この2次方程式が異なる2つの実数解をもつための $a$ の値の範囲は $\\text{[O]} < a < \\dfrac{\\text{[P]}}{\\text{[Q]}}$ である。また $\\alpha - \\beta = \\text{[R]}\\sqrt{-\\text{[S]}a^2 + 10a - \\text{[T]}}$ である。$\\text{[O]} < a < \\dfrac{\\text{[P]}}{\\text{[Q]}}$ のとき $-\\text{[S]}a^2 + 10a - \\text{[T]}$ の最大値は $\\dfrac{\\text{[U]}}{\\text{[V]}}$ である。ここで，$\\alpha - \\beta$ が2の倍数であるから $-\\text{[S]}a^2 + 10a - \\text{[T]} = \\text{[W]}$ となり，$a = \\dfrac{\\text{[X]}}{\\text{[Y]}}$，$\\text{[Z]}$ である。",
    "q_cn": "【2022第2回 II问2】关于 $x$ 的二次方程 $x^2 + 2ax + 4a^2 - 10a + 7 = 0$ 有两个不同实数解 $\\alpha,\\ \\beta\\ (\\alpha > \\beta)$，求使 $\\alpha - \\beta$ 为整数且为 2 的倍数的常数 $a$。有两个不同实数解的范围是 $\\text{[O]} < a < \\dfrac{\\text{[P]}}{\\text{[Q]}}$。$\\alpha - \\beta = \\text{[R]}\\sqrt{-\\text{[S]}a^2 + 10a - \\text{[T]}}$。在该范围内 $-\\text{[S]}a^2 + 10a - \\text{[T]}$ 的最大值为 $\\dfrac{\\text{[U]}}{\\text{[V]}}$。因为 $\\alpha - \\beta$ 是 2 的倍数，所以 $-\\text{[S]}a^2 + 10a - \\text{[T]} = \\text{[W]}$，得 $a = \\dfrac{\\text{[X]}}{\\text{[Y]}}$，$\\text{[Z]}$。",
    "hint": "两根之差 = √D / |x² 的系数|。x 的系数是偶数 2a 时用 D/4：α − β = 2√(D/4)。",
    "expl": "【步骤1：判别式】\nD/4 = a² − (4a² − 10a + 7) = −3a² + 10a − 7 > 0 ⇒ 3a² − 10a + 7 < 0 ⇒ (a − 1)(3a − 7) < 0\n1 < a < 7/3，O=1，P=7，Q=3。\n\n【步骤2：两根之差】\nα, β = −a ± √(D/4)，α − β = 2√(−3a² + 10a − 7)，R=2，S=3，T=7。\n\n【步骤3：根号内的最大值】\n−3a² + 10a − 7 = −3(a − 5/3)² + 4/3，顶点 a = 5/3 在范围内，最大值 4/3，U=4，V=3。\n\n【步骤4：2 的倍数】\nα − β = 2√k（k = −3a² + 10a − 7，0 < k ≦ 4/3）是 2 的倍数 ⇔ √k 是正整数。\n0 < √k ≦ √(4/3) ≈ 1.15 ⇒ √k = 1 ⇒ k = 1，W=1。\n\n【步骤5：解 a】\n−3a² + 10a − 7 = 1 ⇒ 3a² − 10a + 8 = 0 ⇒ (3a − 4)(a − 2) = 0 ⇒ a = 4/3，2\n都在 1 < a < 7/3 内，X=4，Y=3，Z=2。",
    "trap": "k 不能是 0（两根相同），所以 √k 只能等于 1。",
    "variant": "两根之差 |α − β| = √D/|a|；两根之和、之积用韦达定理。",
    "blanks": [
      {
        "key": "O",
        "label": "[O]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "P",
        "label": "[P]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "Q",
        "label": "[Q]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "R",
        "label": "[R]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "S",
        "label": "[S]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "T",
        "label": "[T]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "U",
        "label": "[U]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "V",
        "label": "[V]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "W",
        "label": "[W]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "X",
        "label": "[X]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "Y",
        "label": "[Y]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "Z",
        "label": "[Z]",
        "ans": "2",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{O}=1,\\ \\text{P}=7,\\ \\text{Q}=3,\\ \\text{R}=2,\\ \\text{S}=3,\\ \\text{T}=7,\\ \\text{U}=4,\\ \\text{V}=3,\\ \\text{W}=1,\\ \\text{X}=4,\\ \\text{Y}=3,\\ \\text{Z}=2$"
  },
  {
    "id": "real-2022-2-3",
    "source": "2022第2回 III",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "整数：3でも5でも割り切れない数",
    "type": "mark",
    "mtype": "int",
    "level": "core",
    "paperImg": "./papers/2022_2_q_p07.png",
    "ansImg": "./papers/2022_2_ans_p05.png",
    "q": "【2022第2回 III】3 でも 5 でも割り切れない正の整数全体の集合を $S$ とおく。(1) 正の整数 $a$ を 15 で割ったときの商を $q$，余りを $r$ とすると $a = \\text{[AB]}q + r$，ただし $\\text{[C]} \\le r \\le \\text{[DE]}$ が成り立つ。特に $a \\in S$ ならば，$r$ は $\\text{[F]}$ の $\\text{[G]}$ 個の整数のいずれかである。（$\\text{[F]}$：⓪ 0,2,4,6,8,10,12,14　① 1,3,5,7,9,11,13　② 0,1,2,4,7,8,11,13,14　③ 1,2,4,7,8,11,13,14　④ 1,2,4,7,8,10,11,13,14）(2) $S$ の要素を小さい順に並べたとき，小さい方から数えて 50 番目の整数は $\\text{[HI]}$ である。(3) $a \\in S$，$a \\le 50$ を満たす $a$ の個数 $n$ を求めよう。$a \\in S$，$a \\le 45$ を満たす $a$ の個数は $\\text{[JK]}$ であるから，$n = \\text{[LM]}$ である。(4) $30 \\le a < b \\le 45$ を満たす $S$ の2つの要素 $a,\\ b$ で，$a + b$ を 15 で割ると 2 余るような $a,\\ b$ は $a = \\text{[NO]}$，$b = \\text{[PQ]}$ である。",
    "q_cn": "【2022第2回 III】设既不能被 3 整除、也不能被 5 整除的正整数全体为集合 $S$。(1) 正整数 $a$ 除以 15 的商为 $q$、余数为 $r$，则 $a = \\text{[AB]}q + r$，$\\text{[C]} \\le r \\le \\text{[DE]}$。若 $a \\in S$，则 $r$ 是 $\\text{[F]}$ 这 $\\text{[G]}$ 个整数之一（$\\text{[F]}$ 从选项中选，见日文题面）。(2) $S$ 的元素从小到大第 50 个是 $\\text{[HI]}$。(3) 求满足 $a \\in S$，$a \\le 50$ 的个数 $n$：$a \\le 45$ 的有 $\\text{[JK]}$ 个，所以 $n = \\text{[LM]}$。(4) $S$ 中满足 $30 \\le a < b \\le 45$ 且 $a + b$ 除以 15 余 2 的是 $a = \\text{[NO]}$，$b = \\text{[PQ]}$。",
    "hint": "以 15 为一个周期：每 15 个连续整数里，不被 3、5 整除的余数固定是 1, 2, 4, 7, 8, 11, 13, 14 这 8 个。",
    "expl": "【步骤1：(1) 余数】\na = 15q + r，0 ≦ r ≦ 14，AB=15，C=0，DE=14。\na 不被 3、5 整除 ⇔ r 不被 3、5 整除（15 是 3 和 5 的倍数）：r = 1, 2, 4, 7, 8, 11, 13, 14，选 ③，G=8。\n\n【步骤2：(2) 第 50 个】\n每 15 个数里有 8 个。50 = 8 × 6 + 2：前 6 个周期（1〜90）有 48 个，第 49、50 个是 91、92。\nHI=92。\n\n【步骤3：(3) 50 以下的个数】\n1〜45 是 3 个周期：24 个，JK=24。\n46〜50：46（余1 ✓），47（余2 ✓），48（被3整除 ✗），49（余4 ✓），50（被5整除 ✗）。\nn = 24 + 3 = 27，LM=27。\n\n【步骤4：(4) 30〜45 之间】\nS 中的数：31, 32, 34, 37, 38, 41, 43, 44（余数 1, 2, 4, 7, 8, 11, 13, 14）。\na + b ≡ 2（mod 15）：余数之和 ≡ 2，可能是 1 + 1（同一个数，不行）或 4 + 13 = 17 ≡ 2。\n所以 a = 34，b = 43，NO=34，PQ=43。",
    "trap": "(1) 选 ③ 不是 ②：余数 0 表示被 15 整除，不在 S 里。",
    "variant": "「不被 p, q 整除的数」用 pq 为周期，在一个周期里列出所有余数。",
    "blanks": [
      {
        "key": "AB",
        "label": "[AB]",
        "ans": "15",
        "len": 2
      },
      {
        "key": "C",
        "label": "[C]",
        "ans": "0",
        "len": 1
      },
      {
        "key": "DE",
        "label": "[DE]",
        "ans": "14",
        "len": 2
      },
      {
        "key": "F",
        "label": "[F]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "G",
        "label": "[G]",
        "ans": "8",
        "len": 1
      },
      {
        "key": "HI",
        "label": "[HI]",
        "ans": "92",
        "len": 2
      },
      {
        "key": "JK",
        "label": "[JK]",
        "ans": "24",
        "len": 2
      },
      {
        "key": "LM",
        "label": "[LM]",
        "ans": "27",
        "len": 2
      },
      {
        "key": "NO",
        "label": "[NO]",
        "ans": "34",
        "len": 2
      },
      {
        "key": "PQ",
        "label": "[PQ]",
        "ans": "43",
        "len": 2
      }
    ],
    "ansSummary": "$\\text{AB}=15,\\ \\text{C}=0,\\ \\text{DE}=14,\\ \\text{F}=3,\\ \\text{G}=8,\\ \\text{HI}=92,\\ \\text{JK}=24,\\ \\text{LM}=27,\\ \\text{NO}=34,\\ \\text{PQ}=43$"
  },
  {
    "id": "real-2022-2-4",
    "source": "2022第2回 IV",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "図形と計量：半円に接する線分と面積比",
    "type": "mark",
    "mtype": "geo",
    "level": "stretch",
    "paperImg": "./papers/2022_2_q_p08.png",
    "ansImg": "./papers/2022_2_ans_p05.png",
    "q": "【2022第2回 IV】長方形 ABCD の内部に，辺 BC を直径とする半円 O があり，辺 AB を $1 : 3$ に内分する点を P とするとき，線分 DP は点 T で半円 O に接しているとする。（図：A 左上，D 右上，B 左下，C 右下，P は AB 上）(1) はじめに，三角形 PBT と三角形 DCT の面積比の値を求める。仮定より，$\\text{PB} = \\dfrac{\\text{[A]}}{\\text{[B]}}\\text{AB}$ である。したがって，$\\text{PD} = \\dfrac{\\text{[C]}}{\\text{[D]}}\\text{AB}$ であり，長方形の縦と横の長さの比は $\\text{AB} : \\text{BC} = \\text{[E]} : \\sqrt{\\text{[F]}}$ であることがわかる。また，辺 BC の中点を M とすると，$\\text{PB} : \\text{MC} = \\sqrt{\\text{[G]}} : \\text{[H]}$ であるから $\\text{BT} : \\text{CT} = \\sqrt{\\text{[I]}} : \\text{[J]}$ となる。したがって $\\dfrac{\\triangle\\text{PBT}}{\\triangle\\text{MCT}} = \\dfrac{\\text{[K]}}{\\text{[L]}}$，$\\dfrac{\\triangle\\text{MBT}}{\\triangle\\text{DCT}} = \\dfrac{\\text{[M]}}{\\text{[N]}}$ となるから，$\\dfrac{\\triangle\\text{PBT}}{\\triangle\\text{DCT}} = \\dfrac{\\text{[O]}}{\\text{[PQ]}}$ である。(2) 次に，$\\cos\\angle\\text{DCT}$ の値を求める。$\\angle\\text{PBT} = \\theta$ とおく。このとき $\\tan\\theta = \\dfrac{\\sqrt{\\text{[R]}}}{\\text{[S]}}$，$\\cos\\theta = \\dfrac{\\text{[T]}\\sqrt{\\text{[U]}}}{\\text{[V]}}$ であるから $\\cos\\angle\\text{DCT} = \\dfrac{\\sqrt{\\text{[WX]}}}{\\text{[Y]}}$ を得る。",
    "q_cn": "【2022第2回 IV】长方形 ABCD 内有以 BC 为直径的半圆 O；P 是把 AB 分成 $1 : 3$ 的点（AP : PB = 1 : 3），线段 DP 与半圆切于 T。(1) 求三角形 PBT 与 DCT 的面积比：$\\text{PB} = \\dfrac{\\text{[A]}}{\\text{[B]}}\\text{AB}$，所以 $\\text{PD} = \\dfrac{\\text{[C]}}{\\text{[D]}}\\text{AB}$，$\\text{AB} : \\text{BC} = \\text{[E]} : \\sqrt{\\text{[F]}}$。设 BC 的中点为 M，$\\text{PB} : \\text{MC} = \\sqrt{\\text{[G]}} : \\text{[H]}$，所以 $\\text{BT} : \\text{CT} = \\sqrt{\\text{[I]}} : \\text{[J]}$。于是 $\\dfrac{\\triangle\\text{PBT}}{\\triangle\\text{MCT}} = \\dfrac{\\text{[K]}}{\\text{[L]}}$，$\\dfrac{\\triangle\\text{MBT}}{\\triangle\\text{DCT}} = \\dfrac{\\text{[M]}}{\\text{[N]}}$，$\\dfrac{\\triangle\\text{PBT}}{\\triangle\\text{DCT}} = \\dfrac{\\text{[O]}}{\\text{[PQ]}}$。(2) 设 $\\angle\\text{PBT} = \\theta$，则 $\\tan\\theta = \\dfrac{\\sqrt{\\text{[R]}}}{\\text{[S]}}$，$\\cos\\theta = \\dfrac{\\text{[T]}\\sqrt{\\text{[U]}}}{\\text{[V]}}$，所以 $\\cos\\angle\\text{DCT} = \\dfrac{\\sqrt{\\text{[WX]}}}{\\text{[Y]}}$。",
    "hint": "AB ⊥ BC、DC ⊥ BC，所以 AB、DC 都和半圆相切：从 P 引的两条切线 PB = PT，从 D 引的 DC = DT。再用直角三角形 APD 求 BC。",
    "expl": "【步骤1：设 AB = 4】\nAP = 1，PB = 3 ⇒ PB = (3/4)AB，A=3，B=4。\n\n【步骤2：切线长相等】\nPB、PT 都是从 P 到半圆的切线：PT = PB = 3；DC、DT 是从 D 的切线：DT = DC = 4。\nPD = PT + TD = 7 = (7/4)AB，C=7，D=4。\n\n【步骤3：长方形的比】\n直角三角形 APD：AD² = PD² − AP² = 49 − 1 = 48 ⇒ AD = BC = 4√3。\nAB : BC = 4 : 4√3 = 1 : √3，E=1，F=3。\n\n【步骤4：PB : MC 与 BT : CT】\nMC = 2√3，PB : MC = 3 : 2√3 = √3 : 2，G=3，H=2。\nBT 是两条切线的「弦」，所以 BT ⊥ PM；又 ∠BTC = 90°（直径所对的圆周角），所以 PM ∥ TC，∠TCB = ∠PMB。\n直角三角形 BTC 中 BT/CT = tan∠TCB = tan∠PMB = PB/MB = 3/(2√3) = √3/2 ⇒ BT : CT = √3 : 2，I=3，J=2。\n\n【步骤5：面积比】\n∠PBT = 90° − ∠TBC = ∠TCB = ∠MCT，所以 △PBT/△MCT = (PB × BT)/(MC × CT) = (√3/2) × (√3/2) = 3/4，K=3，L=4。\n∠DCT = 90° − ∠TCB = ∠TBC = ∠MBT，所以 △MBT/△DCT = (MB × BT)/(DC × CT) = (2√3/4) × (√3/2) = 3/4，M=3，N=4。\nM 是 BC 中点，△MBT = △MCT，所以 △PBT/△DCT = 3/4 × 3/4 = 9/16，O=9，PQ=16。\n\n【步骤6：(2) 角】\nθ = ∠PBT = ∠TCB，tanθ = BT/CT = √3/2，R=3，S=2。\ncosθ = 2/√(3 + 4) = 2/√7 = 2√7/7，T=2，U=7，V=7。\n∠DCT = 90° − θ ⇒ cos∠DCT = sinθ = √3/√7 = √21/7，WX=21，Y=7。",
    "trap": "AB、DC 垂直于直径 BC 的端点，所以它们是半圆的切线；这是整题的出发点。",
    "variant": "切线长定理 + 「直径所对圆周角 90°」+ 「两切线的切点连线垂直于圆心连线」是圆的三件套。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "B",
        "label": "[B]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "C",
        "label": "[C]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "D",
        "label": "[D]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "E",
        "label": "[E]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "F",
        "label": "[F]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "G",
        "label": "[G]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "H",
        "label": "[H]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "I",
        "label": "[I]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "J",
        "label": "[J]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "K",
        "label": "[K]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "L",
        "label": "[L]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "M",
        "label": "[M]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "N",
        "label": "[N]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "O",
        "label": "[O]",
        "ans": "9",
        "len": 1
      },
      {
        "key": "PQ",
        "label": "[PQ]",
        "ans": "16",
        "len": 2
      },
      {
        "key": "R",
        "label": "[R]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "S",
        "label": "[S]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "T",
        "label": "[T]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "U",
        "label": "[U]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "V",
        "label": "[V]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "WX",
        "label": "[WX]",
        "ans": "21",
        "len": 2
      },
      {
        "key": "Y",
        "label": "[Y]",
        "ans": "7",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{A}=3,\\ \\text{B}=4,\\ \\text{C}=7,\\ \\text{D}=4,\\ \\text{E}=1,\\ \\text{F}=3,\\ \\text{G}=3,\\ \\text{H}=2,\\ \\text{I}=3,\\ \\text{J}=2,\\ \\text{K}=3,\\ \\text{L}=4,\\ \\text{M}=3,\\ \\text{N}=4,\\ \\text{O}=9,\\ \\text{PQ}=16,\\ \\text{R}=3,\\ \\text{S}=2,\\ \\text{T}=2,\\ \\text{U}=7,\\ \\text{V}=7,\\ \\text{WX}=21,\\ \\text{Y}=7$"
  },
  {
    "id": "real-2022-1-I1",
    "source": "2022第1回 I問1",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "2次関数：頂点が線分上を動くときの値の範囲",
    "type": "mark",
    "mtype": "quad",
    "level": "core",
    "paperImg": "./papers/2022_1_q_p03.png",
    "ansImg": "./papers/2022_1_ans_p05.png",
    "q": "【2022第1回 I問1】$a,\\ b$ を定数とし，2次関数 $f(x) = x^2 + ax + b$ と1次関数 $h(x) = -2x$ を考える。関数 $y = h(x)$ のグラフと直線 $x = 3$ との交点を A，関数 $y = h(x)$ のグラフと直線 $x = -2$ との交点を B とする。関数 $y = f(x)$ のグラフの頂点 P が線分 AB 上にあるとき，$L = \\{f(3) - h(3)\\} + \\{f(-2) - h(-2)\\}$ の値の範囲を求めよう。点 P の座標は $\\left(-\\dfrac{a}{\\text{[A]}},\\ -\\dfrac{a^2}{\\text{[B]}} + b\\right)$ である。点 P が線分 AB 上にあるから，$a$ の値の範囲は $-\\text{[C]} \\le a \\le \\text{[D]}$ である。また，$a,\\ b$ は $b = \\dfrac{a^2}{\\text{[E]}} + a$ を満たす。よって，$L$ は $a$ を用いて $L = \\dfrac{1}{2}a^2 + \\text{[F]}a + \\text{[GH]}$ と表される。したがって，$L$ の値の範囲は $\\dfrac{\\text{[IJ]}}{\\text{[K]}} \\le L \\le \\text{[LM]}$ である。",
    "q_cn": "【2022第1回 I问1】$a,\\ b$ 为常数，考虑二次函数 $f(x) = x^2 + ax + b$ 与一次函数 $h(x) = -2x$。$y = h(x)$ 的图象与直线 $x = 3$ 交于 A，与直线 $x = -2$ 交于 B。当 $y = f(x)$ 的顶点 P 在线段 AB 上时，求 $L = \\{f(3) - h(3)\\} + \\{f(-2) - h(-2)\\}$ 的取值范围。P 的坐标为 $\\left(-\\dfrac{a}{\\text{[A]}},\\ -\\dfrac{a^2}{\\text{[B]}} + b\\right)$。P 在线段 AB 上，所以 $-\\text{[C]} \\le a \\le \\text{[D]}$，且 $b = \\dfrac{a^2}{\\text{[E]}} + a$。于是 $L = \\dfrac{1}{2}a^2 + \\text{[F]}a + \\text{[GH]}$，所以 $\\dfrac{\\text{[IJ]}}{\\text{[K]}} \\le L \\le \\text{[LM]}$。",
    "hint": "顶点在线段 AB 上 = 顶点满足 y = −2x，且 x 坐标在 −2 和 3 之间。把 b 用 a 表示后，L 就是 a 的二次函数，在区间上求最大最小。",
    "expl": "【步骤1：顶点】\nf(x) = (x + a/2)² − a²/4 + b，P(−a/2, −a²/4 + b)，A=2，B=4。\n\n【步骤2：P 在线段 AB 上】\nA(3, −6)，B(−2, 4)，线段在直线 y = −2x 上，x 从 −2 到 3。\n−2 ≦ −a/2 ≦ 3 ⇒ −6 ≦ a ≦ 4，C=6，D=4。\nP 在 y = −2x 上：−a²/4 + b = −2 × (−a/2) = a ⇒ b = a²/4 + a，E=4。\n\n【步骤3：L 用 a 表示】\nf(3) − h(3) = 9 + 3a + b + 6 = 15 + 3a + b\nf(−2) − h(−2) = 4 − 2a + b − 4 = −2a + b\nL = 15 + a + 2b = 15 + a + a²/2 + 2a = (1/2)a² + 3a + 15，F=3，GH=15。\n\n【步骤4：在 −6 ≦ a ≦ 4 上求范围】\nL = (1/2)(a + 3)² + 21/2，对称轴 a = −3 在区间内：最小值 21/2。\n离 −3 较远的端点是 a = 4：L = 8 + 12 + 15 = 35（a = −6 时 L = 15）。\n21/2 ≦ L ≦ 35，IJ=21，K=2，LM=35。",
    "trap": "h(3) = −6，减去负数要变加号：f(3) − h(3) = f(3) + 6。",
    "variant": "「顶点在某条线上移动」→ 先把顶点坐标代入那条线，消去一个参数，再在参数范围内求最值。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "B",
        "label": "[B]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "C",
        "label": "[C]",
        "ans": "6",
        "len": 1
      },
      {
        "key": "D",
        "label": "[D]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "E",
        "label": "[E]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "F",
        "label": "[F]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "GH",
        "label": "[GH]",
        "ans": "15",
        "len": 2
      },
      {
        "key": "IJ",
        "label": "[IJ]",
        "ans": "21",
        "len": 2
      },
      {
        "key": "K",
        "label": "[K]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "LM",
        "label": "[LM]",
        "ans": "35",
        "len": 2
      }
    ],
    "ansSummary": "$\\text{A}=2,\\ \\text{B}=4,\\ \\text{C}=6,\\ \\text{D}=4,\\ \\text{E}=4,\\ \\text{F}=3,\\ \\text{GH}=15,\\ \\text{IJ}=21,\\ \\text{K}=2,\\ \\text{LM}=35$"
  },
  {
    "id": "real-2022-1-I2",
    "source": "2022第1回 I問2",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "確率：カードの入れ換えと偶数",
    "type": "mark",
    "mtype": "prob",
    "level": "core",
    "paperImg": "./papers/2022_1_q_p05.png",
    "ansImg": "./papers/2022_1_ans_p05.png",
    "q": "【2022第1回 I問2】1 から 9 までの数字が1つずつ書かれた9枚のカードが，左から小さい順に並んでいる。この中から2枚のカードを選び，その位置を入れ換える操作を2回続けて行う。2回の操作後の9枚のカードの並びを9桁の整数とみなすとき，この整数が偶数になる確率を求めよう。(1) まず，1回目，2回目ともカードの入れ換えが9枚のカードの中から2枚を選べるときの確率を考える。(i) 1回目に 9 の書かれたカード以外のカードを入れ換える場合，2回の操作で偶数になる確率は $\\dfrac{\\text{[N]}}{\\text{[OP]}}$ である。(ii) 1回目に 9 の書かれたカードを他のカードと入れ換える場合，2回の操作で偶数になる確率は $\\dfrac{\\text{[QR]}}{\\text{[STU]}}$ である。したがって，このとき2回の操作で偶数になる確率は $\\dfrac{\\text{[V]}}{\\text{[WX]}}$ である。(2) 次に，2回目のカードの入れ換えでは，1回目に入れ換えた2枚を除いた残りの7枚から2枚を選んで入れ換えるときの確率を考える。このとき2回の操作で偶数になる確率は $\\dfrac{\\text{[Y]}}{\\text{[Z]}}$ である。",
    "q_cn": "【2022第1回 I问2】写着 1〜9 的 9 张卡从左到右按从小到大排列。从中选 2 张交换位置，连续操作 2 次。把 2 次操作后的排列看成 9 位整数，求它是偶数的概率。(1) 两次都从 9 张中任选 2 张交换：(i) 第 1 次交换的不含写着 9 的卡时，2 次后是偶数的概率为 $\\dfrac{\\text{[N]}}{\\text{[OP]}}$；(ii) 第 1 次把 9 和别的卡交换时，概率为 $\\dfrac{\\text{[QR]}}{\\text{[STU]}}$。所以此时是偶数的概率为 $\\dfrac{\\text{[V]}}{\\text{[WX]}}$。(2) 若第 2 次只能从第 1 次交换过的 2 张以外的 7 张中选 2 张交换，是偶数的概率为 $\\dfrac{\\text{[Y]}}{\\text{[Z]}}$。",
    "hint": "9 位数是偶数 ⇔ 最右边（个位）那张卡是偶数。只盯着「最右边位置上是哪张卡」。每次交换有 9C2 = 36 种选法。",
    "expl": "【步骤1：只看个位】\n开始时个位是 9。偶数卡有 2, 4, 6, 8 共 4 张。\n\n【步骤2：(1)(i) 第 1 次不碰 9】\n概率 28/36 = 7/9（从 1〜8 中选两张）。个位仍是 9。\n第 2 次要把个位的 9 和某张偶数卡交换：4/36 = 1/9。\n7/9 × 1/9 = 7/81，N=7，OP=81。\n\n【步骤3：(1)(ii) 第 1 次把 9 换走】\n概率 8/36 = 2/9，换到个位的卡 k 是 1〜8 中任一张。\nk 是偶数（1/2）：第 2 次要保持个位偶数：不碰个位（28/36）或个位与另外 3 张偶数之一交换（3/36）→ 31/36。\nk 是奇数（1/2）：第 2 次要把个位换成偶数：4/36。\n2/9 × (1/2 × 31/36 + 1/2 × 4/36) = 2/9 × 35/72 = 35/324，QR=35，STU=324。\n\n【步骤4：(1) 合计】\n7/81 + 35/324 = 28/324 + 35/324 = 63/324 = 7/36，V=7，WX=36。\n\n【步骤5：(2) 第 2 次只能用剩下的 7 张】\n第 1 次不碰 9（28 种）：个位仍是 9，第 2 次要把 9 和剩下 7 张中的偶数交换。\n第 1 次换的两张：偶偶 6 种 → 剩偶数 2 张；偶奇 16 种 → 剩 3 张；奇奇 6 种 → 剩 4 张。\n概率 = (6×2 + 16×3 + 6×4)/(36 × 21) = 84/756 = 1/9。\n第 1 次把 9 换走（8 种）：个位的卡 k 不能再被交换，个位是偶数 ⇔ k 是偶数：4/36 = 1/9。\n合计 1/9 + 1/9 = 2/9，Y=2，Z=9。",
    "trap": "(ii) 中个位已经是偶数时，第 2 次交换「不碰个位」也算成功，别只算「换成偶数」的情况。",
    "variant": "判断整数的奇偶只看个位；判断 3 的倍数看各位数字之和——交换位置不会改变数字和。",
    "blanks": [
      {
        "key": "N",
        "label": "[N]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "OP",
        "label": "[OP]",
        "ans": "81",
        "len": 2
      },
      {
        "key": "QR",
        "label": "[QR]",
        "ans": "35",
        "len": 2
      },
      {
        "key": "STU",
        "label": "[STU]",
        "ans": "324",
        "len": 3
      },
      {
        "key": "V",
        "label": "[V]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "WX",
        "label": "[WX]",
        "ans": "36",
        "len": 2
      },
      {
        "key": "Y",
        "label": "[Y]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "Z",
        "label": "[Z]",
        "ans": "9",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{N}=7,\\ \\text{OP}=81,\\ \\text{QR}=35,\\ \\text{STU}=324,\\ \\text{V}=7,\\ \\text{WX}=36,\\ \\text{Y}=2,\\ \\text{Z}=9$"
  },
  {
    "id": "real-2022-1-2a",
    "source": "2022第1回 II問1",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "数と式：二重根号・整数部分・小数第1位",
    "type": "mark",
    "mtype": "expr",
    "level": "core",
    "paperImg": "./papers/2022_1_q_p07.png",
    "ansImg": "./papers/2022_1_ans_p05.png",
    "q": "【2022第1回 II問1】$x,\\ y$ は正の実数とし，$x^2 = 8 + \\sqrt{55}$，$y^2 = 8 - \\sqrt{55}$ を満たすとする。(1) $\\text{[A]} < \\sqrt{55} < \\text{[A]} + 1$ であるから，$x$ の整数部分は $\\text{[B]}$，$y$ の整数部分は $\\text{[C]}$ である。(2) $x,\\ y$ について $xy = \\text{[D]}$，$x + y = \\sqrt{x^2 + y^2 + \\text{[E]}xy} = \\sqrt{\\text{[FG]}}$，$x - y = \\sqrt{x^2 + y^2 - \\text{[H]}xy} = \\sqrt{\\text{[IJ]}}$ である。よって $x = \\dfrac{\\sqrt{\\text{[FG]}} + \\sqrt{\\text{[IJ]}}}{\\text{[K]}}$，$y = \\dfrac{\\sqrt{\\text{[FG]}} - \\sqrt{\\text{[IJ]}}}{\\text{[K]}}$ となる。(3) $x + y$ を小数で表したときの小数第1位の数字は $\\text{[L]}$ である。",
    "q_cn": "【2022第1回 II问1】$x,\\ y$ 为正实数，满足 $x^2 = 8 + \\sqrt{55}$，$y^2 = 8 - \\sqrt{55}$。(1) 因为 $\\text{[A]} < \\sqrt{55} < \\text{[A]} + 1$，所以 $x$ 的整数部分为 $\\text{[B]}$，$y$ 的整数部分为 $\\text{[C]}$。(2) $xy = \\text{[D]}$，$x + y = \\sqrt{x^2 + y^2 + \\text{[E]}xy} = \\sqrt{\\text{[FG]}}$，$x - y = \\sqrt{x^2 + y^2 - \\text{[H]}xy} = \\sqrt{\\text{[IJ]}}$。所以 $x = \\dfrac{\\sqrt{\\text{[FG]}} + \\sqrt{\\text{[IJ]}}}{\\text{[K]}}$，$y = \\dfrac{\\sqrt{\\text{[FG]}} - \\sqrt{\\text{[IJ]}}}{\\text{[K]}}$。(3) $x + y$ 小数点后第 1 位数字为 $\\text{[L]}$。",
    "hint": "给的是 x²、y²：xy 用 x²y² 开方，x + y 用 (x + y)² = x² + y² + 2xy 开方。小数第 1 位：比较 4.6² 和 4.7²。",
    "expl": "【步骤1：(1) 估计】\n49 < 55 < 64 ⇒ 7 < √55 < 8，A=7。\nx² = 8 + √55 在 15 和 16 之间 ⇒ 3.8… < x < 4 ⇒ 整数部分 3，B=3。\ny² = 8 − √55 在 0 和 1 之间 ⇒ 0 < y < 1 ⇒ 整数部分 0，C=0。\n\n【步骤2：(2) xy】\nx²y² = (8 + √55)(8 − √55) = 64 − 55 = 9，x, y > 0 ⇒ xy = 3，D=3。\n\n【步骤3：x + y 与 x − y】\nx² + y² = 16。\n(x + y)² = 16 + 2 × 3 = 22 ⇒ x + y = √22，E=2，FG=22。\n(x − y)² = 16 − 6 = 10，x > y ⇒ x − y = √10，H=2，IJ=10。\nx = (√22 + √10)/2，y = (√22 − √10)/2，K=2。\n\n【步骤4：(3) √22 的小数第 1 位】\n4.6² = 21.16，4.7² = 22.09 ⇒ 4.6 < √22 < 4.7，小数第 1 位是 6，L=6。",
    "trap": "y 的整数部分是 0：y² 不到 1，y 当然也不到 1。",
    "variant": "√(a ± 2√b) 型二重根号：找两个数和为 a、积为 b，√(8 + √55) = √(16 + 2√55)/√2 = (√11 + √5)/√2 也可以。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "B",
        "label": "[B]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "C",
        "label": "[C]",
        "ans": "0",
        "len": 1
      },
      {
        "key": "D",
        "label": "[D]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "E",
        "label": "[E]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "FG",
        "label": "[FG]",
        "ans": "22",
        "len": 2
      },
      {
        "key": "H",
        "label": "[H]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "IJ",
        "label": "[IJ]",
        "ans": "10",
        "len": 2
      },
      {
        "key": "K",
        "label": "[K]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "L",
        "label": "[L]",
        "ans": "6",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{A}=7,\\ \\text{B}=3,\\ \\text{C}=0,\\ \\text{D}=3,\\ \\text{E}=2,\\ \\text{FG}=22,\\ \\text{H}=2,\\ \\text{IJ}=10,\\ \\text{K}=2,\\ \\text{L}=6$"
  },
  {
    "id": "real-2022-1-2b",
    "source": "2022第1回 II問2",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "2次方程式：判別式で分数式の値域を求める",
    "type": "mark",
    "mtype": "ineq",
    "level": "core",
    "paperImg": "./papers/2022_1_q_p09.png",
    "ansImg": "./papers/2022_1_ans_p05.png",
    "q": "【2022第1回 II問2】実数 $x$ に対して，$\\dfrac{6x + 2}{x^2 - 2x + 2}$ がとり得る値の範囲を求めよう。$\\dfrac{6x + 2}{x^2 - 2x + 2} = k$ とおくと，この式より $kx^2 - \\text{[M]}(k + \\text{[N]})x + \\text{[O]}(k - \\text{[P]}) = 0$ ……① となる。ここで，$k = 0$ ならば $x = -\\dfrac{\\text{[Q]}}{\\text{[R]}}$ である。また，$k \\ne 0$ ならば，2次方程式①が実数の解をもつためには $k^2 - \\text{[S]}k - \\text{[T]} \\le 0$ でなければならない。よって $-\\text{[U]} \\le k < 0$，$0 < k \\le \\text{[V]}$ を得る。したがって $-\\text{[U]} \\le \\dfrac{6x + 2}{x^2 - 2x + 2} \\le \\text{[V]}$ である。また，最大値 $\\text{[V]}$ をとるときの $x$ の値は $x = \\dfrac{\\text{[W]}}{\\text{[X]}}$，最小値 $-\\text{[U]}$ をとるときの $x$ の値は $x = -\\text{[Y]}$ である。",
    "q_cn": "【2022第1回 II问2】求实数 $x$ 时 $\\dfrac{6x + 2}{x^2 - 2x + 2}$ 的取值范围。令它 $= k$，得 $kx^2 - \\text{[M]}(k + \\text{[N]})x + \\text{[O]}(k - \\text{[P]}) = 0$ ……①。$k = 0$ 时 $x = -\\dfrac{\\text{[Q]}}{\\text{[R]}}$。$k \\ne 0$ 时，① 有实数解需 $k^2 - \\text{[S]}k - \\text{[T]} \\le 0$，得 $-\\text{[U]} \\le k < 0$，$0 < k \\le \\text{[V]}$。所以 $-\\text{[U]} \\le \\dfrac{6x + 2}{x^2 - 2x + 2} \\le \\text{[V]}$。取最大值 $\\text{[V]}$ 时 $x = \\dfrac{\\text{[W]}}{\\text{[X]}}$，取最小值 $-\\text{[U]}$ 时 $x = -\\text{[Y]}$。",
    "hint": "分式 = k，去分母变成 x 的二次方程；「存在实数 x」⇔ 判别式 ≧ 0。取到最值时判别式 = 0，是重根，x = −(一次项系数)/(2 × 二次项系数)。",
    "expl": "【步骤1：去分母】\n6x + 2 = k(x² − 2x + 2) ⇒ kx² − 2(k + 3)x + 2(k − 1) = 0，M=2，N=3，O=2，P=1。\n（分母 x² − 2x + 2 = (x − 1)² + 1 > 0，可以放心乘。）\n\n【步骤2：k = 0】\n6x + 2 = 0 ⇒ x = −1/3，Q=1，R=3。\n\n【步骤3：k ≠ 0，判别式】\nD/4 = (k + 3)² − 2k(k − 1) = −k² + 8k + 9 ≧ 0 ⇒ k² − 8k − 9 ≦ 0，S=8，T=9。\n(k − 9)(k + 1) ≦ 0 ⇒ −1 ≦ k ≦ 9（去掉 k = 0）：−1 ≦ k < 0，0 < k ≦ 9，U=1，V=9。\n加上 k = 0 时有解，整体 −1 ≦ k ≦ 9。\n\n【步骤4：取最值时的 x（重根）】\nx = (k + 3)/k。\nk = 9：x = 12/9 = 4/3，W=4，X=3。\nk = −1：x = 2/(−1) = −2，Y=2。",
    "trap": "k = 0 时方程不是二次方程，不能用判别式，要单独讨论。",
    "variant": "「实数 x, y 满足某式时，求 x + y 的范围」也是同样做法：设 x + y = k，代入后对 x 用判别式。",
    "blanks": [
      {
        "key": "M",
        "label": "[M]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "N",
        "label": "[N]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "O",
        "label": "[O]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "P",
        "label": "[P]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "Q",
        "label": "[Q]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "R",
        "label": "[R]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "S",
        "label": "[S]",
        "ans": "8",
        "len": 1
      },
      {
        "key": "T",
        "label": "[T]",
        "ans": "9",
        "len": 1
      },
      {
        "key": "U",
        "label": "[U]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "V",
        "label": "[V]",
        "ans": "9",
        "len": 1
      },
      {
        "key": "W",
        "label": "[W]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "X",
        "label": "[X]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "Y",
        "label": "[Y]",
        "ans": "2",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{M}=2,\\ \\text{N}=3,\\ \\text{O}=2,\\ \\text{P}=1,\\ \\text{Q}=1,\\ \\text{R}=3,\\ \\text{S}=8,\\ \\text{T}=9,\\ \\text{U}=1,\\ \\text{V}=9,\\ \\text{W}=4,\\ \\text{X}=3,\\ \\text{Y}=2$"
  },
  {
    "id": "real-2022-1-3",
    "source": "2022第1回 III",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "整数：互いに素な数の個数",
    "type": "mark",
    "mtype": "int",
    "level": "core",
    "paperImg": "./papers/2022_1_q_p11.png",
    "ansImg": "./papers/2022_1_ans_p05.png",
    "q": "【2022第1回 III】$n$ を 2 以上の整数とする。$n$ 以下の正の整数で $n$ と互いに素となる数の個数 $A(n)$ について考えよう。(1) $A(5) = \\text{[A]}$，$A(6) = \\text{[B]}$，$A(12) = \\text{[C]}$ である。(2) $p,\\ q$ を異なる素数とする。（$\\text{[D]}$〜$\\text{[L]}$ は選択肢から選ぶ：⓪ $pq$　① $1$　② $p$　③ $q$　④ $p^2$　⑤ $p-1$　⑥ $pq-p-q$　⑦ $(p-1)(q-1)$　⑧ $p(pq-p-q)$　⑨ $p(p-1)(q-1)$；$\\text{[M]}$〜$\\text{[U]}$ は数字）(i) $A(p) = \\text{[D]}$ である。(ii) 1 から $pq$ までの整数の中で，$p$ の倍数は $\\text{[E]}$ 個，$q$ の倍数は $\\text{[F]}$ 個，$pq$ の倍数は $\\text{[G]}$ 個であるから，$A(pq) = \\text{[H]}$ である。1 から $p^2q$ までの整数の中で，$p$ の倍数は $\\text{[I]}$ 個，$q$ の倍数は $\\text{[J]}$ 個，$pq$ の倍数は $\\text{[K]}$ 個であるから，$A(p^2q) = \\text{[L]}$ である。(iii) $A(p^2q) = 36$ となる $p,\\ q$ の組をすべて求めよう。36 を素因数分解すると $36 = \\text{[M]}^{\\text{[N]}} \\cdot \\text{[O]}^{\\text{[P]}}$（$\\text{[M]} < \\text{[O]}$）であるから $(p,\\ q) = (\\text{[Q]},\\ \\text{[RS]})$，$(\\text{[T]},\\ \\text{[U]})$ である。",
    "q_cn": "【2022第1回 III】$n \\ge 2$。$n$ 以下的正整数中与 $n$ 互素的个数记为 $A(n)$。(1) $A(5) = \\text{[A]}$，$A(6) = \\text{[B]}$，$A(12) = \\text{[C]}$。(2) $p,\\ q$ 为不同的质数（$\\text{[D]}$〜$\\text{[L]}$ 从选项中选，见日文题面）。(i) $A(p) = \\text{[D]}$。(ii) 1 到 $pq$ 中，$p$ 的倍数 $\\text{[E]}$ 个，$q$ 的倍数 $\\text{[F]}$ 个，$pq$ 的倍数 $\\text{[G]}$ 个，所以 $A(pq) = \\text{[H]}$；1 到 $p^2q$ 中，$p$ 的倍数 $\\text{[I]}$ 个，$q$ 的倍数 $\\text{[J]}$ 个，$pq$ 的倍数 $\\text{[K]}$ 个，所以 $A(p^2q) = \\text{[L]}$。(iii) 求 $A(p^2q) = 36$ 的所有 $p,\\ q$：$36 = \\text{[M]}^{\\text{[N]}} \\cdot \\text{[O]}^{\\text{[P]}}$（$\\text{[M]} < \\text{[O]}$），所以 $(p,\\ q) = (\\text{[Q]},\\ \\text{[RS]})$，$(\\text{[T]},\\ \\text{[U]})$。",
    "hint": "与 n 互素 = 不含 n 的任何质因数。用「全部 − p 的倍数 − q 的倍数 + pq 的倍数」（容斥原理）。",
    "expl": "【步骤1：(1) 直接数】\nA(5)：1, 2, 3, 4 → 4，A=4。\nA(6)：1, 5 → 2，B=2。\nA(12)：1, 5, 7, 11 → 4，C=4。\n\n【步骤2：(2)(i)】\np 是质数，1〜p 中只有 p 本身不互素：A(p) = p − 1，选 ⑤，D=5。\n\n【步骤3：(2)(ii) A(pq)】\n1〜pq 中：p 的倍数 q 个（选 ③），q 的倍数 p 个（选 ②），pq 的倍数 1 个（选 ①）。E=3，F=2，G=1。\nA(pq) = pq − q − p + 1 = (p − 1)(q − 1)，选 ⑦，H=7。\n\n【步骤4：(2)(ii) A(p²q)】\n1〜p²q 中：p 的倍数 pq 个（⓪），q 的倍数 p² 个（④），pq 的倍数 p 个（②）。I=0，J=4，K=2。\nA(p²q) = p²q − pq − p² + p = p(pq − q − p + 1) = p(p − 1)(q − 1)，选 ⑨，L=9。\n\n【步骤5：(iii) p(p − 1)(q − 1) = 36】\n36 = 2² × 3²，M=2，N=2，O=3，P=2。p 是 36 的质因数：p = 2 或 3。\np = 2：2 × 1 × (q − 1) = 36 ⇒ q = 19（质数 ✓）。\np = 3：3 × 2 × (q − 1) = 36 ⇒ q = 7（质数 ✓）。\n(p, q) = (2, 19)，(3, 7)，Q=2，RS=19，T=3，U=7。",
    "trap": "容斥原理：p 的倍数和 q 的倍数都减掉时，pq 的倍数被减了两次，要加回一次。",
    "variant": "欧拉函数公式：n = p^a q^b 时，A(n) = n(1 − 1/p)(1 − 1/q)。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "B",
        "label": "[B]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "C",
        "label": "[C]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "D",
        "label": "[D]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "E",
        "label": "[E]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "F",
        "label": "[F]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "G",
        "label": "[G]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "H",
        "label": "[H]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "I",
        "label": "[I]",
        "ans": "0",
        "len": 1
      },
      {
        "key": "J",
        "label": "[J]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "K",
        "label": "[K]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "L",
        "label": "[L]",
        "ans": "9",
        "len": 1
      },
      {
        "key": "M",
        "label": "[M]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "N",
        "label": "[N]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "O",
        "label": "[O]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "P",
        "label": "[P]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "Q",
        "label": "[Q]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "RS",
        "label": "[RS]",
        "ans": "19",
        "len": 2
      },
      {
        "key": "T",
        "label": "[T]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "U",
        "label": "[U]",
        "ans": "7",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{A}=4,\\ \\text{B}=2,\\ \\text{C}=4,\\ \\text{D}=5,\\ \\text{E}=3,\\ \\text{F}=2,\\ \\text{G}=1,\\ \\text{H}=7,\\ \\text{I}=0,\\ \\text{J}=4,\\ \\text{K}=2,\\ \\text{L}=9,\\ \\text{M}=2,\\ \\text{N}=2,\\ \\text{O}=3,\\ \\text{P}=2,\\ \\text{Q}=2,\\ \\text{RS}=19,\\ \\text{T}=3,\\ \\text{U}=7$"
  },
  {
    "id": "real-2022-1-4",
    "source": "2022第1回 IV (1)",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "図形と計量：外接円に内接し2辺に接する円",
    "type": "mark",
    "mtype": "geo",
    "level": "core",
    "paperImg": "./papers/2022_1_q_p13.png",
    "ansImg": "./papers/2022_1_ans_p05.png",
    "q": "【2022第1回 IV (1)】半径 2 の円周上に $\\text{AB} = \\text{AC}$，$\\angle\\text{BAC} = 60^\\circ$ を満たすような3点 A，B，C をとる。(1) この円に内接し，線分 AB，AC に接する円の中心を O とし，この円 O の半径 $r$ を求めよう。円 O と線分 AB との接点を D とおくと $\\angle\\text{OAD} = \\text{[AB]}^\\circ$，$\\text{AO} = \\text{[C]} - r$ であるから $r = \\dfrac{\\text{[D]}}{\\text{[E]}}$ である。",
    "q_cn": "【2022第1回 IV (1)】在半径为 2 的圆上取满足 $\\text{AB} = \\text{AC}$，$\\angle\\text{BAC} = 60^\\circ$ 的三点 A，B，C。(1) 设与该圆内切、且与线段 AB，AC 相切的圆的圆心为 O，求圆 O 的半径 $r$。设圆 O 与 AB 的切点为 D，则 $\\angle\\text{OAD} = \\text{[AB]}^\\circ$，$\\text{AO} = \\text{[C]} - r$，所以 $r = \\dfrac{\\text{[D]}}{\\text{[E]}}$。",
    "hint": "对称：O 在 ∠A 的平分线上，也就是过 A 的直径上。小圆和大圆内切于 A 对面的那一点，所以 AO = 直径 − r。",
    "expl": "【步骤1：∠OAD】\nO 到 AB、AC 距离相等，在 ∠BAC 的平分线上：∠OAD = 60° ÷ 2 = 30°，AB=30。\n\n【步骤2：AO】\n△ABC 是正三角形，角平分线经过大圆圆心，就是过 A 的直径。小圆与大圆内切于直径的另一端，\n所以 AO = 4 − r，C=4。\n\n【步骤3：直角三角形 AOD】\nOD ⊥ AB，sin30° = OD/AO ⇒ 1/2 = r/(4 − r) ⇒ 4 − r = 2r ⇒ r = 4/3，D=4，E=3。",
    "trap": "AO 不是 2 − r：O 到大圆圆心的距离是 2 − r，而 A 到大圆圆心是 2，所以 AO = 2 + (2 − r) = 4 − r。",
    "variant": "切线与半径垂直：「圆心、切点、外部点」构成直角三角形，是圆和直线问题的标准切入口。",
    "blanks": [
      {
        "key": "AB",
        "label": "[AB]",
        "ans": "30",
        "len": 2
      },
      {
        "key": "C",
        "label": "[C]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "D",
        "label": "[D]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "E",
        "label": "[E]",
        "ans": "3",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{AB}=30,\\ \\text{C}=4,\\ \\text{D}=4,\\ \\text{E}=3$"
  },
  {
    "id": "real-2022-1-4b",
    "source": "2022第1回 IV (2)",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "図形と計量：弧と弦で囲まれた図形の周と面積",
    "type": "mark",
    "mtype": "geo",
    "level": "stretch",
    "paperImg": "./papers/2022_1_q_p14.png",
    "ansImg": "./papers/2022_1_ans_p05.png",
    "q": "【2022第1回 IV (2)】（半径 2 の円周上に $\\text{AB} = \\text{AC}$，$\\angle\\text{BAC} = 60^\\circ$ の3点 A，B，C。B，C を端点とするこの円の2つの弧のうち，短い方を $L_1$，長い方を $L_2$ とおく。）弧 $L_2$ 上に $\\text{BP} = 3$ を満たす点 P をとる。このとき，線分 PB，PC および弧 $L_1$ で囲まれる図形の周の長さ $\\ell$ と面積 $S$ を求めよう。$\\text{BC} = \\text{[F]}\\sqrt{\\text{[G]}}$ であるから，$\\text{PC} = x$ とおくと，$x$ は $x^2 - \\text{[H]}x - \\text{[I]} = 0$ を満たす。よって $x = \\dfrac{\\text{[J]} + \\sqrt{\\text{[KL]}}}{\\text{[M]}}$ である。したがって $\\ell = \\dfrac{\\text{[N]}}{\\text{[O]}}\\pi + \\dfrac{\\text{[P]} + \\sqrt{\\text{[KL]}}}{\\text{[M]}}$ である。また，三角形 PBC の面積 $S'$ は $S' = \\dfrac{\\text{[Q]}(\\sqrt{\\text{[R]}} + \\sqrt{\\text{[S]}})}{\\text{[T]}}$（$\\text{[R]} < \\text{[S]}$）であるから $S = \\dfrac{\\text{[U]}}{\\text{[V]}}\\pi + \\dfrac{\\sqrt{\\text{[W]}} + \\text{[X]}\\sqrt{\\text{[Y]}}}{\\text{[Z]}}$ である。",
    "q_cn": "【2022第1回 IV (2)】（半径 2 的圆上有 $\\text{AB} = \\text{AC}$，$\\angle\\text{BAC} = 60^\\circ$ 的三点 A，B，C；以 B，C 为端点的两段弧中，短的记为 $L_1$，长的记为 $L_2$。）在弧 $L_2$ 上取 $\\text{BP} = 3$ 的点 P，求由线段 PB，PC 和弧 $L_1$ 围成的图形的周长 $\\ell$ 与面积 $S$。$\\text{BC} = \\text{[F]}\\sqrt{\\text{[G]}}$，设 $\\text{PC} = x$，则 $x^2 - \\text{[H]}x - \\text{[I]} = 0$，所以 $x = \\dfrac{\\text{[J]} + \\sqrt{\\text{[KL]}}}{\\text{[M]}}$。因此 $\\ell = \\dfrac{\\text{[N]}}{\\text{[O]}}\\pi + \\dfrac{\\text{[P]} + \\sqrt{\\text{[KL]}}}{\\text{[M]}}$。三角形 PBC 的面积 $S' = \\dfrac{\\text{[Q]}(\\sqrt{\\text{[R]}} + \\sqrt{\\text{[S]}})}{\\text{[T]}}$（$\\text{[R]} < \\text{[S]}$），所以 $S = \\dfrac{\\text{[U]}}{\\text{[V]}}\\pi + \\dfrac{\\sqrt{\\text{[W]}} + \\text{[X]}\\sqrt{\\text{[Y]}}}{\\text{[Z]}}$。",
    "hint": "P 在长弧上（和 A 同侧），∠BPC = ∠BAC = 60°。图形 = △PBC + 弓形（弦 BC 与短弧 L₁ 之间）；弓形 = 扇形 − △(圆心)BC。",
    "expl": "【步骤1：BC】\n正弦定理：BC = 2R sin60° = 4 × √3/2 = 2√3，F=2，G=3。\n\n【步骤2：PC 满足的方程】\nP 与 A 在同一段弧上，∠BPC = 60°。\nBC² = BP² + PC² − 2·BP·PC·cos60° ⇒ 12 = 9 + x² − 3x ⇒ x² − 3x − 3 = 0，H=3，I=3。\nx > 0 ⇒ x = (3 + √21)/2，J=3，KL=21，M=2。\n\n【步骤3：周长 ℓ】\n短弧 L₁ 对的圆心角 = 2 × 60° = 120°，弧长 = 2 × 2π/3 = 4π/3，N=4，O=3。\nPB + PC = 3 + (3 + √21)/2 = (9 + √21)/2，P=9。\n\n【步骤4：△PBC 的面积】\nS' = ½ × 3 × (3 + √21)/2 × sin60° = 3√3(3 + √21)/8 = (9√3 + 3√63)/8 = 9(√3 + √7)/8\nQ=9，R=3，S=7，T=8。\n\n【步骤5：弓形与 S】\n扇形（120°）= ½ × 2² × 2π/3 = 4π/3；圆心与 B、C 的三角形 = ½ × 2 × 2 × sin120° = √3。\n弓形 = 4π/3 − √3。\nS = 9(√3 + √7)/8 + 4π/3 − √3 = 4π/3 + (√3 + 9√7)/8，U=4，V=3，W=3，X=9，Y=7，Z=8。",
    "trap": "√63 = 3√7；最后 9√3/8 − √3 = √3/8，所以根号部分是 (√3 + 9√7)/8。",
    "variant": "弓形面积 = 扇形 − 三角形，是弧和弦围成图形的标准算法。",
    "blanks": [
      {
        "key": "F",
        "label": "[F]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "G",
        "label": "[G]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "H",
        "label": "[H]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "I",
        "label": "[I]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "J",
        "label": "[J]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "KL",
        "label": "[KL]",
        "ans": "21",
        "len": 2
      },
      {
        "key": "M",
        "label": "[M]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "N",
        "label": "[N]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "O",
        "label": "[O]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "P",
        "label": "[P]",
        "ans": "9",
        "len": 1
      },
      {
        "key": "Q",
        "label": "[Q]",
        "ans": "9",
        "len": 1
      },
      {
        "key": "R",
        "label": "[R]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "S",
        "label": "[S]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "T",
        "label": "[T]",
        "ans": "8",
        "len": 1
      },
      {
        "key": "U",
        "label": "[U]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "V",
        "label": "[V]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "W",
        "label": "[W]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "X",
        "label": "[X]",
        "ans": "9",
        "len": 1
      },
      {
        "key": "Y",
        "label": "[Y]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "Z",
        "label": "[Z]",
        "ans": "8",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{F}=2,\\ \\text{G}=3,\\ \\text{H}=3,\\ \\text{I}=3,\\ \\text{J}=3,\\ \\text{KL}=21,\\ \\text{M}=2,\\ \\text{N}=4,\\ \\text{O}=3,\\ \\text{P}=9,\\ \\text{Q}=9,\\ \\text{R}=3,\\ \\text{S}=7,\\ \\text{T}=8,\\ \\text{U}=4,\\ \\text{V}=3,\\ \\text{W}=3,\\ \\text{X}=9,\\ \\text{Y}=7,\\ \\text{Z}=8$"
  },
  {
    "id": "real-2021-1-I1",
    "source": "2021第1回 I問1",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "2次関数：条件から係数を決めて差の最大値",
    "type": "mark",
    "mtype": "quad",
    "level": "core",
    "paperImg": "./papers/2021_1_q_p03.png",
    "ansImg": "./papers/2021_1_q_p09.png",
    "q": "【2021第1回 I問1】2つの2次関数 $f(x) = -2x^2$，$g(x) = x^2 + ax + b$ を考える。関数 $g(x)$ は次の2つの条件を満たしている。(i) $g(x)$ の値は $x = 3$ で最小になる。(ii) $g(4) = f(4)$。(1) 条件 (i) より $a = -\\text{[A]}$ である。さらに，条件 (ii) より $b = -\\text{[BC]}$ を得る。したがって，関数 $g(x)$ の最小値は $-\\text{[DE]}$ である。(2) $f(x) = g(x)$ を満たす $x$ で 4 と異なるものを求めよう。$x$ は $x^2 - \\text{[F]}x - \\text{[G]} = 0$ を満たすから，$x = -\\text{[H]}$ である。(3) $-\\text{[H]} \\le x \\le 4$ において，$f(x) - g(x)$ の値は $x = \\text{[I]}$ のとき最大になり，その値は $\\text{[JK]}$ である。",
    "q_cn": "【2021第1回 I问1】考虑两个二次函数 $f(x) = -2x^2$，$g(x) = x^2 + ax + b$，$g(x)$ 满足：(i) 在 $x = 3$ 处取最小值；(ii) $g(4) = f(4)$。(1) 由 (i) 得 $a = -\\text{[A]}$，由 (ii) 得 $b = -\\text{[BC]}$，所以 $g(x)$ 的最小值为 $-\\text{[DE]}$。(2) 求满足 $f(x) = g(x)$ 且不等于 4 的 $x$：$x$ 满足 $x^2 - \\text{[F]}x - \\text{[G]} = 0$，所以 $x = -\\text{[H]}$。(3) 在 $-\\text{[H]} \\le x \\le 4$ 上，$f(x) - g(x)$ 在 $x = \\text{[I]}$ 时取最大值 $\\text{[JK]}$。",
    "hint": "x² 系数为 1 时，对称轴 x = −a/2。f − g 也是二次函数，配方看顶点在不在区间里。",
    "expl": "【步骤1：(1) a, b】\n对称轴 x = −a/2 = 3 ⇒ a = −6，A=6。\ng(4) = 16 − 24 + b = b − 8，f(4) = −32 ⇒ b − 8 = −32 ⇒ b = −24，BC=24。\ng(x) = (x − 3)² − 9 − 24，最小值 −33，DE=33。\n\n【步骤2：(2) 交点】\n−2x² = x² − 6x − 24 ⇒ 3x² − 6x − 24 = 0 ⇒ x² − 2x − 8 = 0，F=2，G=8。\n(x − 4)(x + 2) = 0，不等于 4 的是 x = −2，H=2。\n\n【步骤3：(3) f − g 的最大值】\nf(x) − g(x) = −3x² + 6x + 24 = −3(x − 1)² + 27。\n顶点 x = 1 在 −2 ≦ x ≦ 4 内，最大值 27，I=1，JK=27。",
    "trap": "b = −24 填的是 BC = 24（前面已经有负号）。",
    "variant": "两条抛物线之间的竖直距离 f(x) − g(x) 仍是二次函数，求它在两个交点之间的最大值是常考题。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "6",
        "len": 1
      },
      {
        "key": "BC",
        "label": "[BC]",
        "ans": "24",
        "len": 2
      },
      {
        "key": "DE",
        "label": "[DE]",
        "ans": "33",
        "len": 2
      },
      {
        "key": "F",
        "label": "[F]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "G",
        "label": "[G]",
        "ans": "8",
        "len": 1
      },
      {
        "key": "H",
        "label": "[H]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "I",
        "label": "[I]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "JK",
        "label": "[JK]",
        "ans": "27",
        "len": 2
      }
    ],
    "ansSummary": "$\\text{A}=6,\\ \\text{BC}=24,\\ \\text{DE}=33,\\ \\text{F}=2,\\ \\text{G}=8,\\ \\text{H}=2,\\ \\text{I}=1,\\ \\text{JK}=27$"
  },
  {
    "id": "real-2021-1-I2",
    "source": "2021第1回 I問2",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "確率：カード勝負を4回行う反復試行",
    "type": "mark",
    "mtype": "prob",
    "level": "core",
    "paperImg": "./papers/2021_1_q_p04.png",
    "ansImg": "./papers/2021_1_q_p09.png",
    "q": "【2021第1回 I問2】A と B の2人はともに3枚のカードが入っている袋をもっている。袋の中の3枚のカードには，それぞれ 1，2，3 の数字が1つずつ書かれている。2人が同時に自分の袋から1枚のカードを取り出し，書かれている数の大きさで勝負を競う。同じ数が書かれたカードを取り出したときは引き分けとし，カードの数が異なるときは大きい数のカードを取り出した方を勝ちとする。(1) 1回の勝負で引き分けになる確率は $\\dfrac{\\text{[L]}}{\\text{[M]}}$ である。(2) 以下，この勝負を4回実行するとき，次の確率を求めよう。ただし，取り出したカードは毎回元の袋に戻すこととする。(i) A が3勝以上する確率は $\\dfrac{\\text{[N]}}{\\text{[O]}}$ である。(ii) A が1勝1敗2引き分けになる確率は $\\dfrac{\\text{[P]}}{\\text{[QR]}}$ である。(iii) A の勝つ回数と B の勝つ回数が同じになる確率は $\\dfrac{\\text{[ST]}}{\\text{[UV]}}$ である。したがって，A の勝つ回数が B の勝つ回数より多くなる確率は $\\dfrac{\\text{[WX]}}{\\text{[UV]}}$ である。",
    "q_cn": "【2021第1回 I问2】A、B 各有一个装着写有 1、2、3 的 3 张卡的袋子。两人同时从自己的袋子里取一张，比数字大小：相同为平局，数字大的一方获胜。(1) 一次比赛平局的概率为 $\\dfrac{\\text{[L]}}{\\text{[M]}}$。(2) 比赛进行 4 次（每次取出的卡放回）。(i) A 至少赢 3 次的概率为 $\\dfrac{\\text{[N]}}{\\text{[O]}}$；(ii) A 1 胜 1 负 2 平的概率为 $\\dfrac{\\text{[P]}}{\\text{[QR]}}$；(iii) A 与 B 获胜次数相同的概率为 $\\dfrac{\\text{[ST]}}{\\text{[UV]}}$，所以 A 获胜次数比 B 多的概率为 $\\dfrac{\\text{[WX]}}{\\text{[UV]}}$。",
    "hint": "一次比赛：胜、负、平各 1/3。4 次的组合用「多项式系数」4!/(a! b! c!)。「A 多 = B 多」对称，用 (1 − 相同)/2。",
    "expl": "【步骤1：(1) 一次】\n3 × 3 = 9 种中数字相同的 3 种 ⇒ 平局 1/3，L=1，M=3。\nA 胜 3 种（2>1, 3>1, 3>2）⇒ 1/3；B 胜也是 1/3。\n\n【步骤2：(2)(i) A 至少 3 胜】\n3 胜 1 不胜：4C3 × (1/3)³ × (2/3) = 8/81；4 胜：(1/3)⁴ = 1/81。\n合计 9/81 = 1/9，N=1，O=9。\n\n【步骤3：(ii) 1 胜 1 负 2 平】\n排列数 4!/(1!1!2!) = 12，每种 (1/3)⁴：12/81 = 4/27，P=4，QR=27。\n\n【步骤4：(iii) 胜数相同】\n(胜, 负, 平) = (0,0,4)：1 种；(1,1,2)：12 种；(2,2,0)：4!/(2!2!) = 6 种。\n(1 + 12 + 6)/81 = 19/81，ST=19，UV=81。\n\n【步骤5：A 多于 B】\nA 多和 B 多的概率相同：(1 − 19/81)/2 = (62/81)/2 = 31/81，WX=31。",
    "trap": "「3 胜以上」包括 4 胜；「1 胜 1 负 2 平」不要忘了乘排列数 12。",
    "variant": "对称性：「A 胜得多」和「B 胜得多」概率一样，先算「一样多」再对半分，比直接列举快得多。",
    "blanks": [
      {
        "key": "L",
        "label": "[L]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "M",
        "label": "[M]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "N",
        "label": "[N]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "O",
        "label": "[O]",
        "ans": "9",
        "len": 1
      },
      {
        "key": "P",
        "label": "[P]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "QR",
        "label": "[QR]",
        "ans": "27",
        "len": 2
      },
      {
        "key": "ST",
        "label": "[ST]",
        "ans": "19",
        "len": 2
      },
      {
        "key": "UV",
        "label": "[UV]",
        "ans": "81",
        "len": 2
      },
      {
        "key": "WX",
        "label": "[WX]",
        "ans": "31",
        "len": 2
      }
    ],
    "ansSummary": "$\\text{L}=1,\\ \\text{M}=3,\\ \\text{N}=1,\\ \\text{O}=9,\\ \\text{P}=4,\\ \\text{QR}=27,\\ \\text{ST}=19,\\ \\text{UV}=81,\\ \\text{WX}=31$"
  },
  {
    "id": "real-2021-1-II1",
    "source": "2021第1回 II問1",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "数と式：平方根の評価と大小比較",
    "type": "mark",
    "mtype": "expr",
    "level": "core",
    "paperImg": "./papers/2021_1_q_p05.png",
    "ansImg": "./papers/2021_1_q_p09.png",
    "q": "【2021第1回 II問1】(1) 次の2つの不等式 $\\dfrac{m}{3} < \\sqrt{3} < \\dfrac{n}{4}$，$\\dfrac{n}{3} < \\sqrt{6} < \\dfrac{m}{2}$ を同時に満たす正の整数 $m,\\ n$ の値は $m = \\text{[A]}$，$n = \\text{[B]}$ である。(2) (1) の結果を用いて，次の5つの数 ① $\\left(\\sqrt{(-3)(-4)}\\right)^3$　② $6\\sqrt{(-2)^3(-3)}$　③ $\\sqrt{\\{(-4)(-3)^2\\}^2}$　④ $(-1)^3\\sqrt{\\{(-2)^5\\}^2}$　⑤ $\\left(\\dfrac{5\\sqrt{3}}{1 - \\sqrt{6}}\\right)^2$ の大小を比較したい。⑤ の分母を有理化すると $\\left(\\dfrac{5\\sqrt{3}}{1 - \\sqrt{6}}\\right)^2 = \\text{[CD]} + \\text{[E]}\\sqrt{\\text{[F]}}$ である。5つの数のうち，35 より大きい数は $\\text{[G]}$ 個あり，負の数は $\\text{[H]}$ 個ある。特に，5つの数を小さい順に ①〜⑤ の番号で並べると $\\text{[I]} < \\text{[J]} < \\text{[K]} < \\text{[L]} < \\text{[M]}$ となる。",
    "q_cn": "【2021第1回 II问1】(1) 同时满足 $\\dfrac{m}{3} < \\sqrt{3} < \\dfrac{n}{4}$ 与 $\\dfrac{n}{3} < \\sqrt{6} < \\dfrac{m}{2}$ 的正整数为 $m = \\text{[A]}$，$n = \\text{[B]}$。(2) 利用 (1) 比较下面 5 个数的大小：① $\\left(\\sqrt{(-3)(-4)}\\right)^3$　② $6\\sqrt{(-2)^3(-3)}$　③ $\\sqrt{\\{(-4)(-3)^2\\}^2}$　④ $(-1)^3\\sqrt{\\{(-2)^5\\}^2}$　⑤ $\\left(\\dfrac{5\\sqrt{3}}{1 - \\sqrt{6}}\\right)^2$。⑤ 有理化后为 $\\text{[CD]} + \\text{[E]}\\sqrt{\\text{[F]}}$。5 个数中大于 35 的有 $\\text{[G]}$ 个，负数有 $\\text{[H]}$ 个。从小到大用编号排列为 $\\text{[I]} < \\text{[J]} < \\text{[K]} < \\text{[L]} < \\text{[M]}$。",
    "hint": "√(A²) = |A|，根号里先算出正数再开方。把每个数化成 k√3、k√6 或整数，再用 (1) 的 5/3 < √3、7/3 < √6 < 5/2 比大小。",
    "expl": "【步骤1：(1)】\nm/3 < √3 ⇒ m < 3√3 ≈ 5.19；√6 < m/2 ⇒ m > 2√6 ≈ 4.89 ⇒ m = 5，A=5。\n√3 < n/4 ⇒ n > 4√3 ≈ 6.93；n/3 < √6 ⇒ n < 3√6 ≈ 7.35 ⇒ n = 7，B=7。\n即 5/3 < √3，7/3 < √6 < 5/2。\n\n【步骤2：化简五个数】\n① (√12)³ = 12√12 = 24√3\n② 6√((−8)(−3)) = 6√24 = 12√6\n③ √((−36)²) = 36\n④ −√((−32)²) = −32\n⑤ 75/(1 − √6)² = 75/(7 − 2√6) = 75(7 + 2√6)/(49 − 24) = 3(7 + 2√6) = 21 + 6√6，CD=21，E=6，F=6。\n\n【步骤3：用 (1) 估计】\n① 24√3 > 24 × 5/3 = 40\n② 12√6 < 12 × 5/2 = 30\n⑤ 21 + 6√6：6√6 在 14 和 15 之间 ⇒ 35 < ⑤ < 36\n\n【步骤4：结论】\n大于 35 的：①、③、⑤，G=3；负数：④，H=1。\n④ < ② < ⑤ < ③ < ①，I=4，J=2，K=5，L=3，M=1。",
    "trap": "√((−36)²) = 36（正数）；④ 前面的 (−1)³ 让它变成 −32。根号里的负负得正要先算。",
    "variant": "比较带根号的数：化成 a√b 后，用题目给的不等式（或平方后比较）估计。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "B",
        "label": "[B]",
        "ans": "7",
        "len": 1
      },
      {
        "key": "CD",
        "label": "[CD]",
        "ans": "21",
        "len": 2
      },
      {
        "key": "E",
        "label": "[E]",
        "ans": "6",
        "len": 1
      },
      {
        "key": "F",
        "label": "[F]",
        "ans": "6",
        "len": 1
      },
      {
        "key": "G",
        "label": "[G]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "H",
        "label": "[H]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "I",
        "label": "[I]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "J",
        "label": "[J]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "K",
        "label": "[K]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "L",
        "label": "[L]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "M",
        "label": "[M]",
        "ans": "1",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{A}=5,\\ \\text{B}=7,\\ \\text{CD}=21,\\ \\text{E}=6,\\ \\text{F}=6,\\ \\text{G}=3,\\ \\text{H}=1,\\ \\text{I}=4,\\ \\text{J}=2,\\ \\text{K}=5,\\ \\text{L}=3,\\ \\text{M}=1$"
  },
  {
    "id": "real-2021-1-II2",
    "source": "2021第1回 II問2",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "2次関数：最小値を a の関数として最大・最小",
    "type": "mark",
    "mtype": "quad",
    "level": "core",
    "paperImg": "./papers/2021_1_q_p06.png",
    "ansImg": "./papers/2021_1_q_p09.png",
    "q": "【2021第1回 II問2】関数 $f(x) = x^2 + ax + b$ は (i) $f(3) = 1$，(ii) $13 \\le f(-1) \\le 25$ を満たしている。このとき，$f(x)$ の最小値 $m$ を $a$ の式で表そう。さらに，$m$ の最大値と最小値を求めよう。条件 (i) より，$a,\\ b$ は $\\text{[N]}a + b + \\text{[O]} = 0$ を満たす。これより，$f(x)$ は $a$ を用いて $f(x) = x^2 + ax - \\text{[P]}a - \\text{[Q]}$ と表される。よって，条件 (ii) より，$a$ は $-\\text{[R]} \\le a \\le -\\text{[S]}$ を満たす。一方，$m$ は $a$ を用いて $m = -\\dfrac{1}{\\text{[T]}}(a + \\text{[U]})^2 + \\text{[V]}$ と表される。したがって，$m$ は $a = -\\text{[W]}$ のとき最大値 $\\text{[X]}$ をとり，$a = -\\text{[Y]}$ のとき最小値 $\\text{[Z]}$ をとる。",
    "q_cn": "【2021第1回 II问2】函数 $f(x) = x^2 + ax + b$ 满足 (i) $f(3) = 1$，(ii) $13 \\le f(-1) \\le 25$。用 $a$ 表示 $f(x)$ 的最小值 $m$，并求 $m$ 的最大值与最小值。由 (i) 得 $\\text{[N]}a + b + \\text{[O]} = 0$，所以 $f(x) = x^2 + ax - \\text{[P]}a - \\text{[Q]}$。由 (ii) 得 $-\\text{[R]} \\le a \\le -\\text{[S]}$。又 $m = -\\dfrac{1}{\\text{[T]}}(a + \\text{[U]})^2 + \\text{[V]}$。所以 $a = -\\text{[W]}$ 时 $m$ 取最大值 $\\text{[X]}$，$a = -\\text{[Y]}$ 时取最小值 $\\text{[Z]}$。",
    "hint": "两层二次函数：先对 x 配方得到最小值 m（是 a 的二次函数），再在 a 的范围内求 m 的最大最小。",
    "expl": "【步骤1：条件 (i)】\nf(3) = 9 + 3a + b = 1 ⇒ 3a + b + 8 = 0，N=3，O=8。\nb = −3a − 8 ⇒ f(x) = x² + ax − 3a − 8，P=3，Q=8。\n\n【步骤2：条件 (ii)】\nf(−1) = 1 − a − 3a − 8 = −4a − 7\n13 ≦ −4a − 7 ≦ 25 ⇒ 20 ≦ −4a ≦ 32 ⇒ −8 ≦ a ≦ −5，R=8，S=5。\n\n【步骤3：m 用 a 表示】\nf(x) = (x + a/2)² − a²/4 − 3a − 8 ⇒ m = −a²/4 − 3a − 8\n= −(1/4)(a² + 12a) − 8 = −(1/4)(a + 6)² + 9 − 8 = −(1/4)(a + 6)² + 1，T=4，U=6，V=1。\n\n【步骤4：m 的最大最小（−8 ≦ a ≦ −5）】\n开口向下，顶点 a = −6 在范围内：最大值 1，W=6，X=1。\n离 −6 较远的端点 a = −8：m = −(1/4) × 4 + 1 = 0（a = −5 时 m = 3/4）。\n最小值 0，Y=8，Z=0。",
    "trap": "不等式两边除以 −4 要变号：20 ≦ −4a ⇒ a ≦ −5。",
    "variant": "「最小值的最大值」：外层函数的自变量换成了参数 a，方法与普通二次函数最值完全相同。",
    "blanks": [
      {
        "key": "N",
        "label": "[N]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "O",
        "label": "[O]",
        "ans": "8",
        "len": 1
      },
      {
        "key": "P",
        "label": "[P]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "Q",
        "label": "[Q]",
        "ans": "8",
        "len": 1
      },
      {
        "key": "R",
        "label": "[R]",
        "ans": "8",
        "len": 1
      },
      {
        "key": "S",
        "label": "[S]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "T",
        "label": "[T]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "U",
        "label": "[U]",
        "ans": "6",
        "len": 1
      },
      {
        "key": "V",
        "label": "[V]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "W",
        "label": "[W]",
        "ans": "6",
        "len": 1
      },
      {
        "key": "X",
        "label": "[X]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "Y",
        "label": "[Y]",
        "ans": "8",
        "len": 1
      },
      {
        "key": "Z",
        "label": "[Z]",
        "ans": "0",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{N}=3,\\ \\text{O}=8,\\ \\text{P}=3,\\ \\text{Q}=8,\\ \\text{R}=8,\\ \\text{S}=5,\\ \\text{T}=4,\\ \\text{U}=6,\\ \\text{V}=1,\\ \\text{W}=6,\\ \\text{X}=1,\\ \\text{Y}=8,\\ \\text{Z}=0$"
  },
  {
    "id": "real-2021-1-3",
    "source": "2021第1回 III",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "整数：5進法と9進法で数字が逆に並ぶ数",
    "type": "mark",
    "mtype": "int",
    "level": "core",
    "paperImg": "./papers/2021_1_q_p07.png",
    "ansImg": "./papers/2021_1_q_p09.png",
    "q": "【2021第1回 III】正の整数 $N$ を 5 進法と 9 進法で表すと，それぞれ3桁の数で数字の並ぶ順序が逆になる。このような整数 $N$ を 10 進法と 4 進法で表そう。$N$ を 5 進法で表すと $abc$，9 進法で表すと $cba$ であるとする。このとき $\\text{[A]} \\le a \\le \\text{[B]}$，$\\text{[C]} \\le b \\le \\text{[D]}$，$\\text{[E]} \\le c \\le \\text{[F]}$ ……① である。また $N = \\text{[GH]}a + \\text{[I]}b + c = \\text{[JK]}c + \\text{[L]}b + a$ であるから $b = \\text{[M]}a - \\text{[NO]}c$ ……② を得る。①，② を満たす $a,\\ b,\\ c$ を求めると $a = \\text{[P]}$，$b = \\text{[Q]}$，$c = \\text{[R]}$ である。したがって，$N$ を 10 進法で表すと $\\text{[STU]}$ であり，4 進法で表すと $\\text{[VWXY]}$ である。",
    "q_cn": "【2021第1回 III】正整数 $N$ 用 5 进制和 9 进制表示时都是三位数，且数字顺序正好相反。用 10 进制和 4 进制表示 $N$。设 $N$ 的 5 进制表示为 $abc$，9 进制表示为 $cba$，则 $\\text{[A]} \\le a \\le \\text{[B]}$，$\\text{[C]} \\le b \\le \\text{[D]}$，$\\text{[E]} \\le c \\le \\text{[F]}$ ……①。又 $N = \\text{[GH]}a + \\text{[I]}b + c = \\text{[JK]}c + \\text{[L]}b + a$，所以 $b = \\text{[M]}a - \\text{[NO]}c$ ……②。满足 ①② 的是 $a = \\text{[P]}$，$b = \\text{[Q]}$，$c = \\text{[R]}$。所以 $N$ 的 10 进制表示为 $\\text{[STU]}$，4 进制表示为 $\\text{[VWXY]}$。",
    "hint": "5 进制的每一位只能是 0〜4；最高位不能是 0。a 是 5 进制的最高位，c 是 9 进制的最高位，所以 a, c ≧ 1。",
    "expl": "【步骤1：各位的范围】\na, b, c 都是 5 进制的数字：0〜4。a（5 进制最高位）和 c（9 进制最高位）不能是 0。\n1 ≦ a ≦ 4，0 ≦ b ≦ 4，1 ≦ c ≦ 4，A=1，B=4，C=0，D=4，E=1，F=4。\n\n【步骤2：两种写法相等】\nN = 25a + 5b + c = 81c + 9b + a，GH=25，I=5，JK=81，L=9。\n24a − 80c = 4b ⇒ b = 6a − 20c，M=6，NO=20。\n\n【步骤3：试 c】\n0 ≦ 6a − 20c ≦ 4：\nc = 1：20 ≦ 6a ≦ 24 ⇒ a = 4，b = 24 − 20 = 4。\nc ≧ 2：6a ≧ 40 ⇒ a ≧ 7，超出范围。\na = 4，b = 4，c = 1，P=4，Q=4，R=1。\n\n【步骤4：换算】\nN = 25 × 4 + 5 × 4 + 1 = 121（检查：81 × 1 + 9 × 4 + 4 = 121 ✓），STU=121。\n4 进制：121 = 64 × 1 + 16 × 3 + 4 × 2 + 1 ⇒ 1321，VWXY=1321。",
    "trap": "b 可以是 0，但 a、c 作为最高位不能是 0；b 也必须 ≦ 4（它同时是 5 进制的数字）。",
    "variant": "n 进制换成 10 进制：各位乘 n 的幂相加；10 进制换成 n 进制：反复除以 n 取余数（或从大的幂开始减）。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "B",
        "label": "[B]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "C",
        "label": "[C]",
        "ans": "0",
        "len": 1
      },
      {
        "key": "D",
        "label": "[D]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "E",
        "label": "[E]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "F",
        "label": "[F]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "GH",
        "label": "[GH]",
        "ans": "25",
        "len": 2
      },
      {
        "key": "I",
        "label": "[I]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "JK",
        "label": "[JK]",
        "ans": "81",
        "len": 2
      },
      {
        "key": "L",
        "label": "[L]",
        "ans": "9",
        "len": 1
      },
      {
        "key": "M",
        "label": "[M]",
        "ans": "6",
        "len": 1
      },
      {
        "key": "NO",
        "label": "[NO]",
        "ans": "20",
        "len": 2
      },
      {
        "key": "P",
        "label": "[P]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "Q",
        "label": "[Q]",
        "ans": "4",
        "len": 1
      },
      {
        "key": "R",
        "label": "[R]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "STU",
        "label": "[STU]",
        "ans": "121",
        "len": 3
      },
      {
        "key": "VWXY",
        "label": "[VWXY]",
        "ans": "1321",
        "len": 4
      }
    ],
    "ansSummary": "$\\text{A}=1,\\ \\text{B}=4,\\ \\text{C}=0,\\ \\text{D}=4,\\ \\text{E}=1,\\ \\text{F}=4,\\ \\text{GH}=25,\\ \\text{I}=5,\\ \\text{JK}=81,\\ \\text{L}=9,\\ \\text{M}=6,\\ \\text{NO}=20,\\ \\text{P}=4,\\ \\text{Q}=4,\\ \\text{R}=1,\\ \\text{STU}=121,\\ \\text{VWXY}=1321$"
  },
  {
    "id": "real-2021-1-4",
    "source": "2021第1回 IV (1)",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "図形と計量：45°・75° の三角形と角の二等分線",
    "type": "mark",
    "mtype": "geo",
    "level": "core",
    "paperImg": "./papers/2021_1_q_p08.png",
    "ansImg": "./papers/2021_1_q_p09.png",
    "q": "【2021第1回 IV (1)】三角形 ABC において，$\\angle\\text{B} = 45^\\circ$，$\\angle\\text{C} = 75^\\circ$ とし，$\\angle\\text{A}$ の2等分線と辺 BC との交点を D とする。(1) 正弦定理より $\\text{AC} = \\dfrac{\\sqrt{\\text{[A]}}}{\\text{[B]}}\\text{BC}$，$\\text{AD} = \\sqrt{\\text{[C]}}\\,\\text{BD}$ である。特に $\\angle\\text{ADC} = \\text{[DE]}^\\circ$ より $\\text{BD} : \\text{BC} = \\text{[F]} : \\sqrt{\\text{[G]}}$ となるので，$\\text{AB} : \\text{AC} = \\text{[H]} : (\\sqrt{\\text{[I]}} - \\text{[J]})$ が得られる。",
    "q_cn": "【2021第1回 IV (1)】三角形 ABC 中，$\\angle\\text{B} = 45^\\circ$，$\\angle\\text{C} = 75^\\circ$，$\\angle\\text{A}$ 的平分线与 BC 交于 D。(1) 由正弦定理，$\\text{AC} = \\dfrac{\\sqrt{\\text{[A]}}}{\\text{[B]}}\\text{BC}$，$\\text{AD} = \\sqrt{\\text{[C]}}\\,\\text{BD}$。由 $\\angle\\text{ADC} = \\text{[DE]}^\\circ$ 得 $\\text{BD} : \\text{BC} = \\text{[F]} : \\sqrt{\\text{[G]}}$，所以 $\\text{AB} : \\text{AC} = \\text{[H]} : (\\sqrt{\\text{[I]}} - \\text{[J]})$。",
    "hint": "∠A = 60°，平分后两个 30°。△ADC 中 ∠DAC = 30°、∠C = 75° ⇒ ∠ADC = 75°，是等腰三角形：AD = AC。",
    "expl": "【步骤1：AC 与 BC】\n∠A = 180° − 45° − 75° = 60°。\nAC/sin45° = BC/sin60° ⇒ AC = BC × (√2/2)/(√3/2) = (√2/√3)BC = (√6/3)BC，A=6，B=3。\n\n【步骤2：AD 与 BD（△ABD）】\n∠BAD = 30°：AD/sin45° = BD/sin30° ⇒ AD = BD × (√2/2)/(1/2) = √2·BD，C=2。\n\n【步骤3：∠ADC】\n∠ADC 是 △ABD 的外角：45° + 30° = 75°，DE=75。\n\n【步骤4：BD : BC】\n△ADC 中 ∠ADC = ∠ACD = 75° ⇒ AD = AC。\n√2·BD = (√6/3)BC ⇒ BD/BC = √6/(3√2) = √3/3 = 1/√3 ⇒ BD : BC = 1 : √3，F=1，G=3。\n\n【步骤5：AB : AC（角平分线定理）】\nAB : AC = BD : DC = 1 : (√3 − 1)，H=1，I=3，J=1。",
    "trap": "DC = BC − BD = (√3 − 1)BD，比值要用 BD : DC，不是 BD : BC。",
    "variant": "看到两个相等的角（75°、75°）立刻想到等腰三角形，能省掉一次正弦定理。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "6",
        "len": 1
      },
      {
        "key": "B",
        "label": "[B]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "C",
        "label": "[C]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "DE",
        "label": "[DE]",
        "ans": "75",
        "len": 2
      },
      {
        "key": "F",
        "label": "[F]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "G",
        "label": "[G]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "H",
        "label": "[H]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "I",
        "label": "[I]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "J",
        "label": "[J]",
        "ans": "1",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{A}=6,\\ \\text{B}=3,\\ \\text{C}=2,\\ \\text{DE}=75,\\ \\text{F}=1,\\ \\text{G}=3,\\ \\text{H}=1,\\ \\text{I}=3,\\ \\text{J}=1$"
  },
  {
    "id": "real-2021-1-4b",
    "source": "2021第1回 IV (2)",
    "auditStatus": "verified",
    "auditNote": "题面按原卷逐字转写，每一空都和官方正解表核对过，并经 tools/verify_math.py 用 SymPy 重新计算。",
    "deck": "数Ⅰ·A",
    "topic": "図形と計量：2つの外接円の中心と面積比",
    "type": "mark",
    "mtype": "geo",
    "level": "stretch",
    "paperImg": "./papers/2021_1_q_p08.png",
    "ansImg": "./papers/2021_1_q_p09.png",
    "q": "【2021第1回 IV (2)】（三角形 ABC で $\\angle\\text{B} = 45^\\circ$，$\\angle\\text{C} = 75^\\circ$，$\\angle\\text{A}$ の2等分線と BC の交点 D。(1) より $\\text{AB} : \\text{AC} = 1 : (\\sqrt{3} - 1)$）三角形 ABD の外接円の中心を $\\text{O}_1$，三角形 ADC の外接円の中心を $\\text{O}_2$ とする。三角形 ABC と三角形 $\\text{AO}_1\\text{O}_2$ の面積比 $\\triangle\\text{ABC} : \\triangle\\text{AO}_1\\text{O}_2$ を求めよう。$\\angle\\text{AO}_1\\text{D} = \\text{[KL]}^\\circ$，$\\angle\\text{AO}_2\\text{O}_1 = \\text{[MN]}^\\circ$ であるから，(1) での考察より $\\text{AC} = \\sqrt{\\text{[O]}}\\,\\text{AO}_1$，$\\text{AO}_2 = (\\sqrt{\\text{[P]}} - \\text{[Q]})\\,\\text{AO}_1$ である。したがって $\\triangle\\text{ABC} : \\triangle\\text{AO}_1\\text{O}_2 = \\text{[R]} : (\\text{[S]} - \\sqrt{\\text{[T]}})$ である。",
    "q_cn": "【2021第1回 IV (2)】（三角形 ABC 中 $\\angle\\text{B} = 45^\\circ$，$\\angle\\text{C} = 75^\\circ$，D 为 $\\angle\\text{A}$ 平分线与 BC 的交点；由 (1) 知 $\\text{AB} : \\text{AC} = 1 : (\\sqrt{3} - 1)$）设三角形 ABD 的外接圆圆心为 $\\text{O}_1$，三角形 ADC 的外接圆圆心为 $\\text{O}_2$，求面积比 $\\triangle\\text{ABC} : \\triangle\\text{AO}_1\\text{O}_2$。$\\angle\\text{AO}_1\\text{D} = \\text{[KL]}^\\circ$，$\\angle\\text{AO}_2\\text{O}_1 = \\text{[MN]}^\\circ$，所以 $\\text{AC} = \\sqrt{\\text{[O]}}\\,\\text{AO}_1$，$\\text{AO}_2 = (\\sqrt{\\text{[P]}} - \\text{[Q]})\\,\\text{AO}_1$。因此 $\\triangle\\text{ABC} : \\triangle\\text{AO}_1\\text{O}_2 = \\text{[R]} : (\\text{[S]} - \\sqrt{\\text{[T]}})$。",
    "hint": "圆心角 = 2 × 圆周角。O₁O₂ 是公共弦 AD 的垂直平分线，所以它平分 ∠AO₁D 和 ∠AO₂D。最后发现 △AO₁O₂ 与 △ABC 相似。",
    "expl": "【步骤1：∠AO₁D】\nAD 在 ⊙O₁ 中所对的圆周角是 ∠ABD = 45°，圆心角 ∠AO₁D = 90°，KL=90。\n\n【步骤2：∠AO₂O₁】\nAD 在 ⊙O₂ 中所对的圆周角是 ∠ACD = 75°，∠AO₂D = 150°。\nO₁O₂ 垂直平分公共弦 AD，平分这个角：∠AO₂O₁ = 75°，MN=75。\n\n【步骤3：AC 与 AO₁】\n△AO₁D 是等腰直角三角形：AD = √2·AO₁；又 (1) 中 AD = AC ⇒ AC = √2·AO₁，O=2。\n\n【步骤4：△AO₁O₂ 的形状】\n∠AO₁O₂ = 90°/2 = 45°，∠AO₂O₁ = 75° ⇒ ∠O₁AO₂ = 60°。\n三个角 60°、45°、75° 和 △ABC（∠A, ∠B, ∠C）一样，两三角形相似：\nAO₁ 对应 AB，AO₂ 对应 AC ⇒ AO₂ : AO₁ = AC : AB = (√3 − 1) : 1，即 AO₂ = (√3 − 1)AO₁，P=3，Q=1。\n\n【步骤5：面积比 = 相似比的平方】\n相似比 AO₁ : AB。AO₁ = AC/√2，AB = AC/(√3 − 1) ⇒ AO₁/AB = (√3 − 1)/√2。\n面积比 = (√3 − 1)²/2 = (4 − 2√3)/2 = 2 − √3。\n△ABC : △AO₁O₂ = 1 : (2 − √3)，R=1，S=2，T=3。",
    "trap": "两圆的连心线垂直平分公共弦，所以 ∠AO₂O₁ 是 ∠AO₂D 的一半。",
    "variant": "发现「三个角都相同」就用相似：面积比 = 对应边之比的平方，省去求高。",
    "blanks": [
      {
        "key": "KL",
        "label": "[KL]",
        "ans": "90",
        "len": 2
      },
      {
        "key": "MN",
        "label": "[MN]",
        "ans": "75",
        "len": 2
      },
      {
        "key": "O",
        "label": "[O]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "P",
        "label": "[P]",
        "ans": "3",
        "len": 1
      },
      {
        "key": "Q",
        "label": "[Q]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "R",
        "label": "[R]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "S",
        "label": "[S]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "T",
        "label": "[T]",
        "ans": "3",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{KL}=90,\\ \\text{MN}=75,\\ \\text{O}=2,\\ \\text{P}=3,\\ \\text{Q}=1,\\ \\text{R}=1,\\ \\text{S}=2,\\ \\text{T}=3$"
  },
  {
    "id": "real-2021-2-1",
    "source": "2021第2回 正解表 p.5 I問1",
    "auditStatus": "verified",
    "auditNote": "已在阶段2严格按官方原卷恢复マーク式填空：A=1, B=2 (顶点为 (a+1, a²-a+2))",
    "deck": "数Ⅰ·A",
    "topic": "2021-2真题·2次関数(動く軸と最大値)",
    "type": "mark",
    "paperImg": "./papers/2021_2_q_p04.png",
    "ansImg": "./papers/2021_2_ans_p05.png",
    "q": "【2021第2回 I問1】2次関数 $f(x) = -2x^2 + 4(a + 1)x - a^2 - 5a$ の頂点の座標は $(a + \\text{[A]},\\ a^2 - a + \\text{[B]})$ である。",
    "hint": "这道题是“动轴定区间（轴 x = a+1 在动，区间 [1, 4] 固定）”求最大值的标准模板！开口向下（山峰形），最大值的分界线永远是【对称轴在区间的左边（a+1 ≦ 1）、区间里面（1 < a+1 ≦ 4）、区间的右边（a+1 > 4）】这三段！",
    "expl": " 【步骤1：配方求顶点】\nf(x) = −2[$x^2$ − 2(a + 1)x] − $a^2$ − 5a\n括号里一次项是 −2(a+1)，折半就是 −(a+1)，平方是 $(a+1)^2$：\nf(x) = −2[$(x − (a + 1))^2$ − $(a + 1)^2$] − $a^2$ − 5a\n     = −2$(x − (a + 1))^2$ + 2($a^2$ + 2a + 1) − $a^2$ − 5a\n     = −2$(x − (a + 1))^2$ + $a^2$ − a + 2。\n所以顶点横坐标（对称轴）是 x = a + 1（A = 1），顶点纵坐标是 $a^2$ − a + 2（B = 2）！\n\n【步骤2：求三段分类的边界 C 和 F】\n区间是 1 ≦ x ≦ 4，对称轴是 x = a + 1：\n• 情况(i) 对称轴在左端点 1 的左边：a + 1 ≦ 1  ⇒  a ≦ 0（所以 C = 0）！此时左端点 f(1) 最大。\n• 情况(ii) 对称轴在 1 和 4 之间：1 < a + 1 ≦ 4  ⇒  0 < a ≦ 3（所以 F = 3）！此时顶点 $a^2$−a+2 最大。\n• 情况(iii) 对称轴在右端点 4 的右边：a + 1 > 4  ⇒  a > 3！此时右端点 f(4) 最大。",
    "trap": "a + 1 = 1 得 a = 0；a + 1 = 4 得 a = 3，两秒钟白拿两空！",
    "variant": "凡是开口向下求区间最大值，永远按【轴 < 左端、左端 ≦ 轴 ≦ 右端、轴 > 右端】分三类；如果是开口向上求区间最大值，那就按【轴 < 区间中点、轴 ≧ 区间中点】分两类！",
    "q_cn": "【2021第2回 I问1】二次函数 $f(x) = -2x^2 + 4(a + 1)x - a^2 - 5a$ 的顶点坐标为 $(a + \\text{[A]},\\ a^2 - a + \\text{[B]})$。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "B",
        "label": "[B]",
        "ans": "2",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{A}=1,\\ \\text{B}=2\\ (\\text{頂点 } (a+1,\\ a^2-a+2))$"
  },
  {
    "id": "real-2021-2-2",
    "source": "2021第2回 正解表 p.5 II問1",
    "auditStatus": "verified",
    "auditNote": "已在阶段2严格按官方原卷恢复マーク式填空：A=5, B=2 (x = (5+√21)/2), C=5 (x + 1/x = 5)",
    "deck": "数Ⅰ·A",
    "topic": "2021-2真题·数と式(対称式と次数下げ)",
    "type": "mark",
    "paperImg": "./papers/2021_2_q_p08.png",
    "ansImg": "./papers/2021_2_ans_p05.png",
    "q": "【2021第2回 II問1】$x = \\dfrac{2}{5 - \\sqrt{21}}$ のとき、分母を有理化すると $x = \\dfrac{\\text{[A]} + \\sqrt{21}}{\\text{[B]}}$ であり、$x + \\dfrac{1}{x} = \\text{[C]}$ である。",
    "hint": "看到 x = (5 + $\\sqrt{21}$)/2 之后，1/x 就是原来的 2/(5 + $\\sqrt{21}$) = (5 − $\\sqrt{21}$)/2，两个一加根号全消掉，得到 x + 1/x = 5！再把这个式子两边同乘 x 移项，直接得到【降次神式：$x^2$ − 5x = −1】！",
    "expl": " 【步骤1：分母有理化】\nx = 2 / (5 − $\\sqrt{21}$)，上下同乘 (5 + $\\sqrt{21}$)：\n分母 = $5^2$ − $(\\sqrt{21})^2$ = 25 − 21 = 4。\n所以 x = 2(5 + $\\sqrt{21}$) / 4 = (5 + $\\sqrt{21}$) / 2（正解表 A=5, B=2）！\n\n【步骤2：求 x + 1/x】\n因为原来的 x = 2 / (5 − $\\sqrt{21}$)，那它的倒数 1/x 就是把分子分母倒过来：\n1/x = (5 − $\\sqrt{21}$) / 2！\n所以 x + 1/x = (5 + $\\sqrt{21}$)/2 + (5 − $\\sqrt{21}$)/2 = 10/2 = 5（正解表 C=5）！\n\n【步骤3：求 $x^2$ − 5x（降次法）】\n不用把根号代进 $x^2$ − 5x 硬算！\n直接拿刚才的 x + 1/x = 5，两边同时乘以 x：\n$x^2$ + 1 = 5x\n把 5x 移到左边，1 移到右边：\n$x^2$ − 5x = −1（正解表 HI = −1）！\n（接着最后一问求 ($x^2$−1)($x^2$−7x+12)($x^2$−8x+12)，把后面因式分解成 (x−1)(x+1)(x−3)(x−4)(x−2)(x−6)，首尾配对：(x+1)(x−6)=$x^2$−5x−6=−7，(x−1)(x−4)=$x^2$−5x+4=3，(x−2)(x−3)=$x^2$−5x+6=5，乘起来 (−7)×3×5 = −105，秒出 JKL=105！）",
    "trap": "看到四个一次括号相乘 (x+1)(x−6)(x−1)(x−4)(x−2)(x−3)，怎么配对？找【常数项加起来都等于 −5】的两两配对：(+1和−6)、(−1和−4)、(−2和−3)，这样每一对乘出来都有 $x^2$ − 5x，全部换成 −1 就变成小学乘法了！",
    "variant": "凡是已知 x = a + √b，求高次多项式的值，永远先把 a 移过去写成 $(x − a)^2$ = b，化出 $x^2$ − 2ax + ($a^2$−b) = 0 来整体代换！",
    "q_cn": "【2021第2回 II问1】当 $x = \\dfrac{2}{5 - \\sqrt{21}}$ 时，分母有理化得 $x = \\dfrac{\\text{[A]} + \\sqrt{21}}{\\text{[B]}}$，求 $x + \\dfrac{1}{x} = \\text{[C]}$。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "5",
        "len": 1
      },
      {
        "key": "B",
        "label": "[B]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "C",
        "label": "[C]",
        "ans": "5",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{A}=5,\\ \\text{B}=2\\ \\left(x = \\frac{5+\\sqrt{21}}{2}\\right),\\ \\text{C}=5\\ \\left(x + \\frac{1}{x} = 5\\right)$"
  },
  {
    "id": "real-2021-2-4",
    "source": "2021第2回 正解表 p.5 IV(1)",
    "auditStatus": "verified",
    "auditNote": "已在阶段2严格按官方原卷恢复マーク式填空：A=1 (面积 S = 1), BC=10 (BC = √10)",
    "deck": "数Ⅰ·A",
    "topic": "2021-2真题·図形と計量(135°と角の三等分線)",
    "type": "mark",
    "paperImg": "./papers/2021_2_q_p14.png",
    "ansImg": "./papers/2021_2_ans_p05.png",
    "q": "【2021第2回 IV】$\\triangle\\text{ABC}$ において $\\text{AB} = 2,\\ \\text{AC} = \\sqrt{2},\\ \\angle\\text{BAC} = 135^\\circ$ とする。(1) $\\triangle\\text{ABC}$ の面積は $\\text{[A]}$ であり、$\\text{BC} = \\sqrt{\\text{[BC]}}$ である。",
    "hint": "看到“两边 AB=2, AC=$\\sqrt{2}$ 和夹角 135°”，又是标准的三连击送分题！记住钝角 135° 的三角比（跟 45° 一样都是 $\\sqrt{2}$/2，只是 sin 135° = +$\\sqrt{2}$/2 为正，cos 135° = −$\\sqrt{2}$/2 为负）！",
    "expl": " 【步骤1：求面积 A】\nS = 1/2 × AB × AC × sin 135°\n因为 sin 135° = sin 45° = $\\sqrt{2}$/2：\nS = 1/2 × 2 × $\\sqrt{2}$ × ($\\sqrt{2}$/2) = 1（正解表 A = 1）！\n\n【步骤2：余弦定理求对边 BC】\n$BC^2$ = $AB^2$ + $AC^2$ − 2 × AB × AC × cos 135°\n注意！cos 135° = −$\\sqrt{2}$/2（是负数，减负数变加号！）：\n$BC^2$ = $2^2$ + $(\\sqrt{2})^2$ − 2 × 2 × $\\sqrt{2}$ × (−$\\sqrt{2}$/2)\n    = 4 + 2 + 4 = 10！\n所以 BC = $\\sqrt{10}$（正解表 BC = 10）！\n\n【步骤3：正弦定理求外接圆半径 R】\n2R = BC / sin 135° = $\\sqrt{10}$ ÷ ($\\sqrt{2}$/2) = $\\sqrt{10}$ × $\\sqrt{2}$ = $\\sqrt{20}$ = $2\\sqrt{5}$。\n两边除以 2：R = $\\sqrt{5}$（正解表 D = 5）！",
    "trap": "钝角（120°, 135°, 150°）用余弦定理时，因为 cos 是负数，公式里的「− 2bc cos A」负负得正一定会变成「＋」！算出来的第三边平方一定比 $a^2$+$b^2$ 更大！如果你算出来比 4+2=6 还小，说明你忘了变加号！",
    "variant": "第(2)问哪怕遇到没见过的“角的三等分线（135°分成三个45°）”，也完全不用怕：因为分出来的角是 45°，直接用【左面积 + 右面积 = 大面积】就能白拿一串分数！",
    "q_cn": "【2021第2回 IV】在 $\\triangle\\text{ABC}$ 中，已知 $\\text{AB} = 2,\\ \\text{AC} = \\sqrt{2},\\ \\angle\\text{BAC} = 135^\\circ$。(1) $\\triangle\\text{ABC}$ 的面积为 $\\text{[A]}$，边长 $\\text{BC} = \\sqrt{\\text{[BC]}}$。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "1",
        "len": 1
      },
      {
        "key": "BC",
        "label": "[BC]",
        "ans": "10",
        "len": 2
      }
    ],
    "ansSummary": "$\\text{A}=1\\ (S = 1),\\ \\text{BC}=10\\ (\\text{BC} = \\sqrt{10})$"
  },
  {
    "id": "var-math-001",
    "source": "改编自 2024第1回 I問1",
    "auditStatus": "verified",
    "auditNote": "已在阶段2严格按官方原卷恢复マーク式填空：A=7 (a = 7)",
    "deck": "数Ⅰ·A",
    "topic": "变形特训·2次関数(最大最小の逆問題)",
    "type": "mark",
    "q": "【母题变形1：文字系数在常数项】2次関数 $y = x^2 - 4x + a - 1\\ (0 \\le x \\le 3)$ の最小値が $2$ であるとき、定数 $a = \\text{[A]}$ である。",
    "hint": "别被后面的 +a−1 吓到！$x^2$ 和 −4x 里根本没有 a，说明对称轴是死死固定的！先不管 a，把 $x^2$ − 4x 配方成 $(x − 2)^2$ − 4，对称轴 x = 2 在 [0, 3] 里面，所以 x = 2 时就是最小值！",
    "expl": " 【看穿马甲】\n普通题是“给你 a 求最小值”，这道变形题是“给你最小值 2 反求 a”，其实做法一模一样！\n\n【步骤1：配方找顶点】\ny = ($x^2$ − 4x) + a − 1 = $(x − 2)^2$ − 4 + a − 1 = $(x − 2)^2$ + a − 5。\n开口向上，对称轴是 x = 2，顶点高度是 a − 5。\n\n【步骤2：对号入座求 a】\n因为对称轴 x = 2 在区间 0 ≦ x ≦ 3 里面，所以顶点高度就是最小值：\na − 5 = 2  ⇒  a = 7！\n\n【步骤3：求最大值】\n区间两端是 0 和 3，谁离对称轴 2 更远？\n0 到 2 的距离是 2；3 到 2 的距离是 1。所以 x = 0 处最高！\n把 x = 0, a = 7 代入：y = 0 − 0 + 7 − 1 = 6！",
    "trap": "遇到带字母 a 的二次函数，第一眼先看 $x^2$ 和 x 前面有没有 a！如果没有 a（只有最后常数项带 a），那对称轴就是固定的数字，闭着眼睛配方就行！",
    "variant": "①常数项带a（轴固定，最简单）；②前两项同乘a（如 $ax^2$−4ax，提a后轴还是固定的x=2）；③只有一次项带a（如 $x^2$−2ax，轴 x=a 会动，需按轴在区间左、中、右分3段）。",
    "q_cn": "【母题变形1：文字系数在常数项】二次函数 $y = x^2 - 4x + a - 1\\ (0 \\le x \\le 3)$ 的最小值为 $2$ 时，常数 $a = \\text{[A]}$。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "7",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{A}=7\\ (a = 7)$"
  },
  {
    "id": "var-math-002",
    "source": "改编自 2022第2回 I問1",
    "auditStatus": "verified",
    "auditNote": "已在阶段2严格按官方原卷恢复マーク式填空：A=5 (c = 5)",
    "deck": "数Ⅰ·A",
    "topic": "变形特训·2次関数(x軸から切り取る線分)",
    "type": "mark",
    "q": "【母题变形2：弦长脱马甲】2次関数 $y = x^2 - 6x + c$ のグラフが $x$ 軸から切り取る線分の長さが $4$ であるとき、定数 $c = \\text{[A]}$ である。",
    "hint": "看到「x軸から切り取る線分の長さが 4（在x轴上截出的线段长是4）」，利用抛物线左右对称：对称轴是 x = 3，线段总长是 4，说明左右各长 2，两个交点直接是 3−2 = 1 和 3+2 = 5。",
    "expl": "【步骤1：找对称轴】\ny = $x^2$ − 6x + c = $(x − 3)^2$ − 9 + c，对称轴是 x = 3。\n\n【步骤2：利用左右对称直接写出交点】\n抛物线被 x 轴（或任何水平线）截出来的线段，一定被对称轴 x = 3 平分成左右相等的两半！\n既然线段总长是 4，那么左半边长 2，右半边也长 2：\n• 左交点：x = 3 − 2 = 1\n• 右交点：x = 3 + 2 = 5\n\n【步骤3：代回求 c】\n既然过点 (1, 0)，把 x = 1, y = 0 代入原式：\n$1^2$ − 6×1 + c = 0  ⇒  c = 5！（或者由两根之积 1×5 = 5 直接得 c = 5）！\n（2022年第2回 I問1 就是考这招：直线 y=1 截出长 4，说明交点离对称轴 p 的距离 |α − p| = 4÷2 = 2！）",
    "trap": "记住这个神仙结论：抛物线与水平线交点间的距离是 L，那么交点到对称轴的水平距离就是一半（L/2）！",
    "variant": "如果题目把“与 x 轴相交”改成“与直线 y = 3 相交，截出线段长 6”（2022年第2回真题），同样说明交点离对称轴距离是 6÷2 = 3，即把 x = p + 3 代入时 y = 3！",
    "q_cn": "【母题变形2：弦长脱马甲】二次函数 $y = x^2 - 6x + c$ 的图象在 $x$ 轴上截取的线段长为 $4$ 时，常数 $c = \\text{[A]}$。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "5",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{A}=5\\ (c = 5)$"
  },
  {
    "id": "var-math-003",
    "source": "改编自 2024第1回 II問2",
    "auditStatus": "verified",
    "auditNote": "已在阶段2严格按官方原卷恢复マーク式填空：AB=-2, C=6 (-2 < m < 6)",
    "deck": "数Ⅰ·A",
    "topic": "变形特训·2次不等式(すべての実数)",
    "type": "mark",
    "q": "【母题变形3：恒成立脱马甲】すべての実数 $x$ に対して 2次不等式 $x^2 - mx + m + 3 > 0$ が成り立つような定数 $m$ の値の範囲は $\\text{[AB]} < m < \\text{[C]}$ である。",
    "hint": "看到「すべての実数 x に対して … > 0 が成り立つ（对所有x都大于0）」或者「2次方程式が実数解をもたない（无实根）」或者「グラフが x 軸と共有点をもたない（与x轴无交点）」，这三句话其实是穿了不同衣服的同一个题！意思全都是“整条碗状抛物线悬在 x 轴上方，没碰到 x 轴”，所以全部无脑写【判别式 D < 0】！",
    "expl": " 【看穿马甲】\n开口向上的抛物线 y = $x^2$ − mx + (m + 3) 要想永远 > 0（永远在 x 轴上方），就不能跟 x 轴有任何交点！\n没有交点 ⇔ 判别式 D < 0（注意是小于 0，不是大于 0）！\n\n【步骤1：算判别式 D = $b^2$ − 4ac】\n这里 a = 1，b = −m，c = m + 3。\nD = $(−m)^2$ − 4 × 1 × (m + 3) = $m^2$ − 4m − 12。\n\n【步骤2：解 D < 0】\n$m^2$ − 4m − 12 < 0\n十字相乘（相乘得−12，相加得−4，是 −6 和 +2）：\n(m − 6)(m + 2) < 0\n小于 0 取中间：−2 < m < 6！",
    "trap": "80% 的同学看到题目里有「> 0」就顺手写 D > 0，直接掉坑！记住：永远 > 0 意思是“悬在空中不落地（没交点）”，没交点必须写 D < 0！",
    "variant": "如果原式里带有 ≥ 0（即「すべての実数 x に対して … ≧ 0」允许刚好碰到 x 轴），那就把 D < 0 改成 D ≦ 0（即 −2 ≦ m ≦ 6）！",
    "q_cn": "【母题变形3：恒成立脱马甲】对所有实数 $x$，二次不等式 $x^2 - mx + m + 3 > 0$ 恒成立的常数 $m$ 范围为 $\\text{[AB]} < m < \\text{[C]}$。",
    "blanks": [
      {
        "key": "AB",
        "label": "[AB]",
        "ans": "-2",
        "len": 2
      },
      {
        "key": "C",
        "label": "[C]",
        "ans": "6",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{AB}=-2,\\ \\text{C}=6\\ (-2 < m < 6)$"
  },
  {
    "id": "var-math-004",
    "source": "改编自 2019第1回 II問1",
    "auditStatus": "verified",
    "auditNote": "已在阶段2严格按官方原卷恢复マーク式填空：AB=-3, C=8 (-3/8)",
    "deck": "数Ⅰ·A",
    "topic": "变形特训·図形と計量(sin+cosの対称式)",
    "type": "mark",
    "q": "【母题变形4：三角比配方脱马甲】$0^\\circ < \\theta < 180^\\circ$ で $\\sin\\theta + \\cos\\theta = \\dfrac{1}{2}$ のとき、$\\sin\\theta\\cos\\theta = \\dfrac{\\text{[AB]}}{\\text{[C]}}$ である。",
    "hint": "看到给你「sin θ + cos θ」或者「sin θ − cos θ」，第一步永远不用想，直接【左右两边同时平方】！因为平方后会出来 $sin^2$θ + $cos^2$θ，而它永远等于 1！",
    "expl": " 【步骤1：两边平方求 sin θ cos θ】\n已知 sin θ + cos θ = 1/2，左右两边同时平方：\n$(sin θ + cos θ)^2$ = $(1/2)^2$\n左边展开：$sin^2$θ + 2 sin θ cos θ + $cos^2$θ = 1/4\n因为 $sin^2$θ + $cos^2$θ = 1（铁打的公式），换成 1：\n1 + 2 sin θ cos θ = 1/4\n2 sin θ cos θ = 1/4 − 1 = −3/4\n两边除以 2：sin θ cos θ = −3/8！（顺便可以看出：因为乘积是负数，sin 永远是正的，所以 cos θ < 0，θ 一定是钝角！）\n\n【步骤2：求三次方和 $sin^3$θ + $cos^3$θ】\n套三次方公式：$a^3$ + $b^3$ = $(a + b)^3$ − 3ab(a + b)\n把 a+b = 1/2 和 ab = −3/8 代进去：\n$(1/2)^3$ − 3 × (−3/8) × (1/2) = 1/8 + 9/16 = 2/16 + 9/16 = 11/16！",
    "trap": "这道题其实跟「x + y = 1/2, $x^2$ + $y^2$ = 1 求 xy」是完全同一道题！只是把 x, y 换成了 sin θ, cos θ，并且把已知条件 $x^2$+$y^2$=1 藏在了三角恒等式 $sin^2$θ+$cos^2$θ=1 里！",
    "variant": "如果接着问你「sin θ − cos θ 等于多少」，先算 $(sin θ − cos θ)^2$ = 1 − 2 sin θ cos θ = 1 − (−3/4) = 7/4；又因为 sin θ > 0, cos θ < 0（正数减负数一定是正数），所以开根号只取正号 $\\sqrt{7}$/2！",
    "q_cn": "【母题变形4：三角比配方脱马甲】已知 $0^\\circ < \\theta < 180^\\circ$ 且 $\\sin\\theta + \\cos\\theta = \\dfrac{1}{2}$，则 $\\sin\\theta\\cos\\theta = \\dfrac{\\text{[AB]}}{\\text{[C]}}$。",
    "blanks": [
      {
        "key": "AB",
        "label": "[AB]",
        "ans": "-3",
        "len": 2
      },
      {
        "key": "C",
        "label": "[C]",
        "ans": "8",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{AB}=-3,\\ \\text{C}=8\\ \\left(-\\frac{3}{8}\\right)$"
  },
  {
    "id": "var-math-005",
    "source": "改编自 2023第2回 III(3)",
    "auditStatus": "verified",
    "auditNote": "已在阶段2严格按官方原卷恢复マーク式填空：A=2, B=3 (x = 2, y = 3)",
    "deck": "数Ⅰ·A",
    "topic": "变形特训·整数の性質(一次不定方程式)",
    "type": "mark",
    "q": "【母题变形5：不定方程脱马甲】1次不定方程式 $17x - 11y = 1$ を満たす最小の自然数組は $x = \\text{[A]},\\ y = \\text{[B]}$ である。",
    "hint": "解 ax − by = 1 的整数解，如果系数在 20 以内，千万别费劲写辗转相除法回代！直接在草稿纸上把 x = 1, 2, 3, 4... 代进去算 17x − 1，看哪一个能被 11 整除，5秒钟就能试出第一组解！",
    "expl": " 【步骤1：代 x = 1, 2, 3... 找第一组特解】\n我们要让 17x − 11y = 1，也就是 11y = 17x − 1（17x 减 1 要是 11 的倍数）：\n• 试 x = 1：17×1 − 1 = 16（不能被11整除）\n• 试 x = 2：17×2 − 1 = 34 − 1 = 33！33 ÷ 11 = 3！中了！\n所以最小正整数解就是 x₀ = 2, y₀ = 3！\n\n【步骤2：写通解（互换系数加 k）】\n找到特解 (2, 3) 之后，其它所有解怎么写？\n记住：x 每次加上【y 前面的系数 11】，y 每次加上【x 前面的系数 17】！\n也就是：x = 11k + 2，y = 17k + 3！",
    "trap": "写通解时最容易犯的错就是把 17k 和 11k 写反！记住：为了让 17x 和 11y 抵消，x 必须配对方的系数 11k，y 必须配对方的系数 17k（因为 17×11k − 11×17k = 0）！",
    "variant": "如果右边不是 1 而是 5（比如 17x − 11y = 5），先按等于 1 算出 (2, 3)，然后把 2 和 3 同时乘以 5 得到 (10, 15) 就是等于 5 的一组解！",
    "q_cn": "【母题变形5：不定方程脱马甲】满足一次不定方程 $17x - 11y = 1$ 的最小自然数解组为 $x = \\text{[A]},\\ y = \\text{[B]}$。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "2",
        "len": 1
      },
      {
        "key": "B",
        "label": "[B]",
        "ans": "3",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{A}=2,\\ \\text{B}=3\\ (x = 2,\\ y = 3)$"
  },
  {
    "id": "var-math-006",
    "source": "改编自 2022第1回 IV",
    "auditStatus": "verified",
    "auditNote": "已在阶段2严格按官方原卷恢复マーク式填空：A=9, B=5 (PB = 9, AB = 5)",
    "deck": "数Ⅰ·A",
    "topic": "变形特训·図形の性質(方べき・接線・メネラウス)",
    "type": "mark",
    "q": "【母题变形6：圆外切线与割线脱马甲】円Oの外部の点Pから接線PT ($\\text{PT} = 6$) を引き、Pを通る割線が円と2点A, B ($\\text{PA} = 4$) で交わるとき、$\\text{PB} = \\text{[A]},\\ \\text{AB} = \\text{[B]}$ である。",
    "hint": "看到“圆外一点 P、切线 PT、穿过圆的割线 PAB”，100% 是【方幂定理（方べきの定理）】：切线² = 近点 × 远点（$PT^2$ = PA × PB）！最常见的变形坑是：题目给你的是圆里面的弦长 AB=5，而不是远点 PB！所以远点 PB 要写成 PA + 5！",
    "expl": " 【步骤1：分清“近点”和“远点”】\n设我们要算的近点距离 PA = x。\n注意！题目给的 AB = 5 是圆里面那段弦的长度，所以从 P 到远点 B 的总长度是：\nPB = PA + AB = x + 5（千万别直接写 PB = 5！）。\n\n【步骤2：套方幂定理 $PT^2$ = PA × PB】\n$6^2$ = x(x + 5)\n36 = $x^2$ + 5x  ⇒  $x^2$ + 5x − 36 = 0。\n十字相乘（相乘得−36，相加得+5，是 +9 和 −4）：\n(x + 9)(x − 4) = 0。\n因为长度 x > 0，所以 PA = x = 4！",
    "trap": "方幂定理永远是从【交点 P】出发量距离：P到近点A × P到远点B！考场 90% 的错都是把 PA × PB 写成了 PA × AB！",
    "variant": "如果点 P 在圆内部（两条弦 AB 和 CD 在圆内相交于 P），同样是从交点 P 出发：PA × PB = PC × PD！",
    "q_cn": "【母题变形6：圆外切线与割线脱马甲】从圆 O 外一点 P 引切线 PT ($\\text{PT} = 6$)，割线经过 P 与圆交于 A, B 两点 ($\\text{PA} = 4$)。求 $\\text{PB} = \\text{[A]},\\ \\text{AB} = \\text{[B]}$。",
    "blanks": [
      {
        "key": "A",
        "label": "[A]",
        "ans": "9",
        "len": 1
      },
      {
        "key": "B",
        "label": "[B]",
        "ans": "5",
        "len": 1
      }
    ],
    "ansSummary": "$\\text{A}=9,\\ \\text{B}=5\\ (\\text{PB} = 9,\\ \\text{AB} = 5)$"
  }
]
);
