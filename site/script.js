document.addEventListener('DOMContentLoaded', () => {

    // === 1. MACOS DOCK ===
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

        window.addEventListener('mousemove', (e) => {
            if (window.innerWidth > 768) {
                if (e.clientY > window.innerHeight - 15) dock.classList.remove('dock-hidden');
            }
        });

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
    }

    // === 2. LIQUID TILT ===
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

    // === 3. COPY LOGIC ===
    document.querySelectorAll('.copy-trigger').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault(); e.stopPropagation();
            const phone = this.getAttribute('data-phone');
            const textTarget = this.querySelector('.sp-number');
            let iconTarget = this.querySelector('.arrow-icon') || this.querySelector('.copy-icon') || this.querySelector('.icon-emoji');

            if (!textTarget && !iconTarget) iconTarget = this;

            navigator.clipboard.writeText(phone).then(() => {
                if (textTarget) {
                    const originalText = textTarget.innerText;
                    textTarget.innerText = "Скопировано!";
                    textTarget.style.color = "#4eff7b";
                    setTimeout(() => { textTarget.innerText = originalText; textTarget.style.color = ""; }, 2000);
                } else if (iconTarget) {
                    const originalContent = iconTarget.innerHTML;
                    iconTarget.innerHTML = "✅";
                    setTimeout(() => { iconTarget.innerHTML = originalContent; }, 2000);
                }
            });
        });
    });

    // === 4. NO CLICK ===
    document.querySelectorAll('.no-click').forEach(element => {
        element.addEventListener('click', (e) => { e.stopPropagation(); });
    });
});