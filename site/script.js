document.addEventListener('DOMContentLoaded', () => {

    // === 1. LIQUID TILT (Анимация наклона) ===
    // Стабильная ссылка на обработчик — без неё removeEventListener не работает
    let tiltHandler = null;
    let tiltRAF = 0;

    window.initLiquidTilt = function() {
        const cards = document.querySelectorAll('.liquid-tilt');
        if (!cards.length) return;

        // Удаляем предыдущий обработчик (теперь ссылка стабильная)
        if (tiltHandler) {
            document.removeEventListener('mousemove', tiltHandler);
        }

        tiltHandler = function(e) {
            if (window.innerWidth < 900) return;

            // Throttle через rAF — не более одного пересчёта за кадр
            cancelAnimationFrame(tiltRAF);
            tiltRAF = requestAnimationFrame(() => {
                const wh = window.innerHeight;
                cards.forEach(card => {
                    const rect = card.getBoundingClientRect();
                    if (rect.top < wh && rect.bottom > 0) {
                        const offsetX = (e.clientX - (rect.left + rect.width / 2)) / 55;
                        const offsetY = (e.clientY - (rect.top + rect.height / 2)) / 55;
                        card.style.transform = `perspective(1000px) rotateX(${-offsetY}deg) rotateY(${offsetX}deg)`;
                    }
                });
            });
        };

        document.addEventListener('mousemove', tiltHandler, { passive: true });
    };

    window.initLiquidTilt();


    // === 2. COPY LOGIC (Логика копирования) ===
    // Используем прямой навес событий, чтобы остановить всплытие (stopPropagation)
    // до того, как сработает onclick родительской карточки.

    function attachCopyLogic() {
        document.querySelectorAll('.copy-trigger').forEach(btn => {
            if (btn._copyBound) return; // Защита от дублирования
            btn.addEventListener('click', handleCopy);
            btn._copyBound = true;
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
    function stopProp(e) { e.stopPropagation(); }

    function attachNoClick() {
        document.querySelectorAll('.no-click').forEach(el => {
            if (el._noClickBound) return;
            el.addEventListener('click', stopProp);
            el._noClickBound = true;
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