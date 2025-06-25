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

/* ===== Project toggle functionality ===== */
function toggleProject(projectElement) {
    console.log('toggleProject called with:', projectElement); // Debug
    
    // Přepnout třídu 'expanded' na kliknutém projektu
    projectElement.classList.toggle('expanded');
    
    // Najít obsah projektu
    const content = projectElement.querySelector('.project-content');
    if (!content) {
        console.log('Project content not found!'); // Debug
        return;
    }
    
    console.log('Project expanded:', projectElement.classList.contains('expanded')); // Debug
    
    // Animace otevření/zavření
    if (projectElement.classList.contains('expanded')) {
        // Otevřít projekt
        content.style.maxHeight = content.scrollHeight + 'px';
        console.log('Opening project, height:', content.scrollHeight); // Debug
        
        // Smooth scroll k projektu po otevření
        setTimeout(() => {
            projectElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    } else {
        // Zavřít projekt
        content.style.maxHeight = '0px';
        console.log('Closing project'); // Debug
    }
}

/* ===== Scroll reveal ===== */
function observeElements() {
    const sections = document.querySelectorAll('.section');
    if (!sections.length) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
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

        console.log('Form data:', data);
        showNotification('Zpráva byla odeslána! Odpovím vám co nejdříve.', 'success');
        form.reset();
    });
}

/* ===== Project links handling ===== */
function handleProjectLinks() {
    // Přidat event listenery pro všechny odkazy v projektech
    document.querySelectorAll('.project-link').forEach(link => {
        link.addEventListener('click', e => {
            e.stopPropagation(); // Zabránit zavření projektu při kliknutí na odkaz
            
            // Pokud je href="#", zobrazit notifikaci
            if (link.getAttribute('href') === '#') {
                e.preventDefault();
                const linkText = link.textContent.trim();
                showNotification(`${linkText} bude brzy k dispozici!`, 'info');
            }
        });
    });
}

/* ===== Keyboard accessibility for projects ===== */
function handleProjectKeyboard() {
    document.querySelectorAll('.expandable-project').forEach(project => {
        // Přidat tabindex pro přístupnost
        project.setAttribute('tabindex', '0');
        
        // Přidat keyboard support
        project.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleProject(project);
            }
        });
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

    requestAnimationFrame(() => {
        n.style.opacity = '1';
        n.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        n.style.opacity = '0';
        n.style.transform = 'translateY(-10px)';
        n.addEventListener('transitionend', () => n.remove(), { once: true });
    }, duration);
}

/* ===== Init ===== */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...'); // Debug
    
    observeElements();
    handleContactForm();
    handleProjectLinks();
    handleProjectKeyboard();

    document.querySelector('.mobile-menu-btn')
        ?.addEventListener('click', toggleMenu);

    handleScroll();
    window.addEventListener('scroll', throttle(handleScroll, 50));

    // Debug: Zkontrolovat, jestli jsou projekty nalezeny
    const projects = document.querySelectorAll('.expandable-project');
    console.log(`Nalezeno ${projects.length} rozklikávacích projektů`);
    
    // Test: Zkontrolovat, jestli je toggleProject dostupná globálně
    console.log('toggleProject function available:', typeof window.toggleProject);
});
