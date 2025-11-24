# MFQ Revenue Pro — Static Website

This is a simple, responsive static website for MFQ Revenue Pro (healthcare revenue optimization). It uses modern CSS and GSAP for animations and interactions.

What’s included

- `index.html` — main landing page
- `styles.css` — styles (responsive)
- `scripts.js` — GSAP animations and interactive behaviors (accordion, testimonial slider, contact form)

How to run locally

1. Open `index.html` in your browser, or run a simple local server. From PowerShell (recommended):

```powershell
# from the project folder
python -m http.server 8000; # then open http://localhost:8000
```

Notes

- Images are referenced from Unsplash (external). Replace them with local assets if desired.
- The contact form is client-side only; connect to an email/CRM endpoint or server to process submissions.
- GSAP and ScrollTrigger are loaded via CDN in `index.html`.

Suggested improvements

- Add real branding assets (logo, color tokens) and privacy/terms pages.
- Integrate a backend for form submission and analytics.

If you want, I can:

- wire the contact form to an API endpoint (specify URL/auth),
- convert this into a small React/Vue site, or
- add sample unit tests for JS behaviors.
