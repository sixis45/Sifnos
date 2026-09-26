# Aggelis Villa Sifnos: website

The English home page of [aggelisvilla-sifnos.gr/en](https://aggelisvilla-sifnos.gr/en/),
built on the **Modern Cycladic Sanctuary** design (desktop and phone layouts plus its
style guide).

It's plain HTML, CSS and JavaScript, with no framework and no build step, so you can
upload it to any web host as it is.

**Draft preview:** https://sixis45.github.io/Sifnos/

```
en/index.html          English home page (served at /en/)
assets/css/styles.css  All styles: phone first, desktop from 768px
assets/js/main.js      Slideshow, booking bar, menu, photo viewer, enquiry form (optional extras)
assets/fonts/          Self-hosted Playfair Display and Manrope (SIL Open Font License)
assets/img/            Local pictures: drawn placeholders, icons, share image
images/originals/      Source images for assets/img; put real photos here
tools/build-images.mjs Turns the originals into responsive WebP images
robots.txt, sitemap.xml
```

## Preview locally

```bash
npm run serve        # then open http://localhost:8080/en/
```

## Design

| | |
|---|---|
| Colours | Primary `#0E3B63` (Aegean), secondary `#C27854` (terracotta), tertiary `#4E5F49` (olive), neutral `#F7F4EE` |
| Fonts | Playfair Display for headings, Manrope for text and labels. Both are hosted with the site, and size-matched backup fonts stop the text jumping while they load. |
| Phones | Compact hero with a swipeable photo card, booking card, pill facts, swipe rows for photos and island tips, and a fixed bottom bar (call, check availability, section tabs) |
| Desktop | Full-screen rotating hero with a booking bar, feature ribbon, photo mosaic, and a three-card rates section |

## Photos: important before going live

**The photos come from the design mock-up. They are AI-generated and do not show
the real villa.** They're hosted by Google (`lh3.googleusercontent.com`), so they can
disappear at any time. If one fails to load, the page shows a local drawing instead,
or a soft pattern where there's no drawing.

Before the site goes live, replace them with real photos:

1. Put the photos in `images/originals/` with these names: `hero`, `veranda`, `bedroom`,
   `living`, `olives`, `kastro` (`.jpg`, `.png` or `.webp`). Add more if you like.
2. Run `npm install` and then `npm run images` to create optimised versions in `assets/img/`.
3. In `en/index.html`, point each `<img src="https://lh3.googleusercontent.com/…">` at the
   local file, such as `../assets/img/bedroom-1280.webp`, and update its `alt` text.

Or send the photos to Claude and ask for them to be put in.

## Content removed from the mock-up

The mock-up contained details that weren't confirmed, so they are not on the page:
guest reviews and a 4.95★ rating, a "From €120/night" price, an MHTE licence number,
"GNTO licensed", "Best rates guaranteed", "No booking fees", "Instant host reply",
"walk-in shower", "organic toiletries", an "ancient" olive grove, and a placeholder
phone number. Send the real details and they can be added.

**Registration number:** if the villa has a property registry number (ΑΜΑ) or ΜΗΤΕ
number, it can go in the footer.

## Also worth checking

- [ ] Distances: Poulati ≈ 3 km, Seralia ≈ 3 km, Chrysopigi Monastery ≈ 11 km.
- [ ] Phone numbers, email and address.
- [ ] The Greek page address used by the language switch: `https://aggelisvilla-sifnos.gr/`.
- [ ] Links to Booking.com, Airbnb, Facebook and Instagram.

## Quality checks

The page passes HTML validation and has no axe-core accessibility violations at phone,
tablet and desktop sizes. There's no sideways scrolling down to 360px wide and no layout
shift while loading. Lighthouse (mobile) scores 90–95 for performance and 100 for
accessibility and SEO, and those numbers were measured without the Google-hosted photos.
The slideshow can be paused, stops when it scrolls off screen, and doesn't play at all
for visitors who turn off animations.

## Deploying

Upload `en/`, `assets/`, `robots.txt` and `sitemap.xml` to the web root so the page is
served at `https://aggelisvilla-sifnos.gr/en/`. `images/`, `tools/`, `package.json` and
`node_modules/` are only needed on your computer.

If the Greek site stays on its current system (such as WordPress), upload only `en/`
and `assets/`, and keep that system's own `robots.txt` and sitemap.
