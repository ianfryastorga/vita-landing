/* ---------- nav scroll ---------- */
(function(){
  const nav=document.getElementById('nav');
  if(!nav)return;
  const onScroll=()=>nav.classList.toggle('scrolled',window.scrollY>20);
  onScroll();window.addEventListener('scroll',onScroll,{passive:true});
})();

/* ---------- mobile menu ---------- */
(function(){
  const btn=document.getElementById('menuBtn');
  if(!btn)return;
  const close=()=>{document.body.classList.remove('menu-open');btn.setAttribute('aria-expanded','false');};
  btn.addEventListener('click',()=>{
    const open=document.body.classList.toggle('menu-open');
    btn.setAttribute('aria-expanded',open?'true':'false');
  });
  document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',close));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
})();

/* ---------- remember the chosen language ---------- */
(function(){
  document.querySelectorAll('.lang a[hreflang]').forEach(a=>{
    a.addEventListener('click',()=>{try{localStorage.setItem('vita-lang',a.getAttribute('hreflang'));}catch(e){}});
  });
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

/* ---------- reveal + cycle draw + counters ---------- */
(function(){
  const items=[...document.querySelectorAll('.reveal')];
  const rail=document.getElementById('cycleRail');
  const counters=[...document.querySelectorAll('.countup')];
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function show(el){
    if(el.classList.contains('in'))return;
    const sibs=[...el.parentElement.querySelectorAll(':scope > .reveal')];
    const idx=Math.max(0,sibs.indexOf(el));
    el.style.transitionDelay=(idx*55)+'ms';
    el.classList.add('in');
  }
  if(reduce){
    items.forEach(el=>el.classList.add('in'));
    if(rail)rail.classList.add('drawn');
    counters.forEach(el=>{el.textContent=el.dataset.countTo+(el.dataset.suffix||'');});
    document.body.classList.add('reveal-done');
    return;
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
  function set(it,open){
    it.classList.toggle('open',open);
    const q=it.querySelector('.faq-q');
    if(q)q.setAttribute('aria-expanded',open?'true':'false');
  }
  items.forEach(it=>{
    const q=it.querySelector('.faq-q');
    if(!q)return;
    q.addEventListener('click',()=>{
      const open=it.classList.contains('open');
      items.forEach(o=>set(o,false));
      if(!open)set(it,true);
    });
  });
  if(items[0])set(items[0],true);
})();

/* ---------- demo request flow ---------- */
(function(){
  const root=document.getElementById('agenda');
  if(!root)return;

  /* Leads go to Web3Forms. If the request fails we fall back to a pre-filled email. */
  const ENDPOINT='https://api.web3forms.com/submit';
  const ACCESS_KEY='3136ad2e-93dd-4b4e-9176-031f63e3e43a';
  const FALLBACK_EMAIL='hola@vita.lat';

  const form=document.getElementById('dmForm');
  const steps=[...form.querySelectorAll('.dm-step')];
  const bar=document.getElementById('dmBar');
  const count=document.getElementById('dmCount');
  const nav=document.getElementById('dmNav');
  const back=document.getElementById('dmBack');
  const next=document.getElementById('dmNext');
  const isES=document.documentElement.lang.startsWith('es');
  const answers={};
  const last=steps.length-1;
  let i=0,sent=false,opener=null;

  const t=(es,en)=>isES?es:en;

  function render(){
    steps.forEach((s,n)=>s.classList.toggle('on',n===i));
    const step=steps[i];
    const end=step.dataset.mode==='end';
    nav.hidden=end;
    back.hidden=i===0||end;
    bar.style.width=(end?100:(i/last)*100)+'%';
    count.textContent=end?'':t('Paso ','Step ')+(i+1)+t(' de ',' of ')+last;
    next.classList.toggle('is-ready',ready());
    if(step.dataset.mode==='form')next.innerHTML=t('Enviar','Send');
    else next.innerHTML=t('Continuar','Continue')+' <span class="arr">&rarr;</span>';
    const focusable=step.querySelector('.dm-opt,input,textarea,button');
    if(focusable)setTimeout(()=>focusable.focus({preventScroll:true}),60);
    root.querySelector('.dm-panel').scrollTop=0;
  }

  function ready(){
    const step=steps[i];
    if(step.dataset.mode==='form')return true;
    if(step.dataset.mode==='end')return true;
    const v=answers[step.dataset.key];
    return Array.isArray(v)?v.length>0:!!v;
  }

  function validate(){
    const step=steps[i];
    if(step.dataset.mode!=='form'){
      if(!ready()){step.classList.add('shake');setTimeout(()=>step.classList.remove('shake'),400);return false}
      return true;
    }
    let ok=true;
    step.querySelectorAll('input[required]').forEach(inp=>{
      const v=inp.value.trim();
      const good=inp.type==='email'?/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
        :inp.type==='tel'?v.replace(/\D/g,'').length>=8
        :inp.name==='instagram'?/^@?[\w.]{2,}$|instagram\.com\//i.test(v)
        :v.length>1;
      inp.closest('.dm-field').classList.toggle('bad',!good);
      if(!good&&ok){inp.focus();ok=false}
    });
    return ok;
  }

  function collect(){
    const data={};
    steps.forEach(s=>{const k=s.dataset.key;if(answers[k]!=null)data[k]=answers[k]});
    form.querySelectorAll('input,textarea').forEach(f=>{if(f.value.trim())data[f.name]=f.value.trim()});
    if(data.instagram&&!/instagram\.com/i.test(data.instagram))data.instagram='@'+data.instagram.replace(/^@/,'');
    data.idioma=isES?'es':'en';
    data.origen=location.href;
    return data;
  }

  function labelFor(k){
    const map={tipo:t('Tipo de centro','Center type'),sedes:t('Sedes','Locations'),clientes:t('Clientes activos','Active clients'),
      dolores:t('Le quita tiempo','Time sinks'),actual:t('Usa hoy','Uses today'),nombre:t('Nombre','Name'),
      centro:t('Centro','Center'),instagram:'Instagram',email:'Email',whatsapp:'WhatsApp',nota:t('Nota','Note')};
    return map[k]||k;
  }

  async function submit(){
    if(sent)return;
    sent=true;
    next.disabled=true;
    next.textContent=t('Enviando…','Sending…');
    const data=collect();
    let delivered=false;
    if(ENDPOINT&&ACCESS_KEY){
      const payload={access_key:ACCESS_KEY,subject:t('Nueva solicitud de demo — ','New demo request — ')+(data.centro||data.nombre||'Vita'),
        from_name:'Landing Vita',botcheck:''};
      Object.keys(data).forEach(k=>{payload[labelFor(k)]=Array.isArray(data[k])?data[k].join(', '):data[k]});
      try{
        const r=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload)});
        const j=await r.json().catch(()=>({}));
        delivered=r.ok&&j.success!==false;
      }catch(e){delivered=false}
    }
    if(!delivered){
      const body=Object.keys(data).filter(k=>k!=='origen'&&k!=='idioma')
        .map(k=>labelFor(k)+': '+(Array.isArray(data[k])?data[k].join(', '):data[k])).join('\n');
      const subject=t('Solicitud de demo — ','Demo request — ')+(data.centro||data.nombre||'Vita');
      window.location.href='mailto:'+FALLBACK_EMAIL+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
      const msg=document.getElementById('dmDoneMsg');
      if(msg)msg.textContent=t('Abrimos tu correo con la solicitud lista para enviar. Apenas la mandes, te escribimos dentro de un día hábil.',
        'We opened your email client with the request ready to send. Once you send it, we reply within one business day.');
    }
    next.disabled=false;
    i=last;render();
  }

  function go(n){
    if(n>i&&!validate())return;
    i=Math.max(0,Math.min(last,n));
    if(steps[i].dataset.mode==='end'&&!sent){submit();return}
    render();
  }

  form.querySelectorAll('.dm-opt').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const step=btn.closest('.dm-step');
      const key=step.dataset.key;
      if(step.dataset.mode==='multi'){
        const set=answers[key]=answers[key]||[];
        const v=btn.dataset.value;
        const at=set.indexOf(v);
        if(at>-1)set.splice(at,1);else set.push(v);
        btn.classList.toggle('on',at===-1);
        next.classList.toggle('is-ready',ready());
      }else{
        answers[key]=btn.dataset.value;
        step.querySelectorAll('.dm-opt').forEach(o=>o.classList.toggle('on',o===btn));
        setTimeout(()=>go(i+1),190);
      }
    });
  });

  form.querySelectorAll('.dm-field input').forEach(inp=>{
    inp.addEventListener('input',()=>inp.closest('.dm-field').classList.remove('bad'));
  });
  form.addEventListener('submit',e=>{e.preventDefault();go(i+1)});
  form.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&e.target.tagName!=='TEXTAREA'){e.preventDefault();go(i+1)}
  });

  next.addEventListener('click',()=>go(i+1));
  back.addEventListener('click',()=>go(i-1));

  function open(trigger){
    opener=trigger||null;
    root.hidden=false;
    document.body.classList.add('dm-open');
    document.body.classList.remove('menu-open');
    requestAnimationFrame(()=>root.classList.add('in'));
    render();
  }
  function close(){
    root.classList.remove('in');
    document.body.classList.remove('dm-open');
    setTimeout(()=>{root.hidden=true},200);
    if(opener)opener.focus({preventScroll:true});
    if(location.hash==='#agenda')history.replaceState(null,'',location.pathname);
  }

  document.querySelectorAll('[data-demo]').forEach(a=>{
    a.addEventListener('click',e=>{e.preventDefault();open(a)});
  });
  root.querySelectorAll('[data-dm-close]').forEach(b=>b.addEventListener('click',close));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!root.hidden)close()});
  root.addEventListener('keydown',e=>{
    if(e.key!=='Tab')return;
    const f=[...root.querySelectorAll('button:not([hidden]),input,textarea,a[href]')].filter(el=>el.offsetParent!==null);
    if(!f.length)return;
    const first=f[0],lastEl=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();lastEl.focus()}
    else if(!e.shiftKey&&document.activeElement===lastEl){e.preventDefault();first.focus()}
  });
  if(location.hash==='#agenda')open(null);
})();
