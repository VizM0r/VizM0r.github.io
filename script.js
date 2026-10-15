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
    // Přepnout třídu 'expanded' na kliknutém projektu
    projectElement.classList.toggle('expanded');
    
    // Najít obsah projektu
    const content = projectElement.querySelector('.project-content');
    if (!content) return;

    // Animace otevření/zavření
    if (projectElement.classList.contains('expanded')) {
        // Otevřít projekt
        content.style.maxHeight = content.scrollHeight + 'px';
        
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
    }
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

/* ===== Project links handling ===== */
function handleProjectLinks() {
    // Kliknutí na odkaz v projektu nemá projekt zavřít
    document.querySelectorAll('.project-link').forEach(link => {
        link.addEventListener('click', e => e.stopPropagation());
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

/* ===== Zvětšení obrázků (lightbox) ===== */
const LB_ICONS = {
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    prev:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    next:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>'
};
const LB_ZOOM = 2.5;

function initLightbox() {
    const images = document.querySelectorAll('.render-item img');
    if (!images.length) return;

    const box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.innerHTML = `
        <button type="button" class="lightbox-close" aria-label="Zavřít">${LB_ICONS.close}</button>
        <button type="button" class="lightbox-prev" aria-label="Předchozí">${LB_ICONS.prev}</button>
        <figure class="lightbox-figure">
            <div class="lightbox-stage"><img class="lightbox-img" alt="" draggable="false"></div>
            <figcaption class="lightbox-caption"></figcaption>
        </figure>
        <button type="button" class="lightbox-next" aria-label="Další">${LB_ICONS.next}</button>`;
    document.body.appendChild(box);

    const img = box.querySelector('.lightbox-img');
    const caption = box.querySelector('.lightbox-caption');
    let group = [];
    let index = 0;

    /* --- přiblížení a posun --- */
    let scale = 1, tx = 0, ty = 0;
    let drag = null; // {x, y, tx, ty, moved}

    const clamp = () => {
        const maxX = (scale - 1) * img.offsetWidth / 2;
        const maxY = (scale - 1) * img.offsetHeight / 2;
        tx = Math.max(-maxX, Math.min(maxX, tx));
        ty = Math.max(-maxY, Math.min(maxY, ty));
    };
    const apply = () => {
        img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
        box.classList.toggle('zoomed', scale > 1);
    };
    const resetZoom = () => { scale = 1; tx = 0; ty = 0; apply(); };
    const zoomAt = (clientX, clientY) => {
        const r = img.getBoundingClientRect();
        // vzdálenost bodu kliknutí od středu obrázku (v nepřiblíženém stavu)
        const dx = clientX - (r.left + r.width / 2);
        const dy = clientY - (r.top + r.height / 2);
        scale = LB_ZOOM;
        tx = -(scale - 1) * dx;
        ty = -(scale - 1) * dy;
        clamp();
        apply();
    };

    img.addEventListener('pointerdown', e => {
        drag = { x: e.clientX, y: e.clientY, tx, ty, moved: false };
        img.setPointerCapture(e.pointerId);
    });
    img.addEventListener('pointermove', e => {
        if (!drag) return;
        const mx = e.clientX - drag.x, my = e.clientY - drag.y;
        if (Math.abs(mx) + Math.abs(my) > 5) drag.moved = true;
        if (scale > 1 && drag.moved) {
            tx = drag.tx + mx;
            ty = drag.ty + my;
            clamp();
            apply();
            box.classList.add('dragging');
        }
    });
    img.addEventListener('pointerup', e => {
        if (!drag) return;
        const wasClick = !drag.moved;
        drag = null;
        box.classList.remove('dragging');
        if (wasClick) {
            if (scale > 1) resetZoom();
            else zoomAt(e.clientX, e.clientY);
        }
    });
    img.addEventListener('pointercancel', () => { drag = null; box.classList.remove('dragging'); });

    /* --- otevírání, přepínání, zavírání --- */
    const show = i => {
        index = (i + group.length) % group.length;
        const src = group[index];
        resetZoom();
        img.src = src.src;
        img.alt = src.alt;
        const cap = src.closest('.render-item')?.querySelector('.render-caption');
        caption.textContent = cap ? cap.textContent : src.alt;
        box.classList.toggle('single', group.length < 2);
    };
    const open = clicked => {
        const gallery = clicked.closest('.render-gallery');
        group = gallery ? Array.from(gallery.querySelectorAll('img')) : [clicked];
        show(group.indexOf(clicked));
        box.classList.add('open');
        document.body.style.overflow = 'hidden';
    };
    const close = () => {
        resetZoom();
        box.classList.remove('open');
        document.body.style.overflow = '';
    };

    images.forEach(el => {
        el.setAttribute('tabindex', '0');
        el.addEventListener('click', e => {
            e.stopPropagation(); // nezavírat rozkliknutý projekt
            open(el);
        });
        el.addEventListener('keydown', e => {
            if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); open(el); }
        });
    });

    box.addEventListener('click', e => {
        if (e.target === box || e.target.closest('.lightbox-close')) close();
    });
    box.querySelector('.lightbox-prev').addEventListener('click', () => show(index - 1));
    box.querySelector('.lightbox-next').addEventListener('click', () => show(index + 1));
    document.addEventListener('keydown', e => {
        if (!box.classList.contains('open')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') show(index - 1);
        if (e.key === 'ArrowRight') show(index + 1);
    });
}

/* ===== Init ===== */
document.addEventListener('DOMContentLoaded', () => {
    handleProjectLinks();
    handleProjectKeyboard();
    initLightbox();

    handleScroll();
    window.addEventListener('scroll', throttle(handleScroll, 50));
});

/* ===== Kliknutí na e-mail: zkopíruje adresu a otevře poštovní program ===== */
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
    }
    return legacyCopy(text);
}

function legacyCopy(text) {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(area);
    return ok ? Promise.resolve() : Promise.reject();
}

function copyEmail(link) {
    const email = link.textContent.trim();
    const note = link.closest('p')?.querySelector('.copied-note');
    copyToClipboard(email).then(() => {
        if (!note) return;
        note.textContent = '✓ Zkopírováno';
        note.classList.add('visible');
        clearTimeout(note._timer);
        note._timer = setTimeout(() => note.classList.remove('visible'), 2000);
    }).catch(() => {});
    // Výchozí akce odkazu (mailto:) pokračuje – otevře poštovní program, pokud je nastavený.
}
