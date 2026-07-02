# Kalpavruksha G — Portfolio

> Personal developer portfolio built with vanilla HTML, CSS, and JavaScript.

## 🚀 Live Site

[kalpavruksha.github.io/expert-chainsaw](https://kalpavruksha.github.io/expert-chainsaw) *(or your deployed URL)*

## ✨ Features

- **Cinematic hero section** with Three.js WebGL particle field
- **Native CSS scroll-snap** horizontal project carousel (no GSAP pin freeze)
- **60fps smooth scroll** via Lenis + GSAP ScrollTrigger
- **IntersectionObserver** card fade-ins — zero layout thrash
- **Magnetic nav buttons** and custom SVG cursor
- **Drag-to-scroll** project grid with arrow navigation
- **Folder gallery** achievements animation
- **Animated stat counters** on scroll
- **Fully responsive** — mobile-first layout

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Markup | HTML5 |
| Styles | Vanilla CSS (CSS Variables, scroll-snap, animations) |
| Animations | GSAP 3 + ScrollTrigger, Lenis smooth scroll |
| 3D | Three.js (WebGL particles) |
| Tilt | VanillaTilt |

## 📁 Structure

```
portfolio/
├── index.html      # Main HTML — all sections
├── style.css       # Design system + component styles
├── script.js       # Animation orchestration
└── profile pic.png # Hero photo
```

## ⚡ Performance Optimizations

- Three.js render loop paused via `IntersectionObserver` when off-screen
- `will-change` scoped to only actively animated elements
- Passive scroll listeners + RAF-gated DOM writes
- Static PNG grain texture (replaces expensive SVG `feTurbulence` filter)
- `powerPreference: 'low-power'` WebGL renderer
- Cursor follower RAF auto-stops when idle

## 📬 Contact

**Email:** kalpavruksha.g.dev@gmail.com  
**LinkedIn:** [linkedin.com/in/kalpavruksha-g-4a3151267](https://www.linkedin.com/in/kalpavruksha-g-4a3151267)  
**GitHub:** [github.com/Kalpavruksha](https://github.com/Kalpavruksha)

---

© 2026 Kalpavruksha G. All rights reserved.
