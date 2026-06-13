# 🧠 AppleCyberCop — Project Memory

> **Last Updated**: 2026-06-12T22:44 IST  
> **Status**: Code ready, pending deployment  
> **Project Path**: `C:\Users\rogue\.gemini\antigravity\scratch\Checkk\applecybercop-main (2)\applecybercop-main (2)`

---

## What This Project Does

A static website that **redirects visitors based on their operating system**:

| OS | Destination Page |
|----|-----------------|
| macOS / iPhone / iPad | `/apple.html` |
| Windows | `/Windows/windows.html` |
| Linux / Android / Other | `/index.html` (no redirect, stays on landing page) |

Redirection is handled at **two layers**:
1. **Server-side** — Cloudflare Worker inspects `User-Agent` header before the page loads (zero flicker)
2. **Client-side** — JS fallback in `index.html <head>` as a belt-and-suspenders backup

---

## What Was Done (Chronological)

### Session: 2026-06-12

#### 1. Analyzed existing project structure
- Identified all HTML pages, CSS, JS, fonts, and subdirectories
- Found `apple.html` (root) and `Windows/windows.html` as the two OS-specific targets
- Found `index.html` as the default landing page
- **Did NOT read file contents** — user's privacy policy prohibits it

#### 2. Created Cloudflare Worker — `_worker.js`
- **File**: `_worker.js` (project root)
- Server-side User-Agent detection
- Only intercepts requests to `/` and `/index.html`
- All other paths (about, contact, career, etc.) pass through untouched
- Uses 302 (temporary) redirects so browsers don't cache the redirect permanently

#### 3. Modified `index.html` — Added JS redirect fallback
- Injected a `<script>` block as the **first child** of `<head>` (line 4)
- Runs immediately before any CSS, meta tags, or other scripts load
- Uses `window.location.replace()` (replaces history entry, no back-button loop)
- Regex patterns: `/Macintosh|MacIntel|Mac OS|iPhone|iPad|iPod/` for Apple, `/Win/` for Windows

#### 4. Created `.gitignore`
- Excludes: `.DS_Store`, `Thumbs.db`, editor configs (`.vscode/`, `.idea/`), `node_modules/`

#### 5. Created deployment walkthrough
- ELI10 (explain like I'm 10) step-by-step guide
- No GitHub CLI required — uses browser + basic `git` commands
- Covers: GitHub repo creation, Personal Access Token, Cloudflare DNS/Worker setup, Coolify deployment
- Includes verification curl commands for each OS

---

## Files Created / Modified

| File | Action | Purpose |
|------|--------|---------|
| `_worker.js` | ✨ NEW | Cloudflare Worker — server-side OS redirect |
| `index.html` | ✏️ MODIFIED | Added JS redirect script in `<head>` (lines 4-13) |
| `.gitignore` | ✨ NEW | Git ignore rules |
| `memory.md` | ✨ NEW | This file — project memory |
| `SKILL.md` | ✨ NEW | Reusable skill for OS-based redirect setup |
| `agent.md` | ✨ NEW | Agent config for faster future runs |

---

## Decisions Made

1. **302 vs 301 redirect**: Chose **302** (temporary) so redirects aren't cached by browsers. If the user changes the redirect logic later, browsers won't serve stale cached 301s.

2. **Worker vs Cloudflare Redirect Rules**: Chose **Worker** because it gives full programmatic control over User-Agent parsing. Redirect Rules have limited regex support for UA matching.

3. **JS fallback in index.html**: Added as a safety net. If the Cloudflare Worker isn't set up yet, or is misconfigured, or the user accesses the origin directly, the JS still handles the redirect.

4. **Not reading file contents**: User has a privacy policy. All modifications were done by structural tag matching (`<head>`, `<meta charset>`) without reading the actual page content.

5. **No GitHub CLI dependency**: Second PC doesn't have `gh` CLI. All GitHub operations are done via browser (repo creation) + basic `git` commands + Personal Access Token.

---

## Architecture

```
User visits yourdomain.com/
         │
         ▼
   Cloudflare DNS (Proxied)
         │
         ▼
   Cloudflare Worker (_worker.js)
         │
         ├─── UA = macOS/iPhone/iPad ──► 302 → /apple.html
         ├─── UA = Windows ────────────► 302 → /Windows/windows.html
         └─── UA = other ─────────────► passthrough to origin
                                              │
                                              ▼
                                        Coolify (Nginx)
                                        serves index.html
                                              │
                                              ▼
                                     JS fallback redirect
                                     (if Worker didn't fire)
```

### Session: 2026-06-13

#### 6. Converted Website to "A Farm Recipe"
- **Rebranded** from "Vibrant Over Fifty" / "Fiesty 50" to **"A Farm Recipe"**
- **Tagline**: "Fresh from the Farm, Straight to Your Table"
- Kept `apple.html` and `Windows/windows.html` untouched (confidential)
- Updated `styles.css` with earthy farm-kitchen palette (forest green, warm wheat, cream)

#### 7. Created 15 SEO-Optimized Pages

| # | File | Role |
|---|------|------|
| 1 | `index.html` | Homepage |
| 2 | `about.html` | About Our Farm Kitchen |
| 3 | `contact.html` | Contact Us |
| 4 | `vegan-recipes.html` | Category Hub: Vegan |
| 5 | `vegan-buddha-bowl.html` | Recipe: Rainbow Buddha Bowl |
| 6 | `vegan-pumpkin-soup.html` | Recipe: Roasted Pumpkin Soup |
| 7 | `vegan-lentil-stew.html` | Recipe: Lentil & Vegetable Stew |
| 8 | `indian-recipes.html` | Category Hub: Indian |
| 9 | `indian-butter-chicken.html` | Recipe: Butter Chicken |
| 10 | `indian-dal-makhani.html` | Recipe: Dal Makhani |
| 11 | `indian-chana-masala.html` | Recipe: Chana Masala |
| 12 | `italian-bakery-recipes.html` | Category Hub: Italian & Bakery |
| 13 | `italian-sourdough-bread.html` | Recipe: Sourdough Bread |
| 14 | `italian-classic-lasagna.html` | Recipe: Classic Lasagna |
| 15 | `italian-focaccia.html` | Recipe: Rosemary Focaccia |

#### 8. Deleted Old Files
- Removed: `podcasts.html`, `podcasts_article_1/2/3.html`, `empowerment.html`, `empowerment_article_1/2/3.html`, `career.html`, `career_article_1/2/3.html`

#### 9. SEO Features Implemented (every page)
- `<title>` tags under 60 chars with brand name
- `<meta name="description">` under 160 chars
- `<meta name="keywords">` with 10+ targeted keywords per page
- `<link rel="canonical">` URLs
- `<meta name="robots" content="index, follow">`
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`)
- Twitter Card meta tags
- Single `<h1>` per page with proper heading hierarchy
- Semantic HTML5 (`<main>`, `<article>`, `<nav>`, `<header>`, `<footer>`)
- ARIA labels for accessibility
- All images have descriptive `alt` text
- `role="img"` + `aria-label` on CSS background images
- `lang="en"` attribute on `<html>`
- Viewport meta tag for mobile

#### 10. JSON-LD Structured Data
- **Homepage**: `WebSite` + `ItemList` schema with `SearchAction`
- **About**: `AboutPage` + `Organization` schema
- **Contact**: `ContactPage` schema
- **Category Hubs**: `CollectionPage` + `ItemList` schema
- **Recipe Pages**: Full `Recipe` schema with:
  - `recipeIngredient` (complete ingredient list)
  - `recipeInstructions` (step-by-step `HowToStep` array)
  - `nutrition` (calories, protein, carbs, fat, fiber)
  - `prepTime`, `cookTime`, `totalTime` (ISO 8601)
  - `recipeYield`, `recipeCategory`, `recipeCuisine`
  - `keywords` for Google Rich Results

#### 11. SEO Verification Audit Results
- **298 checks PASSED**
- **0 warnings**
- **0 failures**
- **0 broken links**
- **0 old brand references remaining**

---

## Pending / TODO

- [ ] Copy updated project folder to second PC
- [ ] Git commit & push to GitHub
- [ ] Deploy updated site via Coolify
- [ ] Add domain to Cloudflare (if not done)
- [ ] Verify all pages load correctly on production
- [ ] Submit sitemap to Google Search Console
- [ ] Request Google indexing of new pages

---

## Key Info Needed From User (not yet provided)

- Domain name
- Coolify server public IP
- Domain registrar name

---

## Verification Commands

```bash
# macOS → should 302 to /apple.html
curl -I -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" https://yourdomain.com/

# Windows → should 302 to /Windows/windows.html
curl -I -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" https://yourdomain.com/

# Linux → should 200 (no redirect)
curl -I -A "Mozilla/5.0 (X11; Linux x86_64)" https://yourdomain.com/
```
