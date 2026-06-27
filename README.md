# codertapsu.github.io

Personal portfolio of **Khanh Hoang (Marcus)** — Senior Software Engineer & Technical Architect.

🔗 **Live:** https://codertapsu.github.io

## About

A fast, accessible, single-page portfolio built as a **static site** — vanilla HTML, CSS
and JavaScript with **no framework and no build step**. It deploys directly to GitHub Pages.

### Highlights

- **Sticky identity card + scroll-spy navigation** (single, deep-linkable, anchor-based page)
- **Dark / light themes** with system detection, persistence, and no flash of the wrong theme
- **Responsive** from 360px phones to wide desktops
- **Accessible** — semantic landmarks, skip link, visible focus rings, `prefers-reduced-motion`
  support, WCAG-AA contrast in both themes, and content that works fully without JavaScript
- **SEO** — descriptive metadata, Open Graph / Twitter cards, canonical URL,
  JSON-LD (`Person` + `WebSite`), `sitemap.xml` and `robots.txt`
- **Performance** — inline SVG icon sprite (no icon-font CDN), subset Google Fonts,
  lazy-loaded images, and one small deferred script

## Structure

```
index.html              # the page (content + metadata + JSON-LD)
404.html                # themed not-found page
assets/css/style.css    # all styles (design tokens, themes, layout, print)
assets/js/script.js     # progressive enhancement (theme, scroll-spy, filters, etc.)
assets/images/          # avatar, app icons, favicons, OG image
site.webmanifest        # PWA manifest
robots.txt, sitemap.xml # SEO
humans.txt              # credits
```

## Develop locally

No tooling required — open `index.html`, or serve the folder:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Contact form

The contact form uses [Web3Forms](https://web3forms.com) — no backend or server required —
and is already configured with a public, client-side access key.

To use a different key: get one free at [web3forms.com](https://web3forms.com) and replace the
`access_key` value in the contact `<form>` in `index.html`. Public keys are safe to commit;
restrict them by domain in the Web3Forms dashboard.

Submissions are sent over `fetch` with inline success/error feedback, a honeypot to drop spam,
and a native `POST` fallback when JavaScript is disabled. If the key is ever removed or a
request fails, the form falls back to opening the visitor's email app.

## Deploy

Pushing to the default branch publishes automatically via GitHub Pages.

## Updating content

All content is authored directly in `index.html`:

- **Experience** — the `<ol class="timeline">` list (recent first; older roles use
  `class="tl--more"` and are collapsed by default but kept in the DOM for SEO and print)
- **Projects** — the `<ul class="projects">` cards (`data-category` drives the filters)
- **Skills** — the `.chips` lists; **Contact / links** — the identity card and contact section
