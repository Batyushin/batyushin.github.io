document.addEventListener("DOMContentLoaded", function() {

    // --- ЗАГРУЗЧИК КОМПОНЕНТОВ ---
    function loadComponent(id, file) {
        const element = document.getElementById(id);
        if (element) {
            fetch(file)
                .then(response => {
                    if (!response.ok) throw new Error(`Не удалось загрузить ${file}`);
                    return response.text();
                })
                .then(data => {
                    element.innerHTML = data;

                    // 1. Если это ШАПКА -> настраиваем кнопки
                    if (id === 'header-container') {
                        setupHeaderButtons();
                    }

                    // 2. Если это МЕНЮ -> запускаем анимацию дока
                    if (id === 'dock-container') {
                        initDockAnimation();
                    }

                    // 3. Перезапускаем эффекты (наклон карточек и копирование)
                    if (window.reinitInteractions) window.reinitInteractions();
                    if (window.initLiquidTilt) window.initLiquidTilt();
                })
                .catch(err => console.error(err));
        }
    }

    // --- ЛОГИКА ШАПКИ (ГЛАВНАЯ vs ВНУТРЕННЯЯ) ---
    function setupHeaderButtons() {
        const path = window.location.pathname;
        // Проверяем, находимся ли мы на главной (index.html или просто /)
        const isHome = path.endsWith('index.html') || path.endsWith('/') || path.length < 2;

        const podcastBtn = document.getElementById('nav-podcast');
        const homeBtn = document.getElementById('nav-home');

        if (isHome) {
            // Мы на главной: показываем Подкасты, скрываем Дом
            if (podcastBtn) podcastBtn.style.display = 'flex';
            if (homeBtn) homeBtn.remove(); // Удаляем лишнее из DOM, чтобы не мешало сетке
        } else {
            // Мы на внутренней: показываем Дом, скрываем Подкасты
            if (homeBtn) homeBtn.style.display = 'flex';
            if (podcastBtn) podcastBtn.remove();
        }
    }

    // Загружаем компоненты
    loadComponent("dock-container", "components/menu.html");
    loadComponent("header-container", "components/header.html");
    loadComponent("footer-container", "components/footer.html");
});

// --- АНИМАЦИЯ ДОКА (Меню) ---
function initDockAnimation() {
    const dock = document.querySelector('.dock-menu');
    if (dock) {
        const items = document.querySelectorAll('.dock-item');
        const maxScale = 1.8; const range = 150;

        const updateDock = (mouseX) => {
            items.forEach(item => {
                const rect = item.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const distance = Math.abs(mouseX - centerX);
                let scale = 1;
                if (distance < range) {
                    const x = distance / range;
                    const val = 1 - Math.pow(x, 2);
                    scale = 1 + (maxScale - 1) * val;
                }
                item.style.setProperty('--scale', scale);
            });
        };
        const resetDock = () => { items.forEach(item => item.style.setProperty('--scale', 1)); };

        dock.addEventListener('mousemove', (e) => { if (window.innerWidth > 768) requestAnimationFrame(() => updateDock(e.clientX)); });
        dock.addEventListener('mouseleave', resetDock);

        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            if (window.innerWidth <= 768) {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                if (scrollTop < 0) return;
                if (scrollTop > lastScrollTop && scrollTop > 50) dock.classList.add('dock-hidden');
                else dock.classList.remove('dock-hidden');
                lastScrollTop = scrollTop;
            }
        });
        window.addEventListener('mousemove', (e) => {
            if (window.innerWidth > 768 && e.clientY > window.innerHeight - 15) dock.classList.remove('dock-hidden');
        });
    }
}