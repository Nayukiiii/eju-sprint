(() => {
  'use strict';

  const EXAM_AT = new Date('2026-11-08T00:00:00+09:00');
  const STORAGE_KEY = 'eju-sprint-state-v1';
  const SYNC_KEY = 'eju-sync-token';
  const SYNC_LAST_KEY = 'eju-sync-last';
  const THEME_KEY = 'eju-theme-mode';
  const INTERVALS = [0, 1, 2, 4, 7, 12];
  const DAILY_TARGET = 40;

  const BUNSO_DECKS = ['政治', '条約', '地理', '経済', '歴史', '社会', '時事', '旧地名'];
  const MATH_DECKS = ['数Ⅰ·A', '公式'];
  const DECK_JP_SUB = {
    '全部文综': '総合科目 全分野',
    '全部': '総合科目 + 数学コース1',
    '数Ⅰ·A': '数学コース1',
    '政治': '政治・統治・憲法',
    '条約': '近代条約・国際関係',
    '地理': '世界地理・日本地理',
    '経済': '市場・財政・金融',
    '歴史': '近現代史・冷戦',
    '社会': '現代社会・労働・環境',
    '時事': '国際時事・統計',
    '旧地名': '歴史地名・都市変遷',
    '变形特训': '過去問改題演習'
  };


  // Built-in core cards + external banks (Stage 2: 100% 四选一マーク式 + 中日双语 + 逐项解析)
  const cards = [
    ...(window.EJU_BANK || []),
    {
        "id": "pol-001",
        "source": "未核实",
        "deck": "政治",
        "topic": "民主政治",
        "type": "mcq",
        "q": "「法の精神」を著し、三権分立を主張した思想家は誰か。",
        "choices": [
            "ロック",
            "ルソー",
            "モンテスキュー",
            "ホッブズ"
        ],
        "a": 2,
        "expl": "孟德斯鸠在《论法的精神》中系统论述立法、行政、司法三权分立；洛克主张自然权利与抵抗权（《政府论》）；卢梭主张人民主权（《社会契约论》）；霍布斯主张君主主权（《利维坦》）。",
        "trap": "人民主权＝卢梭，三权分立＝孟德斯鸠，间接民主·抵抗权＝洛克。",
        "kpLink": "kp-pol-01",
        "q_cn": "著有「法の精神（《论法的精神》）」并主张「三権分立（三权分立）」的启蒙思想家是谁？",
        "choices_cn": [
            "ロック（洛克）",
            "ルソー（卢梭）",
            "モンテスキュー（孟德斯鸠）",
            "ホッブズ（霍布斯）"
        ],
        "optExpl": [
            "选项(1) 错误：洛克著《统冶二论（政府论）》，主张自然权利、社会契约与抵抗权（间接民主）。",
            "选项(2) 错误：卢梭著《社会契约论》，主张人民主权与直接民主制。",
            "选项(3) 正确：孟德斯鸠在《论法的精神》中主张将国家权力分为立法、行政、司法以互相制衡。",
            "选项(4) 错误：霍布斯著《利维坦》，认为自然状态是“所有人对所有人的战争”，主张绝对君主主权。"
        ]
    },
    {
        "id": "pol-002",
        "source": "未核实",
        "deck": "政治",
        "topic": "日本の統治機構",
        "type": "mcq",
        "q": "衆議院の優越が認められていないものはどれか。",
        "choices": [
            "予算の議決",
            "条約の承認",
            "内閣総理大臣の指名",
            "憲法改正の発議"
        ],
        "a": 3,
        "expl": "修宪发议须众参两院分别以【总议员 2/3 以上】赞成，两院完全对等，无众议院优越。其余三项及法律案再可决均有众议院优越。",
        "trap": "预算先议权、内阁不信任案议决权仅众议院拥有；修宪发议两院完全对等。",
        "kpLink": "kp-pol-01",
        "q_cn": "在日本国会制度中，不适用「衆議院の優越（众议院优越）」原则的是哪一项？",
        "choices_cn": [
            "予算の議決（预算的议决）",
            "条約の承認（条约的批准）",
            "内閣総理大臣の指名（内阁总理大臣的指名）",
            "憲法改正の発議（宪法修正案的提议）"
        ],
        "optExpl": [
            "选项(1) 错误：预算案享众议院先议权，参议院30日内不议决或两院协议不一致时以众议院决议为准。",
            "选项(2) 错误：条约批准在两院意见不一致且30日内未决时，适用众议院优越。",
            "选项(3) 错误：首相指名在两院不一致且10日内未决时，以众议院指名为准。",
            "选项(4) 正确：宪法改正的国会发议须众议院与参议院各自以总议员 2/3 以上赞成通过，两院地位完全对等。"
        ]
    },
    {
        "id": "pol-003",
        "source": "未核实",
        "deck": "政治",
        "topic": "日本国憲法",
        "type": "mcq",
        "q": "日本国憲法の三大原則を答えよ。",
        "back": "国民主権・基本的人権の尊重・平和主義",
        "expl": "1946年11月3日公布，1947年5月3日施行。",
        "kpLink": "kp-pol-02",
        "q_cn": "关于「日本国憲法（日本国宪法）」的三大基本原则，以下哪一项完全正确？",
        "choices": [
            "国民主権・基本的人権の尊重・平和主義",
            "君主主権・軍事力の保持・議院内閣制",
            "国家神道・天皇親政・地方分権",
            "国民投票・三権分立・法治主義"
        ],
        "choices_cn": [
            "国民主権・基本的人権の尊重・平和主義（国民主权·尊重基本人权·和平主义）",
            "君主主権・軍事力の保持・議院内閣制（君主主权·保持军事力量·议院内阁制）",
            "国家神道・天皇親政・地方分権（国家神道·天皇亲政·地方分权）",
            "国民投票・三権分立・法治主義（国民投票·三权分立·法治主义）"
        ],
        "a": 0,
        "optExpl": [
            "选项(1) 正确：日本国宪法三大支柱为国民主权（前文、第1条）、尊重基本人权（第11条等）、和平主义（第9条）。",
            "选项(2) 错误：大日本帝国宪法（明治宪法）为天皇主权；现行宪法放弃战争，不保持陆海空战力。",
            "选项(3) 错误：国家神道与天皇亲政属于战前体制，战后宪法第20条明确确立政教分离原则。",
            "选项(4) 错误：三权分立与法治主义属于统治机构原理，并非日本国宪法特有的三大基本原则。"
        ]
    },
    {
        "id": "pol-004",
        "source": "未核实",
        "deck": "政治",
        "topic": "政治参加",
        "type": "mcq",
        "q": "日本の衆議院議員総選挙で採用されている制度として正しいものはどれか。",
        "choices": [
            "小選挙区制のみ",
            "比例代表制のみ",
            "小選挙区比例代表並立制",
            "大選挙区単記制"
        ],
        "a": 2,
        "expl": "众议院采用小选举区比例代表并立制（定数465：小选区289＋比例代表176），允许重复立候补（按惜败率复活）。",
        "trap": "日本众议院＝并立制；德国联邦议院＝并用制。",
        "kpLink": "kp-pol-01",
        "q_cn": "日本「衆議院議員総選挙（众议院议员大选）」所采用的选举制度是哪一项？",
        "choices_cn": [
            "小選挙区制のみ（仅采用小选区制）",
            "比例代表制のみ（仅采用比例代表制）",
            "小選挙区比例代表並立制（小选区比例代表并立制）",
            "大選挙区単記制（大选区单记非移让制）"
        ],
        "optExpl": [
            "选项(1) 错误：英国下议院采用单纯小选区制，日本众议院还结合了比例代表制。",
            "选项(2) 错误：日本众议院并非单纯比例代表制，而是小选区与比例代表分别计票。",
            "选项(3) 正确：1994年政治改革后，日本众议院采用「小選挙区比例代表並立制」，选民投2票（候选人票＋政党票）。",
            "选项(4) 错误：中选区（大选区单记制）是日本1994年改革前众议院使用的旧制度。"
        ]
    },
    {
        "id": "pol-005",
        "source": "未核实",
        "deck": "政治",
        "topic": "国際政治",
        "type": "mcq",
        "q": "国際連合安全保障理事会の常任理事国に認められている権限はどれか。",
        "choices": [
            "総会決議の取消権",
            "拒否権",
            "事務総長の解任権",
            "国際司法裁判所の判決変更権"
        ],
        "a": 1,
        "expl": "安理会5个常任理事国（美·英·法·俄·中）对实质事项拥有否决权（拒否権，大国一致原则）。",
        "kpLink": "kp-pol-02",
        "q_cn": "联合国「安全保障理事会（安全理事会）」的5个「常任理事国（常任理事国）」所拥有的特殊权限是哪一项？",
        "choices_cn": [
            "総会決議の取消権（联合国大会决议撤销权）",
            "拒否権（否决权 / 大国一致原则）",
            "事務総長の解任権（联合国秘书长单方解任权）",
            "国際司法裁判所の判決変更権（国际法院判决变更权）"
        ],
        "optExpl": [
            "选项(1) 错误：常任理事国无权单方面撤销联合国大会（総会）通过的决议。",
            "选项(2) 正确：美、英、法、俄、中五常对安理会非程序性实质决议享有「拒否権（一票否决权）」。",
            "选项(3) 错误：秘书长由安理会推荐并经大会任命，常任理事国无单方解任权。",
            "选项(4) 错误：国际司法裁判所（ICJ，海牙）独立行使审判权，安理会无权更改其判决。"
        ]
    },
    {
        "id": "eco-001",
        "source": "未核实",
        "deck": "経済",
        "topic": "市場経済",
        "type": "mcq",
        "q": "価格が上昇すると、一般に需要量と供給量はどう変化するか。",
        "back": "需要量は減少し、供給量は増加する。",
        "expl": "价格上升抑制消费需求，同时刺激企业扩大供给。",
        "kpLink": "kp-eco-01",
        "q_cn": "在一般市场经济中，当商品价格上升时，其「需要量（需求量）」和「供給量（供给量）」通常如何变化？",
        "choices": [
            "需要量は減少し、供給量は増加する",
            "需要量は増加し、供給量は減少する",
            "需要量・供給量ともに増加する",
            "需要量・供給量ともに変化しない"
        ],
        "choices_cn": [
            "需要量は減少し、供給量は増加する（需求量减少，供给量增加）",
            "需要量は増加し、供給量は減少する（需求量增加，供给量减少）",
            "需要量・供給量ともに増加する（需求量与供给量同时增加）",
            "需要量・供給量ともに変化しない（需求量与供给量均不变化）"
        ],
        "a": 0,
        "optExpl": [
            "选项(1) 正确：价格上升抑制消费者购买欲导致需求量减少，同时刺激企业扩大生产提高供给量。",
            "选项(2) 错误：这是价格下跌时的供求变化方向。",
            "选项(3) 错误：需求曲线向右下方倾斜，价格上升不会使需求量增加。",
            "选项(4) 错误：在自由价格机制下，价格直接调节供求数量，不会保持不变。"
        ]
    },
    {
        "id": "eco-002",
        "source": "未核实",
        "deck": "経済",
        "topic": "国民経済",
        "type": "mcq",
        "q": "GDPの三面等価に含まれないものはどれか。",
        "choices": [
            "生産面",
            "分配面",
            "支出面",
            "貿易面"
        ],
        "a": 3,
        "expl": "GDP三面等价原则指生产、分配、支出三面数值相等，“贸易面”不属于三面等价。",
        "kpLink": "kp-eco-01",
        "q_cn": "国民经济核算中，「GDPの三面等価の原則（GDP三面等价原则）」不包含下列哪一面？",
        "choices_cn": [
            "生産面（生产面：各产业附加值总和）",
            "分配面（分配面：工资、利润、利息等国民所得）",
            "支出面（支出面：消费＋投资＋政府支出＋净出口）",
            "貿易面（贸易面）"
        ],
        "optExpl": [
            "选项(1) 错误：生产国民所得（生産面）属于三面等价之一。",
            "选项(2) 错误：分配国民所得（分配面）属于三面等价之一。",
            "选项(3) 错误：支出国民所得（支出面）属于三面等价之一。",
            "选项(4) 正确：三面等价仅指「生産・分配・支出」三者恒等，净出口已包含在支出面内，不存在独立的“贸易面”。"
        ]
    },
    {
        "id": "eco-003",
        "source": "未核实",
        "deck": "経済",
        "topic": "金融",
        "type": "mcq",
        "q": "日本銀行が景気を抑制するために行う政策として最も適当なものはどれか。",
        "choices": [
            "国債を買い入れる",
            "政策金利を引き下げる",
            "国債を売却する",
            "預金保険料を廃止する"
        ],
        "a": 2,
        "expl": "央行卖出国债（売りオペ）会回笼市场资金、推高利率，抑制通货膨胀与景气过热。买入国债（買いオペ）与降息属于宽松政策。",
        "kpLink": "kp-eco-01",
        "q_cn": "当经济过热或通货膨胀时，「日本銀行（日本央行）」为抑制景气而采取的紧缩性金融政策是哪一项？",
        "choices_cn": [
            "国債を買い入れる（买进国债：買いオペ）",
            "政策金利を引き下げる（下调政策利率）",
            "国債を売却する（卖出国债：売りオペ）",
            "預金保険料を廃止する（废除存款保险费）"
        ],
        "optExpl": [
            "选项(1) 错误：买进国债（買いオペ）向市场投放货币，属于刺激景气的金融缓和政策。",
            "选项(2) 错误：下调政策利率会降低企业借贷成本，属于刺激景气的宽松政策。",
            "选项(3) 正确：日本银行向金融机构卖出国债（売りオペ）可吸收市场流通资金、促使利率上升，从而抑制景气过热。",
            "选项(4) 错误：存款保险制度用于保护储户与维护金融稳定，并非央行的景气调节工具。"
        ]
    },
    {
        "id": "eco-004",
        "source": "未核实",
        "deck": "経済",
        "topic": "財政",
        "type": "mcq",
        "q": "景気変動を自動的に緩和する財政の仕組みを何というか。",
        "back": "ビルトイン・スタビライザー（自動安定化装置）",
        "expl": "代表制度为【累进所得税】与【失业保险给付】。",
        "kpLink": "kp-eco-01",
        "q_cn": "无需政府临时修改法律，就能随经济冷热自动平抑景气波动的财政制度称为什么？",
        "choices": [
            "ビルトイン・スタビライザー（自動安定化装置）",
            "フィスカル・ポリシー（裁量的財政政策）",
            "オープン・マーケット・オペレーション（公開市場操作）",
            "プライマリー・バランス（基礎的財政収支）"
        ],
        "choices_cn": [
            "ビルトイン・スタビライザー（内在稳定器 / 自动稳定装置）",
            "フィスカル・ポリシー（相机抉择的裁量性财政政策）",
            "オープン・マーケット・オペレーション（公开市场操作）",
            "プライマリー・バランス（基础财政收支）"
        ],
        "a": 0,
        "optExpl": [
            "选项(1) 正确：累进所得税与社会保障给付（失业救济）能在繁荣期自动增税降温、衰退期自动减税补贴，称为内在稳定器。",
            "选项(2) 错误：裁量性财政政策需要政府主动追加公共投资或临时减税。",
            "选项(3) 错误：公开市场操作是中央银行买卖国债的货币政策手段。",
            "选项(4) 错误：基础财政收支是衡量财政健康度的指标（税收等岁入减去国债费以外的岁出）。"
        ]
    },
    {
        "id": "eco-005",
        "source": "未核实",
        "deck": "経済",
        "topic": "国際経済",
        "type": "mcq",
        "q": "自国通貨が円安になった場合、一般に起こりやすいことはどれか。",
        "choices": [
            "輸出品の外貨建て価格が上がる",
            "輸入品の円建て価格が上がる",
            "海外旅行の費用が下がる",
            "輸入が必ず増える"
        ],
        "a": 1,
        "expl": "日元贬值（円安）导致进口商品换算成日元变贵（推高进口物价），但利好出口企业与外国游客入境消费。",
        "kpLink": "kp-eco-01",
        "q_cn": "当外汇市场上日元贬值进入「円安（日元走弱）」状态时，通常会发生下列哪种现象？",
        "choices_cn": [
            "輸出品の外貨建て価格が上がる（日本出口商品的外币标价上涨）",
            "輸入品の円建て価格が上がる（日本进口商品的日元标价上涨）",
            "海外旅行の費用が下がる（日本人赴海外旅游的日元成本下降）",
            "輸入が必ず増える（日本的进口量必然大幅增加）"
        ],
        "optExpl": [
            "选项(1) 错误：日元贬值使日本商品换算成美元更便宜，外币标价下降、出口竞争力增强。",
            "选项(2) 正确：日元贬值意味着购买同样1美元的外国商品需要支付更多日元，因此进口商品的日元价格上涨。",
            "选项(3) 错误：日元贬值使兑换外币变贵，日本人出国旅行与留学的费用上升，而外国人来日旅游变便宜。",
            "选项(4) 错误：由于进口商品变贵，进口量通常会受到抑制而非增加。"
        ]
    },
    {
        "id": "soc-001",
        "source": "未核实",
        "deck": "社会",
        "topic": "私法と契約",
        "type": "mcq",
        "q": "消費者契約法が保護しようとする主体は誰か。",
        "back": "事業者と契約する消費者",
        "expl": "当经营者不实告知或断定判断导致消费者误认签约时，消费者可撤销合同。",
        "kpLink": "kp-pol-02",
        "q_cn": "日本的「消費者契約法（消费者契约法）」主要保护的对象是谁？",
        "choices": [
            "事業者と契約する個人（消費者）",
            "中小企業を経営する事業者",
            "金融商品取引所の投資家のみ",
            "官公庁と取引する一般市民"
        ],
        "choices_cn": [
            "事業者と契約する個人（与经营者订立合同的个人消费者）",
            "中小企業を経営する事業者（经营中小企业的经营者）",
            "金融商品取引所の投資家のみ（仅限金融交易所的专业投资者）",
            "官公庁と取引する一般市民（与政府机构交易的普通市民）"
        ],
        "a": 0,
        "optExpl": [
            "选项(1) 正确：消费者契约法旨在弥补经营者与个人消费者之间的信息及交涉能力差距，允许受欺诈或困惑的消费者撤销合同。",
            "选项(2) 错误：企业间的商业合同适用商法与下请法等，不适用消费者契约法。",
            "选项(3) 错误：该法保护所有日常消费合同中的个人，不限于金融投资者。",
            "选项(4) 错误：该法针对的是消费者与「事業者（企业/商家）」缔结的契约。"
        ]
    },
    {
        "id": "soc-002",
        "source": "未核实",
        "deck": "社会",
        "topic": "雇用・労働",
        "type": "mcq",
        "q": "労働三権に含まれないものはどれか。",
        "choices": [
            "団結権",
            "団体交渉権",
            "団体行動権",
            "職業選択権"
        ],
        "a": 3,
        "expl": "劳动三权（宪法28条）包括团结权、团体交涉权、团体行动权（争议权）。职业选择自由属于宪法22条经济自由权。",
        "kpLink": "kp-pol-02",
        "q_cn": "日本国宪法第28条保障的「労働三権（劳动基本三权）」中，不包含下列哪一项？",
        "choices_cn": [
            "団結権（团结权：组织与加入工会的权利）",
            "団体交渉権（集体谈判权：与雇主交涉劳动条件的权利）",
            "団体行動権（集体行动权/争议权：罢工等权利）",
            "職業選択権（职业选择自由权）"
        ],
        "optExpl": [
            "选项(1) 错误：「団結権」是劳动三权的核心基础。",
            "选项(2) 错误：「団体交渉権」属于劳动三权之一。",
            "选项(3) 错误：「団体行動権（争議権）」属于劳动三权之一。",
            "选项(4) 正确：「職業選択の自由」属于宪法第22条规定的经济自由权，而非第28条的劳动三权（社会权）。"
        ]
    },
    {
        "id": "geo-001",
        "source": "未核实",
        "deck": "地理",
        "topic": "標準時と時差",
        "type": "mcq",
        "q": "経度15度の差は、原則として何時間の時差に当たるか。",
        "back": "1時間",
        "expl": "地球360度 ÷ 24小时 ＝ 每15度相差1小时（东加西减）。",
        "kpLink": "kp-geo-01",
        "q_cn": "地球表面经度每相差 15 度，原则上对应多少小时的时差？",
        "choices": [
            "1時間",
            "2時間",
            "30分",
            "4時間"
        ],
        "choices_cn": [
            "1時間（1小时）",
            "2時間（2小时）",
            "30分（30分钟）",
            "4時間（4小时）"
        ],
        "a": 0,
        "optExpl": [
            "选项(1) 正确：地球自转一周 360° 耗时 24 小时，360° ÷ 24 = 15°/小时，东边时间比西边早。",
            "选项(2) 错误：经度相差 30 度才对应 2 小时时差。",
            "选项(3) 错误：经度相差 7.5 度才对应 30 分钟时差。",
            "选项(4) 错误：经度相差 60 度才对应 4 小时时差。"
        ]
    },
    {
        "id": "geo-002",
        "source": "未核实",
        "deck": "地理",
        "topic": "地形",
        "type": "mcq",
        "q": "河川が山地から平地に出る場所に形成されやすい地形はどれか。",
        "choices": [
            "三角州",
            "扇状地",
            "フィヨルド",
            "砂州"
        ],
        "a": 1,
        "expl": "河流出山口处流速骤降，粗砂砾堆积成【扇状地】（透水好，多果树园）；河口入海处细泥沙堆积成【三角州】（多水田）。",
        "kpLink": "kp-geo-01",
        "q_cn": "河流从山地流入平原的谷口处，因流速骤降导致砂砾堆积而形成的地形是哪一种？",
        "choices_cn": [
            "三角州（河口三角洲）",
            "扇状地（山麓冲积扇）",
            "フィヨルド（冰川峡湾）",
            "砂州（沿岸沙洲）"
        ],
        "optExpl": [
            "选项(1) 错误：「三角州（デルタ）」形成于河流入海口处，由细小泥沙沉积而成，多辟为水田。",
            "选项(2) 正确：河流从山地出平地（谷口）处坡度骤减，粗大砂砾呈扇形堆积形成「扇状地」，扇央透水性强常种植果树。",
            "选项(3) 错误：「フィヨルド（峡湾）」是冰川侵蚀形成的U形谷被海水淹没的海岸地形（如挪威沿岸）。",
            "选项(4) 错误：「砂州」是由沿岸流搬运泥沙在海湾口堆积形成的海岸地形。"
        ]
    },
    {
        "id": "geo-003",
        "source": "未核实",
        "deck": "地理",
        "topic": "気候",
        "type": "mcq",
        "q": "ケッペンの気候区分で、年中高温で降水量が非常に少ない気候はどれか。",
        "choices": [
            "Af",
            "BW",
            "Cs",
            "Df"
        ],
        "a": 1,
        "expl": "BW为沙漠气候；Af为热带雨林；Cs为地中海性气候（夏干冬雨）；Df为亚寒带湿润气候（南半球无D气候）。",
        "kpLink": "kp-geo-01",
        "q_cn": "在「ケッペンの気候区分（柯本气候分类法）」中，代表终年高温且降水量极少的「砂漠気候（沙漠气候）」符号是哪一个？",
        "choices_cn": [
            "Af（熱帯雨林気候：热带雨林气候）",
            "BW（砂漠気候：沙漠气候）",
            "Cs（地中海性気候：地中海气候）",
            "Df（亜寒帯湿潤気候：亚寒带针叶林气候）"
        ],
        "optExpl": [
            "选项(1) 错误：Af 为热带雨林气候，特征是终年高温多雨。",
            "选项(2) 正确：B 代表干燥带，BW 为沙漠气候（BS 为草原气候），降水量极少且昼夜温差极大。",
            "选项(3) 错误：Cs 为温带地中海性气候，特征是夏季炎热干燥、冬季温和多雨（适合种植橄榄与葡萄）。",
            "选项(4) 错误：Df 为冷带（亚寒带）湿润气候，冬季严寒漫长，广泛分布泰加林（针叶林）。"
        ]
    },
    {
        "id": "geo-004",
        "source": "未核实",
        "deck": "地理",
        "topic": "GIS",
        "type": "mcq",
        "q": "GISは何の略で、何を扱う仕組みか。",
        "back": "Geographic Information System（地理情報システム）",
        "expl": "在电子地图上叠加人口、交通、防灾等多层空间数据进行分析。",
        "kpLink": "kp-geo-01",
        "q_cn": "现代地理学中常提及的「GIS」是下列哪一项的简称，主要处理什么？",
        "choices": [
            "Geographic Information System（地理情報システム：地理空間データを処理）",
            "Global Positioning System（衛星測位システム：現在位置を測定）",
            "Greenland Ice Sheet（グリーンランド氷床：環境監視）",
            "General International Statistics（国際一般統計：国勢調査）"
        ],
        "choices_cn": [
            "地理情報システム（GIS：在电子地图上叠加分析多层空间地理数据）",
            "衛星測位システム（GPS：利用卫星测定当前经纬度坐标）",
            "グリーンランド氷床（极地气候监测系统）",
            "国際一般統計（人口普查数据库）"
        ],
        "a": 0,
        "optExpl": [
            "选项(1) 正确：GIS（地理信息系统）在电子底图上叠加人口、交通、土地利用、防灾等多层空间数据进行可视化分析。",
            "选项(2) 错误：GPS是利用人造卫星测定位置的全球定位系统，为GIS提供坐标数据但不等同于GIS。",
            "选项(3) 错误：非冰原环境监测缩写。",
            "选项(4) 错误：非国际综合统计缩写。"
        ]
    },
    {
        "id": "his-001",
        "source": "未核实",
        "deck": "歴史",
        "topic": "近代化",
        "type": "mcq",
        "q": "フランス革命の開始を象徴する出来事はどれか。",
        "choices": [
            "ボストン茶会事件",
            "バスティーユ牢獄襲撃",
            "ウィーン会議",
            "二月革命"
        ],
        "a": 1,
        "expl": "1789年7月14日攻占巴士底狱标志着法国大革命爆发，随后发表《人权宣言》。",
        "kpLink": "kp-pol-02",
        "q_cn": "1789年7月14日爆发、象征「フランス革命（法国大革命）」正式开始的历史事件是哪一项？",
        "choices_cn": [
            "ボストン茶会事件（波士顿倾茶事件）",
            "バスティーユ牢獄襲撃（攻占巴士底狱）",
            "ウィーン会議（维也纳会议）",
            "二月革命（1848年法国二月革命）"
        ],
        "optExpl": [
            "选项(1) 错误：1773年波士顿倾茶事件是北美独立战争（1775年爆发）的导火索。",
            "选项(2) 正确：1789年7月14日巴黎民众攻占象征专制王权的「バスティーユ牢獄（巴士底狱）」，标志着法国大革命爆发。",
            "选项(3) 错误：1814—1815年维也纳会议是在拿破仑战争结束后重建欧洲旧秩序（维也纳体系）的会议。",
            "选项(4) 错误：1848年二月革命推翻了法国七月王朝并建立法兰西第二共和国，瓦解了维也纳体系。"
        ]
    },
    {
        "id": "his-002",
        "source": "未核实",
        "deck": "歴史",
        "topic": "二つの世界大戦",
        "type": "mcq",
        "q": "第一次世界大戦後に成立した国際平和機構は何か。",
        "back": "国際連盟",
        "expl": "1920年依《凡尔赛条约》成立，总部日内瓦；美国虽由威尔逊倡议但未加入。",
        "kpLink": "kp-pol-02",
        "q_cn": "第一次世界大战后根据「ヴェルサイユ条約（凡尔赛条约）」成立的第一个世界性和平机构是什么？",
        "choices": [
            "国際連盟（本部ジュネーブ）",
            "国際連合（本部ニューヨーク）",
            "経済協力開発機構（OECD）",
            "国際赤十字社（ICRC）"
        ],
        "choices_cn": [
            "国際連盟（国际联盟，总部设于日内瓦）",
            "国際連合（联合国，总部设于纽约）",
            "経済協力開発機構（OECD，总部设于巴黎）",
            "国際赤十字社（国际红十字会）"
        ],
        "a": 0,
        "optExpl": [
            "选项(1) 正确：1920年依据威尔逊“十四点和平原则”与《凡尔赛条约》成立「国際連盟」，总部设在瑞士日内瓦。",
            "选项(2) 错误：「国際連合（UN）」成立于1945年第二次世界大战结束之后。",
            "选项(3) 错误：OECD成立于1961年，是由马歇尔计划受援国组织改组而成的发达国家经济合作机构。",
            "选项(4) 错误：国际红十字会是19世纪由亨利·杜南创立的人道主义救援组织。"
        ]
    },
    {
        "id": "his-003",
        "source": "未核实",
        "deck": "歴史",
        "topic": "冷戦",
        "type": "mcq",
        "q": "冷戦期の西側諸国の軍事同盟はどれか。",
        "choices": [
            "NATO",
            "ワルシャワ条約機構",
            "コミンテルン",
            "ASEAN"
        ],
        "a": 0,
        "expl": "NATO（北大西洋公约组织，1949）为西方阵营军事同盟；华沙条约组织（1955）为苏联阵营军事同盟。",
        "kpLink": "kp-pol-02",
        "q_cn": "冷战时期（1949年成立），以美国为首的「西側諸国（西方资本主义阵营）」组建的集体防卫军事同盟是哪一个？",
        "choices_cn": [
            "NATO（北大西洋条約機構：北大西洋公约组织）",
            "ワルシャワ条約機構（WPO：华沙条约组织）",
            "コミンテルン（共産主義インターナショナル：共产国际）",
            "ASEAN（東南アジア諸国連合：东南亚国家联盟）"
        ],
        "optExpl": [
            "选项(1) 正确：1949年美国与西欧各国签署《北大西洋公约》成立「NATO（北大西洋公约组织）」，是冷战西方阵营的核心军事同盟。",
            "选项(2) 错误：「ワルシャワ条約機構（华约，1955）」是苏联率领东欧社会主义阵营对抗NATO的军事同盟。",
            "选项(3) 错误：「コミンテルン（共产国际）」是1919年列宁在莫斯科建立的国际共产党组织，已于1943年解散。",
            "选项(4) 错误：「ASEAN（东盟，1967）」是东南亚区域合作组织，并非欧美西方军事同盟。"
        ]
    },
    {
        "id": "his-004",
        "source": "未核实",
        "deck": "歴史",
        "topic": "冷戦後の世界",
        "type": "mcq",
        "q": "冷戦終結の象徴とされる1989年の出来事は何か。",
        "back": "ベルリンの壁の崩壊（およびマルタ会談）",
        "expl": "1989年11月柏林墙倒塌、12月美苏马耳他会谈宣布冷战终结；1990年东西德统一；1991年12月苏联解体。",
        "kpLink": "kp-pol-02",
        "q_cn": "被普遍视为东西方「冷戦終結（冷战终结）」标志的 1989 年重大历史事件是什么？",
        "choices": [
            "ベルリンの壁の崩壊（およびマルタ会談）",
            "ソビエト連邦の崩壊",
            "キューバ危機の終息",
            "朝鮮戦争の休戦協定調印"
        ],
        "choices_cn": [
            "ベルリンの壁の崩壊（柏林墙倒塌及美苏马耳他峰会宣布冷战终结）",
            "ソビエト連邦の崩壊（苏联解体，1991年）",
            "キューバ危機の終息（古巴导弹危机解除，1962年）",
            "朝鮮戦争の休戦協定調印（朝鲜战争停战协定签署，1953年）"
        ],
        "a": 0,
        "optExpl": [
            "选项(1) 正确：1989年11月柏林墙倒塌，同年12月美苏首脑在马耳他会谈正式宣布冷战终结。",
            "选项(2) 错误：苏联正式解体是在1991年12月，属于冷战结束后的结果。",
            "选项(3) 错误：古巴导弹危机发生在1962年，是冷战期间最接近核战争的危机。",
            "选项(4) 错误：朝鲜战争停战协定签署于1953年，属于冷战初期的热战。"
        ]
    }
  ];

  const $ = sel => document.querySelector(sel);
  const $$ = sel => [...document.querySelectorAll(sel)];
  const localDateKey = (date = new Date()) =>
    new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit'}).format(date);
  const addDays = days => Date.now() + days * 86400000;

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (parsed && parsed.version === 1) {
        parsed.bookmarks = parsed.bookmarks || {};
        return parsed;
      }
    } catch (_) {}
    return {version: 1, progress: {}, history: [], tasks: {}, mocks: [], bookmarks: {}, activeSession: null};
  }

  let state = loadState();
  let periodMode = 'bunso'; // 'bunso' | 'math'
  let currentRoute = 'today';
  let selectedDeck = '全部文综';
  let currentKnowledgeCat = 'all';
  let wrongFilter = 'all';
  let auditTableFilter = 'all';
  let auditSbsFilter = 'sample20';

  // Active study session state
  let queue = [];
  let sessionIndex = 0;
  let activeCard = null;
  let answered = false;

  // Math Tutoring Station state
  let tutorSource = 'cards'; // 'cards' | 'papers'
  let tutorCardsList = [];
  let tutorCardIdx = 0;
  let currentPaperIdx = 0;
  let currentPaperPageIdx = 0;

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function renderMathIn(el) {
    if (!el || typeof window.renderMathInElement !== 'function') return;
    try {
      window.renderMathInElement(el, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '$', right: '$', display: false}
        ],
        throwOnError: false
      });
    } catch (_) {}
  }

  function getProgress(cardOrId) {
    const id = typeof cardOrId === 'string' ? cardOrId : cardOrId.id;
    return state.progress[id] || {box: 0, due: 0, reps: 0, lapses: 0, wrongStreak: 0, inWrongBook: false, lastGrade: null};
  }

  function isMathCard(card) {
    return MATH_DECKS.includes(card.deck);
  }

  function isVariantCard(card) {
    return card.id.startsWith('var-') || card.id.startsWith('real-') || card.id.includes('-ext-') || Boolean(card.variant);
  }

  // Stage 1 Rule: Questions without official source are marked '未核实' and DO NOT count toward mastery rate
  function isUnverified(card) {
    return !card.source || card.source === '未核实';
  }

  function isCountedForMastery(card) {
    return !isUnverified(card);
  }

  function isMastered(card) {
    if (!isCountedForMastery(card)) return false;
    return getProgress(card).box >= 2;
  }

  function getSourceBadgeHtml(card) {
    if (isUnverified(card)) {
      return `<span class="tag tag-source-unverified" title="无官方正解表出处，不计入掌握率">未核实 · 不计入掌握率</span>`;
    }
    if (card.auditStatus === 'discrepancy') {
      return `<span class="tag tag-source-warn" title="题面/正解表/题库三者存在不一致，待裁定">待裁定 · ${card.source}</span>`;
    }
    return `<span class="tag tag-source-ok">出处：${card.source}</span>`;
  }

  function applySourceTagAndBanner(card, tagEl, bannerEl) {
    if (tagEl) {
      if (isUnverified(card)) {
        tagEl.className = 'tag tag-source-unverified';
        tagEl.textContent = '未核实 · 不计入掌握率';
      } else if (card.auditStatus === 'discrepancy') {
        tagEl.className = 'tag tag-source-warn';
        tagEl.textContent = `待裁定 · ${card.source}`;
      } else {
        tagEl.className = 'tag tag-source-ok';
        tagEl.textContent = `出处：${card.source}`;
      }
    }
    if (bannerEl) {
      if (card.auditStatus === 'discrepancy' && card.auditNote) {
        bannerEl.hidden = false;
        bannerEl.className = 'study-audit-banner is-discrepancy';
        bannerEl.textContent = `【阶段1核验提醒 · 待裁定】${card.auditNote}`;
      } else if (isUnverified(card)) {
        bannerEl.hidden = false;
        bannerEl.className = 'study-audit-banner is-unverified';
        bannerEl.textContent = '【未核实题目】本题暂无官方正解表出处，仅供知识点练习，作答结果不计入掌握率。';
      } else {
        bannerEl.hidden = true;
        bannerEl.textContent = '';
      }
    }
  }

  function isDue(card) {
    const p = getProgress(card);
    return p.reps > 0 && p.due <= Date.now();
  }

  function isWrong(card) {
    const p = getProgress(card);
    if (p.inWrongBook !== undefined) return Boolean(p.inWrongBook);
    return p.lapses > 0 && p.box < 2;
  }

  function isBookmarked(card) {
    return Boolean(state.bookmarks && state.bookmarks[card.id]);
  }

  // Concise 1-line hint generator (zero emojis, zero fluff)
  function getCardHint(card) {
    if (card.hint) return card.hint;
    const t = `${card.topic} ${card.q}`;
    if (isMathCard(card)) {
      if (/頂点|軸|平方完成|最大|最小|平行移動/.test(t)) {
        return '核心公式：先配方为 $y = a(x-p)^2 + q$，对称轴 $x = -\\frac{b}{2a}$，比较对称轴与区间 $[m,n]$ 的位置。';
      }
      if (/不等式|重解|実数解|接する|共有点/.test(t)) {
        return '核心公式：判别式 $D = b^2 - 4ac$（相切/重解 $D=0$，两交点 $D>0$，无交点 $D<0$）。';
      }
      if (/余弦|正弦|三角形|sin|cos|外接円|内接円|面積/.test(t)) {
        return '核心公式：三边与夹角用余弦定理 $a^2=b^2+c^2-2bc\\cos A$；外接圆 $R$ 用正弦定理 $\\frac{a}{\\sin A}=2R$；内切圆 $r$ 用面积 $S=\\frac{1}{2}r(a+b+c)$。';
      }
      if (/確率|場合の数|コイン|サイコロ|カード|玉|期待値/.test(t)) {
        return '破题方向：情况较少直接列举；看到「少なくとも」用 $1 - P(\\text{全反面})$；期望值用 $\\sum x_i P(X=x_i)$。';
      }
      return '破题方向：写出题干核心名词对应的基本公式，代入已知条件化简。';
    }
    if (card.deck === '条約') return '破题方向：锁定「战争年份 + 签约对手国 + 割让地/开港地」三要素，注意区分南京/北京、下关/朴次茅斯。';
    if (card.deck === '政治') return '破题方向：看清主语是国会（众议院/参议院）、内阁还是裁判所；警惕将“国会议员”偷换为“众议院议员”。';
    if (card.deck === '経済') return '破题方向：区分日本银行（买卖国债/政策利率）与政府财政（税收/公共投资）；円安利好出口但推高进口物价。';
    if (card.deck === '地理') return '破题方向：气候先看最冷月气温判 A/C/D（1月高温必在南半球且无D气候）；统计看前两名国家组合。';
    return '破题方向：先确认题干问「正しい」还是「誤っている」，用排除法剔除张冠李戴项。';
  }

  // Condense explanation for focused study view so it never exceeds 3-4 clean lines
  function getConciseExpl(card) {
    const raw = String(card.expl || '').trim();
    if (!raw) return '记住该考点的核心对应关系即可。';
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length <= 4) return lines.join('\n');
    return lines.slice(0, 4).join('\n');
  }

  // ─── Countdown & Top Stats ───
  function getTodayStats() {
    const today = localDateKey();
    const todayLogs = state.history.filter(h => h.date === today);
    let bunsoCount = 0;
    let mathCount = 0;
    let wrongCleared = 0;
    for (const h of todayLogs) {
      const c = cards.find(x => x.id === h.id);
      if (!c) continue;
      if (isMathCard(c)) mathCount++;
      else bunsoCount++;
      if (h.clearedWrong) wrongCleared++;
    }
    return {
      total: todayLogs.length,
      bunsoCount,
      mathCount,
      wrongCleared
    };
  }

  function getStreakDays() {
    const dates = new Set(state.history.map(h => h.date));
    let streak = 0;
    for (let i = 0; i < 60; i++) {
      const key = localDateKey(new Date(Date.now() - i * 86400000));
      if (dates.has(key)) streak++;
      else if (i > 0) break;
    }
    return streak;
  }

  function renderTopBarAndDashboard() {
    const diffDays = Math.max(0, Math.ceil((EXAM_AT.getTime() - Date.now()) / 86400000));
    $('#countdownBadge').textContent = `距 11/08 考试剩 ${diffDays} 天`;
    if ($('#heroCountdownVal')) $('#heroCountdownVal').textContent = `${diffDays} 天`;

    const todayStats = getTodayStats();
    const dueCount = cards.filter(isDue).length;
    const wrongCount = cards.filter(isWrong).length;
    const verifiedPool = cards.filter(isCountedForMastery);
    const unverifiedCount = cards.length - verifiedPool.length;
    const masteredCount = verifiedPool.filter(isMastered).length;
    const masteryPct = verifiedPool.length ? Math.round((masteredCount / verifiedPool.length) * 100) : 0;
    const tutorBookmarkCount = cards.filter(c => isMathCard(c) && (isBookmarked(c) || isWrong(c))).length;

    $('#statTodayCount').textContent = todayStats.total >= DAILY_TARGET ? `已完成 ✓ (${todayStats.total}/${DAILY_TARGET})` : `${todayStats.total} / ${DAILY_TARGET}`;
    $('#statStreak').textContent = `连续 ${getStreakDays()} 天`;
    $('#statTodayBar').style.width = `${Math.min(100, Math.round((todayStats.total / DAILY_TARGET) * 100))}%`;

    $('#statDueCount').textContent = String(dueCount);
    $('#statWrongCount').textContent = String(wrongCount);
    if ($('#heroWrongVal')) $('#heroWrongVal').textContent = String(wrongCount);
    $('#statMasteryPct').textContent = `${masteryPct}%`;
    $('#statMasterySub').textContent = `已核实 ${masteredCount}/${verifiedPool.length} (未核实${unverifiedCount}不计)`;
    $('#statMasteryBar').style.width = `${masteryPct}%`;

    $('#navWrongBadge').textContent = String(wrongCount);
    $('#navPlanBadge').textContent = `${masteryPct}%`;
    $('#tutorQueueBadge').textContent = String(tutorBookmarkCount);

    const hasResumable = state.activeSession && Array.isArray(state.activeSession.ids) && state.activeSession.index < state.activeSession.ids.length;
    $('#resumeSessionBtn').hidden = !hasResumable;
  }

  // ─── Deck Mastery Progress Grid ───
  function getDeckListForMode() {
    if (periodMode === 'bunso') {
      return [
        {id: '全部文综', label: '全部文综', filter: c => BUNSO_DECKS.includes(c.deck)},
        ...BUNSO_DECKS.map(d => ({id: d, label: d, filter: c => c.deck === d})),
        {id: '变形特训', label: '变形题特训', filter: c => !isMathCard(c) && isVariantCard(c)}
      ];
    }
    return [
      {id: '全部', label: '全科总览', filter: () => true},
      {id: '数Ⅰ·A', label: '数学コース1 (已核实)', filter: c => c.deck === '数Ⅰ·A'},
      ...BUNSO_DECKS.map(d => ({id: d, label: d, filter: c => c.deck === d})),
      {id: '变形特训', label: '真题改编变形题', filter: isVariantCard}
    ];
  }

  function renderDeckProgressGrid() {
    const deckDefs = getDeckListForMode();
    if (!deckDefs.some(d => d.id === selectedDeck)) {
      selectedDeck = deckDefs[0].id;
    }

    $('#consoleTitle').textContent = periodMode === 'bunso' ? '文综分科刷题与掌握进度' : '全科刷题与掌握进度';
    $('#consoleSub').textContent = `当前选中：【${selectedDeck}】— 注：标记“未核实”的题目练习时不计入掌握率`;

    const container = $('#deckFilterBar');
    container.innerHTML = '';

    for (const def of deckDefs) {
      const pool = cards.filter(def.filter);
      const total = pool.length;
      if (total === 0) continue;
      const verifiedPool = pool.filter(isCountedForMastery);
      const unverifiedInPool = total - verifiedPool.length;
      const mastered = verifiedPool.filter(isMastered).length;
      const wrong = pool.filter(isWrong).length;
      const hasVerified = verifiedPool.length > 0;
      const pct = hasVerified ? Math.round((mastered / verifiedPool.length) * 100) : 0;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `deck-chip${selectedDeck === def.id ? ' is-active' : ''}`;
      btn.innerHTML = `
        <div class="deck-chip-top">
          <span>${def.label} <small class="jp-sub">${DECK_JP_SUB[def.id] || ''}</small></span>
          ${hasVerified
            ? `<span class="deck-chip-pct">${pct}%</span>`
            : `<span class="tag tag-source-unverified" style="font-size:11px;padding:1px 6px">未核实</span>`}
        </div>
        <div class="mini-bar mini-bar-ok"><span style="width:${pct}%"></span></div>
        <div class="deck-chip-sub">${
          hasVerified
            ? `已核实掌握 ${mastered}/${verifiedPool.length}${unverifiedInPool ? ` · 未核实 ${unverifiedInPool}` : ''}${wrong ? ` · 错题 ${wrong}` : ''}`
            : `未核实 ${total} 题（不计入掌握率）${wrong ? ` · 错题 ${wrong}` : ''}`
        }</div>
      `;
      btn.addEventListener('click', () => {
        selectedDeck = def.id;
        renderDeckProgressGrid();
      });
      container.appendChild(btn);
    }
  }

  // ─── Collapsible Quick-Reference Tables (核心考点速查表) ───
  function renderKnowledgeAccordion() {
    const list = window.EJU_KNOWLEDGE || [];
    const query = ($('#globalSearchInput')?.value || '').trim().toLowerCase();
    const clearBtn = $('#clearSearchBtn');
    if (clearBtn) clearBtn.hidden = !query;

    // Filter knowledge items
    const filteredKp = list.filter(item => {
      if (currentKnowledgeCat === 'all' && periodMode === 'bunso' && !query && item.cat === 'math') {
        return false; // In daytime Bunso mode, hide math sheets unless user clicks '数学公式' or searches
      }
      if (currentKnowledgeCat !== 'all' && item.cat !== currentKnowledgeCat) return false;
      if (!query) return true;
      const hay = `${item.title} ${item.summary} ${item.html}`.toLowerCase();
      return hay.includes(query);
    });

    const container = $('#knowledgeList');
    container.innerHTML = '';

    for (const item of filteredKp) {
      const reg = item.topicFilter ? new RegExp(item.topicFilter) : null;
      const relatedCards = cards.filter(c => c.deck === item.deck && (!reg || reg.test(`${c.topic} ${c.q}`)));
      const mastered = relatedCards.filter(isMastered).length;

      const details = document.createElement('details');
      details.className = 'kp-details';
      if (query) details.open = true;

      details.innerHTML = `
        <summary class="kp-summary">
          <div class="kp-summary-left">
            <span class="tag">${item.badge}</span>
            <span class="kp-title">${item.title}</span>
            <span class="kp-desc">${item.summary}</span>
          </div>
          <button class="btn btn-xs kp-practice-btn" type="button">刷本节 (${mastered}/${relatedCards.length})</button>
        </summary>
        <div class="kp-body">${item.html}</div>
      `;

      details.querySelector('.kp-practice-btn').addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const pool = relatedCards.length ? relatedCards : cards.filter(c => c.deck === item.deck);
        startCustomPoolSession(pool, item.title);
      });

      details.addEventListener('toggle', () => {
        if (details.open) {
          renderMathIn(details);
          // Mark today's "温习速查表" task as done!
          const today = localDateKey();
          state.tasks[today] = state.tasks[today] || {};
          state.tasks[today].readKp = true;
          saveState();
        }
      });

      container.appendChild(details);
      if (details.open) renderMathIn(details);
    }

    // Search matching cards preview
    const searchBox = $('#searchCardsResult');
    if (!query) {
      searchBox.hidden = true;
      searchBox.innerHTML = '';
      return;
    }

    const matchedCards = cards.filter(c =>
      `${c.deck} ${c.topic} ${c.q} ${c.expl || ''} ${c.back || ''}`.toLowerCase().includes(query)
    );
    searchBox.hidden = false;
    if (!matchedCards.length) {
      searchBox.innerHTML = `<div class="stat-hint">未找到包含“${query}”的题目</div>`;
      return;
    }

    searchBox.innerHTML = `
      <div class="section-head" style="margin-bottom:8px">
        <strong>题库匹配到 ${matchedCards.length} 道题</strong>
        <button class="btn btn-xs btn-primary" id="practiceSearchMatchesBtn" type="button">连刷这 ${matchedCards.length} 题</button>
      </div>
      <div id="searchRowsWrap"></div>
    `;
    $('#practiceSearchMatchesBtn').addEventListener('click', () => {
      startCustomPoolSession(matchedCards, `搜索：${query}`);
    });
    const wrap = $('#searchRowsWrap');
    for (const c of matchedCards.slice(0, 6)) {
      const row = document.createElement('div');
      row.className = 'search-card-row';
      row.innerHTML = `
        <span><span class="tag">${c.deck}</span> ${getSourceBadgeHtml(c)} ${c.q.slice(0, 65)}</span>
        <button class="btn btn-xs" type="button">单练</button>
      `;
      row.querySelector('button').addEventListener('click', () => startCustomPoolSession([c], c.topic));
      wrap.appendChild(row);
    }
  }

  // ─── Study Session Builder & Focused Card View ───
  function getFilteredPoolBySelectedDeck() {
    const defs = getDeckListForMode();
    const found = defs.find(d => d.id === selectedDeck) || defs[0];
    return cards.filter(found.filter);
  }

  function prioritizeCards(pool, limit = 20) {
    return [...pool]
      .sort((a, b) => {
        const score = c => {
          const p = getProgress(c);
          if (isWrong(c)) return 0;
          if (isDue(c)) return 1;
          if (p.reps === 0) return 2;
          if (p.box < 2) return 3;
          return 4 + p.box;
        };
        return score(a) - score(b);
      })
      .slice(0, limit);
  }

  function startCustomPoolSession(pool, label, limit = 20) {
    const picked = prioritizeCards(pool, limit);
    if (!picked.length) return;
    queue = picked;
    sessionIndex = 0;
    state.activeSession = {ids: queue.map(c => c.id), index: 0, label};
    saveState();
    switchRoute('study');
    renderStudyCard();
  }

  // Stage 2: Marksheet state & Bilingual state
  let showChinese = localStorage.getItem('eju_lang_cn') !== 'false'; // default ON (true)
  let markCells = [];
  let activeCellIdx = 0;
  let markValues = [];

  function renderStudyCard() {
    activeCard = queue[sessionIndex];
    if (!activeCard) {
      state.activeSession = null;
      saveState();
      switchRoute('today');
      return;
    }
    answered = false;

    const total = queue.length;
    $('#studyProgressText').textContent = `${sessionIndex + 1} / ${total}`;
    $('#studyProgressFill').style.width = `${Math.round(((sessionIndex + 1) / total) * 100)}%`;
    $('#studyDeckTag').textContent = activeCard.deck;
    $('#studyTopicTag').textContent = activeCard.topic;
    applySourceTagAndBanner(activeCard, $('#studySourceTag'), $('#studyAuditBanner'));

    // Question text with bilingual toggle support (default ON)
    const qCn = activeCard.q_cn;
    const qJp = activeCard.q;
    if (showChinese && qCn) {
      $('#studyQuestion').textContent = qCn;
      if (qJp && qJp !== qCn) {
        $('#studyQuestionSub').hidden = false;
        $('#studyQuestionSub').textContent = `日文原题：${qJp}`;
      } else {
        $('#studyQuestionSub').hidden = true;
      }
    } else {
      $('#studyQuestion').textContent = qJp;
      $('#studyQuestionSub').hidden = true;
    }

    const langBtn = $('#studyLangToggleBtn');
    if (langBtn) {
      langBtn.textContent = showChinese ? '中文译文：开' : '中文译文：关 (日文原文)';
      langBtn.className = showChinese ? 'btn btn-sm btn-lang' : 'btn btn-sm btn-lang is-jp';
    }

    // Reset helper boxes
    $('#studyHintBox').hidden = true;
    $('#studyHintBox').textContent = getCardHint(activeCard);

    const paperBtn = $('#studyPaperBtn');
    const paperBox = $('#studyPaperBox');
    paperBox.hidden = true;
    if (activeCard.paperImg) {
      paperBtn.hidden = false;
      $('#studyPaperImg').src = activeCard.paperImg;
    } else {
      paperBtn.hidden = true;
    }

    const mathBmBtn = $('#studyBookmarkMathBtn');
    if (isMathCard(activeCard)) {
      mathBmBtn.hidden = false;
      mathBmBtn.textContent = isBookmarked(activeCard) ? '已加入今晚待讲' : '留给今晚讲数学';
    } else {
      mathBmBtn.hidden = true;
    }

    $('#studyFeedback').hidden = true;
    $('#studyRateBar').hidden = true;

    const choicesBox = $('#studyChoices');
    const flipBar = $('#studyFlipBar');
    const markPanel = $('#studyMarkPanel');
    choicesBox.innerHTML = '';

    if (activeCard.type === 'mark') {
      // EJU Math authentic Marksheet fill-in [A][B][CD]
      choicesBox.hidden = true;
      flipBar.hidden = true;
      markPanel.hidden = false;
      renderStudyMarkSlots(activeCard);
    } else if (activeCard.type === 'mcq') {
      // Bunso 4-choice MCQ (保留四选一マーク式)
      choicesBox.hidden = false;
      flipBar.hidden = true;
      markPanel.hidden = true;
      const choicesList = (showChinese && Array.isArray(activeCard.choices_cn)) ? activeCard.choices_cn : activeCard.choices;
      choicesList.forEach((choiceText, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'choice-btn';
        btn.innerHTML = `<span class="choice-key">${idx + 1}</span><span>${choiceText}</span>`;
        btn.addEventListener('click', () => handleAnswerMcq(idx, btn));
        choicesBox.appendChild(btn);
      });
    } else {
      choicesBox.hidden = true;
      flipBar.hidden = false;
      markPanel.hidden = true;
    }

    renderMathIn($('#view-study'));
  }

  function renderStudyMarkSlots(card) {
    const container = $('#studyMarkSlots');
    container.innerHTML = '';
    markCells = [];
    markValues = [];
    activeCellIdx = 0;

    const blanks = Array.isArray(card.blanks) && card.blanks.length ? card.blanks : [{key: 'A', label: '[A]', ans: '0', len: 1}];
    let cellGlobalIdx = 0;

    blanks.forEach(b => {
      const len = b.len || (b.ans ? String(b.ans).length : 1);
      const box = document.createElement('div');
      box.className = 'mark-slot-box';
      box.id = `markSlotBox_${b.key}`;
      box.innerHTML = `
        <div class="mark-slot-label">${b.label}</div>
        <div class="mark-slot-inputs"></div>
        <div class="mark-slot-ans-hint" id="markSlotHint_${b.key}" hidden></div>
      `;
      const inputsWrap = box.querySelector('.mark-slot-inputs');
      for (let ci = 0; ci < len; ci++) {
        const cIdx = cellGlobalIdx++;
        const cell = document.createElement('div');
        cell.className = `mark-cell-input${cIdx === 0 ? ' is-focused' : ''}`;
        cell.id = `markCell_${cIdx}`;
        cell.textContent = '';
        cell.addEventListener('click', () => {
          if (answered) return;
          setActiveMarkCell(cIdx);
        });
        inputsWrap.appendChild(cell);
        markCells.push({blankKey: b.key, blankAns: String(b.ans), cellIdx: ci, globalIdx: cIdx, totalLen: len});
        markValues.push('');
      }
      container.appendChild(box);
    });
  }

  function setActiveMarkCell(idx) {
    if (idx < 0 || idx >= markCells.length) return;
    activeCellIdx = idx;
    markCells.forEach((c, i) => {
      const el = document.getElementById(`markCell_${i}`);
      if (el) el.classList.toggle('is-focused', i === activeCellIdx);
    });
  }

  function inputMarkChar(char) {
    if (answered || !activeCard || activeCard.type !== 'mark') return;
    if (char === 'del') {
      if (markValues[activeCellIdx]) {
        markValues[activeCellIdx] = '';
        const el = document.getElementById(`markCell_${activeCellIdx}`);
        if (el) el.textContent = '';
      } else if (activeCellIdx > 0) {
        setActiveMarkCell(activeCellIdx - 1);
        markValues[activeCellIdx] = '';
        const el = document.getElementById(`markCell_${activeCellIdx}`);
        if (el) el.textContent = '';
      }
      return;
    }
    if (!/^[0-9\-]$/.test(char)) return;
    markValues[activeCellIdx] = char;
    const el = document.getElementById(`markCell_${activeCellIdx}`);
    if (el) el.textContent = char;
    if (activeCellIdx < markCells.length - 1) {
      setActiveMarkCell(activeCellIdx + 1);
    }
  }

  function handleMarkSubmit() {
    if (answered || !activeCard || activeCard.type !== 'mark') return;
    answered = true;
    let allCorrect = true;
    const blanks = activeCard.blanks || [];

    blanks.forEach(b => {
      const cellsForBlank = markCells.filter(c => c.blankKey === b.key);
      const userVal = cellsForBlank.map(c => markValues[c.globalIdx] || '').join('').trim();
      const expected = String(b.ans).trim();
      const isBlankCorrect = userVal === expected;
      if (!isBlankCorrect) allCorrect = false;

      const box = document.getElementById(`markSlotBox_${b.key}`);
      const hint = document.getElementById(`markSlotHint_${b.key}`);
      if (box) {
        box.classList.remove('is-active');
        box.classList.add(isBlankCorrect ? 'is-correct-blank' : 'is-wrong-blank');
      }
      if (hint) {
        hint.hidden = false;
        hint.textContent = isBlankCorrect ? '✓ 正确' : `✗ 正解：${expected}`;
      }
    });

    const ansSummary = activeCard.ansSummary || blanks.map(b => `${b.label}=${b.ans}`).join(', ');
    showStudyFeedback(allCorrect, ansSummary);
  }

  function revealMarkAnswers() {
    const blanks = activeCard.blanks || [];
    blanks.forEach(b => {
      const box = document.getElementById(`markSlotBox_${b.key}`);
      const hint = document.getElementById(`markSlotHint_${b.key}`);
      if (box) box.classList.add('is-wrong-blank');
      if (hint) {
        hint.hidden = false;
        hint.textContent = `正解：${b.ans}`;
      }
    });
  }

  function handleAnswerMcq(choiceIdx, clickedBtn) {
    if (answered) return;
    answered = true;
    const isCorrect = choiceIdx === activeCard.a;

    $$('#studyChoices .choice-btn').forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === activeCard.a) btn.classList.add('is-correct');
      else if (btn === clickedBtn) btn.classList.add('is-wrong');
    });

    const choicesList = (showChinese && Array.isArray(activeCard.choices_cn)) ? activeCard.choices_cn : activeCard.choices;
    showStudyFeedback(isCorrect, choicesList[activeCard.a]);
  }

  function handleAnswerUnsure() {
    if (answered || !activeCard) return;
    answered = true;
    if (activeCard.type === 'mcq') {
      $$('#studyChoices .choice-btn').forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === activeCard.a) btn.classList.add('is-correct');
      });
    } else if (activeCard.type === 'mark') {
      revealMarkAnswers();
    }
    const choicesList = (showChinese && Array.isArray(activeCard.choices_cn)) ? activeCard.choices_cn : activeCard.choices;
    const ansText = activeCard.type === 'mcq'
      ? choicesList[activeCard.a]
      : (activeCard.ansSummary || activeCard.back);
    showStudyFeedback(false, ansText, true); // isUnsure = true
  }

  function handleRevealFlip() {
    if (answered) return;
    answered = true;
    $('#studyFlipBar').hidden = true;
    showStudyFeedback(null, activeCard.back);
  }

  function showStudyFeedback(isCorrect, answerText, isUnsure = false) {
    const fb = $('#studyFeedback');
    const statusEl = $('#feedbackStatus');
    const ansEl = $('#feedbackAnswer');
    const explEl = $('#feedbackExpl');
    const trapEl = $('#feedbackTrap');
    const optExplBox = $('#feedbackOptExpl');
    const kpDock = $('#feedbackKpDock');
    const kpBtn = $('#studyKpLinkBtn');

    fb.hidden = false;
    if (isUnsure) {
      statusEl.className = 'feedback-status is-bad';
      statusEl.textContent = `标记为不确定（已按答错计入错题本）· 正确答案：${answerText}`;
      ansEl.hidden = true;
    } else if (isCorrect === true) {
      statusEl.className = 'feedback-status is-ok';
      statusEl.textContent = '回答正确';
      ansEl.hidden = true;
    } else if (isCorrect === false) {
      statusEl.className = 'feedback-status is-bad';
      statusEl.textContent = `回答错误（已自动计入错题本）· 正确答案：${answerText}`;
      ansEl.hidden = true;
    } else {
      statusEl.className = 'feedback-status';
      statusEl.textContent = '参考答案';
      ansEl.hidden = false;
      ansEl.textContent = answerText;
    }

    // 4-Option breakdown: why correct is right, why the 3 incorrect options are wrong
    if (activeCard.optExpl && Array.isArray(activeCard.optExpl) && activeCard.optExpl.length === 4) {
      optExplBox.hidden = false;
      optExplBox.innerHTML = `
        <div class="opt-expl-heading">选项逐项深度解析（正确项为何对 · 干扰项各自错在哪）：</div>
        <div class="opt-expl-list">
          ${activeCard.optExpl.map((txt, idx) => `
            <div class="opt-expl-item ${idx === activeCard.a ? 'is-correct-opt' : 'is-wrong-opt'}">
              <span class="opt-expl-num">(${idx + 1})</span>
              <span class="opt-expl-text">${txt}</span>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      optExplBox.hidden = true;
      optExplBox.innerHTML = '';
    }

    explEl.textContent = getConciseExpl(activeCard);
    if (activeCard.trap) {
      trapEl.hidden = false;
      trapEl.textContent = `防坑提醒：${activeCard.trap}`;
    } else {
      trapEl.hidden = true;
    }

    // Direct link to core knowledge point quick-reference sheet
    const kpList = window.EJU_KNOWLEDGE || [];
    const matchedKp = kpList.find(k => k.id === activeCard.kpLink) || kpList.find(k => k.deck === activeCard.deck);
    if (matchedKp) {
      kpDock.hidden = false;
      kpBtn.textContent = `查看本题对应核心考点速查：【${matchedKp.title}】`;
      kpBtn.onclick = () => {
        $('#refModalTitle').textContent = matchedKp.title;
        $('#refModalBody').innerHTML = matchedKp.html;
        $('#refModal').hidden = false;
        renderMathIn($('#refModalBody'));
      };
    } else {
      kpDock.hidden = true;
    }

    $('#studyRateBar').hidden = false;
    activeCard._lastGradeCorrect = isCorrect && !isUnsure;
    renderMathIn(fb);
  }

  // Stage 2 Wrong Book Dual-Clear Rule:
  // "原题答对 1 次，加同考点变形题答对 1 次才移出" (clearedOriginal && clearedVariant)
  function recordCardGrade(card, grade, isUnsure = false) {
    const prev = getProgress(card);
    const wasWrong = isWrong(card);
    let box = prev.box || 0;
    let lapses = prev.lapses || 0;
    let inWrongBook = prev.inWrongBook !== undefined ? prev.inWrongBook : wasWrong;
    let clearedOriginal = Boolean(prev.clearedOriginal);
    let clearedVariant = Boolean(prev.clearedVariant);

    const ok = (grade === 'good' || grade === 'easy') && !isUnsure;
    if (!ok) {
      box = 0;
      lapses += 1;
      inWrongBook = true;
      clearedOriginal = false;
      clearedVariant = false;
    } else if (grade === 'hard') {
      box = Math.max(1, box);
    } else {
      box = Math.min(INTERVALS.length - 1, box + 1);
      if (inWrongBook) {
        clearedOriginal = true;
        if (clearedOriginal && clearedVariant) {
          inWrongBook = false; // 原题 1 次 ＋ 同考点 1 次，正式销号移出错题本！
          box = Math.max(2, box);
        }
      }
    }

    // When answered correctly, check if this card satisfies `clearedVariant` for any other card in wrong book with same topic!
    if (ok) {
      for (const otherId in state.progress) {
        if (otherId === card.id) continue;
        const otherProg = state.progress[otherId];
        if (otherProg && otherProg.inWrongBook) {
          const otherCard = cards.find(x => x.id === otherId);
          if (otherCard && otherCard.topic === card.topic && otherCard.deck === card.deck) {
            otherProg.clearedVariant = true;
            if (otherProg.clearedOriginal && otherProg.clearedVariant) {
              otherProg.inWrongBook = false; // 另一道同考点错题也达成双重攻克！
              otherProg.box = Math.max(2, otherProg.box || 0);
            }
          }
        }
      }
    }

    const clearedWrong = wasWrong && !inWrongBook;
    state.progress[card.id] = {
      box,
      due: addDays(INTERVALS[box]),
      reps: (prev.reps || 0) + 1,
      lapses,
      inWrongBook,
      clearedOriginal,
      clearedVariant,
      lastGrade: grade,
      updatedAt: Date.now()
    };

    state.history.push({
      id: card.id,
      date: localDateKey(),
      grade,
      correct: ok,
      clearedWrong,
      at: Date.now()
    });
    if (state.history.length > 4000) state.history = state.history.slice(-4000);
    saveState();
    scheduleAutoSync();
  }

  function advanceStudyCard(rateGrade) {
    if (!activeCard) return;
    let finalGrade = rateGrade;
    if (activeCard._lastGradeCorrect === false && rateGrade === 'good') {
      finalGrade = 'again'; // ensure wrong answers stay in wrong book
    }
    recordCardGrade(activeCard, finalGrade);

    sessionIndex += 1;
    if (state.activeSession) {
      state.activeSession.index = sessionIndex;
    }
    if (sessionIndex >= queue.length) {
      state.activeSession = null;
      saveState();
      switchRoute('today');
      return;
    }
    saveState();
    renderStudyCard();
  }

  // ─── Wrong Answer Book (#view-wrong) ───
  function renderWrongBook() {
    let list = [];
    if (wrongFilter === 'bookmark') {
      list = cards.filter(c => isMathCard(c) && (isBookmarked(c) || isWrong(c)));
    } else {
      list = cards.filter(c => {
        if (!isWrong(c)) return false;
        if (wrongFilter === 'bunso') return !isMathCard(c);
        if (wrongFilter === 'math') return isMathCard(c);
        return true;
      });
    }

    const container = $('#wrongBookList');
    container.innerHTML = '';

    if (!list.length) {
      container.innerHTML = `<div class="stat-hint" style="padding:18px 4px">当前分类下没有待消错题。做错或不确定的题目会自动收录到这里，需原题答对 1 次 ＋ 同考点变形题答对 1 次才移出。</div>`;
      return;
    }

    for (const c of list) {
      const p = getProgress(c);
      const ansText = c.type === 'mark'
        ? (c.ansSummary || (c.blanks || []).map(b => `${b.label}=${b.ans}`).join(', '))
        : c.type === 'mcq'
        ? (showChinese && c.choices_cn ? c.choices_cn[c.a] : c.choices[c.a])
        : c.back;
      const qText = showChinese && c.q_cn ? c.q_cn : c.q;
      const item = document.createElement('div');
      item.className = 'wrong-item';
      item.innerHTML = `
        <div class="wrong-item-main">
          <div class="wrong-item-meta">
            <span class="tag">${c.deck} · ${c.topic}</span>
            ${getSourceBadgeHtml(c)}
            <div class="wrong-dual-tags">
              <span class="wrong-tag-chip ${p.clearedOriginal ? 'is-cleared' : 'is-pending'}">
                原题答对：${p.clearedOriginal ? '1/1 ✓' : '0/1 待攻克'}
              </span>
              <span class="wrong-tag-chip ${p.clearedVariant ? 'is-cleared' : 'is-pending'}">
                同考点变式：${p.clearedVariant ? '1/1 ✓' : '0/1 待攻克'}
              </span>
            </div>
          </div>
          <div class="wrong-item-q">${qText}</div>
          <div class="wrong-item-ans">正确答案：${ansText}</div>
        </div>
        <div class="wrong-item-actions">
          <button class="btn btn-sm btn-primary" data-act="practice" type="button">重练原题</button>
          <button class="btn btn-sm" data-act="variant" type="button">练同考点题</button>
          ${isMathCard(c) ? `<button class="btn btn-sm" data-act="tutor" type="button">去讲题台</button>` : ''}
          <button class="btn btn-sm" data-act="clear" type="button">手动移出</button>
        </div>
      `;

      item.querySelector('[data-act="practice"]').addEventListener('click', () => {
        startCustomPoolSession([c], `错题重练：${c.topic}`, 1);
      });
      item.querySelector('[data-act="variant"]').addEventListener('click', () => {
        let variants = cards.filter(x => x.id !== c.id && x.deck === c.deck && x.topic === c.topic);
        if (!variants.length) {
          variants = cards.filter(x => x.id !== c.id && x.deck === c.deck);
        }
        startCustomPoolSession(variants, `同考点特训：${c.topic}`, 5);
      });
      const tutorBtn = item.querySelector('[data-act="tutor"]');
      if (tutorBtn) {
        tutorBtn.addEventListener('click', () => {
          state.bookmarks[c.id] = true;
          saveState();
          openMathTutorWithCard(c.id);
        });
      }
      item.querySelector('[data-act="clear"]').addEventListener('click', () => {
        const cur = getProgress(c);
        state.progress[c.id] = {...cur, box: Math.max(2, cur.box || 0), inWrongBook: false, clearedOriginal: true, clearedVariant: true};
        if (state.bookmarks) delete state.bookmarks[c.id];
        saveState();
        renderTopBarAndDashboard();
        renderWrongBook();
      });

      container.appendChild(item);
    }
    renderMathIn(container);
  }

  // ─── 17-Day Sprint Plan (#view-plan) 100% Live Linked ───
  function renderLinkedPlan() {
    const today = localDateKey();
    const todayStats = getTodayStats();
    const dayTasks = state.tasks[today] || {};

    $('#planTodayDateLabel').textContent = `今日（${today}）实时学习联动 —— 刷题后下方进度条自动增长并完成打卡`;

    const taskDefs = [
      {
        key: 'bunso30',
        title: '日间文综刷满 30 题',
        current: todayStats.bunsoCount,
        target: 30,
        autoDone: todayStats.bunsoCount >= 30,
        btnText: '去刷文综',
        onAction: () => {
          setPeriodMode('bunso');
          startCustomPoolSession(cards.filter(c => BUNSO_DECKS.includes(c.deck)), '今日文综冲刺', 30);
        }
      },
      {
        key: 'wrong5',
        title: '错题本攻克 / 复习 5 题',
        current: todayStats.wrongCleared + cards.filter(c => getProgress(c).updatedAt > Date.now() - 43200000 && getProgress(c).lapses > 0).length,
        target: 5,
        autoDone: todayStats.wrongCleared >= 3,
        btnText: '去消错题',
        onAction: () => {
          const wrongPool = cards.filter(isWrong);
          if (wrongPool.length) startCustomPoolSession(wrongPool, '错题攻坚', 15);
          else switchRoute('wrong');
        }
      },
      {
        key: 'math5',
        title: '晚间数学伴学讲练 5 题',
        current: todayStats.mathCount,
        target: 5,
        autoDone: todayStats.mathCount >= 5,
        btnText: '去数学讲题台',
        onAction: () => {
          setPeriodMode('math');
          switchRoute('math');
        }
      },
      {
        key: 'readKp',
        title: '核心速查表温习 1 节',
        current: dayTasks.readKp ? 1 : 0,
        target: 1,
        autoDone: Boolean(dayTasks.readKp),
        btnText: '去看速查表',
        onAction: () => switchRoute('today')
      }
    ];

    const tasksGrid = $('#linkedTasksGrid');
    tasksGrid.innerHTML = '';
    let doneCount = 0;

    for (const t of taskDefs) {
      const isDone = Boolean(dayTasks[t.key] || t.autoDone);
      if (isDone) doneCount++;
      const pct = Math.min(100, Math.round((t.current / t.target) * 100));

      const box = document.createElement('div');
      box.className = `linked-task-card${isDone ? ' is-done' : ''}`;
      box.innerHTML = `
        <div class="linked-task-top">
          <label class="linked-task-label">
            <input type="checkbox" ${isDone ? 'checked' : ''}>
            <span>${t.title}</span>
          </label>
          <button class="btn btn-xs" type="button">${t.btnText}</button>
        </div>
        <div class="mini-bar mini-bar-ok"><span style="width:${isDone ? 100 : pct}%"></span></div>
        <div class="linked-task-foot">
          <span>实时进度：${Math.min(t.current, t.target)} / ${t.target}</span>
          <span>${isDone ? '今日已达成' : '待完成'}</span>
        </div>
      `;

      box.querySelector('input').addEventListener('change', e => {
        state.tasks[today] = state.tasks[today] || {};
        state.tasks[today][t.key] = e.target.checked;
        saveState();
        renderLinkedPlan();
      });
      box.querySelector('button').addEventListener('click', t.onAction);
      tasksGrid.appendChild(box);
    }

    $('#planTodaySummaryTag').textContent = `今日已完成 ${doneCount} / ${taskDefs.length} 项`;

    // 4-Stage Roadmap linked to actual deck mastery
    const stageDefs = [
      {
        start: '2026-10-22',
        end: '2026-10-25',
        title: '第 1 阶段（10/22 - 10/25）：日本政治·条约通刷 & 数学二次函数保底',
        desc: '下午拿稳文综分值最高的【日本政治 + 条约】；晚上女朋友讲透【数与式 + 二次函数配方与最值】（占数学卷面40%）。',
        modules: [
          {label: '日本政治', filter: c => c.deck === '政治'},
          {label: '条约对比', filter: c => c.deck === '条約'},
          {label: '数学·二次函数与数式', filter: c => isMathCard(c) && /2次|数と式|因数|命題/.test(`${c.topic} ${c.q}`)}
        ]
      },
      {
        start: '2026-10-26',
        end: '2026-10-30',
        title: '第 2 阶段（10/26 - 10/30）：地理统计·宏观经济 & 数学三角几何·概率整数',
        desc: '下午攻克【柯本气候/农矿统计 + 日银财政汇率】；晚上用讲题台攻克【余弦/正弦/内切圆 + 双骰子概率与整数】。',
        modules: [
          {label: '地理与统计', filter: c => c.deck === '地理'},
          {label: '宏观经济', filter: c => c.deck === '経済'},
          {label: '数学·三角几何与概率整数', filter: c => isMathCard(c) && /図形|三角|余弦|正弦|確率|場合|整数/.test(`${c.topic} ${c.q}`)}
        ]
      },
      {
        start: '2026-10-31',
        end: '2026-11-04',
        title: '第 3 阶段（10/31 - 11/04）：变形题专项特训 & 近 5 年数学真题原卷演练',
        desc: '集中清理所有【变形特训题】与【历史·现代社会】；晚上在讲题台直接用 2021-2025 真题原卷练每道大题前(1)问。',
        modules: [
          {label: '变形题与真题特训', filter: isVariantCard},
          {label: '近现代历史', filter: c => c.deck === '歴史'},
          {label: '现代社会', filter: c => c.deck === '社会'}
        ]
      },
      {
        start: '2026-11-05',
        end: '2026-11-07',
        title: '第 4 阶段（11/05 - 11/07）：错题本清零 + 时事与旧地名收官',
        desc: '考前3天不碰偏题难题，把错题本连对2次全部销号，通读速查表中的时事与旧地名，稳住心态上考场。',
        modules: [
          {label: '时事热点', filter: c => c.deck === '時事'},
          {label: '旧地名与首都', filter: c => c.deck === '旧地名'},
          {label: '数学公式总复盘', filter: c => c.deck === '公式'}
        ]
      }
    ];

    const phasesContainer = $('#phasesLinkedList');
    phasesContainer.innerHTML = '';

    for (const st of stageDefs) {
      const isCurrent = today >= st.start && today <= st.end;
      const allStageCards = cards.filter(c => st.modules.some(m => m.filter(c)));
      const verifiedStageCards = allStageCards.filter(isCountedForMastery);
      const stageMastered = verifiedStageCards.filter(isMastered).length;
      const stagePct = verifiedStageCards.length ? Math.round((stageMastered / verifiedStageCards.length) * 100) : 0;

      const cardEl = document.createElement('div');
      cardEl.className = `phase-card${isCurrent ? ' is-current' : ''}`;
      cardEl.innerHTML = `
        <div class="phase-head">
          <span class="phase-title">${st.title}</span>
          <span class="tag${isCurrent ? '' : ' tag-subtle'}">${isCurrent ? '当前阶段' : `${st.start} ~ ${st.end}`} · ${
            verifiedStageCards.length
              ? `已核实进度 ${stagePct}% (${stageMastered}/${verifiedStageCards.length})`
              : `本组共 ${allStageCards.length} 题（均未核实·不计掌握率）`
          }</span>
        </div>
        <p class="phase-desc">${st.desc}</p>
        <div class="phase-modules-grid"></div>
      `;

      const grid = cardEl.querySelector('.phase-modules-grid');
      for (const mod of st.modules) {
        const pool = cards.filter(mod.filter);
        const verifiedPool = pool.filter(isCountedForMastery);
        const mCount = verifiedPool.filter(isMastered).length;
        const unmastered = pool.filter(c => !isMastered(c));
        const hasVerified = verifiedPool.length > 0;
        const pct = hasVerified ? Math.round((mCount / verifiedPool.length) * 100) : 0;

        const modBox = document.createElement('div');
        modBox.className = 'phase-mod-box';
        modBox.innerHTML = `
          <div class="phase-mod-top">
            <span>${mod.label}</span>
            <span>${hasVerified ? `${pct}%` : '未核实'}</span>
          </div>
          <div class="mini-bar mini-bar-ok"><span style="width:${pct}%"></span></div>
          <div class="phase-mod-foot">
            <span>${hasVerified ? `已核实掌握 ${mCount} / ${verifiedPool.length} 题` : `未核实 ${pool.length} 题（不计入掌握率）`}</span>
            <button class="text-btn" type="button">${unmastered.length ? `去练习 (${unmastered.length})` : '复习本组'}</button>
          </div>
        `;
        modBox.querySelector('button').addEventListener('click', () => {
          startCustomPoolSession(unmastered.length ? unmastered : pool, mod.label, 20);
        });
        grid.appendChild(modBox);
      }
      phasesContainer.appendChild(cardEl);
    }

    renderHistoryChart();
    renderMocksList();
  }

  function renderHistoryChart() {
    const chart = $('#historyChart');
    if (!chart) return;
    chart.innerHTML = '';
    const counts = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = localDateKey(d);
      const cnt = state.history.filter(h => h.date === key).length;
      counts.push({label: key.slice(5), cnt});
    }
    const maxCnt = Math.max(20, ...counts.map(c => c.cnt));
    for (const item of counts) {
      const hPct = Math.round((item.cnt / maxCnt) * 100);
      const col = document.createElement('div');
      col.className = 'chart-col';
      col.innerHTML = `
        <span class="chart-val">${item.cnt}</span>
        <div class="chart-bar-wrap"><div class="chart-bar-fill" style="height:${hPct}%"></div></div>
        <span class="chart-day">${item.label}</span>
      `;
      chart.appendChild(col);
    }
  }

  function renderMocksList() {
    const box = $('#mockList');
    if (!box) return;
    box.innerHTML = '';
    for (const m of (state.mocks || []).slice().reverse().slice(0, 8)) {
      const row = document.createElement('div');
      row.className = 'mock-row';
      row.innerHTML = `<span><b>${m.subject}</b> · ${m.score} 分</span><span class="stat-hint">${m.note || ''} (${m.date})</span>`;
      box.appendChild(row);
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 晚间 · 数学讲题台 (Math Tutoring Station: Cards + Past Papers + Whiteboard + Grapher)
  // ═════════════════════════════════════════════════════════════════════════
  function getTutorFilteredCards() {
    const mode = $('#tutorFilterSelect')?.value || 'real';
    const mathPool = cards.filter(isMathCard);
    if (mode === 'bookmark') {
      const bm = mathPool.filter(c => isBookmarked(c) || isWrong(c));
      return bm.length ? bm : mathPool.filter(c => c.id.startsWith('real-'));
    }
    if (mode === 'real') return mathPool.filter(c => c.id.startsWith('real-'));
    if (mode === 'quad') return mathPool.filter(c => /2次|数と式|因数|命題/.test(`${c.topic} ${c.q}`));
    if (mode === 'trig') return mathPool.filter(c => /図形|三角|余弦|正弦|円/.test(`${c.topic} ${c.q}`));
    if (mode === 'prob') return mathPool.filter(c => /確率|場合|整数|互除/.test(`${c.topic} ${c.q}`));
    if (mode === 'var') return mathPool.filter(c => c.id.startsWith('var-'));
    return mathPool;
  }

  function formatMathCardLabel(c, idx) {
    const m = (c.source || '').match(/(\d{4})[^\d]*?(?:問|第)(\d+)\s*(\([^\)]+\))?/);
    let prefix = '';
    if (m) {
      prefix = `${m[1]} · 第${m[2]}問${m[3] || ''}`;
    } else {
      const yMatch = (c.id || '').match(/(\d{4})/);
      prefix = yMatch ? `${yMatch[1]}真题` : `数学题 ${idx + 1}`;
    }
    return `${prefix} · ${c.topic || ''}`;
  }

  function initTutorUnifiedNav() {
    tutorCardsList = cards.filter(isMathCard);
    const sel = $('#tutorUnifiedSelect');
    if (!sel) return;
    sel.innerHTML = '';
    tutorCardsList.forEach((c, idx) => {
      const opt = document.createElement('option');
      opt.value = String(idx);
      opt.textContent = formatMathCardLabel(c, idx);
      sel.appendChild(opt);
    });
  }

  function renderTutorCard() {
    if (!tutorCardsList.length) tutorCardsList = cards.filter(isMathCard);
    if (tutorCardIdx >= tutorCardsList.length) tutorCardIdx = 0;
    if (tutorCardIdx < 0) tutorCardIdx = tutorCardsList.length - 1;

    const card = tutorCardsList[tutorCardIdx];
    if (!card) return;

    // Update single unified navigation
    const sel = $('#tutorUnifiedSelect');
    if (sel && sel.options.length) sel.value = String(tutorCardIdx);

    const m = (card.source || '').match(/(\d{4})[^\d]*?(?:問|第)(\d+)\s*(\([^\)]+\))?/);
    const navYearQ = m ? `${m[1]} · 第${m[2]}問${m[3] || ''}` : '真题';
    const indicator = $('#tutorUnifiedIndicator');
    if (indicator) indicator.textContent = `${navYearQ} · ${tutorCardIdx + 1}/${tutorCardsList.length}`;

    $('#tutorCardTopic').textContent = card.topic;
    applySourceTagAndBanner(card, $('#tutorCardSource'), $('#tutorAuditBanner'));

    const mastered = isMastered(card);
    const wrong = isWrong(card);
    const statusEl = $('#tutorCardStatus');
    statusEl.textContent = mastered ? '已掌握' : wrong ? '错题待攻克' : '未掌握';
    statusEl.className = `tag ${mastered ? '' : 'tag-subtle'}`;

    const bmBtn = $('#tutorBookmarkBtn');
    bmBtn.textContent = isBookmarked(card) ? '已加入待讲 (移出)' : '加入待讲题单';

    // Bilingual display for question (Japanese original + collapsible Chinese)
    $('#tutorQuestionText').textContent = card.q;
    if (showChinese && card.q_cn) {
      $('#tutorQuestionSub').hidden = false;
      $('#tutorQuestionSub').textContent = `中文译文：${card.q_cn}`;
    } else {
      $('#tutorQuestionSub').hidden = true;
    }

    const tutorLangBtn = $('#tutorLangToggleBtn');
    if (tutorLangBtn) {
      tutorLangBtn.textContent = showChinese ? '中文：开' : '中文：关 (原文)';
      tutorLangBtn.className = showChinese ? 'btn btn-sm btn-lang' : 'btn btn-sm btn-lang is-jp';
    }

    // Choices / Mark blanks box
    const choicesBox = $('#tutorChoicesBox');
    choicesBox.innerHTML = '';
    if (card.type === 'mark' && Array.isArray(card.blanks)) {
      const blanksWrap = document.createElement('div');
      blanksWrap.className = 'tutor-mark-blanks-preview';
      blanksWrap.innerHTML = `
        <div class="mark-tip-bar" style="margin-bottom:8px">【EJU マーク式 填空】原卷栏位与正解对照：</div>
        <div class="mark-slots-wrap" style="margin-bottom:8px">
          ${card.blanks.map(b => `
            <div class="mark-slot-box" style="padding:6px 10px">
              <div class="mark-slot-label">${b.label}</div>
              <div class="mark-slot-inputs">
                ${Array.from({length: b.len || (b.ans ? String(b.ans).length : 1)}).map((_, i) => `<span class="mark-cell-input tutor-mark-slot-cell" style="width:32px;height:36px;font-size:16px">${(b.ans && String(b.ans)[i]) || '?'}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      `;
      choicesBox.appendChild(blanksWrap);
    } else if (card.type === 'mcq' && Array.isArray(card.choices)) {
      card.choices.forEach((ch, idx) => {
        const div = document.createElement('div');
        div.className = 'tutor-choice-item';
        div.textContent = `(${idx + 1}) ${ch}`;
        div.addEventListener('click', () => {
          div.classList.toggle('is-correct', idx === card.a);
        });
        choicesBox.appendChild(div);
      });
    }

    // Original paper scan & official answer key
    const paperInline = $('#tutorPaperInline');
    const scanWrap = $('#tutorScanWrap');
    scanWrap.hidden = true;
    if (card.paperImg) {
      paperInline.hidden = false;
      $('#tutorShowAnsKeyBtn').hidden = !card.ansImg;
    } else {
      paperInline.hidden = true;
    }

    // Step-by-step boxes
    const hintBox = $('#tutorStepHint');
    const explBox = $('#tutorStepExpl');
    const ansBox = $('#tutorStepAns');
    hintBox.hidden = true;
    explBox.hidden = true;
    ansBox.hidden = true;
    $$('.step-reveal-btn').forEach(b => b.classList.remove('is-open'));

    hintBox.textContent = `【破题公式】${getCardHint(card)}`;
    explBox.textContent = card.expl || '按基本公式代入即可。';
    const ansStr = card.type === 'mark'
      ? `マーク式正解：${card.ansSummary || (card.blanks || []).map(b => `${b.label}=${b.ans}`).join(', ')}`
      : card.type === 'mcq'
      ? `选项 (${card.a + 1})：${card.choices[card.a]}`
      : card.back;
    ansBox.textContent = `【最终答案】${ansStr}${card.trap ? `\n【易错提醒】${card.trap}` : ''}`;

    renderMathIn($('#view-math'));

    // Automatically select the math tool matching this question's unit
    window.EJU_MATH_TOOLS?.autoSelect(card);

    // Automatically load/restore handwritten whiteboard notes for this specific card
    window.EJU_WHITEBOARD?.setCardId(card.id);
  }

  function openMathTutorWithCard(cardId) {
    setPeriodMode('math');
    switchRoute('math');
    tutorCardsList = cards.filter(isMathCard);
    const idx = tutorCardsList.findIndex(c => c.id === cardId);
    if (idx >= 0) tutorCardIdx = idx;
    renderTutorCard();
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 阶段 1：答案和题目的正确性核验报告 (#view-audit)
  // ═════════════════════════════════════════════════════════════════════════
  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function renderStage1AuditView() {
    const audit = window.EJU_STAGE1_AUDIT;
    if (!audit) return;

    const s = audit.summary;
    const strip = $('#auditSummaryStrip');
    if (strip) {
      strip.innerHTML = `
        <div class="stat-item">
          <div class="stat-label">题库当前总题数</div>
          <div class="stat-val-row"><strong class="stat-val">${cards.length}</strong><span class="stat-sub">数学 ${s.mathTotal} + 文综 ${s.unverifiedBunsoCount}</span></div>
          <div class="stat-hint">已彻底删除自编题 ${s.deletedSelfInvented} 道</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">已核实一致（计入掌握率）</div>
          <div class="stat-val-row"><strong class="stat-val stat-val-ok">${s.verifiedConsistentCount}</strong><span class="stat-sub">真题 16 + 改编 6</span></div>
          <div class="stat-hint">SymPy + 正解表 + 题库三方一致</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">三者不一致 · 待您裁定</div>
          <div class="stat-val-row"><strong class="stat-val stat-val-danger">${s.discrepancyCount}</strong><span class="stat-sub">未擅自改动题面</span></div>
          <div class="stat-hint">含 2025 I問1(1) 等转录偏差</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">未核实（不计入掌握率）</div>
          <div class="stat-val-row"><strong class="stat-val">${s.unverifiedBunsoCount}</strong><span class="stat-sub">文综総合科目</span></div>
          <div class="stat-hint">无官方真题PDF对照，标“未核实”</div>
        </div>
      `;
    }

    renderAuditComparisonTable();
    renderAuditSideBySide();
    renderAuditUnverifiedAndDeleted();
  }

  function renderAuditComparisonTable() {
    const audit = window.EJU_STAGE1_AUDIT;
    const tbody = $('#auditTableBody');
    if (!audit || !tbody) return;

    const rows = audit.mathAuditTable.filter(r => {
      if (auditTableFilter === 'discrepancy') return r.status === '不一致';
      if (auditTableFilter === 'verified') return r.status === '一致';
      return true;
    });

    tbody.innerHTML = rows.map(r => {
      const isBad = r.status === '不一致';
      const srcText = r.source || r.exam_ref || '';
      const keyText = r.key_ans || r.official_key || '';
      const sympyText = r.sympy_ans || r.sympy_calc || '';
      return `
        <tr class="${isBad ? 'audit-row-bad' : 'audit-row-ok'}">
          <td>
            <div class="audit-id-cell"><code>${escapeHtml(r.id)}</code></div>
            <button class="text-btn audit-jump-btn" data-jump-card="${escapeHtml(r.id)}" type="button">去讲题台查看 &rarr;</button>
          </td>
          <td><span class="tag ${isBad ? 'tag-source-warn' : 'tag-source-ok'}">${escapeHtml(srcText)}</span></td>
          <td>${escapeHtml(r.bank_ans)}</td>
          <td>${escapeHtml(keyText)}</td>
          <td>${escapeHtml(sympyText)}</td>
          <td>
            <span class="tag ${isBad ? 'tag-source-warn' : 'tag-source-ok'}">${isBad ? '不一致 · 待裁定' : '一致 ✓'}</span>
          </td>
          <td class="audit-note-cell">${escapeHtml(r.note)}</td>
        </tr>
      `;
    }).join('');

    $$('#auditTableBody [data-jump-card]').forEach(btn => {
      btn.addEventListener('click', () => openMathTutorWithCard(btn.dataset.jumpCard));
    });
  }

  function renderAuditSideBySide() {
    const audit = window.EJU_STAGE1_AUDIT;
    const container = $('#auditSbsList');
    if (!audit || !container) return;

    const map = new Map(audit.mathAuditTable.map(r => [r.id, r]));
    let targetIds = audit.sample20Ids || [];
    if (auditSbsFilter === 'discrepancy') {
      targetIds = audit.mathAuditTable.filter(r => r.status === '不一致').map(r => r.id);
    }

    container.innerHTML = targetIds.map((id, idx) => {
      const r = map.get(id);
      if (!r) return '';
      const isBad = r.status === '不一致';
      const srcText = r.source || r.exam_ref || '';
      const keyText = r.key_ans || r.official_key || '';
      const sympyText = r.sympy_ans || r.sympy_calc || '';
      const choicesHtml = (r.choices || []).map((ch, cIdx) => `
        <div class="sbs-choice ${cIdx === r.a ? 'is-bank-ans' : ''}">
          <span class="sbs-choice-num">(${cIdx + 1})</span>
          <span>${escapeHtml(ch)}</span>
          ${cIdx === r.a ? '<span class="tag tag-subtle" style="margin-left:auto">当前题库设定答案</span>' : ''}
        </div>
      `).join('');

      return `
        <div class="sbs-card ${isBad ? 'is-discrepancy' : ''}">
          <div class="sbs-card-head">
            <div>
              <strong>#${idx + 1} · <code>${escapeHtml(r.id)}</code> · ${escapeHtml(r.topic)}</strong>
              <span class="tag ${isBad ? 'tag-source-warn' : 'tag-source-ok'}" style="margin-left:8px">${escapeHtml(srcText)}</span>
            </div>
            <span class="tag ${isBad ? 'tag-source-warn' : 'tag-source-ok'}">${isBad ? '题面/正解表/题库 不一致（待您裁定）' : '原卷与网页题面 核对一致 ✓'}</span>
          </div>

          <div class="sbs-grid">
            <!-- 左栏：原卷截图 + 官方正解表切换 -->
            <div class="sbs-col sbs-col-scan">
              <div class="sbs-col-bar">
                <span>原卷扫描图 (<code>${escapeHtml(r.paperImg)}</code>)</span>
                ${r.ansImg ? `<button class="btn btn-xs sbs-toggle-ans-btn" data-qimg="${escapeHtml(r.paperImg)}" data-aimg="${escapeHtml(r.ansImg)}" type="button">切换查看官方正解表</button>` : ''}
              </div>
              <div class="sbs-img-box">
                <img src="${escapeHtml(r.paperImg)}" alt="${escapeHtml(r.id)} 原卷截图" loading="lazy">
              </div>
            </div>

            <!-- 右栏：网页当前题面 + 选项 + SymPy & 正解表比对结论 -->
            <div class="sbs-col sbs-col-web">
              <div class="sbs-col-bar">
                <span>网页当前题面 &amp; 选项（未擅自修改）</span>
                <button class="text-btn" data-sbs-jump="${escapeHtml(r.id)}" type="button">在讲题台打开</button>
              </div>
              <div class="sbs-web-body">
                <div class="sbs-q-text">${escapeHtml(r.q)}</div>
                <div class="sbs-choices-wrap">${choicesHtml}</div>
                <div class="sbs-audit-box ${isBad ? 'is-bad' : 'is-ok'}">
                  <div><b>官方正解表：</b>${escapeHtml(keyText)}</div>
                  <div><b>SymPy 独立验算：</b>${escapeHtml(sympyText)}</div>
                  <div><b>核对结论：</b>${escapeHtml(r.note)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    $$('#auditSbsList .sbs-toggle-ans-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const img = btn.closest('.sbs-col-scan')?.querySelector('img');
        if (!img) return;
        const showingAns = btn.dataset.showingAns === '1';
        if (showingAns) {
          img.src = btn.dataset.qimg;
          btn.dataset.showingAns = '0';
          btn.textContent = '切换查看官方正解表';
        } else {
          img.src = btn.dataset.aimg;
          btn.dataset.showingAns = '1';
          btn.textContent = '切回原卷题目页';
        }
      });
    });

    $$('#auditSbsList [data-sbs-jump]').forEach(btn => {
      btn.addEventListener('click', () => openMathTutorWithCard(btn.dataset.sbsJump));
    });
  }

  function renderAuditUnverifiedAndDeleted() {
    const audit = window.EJU_STAGE1_AUDIT;
    const container = $('#auditUnverifiedContent');
    if (!audit || !container) return;

    const unverifiedCards = cards.filter(isUnverified);
    const byDeck = {};
    for (const c of unverifiedCards) {
      byDeck[c.deck] = byDeck[c.deck] || [];
      byDeck[c.deck].push(c);
    }

    const deletedHtml = (audit.summary.deletedBreakdown || []).map(d => `
      <div class="audit-stat-row">
        <span><code>${escapeHtml(d.file)}</code> — ${escapeHtml(d.desc)}</span>
        <span class="tag tag-source-warn">已删除 ${d.count} 题</span>
      </div>
    `).join('');

    const deckGroupsHtml = Object.entries(byDeck).map(([deck, list]) => `
      <details class="kp-details">
        <summary class="kp-summary">
          <div class="kp-summary-left">
            <span class="tag">${escapeHtml(deck)}</span>
            <span class="kp-title">未核实题目共 ${list.length} 道</span>
            <span class="kp-desc">均已标记 source: "未核实"，界面显示标签且不计入掌握率</span>
          </div>
        </summary>
        <div class="kp-body">
          <div class="unverified-mini-list">
            ${list.map(c => `<div class="unverified-mini-row"><code>${escapeHtml(c.id)}</code> <span class="tag tag-source-unverified">未核实</span> <span>${escapeHtml(c.q)}</span></div>`).join('')}
          </div>
        </div>
      </details>
    `).join('');

    container.innerHTML = `
      <div class="audit-panel-block">
        <h3 class="section-title">一、已彻底删除的自编题与自编选项清单（共 ${audit.summary.deletedSelfInvented} 题）</h3>
        <p class="section-sub">严格按阶段 1 第 5 条要求，删除所有自编数学题、自编公式卡、自编 2026 时事预测题与自编文综扩展题；保留的 6 道数学变形题均已标明“改编自 20XX第X回 問X”。</p>
        <div class="audit-deleted-box">${deletedHtml}</div>
      </div>

      <div class="audit-panel-block" style="margin-top:18px">
        <h3 class="section-title">二、未核实题目清单（共 ${unverifiedCards.length} 题 · 全部为文综総合科目）</h3>
        <p class="section-sub">说明：<code>eju真题.zip</code> 压缩包内 83 个文件全部为 2002–2025 数学コース1 真题与正解表，不含文综（総合科目）官方原卷与正解表。因此现有 ${unverifiedCards.length} 道文综题全部标记为 <code>source: "未核实"</code>，在界面显式标注“未核实 · 不计入掌握率”。</p>
        <div class="knowledge-accordion">${deckGroupsHtml}</div>
      </div>
    `;
  }

  // ─── Route & Period Mode Switching ───
  function setPeriodMode(mode) {
    periodMode = mode;
    $('#modeBunsoBtn')?.classList.toggle('is-active', mode === 'bunso');
    $('#modeMathBtn')?.classList.toggle('is-active', mode === 'math');
    renderDeckProgressGrid();
    renderKnowledgeAccordion();
  }

  function switchRoute(route) {
    currentRoute = route;
    $$('.nav-tab').forEach(tab => tab.classList.toggle('is-active', tab.dataset.route === route));
    $$('.view').forEach(v => v.classList.toggle('is-active', v.id === `view-${route}`));

    renderTopBarAndDashboard();
    if (route === 'today') {
      renderDeckProgressGrid();
      renderKnowledgeAccordion();
    } else if (route === 'math') {
      setPeriodMode('math');
      renderTutorCard();
      setTimeout(() => {
        window.EJU_WHITEBOARD?.resize();
        renderMathIn($('#view-math'));
      }, 40);
    } else if (route === 'wrong') {
      renderWrongBook();
    } else if (route === 'plan') {
      renderLinkedPlan();
    } else if (route === 'audit') {
      renderStage1AuditView();
      renderMathIn($('#view-audit'));
    }
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  // ─── Cloud Sync (Preserves /api/sync and /api/report compatibility) ───
  function getSyncToken() {
    let tok = localStorage.getItem(SYNC_KEY);
    if (!tok) {
      tok = 'nayuki';
      localStorage.setItem(SYNC_KEY, tok);
    }
    return tok;
  }

  let syncTimer = null;
  function scheduleAutoSync() {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => syncWithServer(false), 2500);
  }

  async function syncWithServer(manual = false) {
    const token = getSyncToken();
    try {
      const res = await fetch(`/api/sync?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({token, state, updatedAt: Date.now()})
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.state && data.state.progress) {
          // Merge remote progress safely
          for (const [cid, rp] of Object.entries(data.state.progress)) {
            const lp = state.progress[cid];
            if (!lp || (rp.updatedAt || 0) > (lp.updatedAt || 0)) {
              state.progress[cid] = rp;
            }
          }
          if (data.state.bookmarks) {
            state.bookmarks = {...(data.state.bookmarks || {}), ...(state.bookmarks || {})};
          }
          saveState();
          renderTopBarAndDashboard();
        }
        localStorage.setItem(SYNC_LAST_KEY, new Date().toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'}));
        if (manual) $('#syncStatusText').textContent = `同步成功（${localStorage.getItem(SYNC_LAST_KEY)}）`;
      }
    } catch (_) {
      if (manual) $('#syncStatusText').textContent = '离线模式：进度已保存在本地浏览器';
    }
  }

  // ─── Event Listeners & Initialization ───
  function bindEvents() {
    // Period switcher
    $('#modeBunsoBtn').addEventListener('click', () => {
      setPeriodMode('bunso');
      switchRoute('today');
    });
    $('#modeMathBtn').addEventListener('click', () => {
      setPeriodMode('math');
      switchRoute('math');
    });

    // Main nav tabs
    $$('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => switchRoute(tab.dataset.route));
    });

    // Top dashboard clickable boxes
    $('#statDueBox').addEventListener('click', () => {
      const duePool = cards.filter(isDue);
      if (duePool.length) startCustomPoolSession(duePool, '到期复习', 25);
      else startCustomPoolSession(getFilteredPoolBySelectedDeck(), '智能刷题', 20);
    });
    $('#statWrongBox').addEventListener('click', () => switchRoute('wrong'));
    $('#statMasteryBox').addEventListener('click', () => switchRoute('plan'));

    // Practice console buttons
    $('#startSmartBtn').addEventListener('click', () => {
      startCustomPoolSession(getFilteredPoolBySelectedDeck(), selectedDeck, 20);
    });
    $('#startUnmasteredBtn').addEventListener('click', () => {
      const pool = getFilteredPoolBySelectedDeck().filter(c => !isMastered(c));
      startCustomPoolSession(pool.length ? pool : getFilteredPoolBySelectedDeck(), `${selectedDeck}·未掌握`, 20);
    });
    $('#startVariantBtn').addEventListener('click', () => {
      const pool = getFilteredPoolBySelectedDeck().filter(isVariantCard);
      startCustomPoolSession(pool.length ? pool : cards.filter(isVariantCard), '变形题特训', 20);
    });
    $('#resumeSessionBtn').addEventListener('click', () => {
      if (!state.activeSession) return;
      const map = new Map(cards.map(c => [c.id, c]));
      queue = state.activeSession.ids.map(id => map.get(id)).filter(Boolean);
      sessionIndex = state.activeSession.index || 0;
      if (queue.length) {
        switchRoute('study');
        renderStudyCard();
      }
    });

    // Search & Knowledge category tabs
    $('#globalSearchInput').addEventListener('input', renderKnowledgeAccordion);
    $('#clearSearchBtn').addEventListener('click', () => {
      $('#globalSearchInput').value = '';
      renderKnowledgeAccordion();
    });
    $$('#knowledgeCatTabs .cat-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        currentKnowledgeCat = btn.dataset.cat;
        $$('#knowledgeCatTabs .cat-tab').forEach(b => b.classList.toggle('is-active', b === btn));
        renderKnowledgeAccordion();
      });
    });

    // Study view controls
    $('#exitStudyBtn').addEventListener('click', () => switchRoute('today'));
    $('#studyHintBtn').addEventListener('click', () => {
      const box = $('#studyHintBox');
      box.hidden = !box.hidden;
      renderMathIn(box);
    });
    $('#studyPaperBtn').addEventListener('click', () => {
      const box = $('#studyPaperBox');
      box.hidden = !box.hidden;
    });
    $('#studyBookmarkMathBtn').addEventListener('click', () => {
      if (!activeCard) return;
      state.bookmarks[activeCard.id] = !state.bookmarks[activeCard.id];
      saveState();
      $('#studyBookmarkMathBtn').textContent = isBookmarked(activeCard) ? '已加入今晚待讲' : '留给今晚讲数学';
      renderTopBarAndDashboard();
    });
    $('#studyRefBtn').addEventListener('click', () => {
      if (!activeCard) return;
      const kpList = window.EJU_KNOWLEDGE || [];
      const match = kpList.find(k => k.deck === activeCard.deck) || kpList[0];
      if (!match) return;
      $('#refModalTitle').textContent = match.title;
      $('#refModalBody').innerHTML = match.html;
      $('#refModal').hidden = false;
      renderMathIn($('#refModalBody'));
    });
    $('#closeRefModalBtn').addEventListener('click', () => { $('#refModal').hidden = true; });
    $('#studyRevealFlipBtn').addEventListener('click', handleRevealFlip);
    $('#studyLangToggleBtn')?.addEventListener('click', () => {
      showChinese = !showChinese;
      localStorage.setItem('eju_lang_cn', String(showChinese));
      if (activeCard) renderStudyCard();
    });
    $('#studyUnsureBtn')?.addEventListener('click', handleAnswerUnsure);

    // Math Marksheet controls
    $('#studyMarkClearBtn')?.addEventListener('click', () => {
      if (answered) return;
      markValues = new Array(markCells.length).fill('');
      markCells.forEach((_, i) => {
        const el = document.getElementById(`markCell_${i}`);
        if (el) el.textContent = '';
      });
      setActiveMarkCell(0);
    });
    $('#studyMarkSubmitBtn')?.addEventListener('click', handleMarkSubmit);
    $$('#studyMarkKeypad [data-key]').forEach(btn => {
      btn.addEventListener('click', () => inputMarkChar(btn.dataset.key));
    });
    $$('#studyMarkKeypad [data-act="del"]').forEach(btn => {
      btn.addEventListener('click', () => inputMarkChar('del'));
    });

    $$('#rateButtonsGroup [data-rate]').forEach(btn => {
      btn.addEventListener('click', () => advanceStudyCard(btn.dataset.rate));
    });
    $('#studyNextVariantBtn').addEventListener('click', () => {
      if (!activeCard) return;
      const sameTopic = cards.filter(c => c.id !== activeCard.id && (c.topic === activeCard.topic || c.deck === activeCard.deck));
      const nextVar = prioritizeCards(sameTopic, 1)[0];
      if (nextVar) {
        queue.splice(sessionIndex + 1, 0, nextVar);
      }
      advanceStudyCard('good');
    });

    // Keyboard shortcuts in Study View
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        $('#refModal').hidden = true;
        $('#syncModal').hidden = true;
      }
      if (currentRoute !== 'study' || ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      if (!answered) {
        if (activeCard?.type === 'mark') {
          if (/^[0-9\-]$/.test(e.key)) {
            e.preventDefault();
            inputMarkChar(e.key);
          } else if (e.key === 'Backspace') {
            e.preventDefault();
            inputMarkChar('del');
          } else if (e.key === 'Enter') {
            e.preventDefault();
            handleMarkSubmit();
          }
        } else if (activeCard?.type === 'mcq' && ['1', '2', '3', '4'].includes(e.key)) {
          const idx = Number(e.key) - 1;
          const btns = $$('#studyChoices .choice-btn');
          if (btns[idx]) {
            e.preventDefault();
            handleAnswerMcq(idx, btns[idx]);
          }
        } else if (activeCard?.type === 'flip' && (e.key === ' ' || e.key === 'Enter')) {
          e.preventDefault();
          handleRevealFlip();
        }
      } else {
        if (e.key === ' ' || e.key === 'Enter' || e.key === '3') {
          e.preventDefault();
          advanceStudyCard('good');
        } else if (e.key === '1') {
          e.preventDefault();
          advanceStudyCard('again');
        } else if (e.key === '2') {
          e.preventDefault();
          advanceStudyCard('hard');
        }
      }
    });

    // Stage 3 Math Tutoring Station controls (Unified Nav & Whiteboard Bridge)
    initTutorUnifiedNav();

    $('#tutorUnifiedSelect')?.addEventListener('change', e => {
      tutorCardIdx = Number(e.target.value) || 0;
      renderTutorCard();
    });
    $('#tutorPrevBtn')?.addEventListener('click', () => {
      tutorCardIdx -= 1;
      renderTutorCard();
    });
    $('#tutorNextBtn')?.addEventListener('click', () => {
      tutorCardIdx += 1;
      renderTutorCard();
    });

    // Bilingual toggle in tutor view
    $('#tutorLangToggleBtn')?.addEventListener('click', () => {
      showChinese = !showChinese;
      localStorage.setItem('eju_lang_cn', String(showChinese));
      renderTutorCard();
    });

    // Paste question to whiteboard
    $('#tutorPasteQuestionBtn')?.addEventListener('click', () => {
      const card = tutorCardsList[tutorCardIdx];
      if (!card) return;
      const qText = showChinese && card.q_cn ? card.q_cn : card.q;
      if (window.EJU_WHITEBOARD) {
        // Switch to Whiteboard tab
        const boardTab = document.querySelector('.tool-tab[data-tool="board"]');
        if (boardTab) boardTab.click();
        window.EJU_WHITEBOARD.pasteText('【题面】', qText);
      }
    });

    // Whiteboard Toolbar controls
    $$('[data-wb-mode]').forEach(b => {
      b.addEventListener('click', () => window.EJU_WHITEBOARD?.setMode(b.dataset.wbMode));
    });
    $$('[data-wb-width]').forEach(b => {
      b.addEventListener('click', () => window.EJU_WHITEBOARD?.setWidth(Number(b.dataset.wbWidth)));
    });
    $$('[data-wb-color]').forEach(b => {
      b.addEventListener('click', () => window.EJU_WHITEBOARD?.setColor(b.dataset.wbColor));
    });
    $('#wbBgSelect')?.addEventListener('change', e => {
      window.EJU_WHITEBOARD?.setBg(e.target.value);
    });
    $('#wbUndoBtn')?.addEventListener('click', () => window.EJU_WHITEBOARD?.undo());
    $('#wbRedoBtn')?.addEventListener('click', () => window.EJU_WHITEBOARD?.redo());
    $('#wbClearBtn')?.addEventListener('click', () => window.EJU_WHITEBOARD?.clear());
    $('#wbFullscreenBtn')?.addEventListener('click', () => window.EJU_WHITEBOARD?.toggleFullscreen());

        $('#tutorBookmarkBtn').addEventListener('click', () => {
      const card = tutorCardsList[tutorCardIdx];
      if (!card) return;
      state.bookmarks[card.id] = !state.bookmarks[card.id];
      saveState();
      renderTopBarAndDashboard();
      renderTutorCard();
    });
    $('#tutorShowScanBtn').addEventListener('click', () => {
      const card = tutorCardsList[tutorCardIdx];
      if (!card || !card.paperImg) return;
      const wrap = $('#tutorScanWrap');
      $('#tutorScanImg').src = card.paperImg;
      wrap.hidden = !wrap.hidden;
    });
    $('#tutorShowAnsKeyBtn').addEventListener('click', () => {
      const card = tutorCardsList[tutorCardIdx];
      if (!card || !card.ansImg) return;
      const wrap = $('#tutorScanWrap');
      $('#tutorScanImg').src = card.ansImg;
      wrap.hidden = false;
    });
    

    // Step-by-step reveal buttons in Math Tutoring Station
    $$('.step-reveal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const step = btn.dataset.step;
        const map = {hint: '#tutorStepHint', expl: '#tutorStepExpl', ans: '#tutorStepAns'};
        const box = $(map[step]);
        if (!box) return;
        box.hidden = !box.hidden;
        btn.classList.toggle('is-open', !box.hidden);
        renderMathIn(box);
      });
    });
    $('#tutorRevealAllBtn').addEventListener('click', () => {
      ['#tutorStepHint', '#tutorStepExpl', '#tutorStepAns'].forEach(sel => {
        const el = $(sel);
        if (el) {
          el.hidden = false;
          renderMathIn(el);
        }
      });
      $$('.step-reveal-btn').forEach(b => b.classList.add('is-open'));
    });

    // Tutor verdict buttons (linked to progress & 17-day plan)
    $('#tutorMarkHardBtn').addEventListener('click', () => {
      const card = tutorCardsList[tutorCardIdx];
      if (!card) return;
      state.bookmarks[card.id] = true;
      recordCardGrade(card, 'again');
      renderTopBarAndDashboard();
      tutorCardIdx += 1;
      renderTutorCard();
    });
    $('#tutorMarkMasteredBtn').addEventListener('click', () => {
      const card = tutorCardsList[tutorCardIdx];
      if (!card) return;
      delete state.bookmarks[card.id];
      recordCardGrade(card, 'good');
      // Ensure box >= 2 so it counts as mastered immediately
      state.progress[card.id].box = Math.max(2, state.progress[card.id].box || 2);
      state.progress[card.id].inWrongBook = false;
      saveState();
      renderTopBarAndDashboard();
      tutorCardIdx += 1;
      renderTutorCard();
    });

    // Wrong book controls
    $$('#wrongFilterTabs .cat-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        wrongFilter = btn.dataset.wrongFilter;
        $$('#wrongFilterTabs .cat-tab').forEach(b => b.classList.toggle('is-active', b === btn));
        renderWrongBook();
      });
    });
    $('#wrongPracticeAllBtn').addEventListener('click', () => {
      const pool = cards.filter(isWrong);
      if (pool.length) startCustomPoolSession(pool, '全部错题重练', 25);
    });
    $('#wrongPracticeBunsoBtn').addEventListener('click', () => {
      const pool = cards.filter(c => !isMathCard(c) && isWrong(c));
      if (pool.length) startCustomPoolSession(pool, '文综错题重练', 25);
    });
    $('#wrongPracticeMathBtn').addEventListener('click', () => {
      setPeriodMode('math');
      tutorCardsList = cards.filter(isMathCard);
      const firstWrongIdx = tutorCardsList.findIndex(c => isWrong(c) || isBookmarked(c));
      if (firstWrongIdx >= 0) tutorCardIdx = firstWrongIdx;
      switchRoute('math');
    });

    // Plan mock form & backup
    $('#mockForm').addEventListener('submit', e => {
      e.preventDefault();
      const subject = $('#mockSubject').value;
      const score = Number($('#mockScore').value);
      const note = $('#mockNote').value.trim();
      state.mocks = state.mocks || [];
      state.mocks.push({subject, score, note, date: localDateKey()});
      saveState();
      $('#mockScore').value = '';
      $('#mockNote').value = '';
      renderMocksList();
    });
    $('#exportDataBtn').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], {type: 'application/json'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `eju-backup-${localDateKey()}.json`;
      a.click();
    });
    $('#importDataInput').addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result));
          if (parsed && parsed.progress) {
            state = {...state, ...parsed};
            saveState();
            renderTopBarAndDashboard();
            renderLinkedPlan();
          }
        } catch (_) {}
      };
      reader.readAsText(file);
    });

    // Theme & Sync modal
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      $('#themeBtn').textContent = '日间';
    }
    $('#themeBtn').addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem(THEME_KEY, 'light');
        $('#themeBtn').textContent = '夜间';
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem(THEME_KEY, 'dark');
        $('#themeBtn').textContent = '日间';
      }
    });

    $('#syncBtn').addEventListener('click', () => {
      $('#syncTokenInput').value = getSyncToken();
      $('#syncModal').hidden = false;
    });
    $('#closeSyncModalBtn').addEventListener('click', () => { $('#syncModal').hidden = true; });
    $('#syncNowBtn').addEventListener('click', () => {
      const val = $('#syncTokenInput').value.trim();
      if (val) localStorage.setItem(SYNC_KEY, val);
      syncWithServer(true);
    });

    // Stage 1 Audit tabs & filters
    $$('#auditMainTabs [data-audit-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.auditTab;
        $$('#auditMainTabs [data-audit-tab]').forEach(b => b.classList.toggle('is-active', b === btn));
        ['table', 'sbs', 'unverified'].forEach(k => {
          const pane = $(`#auditPane-${k}`);
          if (pane) pane.hidden = k !== target;
        });
      });
    });

    $$('[data-audit-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        auditTableFilter = btn.dataset.auditFilter;
        $$('[data-audit-filter]').forEach(b => b.classList.toggle('btn-primary', b === btn));
        renderAuditComparisonTable();
      });
    });

    $$('[data-sbs-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        auditSbsFilter = btn.dataset.sbsFilter;
        $$('[data-sbs-filter]').forEach(b => b.classList.toggle('btn-primary', b === btn));
        renderAuditSideBySide();
      });
    });
  }

  function init() {
    bindEvents();
    window.EJU_WHITEBOARD?.init();
    window.EJU_MATH_TOOLS?.init();
    renderTopBarAndDashboard();
    renderDeckProgressGrid();
    renderKnowledgeAccordion();
    renderStage1AuditView();
    renderTutorCard();
    renderMathIn(document.body);
    syncWithServer(false);

    try {
      const params = new URLSearchParams(window.location.search);
      const qView = params.get('view');
      const qTab = params.get('tab');
      if (qView && $(`#view-${qView}`)) {
        switchRoute(qView);
      }
      if (qTab) {
        const tabBtn = $(`#auditMainTabs [data-audit-tab="${qTab}"]`);
        if (tabBtn) tabBtn.click();
      }
    } catch (_) {}

    window.addEventListener('load', () => {
      renderMathIn(document.body);
      window.EJU_WHITEBOARD?.resize();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      }
    });
  }

  init();
})();
