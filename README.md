# StudioPath Pro (Web_Practice)

[![Live](https://img.shields.io/badge/live-GitHub%20Pages-0B5FFF)](https://rohaan2802.github.io/Web_Practice/)
[![Stack](https://img.shields.io/badge/stack-HTML%20%7C%20CSS%20%7C%20JS-111827)](#source-map)
[![Screenshots](https://img.shields.io/badge/screenshots-20%20labelled-1B7A4B)](#feature-screenshots-20)
[![Theme](https://img.shields.io/badge/light%20theme-max%20contrast-0F766E)](#light-theme--visibility)
[![Demo](https://img.shields.io/badge/client%20demo-ready-7C2D12)](#client-demo-playbook)

**StudioPath Pro** is a client-demo-ready front-end studio platform built from the full `Web_Practice` coursework archive. It is designed for discovery calls, classroom defense, and portfolio hunting: interactive filters, estimator with copyable summary, seeded planner, validated intake, DOM lab, tables, media, multi-page About, dark mode, and a **maximum-visibility light theme**.

**Author:** Mohammad Rohaan · **Roll:** 22I-2327 · **GitHub:** [rohaan2802](https://github.com/rohaan2802)

**Imagery policy:** Male portraits, animal mascots, and object photography only — in the product and in README screenshots.

---

## Live demo

https://rohaan2802.github.io/Web_Practice/

---

## Table of contents

1. [Live demo](#live-demo)
2. [Executive summary](#executive-summary)
3. [Why this wins a client walkthrough](#why-this-wins-a-client-walkthrough)
4. [Client demo playbook](#client-demo-playbook)
5. [Light theme & visibility](#light-theme--visibility)
6. [Product map (every module)](#product-map-every-module)
7. [Practice → product mapping (complete)](#practice--product-mapping-complete)
8. [Feature walkthrough (deep)](#feature-walkthrough-deep)
9. [Interaction & data contracts](#interaction--data-contracts)
10. [Accessibility & motion](#accessibility--motion)
11. [Responsive matrix](#responsive-matrix)
12. [Feature screenshots (20)](#feature-screenshots-20)
13. [Source map](#source-map)
14. [How to run locally](#how-to-run-locally)
15. [Print leave-behind](#print-leave-behind)
16. [QA checklist for demos](#qa-checklist-for-demos)
17. [Limitations](#limitations)
18. [Roadmap ideas (optional)](#roadmap-ideas-optional)
19. [License / attribution](#license--attribution)

---

## Executive summary

| Question | Answer |
| --- | --- |
| What is it? | A static, multi-section studio platform on GitHub Pages |
| Who is it for? | Clients, recruiters, instructors, portfolio reviewers |
| What proves skill? | Working UI for layout, forms, tables, media, JS logic, persistence |
| Backend required? | No — everything runs in the browser |
| Light theme? | **Default** — near-black type, white surfaces, projector-ready |
| Demo helpers? | Seed tasks, copy estimate, floating CTA, keyboard `D` |

StudioPath Pro is the **productized** form of `Web_Practice`. The repository ships only the live product (`index.html`, `about.html`, assets, and scripts) — practice lab folders were removed to keep demos lean.

---

## Why this wins a client walkthrough

1. **Clickable proof, not slides** — filters, lightbox, estimator, planner, and forms fail/succeed live.
2. **Transparent scoping** — estimator shows hours + fee with add-on breakdown you can copy.
3. **Delivery narrative** — schedule table doubles as a sprint calendar while you talk.
4. **Risk reduction story** — validated intake + planner persistence shows process maturity.
5. **Classroom-to-commerce bridge** — skills map ties every module back to coursework concepts without sounding unfinished.
6. **Room-ready themes** — light is default for shared screens/projectors; dark stays one click for mood.
7. **Zero deploy friction** — GitHub Pages URL is the demo environment.

---

## Client demo playbook

Use this 6–8 minute script:

| Minute | Action | Say |
| --- | --- | --- |
| 0:00 | Open live URL, keep **light theme** for visibility | “This is the production-shaped walkthrough — static host, full interaction.” |
| 0:40 | Scroll **Trust** + **Cases** | “These are the beats we’ll click: filters, estimate, intake.” |
| 1:30 | **Work** → Tools filter → open lightbox | “Portfolio system with hover affordance and modal viewer.” |
| 2:30 | **Estimate** → Calculate → **Copy summary** | “Scope math is transparent; you can paste into email.” |
| 3:30 | Press **`D`** or **Seed demo data** | “Planner milestones appear instantly for the call.” |
| 4:30 | **Contact** — intentionally fail validation, then succeed | “Client-facing forms that protect incomplete submits.” |
| 5:30 | **Skills** + **DOM lab** | “Every major lab concept is represented and clickable.” |
| 6:30 | **About** page | “Multi-page pattern for broader site architecture.” |
| 7:30 | Optional: **Print** the page as leave-behind | “Browser print stylesheet strips chrome for PDF.” |

**Keyboard:** `D` (outside inputs) reseeds planner demo tasks.  
**Demo toolkit (bottom-left dock):** Seed demo data · Copy last estimate · Open intake · Open estimator · Hide.  
**Restore after hide:** use **Show demo tools** (bottom-left) or **Demo tools** in the header — state is remembered in `localStorage`.

---

## Light theme & visibility

**Light is the default theme** (first visit / cleared storage) so client demos and projector rooms open at maximum visibility. Dark remains one click away and is remembered in `localStorage`.

| Token / surface | Value / intent |
| --- | --- |
| `--text` | `#000000` — pure black primary copy |
| `--muted` | `#0f1c2a` — ink-dark secondary (never washed gray) |
| `--line` | `38%` black — strong card/input edges |
| `--accent` / `--accent-soft` | `#6b240f` / `#8b2e12` — deep rust CTAs |
| Body | Solid white page (maximum projector clarity) |
| Cards / trust / cases | White surfaces, 1.5px borders, readable shadows |
| Inputs / chips | 2px borders + rust focus ring |
| Header / nav | Opaque white bar, bold `#0a1520` links |
| Ticker / demo banner | Warm paper strips with rust emphasis |
| Buttons / float CTA | Solid rust fills, white labels, heavy weight |
| Tables | Tinted headers + darker cell rules |
| Hero | Light scrim so headline stays ink-black on photography |

Also improved: section-alt contrast, quote left accent bar, form status weight, and print CSS that keeps ink-friendly borders.

**Tip for demos:** leave light on for the whole call; switch to dark only for mood / night-mode screenshots.

---

## Product map (every module)

1. Client demo toolkit (dock + restore)  
2. Skills ticker (CSS keyframes)  
3. Sticky header + theme toggle + mobile nav  
4. Hero + animated counters  
5. Trust strip (demo promises)  
6. Case snapshots (walkthrough scripts)  
7. Services (6 cards)  
8. Process rail (`::before` + pulse)  
9. Work gallery (8) + filters + hover + lightbox  
10. iframe media  
11. Schedule table (`colspan`)  
12. Pricing comparison table  
13. Quote estimator + copy summary  
14. Team (males + animal mascots)  
15. Quote / field note  
16. Concept checklists + skills map table  
17. Newsletter  
18. DOM lab panel  
19. Brief planner (search / filters / clear done / seed)  
20. Contact intake (full validation)  
21. FAQ  
22. Footer  
23. Floating “Book demo” CTA  
24. Reading progress + back-to-top  
25. `about.html` multi-page  
26. Print stylesheet  

---

## Practice → product mapping (complete)

| Practice source | Concepts practiced | Where it appears in StudioPath Pro |
| --- | --- | --- |
| Assignment 01 (HTML) | Semantic structure, nav, footer, multi-page | Landmarks, sticky header, footer, `about.html` |
| Assignment 02 (HTML) | Marquee, nested lists, iframe, tables, forms | Ticker, checklists, media embed, schedule, intake |
| Assignment 03 Acme | Marketing sections, newsletter | Hero, services, subscribe band |
| Assignment 04 WebPaint | Portfolio filters / featured works | Work chips, 8-card grid, lightbox |
| Assignment #06 | Landing composition | Section rhythm, feature imagery |
| Assignment 07 (CSS) | Form layout / validation chrome | Contact form with real checks |
| CSS / Flex box | Flex alignment | Header, hero actions, toolbars |
| CSS / Grid | Grid layout | Services, work, team, trust, cases |
| CSS / @Media | Breakpoints | Full responsive matrix |
| CSS / IMage Hover | Hover overlays | Work `::after` badge + zoom |
| CSS / keyframes | Animation | Ticker, process pulse, lab pulse |
| CSS / pseudo class & selectors | Interactive states | Chips, buttons, lab toggles |
| CSS / positions | Overlay positioning | Lightbox, hover badges, float CTA |
| CSS / Fonts & borders | Typography & chrome | Syne + DM Sans, card borders |
| HTML / Forms · Items · Media · Tables | Core markup drills | Forms, lists, iframe, tables |
| Java S / Todo · TodoList | List applications | Brief planner |
| Java S / DOM 1–3 | query / classList / text | Lab panel, lightbox wiring |
| Java S / Functions · if-else · objects · arrays · loops | Logic | Estimator, counters, filters, seed data |

---

## Feature walkthrough (deep)

### Demo banner & floating CTA
On first visit, a dismissible banner exposes seed/copy/intake shortcuts. A fixed **Book demo** pill stays available while scrolling (hidden in print).

### Trust + cases
Trust tiles set expectations (“what you can click”). Case cards give you spoken narrative hooks that deep-link into schedule, estimator, and skills.

### Work system
Five filter modes (`all`, `brand`, `ui`, `motion`, `tools`). Hover reveals a positioned badge; activation opens a `<dialog>` lightbox with caption. Status text is `aria-live`.

### Estimator
Uses an `ADDONS` dictionary, `baseHours` / `baseFee` functions, urgency multipliers, and checkbox aggregation. **Copy summary** writes a plain-text line for email/Slack.

### Planner
Supports add, search, filter (all/open/done/high), toggle, delete, clear-done, localStorage key `studiopath-tasks-v1`, and demo seeding via button or `D`.

### Forms
Newsletter checks `type=email` validity. Contact enforces name, email, project type, password length, password match, and terms — with ordered failure messages.

### Themes
`js/theme-init.js` applies theme before paint to reduce flash. Toggle label swaps between “Light theme” / “Dark theme”.

---

## Interaction & data contracts

| Key | Storage | Purpose |
| --- | --- | --- |
| `studiopath-theme` | `localStorage` | `dark` \| `light` |
| `studiopath-tasks-v1` | `localStorage` | Planner JSON array |
| `studiopath-demo-banner` | `localStorage` | `hidden` / `visible` for demo dock |
| Estimator output | In-memory string | Last summary for clipboard copy |

No cookies. No analytics. No network writes (except optional YouTube iframe assets).

---

## Accessibility & motion

- Skip link to `#main`
- `aria-expanded` / `aria-pressed` / `aria-live` where state changes
- Focus rings on inputs (stronger in light theme)
- `prefers-reduced-motion` disables ticker/pulse/smooth scroll
- Lightbox closable via button, backdrop click, and `Escape`
- Meaningful labels on demo controls

---

## Responsive matrix

| Class | Width | Behaviour |
| --- | --- | --- |
| Compact phone | ≤420px | Single column, stacked CTAs |
| Large phone | ≤760px | Hamburger nav; stacked grids |
| Tablet | ≤960px | 2-column services/cases/team |
| Laptop | ≤1100px | 3-column work |
| Desktop / wide | ≥1101px | 4-column work; capped measure |
| Landscape | short height | Sticky header remains usable |
| Print | browser print | Chrome stripped; ink-friendly borders |

---

## Feature screenshots (20)

### 01. Hero — max-visibility light desktop
![Hero light](docs/screenshots/01-hero-dark-desktop.jpg)

### 02. Trust strip — stakeholder clickables
![Trust](docs/screenshots/02-services-cards.jpg)

### 03. Client cases — walkthrough outcomes
![Cases](docs/screenshots/03-process-rail.jpg)

### 04. Work gallery — all (8 uniform 16:10 studies)
![Work all](docs/screenshots/04-work-gallery-all.jpg)

### 05. Work filter — Tools
![Work tools](docs/screenshots/05-work-filter-tools.jpg)

### 06. Lightbox viewer — UI kit study with Close control
![Lightbox](docs/screenshots/06-lightbox-viewer.jpg)

### 07. Media embed
![Media](docs/screenshots/07-media-embed.jpg)

### 08. Schedule table
![Schedule](docs/screenshots/08-schedule-table.jpg)

### 09. Pricing table
![Pricing](docs/screenshots/09-pricing-table.jpg)

### 10. Quote estimator
![Estimator](docs/screenshots/10-quote-estimator.jpg)

### 11. Team grid
![Team](docs/screenshots/11-team-grid.jpg)

### 12. Quote / field note
![Quote](docs/screenshots/12-quote-band.jpg)

### 13. Concept checklists + map
![Skills](docs/screenshots/13-skills-coverage.jpg)

### 14. DOM lab panel
![Lab](docs/screenshots/14-dom-lab-panel.jpg)

### 15. Task planner
![Planner](docs/screenshots/15-task-planner.jpg)

### 16. Contact intake
![Contact](docs/screenshots/16-contact-form.jpg)

### 17. About page
![About](docs/screenshots/17-about-page.jpg)

### 18. Mobile hero
![Mobile hero](docs/screenshots/18-mobile-hero.jpg)

### 19. Mobile nav open
![Mobile nav](docs/screenshots/19-mobile-nav-open.jpg)

### 20. Mobile estimator
![Mobile estimate](docs/screenshots/20-mobile-estimator.jpg)

---

## Source map

| Path | Role |
| --- | --- |
| `index.html` | Primary product + demo chrome |
| `about.html` | Multi-page About |
| `assets/css/styles.css` | Design tokens, layouts, light max-contrast, print |
| `js/theme-init.js` | Pre-paint theme |
| `js/app.js` | All interactions, demo seeding, clipboard |
| `assets/images/` | Male / animal / object assets |
| `docs/screenshots/` | Twenty labelled README captures |
| `scripts/qa-check.py` | Local Playwright QA smoke |
| `.nojekyll` | GitHub Pages static hosting |

---

## How to run locally

```bash
git clone https://github.com/rohaan2802/Web_Practice.git
cd Web_Practice
python -m http.server 8080
```

Visit `http://127.0.0.1:8080/`.

Recommended local demo prep:

1. Hard refresh once after pull.  
2. Stay on **Light theme** (default).  
3. Click **Seed demo data**.  
4. Run an estimate and **Copy summary**.  

---

## Print leave-behind

Use the browser print dialog. The print stylesheet hides ticker, demo chrome, theme toggle, media iframe, floating CTA, and progress UI, and forces high-contrast borders for PDF handouts.

---

## QA checklist for demos

- [ ] Light theme: body text clearly darker than backgrounds  
- [ ] Nav links readable on white header  
- [ ] Work filter status updates  
- [ ] Lightbox opens/closes  
- [ ] Estimator calculate + copy  
- [ ] Planner seed via button and `D`  
- [ ] Contact validation fails then passes  
- [ ] About page loads  
- [ ] Mobile nav opens/closes  
- [ ] Print preview looks clean  

---

## Limitations

- No server email, CRM, or payments.  
- Estimator math is illustrative.  
- Planner data is device-local.  
- YouTube iframe needs network access.  
- Responsive QA uses browser viewports; not every physical device SKU is certified.

---

## Roadmap ideas (optional)

- CMS-free Markdown case studies  
- i18n EN/Urdu toggle  
- Export planner JSON  
- Lighthouse CI badge  
- Optional Formspree/endpoint wiring behind a flag  

---

## License / attribution

Packaging by Mohammad Rohaan (22I-2327). Third-party archive assets keep their original licenses. StudioPath Pro root product files are for portfolio and client demonstration.
