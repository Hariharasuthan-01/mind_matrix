'use strict';
// ===== Level data & helpers =====
const PTS=[100,100,100,150,150,150,150,150,150,200,200,300,300,300,500];
const near=a=>[a+1,a-1,a+2,a-2,a+3];
// Monotone path maze. rule 'even': path cells even, others odd. rule 'inc': path rises by st each step, no other cell fits.
function maze(box,n,rule,st,done){
 const p=[[0,0]];let r=0,c=0;while(r<n-1||c<n-1){if(r==n-1)c++;else if(c==n-1)r++;else if(Math.random()<.5)r++;else c++;p.push([r,c])}
 const v0=R(1,9),val=Array.from({length:n},()=>Array.from({length:n},()=>{if(rule=='even')return R(1,40)*2-1;let x;do{x=R(1,60)}while((x-v0)%st==0);return x}));
 p.forEach(([a,b],k)=>val[a][b]=rule=='even'?R(1,40)*2:v0+k*st);
 let cur=[0,0],cv=val[0][0];const seen=new Set([0]),g=div('grid');g.style.setProperty('--c',n);
 for(let i=0;i<n;i++)for(let j=0;j<n;j++){const tag=i+j==0?'<small>START</small>':(i==n-1&&j==n-1?'<small>EXIT</small>':'');
  const b=btn(`${val[i][j]}${tag}`,b=>{const k=i*n+j;if(seen.has(k))return;
   if(Math.abs(i-cur[0])+Math.abs(j-cur[1])!=1){toast('Move to a neighbouring cell');return}
   const good=rule=='even'?val[i][j]%2==0:val[i][j]==cv+st;
   if(!good){b.classList.add('badb');setTimeout(()=>b.classList.remove('badb'),500);bad();return}
   seen.add(k);b.classList.add('on');cur=[i,j];cv=val[i][j];if(i==n-1&&j==n-1)done()},'cell'+(i+j==0?' on':''));g.append(b)}
 box.append(g)}
// Fan triangle: apex + n base segments -> n(n+1)/2 triangles
const fan=n=>{let s='<svg viewBox="0 0 200 180" class="svg"><polygon points="100,10 10,170 190,170" class="sh"/>';for(let i=1;i<n;i++)s+=`<line x1="100" y1="10" x2="${10+180*i/n}" y2="170" class="sh"/>`;return s+'</svg>'};
const sqg=m=>{let s='<svg viewBox="0 0 200 200" class="svg"><rect x="10" y="10" width="180" height="180" class="sh"/>';for(let i=1;i<m;i++)s+=`<line x1="${10+180*i/m}" y1="10" x2="${10+180*i/m}" y2="190" class="sh"/><line x1="10" y1="${10+180*i/m}" x2="190" y2="${10+180*i/m}" class="sh"/>`;return s+'</svg>'};
const clk=t=>{const h=Math.floor(t/60)%12,m=t%60,P=(r,d)=>{const a=d*Math.PI/180;return[50+r*Math.sin(a),50-r*Math.cos(a)].map(x=>x.toFixed(1))};
 let s='<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" class="face"/>';
 for(let i=0;i<12;i++){const a=P(38,i*30),b=P(44,i*30);s+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="tk"/>`}
 [[12,0],[3,90],[6,180],[9,270]].forEach(([n,d])=>{const q=P(30,d);s+=`<text x="${q[0]}" y="${+q[1]+3.5}" class="nm">${n}</text>`});
 const hh=P(24,(h+m/60)*30),mm=P(36,m*6);return s+`<line x1="50" y1="50" x2="${hh[0]}" y2="${hh[1]}" class="hh"/><line x1="50" y1="50" x2="${mm[0]}" y2="${mm[1]}" class="mh"/></svg>`};
const tf=t=>`${(Math.floor(t/60)%12)||12}:${String(t%60).padStart(2,'0')}`;
// Memory: 3-2-1, show digits, hide, then type them (a miss costs a life and replays the same sequence)
async function memo(box,seq,secs,fin){const my=TOK,d=div('big');box.innerHTML='';box.append(d);
 for(let c=3;c>0;c--){d.textContent=c;snd(SND.cd);await sleep(700);if(my!=TOK)return}
 d.textContent=seq.join(' ');await sleep(secs*1000);if(my!=TOK)return;d.textContent='? '.repeat(seq.length);
 const pd=numpad(box,seq.length,v=>{if(v===seq.join(''))fin();else{bad();if(S.lives>0)memo(box,seq,secs,fin);else pd.reset()}})}
const gridVal=(A,b,dr,dc)=>A?(r,c)=>b+r*dr+c*dc:(r,c)=>(r+1)*(c+1)*dr;
// ===== Levels =====
function L1(box){const n=R(11,89),m=n+pick([-9,-5,-3,3,5,9]),k=R(0,24),g=div('grid');g.style.setProperty('--c',5);for(let i=0;i<25;i++)g.append(btn(i==k?m:n,b=>{if(i==k){b.classList.add('on');ok()}else{b.classList.add('badb');bad()}},'cell'));box.append(g)}
function L2(box){const T=[()=>{const d=R(2,6),x=R(1,15);return[0,1,2,3,4,5].map(k=>x+k*d)},
 ()=>{const a=R(2,5),b=R(6,9);let v=R(1,10);const r=[v];for(let k=0;k<5;k++){v+=k%2?b:a;r.push(v)}return r},
 ()=>{let v=R(1,5);const r=[v];for(let k=1;k<6;k++){v+=k;r.push(v)}return r}];
 rounds(box,3,(a,next,i)=>{const s=T[i](),h=R(2,5);const w=div('seq');s.forEach((v,k)=>w.append(div('num'+(k==h?' q':''),k==h?'?':v)));a.append(w);opts(a,s[h],near(s[h]),next)})}
function L3(box){box.append(div('sub','Hint: only EVEN numbers are safe. Tap neighbouring cells from START to EXIT.'));maze(box,5,'even',0,ok)}
function L4(box){rounds(box,3,(a,next,i)=>{const gen=ans=>()=>(ans+5*R(1,100))%720;let t,ans,wr,q;
 if(i==0){t=R(0,143)*5;ans=t;wr=[((t%60)/5%12)*60+(Math.floor(t/60)%12)*5,(t+60)%720,(t+5*R(1,10))%720];q=`Which clock shows <b>${tf(t)}</b>?`}
 else if(i==1){t=R(0,143)*5;const d=5*R(3,11);ans=(t+d)%720;wr=[(t-d+720)%720,(ans+5)%720,(ans+60)%720];q=`Which clock shows <b>${d} minutes AFTER ${tf(t)}</b>?`}
 else{t=R(0,143)*5;const d=5*R(5,14);ans=(t+3*d)%720;wr=[(t+2*d)%720,(t+4*d)%720,(ans+60)%720];q=`Clocks move by a fixed time. Which clock comes <b>next</b>?`;
  const w=div('opts');[0,1,2].forEach(k=>w.append(div('',clk((t+k*d)%720))));w.append(div('num q','?'));a.append(div('q',q),w);return opts(a,ans,wr,next,clk,gen(ans))}
 a.append(div('q',q));opts(a,ans,wr,next,clk,gen(ans))})}
function L5(box){const sz=[[3,4],[2,3],[5,6]];rounds(box,3,(a,next,i)=>{let n,ans;
 if(i==1){n=pick(sz[1]);ans=[...Array(n)].reduce((s,_,k)=>s+(k+1)*(k+1),0);a.append(div('q','How many squares of ANY size?'),div('',sqg(n)))}
 else{n=pick(sz[i]);ans=n*(n+1)/2;a.append(div('q','How many triangles can you find?'),div('',fan(n)))}
 opts(a,ans,near(ans),next)})}
function L6(box){const rep=(k,s)=>Array(k).fill(s).join(' '),rel=(l,r)=>`<div class="rel"><span>${l}</span><b>⚖️</b><span>${r}</span></div>`;
 rounds(box,2,(a,next,i)=>{if(i==0){const p=R(2,4),k=R(2,3);a.append(div('',rel('▲',rep(p,'●'))),div('q',`${rep(k,'▲')} balance how many ● ?`));opts(a,k*p,near(k*p),next)}
 else{const p=R(2,3),q=R(2,4),dv=[2,3,4,6,8,9,12].filter(d=>(p*q)%d==0&&d<p*q),r=pick(dv),ans=p*q/r;
  a.append(div('',rel('▲',rep(p,'●'))),div('',rel(rep(q,'▲'),rep(r,'■'))),div('q','One ■ balances how many ● ?'));opts(a,ans,near(ans),next)}})}
function L7(box){memo(box,Array.from({length:6},()=>R(1,9)),4,ok)}
function L8(box){const rs=shuf([0,1,2]);rounds(box,3,(a,next,i)=>{const k=rs[i],mk=()=>{if(k==0){const x=R(2,15);return[x,2*x,3*x]}if(k==1){const x=R(3,15),y=R(3,15);return[x,y,x+y]}const x=R(2,20),c=x+2*R(2,8);return[x,(x+c)/2,c]};
 const gs=[0,1,2,3].map(mk),f=R(0,3),ix=k==2?1:2;gs[f][ix]+=pick([-3,-2,-1,1,2,3]);a.append(div('q','Which group breaks the rule?'));
 const w=div('opts col');gs.forEach((g,j)=>w.append(btn(g.join('&nbsp;&nbsp;&nbsp;'),b=>{if(j==f){[...w.children].forEach(x=>x.disabled=true);b.classList.add('good');snd(SND.ok);next()}else{b.disabled=true;b.classList.add('badb');bad()}})));a.append(w)})}
function L9(box){const A=Math.random()<.5,f=gridVal(A,R(2,9),R(2,5),R(1,4)),hid=new Set(shuf([...Array(16).keys()]).slice(0,4)),ins=[],g=div('grid');g.style.setProperty('--c',4);
 for(let i=0;i<16;i++){const v=f(i>>2,i&3),c=div('cell fix');if(hid.has(i)){const e=document.createElement('input');e.type='number';e.inputMode='numeric';e.setAttribute('aria-label','missing number');c.append(e);ins.push([e,v])}else c.textContent=v;g.append(c)}
 box.append(div('sub','Rows and columns follow the same hidden steps. Fill the 4 empty cells.'),g,btn('CHECK',()=>{let all=true;ins.forEach(([e,v])=>{const right=+e.value===v&&e.value!=='';e.classList.toggle('wr',!right);if(!right)all=false});all?ok():bad()},'big'))}
function L10(box){box.append(div('sub','Find the single route from START to EXIT. Every step follows the same hidden jump.'));maze(box,6,'inc',R(3,7),ok)}
function L11(box){const rs=shuf([0,1,2,3,4]);rounds(box,3,(a,next,i)=>{const k=rs[i],d=R(2,5),rows=Array.from({length:4},()=>{const x=R(2,9),y=R(2,9);return[[x,2*x,3*x],[x,y,x+y],[R(2,6),R(2,5)],[x,2*x,4*x],[x,x+d,x+2*d]][k]});
 if(k==2)rows.forEach(r=>r.push(r[0]*r[1]));const ans=rows[3][2];a.append(div('q','Each row follows the same relationship. Find ?'));
 rows.forEach((r,j)=>{const w=div('rowx');r.forEach((v,c)=>w.append(div('num'+(j==3&&c==2?' q':''),j==3&&c==2?'?':v)));a.append(w)});
 opts(a,ans,[rows[3][0]+rows[3][1],rows[3][0]*rows[3][1],ans+1,ans-1,ans+2],next)})}
function L12(box){const p=shuf([0,1,2,3,4,5]),map=p.map(l=>[l,pick([0,1,2,3,4,5].filter(x=>x!=l))]),sw=Array(6).fill(0),tg=Array(6).fill(0);let moves=14;
 const calc=s=>{const l=Array(6).fill(0);s.forEach((on,i)=>{if(on)map[i].forEach(x=>l[x]^=1)});return l};
 do{const t=shuf([0,1,2,3,4,5]).slice(0,3),s=Array(6).fill(0);t.forEach(i=>s[i]=1);calc(s).forEach((v,i)=>tg[i]=v)}while(!tg.some(Boolean));
 const lamps=l=>l.map(v=>`<span class="lamp ${v?'on':''}">💡</span>`).join(''),tgEl=div('room'),nowEl=div('room'),swEl=div('room'),info=div('sub'),draw=()=>{nowEl.innerHTML=lamps(calc(sw));info.textContent=`Moves left: ${moves}`;[...swEl.children].forEach((b,i)=>b.classList.toggle('on',!!sw[i]))};
 tgEl.innerHTML=lamps(tg);sw.forEach((_,i)=>swEl.append(btn(`<div>${sw[i]?'ON':'OFF'}</div>🎚️<div>${i+1}</div>`,b=>{sw[i]^=1;b.firstChild.textContent=sw[i]?'ON':'OFF';moves--;draw();
  if(calc(sw).every((v,j)=>v==tg[j]))return ok();if(moves<=0){toast('Out of moves!','red');bad();sw.fill(0);moves=14;[...swEl.children].forEach(x=>x.firstChild.textContent='OFF');draw()}},'sw')));
 box.append(div('sub','Match the TARGET lights. Each switch secretly controls some lights.'),div('q','TARGET'),tgEl,div('q','NOW'),nowEl,swEl,info,btn('Reset switches',()=>{sw.fill(0);[...swEl.children].forEach(x=>x.firstChild.textContent='OFF');draw()}));draw()}
const okp=(g,i,d)=>{const r=i>>2,c=i&3;for(let k=0;k<4;k++)if(g[r*4+k]==d||g[k*4+c]==d)return false;const br=r&2,bc=c&2;for(let a=0;a<2;a++)for(let b=0;b<2;b++)if(g[(br+a)*4+bc+b]==d)return false;return true};
const cnt=g=>{const i=g.indexOf(0);if(i<0)return 1;let n=0;for(let d=1;d<=4;d++)if(okp(g,i,d)){g[i]=d;n+=cnt(g);g[i]=0;if(n>1)break}return n};
function sudo(){let g=[1,2,3,4,3,4,1,2,2,1,4,3,4,3,2,1];const d=shuf([1,2,3,4]);g=g.map(x=>d[x-1]);const bs=()=>{let o=shuf([0,1]).concat(shuf([2,3]));return Math.random()<.5?[o[2],o[3],o[0],o[1]]:o},rw=bs(),cl=bs();
 const sol=Array.from({length:16},(_,i)=>g[rw[i>>2]*4+cl[i&3]]),p=[...sol];shuf([...Array(16).keys()]).forEach(i=>{const s=p[i];p[i]=0;if(cnt([...p])!=1)p[i]=s});return{sol,p}}
function L13(box){const{sol,p}=sudo(),cur=[...p];let sel=-1;const g=div('grid'),cells=[];g.style.setProperty('--c',4);
 for(let i=0;i<16;i++){const b=btn(p[i]||'',()=>{if(p[i])return;cells.forEach(x=>x.classList.remove('sel'));sel=i;b.classList.add('sel')},'cell'+(p[i]?' fix':''));cells.push(b);g.append(b)}
 const nb=div('opts');[1,2,3,4].forEach(v=>nb.append(btn(v,()=>{if(sel<0||cur[sel]){toast('Pick an empty cell');return}
  if(sol[sel]!==v){cells[sel].classList.add('badb');const c=cells[sel];setTimeout(()=>c.classList.remove('badb'),500);bad();return}
  cur[sel]=v;cells[sel].textContent=v;cells[sel].classList.remove('sel');cells[sel].classList.add('on');sel=-1;if(cur.every(Boolean))ok()})));
 box.append(div('sub','Each row, column and 2×2 box must contain 1-4 once. Tap an empty cell, then a number.'),g,nb)}
function L14(box){const T=[()=>{const a=R(1,9),b=R(2,5),c=R(30,50),d=R(2,5);return Array.from({length:8},(_,k)=>k%2?c-d*(k>>1):a+b*(k>>1))},
 ()=>{let v=R(1,4);const s=R(1,4),r=[v];for(let k=1;k<7;k++){v=k%2?v*2:v+s;r.push(v)}return r},
 ()=>{let v=R(1,6);const r=[v];for(let k=1;k<7;k++){v+=2*k-1;r.push(v)}return r},
 ()=>{const r=[R(1,4),R(2,5)];for(let k=2;k<7;k++)r.push(r[k-1]+r[k-2]);return r},
 ()=>{let v=R(2,5);const r=[v];for(let k=1;k<6;k++){v=2*v-1;r.push(v)}return r}],ts=shuf([0,1,2,3,4]);
 rounds(box,2,(a,next,i)=>{const s=T[ts[i]](),h=s.length-1;a.append(div('q','Two hidden patterns… what comes next?'));const w=div('seq');s.forEach((v,k)=>w.append(div('num'+(k==h?' q':''),k==h?'?':v)));a.append(w);opts(a,s[h],[...near(s[h]),s[h]+R(3,9)],next)})}
function L15(box){const st=div('sub'),a=div();box.append(st,a);let X=0,M='';
 const gridStage=()=>{const b=R(10,18),dr=R(2,4),dc=R(1,3),h=R(0,15),f=gridVal(true,b,dr,dc);X=f(h>>2,h&3);const g=div('grid');g.style.setProperty('--c',4);
  for(let i=0;i<16;i++)g.append(div('cell fix',i==h?'?':f(i>>2,i&3)));a.append(div('q','Find the missing value (2 digits).'),g);const pd=numpad(a,2,v=>{if(+v==X)go(1);else{bad();pd.reset()}})};
 const S_=[gridStage,
 ()=>{a.append(div('q','DIGITAL LOCK: type the number you found, followed by its double.'));const pd=numpad(a,4,v=>{if(v===String(X)+String(2*X))go(2);else{bad();pd.reset()}})},
 ()=>{a.append(div('sub','Only EVEN numbers are safe. Reach the EXIT.'));maze(a,5,'even',0,()=>go(3))},
 ()=>{M=Array.from({length:4},()=>R(1,9)).join('');memo(a,M.split(''),3,()=>go(4))},
 ()=>{a.append(div('q','FINAL LOCK: stage-1 number, then the first two digits you memorized.'));const pd=numpad(a,4,v=>{if(v===String(X)+M.slice(0,2))ok();else{bad();pd.reset()}})}];
 function go(i){window.onkeydown=null;a.innerHTML='';st.textContent=`STAGE ${i+1} / 5`;if(i>0)toast('STAGE CLEARED','good');S_[i]()}go(0)}
const LV=[
{t:'NUMBER HUNT',d:'EASY',h:'Find the number that is different.',run:L1},
{t:'MISSING PATTERN',d:'EASY',h:'Find the missing number in the pattern.',run:L2},
{t:'NUMBER MAZE',d:'EASY',h:'Discover the safe path from START to EXIT.',run:L3},
{t:'CLOCK MASTER',d:'EASY → MEDIUM',h:'Read the clocks carefully.',run:L4},
{t:'SHAPE COUNT',d:'EASY → MEDIUM',h:'Count every hidden shape.',run:L5},
{t:'BALANCE THE SCALE',d:'EASY → MEDIUM',h:'Shapes have hidden weights. Reason it out.',run:L6},
{t:'NUMBER MEMORY',d:'MEDIUM',h:'Memorize the numbers, then type them.',run:L7},
{t:'THE FAKE NUMBER',d:'MEDIUM',h:'Find the group that doesn’t belong.',run:L8},
{t:'MAGIC GRID',d:'MEDIUM',h:'Complete the grid using its hidden rule.',run:L9},
{t:'ROUTE PUZZLE',d:'HARD',h:'Only one route follows the rule.',run:L10},
{t:'PATTERN BREAKER',d:'HARD',h:'Crack the relationship hidden in the rows.',run:L11},
{t:'SWITCH CHALLENGE',d:'VERY HARD',h:'Light up the target. Moves are limited.',run:L12},
{t:'MINI SUDOKU',d:'VERY HARD',h:'Complete the 4×4 logic grid.',run:L13},
{t:'IMPOSSIBLE SEQUENCE',d:'VERY HARD',h:'Wait… then it clicks.',run:L14},
{t:'MATH BOSS',d:'EXTREME',h:'Five stages stand between you and victory.',run:L15}];
