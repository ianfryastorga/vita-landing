/* ---------- nav scroll ---------- */
const nav=document.getElementById('nav');
const onScroll=()=>nav.classList.toggle('scrolled',window.scrollY>20);
onScroll();window.addEventListener('scroll',onScroll,{passive:true});
const _mb=document.getElementById('menuBtn');if(_mb)_mb.addEventListener('click',()=>{location.hash='#cycle';});

/* ---------- language switch ---------- */
(function(){
  const lang=document.getElementById('lang');
  const thumb=document.getElementById('lthumb');
  const btns=[...lang.querySelectorAll('button')];
  function place(b){thumb.style.width=b.offsetWidth+'px';thumb.style.transform=`translateX(${b.offsetLeft-3}px)`;}
  function apply(code){
    document.documentElement.lang=code;
    document.querySelectorAll('[data-en]').forEach(el=>{
      const v=el.getAttribute('data-'+code);if(v!=null)el.textContent=v;
    });
    document.querySelectorAll('[data-en-html]').forEach(el=>{
      const v=el.getAttribute('data-'+code+'-html');if(v!=null)el.innerHTML=v;
    });
    btns.forEach(b=>b.classList.toggle('on',b.dataset.lang===code));
    const active=btns.find(b=>b.dataset.lang===code);active&&place(active);
    try{localStorage.setItem('vita-lang',code);}catch(e){}
  }
  btns.forEach(b=>b.addEventListener('click',()=>apply(b.dataset.lang)));
  let saved='en';try{saved=localStorage.getItem('vita-lang')||'en';}catch(e){}
  const init=()=>apply(saved);
  if(document.fonts&&document.fonts.ready){document.fonts.ready.then(()=>{const a=btns.find(b=>b.classList.contains('on'));a&&place(a);});}
  requestAnimationFrame(init);
  window.addEventListener('resize',()=>{const a=btns.find(b=>b.classList.contains('on'));a&&place(a);});
})();

/* ---------- who toggle ---------- */
(function(){
  const seg=document.getElementById('seg');
  if(!seg)return;
  const thumb=document.getElementById('segThumb');
  const btns=[...seg.querySelectorAll('button')];
  const states=[...document.querySelectorAll('.who-state')];
  function place(b){thumb.style.width=b.offsetWidth+'px';thumb.style.transform=`translateX(${b.offsetLeft-5}px)`;}
  function set(i){btns.forEach((b,j)=>b.classList.toggle('active',j===i));states.forEach((s,j)=>s.classList.toggle('on',j===i));place(btns[i]);}
  btns.forEach((b,i)=>b.addEventListener('click',()=>set(i)));
  const init=()=>place(btns[0]);
  if(document.fonts&&document.fonts.ready){document.fonts.ready.then(init);}
  requestAnimationFrame(init);
  window.addEventListener('resize',()=>{const a=seg.querySelector('button.active');a&&place(a);});
  // reposition the thumb when language changes (button widths differ between ES/EN)
  document.querySelectorAll('.lang button').forEach(b=>b.addEventListener('click',()=>setTimeout(()=>{const a=seg.querySelector('button.active');a&&place(a);},60)));
})();

/* ---------- count up ---------- */
function countUp(el){
  if(el.dataset.done)return;el.dataset.done='1';
  const to=parseFloat(el.dataset.countTo);const suf=el.dataset.suffix||'';
  const dur=1300;const t0=performance.now();
  function tick(t){
    const p=Math.min(1,(t-t0)/dur);const e=1-Math.pow(1-p,3);
    el.textContent=Math.round(to*e)+suf;
    if(p<1)requestAnimationFrame(tick);else el.textContent=to+suf;
  }
  requestAnimationFrame(tick);
}

/* ---------- reveal + cycle draw + counters (rect-based, reliable) ---------- */
(function(){
  const items=[...document.querySelectorAll('.reveal')];
  const rail=document.getElementById('cycleRail');
  const counters=[...document.querySelectorAll('.countup')];
  function show(el){
    if(el.classList.contains('in'))return;
    const sibs=[...el.parentElement.querySelectorAll(':scope > .reveal')];
    const idx=Math.max(0,sibs.indexOf(el));
    el.style.transitionDelay=(idx*80)+'ms';
    el.classList.add('in');
  }
  function check(){
    const vh=window.innerHeight||document.documentElement.clientHeight;
    items.forEach(el=>{const r=el.getBoundingClientRect();if(r.top<vh*0.9&&r.bottom>0)show(el);});
    if(rail){const r=rail.getBoundingClientRect();if(r.top<vh*0.82&&r.bottom>0)rail.classList.add('drawn');}
    counters.forEach(el=>{const r=el.getBoundingClientRect();if(r.top<vh*0.92&&r.bottom>0)countUp(el);});
  }
  check();
  window.addEventListener('scroll',check,{passive:true});
  window.addEventListener('resize',check);
  window.addEventListener('load',check);
  setTimeout(()=>{items.forEach(show);if(rail)rail.classList.add('drawn');counters.forEach(countUp);document.body.classList.add('reveal-done');},2400);
})();


/* ---------- FAQ accordion ---------- */
(function(){
  const items=[...document.querySelectorAll('.faq-item')];
  items.forEach(it=>{
    const q=it.querySelector('.faq-q');
    if(!q)return;
    q.addEventListener('click',()=>{
      const open=it.classList.contains('open');
      items.forEach(o=>o.classList.remove('open'));
      if(!open)it.classList.add('open');
    });
  });
  // open the first question by default
  if(items[0])items[0].classList.add('open');
})();
