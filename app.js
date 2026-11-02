(() => {
    'use strict';

    const VIDEO_URL = 'assets/hero-scrub.mp4';
    const POSTER_URL = 'assets/hero-poster.jpg';
    const VIDEO_BYTES = 5738372;
    const TIPS_PAGE_SIZE = 4;

    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    const smoothstep = (p, e0, e1) => {
        const t = clamp((p - e0) / (e1 - e0), 0, 1);
        return t * t * (3 - 2 * t);
    };
    const rng = (seed) => {
        let s = seed >>> 0;
        return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
    };

    const GATE_QUERIES = [
        '(max-width: 720px)',
        '(orientation: portrait) and (max-width: 1024px)',
        '(orientation: portrait) and (pointer: coarse)',
        '(orientation: landscape) and (pointer: coarse) and (max-height: 560px)',
        '(prefers-reduced-motion: reduce)'
    ];

    const hero = document.getElementById('hero');
    const stage = document.getElementById('stage');
    const video = document.getElementById('heroVideo');
    const posterLayer = document.getElementById('posterLayer');
    const ring = document.getElementById('heroRing');
    const bands = [...document.querySelectorAll('.band')];
    const bandState = new WeakMap();

    let target = 0;
    let shown = 0;
    let rafId = null;
    let lastTick = 0;
    let seekBusy = false;
    let pendingTime = null;
    let seekWatchdog = null;
    let heroOnScreen = true;
    let videoArmed = false;
    let videoReady = false;
    let loadK = 0;
    let loadToken = 0;
    let loadController = null;
    let objectUrl = null;

    // -- GATING (5 conditions, live) --
    function isGated() {
        return GATE_QUERIES.some(q => window.matchMedia(q).matches);
    }

    function setupGating() {
        GATE_QUERIES.forEach(q => {
            const mql = window.matchMedia(q);
            if (mql.addEventListener) {
                mql.addEventListener('change', updateGating);
            } else if (mql.addListener) {
                mql.addListener(updateGating);
            }
        });
    }

    function updateGating() {
        if (isGated()) {
            if (videoArmed) disarmVideo();
        } else if (!videoArmed) {
            armVideo();
        }
    }

    // -- VIDEO LIFECYCLE --
    function armVideo() {
        videoArmed = true;
        stage.classList.remove('video-failed');
        if (posterLayer) posterLayer.style.backgroundImage = `url('${POSTER_URL}')`;
        resetRing();

        target = heroProgress();
        shown = target;
        updateBands(shown);
        startTick();
        loadHeroBlob();
    }

    function disarmVideo() {
        videoArmed = false;
        videoReady = false;
        loadToken++;
        if (loadController) {
            loadController.abort();
            loadController = null;
        }
        clearSeekWatchdog();
        seekBusy = false;
        pendingTime = null;

        video.pause();
        video.removeAttribute('src');
        video.load();

        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
            objectUrl = null;
        }

        stage.classList.remove('video-ready', 'video-failed');
        if (posterLayer) posterLayer.style.backgroundImage = '';
        resetRing();

        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        lastTick = 0;
    }

    function resetRing() {
        if (!ring) return;
        ring.style.opacity = '0';
        ring.style.setProperty('--ld', '126');
    }

    async function loadHeroBlob() {
        const token = ++loadToken;
        const controller = new AbortController();
        loadController = controller;
        let watchdog = setTimeout(() => controller.abort(), 30000);

        try {
            const res = await fetch(VIDEO_URL, { priority: 'low', signal: controller.signal });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            if (token !== loadToken || !videoArmed) return;

            const total = Number(res.headers.get('Content-Length')) || VIDEO_BYTES;
            const reader = res.body.getReader();
            const chunks = [];
            let got = 0;
            let lastRing = 0;

            if (ring) ring.style.opacity = '1';

            for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                if (token !== loadToken || !videoArmed) {
                    controller.abort();
                    return;
                }
                clearTimeout(watchdog);
                watchdog = setTimeout(() => controller.abort(), 20000);
                chunks.push(value);
                got += value.length;

                const frac = Math.min(1, got / total);
                const now = performance.now();
                if (now - lastRing > 100 || frac === 1) {
                    lastRing = now;
                    if (ring) ring.style.setProperty('--ld', String(Math.round(126 * (1 - frac))));
                }
            }

            clearTimeout(watchdog);
            if (token !== loadToken || !videoArmed) return;

            const blob = new Blob(chunks, { type: 'video/mp4' });
            objectUrl = URL.createObjectURL(blob);
            const canPlay = waitForCanPlay(video);
            video.src = objectUrl;
            video.load();
            await canPlay;

            if (token !== loadToken || !videoArmed) return;

            const duration = video.duration || 0;
            video.currentTime = clamp(shown * duration, 0, Math.max(0, duration - 0.05));
            videoReady = true;
            stage.classList.add('video-ready');
            if (ring) ring.style.opacity = '0';
        } catch (err) {
            if (token !== loadToken || !videoArmed) return;
            failVideo();
        } finally {
            clearTimeout(watchdog);
            if (loadController === controller) loadController = null;
        }
    }

    function waitForCanPlay(el, timeoutMs = 15000) {
        return new Promise((resolve, reject) => {
            if (el.readyState >= 3) {
                resolve();
                return;
            }

            let timer = null;

            const onCanPlay = () => {
                cleanup();
                resolve();
            };
            const onError = () => {
                cleanup();
                reject(el.error || new Error('video error'));
            };
            const cleanup = () => {
                clearTimeout(timer);
                el.removeEventListener('canplay', onCanPlay);
                el.removeEventListener('error', onError);
            };

            timer = setTimeout(() => {
                cleanup();
                reject(new Error('canplay timeout'));
            }, timeoutMs);

            el.addEventListener('canplay', onCanPlay, { once: true });
            el.addEventListener('error', onError, { once: true });
        });
    }

    function failVideo() {
        videoReady = false;
        seekBusy = false;
        pendingTime = null;
        clearSeekWatchdog();
        if (ring) ring.style.opacity = '0';
        stage.classList.add('video-failed');
        video.pause();
    }

    // -- SCROLL ENGINE --
    function heroProgress() {
        const range = hero.offsetHeight - window.innerHeight;
        return range > 0 ? clamp(window.scrollY / range, 0, 1) : 0;
    }

    function onScroll() {
        if (!videoArmed) return;
        target = heroProgress();
        startTick();
    }

    function onResize() {
        if (!videoArmed) return;
        target = heroProgress();
        startTick();
    }

    function startTick() {
        if (rafId !== null || !videoArmed || !heroOnScreen) return;
        lastTick = 0;
        rafId = requestAnimationFrame(tick);
    }

    function tick(now) {
        rafId = null;
        if (!videoArmed) return;

        const dt = Math.min(100, now - (lastTick || now));
        lastTick = now;

        const k = 0.16;
        shown += (target - shown) * (1 - Math.pow(1 - k, dt / 16.667));

        const settled = Math.abs(target - shown) < 0.0005;
        if (settled) shown = target;

        updateBands(shown);
        stage.style.setProperty('--p', shown.toFixed(3));

        if (videoReady && video.duration) {
            requestSeek(shown * video.duration);
        }

        if (!settled) {
            rafId = requestAnimationFrame(tick);
        } else {
            lastTick = 0;
        }
    }

    function requestSeek(time) {
        if (!videoReady || !video.duration) return;

        const clamped = clamp(time, 0, Math.max(0, video.duration - 0.05));

        if (seekBusy) {
            pendingTime = clamped;
            return;
        }
        if (Math.abs(video.currentTime - clamped) < 0.008) return;

        seekBusy = true;
        clearSeekWatchdog();
        seekWatchdog = setTimeout(() => {
            seekWatchdog = null;
            seekBusy = false;
            if (pendingTime !== null) {
                const next = pendingTime;
                pendingTime = null;
                requestSeek(next);
            }
        }, 1000);

        try {
            video.currentTime = clamped;
        } catch (err) {
            seekBusy = false;
            clearSeekWatchdog();
        }
    }

    function clearSeekWatchdog() {
        if (seekWatchdog !== null) {
            clearTimeout(seekWatchdog);
            seekWatchdog = null;
        }
    }

    video.addEventListener('seeked', () => {
        seekBusy = false;
        clearSeekWatchdog();
        if (pendingTime !== null) {
            const next = pendingTime;
            pendingTime = null;
            requestSeek(next);
        }
    });

    video.addEventListener('error', () => {
        if (!videoArmed) return;
        failVideo();
    });

    // -- BAND STATE --
    function updateBands(p) {
        bands.forEach(band => {
            const [a, b] = band.dataset.range.split(',').map(Number);
            const entrance = band.dataset.entrance;
            const opening = band.dataset.band === '0';
            const fade = Math.min(0.02, (b - a) / 3);
            const fadeOut = 1 - smoothstep(p, b - fade, b);
            const opacity = opening
                ? loadK * fadeOut
                : smoothstep(p, a, a + fade) * fadeOut;

            let state = bandState.get(band);
            if (!state) {
                state = { opacity: -1, k: -1, ks: -1, kb: -1, active: false, ctaOn: false };
                bandState.set(band, state);
            }

            if (Math.abs(opacity - state.opacity) > 0.002) {
                state.opacity = opacity;
                band.style.opacity = opacity.toFixed(3);
            }

            const active = opacity >= 0.15;
            if (active !== state.active) {
                state.active = active;
                band.classList.toggle('is-active', active);

                if (active) {
                    band.removeAttribute('inert');
                    band.removeAttribute('aria-hidden');
                } else {
                    band.setAttribute('inert', '');
                    band.setAttribute('aria-hidden', 'true');
                    if (state.ctaOn) {
                        state.ctaOn = false;
                        const cta = band.querySelector('.band-cta');
                        if (cta) {
                            cta.classList.remove('cta-on');
                            cta.inert = true;
                        }
                    }
                }
            }

            if (!active) return;

            const ramp = parseFloat(band.dataset.ramp) || Math.min(0.025, (b - a) * 0.35);
            let k = clamp((p - a) / ramp, 0, 1);
            if (opening) k = Math.max(k, loadK);

            if (Math.abs(k - state.k) > 0.008) {
                state.k = k;
                band.style.setProperty('--k', k.toFixed(3));
            }

            if (entrance === 'staged-settle') {
                const local = clamp((p - a) / (b - a), 0, 1);
                const ks = clamp((local - 0.15) / 0.45, 0, 1);
                const kb = clamp((local - 0.62) / 0.2, 0, 1);

                if (Math.abs(ks - state.ks) > 0.008) {
                    state.ks = ks;
                    band.style.setProperty('--ks', ks.toFixed(3));
                }
                if (Math.abs(kb - state.kb) > 0.008) {
                    state.kb = kb;
                    band.style.setProperty('--kb', kb.toFixed(3));
                }

                const cta = band.querySelector('.band-cta');
                if (cta) {
                    const on = kb > 0.2;
                    if (on !== state.ctaOn) {
                        state.ctaOn = on;
                        cta.classList.toggle('cta-on', on);
                        cta.inert = !on;
                    }
                }
            }
        });
    }

    function setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver(entries => {
            heroOnScreen = entries[0].isIntersecting;

            if (heroOnScreen && videoArmed && Math.abs(target - shown) > 0.0005) {
                startTick();
            }

            if (!heroOnScreen && rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
                lastTick = 0;
            }
        }, { threshold: 0 });

        observer.observe(hero);
    }

    // -- TEXT SPLITTING --
    function splitAllText() {
        document.querySelectorAll('[data-split]').forEach(el => {
            const band = el.closest('.band');
            const entrance = band ? band.dataset.entrance : 'scatter';
            const srOnly = el.querySelector('.sr-only');
            const text = (srOnly ? srOnly.textContent : el.textContent).replace(/\s+/g, ' ').trim();
            const container = el.querySelector('.split-text') || el;

            container.textContent = '';

            const words = text.split(' ').filter(Boolean);
            const totalChars = words.reduce((n, word) => n + [...word].length, 0);
            const spread = parseFloat(band && band.dataset.spread) || 0.12;
            const gen = rng(words.length * 97 + text.length);
            let charIndex = 0;

            words.forEach((word, wordIndex) => {
                const wordEl = document.createElement('span');
                wordEl.className = 'w';

                if (entrance === 'word-punch') {
                    wordEl.style.setProperty('--th', ((wordIndex / Math.max(1, words.length - 1)) * spread).toFixed(3));
                } else if (entrance === 'staged-settle') {
                    wordEl.style.setProperty('--th', ((wordIndex / Math.max(1, words.length - 1)) * 0.16).toFixed(3));
                }

                [...word].forEach(char => {
                    const charEl = document.createElement('span');
                    charEl.className = 'c';
                    charEl.textContent = char;

                    if (entrance === 'scatter') {
                        charEl.style.setProperty('--th', (gen() * 0.35).toFixed(3));
                        charEl.style.setProperty('--jx', (gen() * 80 - 40).toFixed(1) + 'px');
                        charEl.style.setProperty('--jy', (gen() * 80 - 40).toFixed(1) + 'px');
                        charEl.style.setProperty('--jr', (gen() * 40 - 20).toFixed(1) + 'deg');
                    } else {
                        charIndex++;
                        charEl.style.setProperty('--th', (0.08 + (charIndex / Math.max(1, totalChars)) * 0.5).toFixed(3));
                    }

                    wordEl.appendChild(charEl);
                });

                container.appendChild(wordEl);
                container.appendChild(document.createTextNode(' '));
            });
        });
    }

    // -- CONTENT --
    const COURSES = [
        { title: 'Introduction à ChatGPT', track: 'amateur', desc: "Apprenez à utiliser l'outil le plus puissant du moment.", duration: '2 h', lessons: 12, url: 'kou-intro-chatgpt.html', note: 'Kreyòl · FR' },
        { title: 'IA Générative d\'Images', track: 'amateur', desc: 'Maîtrisez Midjourney et Stable Diffusion pour créer des visuels uniques.', duration: '4 h', lessons: 18, url: 'kou-ia-images.html', note: 'Kreyòl · FR' },
        { title: 'Automatisation No-Code', track: 'amateur', desc: "Connectez vos outils préférés à l'IA sans écrire une ligne de code.", duration: '3 h', lessons: 15, url: 'kou-otomatisasyon.html', note: 'Kreyòl · FR' },
        { title: 'Fine-Tuning de LLMs', track: 'pro', desc: 'Apprenez à adapter des modèles open-source à vos besoins spécifiques.', duration: '10 h', lessons: 25 },
        { title: 'Déploiement avec LangChain', track: 'pro', desc: 'Créez des applications complexes basées sur des chaînes de pensée.', duration: '8 h', lessons: 22 },
        { title: 'Optimisation de Modèles', track: 'pro', desc: 'Quantisation, pruning et techniques avancées pour la production.', duration: '12 h', lessons: 30 }
    ];

    const TIPS = [
        {
            title: "Comment éviter les hallucinations d'un LLM",
            category: 'prompting',
            date: '2026-10-24',
            excerpt: 'Des consignes de vérification qui forcent le modèle à citer ses sources.'
        },
        {
            title: 'Les 5 outils IA à tester cette semaine',
            category: 'tools',
            date: '2026-10-22',
            excerpt: "Une sélection d'outils utiles, testés et classés par usage."
        },
        {
            title: 'Gagner 2 h par jour avec Copilot',
            category: 'workflow',
            date: '2026-10-20',
            excerpt: 'Les raccourcis et prompts qui font vraiment gagner du temps.'
        },
        {
            title: 'JSON fiable avec les sorties structurées',
            category: 'code',
            date: '2026-10-18',
            excerpt: 'Schémas de sortie, validation et gestion des erreurs côté code.'
        },
        {
            title: 'Structurer un prompt en 4 blocs',
            category: 'prompting',
            date: '2026-10-12',
            excerpt: "Rôle, contexte, tâche, format : la base d'un prompt qui tient la route."
        },
        {
            title: 'NotebookLM pour réviser plus vite',
            category: 'tools',
            date: '2026-10-10',
            excerpt: "Transformer un cours PDF en fiche de révision interactive."
        },
        {
            title: 'Un second cerveau assisté par IA',
            category: 'workflow',
            date: '2026-10-08',
            excerpt: "Capturer, relier, retrouver : un système de notes augmenté par l'IA."
        },
        {
            title: 'RAG minimaliste en 40 lignes',
            category: 'code',
            date: '2026-10-06',
            excerpt: 'Un pipeline documentaire simple, sans framework lourd.'
        },
        {
            title: 'Tester un prompt comme du code',
            category: 'prompting',
            date: '2026-09-28',
            excerpt: 'Versionner, mesurer, itérer : la méthode des équipes qui livrent.'
        },
        {
            title: "Choisir son générateur d'images",
            category: 'tools',
            date: '2026-09-26',
            excerpt: 'Photographie, illustration, produit : quel modèle pour quel besoin.'
        },
        {
            title: 'Automatiser sa veille sans code',
            category: 'workflow',
            date: '2026-09-24',
            excerpt: "Des flux simples pour suivre l'actualité sans y passer la journée."
        },
        {
            title: 'Déboguer un agent pas à pas',
            category: 'code',
            date: '2026-09-22',
            excerpt: "Journaliser, rejouer, isoler : la boucle de debug d'un agent."
        }
    ];

    const CATEGORY_LABELS = {
        all: 'Tout',
        prompting: 'Prompting',
        tools: 'Outils',
        workflow: 'Workflow',
        code: 'Code'
    };

    const DATE_FORMAT = new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    function formatDate(iso) {
        return DATE_FORMAT.format(new Date(`${iso}T12:00:00`));
    }

    function renderCourses() {
        const containers = {
            amateur: document.getElementById('courses-amateur'),
            pro: document.getElementById('courses-pro')
        };
        const counts = { amateur: 0, pro: 0 };

        COURSES.forEach(course => {
            const container = containers[course.track];
            if (!container) return;

            const card = document.createElement('article');
            card.className = 'course-card reveal';
            card.style.setProperty('--d', `${counts[course.track] * 70}ms`);
            counts[course.track]++;

            const title = document.createElement('h3');
            if (course.url) {
                const link = document.createElement('a');
                link.href = course.url;
                link.textContent = course.title;
                title.appendChild(link);
            } else {
                title.textContent = course.title;
            }

            const desc = document.createElement('p');
            desc.textContent = course.desc;

            const meta = document.createElement('div');
            meta.className = 'course-meta';

            const metaItems = [course.duration, `${course.lessons} leçons`];
            if (course.note) metaItems.push(course.note);

            metaItems.forEach(text => {
                const item = document.createElement('span');
                item.textContent = text;
                meta.appendChild(item);
            });

            card.append(title, desc, meta);
            container.appendChild(card);
        });
    }

    let activeFilter = 'all';
    let tipsShown = TIPS_PAGE_SIZE;
    let tipsGrid = null;
    let loadMoreTips = null;
    let tipsStatus = null;

    function filteredTips() {
        return activeFilter === 'all'
            ? TIPS
            : TIPS.filter(tip => tip.category === activeFilter);
    }

    function createTipCard(tip, index = 0) {
        const card = document.createElement('article');
        card.className = 'tip-card reveal';
        card.style.setProperty('--d', `${index * 70}ms`);

        const badge = document.createElement('span');
        badge.className = `track-badge ${tip.category}`;
        badge.textContent = CATEGORY_LABELS[tip.category] || tip.category;

        const title = document.createElement('h3');
        title.textContent = tip.title;

        const excerpt = document.createElement('p');
        excerpt.className = 'tip-excerpt';
        excerpt.textContent = tip.excerpt;

        const date = document.createElement('time');
        date.className = 'tip-date';
        date.dateTime = tip.date;
        date.textContent = formatDate(tip.date);

        card.append(badge, title, excerpt, date);
        return card;
    }

    function renderTips(announce) {
        if (!tipsGrid) return;

        const list = filteredTips();
        const visible = list.slice(0, tipsShown);

        if (revealObserver) {
            tipsGrid.querySelectorAll('.reveal').forEach(el => revealObserver.unobserve(el));
        }

        tipsGrid.replaceChildren(...visible.map((tip, index) => createTipCard(tip, index)));
        if (revealObserver) observeReveals(tipsGrid);

        if (loadMoreTips) {
            loadMoreTips.hidden = tipsShown >= list.length;
        }

        if (announce && tipsStatus) {
            const scope = activeFilter === 'all' ? '' : ` (${CATEGORY_LABELS[activeFilter]})`;
            tipsStatus.textContent = `${visible.length} sur ${list.length} astuces affichées${scope}.`;
        }
    }

    function setupTips() {
        tipsGrid = document.getElementById('tipsGrid');
        loadMoreTips = document.getElementById('loadMoreTips');
        tipsStatus = document.getElementById('tipsStatus');
        if (!tipsGrid) return;

        const filterButtons = [...document.querySelectorAll('.filter-btn[data-filter]')];

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.dataset.filter;
                if (filter === activeFilter) return;

                activeFilter = filter;
                tipsShown = TIPS_PAGE_SIZE;

                filterButtons.forEach(other => {
                    const on = other === button;
                    other.classList.toggle('active', on);
                    other.setAttribute('aria-pressed', String(on));
                });

                renderTips(true);
            });
        });

        if (loadMoreTips) {
            loadMoreTips.addEventListener('click', () => {
                tipsShown += TIPS_PAGE_SIZE;
                renderTips(true);
            });
        }

        renderTips(false);
    }

    function setupNewsletter() {
        const form = document.getElementById('newsletterForm');
        const input = document.getElementById('email');
        const status = document.getElementById('formStatus');
        if (!form || !input || !status) return;

        form.addEventListener('submit', event => {
            event.preventDefault();

            const value = input.value.trim();
            const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

            if (!valid) {
                status.dataset.state = 'error';
                status.textContent = "Merci de saisir une adresse e-mail valide.";
                input.setAttribute('aria-invalid', 'true');
                input.focus();
                return;
            }

            // Demo only: connect this form to an email service before launch.
            input.removeAttribute('aria-invalid');
            status.dataset.state = 'success';
            status.textContent = 'Merci ! Votre inscription est bien enregistrée.';
            form.reset();
        });

        input.addEventListener('input', () => {
            if (input.getAttribute('aria-invalid') !== 'true' || !input.checkValidity()) return;
            input.removeAttribute('aria-invalid');
            if (status.dataset.state === 'error') {
                delete status.dataset.state;
                status.textContent = '';
            }
        });
    }

    function setupPlaceholderLinks() {
        const toast = document.getElementById('toast');
        if (!toast) return;

        let hideTimer = null;
        let clearTimer = null;

        const show = message => {
            clearTimeout(hideTimer);
            clearTimeout(clearTimer);
            toast.textContent = message;
            toast.classList.add('show');

            hideTimer = setTimeout(() => {
                toast.classList.remove('show');
                clearTimer = setTimeout(() => {
                    toast.textContent = '';
                }, 250);
            }, 3200);
        };

        document.addEventListener('click', event => {
            const link = event.target.closest('a[data-soon]');
            if (!link) return;

            event.preventDefault();
            const label = link.dataset.soon || link.textContent.trim();
            show(`${label} : bientôt disponible.`);
        });
    }

    // -- REVEALS --
    let revealObserver = null;

    function observeReveals(root = document) {
        const selector = '.reveal:not(.in), .seq-group:not(.in)';

        if (!revealObserver) {
            root.querySelectorAll(selector).forEach(el => {
                el.classList.add('in', 'is-sequenced');
            });
            return;
        }

        root.querySelectorAll(selector).forEach(el => revealObserver.observe(el));
    }

    function setupReveals() {
        document.documentElement.classList.add('motion-ready');

        if (!('IntersectionObserver' in window)) {
            observeReveals(document);
            return;
        }

        revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                const el = entry.target;
                observer.unobserve(el);
                el.classList.add('in');

                setTimeout(() => {
                    el.classList.add('is-sequenced');
                }, 1000);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

        observeReveals(document);
    }

    // -- LIVING MOTION + OFFSCREEN/TAB PAUSE --
    function setupLivingMotion() {
        const living = [...document.querySelectorAll('.section, .footer')];

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    entry.target.classList.toggle('anim-live', entry.isIntersecting);
                });
            }, { threshold: 0.05 });

            living.forEach(el => observer.observe(el));
        } else {
            living.forEach(el => el.classList.add('anim-live'));
        }

        const syncPaused = () => {
            document.body.classList.toggle('paused', document.hidden);
        };

        document.addEventListener('visibilitychange', syncPaused);
        syncPaused();
    }

    // -- DESIGNED INTERACTIVE MOMENT: HOLD TO REVEAL --
    const JOURNEY_HOLD_MS = 1000;

    function setupJourney() {
        const trigger = document.getElementById('journeyTrigger');
        const label = document.getElementById('journeyLabel');
        const hint = document.getElementById('journeyHint');
        const status = document.getElementById('journeyStatus');
        if (!trigger || !label) return;

        const HINT_IDLE = "Une seconde d'appui suffit. Relâcher avant la fin laisse la progression redescendre.";
        const HINT_DONE = 'Les six cours sont maintenant mis en avant.';

        const fill = trigger.querySelector('.journey-fill');
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

        let progress = 0;
        let holding = false;
        let done = false;
        let autoDone = false;
        let raf = null;
        let startedAt = 0;

        const setProgress = value => {
            progress = clamp(value, 0, 1);
            if (fill) fill.style.transform = `scaleX(${progress.toFixed(3)})`;
        };

        const complete = ({ instant = false, auto = false } = {}) => {
            if (done) return;

            done = true;
            autoDone = auto;
            holding = false;
            if (raf !== null) {
                cancelAnimationFrame(raf);
                raf = null;
            }

            setProgress(1);
            trigger.classList.remove('is-holding');
            trigger.classList.add('is-complete');
            trigger.setAttribute('aria-disabled', 'true');
            label.textContent = 'Parcours révélé';
            if (hint) hint.textContent = HINT_DONE;

            const cards = [...document.querySelectorAll('.course-card')];
            cards.forEach((card, index) => {
                card.style.setProperty('--lit-delay', instant ? '0ms' : `${index * 90}ms`);
                card.classList.add('is-lit');
            });

            if (status) {
                status.textContent = auto ? '' : `Parcours révélé. ${cards.length} cours mis en avant.`;
            }
        };

        const reset = () => {
            done = false;
            autoDone = false;
            holding = false;
            if (raf !== null) {
                cancelAnimationFrame(raf);
                raf = null;
            }

            setProgress(0);
            trigger.classList.remove('is-holding', 'is-complete');
            trigger.removeAttribute('aria-disabled');
            label.textContent = 'Maintenir pour révéler le parcours';
            if (hint) hint.textContent = HINT_IDLE;

            document.querySelectorAll('.course-card.is-lit').forEach(card => {
                card.classList.remove('is-lit');
                card.style.removeProperty('--lit-delay');
            });

            if (status) status.textContent = '';
        };

        const release = () => {
            if (!holding) return;

            holding = false;
            if (raf !== null) {
                cancelAnimationFrame(raf);
                raf = null;
            }
            trigger.classList.remove('is-holding');
            if (!done) setProgress(0);
        };

        const hold = () => {
            if (done || holding) return;

            holding = true;
            trigger.classList.add('is-holding');
            startedAt = performance.now() - progress * JOURNEY_HOLD_MS;

            const step = now => {
                if (!holding) return;

                const next = clamp((now - startedAt) / JOURNEY_HOLD_MS, 0, 1);
                setProgress(next);

                if (next >= 1) {
                    complete();
                    return;
                }

                raf = requestAnimationFrame(step);
            };

            raf = requestAnimationFrame(step);
            if (status) status.textContent = "Maintenez l'appui pour révéler le parcours.";
        };

        trigger.addEventListener('pointerdown', event => {
            if (done || event.button !== 0) return;
            hold();

            if (trigger.setPointerCapture && event.pointerId !== undefined) {
                try {
                    trigger.setPointerCapture(event.pointerId);
                } catch (err) {
                    // Synthetic pointers may not be capturable; the hold still works.
                }
            }
        });

        trigger.addEventListener('pointerup', release);
        trigger.addEventListener('pointercancel', release);
        trigger.addEventListener('lostpointercapture', release);

        trigger.addEventListener('keydown', event => {
            if (done || (event.key !== ' ' && event.key !== 'Enter')) return;
            event.preventDefault();
            if (!event.repeat) hold();
        });

        trigger.addEventListener('keyup', event => {
            if (event.key !== ' ' && event.key !== 'Enter') return;
            event.preventDefault();
            release();
        });

        trigger.addEventListener('blur', release);

        const applyMotionPreference = () => {
            if (reduced.matches) {
                if (!done) complete({ instant: true, auto: true });
            } else if (autoDone) {
                reset();
            }
        };

        if (reduced.addEventListener) {
            reduced.addEventListener('change', applyMotionPreference);
        } else if (reduced.addListener) {
            reduced.addListener(applyMotionPreference);
        }

        applyMotionPreference();
    }

    // -- CARD SPOTLIGHT --
    function setupSpotlight() {
        if (window.matchMedia('(pointer: coarse)').matches) return;

        let queued = null;
        let raf = null;

        const flush = () => {
            raf = null;
            if (!queued) return;

            const { card, x, y } = queued;
            queued = null;

            const rect = card.getBoundingClientRect();
            if (!rect.width || !rect.height) return;

            card.style.setProperty('--mx', `${(((x - rect.left) / rect.width) * 100).toFixed(2)}%`);
            card.style.setProperty('--my', `${(((y - rect.top) / rect.height) * 100).toFixed(2)}%`);
        };

        document.addEventListener('pointermove', event => {
            const target = event.target instanceof Element ? event.target : null;
            const card = target ? target.closest('.course-card, .tip-card') : null;
            if (!card) return;

            queued = { card, x: event.clientX, y: event.clientY };
            if (raf === null) raf = requestAnimationFrame(flush);
        }, { passive: true });
    }

    function init() {
        if (!hero || !stage || !video) return;

        setupGating();
        document.querySelectorAll('.band-cta').forEach(cta => {
            cta.inert = true;
        });

        splitAllText();
        renderCourses();
        setupTips();
        setupNewsletter();
        setupPlaceholderLinks();
        setupReveals();
        setupLivingMotion();
        setupJourney();
        setupSpotlight();
        setupIntersectionObserver();

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize, { passive: true });

        updateGating();

        const start = performance.now();
        const duration = 1200;

        function step(now) {
            const p = Math.min(1, (now - start) / duration);
            loadK = smoothstep(p, 0, 1);
            updateBands(shown);
            if (p < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }

    document.addEventListener('DOMContentLoaded', init);
})();
