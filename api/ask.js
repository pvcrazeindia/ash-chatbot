export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { text, voice } = req.body;

    if (!text || !voice) {
      return res.status(400).json({ error: "Missing text or voice" });
    }

    // 🔑 GEMINI API KEY
    const GEMINI_API_KEY = "AIzaSyDEZCAf2jjqwMtjrFKM-mjIhwpBWynAQ2o";

    // 🔊 TTS WORKER URL
    const TTS_BASE = "https://wispy-king-df6b.couponwalamail.workers.dev";

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text:
                    "User ke sawalon ka short aur clear jawab Hindi ya Hinglish me do.\n\n" +
                    text
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 150
          }
        })
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      return res.status(502).json({ error: "Gemini error", details: err });
    }

    const data = await geminiRes.json();

    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Abhi jawab nahi mil paaya, thodi der baad try karo.";

    return res.json({
      answer,
      audio_url:
        `${TTS_BASE}/tts?voice=${voice}&text=` +
        encodeURIComponent(answer)
    });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}


