// Builds the draft preview site into ./preview for GitHub Pages, Netlify or Cloudflare Pages:
// the site files plus a "Draft preview" label, a no-index tag, security headers and hosting config.
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

const ROOT_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <meta http-equiv="refresh" content="0; url=en/">
  <title>Aggelis Villa Sifnos</title>
</head>
<body>
  <p><a href="en/">Aggelis Villa Sifnos (English)</a></p>
</body>
</html>
`;

const README = `# Aggelis Villa: hosted preview

Built by \`npm run preview:build\` from \`claude/aggelis-villa-modernize-ye670t\`. It is
published by GitHub Pages and can also be connected to Netlify or Cloudflare Pages
(no build command; publish this folder as it is). Edit the site on the work branch, not here.
`;

function replaceOnce(html, from, to) {
  if (!html.includes(from)) throw new Error(`Preview build: could not find "${from.slice(0, 60)}…" in en/index.html`);
  return html.replace(from, to);
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT);
await cp('en', `${OUT}/en`, { recursive: true });
await cp('assets', `${OUT}/assets`, { recursive: true });

let html = await readFile('en/index.html', 'utf8');
html = replaceOnce(html,
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n  <meta name="robots" content="noindex, nofollow">');
html = replaceOnce(html,
  '<link rel="stylesheet" href="../assets/css/styles.css">',
  '<link rel="stylesheet" href="../assets/css/styles.css">\n  <style>.pill.pill-draft { border: 0; background: #ffdbcc; color: #713718; letter-spacing: 0.04em; text-transform: none; }</style>');
html = replaceOnce(html,
  '<span class="pill pill-family"><span class="pulse-dot" aria-hidden="true"></span>Family run</span>',
  '<span class="pill pill-family"><span class="pulse-dot" aria-hidden="true"></span>Family run</span>\n            <span class="pill pill-draft">Draft preview · AI placeholder photos</span>');
html = replaceOnce(html,
  'Artemonas, Sifnos, Greece</p>',
  'Artemonas, Sifnos, Greece · Draft preview, not the live site</p>');
await writeFile(`${OUT}/en/index.html`, html);

await writeFile(`${OUT}/index.html`, ROOT_PAGE);
await writeFile(`${OUT}/_headers`, HEADERS);
// On the gh-pages branch the files are already built. Setting the command here overrides any
// build command typed into the Netlify dashboard, so a wrong setting can't break the deploy.
await writeFile(`${OUT}/netlify.toml`, '[build]\n  command = "echo Static site, nothing to build"\n  publish = "."\n');
await writeFile(`${OUT}/.nojekyll`, '');
await writeFile(`${OUT}/README.md`, README);

console.log(`Preview built in ./${OUT}`);
