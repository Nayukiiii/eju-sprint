# 阶梯「今日题目」端到端：在装有 playwright 的容器里运行（站点目录拷到 /tmp/eju-ladder-test/site）
import os, threading, http.server, socketserver, functools, json
os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "/AstrBot/data/ms-playwright")
from playwright.sync_api import sync_playwright
ROOT = "/tmp/eju-ladder-test/site"
OUT = "/tmp/eju-ladder-test/shots"
os.makedirs(OUT, exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(("127.0.0.1", 18772), functools.partial(Q, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = "http://127.0.0.1:18772/index.html"

def newpage(p, vp):
    b = p.chromium.launch(args=["--no-sandbox"])
    ctx = b.new_context(viewport=vp, service_workers="block")
    ctx.route("**/api/**", lambda r: r.abort())
    pg = ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    return b, ctx, pg, errs

def answer_right(pg):
    pg.wait_for_function("document.querySelectorAll('#studyChoices .choice-btn').length==4")
    ans = pg.evaluate("window.EJU_APP.getSession().card.a")
    pg.click(f"#studyChoices .choice-btn:nth-child({ans+1})")
    pg.click('#rateButtonsGroup [data-rate="good"]')

def cur(pg): return pg.evaluate("window.EJU_APP.getSession().card.id")

with sync_playwright() as p:
    # 1. 日期表与挑题
    b, ctx, pg, errs = newpage(p, {"width": 390, "height": 800})
    pg.goto(BASE); pg.wait_for_selector("#ladderHome")
    res = pg.evaluate("""()=>{
      const A=window.EJU_LADDER_API, L=window.EJU_LADDER, ids=new Set(window.EJU_APP.cards.map(c=>c.id));
      const out={}, bad=[];
      for (const s of Object.values(A.DAY_SUBJECT)) if(!A.SUBJECTS.includes(s)) bad.push('subject '+s);
      for (let d=24; d<=38; d++) {
        const key = d<=31 ? '10-'+d : '11-'+String(d-31).padStart(2,'0');
        const pl=A.planFor(key); const picks=A.preview(key);
        for (const id of picks) if(!ids.has(id)) bad.push(key+' missing '+id);
        out[key]={kind:pl.kind, subject:pl.subject||'', picks:picks.map(id=>id+' ['+L.real[id].concepts.join(',')+']')};
      }
      return {out,bad};
    }""")
    for k, v in res["out"].items():
        print(k, v["kind"], v["subject"]); [print("    ", x) for x in v["picks"]]
    assert not res["bad"], res["bad"]
    assert len(res["out"]) == 15
    b.close()

    # 2. 10-25 走一遍（PC 与手机）
    for tag, vp in (("pc", {"width": 1280, "height": 900}), ("m390", {"width": 390, "height": 800})):
        b, ctx, pg, errs = newpage(p, vp)
        pg.goto(BASE + "?ladderDate=10-25"); pg.wait_for_selector(".lad-trow")
        rows = pg.eval_on_selector_all(".lad-trow", "els=>els.map(e=>e.dataset.qid)")
        print(f"[{tag}] rows={len(rows)} start btn:", pg.inner_text('[data-act="start-today"]'), "|", pg.inner_text(".lad-today-head .lad-prog"))
        assert len(rows) == 6 and pg.is_visible(".lad-today"), rows
        pg.screenshot(path=f"{OUT}/{tag}_today.png", full_page=False)
        pg.click('[data-act="start-today"]')
        pg.wait_for_selector("#ladderBanner")
        print(f"[{tag}] first banner:", pg.inner_text("#ladderBanner").replace("\n", " "))
        # 第一道：先修小轮 → 闸门 → 原题
        n = int(pg.inner_text("#studyProgressText").split("/")[1])
        for i in range(n - 1): answer_right(pg)
        pg.wait_for_selector("#ladderGate")
        pg.click("#ladderGateBtn")
        assert cur(pg) == rows[0], (cur(pg), rows[0])
        print(f"[{tag}] back at q1 {rows[0]}, feedback hidden={pg.is_hidden('#studyFeedback')}")
        answer_right(pg)
        # 自动进入第二道
        pg.wait_for_function("(id)=>window.EJU_APP.getSession().queue.length>0", arg=rows[1])
        pg.wait_for_selector("#ladderBanner")
        second = pg.evaluate("window.EJU_APP.getSession().queue.map(c=>c.id)")
        print(f"[{tag}] after q1 → next session ids tail={second[-1]} banner:", pg.inner_text("#ladderBanner").replace("\n", " "))
        assert second[-1] == rows[1]
        # 返回，主页进度
        pg.click("#exitStudyBtn")
        pg.wait_for_selector(".lad-trow")
        print(f"[{tag}] home after q1:", pg.inner_text(".lad-today-head .lad-prog"), "|", pg.inner_text('[data-act="start-today"]'))
        # 刷新：挑选不变，进度保留
        pg.reload(); pg.wait_for_selector(".lad-trow")
        rows2 = pg.eval_on_selector_all(".lad-trow", "els=>els.map(e=>e.dataset.qid)")
        print(f"[{tag}] reload same picks={rows2 == rows}; progress:", pg.inner_text(".lad-today-head .lad-prog"))
        assert rows2 == rows
        pg.screenshot(path=f"{OUT}/{tag}_today_after.png", full_page=False)
        # 继续：应从第二道开始
        pg.click('[data-act="start-today"]'); pg.wait_for_selector("#ladderBanner")
        tail = pg.evaluate("window.EJU_APP.getSession().queue.slice(-1)[0].id")
        print(f"[{tag}] resume starts at {tail} (expect {rows[1]})")
        assert tail == rows[1]
        print(f"[{tag}] page errors:", errs[:3])
        b.close()

    # 3. 模考日 / 复盘日 / 休息日
    b, ctx, pg, errs = newpage(p, {"width": 390, "height": 800})
    for d in ("11-01", "11-04", "11-05", "11-07"):
        pg.goto(BASE + f"?ladderDate={d}"); pg.wait_for_selector(".lad-today")
        print(d, "→", pg.inner_text(".lad-today").replace("\n", " | ")[:120])
        if d == "11-01":
            pg.screenshot(path=f"{OUT}/m390_mock_day.png")
            pg.click('[data-act="mock"]'); pg.wait_for_selector("#view-mockb.is-active")
            print("   mock button → 文模 tab ok")
    print("errors:", errs[:3])
    b.close()
srv.shutdown()
