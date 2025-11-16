export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  const token = form.get('cf-turnstile-response');
  const ip = request.headers.get("cf-connecting-ip");

  // Get redirect URL or fallback to /geo.html
  const url = new URL(request.url);
  const redirectURL = url.searchParams.get("redirect") || "/geo.html";

  if (!token) {
    return new Response("Missing CAPTCHA token", { status: 400 });
  }

  const verifyResp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: env.TURNSTILE_SECRET,
      response: token,
      remoteip: ip
    })
  });

  const verifyData = await verifyResp.json();
  if (!verifyData.success) {
    return new Response("CAPTCHA verification failed", { status: 403 });
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Verifying Location...</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body { font-family: sans-serif; text-align: center; margin-top: 20vh; padding: 1rem; }
        #status { font-size: 1.2rem; }
      </style>
    </head>
    <body>
      <div id="status">📍 Requesting your location...</div>
      <script>
        const redirect = ${JSON.stringify(redirectURL)};

        function updateStatus(msg) {
          const el = document.getElementById("status");
          if (el) el.innerText = msg;
        }

        navigator.geolocation.getCurrentPosition(
          function(location) {
            if (!location || !location.coords) {
              updateStatus("⚠️ Location data is incomplete.");
              setTimeout(() => window.location.href = redirect, 2000);
              return;
            }

            console.log("📍 Location granted:", location.coords);

            fetch("/geo", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                lat: location.coords.latitude,
                lon: location.coords.longitude
              })
            })
            .then(r => r.text())
            .then(txt => {
              console.log("✅ /geo response:", txt);
              updateStatus("✅ Location logged. Redirecting...");
            })
            .catch(err => {
              console.warn("❌ /geo failed:", err);
              updateStatus("⚠️ Location logged, but network error occurred.");
            })
            .finally(() => {
              setTimeout(() => window.location.href = redirect, 2000);
            });
          },
          function(error) {
            console.warn("❌ Geolocation denied or failed:", error);
            updateStatus("⚠️ Location denied. Redirecting...");
            setTimeout(() => window.location.href = redirect, 2000);
          }
        );
      </script>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}