---
name: os-based-cloudflare-redirect
description: >
  Set up OS-based visitor redirection for a static site using a Cloudflare Worker
  (server-side User-Agent detection) with a client-side JS fallback. Deploys via
  GitHub + Coolify with Cloudflare DNS proxy. Use when a static site needs to serve
  different pages to macOS/iOS vs Windows vs other OS visitors.
---

# OS-Based Cloudflare Redirect Skill

## When To Use This Skill

Use this skill when:
- A static site needs to **redirect visitors to different pages based on their OS**
- The site will be fronted by **Cloudflare** (DNS proxy / Workers)
- Deployment is via **GitHub → Coolify** (or any static hosting behind Cloudflare)
- You need both server-side (Worker) and client-side (JS) redirect layers

Do **NOT** use this skill for:
- Dynamic/backend apps that can handle redirects in their own server code
- Sites not using Cloudflare
- Geo-based or IP-based redirects (use Cloudflare Redirect Rules for those)

---

## Prerequisites

- A static site with separate HTML pages for each OS target
- A Cloudflare account (free plan is fine)
- A domain name with the ability to change nameservers
- A Coolify instance (or any static hosting server)
- Git installed on the deployment machine

---

## Inputs Required

Before starting, gather these from the user:

| Input | Example | Required |
|-------|---------|----------|
| Project folder path | `/path/to/mysite` | ✅ |
| macOS target page | `/apple.html` | ✅ |
| Windows target page | `/Windows/windows.html` | ✅ |
| Fallback page (other OS) | `/index.html` | ✅ |
| Domain name | `example.com` | ✅ |
| Coolify server IP | `203.0.113.50` | ✅ |
| Domain registrar | Namecheap, GoDaddy, etc. | Optional |
| Privacy restrictions | Don't read file contents | Optional |

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

### Step 2: Create Cloudflare Worker File

Create `_worker.js` in the project root with this template:

```js
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Only redirect on root or landing page
    if (path === "/" || path === "/index.html") {
      const ua = (request.headers.get("User-Agent") || "").toLowerCase();

      // Apple devices (macOS, iPhone, iPad, iPod)
      if (
        ua.includes("macintosh") ||
        ua.includes("mac os") ||
        ua.includes("iphone") ||
        ua.includes("ipad") ||
        ua.includes("ipod")
      ) {
        url.pathname = "{{MACOS_TARGET_PAGE}}";
        return Response.redirect(url.toString(), 302);
      }

      // Windows devices
      if (ua.includes("windows")) {
        url.pathname = "{{WINDOWS_TARGET_PAGE}}";
        return Response.redirect(url.toString(), 302);
      }
    }

    // All other paths and OS → pass through to origin
    return fetch(request);
  },
};
```

**Replace**:
- `{{MACOS_TARGET_PAGE}}` → the macOS target path (e.g., `/apple.html`)
- `{{WINDOWS_TARGET_PAGE}}` → the Windows target path (e.g., `/Windows/windows.html`)

### Step 3: Add JS Fallback to Landing Page

Inject this `<script>` as the **first child** of `<head>` in the landing page (e.g., `index.html`):

```html
<script>
  (function() {
    var ua = navigator.userAgent || navigator.platform || "";
    if (/Macintosh|MacIntel|Mac OS|iPhone|iPad|iPod/.test(ua)) {
      window.location.replace("{{MACOS_TARGET_PAGE_RELATIVE}}");
    } else if (/Win/.test(ua)) {
      window.location.replace("{{WINDOWS_TARGET_PAGE_RELATIVE}}");
    }
  })();
</script>
```

**Replace**:
- `{{MACOS_TARGET_PAGE_RELATIVE}}` → relative path from index.html (e.g., `apple.html`)
- `{{WINDOWS_TARGET_PAGE_RELATIVE}}` → relative path from index.html (e.g., `Windows/windows.html`)

**Important**: Use `window.location.replace()` not `window.location.href` to avoid back-button loops.

### Step 4: Create .gitignore

```
.DS_Store
Thumbs.db
desktop.ini
.vscode/
.idea/
*.swp
*.swo
*~
node_modules/
```

### Step 5: Provide Git + GitHub Instructions

If the user doesn't have GitHub CLI, provide browser-based repo creation + basic git commands:

```bash
git init
git add .
git commit -m "Initial commit with OS-based redirect"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

Include Personal Access Token creation steps for authentication.

### Step 6: Provide Cloudflare Setup Instructions

1. **Add domain** to Cloudflare (free plan)
2. **Change nameservers** at registrar to Cloudflare's assigned nameservers
3. **Add A records** pointing to Coolify server IP (Proxied / orange cloud ON)
4. **Set SSL/TLS** to Full (Strict)
5. **Create Worker** in Workers & Pages → paste the `_worker.js` code
6. **Add Worker Route**: `domain.com/*` → select the worker

### Step 7: Provide Coolify Deployment Instructions

1. New Resource → Public/Private Repository → paste GitHub URL
2. Build Pack: Static, Publish Directory: `/`
3. Set domain under Domains
4. Enable Auto Deploy

### Step 8: Provide Verification Commands

```bash
# macOS test
curl -I -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" https://domain.com/

# Windows test
curl -I -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" https://domain.com/

# Fallback test
curl -I -A "Mozilla/5.0 (X11; Linux x86_64)" https://domain.com/
```

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Redirect type | 302 (temporary) | Prevents browser caching; allows easy logic changes later |
| Worker vs Redirect Rules | Worker | Full programmatic control over UA parsing |
| JS fallback | Yes | Safety net if Worker is misconfigured or origin is accessed directly |
| Script position | First child of `<head>` | Executes before any CSS/assets load, minimizing flash |
| `location.replace` vs `location.href` | `replace` | Avoids back-button loop (doesn't add history entry) |

---

## Common Gotchas

1. **SSL redirect loops**: Always set Cloudflare SSL to **Full (Strict)**, never "Flexible"
2. **Worker route must match proxied domain**: Orange cloud must be ON for Worker routes to fire
3. **Case sensitivity in paths**: `/Windows/windows.html` — folder name is capitalized
4. **301 vs 302**: Never use 301 for OS redirects — browsers cache 301s permanently
5. **Privacy-restricted files**: Use `grep` for tag positions, modify by structure not content
