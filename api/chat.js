import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    // 1. Hanya izinkan metode HTTP POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { message, history, apiContextData } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
        }

        // 2. Daftar API Keys untuk Rotasi saat terjadi Rate Limit
        const apiKeys = [
            process.env.GEMINI_API_SATU,
            process.env.GEMINI_API_DUA,
            process.env.GEMINI_API_TIGA
        ].filter(Boolean); // Membuang nilai undefined/kosong jika key tidak diset

        if (apiKeys.length === 0) {
            return res.status(500).json({ error: 'API Key belum dikonfigurasi di Environment Variables Vercel.' });
        }

        // 3. Rakit Format Input + Konteks JSON dari API (Poin 5)
        let formattedInput = message;
        if (apiContextData) {
            formattedInput = `[KONTEKS DATA RESMI DARI API QALBU]:\n${JSON.stringify(apiContextData)}\n\n[PERTANYAAN USER]:\n${message}`;
        }

        // 4. Instruksi Sistem Ketat (Poin 4: Hemat token & Tolak selain topik Islami/Qalbu)
        const systemInstruction = `Kamu adalah 'Qalbu AI', asisten Islami khusus aplikasi Qalbu.
ATURAN KETAT:
1. Hanya jawab pertanyaan terkait Al-Quran, Doa Harian, Dzikir, dan Jadwal Shalat.
2. Jika pengguna bertanya di luar topik agama Islam atau fitur Qalbu, TOLAK dengan sopan dalam 1 kalimat (contoh: "Maaf, saya hanya dapat membantu pertanyaan seputar Al-Quran, Doa, dan Jadwal Shalat.").
3. Jawab secara ringkas, padat, langsung ke intinya, dan hemat kata untuk menghemat konsumsi token.
4. Gunakan data kontekstual resmi yang diberikan jika ada.`;

        // 5. Menyusun Riwayat Percakapan (Poin 1)
        const formattedContents = [];
        
        // Memasukkan riwayat percakapan sebelumnya jika ada
        if (Array.isArray(history) && history.length > 0) {
            history.forEach(item => {
                if (item.role && item.parts && item.parts[0]?.text) {
                    formattedContents.push({
                        role: item.role,
                        parts: [{ text: item.parts[0].text }]
                    });
                }
            });
        }

        // Memasukkan pesan terbaru dari user
        formattedContents.push({
            role: "user",
            parts: [{ text: formattedInput }]
        });

        // 6. Loop Rotasi API Key (Poin 3: Otomatis berpindah jika terkena Limit 429)
        let lastError = null;
        for (const apiKey of apiKeys) {
            try {
                const client = new GoogleGenAI({ apiKey });

                const interaction = await client.interactions.create({
                    agent: "antigravity-preview-09-2026",
                    input: formattedContents,
                    environment: "remote",
                    agent_config: {
                        type: "antigravity",
                        model: "gemini-3.8-flash", // Model cepat, stabil, & hemat token
                    },
                    system_instruction: { parts: [{ text: systemInstruction }] },
                    generationConfig: {
                        maxOutputTokens: 300, // Membatasi output agar hemat token
                        temperature: 0.3      // Menjaga presisi jawaban agar tidak halusinasi
                    }
                }, { timeout: 30000 });

                // Jika eksekusi berhasil, kirim jawaban dan hentikan perulangan rotasi
                return res.status(200).json({ reply: interaction.output_text });

            } catch (err) {
                console.warn(`API Key gagal/terkena limit. Mencoba API Key berikutnya... Error:`, err.message);
                lastError = err;
            }
        }

        // Jika semua API Key di dalam daftar mengalami kegagalan / limit
        return res.status(429).json({ 
            error: 'Semua API Key sedang mencapai batas kuota harian/permenit. Silakan coba lagi nanti.' 
        });

    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server Vercel.' });
    }
}