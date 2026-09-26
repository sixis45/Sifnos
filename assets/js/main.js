// Aggelis Villa Sifnos: small progressive enhancements. The page works without this file.

const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('[data-nav-toggle]');
const nav = document.getElementById('site-nav');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const scrollBehavior = () => (reducedMotion.matches ? 'auto' : 'smooth');

/* ---------- Photos: large size first, then the default size, then a local picture ---------- */

// Google-hosted photos take a size option such as "=w1600" at the end of the address.
const SIZE_OPTION = /=[\w-]+$/;

function useFallback(img) {
  const link = img.closest('a[data-lightbox]');
  const current = img.currentSrc || img.src;

  if (SIZE_OPTION.test(current) && !img.dataset.triedDefaultSize) {
    img.dataset.triedDefaultSize = 'true';
    img.removeAttribute('srcset');
    img.src = current.replace(SIZE_OPTION, '');
    if (link) link.href = link.href.replace(SIZE_OPTION, '');
    return;
  }

  const fallback = img.dataset.fallback;
  if (!fallback || img.dataset.failed) {
    img.hidden = true; // the frame behind it shows a soft pattern instead
    return;
  }
  img.dataset.failed = 'true';
  img.removeAttribute('srcset');
  img.src = fallback;
  if (link) link.href = fallback;
}

for (const img of document.querySelectorAll('img[src^="https://"]')) {
  img.addEventListener('error', () => useFallback(img));
  if (img.complete && img.naturalWidth === 0) useFallback(img);
}

/* ---------- Mobile navigation ---------- */

function setNavOpen(open) {
  navToggle.setAttribute('aria-expanded', String(open));
  header.classList.toggle('nav-open', open);
}

navToggle.addEventListener('click', () => {
  setNavOpen(navToggle.getAttribute('aria-expanded') !== 'true');
});

nav.addEventListener('click', (event) => {
  if (event.target.closest('a')) setNavOpen(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && header.classList.contains('nav-open')) {
    setNavOpen(false);
    navToggle.focus();
  }
});

document.addEventListener('click', (event) => {
  if (header.classList.contains('nav-open') && !header.contains(event.target)) setNavOpen(false);
});

window.matchMedia('(min-width: 1200px)').addEventListener('change', (event) => {
  if (event.matches) setNavOpen(false);
});

/* ---------- Highlight the menu and tab bar link for the section in view ---------- */

const sectionLinks = [...document.querySelectorAll('.nav-list a[href^="#"], .tabbar a[href^="#"]')];

const sectionObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      for (const link of sectionLinks) link.classList.toggle('is-active', link.hash === `#${entry.target.id}`);
    }
  },
  { rootMargin: '-45% 0px -50% 0px' },
);

for (const id of new Set(sectionLinks.map((link) => link.hash.slice(1)))) {
  const section = document.getElementById(id);
  if (section) sectionObserver.observe(section);
}

/* ---------- Horizontal swipe rows: keyboard-scrollable only when they overflow ---------- */

const scrollers = document.querySelectorAll('[data-scroller]');

function updateScrollers() {
  for (const el of scrollers) {
    if (el.scrollWidth > el.clientWidth + 1) el.tabIndex = 0;
    else el.removeAttribute('tabindex');
  }
}

updateScrollers();
window.addEventListener('resize', updateScrollers, { passive: true });

/* ---------- Hero slideshow ---------- */

const show = document.querySelector('[data-slideshow]');

if (show) {
  const slides = [...show.querySelectorAll('.hero-slide')];
  const dots = [...show.querySelectorAll('[data-slide-to]')];
  const captions = show.querySelectorAll('[data-slide-caption]');
  const captionIcons = show.querySelectorAll('[data-slide-icon]');
  const pauseButton = show.querySelector('[data-slide-pause]');
  const pauseLabel = show.querySelector('[data-slide-pause-label]');
  const DURATION = 8000; // time on each photo; the progress bar is a CSS animation of the same length
  const FADE = 1400; // must match --slide-fade in the CSS

  let current = 0;
  let timer = null;
  let remaining = DURATION;
  let startedAt = 0;
  let paused = reducedMotion.matches;
  let inView = true;
  let switchId = 0;

  show.style.setProperty('--slide-duration', `${DURATION}ms`);

  // Wait until the next photo is decoded so the crossfade never stalls (but never wait long).
  function ready(slide) {
    const img = slide.querySelector('img');
    if (!img || img.hidden || !img.decode) return Promise.resolve();
    return Promise.race([img.decode().catch(() => {}), new Promise((resolve) => setTimeout(resolve, 1500))]);
  }

  function activate(next) {
    const previous = slides[current];
    if (next !== current) {
      // The old photo stays fully visible underneath while the new one fades in on top.
      previous.classList.add('is-leaving');
      setTimeout(() => previous.classList.remove('is-leaving'), FADE + 100);
    }
    current = next;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
    dots.forEach((dot, i) => {
      dot.setAttribute('aria-current', String(i === current));
      dot.classList.toggle('is-done', i < current);
    });
    const { caption, icon } = slides[current].dataset;
    captions.forEach((el) => { el.textContent = caption; });
    captionIcons.forEach((el) => el.setAttribute('href', `#i-${icon}`));
  }

  function goTo(index) {
    const next = (index + slides.length) % slides.length;
    const id = ++switchId;
    clearTimeout(timer);
    timer = null;
    remaining = DURATION;
    if (next === current) {
      // Restart the progress bar on the same photo.
      dots[current].setAttribute('aria-current', 'false');
      void dots[current].offsetWidth;
      dots[current].setAttribute('aria-current', 'true');
      sync();
      return;
    }
    ready(slides[next]).then(() => {
      if (id !== switchId) return; // a newer switch has started
      activate(next);
      sync();
    });
  }

  // Run the timer only while playing, on screen and in a visible tab.
  function sync() {
    const run = !paused && inView && !document.hidden;
    show.classList.toggle('is-idle', !run);
    if (run && timer === null) {
      startedAt = performance.now();
      timer = setTimeout(() => {
        timer = null;
        goTo(current + 1);
      }, remaining);
    } else if (!run && timer !== null) {
      clearTimeout(timer);
      timer = null;
      remaining = Math.max(0, remaining - (performance.now() - startedAt));
    }
  }

  function setPaused(value) {
    paused = value;
    show.classList.toggle('is-paused', paused);
    pauseLabel.textContent = paused ? 'Play slideshow' : 'Pause slideshow';
    sync();
  }

  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
  pauseButton.addEventListener('click', () => setPaused(!paused));
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', (event) => { if (event.matches) setPaused(true); });

  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    sync();
  }).observe(show);

  // Swipe between slides on the phone photo card.
  const media = show.querySelector('.hero-media');
  let startX = null;
  media.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch') startX = event.clientX;
  });
  media.addEventListener('pointerup', (event) => {
    if (startX === null) return;
    const delta = event.clientX - startX;
    startX = null;
    if (Math.abs(delta) > 40) goTo(current + (delta < 0 ? 1 : -1));
  });

  activate(0);
  setPaused(paused);
}

/* ---------- Dates: no past dates, departure after arrival ---------- */

function isoDate(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function linkDates(arrival, departure) {
  arrival.min = isoDate(new Date());
  departure.min = arrival.min;
  arrival.addEventListener('change', () => {
    if (!arrival.value) return;
    const next = new Date(`${arrival.value}T12:00:00`);
    next.setDate(next.getDate() + 1);
    departure.min = isoDate(next);
    if (departure.value && departure.value < departure.min) departure.value = '';
  });
}

const booking = document.querySelector('[data-booking]');
const form = document.querySelector('[data-enquiry]');

linkDates(booking.elements.arrival, booking.elements.departure);
linkDates(form.elements.arrival, form.elements.departure);

/* ---------- Booking bar: carry the dates into the enquiry form ---------- */

booking.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(booking);
  if (data.get('arrival')) {
    form.elements.arrival.value = data.get('arrival');
    form.elements.arrival.dispatchEvent(new Event('change'));
  }
  if (data.get('departure') && data.get('departure') > form.elements.arrival.value) {
    form.elements.departure.value = data.get('departure');
  }
  form.elements.guests.value = data.get('guests') || '2';
  document.getElementById('contact').scrollIntoView({ behavior: scrollBehavior() });
  form.elements.name.focus({ preventScroll: true });
});

/* ---------- Enquiry form: compose an email in the visitor's mail app ---------- */

const status = form.querySelector('[data-form-status]');

function formatDate(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  const nights = Math.round(
    (new Date(`${data.get('departure')}T12:00:00`) - new Date(`${data.get('arrival')}T12:00:00`)) / 86400000,
  );

  const subject = `Enquiry: ${formatDate(data.get('arrival'))} – ${formatDate(data.get('departure'))}`;
  const body = [
    'Hello,',
    '',
    'I would like to ask about availability at Aggelis Villa.',
    '',
    `Name: ${data.get('name')}`,
    `Email: ${data.get('email')}`,
    `Arrival: ${formatDate(data.get('arrival'))}`,
    `Departure: ${formatDate(data.get('departure'))} (${nights} night${nights === 1 ? '' : 's'})`,
    `Guests: ${data.get('guests')}`,
    '',
    data.get('message') || '',
  ].join('\n');

  window.location.href =
    `mailto:info@aggelisvilla-sifnos.gr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.trim())}`;

  status.textContent = 'Your email app should now open with your enquiry. If it doesn’t, email us at info@aggelisvilla-sifnos.gr.';
});

/* ---------- Gallery lightbox ---------- */

const dialog = document.querySelector('[data-lightbox-dialog]');
const dialogImg = document.createElement('img');
dialogImg.className = 'lightbox-img';
dialogImg.referrerPolicy = 'no-referrer';
dialog.querySelector('.lightbox-figure').prepend(dialogImg);
const dialogCaption = dialog.querySelector('[data-lightbox-caption]');
const galleryLinks = [...document.querySelectorAll('[data-lightbox]')];
let currentPhoto = 0;

// If the large photo fails, try the default size, then the local picture for that tile.
dialogImg.addEventListener('error', () => {
  if (SIZE_OPTION.test(dialogImg.src)) {
    dialogImg.src = dialogImg.src.replace(SIZE_OPTION, '');
    return;
  }
  const fallback = galleryLinks[currentPhoto].querySelector('img').dataset.fallback;
  if (!fallback) return;
  const fallbackUrl = new URL(fallback, document.baseURI).href;
  if (dialogImg.src !== fallbackUrl) dialogImg.src = fallbackUrl;
});

function showPhoto(index) {
  currentPhoto = (index + galleryLinks.length) % galleryLinks.length;
  const link = galleryLinks[currentPhoto];
  const thumb = link.querySelector('img');
  dialogImg.src = thumb.hidden ? '' : link.href;
  dialogImg.alt = thumb.alt;
  dialogCaption.textContent = link.closest('figure')?.querySelector('.g-title')?.textContent ?? '';
}

galleryLinks.forEach((link, index) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    showPhoto(index);
    dialog.showModal();
  });
});

dialog.querySelector('[data-lightbox-close]').addEventListener('click', () => dialog.close());
dialog.querySelector('[data-lightbox-prev]').addEventListener('click', () => showPhoto(currentPhoto - 1));
dialog.querySelector('[data-lightbox-next]').addEventListener('click', () => showPhoto(currentPhoto + 1));

dialog.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') showPhoto(currentPhoto - 1);
  if (event.key === 'ArrowRight') showPhoto(currentPhoto + 1);
});

dialog.addEventListener('click', (event) => {
  if (event.target === dialog || event.target.classList.contains('lightbox-figure')) dialog.close();
});

let touchStartX = null;
dialog.addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'touch') touchStartX = event.clientX;
});
dialog.addEventListener('pointerup', (event) => {
  if (touchStartX === null) return;
  const delta = event.clientX - touchStartX;
  touchStartX = null;
  if (Math.abs(delta) > 50) showPhoto(currentPhoto + (delta < 0 ? 1 : -1));
});

dialog.addEventListener('close', () => galleryLinks[currentPhoto].focus());

/* ---------- Footer year ---------- */

document.querySelector('[data-year]').textContent = new Date().getFullYear();
