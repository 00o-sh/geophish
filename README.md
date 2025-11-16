[![Hippocratic License HL3-FULL](https://img.shields.io/static/v1?label=Hippocratic%20License&message=HL3-FULL&labelColor=5e2751&color=bc8c3d)](https://firstdonoharm.dev/version/3/0/full.html)

# GeoPhish (Cloudflare Pages Edition)

> ⚠️ **Proof-of-Concept**: Demonstrates how easily a user's precise location can be captured online using just a link and browser permissions.

GeoPhish is a modern, serverless rebuild of the original concept — rebuilt for **Cloudflare Pages**, with **Turnstile CAPTCHA**, and **Discord webhook logging**. It shows how simple it is to collect user geolocation with minimal friction. This is meant for **education**, **security awareness**, and **ethical testing** only.

---

## ⚠️ What This Demonstrates

- ✅ Many users click through CAPTCHAs without thinking
- ✅ Most browsers allow location sharing with minimal friction
- 📍 This project captures **IP + GPS location** in seconds
- 🔔 Sends the data to a **Discord webhook**
- 🔁 Redirects the user after logging (default `/geo.html` or custom link)

> This is **not malware** — it is a controlled proof-of-concept showing how easily location permissions can be abused.

---

## 🌟 Features

- 🔐 **Cloudflare Turnstile CAPTCHA**
- 📍 **Browser geolocation capture** via `navigator.geolocation`
- 📩 Logs to **Discord or any webhook**
- 🔁 Redirects to:
  - Default: `/geo.html`
  - Custom: `?redirect=https://example.com`
- ☁️ Serverless architecture using **Cloudflare Pages + Functions**
- 🔑 All sensitive values stored as **Cloudflare Secrets**

---

## 🚀 Quick Start

### 1. Clone the Repo

```bash
git clone https://github.com/00o-sh/geophish.git
cd geophish
```

### 2. Configure Environment Variables  
(Cloudflare Pages → Settings → Environment Variables)

| Name              | Type   | Value                        |
|-------------------|--------|------------------------------|
| `TURNSTILE_SECRET`| Secret | Your Turnstile secret key    |
| `DISCORD_WEBHOOK` | Secret | Discord webhook URL          |

### 3. Add Your Turnstile Site Key  
In `/public/index.html`:

```html
<div class="cf-turnstile" data-sitekey="YOUR_SITE_KEY" data-callback="onVerified"></div>
```

### 4. Deploy to Cloudflare Pages  
Push to GitHub → Connect repo to Cloudflare Pages.

---

## 📁 Project Structure

```
/public
  ├── index.html     # CAPTCHA entry page
  ├── geo.html       # Thank-you page after location capture

/functions
  ├── send.js        # Verifies CAPTCHA and requests geolocation
  └── geo.js         # Receives location + IP and posts to Discord
```

---

## 🔗 Usage

### ▶️ Default Flow (redirect to /geo.html)
```
https://your-site.pages.dev/
```

### 🎯 Custom Redirect After Logging
```
https://your-site.pages.dev/?redirect=https://amazon.com
```

---

## 📱 iOS Behavior (Important)

> 🍏 **iOS Safari & Chrome on iPhones do NOT allow automatic geolocation prompts** when triggered from a non-user gesture (e.g., after CAPTCHA submit).

### Why?
This is **intentional privacy protection** by Apple to prevent:

- Silent background location grabs  
- Redirect-based geolocation phishing  
- Auto-run permission prompts without user interaction

### Result:
On iOS, automatic location prompts **may not appear**, even if the site is allowed/granted before.

This is *good security behavior* — and GeoPhish demonstrates exactly why this matters.

---

## 🧩 How It Works

1. User visits the site  
2. Cloudflare Turnstile CAPTCHA loads  
3. After solving, `/functions/send.js` injects geolocation JS  
4. Browser attempts to prompt for location  
5. Coordinates + IP sent to **Discord webhook**  
6. User is redirected (`/geo.html` or custom URL)

---

## ⚖️ Security & Ethics

- ❗ If a user previously allowed location access, the browser will send it **instantly**, without prompting  
- 📂 All location data is sent only to **your configured webhook**  
- 🔐 No external storage; no tracking beyond what you explicitly configure  
- 📵 **This project must NOT be used for stalking, surveillance, or harassment**  
- 📜 Licensed under the **Hippocratic License HL3-FULL**, which prohibits unethical use

> ⚠️ Always obtain **explicit permission** before testing on real users.

---

## 🙏 Credits

- Inspired by [@thegoodhackertv’s original GeoPhish](https://github.com/thegoodhackertv/Geophish)
- Rebuilt and maintained by [@00o-sh](https://github.com/00o-sh)

---

## 📄 License

Hippocratic License HL3-FULL —  
Use is prohibited for unethical tracking, surveillance, or violation of human rights.  
See [LICENSE](LICENSE) for full details.

---

> ⭐ If this helped you understand browser privacy risks, consider starring the repo.  
> 🔁 Fork to build your own security awareness tools.