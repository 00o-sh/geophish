export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  const token = form.get('cf-turnstile-response');
  const ip = request.headers.get("cf-connecting-ip");

  // Get redirect target from query string
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
    <head><title>Processing...</title></head>
    <body>
      <script>
        const redirect = ${JSON.stringify(redirectURL)};
        navigator.geolocation.getCurrentPosition(
          function(location) {
            fetch('/geo', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                lat: location.coords.latitude,
                lon: location.coords.longitude
              })
            }).finally(() => {
              window.location.href = redirect;
            });
          },
          function() {
            window.location.href = redirect;
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