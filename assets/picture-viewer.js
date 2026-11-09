(() => {
  const poster = document.querySelector('#poster-viewer');
  const opener = document.querySelector('.about-poster-open');
  const zoom = poster.querySelector('.poster-zoom');
  const viewport = poster.querySelector('.poster-viewport');
  function fitPoster() {
    poster.classList.remove('is-zoomed');
    zoom.setAttribute('aria-pressed','false');
    zoom.textContent = 'Nagyítás +';
    viewport.scrollTo(0,0);
  }
  opener.addEventListener('click', () => {
    fitPoster();
    poster.showModal();
    document.body.style.overflow = 'hidden';
    poster.querySelector('.poster-close').focus();
  });
  zoom.addEventListener('click', () => {
    const zoomed = poster.classList.toggle('is-zoomed');
    zoom.setAttribute('aria-pressed',String(zoomed));
    zoom.textContent = zoomed ? 'Teljes kép −' : 'Nagyítás +';
    viewport.scrollTo(0,0);
  });
  poster.querySelector('.poster-close').addEventListener('click', () => poster.close());
  poster.addEventListener('click', event => { if(event.target === poster)poster.close(); });
  poster.addEventListener('close', () => {
    document.body.style.overflow = '';
    fitPoster();
    opener.focus({preventScroll:true});
  });
})();
