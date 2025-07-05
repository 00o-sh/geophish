# GeoPhish (Cloudflare Pages Edition)

> ⚠️ **Proof-of-Concept: How Easily Your Location Can Be Captured Online**

This is a modern, serverless rebuild of the original GeoPhish — now powered by **Cloudflare Pages**, **Turnstile CAPTCHA**, and **Discord webhook logging** — showing how little effort is needed to harvest your **precise location** if your browser allows it.

---

## ⚠️ What This Demonstrates

- ✅ Users often **click through CAPTCHA** thinking it ensures safety
- ✅ Most users **allow location sharing** without knowing the risk
- 📍 This tool can **collect your IP and GPS location** within seconds
- 🔔 Sends results to **Discord or any webhook endpoint**
- 🔁 Redirects the user to a harmless site like Google or Amazon, making it nearly invisible

This is **not malware** — it's a proof-of-concept meant to **educate** and **raise awareness**.

> Think twice before sharing your location. This tool proves how simple it is to capture and track someone using only static hosting + a CAPTCHA.

---

## 🌟 Features

- ✅ **Cloudflare Turnstile CAPTCHA** required before access
- 📍 Captures **browser geolocation (lat/lon)** and **public IP**
- 🔔 Sends results to your **Discord webhook**
- 🔁 Supports **custom redirect** (e.g. Amazon, domain.com)
- ☁️ Runs entirely on **Cloudflare Pages + Functions**
- 🔐 Uses **Cloudflare Secrets** for secure backend credentials

---

## 🚀 Quick Start

### 1. Clone the Repo

```bash
git clone https://github.com/00o-sh/geophish.git
cd geophish
```

### 2. Set Environment Variables in Cloudflare Pages

| Name              | Type   | Value                        |
|-------------------|--------|------------------------------|
| `TURNSTILE_SECRET`| Secret | Your Turnstile **secret key**|
| `DISCORD_WEBHOOK` | Secret | Your **Discord webhook URL** |

### 3. Configure `index.html`

Replace with your **Turnstile Site Key**:

```html
<div class="cf-turnstile" data-sitekey="YOUR_SITE_KEY" data-callback="onVerified"></div>
```

### 4. Deploy to Cloudflare Pages

Push to GitHub and connect the repo to Cloudflare Pages.

---

## 🔗 Usage

### ▶️ Default redirect (to Google)

```
https://your-site.pages.dev/
```

### 🎯 Custom redirect (to Amazon, etc.)

```
https://your-site.pages.dev/?redirect=https://amazon.com
```

---

## 📁 Project Structure

```
/
  └── index.html         # CAPTCHA form (auto-submits)
/functions
  ├── send.js            # Verifies CAPTCHA → prompts for geolocation
  └── geo.js             # Logs IP + location to Discord
```

---

## 📦 How It Works

1. User visits `/` or `/?redirect=https://example.com`
2. CAPTCHA is displayed using Cloudflare Turnstile
3. On solve, `/send` verifies and injects geolocation script
4. Client sends location to `/geo`
5. Server logs IP + lat/lon to Discord
6. User is redirected to the destination (e.g. Google)

---

## 🛡️ Security & Ethics

- ⚠️ If location is already allowed in the browser, it is captured automatically and immediately — no further prompts
- 📍 This demonstrates how quickly and quietly location can be harvested without user awareness
- **All secrets** are stored securely as Cloudflare Pages environment variables
- The goal is to **educate**, not exploit

---

## 🙏 Credits

- Original project: [GeoPhish by @thegoodhackertv](https://github.com/thegoodhackertv/Geophish)
- Rebuilt & maintained by [@00o-sh](https://github.com/00o-sh)

---

## 📄 License

Hippocratic License v2.1 — Use is prohibited for surveillance, stalking, or unethical tracking. See [LICENSE](LICENSE) for full terms.

By using this project, you agree to uphold ethical usage in accordance with the [Hippocratic License](https://firstdonoharm.dev/version/2.1/).