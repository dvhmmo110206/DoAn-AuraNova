// AURA NOVA AI Cinematic Co-Pilot Engine
// Next-generation intelligent movie discovery, mood analysis & instant playback assistant

const KNOWLEDGE_BASE = [
    {
        keywords: ['scifi', 'sci-fi', 'khoa học', 'viễn tưởng', 'cyberpunk', 'tương lai', 'hại não'],
        title: 'Neon Cyber Odyssey: 2099',
        rating: '9.4',
        match: '99%',
        genres: 'Sci-Fi • Cyberpunk • 4K HDR',
        poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=85',
        video: '/api/stream/neon_cyber_odyssey.mp4',
        reply: 'Nếu bạn yêu thích thế giới Cyberpunk huyền ảo và cốt truyện hại não sâu sắc, **Neon Cyber Odyssey: 2099** là kiệt tác bạn nhất định phải xem! Phim đạt chuẩn âm thanh vòm Dolby Atmos 7.1 đỉnh cao.'
    },
    {
        keywords: ['biển', 'đại dương', 'abyss', 'trench', 'quái vật', 'thám hiểm'],
        title: 'The Silent Abyss: Deep Trench',
        rating: '9.2',
        match: '98%',
        genres: 'Sci-Fi • Adventure • 4K IMAX',
        poster: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&auto=format&fit=crop&q=85',
        video: '/api/stream/deep_abyss_expedition.mp4',
        reply: 'Một chuyến lặn sâu 10,000m vào rãnh Mariana với độ căng thẳng nghẹt thở: **The Silent Abyss**. Cảnh quay sinh vật phát quang dưới đại dương siêu thực 4K sẽ khiến bạn choáng ngợp!'
    },
    {
        keywords: ['vũ trụ', 'không gian', 'hành tinh', 'orion', 'hố đen', 'galaxy', 'space'],
        title: 'Chronicles of Orion: Celestial Gate',
        rating: '9.5',
        match: '99%',
        genres: 'Space Opera • IMAX 70mm',
        poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&auto=format&fit=crop&q=85',
        video: '/api/stream/celestial_starlight.mp4',
        reply: 'Dành cho tâm hồn đam mê vẻ đẹp vô tận của vũ trụ: **Chronicles of Orion** do Christopher Nolan chỉ đạo với kỹ xảo IMAX 70mm và âm nhạc đỉnh cao của Ludwig Göransson.'
    },
    {
        keywords: ['hành động', 'action', 'đánh nhau', 'sát thủ', 'bắn súng', 'kịch tính', 'xả stress'],
        title: 'Shadow Protocol: Rain Assassin',
        rating: '9.0',
        match: '96%',
        genres: 'Action • Martial Arts • 4K',
        poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=85',
        video: '/api/stream/phantom_assassin_chronicles.mp4',
        reply: 'Cần nạp ngay adrenaline? **Shadow Protocol: Rain Assassin** mang đến các phân cảnh võ thuật cận chiến không cắt nối (one-shot) mãn nhãn dưới mưa đêm Seoul!'
    },
    {
        keywords: ['hoạt hình', 'anime', 'kỳ ảo', 'cảm xúc', 'nghệ thuật', 'shinkai', 'fantasy'],
        title: 'Tears of the Cosmos: Aurora Awakening',
        rating: '9.6',
        match: '99%',
        genres: 'Animation • Fantasy • IMAX',
        poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=85',
        video: '/api/stream/animated_woodland_escape.mp4',
        reply: 'Một tuyệt tác thị giác rung động trái tim: **Tears of the Cosmos**. Từng khung hình rực sáng vẻ đẹp huyền ảo của các chòm sao hòa quyện cùng âm nhạc du dương.'
    },
    {
        keywords: ['đua xe', 'tốc độ', 'siêu xe', 'drift', 'nhanh', 'racing'],
        title: 'Hyper Velocity: Supersonic Midnight',
        rating: '8.9',
        match: '95%',
        genres: 'Action • Racing • Cyberpunk',
        poster: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&auto=format&fit=crop&q=85',
        video: '/api/stream/hyperdrive_velocity.mp4',
        reply: 'Gia tốc cực hạn trên những đường hầm từ trường siêu âm: **Hyper Velocity** sẽ đưa nhịp tim của bạn lên đỉnh điểm với âm thanh động cơ phản lực 4K!'
    }
];

export function initNovaAIWidget() {
    const launcherBtn = document.getElementById('nova-ai-launcher');
    const drawer = document.getElementById('nova-ai-drawer');
    const closeBtn = document.getElementById('nova-ai-close-btn');
    const clearBtn = document.getElementById('nova-ai-clear-btn');
    const chatForm = document.getElementById('nova-ai-form');
    const chatInput = document.getElementById('nova-ai-input');
    const messagesBox = document.getElementById('nova-ai-messages');
    const chipBtns = document.querySelectorAll('.nova-quick-chip');
    const sidebarAIBtn = document.getElementById('sidebar-nova-ai-btn');
    const mobileAIBtn = document.getElementById('mobile-nova-ai-trigger');

    if (!launcherBtn || !drawer) return;

    function openAIDrawer() {
        drawer.style.display = 'flex';
        setTimeout(() => {
            drawer.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4', 'scale-95');
            drawer.classList.add('opacity-100', 'translate-y-0', 'scale-100');
            if (chatInput) chatInput.focus();
        }, 10);
    }

    function closeAIDrawer() {
        drawer.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
        drawer.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4', 'scale-95');
        setTimeout(() => {
            drawer.style.display = 'none';
        }, 250);
    }

    launcherBtn.addEventListener('click', () => {
        const isOpen = drawer.classList.contains('opacity-100');
        if (isOpen) closeAIDrawer();
        else openAIDrawer();
    });

    if (sidebarAIBtn) sidebarAIBtn.addEventListener('click', openAIDrawer);
    if (mobileAIBtn) mobileAIBtn.addEventListener('click', openAIDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeAIDrawer);

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (messagesBox) {
                messagesBox.innerHTML = `
                    <div class="flex items-start gap-2.5">
                        <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-md">
                            <span class="material-symbols-outlined text-[15px] text-black">auto_awesome</span>
                        </div>
                        <div class="bg-surface-container-high border border-white/10 p-3 rounded-2xl rounded-tl-sm max-w-[85%] text-xs leading-relaxed text-white shadow-sm">
                            Hội thoại đã làm mới. Bạn muốn NOVA AI tìm kiếm hoặc gợi ý thể loại phim nào tiếp theo? ✨
                        </div>
                    </div>
                `;
            }
        });
    }

    function appendUserMessage(text) {
        if (!messagesBox) return;
        const msg = document.createElement('div');
        msg.className = 'flex items-end justify-end gap-2';
        msg.innerHTML = `
            <div class="bg-primary text-black font-medium p-3 rounded-2xl rounded-tr-sm max-w-[85%] text-xs leading-relaxed shadow-md">
                ${text}
            </div>
        `;
        messagesBox.appendChild(msg);
        messagesBox.scrollTop = messagesBox.scrollHeight;
    }

    function appendBotResponse(recommendation) {
        if (!messagesBox) return;
        const msg = document.createElement('div');
        msg.className = 'flex items-start gap-2.5';
        msg.innerHTML = `
            <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-md">
                <span class="material-symbols-outlined text-[15px] text-black">auto_awesome</span>
            </div>
            <div class="flex flex-col gap-2.5 max-w-[85%]">
                <div class="bg-surface-container-high border border-white/10 p-3 rounded-2xl rounded-tl-sm text-xs leading-relaxed text-white shadow-sm">
                    ${recommendation.reply}
                </div>
                <!-- Interactive Film Card Inside Chat -->
                <div class="p-2.5 rounded-2xl bg-white/[0.05] border border-primary/30 flex items-center gap-3 shadow-lg">
                    <img src="${recommendation.poster}" alt="${recommendation.title}" class="w-12 h-16 rounded-xl object-cover flex-shrink-0 shadow-md" />
                    <div class="flex flex-col flex-1 min-w-0">
                        <span class="text-amber-300 font-mono text-[10px] font-bold">★ ${recommendation.rating} • ${recommendation.match}</span>
                        <h5 class="text-white font-bold text-xs truncate">${recommendation.title}</h5>
                        <span class="text-on-surface-variant text-[10px] truncate">${recommendation.genres}</span>
                        <button
                            type="button"
                            class="mt-1.5 px-3 py-1 rounded-full bg-primary hover:bg-white text-black font-bold text-[10px] w-fit flex items-center gap-1 transition-all cursor-pointer shadow-md"
                            onclick="if(window.openCinemaModal) { window.openCinemaModal('${recommendation.title}', '${recommendation.reply.replace(/'/g, "\\'")}', '${recommendation.match}', '2026', '2h 30m', '${recommendation.genres}'); } else { window.location.href='/pages/watch_a_film_page.html'; }"
                        >
                            <span class="material-symbols-outlined text-[12px]">play_arrow</span>
                            <span>Xem Phim Ngay</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        messagesBox.appendChild(msg);
        messagesBox.scrollTop = messagesBox.scrollHeight;
    }

    function processUserQuery(query) {
        if (!query.trim()) return;
        appendUserMessage(query);

        const lower = query.toLowerCase();
        let matched = null;

        for (const item of KNOWLEDGE_BASE) {
            if (item.keywords.some(k => lower.includes(k))) {
                matched = item;
                break;
            }
        }

        if (!matched) {
            matched = KNOWLEDGE_BASE[Math.floor(Math.random() * KNOWLEDGE_BASE.length)];
        }

        // Show typing indicator
        const typingEl = document.createElement('div');
        typingEl.className = 'flex items-center gap-2 text-primary font-mono text-[11px] px-2 py-1';
        typingEl.id = 'nova-typing';
        typingEl.innerHTML = '<span class="animate-pulse">● NOVA AI đang phân tích dữ liệu điện ảnh...</span>';
        messagesBox.appendChild(typingEl);
        messagesBox.scrollTop = messagesBox.scrollHeight;

        setTimeout(() => {
            const t = document.getElementById('nova-typing');
            if (t) t.remove();
            appendBotResponse(matched);
        }, 500);
    }

    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!chatInput) return;
            const text = chatInput.value;
            chatInput.value = '';
            processUserQuery(text);
        });
    }

    chipBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const prompt = btn.getAttribute('data-prompt') || btn.innerText;
            processUserQuery(prompt);
        });
    });
}
