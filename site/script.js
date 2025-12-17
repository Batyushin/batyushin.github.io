document.addEventListener('DOMContentLoaded', () => {

    // === 1. MACOS DOCK (Логика увеличения и скрытия) ===
    const dock = document.querySelector('.dock-menu');

    if (dock) {
        const items = document.querySelectorAll('.dock-item');
        const maxScale = 1.8; // Максимальный размер (1.8 раза)
        const range = 150;    // Радиус реакции (пиксели)

        // Функция пересчета размеров иконок
        const updateDock = (mouseX) => {
            items.forEach(item => {
                const rect = item.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const distance = Math.abs(mouseX - centerX);

                let scale = 1;
                if (distance < range) {
                    const x = distance / range;
                    // Плавная кривая увеличения
                    const val = Math.cos(x * Math.PI / 2);
                    scale = 1 + (maxScale - 1) * Math.pow(val, 2.5);
                }
                item.style.setProperty('--scale', scale);
            });
        };

        const resetDock = () => {
            items.forEach(item => item.style.setProperty('--scale', 1));
        };

        // --- ПОВЕДЕНИЕ НА ПК (Мышь) ---
        window.addEventListener('mousemove', (e) => {
            if (window.innerWidth > 768) {

                // 1. Логика увеличения
                // Считаем математику, только если док виден и мышь внизу
                if (!dock.classList.contains('dock-hidden') && e.clientY > window.innerHeight - 150) {
                    updateDock(e.clientX);
                } else {
                    resetDock();
                }

                // 2. Логика скрытия/показа
                // Если мышь у самого низа (последние 20px) -> ПОКАЗАТЬ
                if (e.clientY > window.innerHeight - 20) {
                    dock.classList.remove('dock-hidden');
                }
                // Если мышь ушла выше зоны дока (на 120px от низа) -> СПРЯТАТЬ
                else if (e.clientY < window.innerHeight - 120) {
                    dock.classList.add('dock-hidden');
                }
            }
        });

        // Если мышь ушла с элемента дока - сбросить размер
        dock.addEventListener('mouseleave', resetDock);

        // --- ПОВЕДЕНИЕ НА ТЕЛЕФОНЕ (Скролл) ---
        let lastScrollTop = 0;

        // Изначально показываем
        dock.classList.remove('dock-hidden');

        window.addEventListener('scroll', () => {
            if (window.innerWidth <= 768) {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                if (scrollTop <= 0) return; // Игнорируем отскок наверху (iOS)

                // Если скроллим вниз больше чем на 10px -> ПРЯЧЕМ
                if (scrollTop > lastScrollTop + 10) {
                    dock.classList.add('dock-hidden');
                }
                // Если скроллим вверх больше чем на 10px -> ПОКАЗЫВАЕМ
                else if (scrollTop < lastScrollTop - 10) {
                    dock.classList.remove('dock-hidden');
                }
                lastScrollTop = scrollTop;
            }
        });
    }

    // === 2. LIQUID TILT (Шевеление карточек) ===
    // Вернул "старую" логику без ограничения дистанции - выглядит живее
    const cards = document.querySelectorAll('.liquid-tilt');
    if (cards.length > 0) {
        document.addEventListener('mousemove', (e) => {
            // Отключаем на мобилках для производительности
            if (window.innerWidth < 900) return;

            requestAnimationFrame(() => {
                cards.forEach(card => {
                    const rect = card.getBoundingClientRect();
                    const cardX = rect.left + rect.width / 2;
                    const cardY = rect.top + rect.height / 2;

                    // Простая формула: чем дальше мышь, тем сильнее наклон (в пределах разумного)
                    // Делим на 55 для мягкости (раньше было 45, так чуть плавнее)
                    const offsetX = (e.clientX - cardX) / 55;
                    const offsetY = (e.clientY - cardY) / 55;

                    card.style.transform = `perspective(1000px) rotateX(${-offsetY}deg) rotateY(${offsetX}deg)`;
                });
            });
        });
    }

    // === 3. COPY PHONE LOGIC ===
    document.querySelectorAll('.copy-trigger').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const phone = this.getAttribute('data-phone');

            const textTarget = this.querySelector('.sp-number');
            // Ищем иконку внутри или берем саму кнопку, если иконки нет
            const iconTarget = this.querySelector('.arrow-icon') || this.querySelector('.copy-icon') || this.querySelector('.icon-emoji') || this;

            navigator.clipboard.writeText(phone).then(() => {
                if (textTarget) {
                    const originalText = textTarget.innerText;
                    textTarget.innerText = "Скопировано!";
                    textTarget.style.color = "#4eff7b";
                    setTimeout(() => {
                        textTarget.innerText = originalText;
                        textTarget.style.color = "";
                    }, 2000);
                }

                // Меняем иконку/текст на галочку
                if (iconTarget.innerText) {
                    const originalIcon = iconTarget.innerText;
                    iconTarget.innerText = "✅";
                    setTimeout(() => { iconTarget.innerText = originalIcon; }, 2000);
                }
            });
        });
    });

    // Защита внутренних ссылок от клика по карточке
    document.querySelectorAll('.no-click').forEach(element => {
        element.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });

});