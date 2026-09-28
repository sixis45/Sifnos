// Builds the draft preview site into ./preview for GitHub Pages, Netlify or Cloudflare Pages:
// the English page (/) and Greek page (/el/) with a "Concept redesign" label and a no-index tag,
// plus security headers and hosting config. It regenerates the Greek page first.
//
//   npm run preview:build
//
// The gh-pages branch holds a copy of ./preview.

import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';

const OUT = 'preview';

// Security headers. Netlify and Cloudflare Pages both read this `_headers` file.
const CSP = [
  "default-src 'self'",
  "img-src 'self' data: https://lh3.googleusercontent.com",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "form-action 'self' mailto:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const HEADERS = `/*
  Content-Security-Policy: ${CSP}
  Referrer-Policy: strict-origin-when-cross-origin
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  X-Robots-Tag: noindex, nofollow

/assets/fonts/*
  Cache-Control: public, max-age=31536000, immutable
`;

const README = `# Aggelis Villa: hosted preview

Built by \`npm run preview:build\` from \`claude/aggelis-villa-modernize-ye670t\`. It is
published by GitHub Pages and can also be connected to Netlify or Cloudflare Pages
(no build command; publish this folder as it is). Edit the site on the work branch, not here.
`;

function replaceOnce(html, file, from, to) {
  if (!html.includes(from)) throw new Error(`Preview build: could not find "${from.slice(0, 60)}…" in ${file}`);
  return html.replace(from, to);
}

// Mark a page as a draft: no-index tag, a label in the hero and a note in the footer.
async function draftPage(file, { assets, familyPill, label, footerEnd, footerNote }) {
  let html = await readFile(file, 'utf8');
  html = replaceOnce(html, file,
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n  <meta name="robots" content="noindex, nofollow">');
  html = replaceOnce(html, file,
    `<link rel="stylesheet" href="${assets}css/styles.css">`,
    `<link rel="stylesheet" href="${assets}css/styles.css">\n  <style>.pill.pill-draft { border: 0; background: #ffdbcc; color: #713718; letter-spacing: 0.04em; text-transform: none; }</style>`);
  html = replaceOnce(html, file, familyPill, `${familyPill}\n            <span class="pill pill-draft">${label}</span>`);
  html = replaceOnce(html, file, footerEnd, footerEnd.replace('</p>', `&nbsp;· ${footerNote}</p>`));
  await writeFile(`${OUT}/${file}`, html);
}

// The Greek page is generated from the English one, so build it first.
await import('./build-greek.mjs');

await rm(OUT, { recursive: true, force: true });
await mkdir(`${OUT}/el`, { recursive: true });
await cp('assets', `${OUT}/assets`, { recursive: true });
await cp('en', `${OUT}/en`, { recursive: true }); // old /en/ address forwards to /

await draftPage('index.html', {
  assets: 'assets/',
  familyPill: '<span class="pill pill-family"><span class="pulse-dot" aria-hidden="true"></span>Family run</span>',
  label: 'Concept redesign&nbsp;· not the official site&nbsp;· AI photos',
  footerEnd: 'Artemonas, Sifnos, Greece</p>',
  footerNote: 'Concept redesign by <a href="https://matejdoljak.com/work/aggelis/">Matej Doljak</a>, not the villa’s official website',
});

await draftPage('el/index.html', {
  assets: '../assets/',
  familyPill: '<span class="pill pill-family"><span class="pulse-dot" aria-hidden="true"></span>Οικογενειακή φιλοξενία</span>',
  label: 'Πρόταση ανασχεδιασμού&nbsp;· όχι ο επίσημος ιστότοπος&nbsp;· φωτογραφίες AI',
  footerEnd: 'Αρτεμώνας, Σίφνος, Ελλάδα</p>',
  footerNote: 'Πρόταση ανασχεδιασμού από τον <a href="https://matejdoljak.com/work/aggelis/">Matej Doljak</a>, όχι ο επίσημος ιστότοπος της βίλας',
});

await writeFile(`${OUT}/_headers`, HEADERS);
// On the gh-pages branch the files are already built. Setting the command here overrides any
// build command typed into the Netlify dashboard, so a wrong setting can't break the deploy.
await writeFile(`${OUT}/netlify.toml`, '[build]\n  command = "echo Static site, nothing to build"\n  publish = "."\n');
await writeFile(`${OUT}/.nojekyll`, '');
await writeFile(`${OUT}/README.md`, README);

console.log(`Preview built in ./${OUT}`);
