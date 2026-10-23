// 用法：python3 -m http.server 8765 后，PW=$(npm root -g)/playwright node tools/tests/mockb.test.js
const {chromium}=require(process.env.PW);
(async()=>{
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
 p.on('dialog',d=>d.accept());
 await p.goto('http://localhost:8765/');await p.waitForTimeout(800);
 await p.evaluate(()=>localStorage.setItem('eju_lang_mode','jp'));await p.reload();await p.waitForTimeout(600);
 await p.click('[data-route=mockb]');
 await p.selectOption('#mockbN','10');
 await p.click('#mockbStart');await p.waitForSelector('.mockb-choice');
 console.log('chips',await p.$$eval('.mock-chip',e=>e.length),'clock',await p.textContent('#mockbClock'),'cn hidden',await p.$('.stat-hint')===null);
 await p.click('#mockbHelp');console.log('after help cn small',(await p.$$('.mockb-choice small')).length);
 await p.keyboard.press('2');await p.keyboard.press('ArrowRight');await p.keyboard.press('1');
 await p.screenshot({path:require('os').tmpdir()+'/b1.png'});
 await p.reload();await p.waitForTimeout(600);await p.click('[data-route=mockb]');
 console.log('resume',await p.$('#mockbResume')!==null);await p.click('#mockbResume');
 console.log('done chips',await p.$$eval('.mock-chip.is-done',e=>e.length));
 await p.click('#mockbSubmit');await p.waitForSelector('.mock-report');
 console.log(await p.textContent('.mock-score'));
 await p.screenshot({path:require('os').tmpdir()+'/b2.png',fullPage:true});
 await p.click('[data-route=plan]');await p.waitForTimeout(300);
 console.log(await p.$$eval('#mockList .mock-group-head',e=>e.map(x=>x.textContent)));
 // auto-submit
 await p.click('[data-route=mockb]');await p.click('#mockbAgain').catch(()=>{});
 await p.selectOption('#mockbN','10');await p.click('#mockbStart');await p.waitForSelector('.mockb-choice');
 await p.evaluate(()=>{const r=JSON.parse(localStorage.getItem('eju-mockb-run'));r.startedAt-=r.durationMs+1000;localStorage.setItem('eju-mockb-run',JSON.stringify(r))});
 await p.reload();await p.waitForTimeout(600);await p.click('[data-route=mockb]');await p.waitForSelector('.mock-report',{timeout:6000});
 console.log('auto',await p.textContent('.mock-report h2'));
 console.log('errs',errs);await b.close();
})();
