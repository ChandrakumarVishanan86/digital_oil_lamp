const { chromium } = require('playwright');
const B='http://localhost:8080/digital_oil_lamp/', OUT='/home/claude/digital_oil_lamp/docs/screenshots/';
(async()=>{
 const br=await chromium.launch(); const errs=[]; const res=[]; const ok=(n,c)=>res.push((c?'PASS ':'FAIL ')+n);
 const ctx=await br.newContext({viewport:{width:1280,height:900}}); 
 await ctx.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
 const pg=await ctx.newPage(); pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{if(m.type()==='error'&&!/net::ERR|Failed to load/.test(m.text()))errs.push(m.text())});
 await pg.goto(B,{waitUntil:'networkidle'}); await pg.waitForTimeout(800); await pg.screenshot({path:OUT+'01-home.png'});
 const box=async()=>{const b=await pg.locator('#scanner').boundingBox(); return [b.x+b.width/2,b.y+b.height/2]};
 // empty name -> rejected
 await pg.locator('#scanner').scrollIntoViewIfNeeded(); let [x,y]=await box(); await pg.mouse.move(x,y); await pg.mouse.down(); await pg.waitForTimeout(300); await pg.mouse.up();
 ok('empty name blocked',(await pg.textContent('#err')).includes('name'));
 // early release -> not lit
 await pg.fill('#name','Chandra Kumar'); await pg.fill('#wish','May everyone be happy'); [x,y]=await box(); await pg.mouse.move(x,y); await pg.mouse.down(); await pg.waitForTimeout(900);
 await pg.screenshot({path:OUT+'02-scanning.png'}); await pg.mouse.up(); await pg.waitForTimeout(300);
 ok('early release cancels',!(await pg.evaluate(()=>document.getElementById('altar').classList.contains('lit'))));
 // full hold
 [x,y]=await box(); await pg.mouse.move(x,y); await pg.mouse.down(); await pg.waitForTimeout(2600); await pg.mouse.up(); await pg.waitForTimeout(500);
 await pg.locator('#altar').scrollIntoViewIfNeeded(); await pg.waitForTimeout(1800);
 ok('lamp lit after full hold',await pg.evaluate(()=>document.getElementById('altar').classList.contains('lit')));
 ok('name glows on lamp',(await pg.textContent('#npName'))==='Chandra Kumar');
 await pg.screenshot({path:OUT+'03-lit.png'});
 await pg.evaluate(()=>window.scrollTo(0,document.body.scrollHeight)); await pg.waitForTimeout(700); await pg.screenshot({path:OUT+'04-wall.png'});
 const names=await pg.$$eval('.diya .dn',e=>e.map(x=>x.textContent)); ok('name appears on wall',names.includes('Chandra Kumar'));
 // XSS name rejected
 await pg.evaluate(()=>window.scrollTo(0,300)); await pg.waitForTimeout(2600); await pg.fill('#name','<img src=x onerror=alert(1)>'); [x,y]=await box(); await pg.mouse.move(x,y); await pg.mouse.down(); await pg.waitForTimeout(300); await pg.mouse.up();
 ok('invalid name rejected client side',(await pg.textContent('#err')).length>0);
 // server-side
 const api=await pg.evaluate(async()=>{const r=await fetch('api.php',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':window.LAMP.csrf},body:JSON.stringify({name:'<b>x</b>',held_ms:2300})});return [r.status,(await r.json()).message]}); ok('server rejects markup name',api[0]===422);
 const noHold=await pg.evaluate(async()=>{const r=await fetch('api.php',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':window.LAMP.csrf},body:JSON.stringify({name:'Bob',held_ms:10})});return r.status}); ok('server enforces hold time',noHold===422);
 const noCsrf=await pg.evaluate(async()=>{const r=await fetch('api.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Bob',held_ms:2300})});return r.status}); ok('csrf enforced',noCsrf===403);
 // Tamil
 await pg.fill('#name','அம்மா'); await pg.fill('#wish',''); [x,y]=await box(); await pg.mouse.move(x,y); await pg.mouse.down(); await pg.waitForTimeout(2600); await pg.mouse.up(); await pg.waitForTimeout(1500);
 ok('Tamil name accepted',(await pg.textContent('#npName'))==='அம்மா');
 // mobile touch
 const mc=await br.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2}); await mc.route(/fonts\./,r=>r.abort()); const mp=await mc.newPage(); await mp.goto(B,{waitUntil:'networkidle'}); await mp.screenshot({path:OUT+'05-mobile.png'});
 ok('no horizontal overflow (mobile)',!(await mp.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2)));
 console.log(res.join('\n')); console.log('ERRORS',errs.length,errs.slice(0,5)); await br.close();
})();
