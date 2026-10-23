// 用法：python3 -m http.server 8765 后，PW=$(npm root -g)/playwright node tools/tests/mock.test.js
const {chromium}=require(process.env.PW);
(async()=>{
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
 await p.goto('http://localhost:8765/');await p.waitForTimeout(800);
 await p.click('[data-route=mock]');
 console.log('sittings',await p.$$eval('.mock-sitting',e=>e.map(x=>x.textContent)));
 await p.click('.mock-sitting');
 await p.waitForSelector('.mock-cell');
 console.log('q',(await p.textContent('#mockQ')).slice(0,60), 'katex',await p.$$eval('#mockQ .katex',e=>e.length));
 await p.screenshot({path:require('os').tmpdir()+'/m1.png'});
 // type answers via keyboard on Q1: use true answers for first card, wrong for rest
 const ans=await p.evaluate(()=>{const c=window.EJU_BANK.find(x=>x.id.startsWith('real-2025-1'));return c.blanks.map(b=>b.ans).join('')});
 for(const ch of ans) await p.keyboard.press(ch);
 await p.waitForTimeout(200);
 console.log('chip1 class',await p.getAttribute('[data-go="0"]','class'));
 await p.reload();await p.waitForTimeout(600);await p.click('[data-route=mock]');
 console.log('resume',await p.$('#mockResumeBtn')!==null);
 await p.click('#mockResumeBtn');
 console.log('cells filled',await p.$$eval('.mock-cell',e=>e.map(x=>x.textContent).join('')));
 await p.click('#mockNext');await p.click('#mockFlagBtn');
 p.on('dialog',d=>d.accept());
 await p.click('#mockSubmit');
 await p.waitForSelector('.mock-report');
 console.log('score',await p.textContent('.mock-score'));
 await p.screenshot({path:require('os').tmpdir()+'/m2.png',fullPage:true});
 console.log('wrongbook badge',await p.textContent('#navWrongBadge'));
 await p.click('[data-explain]');await p.waitForTimeout(500);
 console.log('route after explain',await p.evaluate(()=>window.EJU_APP.currentRoute()));
 await p.click('[data-route=wrong]');await p.waitForTimeout(300);console.log('wrong badge',await p.textContent('#navWrongBadge'));await p.click('[data-route=plan]');await p.waitForTimeout(300);
 console.log('plan mocks',await p.$$eval('#mockList .mock-row',e=>e.map(x=>x.textContent)));
 console.log('errs',errs);await b.close();
})();
