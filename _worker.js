/**
 * Cloudflare Worker — OS-based User-Agent redirect with bot bypass
 * 
 * Routes:
 *   Bots/Crawlers  → passthrough to main site (index.html) — ALWAYS
 *   macOS / iOS    → /apple.html
 *   Windows        → /Windows/windows.html
 *   Other          → /index.html (passthrough)
 * 
 * Only triggers on root path "/" or "/index.html".
 * All other paths pass through to the origin unchanged.
 * 
 * Bot detection runs FIRST — if the User-Agent matches any known
 * crawler/bot pattern, the request passes straight through to the
 * main site so search engines index the recipe content.
 */
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Only redirect on root or index
    if (path === "/" || path === "/index.html") {
      const ua = (request.headers.get("User-Agent") || "").toLowerCase();

      // ─── BOT / CRAWLER DETECTION ───────────────────────────
      // If the visitor is a known bot or crawler, let them through
      // to the main website so they can crawl and index our content.
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
        "headlesschrome",   // Headless Chrome (testing/crawling)
        "phantomjs",        // PhantomJS (crawling)
        "crawler",          // Generic crawler identifier
        "spider",           // Generic spider identifier
        "bot",              // Generic bot identifier (catches most bots)
      ];

      const isBot = botPatterns.some((pattern) => ua.includes(pattern));

      if (isBot) {
        // Let bots through to the main site — do NOT redirect
        return fetch(request);
      }

      // ─── REAL USER OS DETECTION ────────────────────────────

      // macOS, iPhone, iPad
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

      // Windows
      if (ua.includes("windows")) {
        url.pathname = "/Windows/windows.html";
        return Response.redirect(url.toString(), 302);
      }

      // Fallback (Linux, Android, etc.): let the request pass through to index.html
    }

    // All other paths → pass through to origin
    return fetch(request);
  },
};
