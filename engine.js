'use strict';
// ===== Utilities =====
const $=s=>document.querySelector(s),R=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pick=a=>a[R(0,a.length-1)];
const shuf=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=R(0,i);[a[i],a[j]]=[a[j],a[i]]}return a},sleep=ms=>new Promise(r=>setTimeout(r,ms));
const div=(c='',h='')=>{const d=document.createElement('div');d.className=c;d.innerHTML=h;return d};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// ===== Game state =====
const S={playerName:'',currentLevel:1,score:0,lives:3,timeRemaining:900,soundEnabled:true,levelCompleted:0,gameStarted:false};
let busy=false,run=false,TOK=0,lvlStart=0,AC;const main=$('#main');
const save=()=>{try{if(S.gameStarted)localStorage.setItem('mm',JSON.stringify(S))}catch(e){}};
const load=()=>{try{const v=JSON.parse(localStorage.getItem('mm'));return v&&v.gameStarted&&v.currentLevel>=1&&v.currentLevel<=15?v:null}catch(e){return null}};
const wipe=()=>{try{localStorage.removeItem('mm')}catch(e){}};
// ===== Sound (Web Audio, no files) =====
const SND={click:[[500,.05]],ok:[[600,.1],[900,.15]],bad:[[200,.2,'sawtooth'],[140,.25,'sawtooth']],up:[[500,.1],[700,.1],[900,.2]],cd:[[700,.1,'square']],win:[[500,.12],[600,.12],[700,.12],[900,.12],[1200,.5]]};
function snd(seq){if(!S.soundEnabled)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();let t=AC.currentTime;seq.forEach(([f,d,ty])=>{const o=AC.createOscillator(),g=AC.createGain();o.type=ty||'sine';o.frequency.value=f;g.gain.setValueAtTime(.07,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d);t+=d*.8})}catch(e){}}
// ===== Effects =====
function toast(t,c=''){const e=div('toast '+c,t);$('#fx').append(e);setTimeout(()=>e.remove(),1100)}
function flash(){const e=$('#flash');e.className='';void e.offsetWidth;e.className='red'}
function confetti(n){for(let i=0;i<n;i++){const e=document.createElement('i');e.className='cf';e.style.cssText=`left:${R(0,100)}vw;background:hsl(${R(0,360)},90%,60%);animation-duration:${R(15,35)/10}s;animation-delay:${R(0,5)/10}s`;$('#fx').append(e);setTimeout(()=>e.remove(),4200)}}
function banner(t){const o=$('#ov');o.textContent=t;o.className='ov show';setTimeout(()=>o.className='ov',1200)}
// ===== HUD =====
function hud(){const t=Math.max(0,S.timeRemaining);$('#hud').hidden=!S.gameStarted;$('#lv').textContent=`LEVEL ${S.currentLevel} / 15`;$('#tm').textContent=`${String(t/60|0).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;$('#tm').classList.toggle('low',t<60);$('#lives').textContent='❤️'.repeat(Math.max(0,S.lives))+'🖤'.repeat(Math.max(0,3-S.lives));$('#sc').textContent=S.score;$('#bar').style.width=(S.levelCompleted/15*100)+'%';$('#snd').textContent=S.soundEnabled?'🔊 ON':'🔇 OFF'}
// Global clock: only runs while a level is being played
setInterval(()=>{if(!run||!S.gameStarted)return;S.timeRemaining--;hud();if(S.timeRemaining%5==0)save();if(S.timeRemaining<=0){run=false;busy=true;over('time')}},1000);
// ===== Reusable widgets =====
function btn(t,f,c=''){const b=document.createElement('button');b.className='btn '+c;b.innerHTML=t;b.onclick=()=>{if(busy)return;snd(SND.click);f(b)};return b}
// Run n sub-rounds, then complete the level
function rounds(box,n,fn){let i=0;const info=div('sub'),area=div();box.append(info,area);(function go(){if(i>=n)return ok();info.textContent=`Round ${i+1} / ${n}`;area.innerHTML='';fn(area,()=>{i++;setTimeout(go,350)},i)})()}
// 4 multiple-choice buttons with exactly one correct answer
function opts(box,ans,list,next,fmt=x=>x,gen){const s=[ans];list.forEach(v=>{if(!s.includes(v))s.push(v)});gen=gen||(()=>Math.max(1,ans+R(-8,8)));let g=0;while(s.length<4&&g++<300){const v=gen();if(!s.includes(v))s.push(v)}
 const w=div('opts');shuf(s.slice(0,4)).forEach(v=>w.append(btn(fmt(v),b=>{if(v===ans){[...w.children].forEach(x=>x.disabled=true);b.classList.add('good');snd(SND.ok);next()}else{b.disabled=true;b.classList.add('badb');bad()}})));box.append(w)}
function numpad(box,len,cb){let v='';const d=div('disp'),g=div('pad');const u=()=>d.textContent=(v+'_'.repeat(len-v.length)).split('').join(' ');
 const add=x=>{if(!busy&&v.length<len){v+=x;u()}},del=()=>{v=v.slice(0,-1);u()},go=()=>{if(v.length==len&&!busy)cb(v)};
 [1,2,3,4,5,6,7,8,9].forEach(x=>g.append(btn(x,()=>add(x))));g.append(btn('⌫',del),btn(0,()=>add(0)),btn('OK',go,'pri'));box.append(d,g);u();
 window.onkeydown=e=>{if(/^\d$/.test(e.key))add(e.key);else if(e.key=='Backspace')del();else if(e.key=='Enter')go()};return{reset(){v='';u()}}}
// ===== Flow =====
function menu(){run=false;TOK++;busy=false;window.onkeydown=null;hud();const sv=load();
 main.innerHTML=`<div class="card"><h1>MATH MIND</h1><h3>15 LEVEL BRAIN CHALLENGE</h3><p class="quote">“Think Fast. Think Smart. Escape the Final Level.”</p><p class="sub">Your calculator won’t save you.</p><input id="nm" maxlength="14" placeholder="ENTER YOUR NAME" aria-label="Your name"><div><button class="btn big" id="go">▶ START GAME</button>${sv?'<button class="btn" id="cont">CONTINUE GAME</button>':''}<button class="btn" id="how">How To Play</button></div></div>`;
 $('#nm').value=S.playerName;$('#go').onclick=()=>{snd(SND.click);newGame($('#nm').value.trim()||'Player')};$('#how').onclick=how;
 if(sv)$('#cont').onclick=()=>{snd(SND.click);Object.assign(S,sv);S.gameStarted=true;intro()}}
function newGame(name){Object.assign(S,{playerName:name,currentLevel:1,score:0,lives:3,timeRemaining:900,levelCompleted:0,gameStarted:true});save();intro()}
function how(){const m=$('#modal');m.hidden=false;m.innerHTML=`<div class="card"><h2>How To Play</h2><ul style="line-height:1.8"><li>Complete all 15 levels.</li><li>Use your brain instead of calculations.</li><li>You have 3 lives (❤️❤️❤️).</li><li>The 15-minute clock is running during levels.</li><li>Wrong answers can cost lives.</li><li>Each level becomes harder.</li><li>Level 15 is the final boss.</li></ul><button class="btn big" id="gi">GOT IT</button></div>`;$('#gi').onclick=()=>m.hidden=true}
function intro(){run=false;TOK++;busy=false;window.onkeydown=null;hud();const n=S.currentLevel,L=LV[n-1];
 main.innerHTML=`<div class="card intro ${n==15?'boss':''}"><div class="big">LEVEL ${n}</div><h2>${L.t}</h2><p><b>DIFFICULTY: ${L.d}</b></p><p>“${L.h}”</p><button class="btn big" id="st">START</button></div>`;
 if(n==15)snd(SND.bad);$('#st').onclick=()=>{snd(SND.click);play()};save()}
function play(){TOK++;busy=false;run=true;window.onkeydown=null;lvlStart=Date.now();const L=LV[S.currentLevel-1];
 main.innerHTML=`<div class="card"><h2>${L.t}</h2><p class="hint">${L.h}</p><div id="box"></div></div>`;try{L.run($('#box'))}catch(e){console.error(e)}}
function bad(){if(busy||!run)return;snd(SND.bad);const c=$('.card');c.classList.remove('shake');void c.offsetWidth;c.classList.add('shake');flash();toast('✖ WRONG  −1 ❤️','red');S.lives--;hud();save();if(S.lives<=0){busy=true;run=false;setTimeout(()=>over('lives'),700)}}
function ok(){if(busy||!run)return;busy=true;run=false;const n=S.currentLevel,gain=PTS[n-1]+Math.max(0,Math.round(30-(Date.now()-lvlStart)/1000))*2;
 S.score+=gain;S.levelCompleted=n;snd(SND.ok);toast(`✔ +${gain}`,'good');confetti(24);hud();save();
 if(n==15)return void setTimeout(win,900);
 setTimeout(async()=>{S.currentLevel++;hud();save();banner(`LEVEL ${S.currentLevel} UNLOCKED`);snd(SND.up);await sleep(1300);intro()},1000)}
const stats=()=>`<div class="stats"><div>FINAL SCORE<b>${S.score}</b></div><div>TIME REMAINING<b>${String(Math.max(0,S.timeRemaining)/60|0).padStart(2,'0')}:${String(Math.max(0,S.timeRemaining)%60).padStart(2,'0')}</b></div><div>LIVES REMAINING<b>${Math.max(0,S.lives)}</b></div><div>LEVEL REACHED<b>${S.currentLevel} / 15</b></div></div>`;
function win(){S.score+=Math.max(0,S.lives)*100;S.gameStarted=false;wipe();hud();$('#hud').hidden=true;snd(SND.win);
 const m=S.lives==3&&S.timeRemaining>300?'Flawless. A true genius mind!':S.lives>=2?'Brilliant thinking under pressure!':'You survived — sharp and stubborn!';
 main.innerHTML=`<div class="card"><h1>🏆</h1><h2>MATH MIND MASTER</h2><p>“You defeated all 15 levels.”</p><h3>${esc(S.playerName)}</h3>${stats()}<p><b>15 / 15 LEVELS COMPLETED</b></p><p>${m}</p><button class="btn big" id="pa">PLAY AGAIN</button><button class="btn" id="mm">MAIN MENU</button></div>`;
 $('#pa').onclick=()=>newGame(S.playerName);$('#mm').onclick=menu;for(let i=0;i<6;i++)setTimeout(()=>confetti(40),i*600)}
function over(why){run=false;busy=true;S.gameStarted=false;wipe();$('#hud').hidden=true;snd(SND.bad);
 main.innerHTML=`<div class="card"><h1 style="font-size:clamp(34px,10vw,56px)">GAME OVER</h1><p>${why=='time'?'⏰ Time ran out!':'💔 No lives left!'}</p>${stats()}<button class="btn big" id="pa">PLAY AGAIN</button><button class="btn" id="rl">RESTART LEVEL</button><button class="btn" id="mm">MAIN MENU</button></div>`;
 $('#pa').onclick=()=>newGame(S.playerName||'Player');$('#mm').onclick=menu;
 $('#rl').onclick=()=>{S.lives=3;S.timeRemaining=Math.max(S.timeRemaining,180);S.gameStarted=true;save();intro()}}
