document.addEventListener('DOMContentLoaded', () => {

    // === 1. LIQUID TILT (Анимация наклона) ===
    // Вынесена в функцию, чтобы можно было перезапускать (для футера)
    window.initLiquidTilt = function() {
        const cards = document.querySelectorAll('.liquid-tilt');

        // Функция обработки движения мыши
        function handleTilt(e) {
            if (window.innerWidth < 900) return;

            requestAnimationFrame(() => {
                cards.forEach(card => {
                    const rect = card.getBoundingClientRect();

                    // Оптимизация: анимируем только то, что видно на экране
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        const cardX = rect.left + rect.width / 2;
                        const cardY = rect.top + rect.height / 2;
                        const offsetX = (e.clientX - cardX) / 55;
                        const offsetY = (e.clientY - cardY) / 55;
                        card.style.transform = `perspective(1000px) rotateX(${-offsetY}deg) rotateY(${offsetX}deg)`;
                    }
                });
            });
        }

        if (cards.length > 0) {
            // Удаляем старый слушатель перед добавлением нового (во избежание дублей)
            document.removeEventListener('mousemove', handleTilt);
            document.addEventListener('mousemove', handleTilt);
        }
    };

    // Запускаем сразу при загрузке
    window.initLiquidTilt();


    // === 2. COPY LOGIC (Логика копирования) ===
    // Используем прямой навес событий, чтобы остановить всплытие (stopPropagation)
    // до того, как сработает onclick родительской карточки.

    function attachCopyLogic() {
        const copyBtns = document.querySelectorAll('.copy-trigger');

        copyBtns.forEach(btn => {
            // Удаляем старые, чтобы не вешать дважды
            btn.removeEventListener('click', handleCopy);
            btn.addEventListener('click', handleCopy);
        });
    }

    function handleCopy(e) {
        e.preventDefault();
        e.stopPropagation(); // ВАЖНО: Останавливаем клик здесь, не даем ему уйти к родителю

        // Получаем элемент (this работает, т.к. это обычная функция)
        const btn = this;
        const phone = btn.getAttribute('data-phone');

        // Ищем, где менять текст (внутри кнопки или рядом)
        const textTarget = btn.querySelector('.sp-number');
        // Если внутри кнопки нет текста, ищем иконку
        let iconTarget = btn.querySelector('.arrow-icon') ||
            btn.querySelector('.copy-icon') ||
            btn.querySelector('.icon-emoji') ||
            btn; // Если ничего нет, меняем саму кнопку

        if (!textTarget && !iconTarget) iconTarget = btn;

        navigator.clipboard.writeText(phone).then(() => {
            if (textTarget) {
                // Если это блок с номером (как в донате)
                const originalText = textTarget.innerText;
                textTarget.innerText = "Скопировано!";
                textTarget.style.color = "#4eff7b";
                setTimeout(() => {
                    textTarget.innerText = originalText;
                    textTarget.style.color = "";
                }, 2000);
            } else {
                // Если это кнопка с иконкой
                const originalContent = iconTarget.innerHTML;
                iconTarget.innerHTML = "✅"; // Галочка
                setTimeout(() => {
                    iconTarget.innerHTML = originalContent;
                }, 2000);
            }
        }).catch(err => {
            console.error('Ошибка копирования:', err);
        });
    }

    // === 3. NO-CLICK LOGIC (Блокировка всплытия для ссылок внутри карточек) ===
    function attachNoClick() {
        const noClickElems = document.querySelectorAll('.no-click');
        noClickElems.forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation(); // Просто не даем клику уйти на родителя
            });
        });
    }

    // Инициализируем логику
    attachCopyLogic();
    attachNoClick();

    // Экспортируем функции, если вдруг понадобятся в loader.js (опционально)
    window.reinitInteractions = function() {
        attachCopyLogic();
        attachNoClick();
    };
});