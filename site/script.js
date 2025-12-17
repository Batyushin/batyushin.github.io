document.addEventListener('DOMContentLoaded', () => {

    // === 1. MACOS DOCK (Логика увеличения) ===
    const dock = document.querySelector('.dock-menu');

    if (dock) {
        const items = document.querySelectorAll('.dock-item');
        const maxScale = 1.8;
        const range = 150;

        const updateDock = (mouseX) => {
            items.forEach(item => {
                const rect = item.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const distance = Math.abs(mouseX - centerX);

                let scale = 1;
                if (distance < range) {
                    const x = distance / range;
                    // Используем формулу для резкого, но плавного увеличения
                    const val = 1 - Math.pow(x, 2);
                    scale = 1 + (maxScale - 1) * val;
                }
                item.style.setProperty('--scale', scale);
            });
        };

        const resetDock = () => {
            items.forEach(item => item.style.setProperty('--scale', 1));
        };

        // Слушаем мышь ТОЛЬКО внутри дока
        dock.addEventListener('mousemove', (e) => {
            if (window.innerWidth > 768) {
                requestAnimationFrame(() => updateDock(e.clientX));
            }
        });

        dock.addEventListener('mouseleave', resetDock);

        // === Логика скрытия/показа ===

        // 1. На ПК: показываем, если мышь у самого низа
        window.addEventListener('mousemove', (e) => {
            if (window.innerWidth > 768) {
                if (e.clientY > window.innerHeight - 15) {
                    dock.classList.remove('dock-hidden');
                }
            }
        });

        // 2. На Мобильном: прячем при скролле
        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            if (window.innerWidth <= 768) {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                if (scrollTop < 0) return; // Fix для iOS

                if (scrollTop > lastScrollTop && scrollTop > 50) {
                    dock.classList.add('dock-hidden');
                } else {
                    dock.classList.remove('dock-hidden');
                }
                lastScrollTop = scrollTop;
            }
        });
    }

    // === 2. LIQUID TILT (Карточки) ===
    const cards = document.querySelectorAll('.liquid-tilt');
    if (cards.length > 0) {
        document.addEventListener('mousemove', (e) => {
            if (window.innerWidth < 900) return;
            requestAnimationFrame(() => {
                cards.forEach(card => {
                    const rect = card.getBoundingClientRect();
                    const cardX = rect.left + rect.width / 2;
                    const cardY = rect.top + rect.height / 2;
                    const offsetX = (e.clientX - cardX) / 55;
                    const offsetY = (e.clientY - cardY) / 55;
                    card.style.transform = `perspective(1000px) rotateX(${-offsetY}deg) rotateY(${offsetX}deg)`;
                });
            });
        });
    }

    // === 3. COPY LOGIC (ИСПРАВЛЕННАЯ) ===
    document.querySelectorAll('.copy-trigger').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const phone = this.getAttribute('data-phone');

            // 1. Ищем текстовое поле с номером (для донатов)
            const textTarget = this.querySelector('.sp-number');

            // 2. Ищем иконку внутри кнопки (если есть)
            let iconTarget = this.querySelector('.arrow-icon') ||
                this.querySelector('.copy-icon') ||
                this.querySelector('.icon-emoji');

            // 3. ЕСЛИ нет ни текста, ни иконки внутри — значит сама кнопка и есть иконка
            if (!textTarget && !iconTarget) {
                iconTarget = this;
            }

            navigator.clipboard.writeText(phone).then(() => {

                // СЦЕНАРИЙ А: Есть текст номера (Донат)
                if (textTarget) {
                    const originalText = textTarget.innerText;
                    textTarget.innerText = "Скопировано!";
                    textTarget.style.color = "#4eff7b"; // Зеленый

                    setTimeout(() => {
                        textTarget.innerText = originalText;
                        textTarget.style.color = "";
                    }, 2000);
                }

                // СЦЕНАРИЙ Б: Есть иконка или сама кнопка (Контакты)
                else if (iconTarget) {
                    // Сохраняем текущее содержимое (там может быть 📋 или svg)
                    const originalContent = iconTarget.innerHTML; // Используем innerHTML чтобы сохранить картинки если что

                    // Меняем на галочку
                    iconTarget.innerHTML = "✅";

                    setTimeout(() => {
                        iconTarget.innerHTML = originalContent;
                    }, 2000);
                }
            });
        });
    });

    // Блокировка клика по внутренним элементам
    document.querySelectorAll('.no-click').forEach(element => {
        element.addEventListener('click', (e) => { e.stopPropagation(); });
    });


// === 4. YOUTUBE MODAL PLAYER ===
    // 1. Создаем HTML для модалки динамически (чтобы не мусорить в HTML файлах)
    const modalHTML = `
      <div class="video-modal-overlay" id="videoModal">
        <div class="video-container">
           <button class="video-close-btn" id="closeVideo">✖ Закрыть</button>
           <div id="playerTarget"></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('videoModal');
    const closeBtn = document.getElementById('closeVideo');
    const playerTarget = document.getElementById('playerTarget');
    let playerHtml = '';

    // Функция открытия
    const openVideo = (videoId) => {
        // Формируем код плеера (autoplay=1 чтобы сразу играло)
        playerHtml = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        playerTarget.innerHTML = playerHtml;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Блокируем скролл сайта
    };

    // Функция закрытия
    const closeVideoFunc = () => {
        modal.classList.remove('active');
        setTimeout(() => {
            playerTarget.innerHTML = ''; // Удаляем iframe, чтобы звук прекратился
        }, 300);
        document.body.style.overflow = '';
    };

    // Слушаем клики по карточкам с классом .video-trigger
    document.querySelectorAll('.video-trigger').forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault(); // Отменяем переход по ссылке
            const videoId = this.getAttribute('data-video-id');
            if (videoId) {
                openVideo(videoId);
            }
        });
    });

    // Закрытие по кнопке и по клику на фон
    closeBtn.addEventListener('click', closeVideoFunc);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeVideoFunc();
    });
    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeVideoFunc();
    });


});