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

function checkAndManageUserLimit() {
    const MAX_DAILY_REQUESTS = 10;
    const today = new Date().toISOString().split('T')[0];

    let usageData = JSON.parse(localStorage.getItem('qalbu_ai_usage'));

    if (!usageData || usageData.date !== today) {
        usageData = {
            date: today,
            count: 0
        };
        localStorage.removeItem('qalbu_ai_chat_history');
        chatHistory = [];
    }

    if (usageData.count >= MAX_DAILY_REQUESTS) {
        alert("Kamu telah mencapai batas 10 kali pertanyaan AI per hari. Kuota akan di-reset otomatis besok!");
        return false;
    }

    return true;
}

function incrementUserUsage() {
    const today = new Date().toISOString().split('T')[0];
    let usageData = JSON.parse(localStorage.getItem('qalbu_ai_usage')) || { date: today, count: 0 };
    usageData.count += 1;
    localStorage.setItem('qalbu_ai_usage', JSON.stringify(usageData));
}

// Fungsi merender percakapan lama jika halaman di-refresh (Menggunakan Format AI Rapi)
function renderExistingHistoryUI() {
    if (chatHistory.length > 0) {
        chatInputFirstSection.classList.add('hidden');
        chatInputSection.classList.remove('hidden');
        heroSection.classList.add('hidden');

        chatHistory.forEach(item => {
            if (item.role === 'user') {
                chatOutputSection.innerHTML += `
                    <div class="flex items-end justify-end space-x-2 mb-4">
                        <div class="p-3 rounded-xl rounded-br-none max-w-[85%] sm:max-w-[75%] bg-blue-600 text-white">
                            <p class="text-sm leading-relaxed">${escapeHtml(item.parts[0].text)}</p>
                        </div>
                    </div>`;
            } else if (item.role === 'model') {
                chatOutputSection.innerHTML += `
                    <div class="flex items-start space-x-2 mb-4">
                        <div class="p-4 rounded-xl rounded-bl-none max-w-[85%] sm:max-w-[75%] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 prose dark:prose-invert max-w-none">
                            ${formatAiResponse(item.parts[0].text)}
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

async function fetchAiResponse(chatInput, currentTextArea, currentSearchBtn, contextData = null) {
    if (!checkAndManageUserLimit()) {
        return;
    }

    chatInputFirstSection.classList.add('hidden');
    chatInputSection.classList.remove('hidden');
    heroSection.classList.add('hidden');

    toggleLoadingState(true, currentTextArea, currentSearchBtn);

    const loadingId = 'ai-loading-' + Date.now();
    renderUserAndLoadingMessage(chatInput, loadingId);
    chatOutputSection.scrollTop = chatOutputSection.scrollHeight;

    try {
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

        const responseText = await response.text();
        let data;

        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error("Respon Server Bukan Format JSON:", responseText);
            throw new Error("Server mengembalikan balasan kosong atau tidak valid.");
        }

        if (response.ok && data.reply) {
            incrementUserUsage();

            chatHistory.push({ role: "user", parts: [{ text: chatInput }] });
            chatHistory.push({ role: "model", parts: [{ text: data.reply }] });
            localStorage.setItem('qalbu_ai_chat_history', JSON.stringify(chatHistory));

            replaceLoadingWithResponse(loadingId, data.reply);
        } else {
            removeLoadingMessage(loadingId);
            alert("Gagal mendapatkan respon dari AI.");
        }
    } catch (error) {
        console.error("Error Fetch AI:", error);
        removeLoadingMessage(loadingId);
        alert("Terjadi kesalahan jaringan atau server");
    } finally {
        toggleLoadingState(false, currentTextArea, currentSearchBtn);
        chatOutputSection.scrollTop = chatOutputSection.scrollHeight;
    }
}

function renderUserAndLoadingMessage(chatInput, loadingId) {
    chatOutputSection.innerHTML += `
        <!-- Pesan User -->
        <div class="flex items-end justify-end space-x-2 mb-4">
            <div class="p-3 rounded-xl rounded-br-none max-w-[85%] sm:max-w-[75%] bg-blue-600 text-white">
                <p class="text-sm leading-relaxed">${escapeHtml(chatInput)}</p>
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

// FUNGSI UTAMA: Mengganti Loading dengan Respon AI yang Sudah Diformat Rapi
function replaceLoadingWithResponse(loadingId, aiResponse) {
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) {
        const formattedHTML = formatAiResponse(aiResponse);
        loadingEl.outerHTML = `
            <div class="flex items-start space-x-2 mb-4">
                <div class="p-4 rounded-xl rounded-bl-none max-w-[85%] sm:max-w-[75%] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 leading-relaxed space-y-3">
                    ${formattedHTML}
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

// FUNGSI FORMATTER: Mengubah Markdown & Teks Arab Menjadi HTML Berstyle Rapi
function formatAiResponse(rawText) {
    if (!rawText) return '';

    let parsedHtml = '';

    // 1. Jika Marked.js tersedia, parse sintaks Markdown
    if (typeof marked !== 'undefined') {
        parsedHtml = marked.parse(rawText);
    } else {
        // Fallback jika Marked.js belum di-load
        parsedHtml = rawText
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    // 2. Deteksi Karakter Arab menggunakan Regex Unicode (0600-06FF) dan bungkus dengan class Font Arabic
    const arabicRegex = /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+([\s\n\r\t]+[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+)*)/g;
    
    parsedHtml = parsedHtml.replace(arabicRegex, function(match) {
        return `<span class="font-arabic text-xl sm:text-2xl leading-loose block text-right my-2 text-slate-900 dark:text-slate-50">${match}</span>`;
    });

    return parsedHtml;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}