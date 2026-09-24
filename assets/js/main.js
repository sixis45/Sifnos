// Aggelis Villa Sifnos: small progressive enhancements. The page works without this file.

const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('[data-nav-toggle]');
const nav = document.getElementById('site-nav');

/* ---------- Header: solid background once the page is scrolled ---------- */

function updateHeader() {
  header.classList.toggle('is-scrolled', window.scrollY > 24);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

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

window.matchMedia('(min-width: 1120px)').addEventListener('change', (event) => {
  if (event.matches) setNavOpen(false);
});

/* ---------- Highlight the nav link for the section in view ---------- */

const navLinks = new Map(
  [...nav.querySelectorAll('.nav-list a[href^="#"]')].map((link) => [link.hash.slice(1), link]),
);

const sectionObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      for (const [id, link] of navLinks) link.classList.toggle('is-active', id === entry.target.id);
    }
  },
  { rootMargin: '-45% 0px -50% 0px' },
);

for (const id of navLinks.keys()) {
  const section = document.getElementById(id);
  if (section) sectionObserver.observe(section);
}

/* ---------- Gallery lightbox ---------- */

const dialog = document.querySelector('[data-lightbox-dialog]');
const dialogImg = document.createElement('img');
dialogImg.className = 'lightbox-img';
dialog.querySelector('.lightbox-figure').prepend(dialogImg);
const dialogCaption = dialog.querySelector('[data-lightbox-caption]');
const galleryLinks = [...document.querySelectorAll('[data-lightbox]')];
let current = 0;

function showPhoto(index) {
  current = (index + galleryLinks.length) % galleryLinks.length;
  const link = galleryLinks[current];
  const thumb = link.querySelector('img');
  const caption = link.closest('figure')?.querySelector('figcaption');
  dialogImg.src = link.href;
  dialogImg.alt = thumb.alt;
  dialogCaption.textContent = caption ? caption.textContent : '';
}

galleryLinks.forEach((link, index) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    showPhoto(index);
    dialog.showModal();
  });
});

dialog.querySelector('[data-lightbox-close]').addEventListener('click', () => dialog.close());
dialog.querySelector('[data-lightbox-prev]').addEventListener('click', () => showPhoto(current - 1));
dialog.querySelector('[data-lightbox-next]').addEventListener('click', () => showPhoto(current + 1));

dialog.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') showPhoto(current - 1);
  if (event.key === 'ArrowRight') showPhoto(current + 1);
});

// Close when clicking the dark area around the photo.
dialog.addEventListener('click', (event) => {
  if (event.target === dialog || event.target.classList.contains('lightbox-figure')) dialog.close();
});

// Swipe between photos on touch screens.
let touchStartX = null;
dialog.addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'touch') touchStartX = event.clientX;
});
dialog.addEventListener('pointerup', (event) => {
  if (touchStartX === null) return;
  const delta = event.clientX - touchStartX;
  touchStartX = null;
  if (Math.abs(delta) > 50) showPhoto(current + (delta < 0 ? 1 : -1));
});

dialog.addEventListener('close', () => {
  galleryLinks[current].focus();
});

/* ---------- Map: load Google Maps only when the visitor asks for it ---------- */

const mapButton = document.querySelector('[data-map-load]');

mapButton?.addEventListener('click', () => {
  const map = mapButton.closest('[data-map]');
  const iframe = document.createElement('iframe');
  iframe.src = 'https://www.google.com/maps?q=Aggelis%20Villa%20Sifnos&output=embed';
  iframe.title = 'Map showing the location of Aggelis Villa on Sifnos';
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'no-referrer-when-downgrade';
  iframe.allowFullscreen = true;
  map.replaceChildren(iframe);
});

/* ---------- Enquiry form: compose an email in the visitor's mail app ---------- */

const form = document.querySelector('[data-enquiry]');
const status = form.querySelector('[data-form-status]');
const arrival = form.elements.arrival;
const departure = form.elements.departure;

function isoDate(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function formatDate(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

arrival.min = isoDate(new Date());
departure.min = arrival.min;

arrival.addEventListener('change', () => {
  if (!arrival.value) return;
  const next = new Date(`${arrival.value}T12:00:00`);
  next.setDate(next.getDate() + 1);
  departure.min = isoDate(next);
  if (departure.value && departure.value < departure.min) departure.value = '';
});

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

/* ---------- Footer year ---------- */

document.querySelector('[data-year]').textContent = new Date().getFullYear();
