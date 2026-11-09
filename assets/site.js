const header = document.querySelector('header');
const nav = document.querySelector('.navlinks');
const menu = document.querySelector('.menu');
const mobile = window.matchMedia('(max-width: 900px)');
function closeMenu(returnFocus = false) {
  nav.classList.remove('open');
  header.classList.remove('menu-open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Menü megnyitása');
  menu.textContent = '☰';
  if (returnFocus) menu.focus();
}
menu.addEventListener('click', () => {
  if (nav.classList.contains('open')) return closeMenu();
  nav.classList.add('open');
  header.classList.add('menu-open');
  menu.setAttribute('aria-expanded', 'true');
  menu.setAttribute('aria-label', 'Menü bezárása');
  menu.textContent = '×';
  nav.querySelector('a').focus();
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeMenu()));
document.addEventListener('click', e => {
  if (nav.classList.contains('open') && !header.contains(e.target)) closeMenu();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && nav.classList.contains('open')) closeMenu(true);
});
mobile.addEventListener('change', () => closeMenu());
function updateHeader() { header.classList.toggle('scrolled', window.scrollY > 24); }
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('js');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  }), { threshold: 0.06 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
const ticker = document.querySelector('.ticker');
const tickerToggle = document.querySelector('.ticker-toggle');
tickerToggle.addEventListener('click', () => {
  const paused = ticker.classList.toggle('paused');
  tickerToggle.setAttribute('aria-pressed', String(paused));
  tickerToggle.setAttribute('aria-label', paused ? 'Futó felirat folytatása' : 'Futó felirat szüneteltetése');
  tickerToggle.textContent = paused ? '▷' : 'Ⅱ';
});

const dialog = document.querySelector('.lightbox');
const image = dialog.querySelector('img');
const originalLink = dialog.querySelector('a');
const counter = dialog.querySelector('.lightbox-counter');
const cards = [...document.querySelectorAll('.gallery-card')];
let galleryIndex = 0;
let galleryTrigger;
function showPhoto(index) {
  galleryIndex = (index + cards.length) % cards.length;
  const card = cards[galleryIndex];
  image.src = card.dataset.img;
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && !document.body.classList.contains('motion-paused')) image.animate([{opacity:.2,transform:'scale(.97)'},{opacity:1,transform:'scale(1)'}],{duration:350,easing:'cubic-bezier(.2,.7,.2,1)'});
  image.alt = card.querySelector('img').alt;
  originalLink.href = card.dataset.link;
  counter.textContent = `${galleryIndex + 1} / ${cards.length}`;
}
cards.forEach((card, index) => card.addEventListener('click', () => {
  galleryTrigger = card;
  showPhoto(index);
  dialog.showModal();
  document.body.style.overflow = 'hidden';
  dialog.querySelector('.lightbox-close').focus();
}));
dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
dialog.querySelector('.lightbox-prev').addEventListener('click', () => showPhoto(galleryIndex - 1));
dialog.querySelector('.lightbox-next').addEventListener('click', () => showPhoto(galleryIndex + 1));
dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
dialog.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    e.preventDefault();
    showPhoto(galleryIndex + (e.key === 'ArrowRight' ? 1 : -1));
  }
});
dialog.addEventListener('close', () => {
  document.body.style.overflow = '';
  image.removeAttribute('src');
  galleryTrigger?.focus();
});

const service = document.querySelector('#service-choice');
const message = document.querySelector('#request-message');
const status = document.querySelector('.request-status');
function updateRequest() {
  message.value = service.value
    ? `Szia Hanna! ${service.value} érdekelne. Tudnál szabad időpontokat és árat írni? Köszönöm!`
    : 'Szia Hanna! Szeretnék időpontot egyeztetni, és segítséget kérni a szolgáltatás kiválasztásában. Tudnál szabad időpontokat és árakat írni? Köszönöm!';
  status.textContent = '';
}
service.addEventListener('change', updateRequest);
document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => {
  service.value = link.dataset.service;
  updateRequest();
}));
message.addEventListener('input', () => { status.textContent = ''; });
document.querySelector('#copy-request').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(message.value);
    status.textContent = 'Az üzenetet kimásoltad. Most beillesztheted az Instagram-beszélgetésbe.';
  } catch {
    message.focus();
    message.select();
    status.textContent = 'Jelöld ki és másold ki az üzenetet, majd illeszd be Instagramon.';
  }
});

// Reveal additional photographs without leaving the page.
const morePhotos = document.querySelector('.gallery-load-more');
const photoCount = document.querySelector('.gallery-count');
morePhotos.addEventListener('click', () => {
  const next = cards.filter(card => card.hidden).slice(0, 6);
  next.forEach(card => { card.hidden = false; });
  photoCount.textContent = cards.filter(card => !card.hidden).length + ' / ' + cards.length + ' referenciafotó';
  if (next.length) next[0].focus({preventScroll: true});
  if (cards.every(card => !card.hidden)) morePhotos.hidden = true;
});
let touchStartX = 0;
let touchStartY = 0;
image.addEventListener('touchstart', event => {touchStartX=event.changedTouches[0].clientX;touchStartY=event.changedTouches[0].clientY;},{passive:true});
image.addEventListener('touchend', event => {
  const dx=event.changedTouches[0].clientX-touchStartX;
  const dy=event.changedTouches[0].clientY-touchStartY;
  if(Math.abs(dx)>55 && Math.abs(dx)>Math.abs(dy)*1.4) showPhoto(galleryIndex+(dx<0?1:-1));
},{passive:true});
