(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const hero = document.querySelector('.hero');
  const editorial = document.querySelector('.editorial');
  const toggle = document.querySelector('#motion-toggle');
  let userPaused = false;
  let scheduled = false;
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const motionAllowed = () => !reduced.matches && !userPaused;
  document.documentElement.classList.add('motion-ready');

  function renderScroll() {
    scheduled = false;
    const root = document.documentElement;
    const max = root.scrollHeight - window.innerHeight;
    root.style.setProperty('--progress', max > 0 ? clamp(window.scrollY / max, 0, 1) : 0);
    if (!motionAllowed()) return;
    const heroRect = hero.getBoundingClientRect();
    if (heroRect.bottom > 0 && heroRect.top < window.innerHeight) {
      hero.style.setProperty('--hero-shift', clamp(-heroRect.top * .14, 0, 125) + 'px');
    }
    const rect = editorial.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      const progress = clamp((window.innerHeight - rect.top) / (rect.height + window.innerHeight), 0, 1);
      editorial.style.setProperty('--editorial-progress', progress.toFixed(3));
    }
  }
  function scheduleScroll() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(renderScroll);
  }
  window.addEventListener('scroll', scheduleScroll, {passive:true});
  window.addEventListener('resize', scheduleScroll, {passive:true});
  renderScroll();

  // Stagger peer elements; avoid delaying entire sections.
  document.querySelectorAll('.service-grid,.gallery-grid,.tips-grid').forEach(group => {
    group.querySelectorAll(':scope > .reveal').forEach((el,index) => {
      el.style.setProperty('--reveal-delay', (index % 3) * 95 + 'ms');
    });
  });

  const magnets = [...document.querySelectorAll('.hero .btn,.navcta,.editorial-link')];
  magnets.forEach(el => {
    el.addEventListener('pointermove', event => {
      if (!motionAllowed() || !finePointer.matches) return;
      const box=el.getBoundingClientRect();
      el.style.setProperty('--magnet-x', ((event.clientX-box.left-box.width/2)*.11)+'px');
      el.style.setProperty('--magnet-y', ((event.clientY-box.top-box.height/2)*.16)+'px');
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--magnet-x','0px');el.style.setProperty('--magnet-y','0px');
    });
  });
  document.querySelectorAll('.service,.request-card').forEach(el => {
    el.addEventListener('pointermove', event => {
      if (!motionAllowed() || !finePointer.matches) return;
      const box=el.getBoundingClientRect();
      const x=(event.clientX-box.left)/box.width;
      const y=(event.clientY-box.top)/box.height;
      el.style.setProperty('--pointer-x',(x*100)+'%');
      el.style.setProperty('--pointer-y',(y*100)+'%');
      el.style.setProperty('--tilt-x',((.5-y)*5)+'deg');
      el.style.setProperty('--tilt-y',((x-.5)*5)+'deg');
    },{passive:true});
    el.addEventListener('pointerleave',()=>{el.style.setProperty('--tilt-x','0deg');el.style.setProperty('--tilt-y','0deg');});
  });

  if ('IntersectionObserver' in window) {
    const links=[...document.querySelectorAll('.navlinks a')];
    const activeObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        links.forEach(link=>{
          const active=link.hash==='#'+entry.target.id;
          link.classList.toggle('is-active',active);
          if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
        });
      });
    },{rootMargin:'-20% 0px -55% 0px',threshold:0});
    links.forEach(link=>{const section=document.querySelector(link.hash);if(section)activeObserver.observe(section);});
  }

  // Native details remain usable without script; animate their content when motion is allowed.
  document.querySelectorAll('.tips details').forEach(details=>{
    details.addEventListener('toggle',()=>{
      if(!details.open || !motionAllowed())return;
      const p=details.querySelector('p');
      p.animate([{opacity:0,transform:'translateY(-7px)'},{opacity:1,transform:'translateY(0)'}],{duration:400,easing:'cubic-bezier(.16,1,.3,1)'});
    });
  });
  function updateMotion() {
    const paused=userPaused || reduced.matches;
    document.body.classList.toggle('motion-paused',paused);
    toggle.setAttribute('aria-pressed',String(paused));
    toggle.textContent=paused?'Animációk visszakapcsolása':'Kevesebb mozgás';
    if(paused)document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));
    scheduleScroll();
  }
  toggle.addEventListener('click',()=>{
    if(reduced.matches){toggle.textContent='A készülékeden csökkentett mozgás van beállítva';return;}
    userPaused=!userPaused;updateMotion();
  });
  reduced.addEventListener('change',updateMotion);
  updateMotion();
})();
