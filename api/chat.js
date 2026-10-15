import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    // Pastikan header selalu mengembalikan JSON
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', 'https://qalbu-alquran-and-prayer.vercel.app'); // Ganti '*' dengan domain tertentu jika ingin lebih aman
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // 1. Validasi HTTP Method
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Gunakan POST.' });
    }

    try {
        const { message, history, apiContextData } = req.body || {};

        if (!message) {
            return res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
        }

        // 2. Ambil daftar API Key dari Vercel Environment Variables
        const apiKeys = [
            process.env.API_KEY_SATU,
            process.env.API_KEY_DUA,
            process.env.API_KEY_TIGA
        ].filter(Boolean);

        if (apiKeys.length === 0) {
            console.error("Error: Tidak ada API Key yang ditemukan di Environment Variables.");
            return res.status(500).json({ error: 'API Key belum dikonfigurasi di Vercel.' });
        }

        // 3. Format Input & Konteks Data
        let formattedInput = message;
        if (apiContextData) {
            formattedInput = `[KONTEKS DATA RESMI API QALBU]:\n${JSON.stringify(apiContextData)}\n\n[PERTANYAAN USER]:\n${message}`;
        }

        const systemInstruction = `Kamu adalah 'Qalbu AI', asisten Islami khusus aplikasi Qalbu.
ATURAN KETAT:
1. Hanya jawab pertanyaan terkait Al-Quran, Doa Harian, Dzikir, dan Jadwal Shalat.
2. Jika pengguna bertanya di luar topik agama Islam atau fitur Qalbu, TOLAK dengan sopan dalam 1 kalimat.
3. Jawab secara ringkas, padat, langsung ke intinya, dan hemat kata.`;

        // 4. Susun Format Riwayat Percakapan (History)
        const formattedContents = [];
        if (Array.isArray(history) && history.length > 0) {
            history.forEach(item => {
                if (item.role && item.parts && item.parts[0]?.text) {
                    formattedContents.push({
                        role: item.role === 'model' ? 'model' : 'user',
                        parts: [{ text: item.parts[0].text }]
                    });
                }
            });
        }

        // Tambahkan input terbaru
        formattedContents.push({
            role: "user",
            parts: [{ text: formattedInput }]
        });

        // 5. Loop Rotasi API Key saat Rate Limit
        let lastErrorMsg = "";
        for (const apiKey of apiKeys) {
            try {
                const client = new GoogleGenAI({ apiKey });

                const interaction = await client.interactions.create({
                    agent: "antigravity-preview-09-2026",
                    input: formattedContents,
                    environment: "remote",
                    agent_config: {
                        type: "antigravity",
                        model: "gemini-3.5-flash-lite",
                        max_total_tokens: 10000,
                    },
                    system_instruction: systemInstruction,
                }, { timeout: 25000 });

                // Pastikan ada output teks dari balasan AI
                const replyText = interaction.output_text || "Maaf, AI tidak memberikan respon.";
                return res.status(200).json({ reply: replyText });

            } catch (err) {
                console.warn(`Attempt gagal pada key: ${apiKey.slice(0, 5)}... Error:`, err.message);
                lastErrorMsg = err.message || "Gagal memproses ke Gemini API";
            }
        }

        // Jika semua API Key gagal
        return res.status(429).json({ 
            error: `Semua API Key mengalami pembatasan/limit. Detail: ${lastErrorMsg}` 
        });

    } catch (error) {
        console.error('Fatal Serverless Handler Error:', error);
        return res.status(500).json({ 
            error: `Terjadi kesalahan internal server: ${error.message || 'Unknown error'}` 
        });
    }
}