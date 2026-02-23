# Paper Stool Website

Premium one-page product website for the **Paper Stool** — a foldable, portable, eco-friendly seat concept.

## Overview

This project presents a story-first landing page that explains how a foldable paper stool improves comfort and space usage in crowded environments such as trains, events, restaurants, and compact homes.

The idea was inspired by a real daily problem: crowded Israeli train rides where seats are often unavailable.

## Features

- Full-screen hero section with immersive layout
- Visual story timeline with image-by-image explanation
- Interactive capacity simulator (live seat distribution logic)
- Use-case sections for transit, hospitality, events, and home
- Color collection section for product variants
- Premium gallery with lightbox (mouse + keyboard navigation)
- Animated counters and reveal-on-scroll sections
- Sticky active navigation + scroll progress indicator
- Back-to-top utility button
- Client-side validated order form
- FAQ section
- Performance-minded media loading (`loading="lazy"`, `decoding="async"`)

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (no frameworks)

## Project Structure

```
paper-stool-site/
├── index.html
├── styles.css
├── script.js
├── README.md
├── .gitignore
└── assets/
    ├── icons/
    │   ├── favicon-32.png
    │   └── apple-touch-icon.png
    ├── images/
    │   └── *.jpg, *.png
    └── video/
        └── paper-stool-video.mp4
```

## Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/Abraheem2010/paper-stool-site.git
   ```
2. Open `index.html` in a modern browser.

No build step or server required — it's a fully static site.

## Live Demo

[https://abraheem2010.github.io/paper-stool-site/](https://abraheem2010.github.io/paper-stool-site/)

## AI Tools Used

This project was built with the assistance of AI tools as part of an academic assignment:

- **Codex (OpenAI)** — Primary tool for generating and iterating on HTML/CSS/JS code
- **Gemini (Google)** — Image generation for train-use scenario concept visuals
- **Claude (Anthropic)** — Code refinement, review, and responsive layout fixes

## Deployment

This project can be deployed as a static site on GitHub Pages, Netlify, or Vercel.

## License

This project was created for academic purposes.
