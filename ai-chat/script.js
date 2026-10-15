document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initMobileMenu();
});

function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    const html = document.documentElement;

    toggleBtn.addEventListener('click', () => {
        html.classList.toggle('dark');
        localStorage.theme = html.classList.contains('dark') ? 'dark' : 'light';
    });
}

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const iconOpen = document.getElementById('menu-icon-open');
    const iconClose = document.getElementById('menu-icon-close');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            iconOpen.classList.toggle('hidden');
            iconClose.classList.toggle('hidden');
        });
    }
}
// ==========================================
// 1. LOGIKA UTAMA & INISIALISASI
// ==========================================

// Variable Global Riwayat Percakapan
let chatHistory = JSON.parse(localStorage.getItem('qalbu_ai_chat_history')) || [];

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initMobileMenu();
    renderExistingHistoryUI(); // Merender riwayat percakapan lama jika ada di localStorage
});

function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    const html = document.documentElement;

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            html.classList.toggle('dark');
            localStorage.theme = html.classList.contains('dark') ? 'dark' : 'light';
        });
    }
}

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const iconOpen = document.getElementById('menu-icon-open');
    const iconClose = document.getElementById('menu-icon-close');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            iconOpen.classList.toggle('hidden');
            iconClose.classList.toggle('hidden');
        });
    }
}


// ==========================================
// 2. LOGIKA LIMIT USER & CHAT HISTORY LOCALSTORAGE
// ==========================================

// Poin 2: Fungsi Pengecekan Limit 10x Request Per Hari & Reset Otomatis
function checkAndManageUserLimit() {
    const MAX_DAILY_REQUESTS = 10;
    const today = new Date().toISOString().split('T')[0]; // Format Tanggal: YYYY-MM-DD

    let usageData = JSON.parse(localStorage.getItem('qalbu_ai_usage'));

    // Jika data penggunaan belum ada ATAU tanggal hari ini sudah berbeda dari simpanan
    if (!usageData || usageData.date !== today) {
        usageData = {
            date: today,
            count: 0
        };
        // Reset riwayat percakapan secara otomatis saat pergantian hari
        localStorage.removeItem('qalbu_ai_chat_history');
        chatHistory = [];
    }

    // Cek apakah penggunaan melebihi batas harian
    if (usageData.count >= MAX_DAILY_REQUESTS) {
        alert("Kamu telah mencapai batas 10 kali pertanyaan AI per hari. Kuota akan di-reset otomatis besok!");
        return false;
    }

    return true;
}

// Fungsi untuk Menambah Hitungan Penggunaan Setelah Request Berhasil
function incrementUserUsage() {
    const today = new Date().toISOString().split('T')[0];
    let usageData = JSON.parse(localStorage.getItem('qalbu_ai_usage')) || { date: today, count: 0 };
    usageData.count += 1;
    localStorage.setItem('qalbu_ai_usage', JSON.stringify(usageData));
}

// Fungsi merender percakapan lama jika halaman di-refresh
function renderExistingHistoryUI() {
    if (chatHistory.length > 0) {
        chatInputFirstSection.classList.add('hidden');
        chatInputSection.classList.remove('hidden');
        heroSection.classList.add('hidden');

        chatHistory.forEach(item => {
            if (item.role === 'user') {
                chatOutputSection.innerHTML += `
                    <div class="flex items-end justify-end space-x-2 mb-4">
                        <div class="p-3 rounded-xl rounded-br-none max-w-[75%] bg-blue-600 text-white">
                            <p class="text-sm">${escapeHtml(item.parts[0].text)}</p>
                        </div>
                    </div>`;
            } else if (item.role === 'model') {
                chatOutputSection.innerHTML += `
                    <div class="flex items-start space-x-2 mb-4">
                        <div class="p-3 rounded-xl rounded-bl-none max-w-[75%] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <p class="text-sm text-slate-900 dark:text-slate-100">${escapeHtml(item.parts[0].text)}</p>
                        </div>
                    </div>`;
            }
        });
        chatOutputSection.scrollTop = chatOutputSection.scrollHeight;
    }
}


// ==========================================
// 3. ELEMEN DOM & EVENT LISTENER UI
// ==========================================

const textAreaFirst = document.getElementById('search-first');
const searchBtnFirst = document.getElementById('search-btn-first');
const textAreaAi = document.getElementById('search-ai');
const searchBtnAi = document.getElementById('search-btn-ai');
const chatOutputSection = document.getElementById('chat-container');
const heroSection = document.getElementById('hero');
const chatInputSection = document.getElementById('chat-input');
const chatInputFirstSection = document.getElementById('chat-input-first');

// Auto-resize & button state listener untuk Landing Textarea
if (textAreaFirst) {
    textAreaFirst.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = `${this.scrollHeight}px`;
        
        if (this.value.trim()) {
            searchBtnFirst.classList.remove('opacity-50', 'cursor-not-allowed');
            searchBtnFirst.classList.add('hover:bg-slate-800', 'dark:hover:bg-slate-200');
        } else {
            searchBtnFirst.classList.add('opacity-50', 'cursor-not-allowed');
            searchBtnFirst.classList.remove('hover:bg-slate-800', 'dark:hover:bg-slate-200');
        }

        if (this.scrollHeight >= 192) {
            this.classList.remove('overflow-hidden');
            this.classList.add('overflow-y-auto');
        } else {
            this.classList.add('overflow-hidden');
            this.classList.remove('overflow-y-auto');
        }
    });

    textAreaFirst.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey && this.value.trim() !== '') {
            e.preventDefault();
            searchBtnFirst.click();
        }
    });
}

// Auto-resize & button state listener untuk Chat Output Textarea
if (textAreaAi) {
    textAreaAi.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = `${this.scrollHeight}px`;
        
        if (this.value.trim()) {
            searchBtnAi.classList.remove('opacity-50', 'cursor-not-allowed');
            searchBtnAi.classList.add('hover:bg-slate-800', 'dark:hover:bg-slate-200');
        } else {
            searchBtnAi.classList.add('opacity-50', 'cursor-not-allowed');
            searchBtnAi.classList.remove('hover:bg-slate-800', 'dark:hover:bg-slate-200');
        }

        if (this.scrollHeight >= 192) {
            this.classList.remove('overflow-hidden');
            this.classList.add('overflow-y-auto');
        } else {
            this.classList.add('overflow-hidden');
            this.classList.remove('overflow-y-auto');
        }
    });

    textAreaAi.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey && this.value.trim() !== '') {
            e.preventDefault();
            searchBtnAi.click();
        }
    });
}

// Event handler klik tombol kirim
if (searchBtnFirst) {
    searchBtnFirst.addEventListener('click', function () {
        const query = textAreaFirst.value.trim();
        if (query !== '') {
            fetchAiResponse(query, textAreaFirst, searchBtnFirst);
        }
    });
}

if (searchBtnAi) {
    searchBtnAi.addEventListener('click', function () {
        const query = textAreaAi.value.trim();
        if (query !== '') {
            fetchAiResponse(query, textAreaAi, searchBtnAi);
        }
    });
}


// ==========================================
// 4. LOGIKA HELPER TERHUBUNG API AI
// ==========================================

// Helper toggle loading pada button & textarea
function toggleLoadingState(isLoading, textArea, searchBtn) {
    if (isLoading) {
        textArea.disabled = true;
        searchBtn.disabled = true;
        searchBtn.classList.add('opacity-50', 'cursor-not-allowed');
        searchBtn.dataset.originalContent = searchBtn.innerHTML;
        searchBtn.innerHTML = `
            <svg class="animate-spin h-5 w-5 text-current mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        `;
    } else {
        textArea.disabled = false;
        searchBtn.disabled = false;
        if (searchBtn.dataset.originalContent) {
            searchBtn.innerHTML = searchBtn.dataset.originalContent;
        }
        textArea.value = '';
        textArea.style.height = 'auto';
    }
}

// Fungsi Utama Penanganan Kirim Pesan & Integrasi API Vercel
async function fetchAiResponse(chatInput, currentTextArea, currentSearchBtn, contextData = null) {
    // 1. Cek Limit Harian Pengguna
    if (!checkAndManageUserLimit()) {
        return;
    }

    // 2. Ubah Tampilan UI ke Mode Chat
    chatInputFirstSection.classList.add('hidden');
    chatInputSection.classList.remove('hidden');
    heroSection.classList.add('hidden');

    // 3. Aktifkan Loading State pada tombol & input
    toggleLoadingState(true, currentTextArea, currentSearchBtn);

    // 4. Render Pesan User & Skeleton Loading AI ke Layar
    const loadingId = 'ai-loading-' + Date.now();
    renderUserAndLoadingMessage(chatInput, loadingId);
    chatOutputSection.scrollTop = chatOutputSection.scrollHeight;

    try {
        // 5. Panggil Serverless Function Vercel (/api/chat)
        const response = await fetch('https://qalbu-alquran-and-prayer.vercel.app/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: chatInput,
                history: chatHistory,
                apiContextData: contextData
            })
        });

        // Ambil respon sebagai teks terlebih dahulu untuk menghindari SyntaxError unexpected end of JSON
        const responseText = await response.text();
        let data;

        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error("Respon Server Bukan Format JSON:", responseText);
            throw new Error("Server mengembalikan balasan kosong atau tidak valid.");
        }

        if (response.ok && data.reply) {
            // 6. Tambah hitungan limit harian user
            incrementUserUsage();

            // 7. Simpan pesan baru ke riwayat percakapan
            chatHistory.push({ role: "user", parts: [{ text: chatInput }] });
            chatHistory.push({ role: "model", parts: [{ text: data.reply }] });
            localStorage.setItem('qalbu_ai_chat_history', JSON.stringify(chatHistory));

            // 8. Ganti Skeleton Loading dengan Jawaban Asli AI
            replaceLoadingWithResponse(loadingId, data.reply);
        } else {
            // Jika ada kesalahan respon/limit dari server
            removeLoadingMessage(loadingId);
            alert("Error: " + (data.error || "Gagal mendapatkan respon dari AI."));
        }
    } catch (error) {
        console.error("Error Fetch AI:", error);
        removeLoadingMessage(loadingId);
        alert("Terjadi kesalahan jaringan atau server Vercel: " + error.message);
    } finally {
        // 9. Matikan Loading State & Reset Input
        toggleLoadingState(false, currentTextArea, currentSearchBtn);
        chatOutputSection.scrollTop = chatOutputSection.scrollHeight;
    }
}

function renderUserAndLoadingMessage(chatInput, loadingId) {
    chatOutputSection.innerHTML += `
        <!-- Pesan User -->
        <div class="flex items-end justify-end space-x-2 mb-4">
            <div class="p-3 rounded-xl rounded-br-none max-w-[75%] bg-blue-600 text-white">
                <p class="text-sm">${escapeHtml(chatInput)}</p>
            </div>
        </div>
        
        <!-- Skeleton Loading AI Response -->
        <div id="${loadingId}" class="flex items-start space-x-2 mb-4 animate-pulse">
            <div class="p-4 rounded-xl rounded-bl-none max-w-[75%] w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div class="h-3 bg-slate-300 dark:bg-slate-700 rounded w-3/4"></div>
                <div class="h-3 bg-slate-300 dark:bg-slate-700 rounded w-1/2"></div>
            </div>
        </div>
    `;
}

function replaceLoadingWithResponse(loadingId, aiResponse) {
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) {
        loadingEl.outerHTML = `
            <div class="flex items-start space-x-2 mb-4">
                <div class="p-3 rounded-xl rounded-bl-none max-w-[75%] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p class="text-sm text-slate-900 dark:text-slate-100">${escapeHtml(aiResponse)}</p>
                </div>
            </div>
        `;
    }
}

function removeLoadingMessage(loadingId) {
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) {
        loadingEl.remove();
    }
}

// Utility kecil untuk mencegah Cross-Site Scripting (XSS)
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}