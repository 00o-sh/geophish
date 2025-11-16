export async function onRequestPost({ request, env }) {
  const form = await request.formData();

  const token = form.get('cf-turnstile-response');
  const redirect = form.get("redirect") || "https://www.google.com";
  const noredirect = form.get("noredirect") === "1";
  const ip = request.headers.get("cf-connecting-ip");

  if (!token) {
    return new Response("Missing CAPTCHA token", { status: 400 });
  }

  // Validate redirect
  let redirectURL;
  try {
    redirectURL = new URL(redirect).toString();
  } catch {
    redirectURL = "https://www.google.com";
  }

  // Verify Turnstile
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

  // Inject HTML with geolocation logic
  const html = `
    <!DOCTYPE html>
    <html>
    <head><title>Location Logging</title></head>
    <body>
      <script>
        const redirect = ${JSON.stringify(redirectURL)};
        const noredirect = ${noredirect};

        navigator.geolocation.getCurrentPosition(function(location) {
          fetch('/geo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: location.coords.latitude,
              lon: location.coords.longitude
            })
          }).finally(function() {
            if (noredirect) {
              document.body.innerHTML = "<h2>✅ Location received. Thank you.</h2>";
            } else {
              window.location.href = redirect;
            }
          });
        }, function() {
          if (noredirect) {
            document.body.innerHTML = "<h2>⚠️ Location access denied.</h2>";
          } else {
            window.location.href = redirect;
          }
        });
      </script>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}