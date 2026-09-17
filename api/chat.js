// api/chat.js
export default async function handler(req, res) {
    // Hanya izinkan method POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Ambil API Key dari Environment Variable Vercel
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ 
            error: 'API Key belum diatur di Environment Variables Vercel.' 
        });
    }

    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt tidak boleh kosong' });
        }

        // Panggil Google Gemini API
        const googleResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            }
        );

        const data = await googleResponse.json();

        // Jika Google menolak (misal error 401/400)
        if (!googleResponse.ok) {
            console.error('Google API Error:', data);
            return res.status(googleResponse.status).json({ 
                error: data.error?.message || 'Gagal menghubungi Google AI' 
            });
        }

        // Ambil teks balasan dari struktur JSON Google
        const balasanAI = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!balasanAI) {
            return res.status(500).json({ error: 'Format balasan AI tidak dikenali' });
        }

        // Kirim balasan ke frontend
        return res.status(200).json({ balasan: balasanAI });

    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
}
