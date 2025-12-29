document.addEventListener("DOMContentLoaded", function() {

    // Функция загрузки компонента
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

                    // Если это меню - запускаем анимацию дока
                    if (id === 'dock-container') {
                        initDockAnimation();
                    }

                    // Если это футер (или любой блок с liquid-tilt) - перезапускаем тилт
                    if (id === 'footer-container' && window.initLiquidTilt) {
                        window.initLiquidTilt();
                    }
                })
                .catch(err => console.error(err));
        }
    }

    // Загружаем Меню и Футер
    loadComponent("dock-container", "components/menu.html");
    loadComponent("footer-container", "components/footer.html");
});

// Функция анимации Дока
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

        // Логика скрытия
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