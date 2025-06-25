(() => {
    /* ===== Utils ===== */
    const throttle = (fn, delay = 100) => {
        let last = 0;
        return (...args) => {
            const now = Date.now();
            if (now - last >= delay) {
                last = now;
                fn(...args);
            }
        };
    };

    /* ===== Mobile menu ===== */
    function toggleMenu() {
        document.querySelector('.nav-links')?.classList.toggle('active');
        document.querySelector('.mobile-menu')?.classList.toggle('active');
    }

    /* ===== Scroll reveal ===== */
    function observeElements() {
        const sections = document.querySelectorAll('.section');
        if (!sections.length) return;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);          // už nepozorovat
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        sections.forEach(section => observer.observe(section));
    }

    /* ===== Header blur on scroll ===== */
    function handleScroll() {
        const header = document.querySelector('header');
        if (!header) return;

        if (window.scrollY > 100) {
            header.style.background = 'rgba(15, 15, 35, 0.95)';
            header.style.backdropFilter = 'blur(15px)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.1)';
            header.style.backdropFilter = 'blur(10px)';
        }
    }

    /* ===== Contact form ===== */
    function handleContactForm() {
        const form = document.querySelector('.contact-form');
        if (!form) return;

        form.addEventListener('submit', e => {
            e.preventDefault();

            const formData = new FormData(form);
            const data = {
                name:    formData.get('name')?.trim(),
                email:   formData.get('email')?.trim(),
                subject: formData.get('subject')?.trim() || '—',
                message: formData.get('message')?.trim()
            };

            if (!data.name || !data.email || !data.message) {
                showNotification('Prosím vyplňte všechna povinná pole.', 'error');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                showNotification('Prosím zadejte platnou emailovou adresu.', 'error');
                return;
            }

            /* Tady by normálně šel fetch/axios požadavek. */
            console.log('Form data:', data);

            showNotification('Zpráva byla odeslána! Odpovím vám co nejdříve.', 'success');
            form.reset();
        });
    }

    /* ===== Notifications ===== */
    function showNotification(message, type = 'info', duration = 4000) {
        document.querySelectorAll('.notification').forEach(n => n.remove());

        const n = document.createElement('div');
        n.className = `notification notification-${type}`;
        n.textContent = message;

        Object.assign(n.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            maxWidth: '320px',
            padding: '12px 18px',
            fontSize: '0.9rem',
            borderRadius: '6px',
            background:
                type === 'success' ? '#4caf50' :
                type === 'error'   ? '#ff4d4f' :
                                     '#333',
            color: '#fff',
            zIndex: 2000,
            boxShadow: '0 4px 15px rgba(0,0,0,.2)',
            opacity: '0',
            transform: 'translateY(-10px)',
            transition: 'opacity .3s ease, transform .3s ease'
        });

        document.body.appendChild(n);

        /* animace – první frame */
        requestAnimationFrame(() => {
            n.style.opacity = '1';
            n.style.transform = 'translateY(0)';
        });

        /* auto-dismiss */
        setTimeout(() => {
            n.style.opacity = '0';
            n.style.transform = 'translateY(-10px)';
            n.addEventListener('transitionend', () => n.remove(), { once: true });
        }, duration);
    }

    /* ===== Init ===== */
    document.addEventListener('DOMContentLoaded', () => {
        observeElements();
        handleContactForm();

        document.querySelector('.mobile-menu-btn')
            ?.addEventListener('click', toggleMenu);

        handleScroll();                               // init
        window.addEventListener('scroll', throttle(handleScroll, 50));
    });
})();
