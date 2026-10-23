#!/usr/bin/env python3
"""把文综（総合科目）真题 PDF 变成可校对的题目草稿，在你自己的电脑上运行。

  pip install pymupdf pytesseract requests
  （要 OCR 的话再装 Tesseract 和日文语言包 jpn：Windows 用 UB-Mannheim 安装包，勾选 Japanese）

用法：
  python tools/ocr_bunso.py "D:/日语+文数+文综" --match 文综 --out ocr_out
  python tools/ocr_bunso.py "D:/日语+文数+文综" --match 文综 --out ocr_out --llm      # 再用 DeepSeek 把文字拆成题目 JSON
  # 同时处理答案 PDF（按「年份+第N回」配对，如 2005平成17年第1回文综.pdf ↔ 2005平成17年第1回答案.pdf）：
  python tools/ocr_bunso.py "D:/.../【1】文综真题" --answers "D:/.../【2】文综答案" --out ocr_out --llm

步骤：
  1. 每页先取 PDF 自带的文字；没有文字层（扫描件）就渲染成图片，用 Tesseract 日文 OCR。
  2. 每个 PDF 输出 <out>/<文件名>/text.txt（带页码标记）、pNN.png（原页图，校对用）。
  2b. 扫描件（几乎所有 2018 年之后的 PDF）：Tesseract 读选项编号和正解表格会出错，请用 --vision：
     set VISION_API_KEY=你的密钥   （默认智谱 glm-4v-flash，免费；也可换通义千问：
     set VISION_BASE=https://dashscope.aliyuncs.com/compatible-mode/v1 和 set VISION_MODEL=qwen-vl-max）
     python tools/ocr_bunso.py "…\【1】文综真题" --answers "…\【2】文综答案" --match 2023 --out ocr_out --vision
  3. 加 --llm 时，把文字交给 DeepSeek（只传文字，很便宜），得到 draft.json 和 report.md。
     DeepSeek 的密钥放在环境变量 DEEPSEEK_API_KEY；地址/模型可用 DEEPSEEK_BASE、DEEPSEEK_MODEL 改。
  4. 草稿一律是「待核对」：图表题会标 hasFigure，没有答案的会标 a=null。
     必须对着原页图和官方正解表逐题核对后，才能标「已核实」。
"""
import argparse
import json
import os
import re
import sys
from pathlib import Path

try:
    import pymupdf as fitz
except ImportError:  # older PyMuPDF
    import fitz

MIN_TEXT = 60  # fewer characters than this on a page = scanned page, needs OCR


def ocr_image(png_path, lang):
    try:
        import pytesseract
        from PIL import Image
    except ImportError:
        return None
    try:
        return pytesseract.image_to_string(Image.open(png_path), lang=lang, config='--psm 6')
    except Exception as e:  # tesseract missing or no jpn data
        print(f'   OCR 失败：{e}', file=sys.stderr)
        return None


def extract_pdf(pdf, out_dir, lang, dpi, ocr=True):
    out_dir.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(pdf)
    chunks, scanned = [], 0
    for i, page in enumerate(doc, 1):
        png = out_dir / f'p{i:02d}.png'
        page.get_pixmap(dpi=dpi).save(png)
        text = page.get_text().strip()
        if len(text) < MIN_TEXT:
            scanned += 1
            text = (ocr_image(png, lang) or '').strip() if ocr else ''
            tag = 'ocr' if text else 'empty'
        else:
            tag = 'text'
        chunks.append(f'=== 第{i}页 ({tag}) ===\n{text}\n')
    (out_dir / 'text.txt').write_text('\n'.join(chunks), encoding='utf-8')
    return len(doc), scanned


PROMPT = """下面是日本留学生考试(EJU)総合科目真题的 OCR 文字。请拆成选择题，只输出 JSON 数组，不要解释。
每题字段：
  no     原卷题号（整数）
  q      题干（日文，尽量逐字保留；OCR 明显的错字可以按上下文改正）
  choices 选项数组（不含 1 2 3 4 的编号），通常 4 项
  a      正确选项下标（0 起）；文字里找不到答案就填 null，绝对不要猜
  page   这题所在的页码（看 === 第N页 === 标记）
  hasFigure  题目依赖图/表/地图/年表等无法用文字表达的内容时为 true
  note   对 OCR 可疑处的提醒，没有就空字符串
不要补充文字里没有的内容。"""


def llm_structure(text):
    import requests
    key = os.environ.get('DEEPSEEK_API_KEY')
    if not key:
        sys.exit('请先设置环境变量 DEEPSEEK_API_KEY')
    base = os.environ.get('DEEPSEEK_BASE', 'https://api.deepseek.com').rstrip('/')
    model = os.environ.get('DEEPSEEK_MODEL', 'deepseek-chat')
    pages = re.split(r'(?==== 第\d+页)', text)
    items, buf = [], ''
    groups = []
    for p in pages:  # ~6000 chars per request, split on page boundaries
        if buf and len(buf) + len(p) > 6000:
            groups.append(buf)
            buf = ''
        buf += p
    if buf.strip():
        groups.append(buf)
    for g in groups:
        r = requests.post(f'{base}/chat/completions', timeout=180,
                          headers={'Authorization': f'Bearer {key}'},
                          json={'model': model, 'temperature': 0, 'messages': [
                              {'role': 'system', 'content': PROMPT}, {'role': 'user', 'content': g}]})
        r.raise_for_status()
        content = r.json()['choices'][0]['message']['content']
        m = re.search(r'\[.*\]', content, re.S)
        if m:
            items.extend(json.loads(m.group(0)))
        else:
            print('   一段文字没解析出 JSON，已跳过', file=sys.stderr)
    return items


# ─── 视觉模型模式（--vision）：扫描件的选项编号 ①②③④、箭头、正解表格子 Tesseract 读不准，改让会看图的模型读 ───
VIS_Q_PROMPT = """这是 EJU 総合科目真题的一页（扫描件）。只输出 JSON 对象，不要解释：
{"passage": "本页出现的阅读材料/题组前言的原文（没有就空字符串）",
 "questions": [{"no": 方框里的解答番号（整数，没有就 null）, "q": "题干原文", "choices": ["选项1原文","选项2原文",...（不含①②编号）],
                "hasFigure": 题目依赖图/表/地图/年表等，仅凭文字无法作答时为 true, "note": "看不清或可疑处的说明，没有就空"}]}
规则：逐字抄写，不要翻译、不要补充、不要猜；看不清的地方在 note 里写明；如果这页只有材料没有题，questions 为空数组。"""

VIS_A_PROMPT = """这是 EJU 正解表（The Correct Answers）的一页。只提取标题为「総合科目 / Japan and the World」的那张表。
只输出 JSON 对象，不要解释：{"answers": {"题号": 正确选项编号(1-4整数), ...}, "note": "看不清的题号或其他提醒"}
题号用表里的解答番号。看不清的不要写，绝对不要猜。如果这一页没有総合科目的表，answers 为空对象。"""


def vision_call(png_path, prompt):
    import base64
    import io
    import requests
    from PIL import Image
    key = os.environ.get('VISION_API_KEY')
    if not key:
        sys.exit('请先设置环境变量 VISION_API_KEY（可选 VISION_BASE / VISION_MODEL，见文件开头说明）')
    base = os.environ.get('VISION_BASE', 'https://open.bigmodel.cn/api/paas/v4').rstrip('/')
    model = os.environ.get('VISION_MODEL', 'glm-4v-flash')
    im = Image.open(png_path).convert('RGB')
    im.thumbnail((1600, 1600))
    buf = io.BytesIO()
    im.save(buf, 'JPEG', quality=85)
    b64 = base64.b64encode(buf.getvalue()).decode()
    r = requests.post(f'{base}/chat/completions', timeout=240, headers={'Authorization': f'Bearer {key}'},
                      json={'model': model, 'temperature': 0, 'messages': [{'role': 'user', 'content': [
                          {'type': 'text', 'text': prompt},
                          {'type': 'image_url', 'image_url': {'url': f'data:image/jpeg;base64,{b64}'}}]}]})
    r.raise_for_status()
    m = re.search(r'\{.*\}', r.json()['choices'][0]['message']['content'], re.S)
    return json.loads(m.group(0)) if m else {}


def vision_questions(pdf_dir):
    items, passage = [], ''
    for png in sorted(pdf_dir.glob('p*.png')):
        n = int(png.stem[1:])
        try:
            res = vision_call(png, VIS_Q_PROMPT)
        except Exception as e:
            print(f'   第{n}页视觉读取失败：{e}', file=sys.stderr)
            continue
        if res.get('passage'):
            passage = res['passage']
        for q in res.get('questions') or []:
            q['page'] = n
            q['context'] = passage
            items.append(q)
    return items


def vision_answers(pdf_dir):
    ans, notes = {}, []
    for png in sorted(pdf_dir.glob('p*.png')):
        try:
            res = vision_call(png, VIS_A_PROMPT)
        except Exception as e:
            print(f'   答案页 {png.name} 读取失败：{e}', file=sys.stderr)
            continue
        ans.update(res.get('answers') or {})
        if res.get('note'):
            notes.append(f'{png.name}: {res["note"]}')
    return ans, notes


def pair_key(name):
    """'2005平成17年第1回文综.pdf' -> '2005-1'；只有一回的年份（2024/2025）-> '2024-1'。"""
    y = re.match(r'\D*(\d{4})', name)
    n = re.search(r'第\s*([12１２一二])\s*回', name)
    if not y:
        return None
    return f'{y.group(1)}-{ {"1": "1", "１": "1", "一": "1", "2": "2", "２": "2", "二": "2"}.get(n.group(1), "1") if n else "1" }'


ANS_PROMPT = """下面是 EJU 総合科目某一回的「正解表」OCR 文字。只输出 JSON 对象：键是题号（字符串），值是正确选项编号（1-4 的整数）。
表里有科目分区时，题号按卷面题号（解答番号）对应，不要自己重新编号。看不清或缺失的题号不要写，更不要猜。"""


def llm_answers(text):
    import requests
    key = os.environ.get('DEEPSEEK_API_KEY')
    base = os.environ.get('DEEPSEEK_BASE', 'https://api.deepseek.com').rstrip('/')
    model = os.environ.get('DEEPSEEK_MODEL', 'deepseek-chat')
    r = requests.post(f'{base}/chat/completions', timeout=180, headers={'Authorization': f'Bearer {key}'},
                      json={'model': model, 'temperature': 0, 'messages': [
                          {'role': 'system', 'content': ANS_PROMPT}, {'role': 'user', 'content': text[:12000]}]})
    r.raise_for_status()
    m = re.search(r'\{.*\}', r.json()['choices'][0]['message']['content'], re.S)
    return json.loads(m.group(0)) if m else {}


def write_report(out_dir, name, items):
    seen, dup = set(), []
    for it in items:
        if it.get('no') in seen:
            dup.append(it.get('no'))
        seen.add(it.get('no'))
    lines = [f'# {name} 校对清单', '',
             f'共 {len(items)} 题；没有答案 {sum(1 for i in items if i.get("a") is None)} 题；'
             f'依赖图表 {sum(1 for i in items if i.get("hasFigure"))} 题；重复题号 {dup or "无"}。', '',
             '| 题号 | 页 | 答案 | 图表 | 选项数 | 提醒 |', '|---|---|---|---|---|---|']
    for it in items:
        a = it.get('a')
        lines.append(f'| {it.get("no")} | {it.get("page")} | {"?" if a is None else a + 1} | '
                     f'{"是" if it.get("hasFigure") else ""} | {len(it.get("choices") or [])} | {it.get("note") or ""} |')
    (out_dir / 'report.md').write_text('\n'.join(lines), encoding='utf-8')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('folder')
    ap.add_argument('--match', default='文综', help='只处理文件名含这个词的 PDF（默认：文综）')
    ap.add_argument('--answers', help='答案 PDF 所在文件夹（按年份+第N回配对）')
    ap.add_argument('--out', default='ocr_out')
    ap.add_argument('--lang', default='jpn')
    ap.add_argument('--dpi', type=int, default=200)
    ap.add_argument('--llm', action='store_true', help='OCR 文字交给 DeepSeek 拆题（适合有文字层的 PDF）')
    ap.add_argument('--vision', action='store_true', help='扫描件推荐：逐页图片交给视觉模型读题和正解表（需 VISION_API_KEY）')
    args = ap.parse_args()

    pdfs = sorted(p for p in Path(args.folder).rglob('*.pdf') if args.match in p.name)
    if not pdfs:
        sys.exit(f'{args.folder} 里没有文件名含「{args.match}」的 PDF')
    ans_pdfs = {}
    if args.answers:
        for p in Path(args.answers).rglob('*.pdf'):
            ans_pdfs[pair_key(p.name)] = p
    for pdf in pdfs:
        out_dir = Path(args.out) / pdf.stem
        print(f'→ {pdf.name}')
        n, scanned = extract_pdf(pdf, out_dir, args.lang, args.dpi, ocr=not args.vision)
        print(f'   {n} 页，其中 {scanned} 页没有文字层' + ('（--vision 模式不做 OCR）' if args.vision else '，已走 OCR'))
        if args.llm or args.vision:
            items = vision_questions(out_dir) if args.vision else llm_structure((out_dir / 'text.txt').read_text(encoding='utf-8'))
            ans = {}
            ap_ = ans_pdfs.get(pair_key(pdf.name))
            if args.answers and not ap_:
                print('   没找到配对的答案 PDF')
            if ap_:
                a_dir = Path(args.out) / (pdf.stem + '_答案')
                extract_pdf(ap_, a_dir, args.lang, args.dpi, ocr=not args.vision)
                ans = vision_answers(a_dir)[0] if args.vision else llm_answers((a_dir / 'text.txt').read_text(encoding='utf-8'))
                (out_dir / 'answers.json').write_text(json.dumps(ans, ensure_ascii=False, indent=2), encoding='utf-8')
                print(f'   答案表读出 {len(ans)} 个，来自 {ap_.name}')
            for it in items:
                it.setdefault('a', None)
                official = ans.get(str(it.get('no')))
                if official is not None:
                    it['aFromQuestion'] = it.get('a')
                    it['a'] = int(official) - 1
                    it['aSource'] = '正解表'
                it['source'] = f'{pdf.stem} 第{it.get("no")}問'
                it['status'] = '待核对'
            (out_dir / 'draft.json').write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding='utf-8')
            write_report(out_dir, pdf.stem, items)
            print(f'   草稿 {len(items)} 题 → {out_dir / "draft.json"}，校对清单 {out_dir / "report.md"}')
    print('完成。请对着 pNN.png 和官方正解表逐题核对，再决定要不要导入题库。')


if __name__ == '__main__':
    main()
