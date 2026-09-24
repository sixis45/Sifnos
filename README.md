# Aggelis Villa Sifnos: website

A modern, fast, accessible rebuild of the English home page of
[aggelisvilla-sifnos.gr/en](https://aggelisvilla-sifnos.gr/en/).

The site is plain HTML, CSS and JavaScript. It has no framework, no build step
and no third-party requests until a visitor chooses to load the map. You can
upload it to any web host as it is.

```
en/index.html          English home page (served at /en/)
assets/css/styles.css  All styles
assets/js/main.js      Menu, gallery lightbox, map loader, enquiry form (optional enhancements)
assets/fonts/          Self-hosted Fraunces font (SIL Open Font License)
assets/img/            Generated, optimised images (do not edit by hand)
images/originals/      Source images; put your photos here
tools/build-images.mjs Turns the originals into responsive WebP images
robots.txt, sitemap.xml
```

## Preview locally

```bash
npm run serve        # then open http://localhost:8080/en/
```

## Replace the placeholder images with real photos

The images in `images/originals/*.svg` are **illustrated placeholders**. Replace
them with real photos of the villa:

1. Copy your photos into `images/originals/` using these names (any of `.jpg`,
   `.png`, `.webp`), and delete the matching `.svg`:

   | File name    | What to show                                  | Shape      |
   |--------------|-----------------------------------------------|------------|
   | `hero.jpg`    | The best sea view (large banner at the top)   | wide, 16:10 |
   | `veranda.jpg` | The veranda / breakfast table                  | 4:3        |
   | `bedroom.jpg` | The master bedroom                             | 4:3        |
   | `living.jpg`  | Fireplace, dining table and kitchenette        | 4:3        |
   | `olives.jpg`  | The olive grove with the picnic table          | 4:3        |
   | `kastro.jpg`  | Kastro, a beach, or another island view        | 4:3        |

2. Build the optimised images:

   ```bash
   npm install
   npm run images
   ```

   This crops each photo to the right shape (keeping the most interesting part),
   creates small and large WebP versions for phones and desktops, and makes
   `og-image.jpg`, the preview picture shown when the link is shared on
   Facebook or WhatsApp.

3. If a photo shows something different, update its `alt` text and caption in
   `en/index.html`.

## What changed compared with the old page

- **Mobile-first, responsive layout.** Works from small phones to large
  screens, with a sticky "Call / Check availability" bar on phones.
- **Performance.** No jQuery or page builder. Images are in modern WebP format
  at several sizes and lazy-loaded, the font is self-hosted and small, and
  there is no layout shift while loading. Lighthouse (mobile) scores 98 for
  performance and 100 for accessibility, best practices and SEO.
- **Accessibility (WCAG 2.2 AA).** Semantic HTML, a skip link, keyboard-friendly
  menu and photo viewer, visible focus styles, alt text, good colour contrast,
  and respect for "reduce motion" settings. An axe-core scan reports no
  violations.
- **SEO.** Descriptive title and meta description, canonical URL, `hreflang`
  links to the Greek page, Open Graph / Twitter preview tags, and
  `LodgingBusiness` structured data (JSON-LD) for Google.
- **Privacy (GDPR-friendly).** No cookies and no trackers. Google Maps loads only
  after the visitor clicks "Show interactive map", and fonts are not loaded
  from Google.
- **Direct bookings.** Clear calls to action, the 8% long-stay offer, and an
  enquiry form that opens the guest's email app with dates, guests and message
  filled in. It needs no server or database.

## Before going live: please check

The old site could not be reached while this page was being built, so the
content comes from public listings of the villa. Please check:

- [ ] Distances: Poulati ≈ 3 km, Seralia ≈ 3 km, Chrysopigi Monastery ≈ 11 km.
- [ ] Phone numbers, email and address in the Contact section and footer.
- [ ] The Greek page address used by the language switch: `https://aggelisvilla-sifnos.gr/`.
- [ ] Links to Booking.com, Airbnb, Facebook and Instagram.
- [ ] Anything to add, such as check-in/out times, parking, pets or a season calendar.

## Deploying

Upload `en/`, `assets/`, `robots.txt` and `sitemap.xml` to the web root so the
page is served at `https://aggelisvilla-sifnos.gr/en/`. `images/`, `tools/`,
`package.json` and `node_modules/` are only needed on your computer.

If the Greek site stays on its current system (such as WordPress), upload only
`en/` and `assets/`, and keep that system's own `robots.txt` and sitemap.
