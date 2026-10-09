document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    fetchJadwalShalat();
    fetchSurahPopuler();
    checkTerakhirDibaca();
});

// --- 1. Dark Mode Toggle ---
function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    // Cek preferensi sistem atau local storage
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }

    toggleBtn.addEventListener('click', () => {
        html.classList.toggle('dark');
        if (html.classList.contains('dark')) {
            localStorage.theme = 'dark';
        } else {
            localStorage.theme = 'light';
        }
    });
}

// --- 2. Fetch Jadwal Shalat (Menggunakan MyQuran / EQuran API) ---
async function fetchJadwalShalat() {
    const grid = document.getElementById('jadwal-grid');
    
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const tanggalHariIni = today.getDate();

    try {
        const request1 = new Request("https://equran.id/api/v2/shalat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                provinsi: "jawa tengah",
                kabkota: "kota salatiga",
                bulan: month,
                tahun: year
            })
        });

        const response = await fetch(request1);
        const data = await response.json();

        if (data.code === 200) {
            const jadwal = data.data.jadwal.find((item) => item.tanggal === tanggalHariIni);
            const waktuShalat = [
                { nama: 'Imsak', waktu: jadwal.imsak, icon: 'ph-moon-stars' },
                { nama: 'Subuh', waktu: jadwal.subuh, icon: 'ph-cloud-sun' },
                { nama: 'Dzuhur', waktu: jadwal.dzuhur, icon: 'ph-sun' },
                { nama: 'Ashar', waktu: jadwal.ashar, icon: 'ph-cloud' },
                { nama: 'Maghrib', waktu: jadwal.maghrib, icon: 'ph-sun-horizon' },
                { nama: 'Isya', waktu: jadwal.isya, icon: 'ph-moon' }
            ];

            grid.innerHTML = ''; // Kosongkan state loading
            
            waktuShalat.forEach(waktu => {
                grid.innerHTML += `
                    <div class="bg-white dark:bg-slate-900 p-4 border border-slate-300 dark:border-slate-800 rounded-2xl text-center card-hover-fx">
                        <i class="ph ${waktu.icon} text-2xl text-slate-700 dark:text-slate-300 mb-2"></i>
                        <p class="text-xs text-slate-600 dark:text-slate-400 font-semibold tracking-wider mb-1">${waktu.nama}</p>
                        <p class="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">${waktu.waktu}</p>
                    </div>
                `;
            });
        }
    } catch (error) {
        grid.innerHTML = `<div class="col-span-2 md:col-span-6 text-center py-4 text-red-600 dark:text-red-400 font-semibold">Gagal memuat jadwal shalat.</div>`;
        console.error('Error fetching jadwal:', error);
    }
}

// --- 3. Fetch Surah Populer (Menggunakan API EQuran.id v2) ---
async function fetchSurahPopuler() {
    const grid = document.getElementById('surah-grid');
    const targetSurah = [1, 18, 36, 55, 56, 67]; 
    
    try {
        const response = await fetch('https://equran.id/api/v2/surat');
        const data = await response.json();

        if (data.code === 200) {
            grid.innerHTML = '';
            
            const filteredSurah = data.data.filter(surat => targetSurah.includes(surat.nomor));

            filteredSurah.forEach(surat => {
                grid.innerHTML += `
                    <a href="/al-quran/detail-surah.html?nomor=${surat.nomor}" class="group bg-white dark:bg-slate-900 p-6 border border-slate-300 dark:border-slate-800 rounded-2xl flex items-center justify-between card-hover-fx hover:border-slate-900 dark:hover:border-slate-100 transition-colors">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-800 dark:text-slate-200">
                                ${surat.nomor}
                            </div>
                            <div>
                                <h3 class="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-brand-light dark:group-hover:text-brand-dark transition-colors">${surat.namaLatin}</h3>
                                <p class="text-xs text-slate-600 dark:text-slate-400 mt-1 tracking-wider font-medium">${surat.tempatTurun} • ${surat.jumlahAyat} Ayat</p>
                            </div>
                        </div>
                        <div class="font-arabic text-2xl text-slate-900 dark:text-slate-100 text-right">
                            ${surat.nama}
                        </div>
                    </a>
                `;
            });
        }
    } catch (error) {
        grid.innerHTML = `<div class="col-span-1 md:col-span-3 text-center py-4 text-red-600 dark:text-red-400 font-semibold">Gagal memuat data surah.</div>`;
        console.error('Error fetching surah:', error);
    }
}

// --- 4. Cek Fitur "Terakhir Dibaca" ---
function checkTerakhirDibaca() {
    const container = document.getElementById('terakhir-dibaca-container');
    const lastReadData = localStorage.getItem('qalbu_last_read');

    if (lastReadData) {
        const parsedData = JSON.parse(lastReadData);
        const surahName = parsedData.surahName;
        const surahNumber = parsedData.surahNumber;
        const ayat = `Ayat ${parsedData.ayatNumber}`;
        container.classList.remove('hidden');

        container.innerHTML = `
        <div class="bg-slate-200/70 dark:bg-slate-900 rounded-2xl p-6 border border-slate-300 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                <span class="text-xs font-bold tracking-widest text-brand-light dark:text-brand-dark">Terakhir Dibaca</span>
                <h3 id="last-read-title" class="text-xl font-bold mt-1 text-slate-900 dark:text-slate-100">${surahName}</h3>
                <p id="last-read-ayat" class="text-slate-700 dark:text-slate-300 text-sm font-medium">${ayat}</p>
            </div>
            <a href="/al-quran/detail-surah.html?nomor=${surahNumber}" class="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                Lanjutkan
            </a>
        </div>`;
    }
}

const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const iconOpen = document.getElementById('menu-icon-open');
const iconClose = document.getElementById('menu-icon-close');
const mobileLinks = document.querySelectorAll('.mobile-nav-link');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    iconOpen.classList.toggle('hidden');
    iconClose.classList.toggle('hidden');
});

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        iconOpen.classList.remove('hidden');
        iconClose.classList.add('hidden');
    });
});