/**
 * MODULIV Core Shared Engine (Warm Japandi Editorial)
 * - Unified Shopping Cart State Machine & LocalStorage Persistence
 * - Global Instant Search Modal
 * - Announcement Bar & Scroll Reveal Observers
 *
 * Privacy Policy / Terms of Service are rendered by the React
 * <PolicyModal> component (src/components/moduliv/PolicyModal.tsx), which
 * reads messages/policies/<locale>.json. It opens itself via
 * window.modulivOpenPolicy(modalId) — this file only calls that bridge,
 * it does not own any modal markup or content.
 *
 * Currency is single-currency (USD) only — there is no working multi-
 * currency checkout, so this file does not render a currency switcher.
 */

(function () {
    'use strict';

    /* ==========================================================================
       1. UNIFIED CART SYSTEM
       ========================================================================== */
    var CART_COUNT_KEY = 'moduliv-cart-count';
    var CART_ITEMS_KEY = 'moduliv-cart-items';

    function getCount() {
        try {
            return parseInt(localStorage.getItem(CART_COUNT_KEY), 10) || 0;
        } catch (e) {
            return 0;
        }
    }

    function getItems() {
        try {
            var raw = localStorage.getItem(CART_ITEMS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function setItems(items) {
        if (!Array.isArray(items)) items = [];
        try {
            localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(items));
        } catch (e) {}

        var totalCount = 0;
        for (var i = 0; i < items.length; i++) {
            totalCount += (items[i].qty || 1);
        }

        try {
            localStorage.setItem(CART_COUNT_KEY, String(totalCount));
        } catch (e) {}

        paintCartBadges(false);
        window.dispatchEvent(new CustomEvent('moduliv:cart-updated', { detail: { count: totalCount, items: items } }));
        return totalCount;
    }

    function addToCart(qty, item) {
        var n = typeof qty === 'number' ? qty : 1;
        var currentItems = getItems();

        if (item && item.id) {
            var found = false;
            for (var i = 0; i < currentItems.length; i++) {
                if (currentItems[i].id === item.id && currentItems[i].variant === item.variant) {
                    currentItems[i].qty = (currentItems[i].qty || 1) + n;
                    found = true;
                    break;
                }
            }
            if (!found) {
                var newItem = Object.assign({}, item);
                newItem.qty = n;
                currentItems.push(newItem);
            }
            setItems(currentItems);
        } else {
            // Fallback for legacy calls without item payload
            var count = getCount() + n;
            try {
                localStorage.setItem(CART_COUNT_KEY, String(count));
            } catch (e) {}
            paintCartBadges(true);
        }

        paintCartBadges(true);
        return getCount();
    }

    function paintCartBadges(pulse) {
        var cartLinks = document.querySelectorAll('[data-cart-link]');
        var count = getCount();

        cartLinks.forEach(function (link) {
            var badge = link.querySelector('.cart-badge');
            if (!badge && count > 0) {
                badge = document.createElement('span');
                badge.className = 'cart-badge';
                badge.setAttribute('aria-hidden', 'true');
                link.appendChild(badge);
            }
            if (badge) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = count > 0 ? '' : 'none';
                if (pulse && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    badge.classList.remove('cart-badge--pulse');
                    void badge.offsetWidth; // trigger reflow
                    badge.classList.add('cart-badge--pulse');
                }
            }
        });
    }

    window.modulivCart = {
        count: getCount,
        items: getItems,
        setItems: setItems,
        add: addToCart,
        paint: paintCartBadges
    };

    /* ==========================================================================
       2. GLOBAL SEARCH MODAL
       ========================================================================== */
    function getLocalizedUrl(path) {
        var isStitch = typeof window !== 'undefined' && window.location.pathname.indexOf('stitch') !== -1;
        if (isStitch) {
            if (path === '/products/modusofa') return 'modusofa-product-detail-page.html';
            if (path === '/1-bedroom-kit-builder') return '1-bedroom-kit-builder.html';
            if (path === '/free-swatch-box-material-discovery') return 'free-swatch-box-material-discovery.html';
            if (path === '/how-it-works-craft-logistics') return 'how-it-works-craft-logistics.html';
            if (path.indexOf('/faq') === 0) return path.replace('/faq', 'faq.html');
            return path;
        }

        var parts = window.location.pathname.split('/').filter(Boolean);
        var firstSeg = parts[0] || '';
        var supportedLocales = ['en', 'zh-CN', 'zh-TW', 'de', 'ja', 'ar', 'ru'];
        var cleanPath = path.startsWith('/') ? path : '/' + path;
        if (supportedLocales.indexOf(firstSeg) !== -1) {
            return '/' + firstSeg + cleanPath;
        }
        return cleanPath;
    }

    var SEARCH_INDEX = [
        {
            title: "The ModuSofa (3-Seater)",
            category: "Seating System",
            snippet: "The $699 snap-together modular 3-seater. Tool-free assembly in 5 minutes, FSC oak frame, 4 high-end fabrics.",
            url: "/products/modusofa"
        },
        {
            title: "The 1-Bedroom Full Apartment Kit",
            category: "Move-In Bundles",
            snippet: "A full 1-bed home in 6 boxes for $1,499. Includes sofa, coffee table, TV console, bed frame, and 2 nightstands. Save $395.",
            url: "/1-bedroom-kit-builder"
        },
        {
            title: "Free Fabric Swatch Box & $50 Voucher",
            category: "Material Discovery",
            snippet: "Curated physical samples of Cream Bouclé, Caramel Corduroy, Olive Chenille, and Tech Grey + $50 credit.",
            url: "/free-swatch-box-material-discovery"
        },
        {
            title: "How It Works & The DDP Journey",
            category: "Craft & Logistics",
            snippet: "Fresh-pressed on-demand foam, zero-screw Snap-Lock joints, and carbon-offset 14–18 day DDP ocean delivery.",
            url: "/how-it-works-craft-logistics"
        },
        {
            title: "Frequently Asked Questions (FAQ)",
            category: "Support & Policy",
            snippet: "100-night in-home trial, zero customs duties guaranteed, tool-free assembly breakdown, and donation-over-return.",
            url: "/faq"
        },
        {
            title: "Design Lab: 3D Snap-Joint Study",
            category: "WebGL Interactive",
            snippet: "Interactive 3D real-time simulation of our patented precision-milled interlocking snap joint.",
            url: "/three-js"
        },
        {
            title: "100-Night In-Home Trial Policy",
            category: "Customer Promise",
            snippet: "Live with your furniture for 100 nights. If you don't love it, we arrange free pickup and a 100% refund.",
            url: "/faq#returns"
        },
        {
            title: "Zero-Duty DDP Delivery Guarantee",
            category: "Logistics",
            snippet: "Delivered Duty Paid — customs, brokerage, taxes and doorstep drop are 100% included with zero surprise fees.",
            url: "/faq#ddp"
        }
    ];

    function createSearchModal() {
        if (document.getElementById('moduliv-search-modal')) return;

        var overlay = document.createElement('div');
        overlay.id = 'moduliv-search-modal';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Site Search');
        overlay.className = 'fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 md:pt-24 px-4 transition-opacity duration-200 hidden opacity-0';
        overlay.style.display = 'none';

        overlay.innerHTML = 
            '<div class="bg-[#F9F8F6] text-[#1a1c1d] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#d9c2b8]/50 overflow-hidden transform transition-transform duration-200 scale-95" id="moduliv-search-container">' +
            '  <div class="p-4 md:p-6 border-b border-[#d9c2b8]/40 flex items-center gap-3 bg-white">' +
            '    <span class="material-symbols-outlined text-[#8a4725] text-2xl">search</span>' +
            '    <input id="moduliv-search-input" type="search" placeholder="Search bundles, ModuSofa, materials, delivery, trial..." autocomplete="off" class="w-full bg-transparent text-lg md:text-xl font-body-md text-[#1a1c1d] placeholder:text-[#54433c]/60 outline-none" />' +
            '    <button type="button" id="moduliv-search-close" aria-label="Close search" class="text-[#54433c] hover:text-[#1a1c1d] p-1.5 rounded-full hover:bg-[#e2e2e3]/40 transition-colors">' +
            '      <span class="material-symbols-outlined text-xl">close</span>' +
            '    </button>' +
            '  </div>' +
            '  <div class="p-4 md:p-6 max-h-[60vh] overflow-y-auto space-y-4" id="moduliv-search-results">' +
            '    <div class="text-xs font-label-md uppercase tracking-wider text-[#86736b] mb-2">Popular Searches</div>' +
            '    <div class="flex flex-wrap gap-2 pb-2" id="moduliv-search-tags">' +
            '      <button type="button" data-tag="ModuSofa" class="px-3 py-1.5 rounded-full bg-white border border-[#d9c2b8] text-xs font-label-md hover:border-[#8a4725] hover:text-[#8a4725] transition-colors">ModuSofa</button>' +
            '      <button type="button" data-tag="1-Bedroom" class="px-3 py-1.5 rounded-full bg-white border border-[#d9c2b8] text-xs font-label-md hover:border-[#8a4725] hover:text-[#8a4725] transition-colors">1-Bedroom Kit ($1,499)</button>' +
            '      <button type="button" data-tag="Swatch" class="px-3 py-1.5 rounded-full bg-white border border-[#d9c2b8] text-xs font-label-md hover:border-[#8a4725] hover:text-[#8a4725] transition-colors">Free Swatches ($0)</button>' +
            '      <button type="button" data-tag="DDP" class="px-3 py-1.5 rounded-full bg-white border border-[#d9c2b8] text-xs font-label-md hover:border-[#8a4725] hover:text-[#8a4725] transition-colors">DDP Delivery</button>' +
            '      <button type="button" data-tag="Trial" class="px-3 py-1.5 rounded-full bg-white border border-[#d9c2b8] text-xs font-label-md hover:border-[#8a4725] hover:text-[#8a4725] transition-colors">100-Night Trial</button>' +
            '    </div>' +
            '    <div class="divide-y divide-[#d9c2b8]/30" id="moduliv-search-list"></div>' +
            '  </div>' +
            '</div>';

        document.body.appendChild(overlay);

        var input = document.getElementById('moduliv-search-input');
        var resultsList = document.getElementById('moduliv-search-list');
        var closeBtn = document.getElementById('moduliv-search-close');
        var container = document.getElementById('moduliv-search-container');

        function renderResults(q) {
            var query = (q || '').trim().toLowerCase();
            var matches = SEARCH_INDEX;
            if (query) {
                matches = SEARCH_INDEX.filter(function (item) {
                    return item.title.toLowerCase().indexOf(query) !== -1 ||
                           item.category.toLowerCase().indexOf(query) !== -1 ||
                           item.snippet.toLowerCase().indexOf(query) !== -1;
                });
            }

            if (!matches.length) {
                resultsList.innerHTML = '<div class="py-8 text-center text-[#54433c] font-body-md">' +
                    '<p class="text-base font-medium">No results found for "' + escapeHtml(query) + '"</p>' +
                    '<p class="text-xs text-[#86736b] mt-1">Try searching for "sofa", "bed", "swatches", or "trial".</p>' +
                    '</div>';
                return;
            }

            var html = '';
            for (var i = 0; i < matches.length; i++) {
                var it = matches[i];
                html += '<a href="' + getLocalizedUrl(it.url) + '" class="block p-3 rounded-xl hover:bg-white transition-colors group">' +
                        '  <div class="flex items-center justify-between text-xs font-label-md uppercase tracking-wider text-[#8a4725] mb-1">' +
                        '    <span>' + it.category + '</span>' +
                        '    <span class="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>' +
                        '  </div>' +
                        '  <h4 class="font-headline-sm text-base font-medium text-[#1a1c1d] group-hover:text-[#8a4725] transition-colors">' + it.title + '</h4>' +
                        '  <p class="font-body-md text-xs text-[#54433c] line-clamp-2 mt-0.5">' + it.snippet + '</p>' +
                        '</a>';
            }
            resultsList.innerHTML = html;
        }

        renderResults('');

        input.addEventListener('input', function () {
            renderResults(input.value);
        });

        document.getElementById('moduliv-search-tags').addEventListener('click', function (e) {
            var btn = e.target.closest('button[data-tag]');
            if (btn) {
                input.value = btn.dataset.tag;
                renderResults(input.value);
                input.focus();
            }
        });

        function openModal() {
            overlay.style.display = 'flex';
            overlay.classList.remove('hidden');
            setTimeout(function () {
                overlay.classList.remove('opacity-0');
                container.classList.remove('scale-95');
                container.classList.add('scale-100');
            }, 10);
            input.value = '';
            renderResults('');
            input.focus();
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            overlay.classList.add('opacity-0');
            container.classList.remove('scale-100');
            container.classList.add('scale-95');
            setTimeout(function () {
                overlay.classList.add('hidden');
                overlay.style.display = 'none';
                document.body.style.overflow = '';
            }, 200);
        }

        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeModal();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
                closeModal();
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (overlay.classList.contains('hidden')) openModal(); else closeModal();
            }
        });

        window.modulivOpenSearch = openModal;
        window.modulivCloseSearch = closeModal;
    }

    /* ==========================================================================
       3. WIRE SEARCH BUTTONS & CHROME
       ========================================================================== */
    function wireSearchButtons() {
        createSearchModal();
        document.querySelectorAll('button[aria-label="Search"], button:has([data-icon="search"])').forEach(function (btn) {
            if (!btn.hasAttribute('data-search-wired')) {
                btn.setAttribute('data-search-wired', 'true');
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    if (window.modulivOpenSearch) window.modulivOpenSearch();
                });
            }
        });
    }

    function wireAnnouncementDismiss() {
        var bar = document.getElementById('announcement-bar');
        var dismiss = document.getElementById('announcement-dismiss');
        try {
            if (localStorage.getItem('moduliv-announce-hidden') === '1' && bar) {
                bar.style.display = 'none';
            }
        } catch (e) {}
        if (bar && dismiss && !dismiss.hasAttribute('data-wired')) {
            dismiss.setAttribute('data-wired', 'true');
            dismiss.addEventListener('click', function () {
                bar.style.display = 'none';
                try { localStorage.setItem('moduliv-announce-hidden', '1'); } catch (e) {}
            });
        }
    }

    /* ==========================================================================
       4. MOBILE DRAWER NAVIGATION (DEF-08)
       ========================================================================== */
    function initMobileDrawer() {
        var existing = document.getElementById('moduliv-mobile-drawer') || document.getElementById('mobile-nav-drawer');
        if (existing) {
            return;
        }

        var isStitch = window.location.pathname.indexOf('stitch') !== -1;

        var drawer = document.createElement('div');
        drawer.id = 'moduliv-mobile-drawer';
        drawer.className = 'fixed inset-0 z-50 flex hidden';
        drawer.style.display = 'none';
        drawer.setAttribute('role', 'dialog');
        drawer.setAttribute('aria-modal', 'true');
        drawer.setAttribute('aria-label', 'Mobile navigation menu');

        drawer.innerHTML =
            '<div id="moduliv-drawer-backdrop" class="fixed inset-0 bg-black/50 backdrop-blur-sm opacity-0 transition-opacity duration-300"></div>' +
            '<aside id="moduliv-drawer-panel" class="relative w-[320px] max-w-[85vw] h-full bg-[#f9f8f6] dark:bg-[#1a1c1d] shadow-2xl flex flex-col justify-between overflow-y-auto transform -translate-x-full transition-transform duration-300 ease-out z-10 p-6">' +
            '  <div>' +
            '    <div class="flex items-center justify-between pb-5 border-b border-outline-variant/30 dark:border-outline/20">' +
            '      <a href="' + (isStitch ? 'index.html' : '/') + '" class="group flex items-baseline gap-1.5 focus:outline-none" aria-label="The Flat Set — Home">' +
            '        <span class="font-serif italic text-xl tracking-tight text-on-surface dark:text-surface-bright group-hover:text-primary transition-colors">The</span>' +
            '        <span class="font-serif font-semibold text-xl tracking-tight text-on-surface dark:text-surface-bright group-hover:text-primary transition-colors">Flat Set</span>' +
            '      </a>' +
            '      <button id="moduliv-drawer-close" type="button" aria-label="Close navigation menu" class="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors">' +
            '        <span class="material-symbols-outlined text-[22px]">close</span>' +
            '      </button>' +
            '    </div>' +
            '    <div class="mt-4">' +
            '      <button id="moduliv-drawer-search-btn" type="button" class="w-full flex items-center gap-3 px-4 py-2.5 rounded-full bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/40 text-on-surface-variant text-sm font-label-md hover:border-primary transition-colors text-left">' +
            '        <span class="material-symbols-outlined text-[20px] text-primary">search</span>' +
            '        <span>Search furniture, kits, FAQs...</span>' +
            '      </button>' +
            '    </div>' +
            '    <nav class="mt-6 flex flex-col gap-1" aria-label="Mobile Navigation">' +
            '      <span class="text-[10px] uppercase font-bold tracking-widest text-outline mb-2 px-2">Collections & Living</span>' +
            '      <a href="' + (isStitch ? '1-bedroom-kit-builder.html' : '/1-bedroom-kit-builder') + '" class="drawer-nav-item flex items-center justify-between px-3 py-3 rounded-lg text-on-surface dark:text-surface-bright font-serif text-base hover:bg-surface-container-highest transition-colors">' +
            '        <span>1-Bedroom Kit</span>' +
            '        <span class="material-symbols-outlined text-[18px] text-outline">arrow_forward</span>' +
            '      </a>' +
            '      <a href="' + (isStitch ? 'modusofa-product-detail-page.html' : '/products/modusofa') + '" class="drawer-nav-item flex items-center justify-between px-3 py-3 rounded-lg text-on-surface dark:text-surface-bright font-serif text-base hover:bg-surface-container-highest transition-colors">' +
            '        <span>ModuSofa</span>' +
            '        <span class="material-symbols-outlined text-[18px] text-outline">arrow_forward</span>' +
            '      </a>' +
            '      <a href="' + (isStitch ? 'how-it-works-craft-logistics.html' : '/how-it-works-craft-logistics') + '" class="drawer-nav-item flex items-center justify-between px-3 py-3 rounded-lg text-on-surface dark:text-surface-bright font-serif text-base hover:bg-surface-container-highest transition-colors">' +
            '        <span>Craft & Logistics</span>' +
            '        <span class="material-symbols-outlined text-[18px] text-outline">arrow_forward</span>' +
            '      </a>' +
            '      <a href="' + (isStitch ? 'free-swatch-box-material-discovery.html' : '/free-swatch-box-material-discovery') + '" class="drawer-nav-item flex items-center justify-between px-3 py-3 rounded-lg text-on-surface dark:text-surface-bright font-serif text-base hover:bg-surface-container-highest transition-colors">' +
            '        <span>Free Swatch Box</span>' +
            '        <span class="material-symbols-outlined text-[18px] text-outline">arrow_forward</span>' +
            '      </a>' +
            '      <a href="' + (isStitch ? 'brand.html' : '/brand') + '" class="drawer-nav-item flex items-center justify-between px-3 py-3 rounded-lg text-on-surface dark:text-surface-bright font-serif text-base hover:bg-surface-container-highest transition-colors">' +
            '        <span>Brand VI Guidelines</span>' +
            '        <span class="text-xs uppercase px-2 py-0.5 rounded bg-primary-fixed text-primary font-sans font-semibold">New</span>' +
            '      </a>' +
            '      <a href="' + (isStitch ? 'faq.html' : '/faq') + '" class="drawer-nav-item flex items-center justify-between px-3 py-3 rounded-lg text-on-surface dark:text-surface-bright font-serif text-base hover:bg-surface-container-highest transition-colors">' +
            '        <span>FAQ & Support</span>' +
            '        <span class="material-symbols-outlined text-[18px] text-outline">arrow_forward</span>' +
            '      </a>' +
            '      <a href="' + (isStitch ? 'cart.html' : '/cart') + '" class="drawer-nav-item flex items-center justify-between px-3 py-3 rounded-lg text-on-surface dark:text-surface-bright font-serif text-base hover:bg-surface-container-highest transition-colors">' +
            '        <span>Cart & Checkout</span>' +
            '        <span class="drawer-cart-badge text-xs px-2 py-0.5 rounded-full bg-primary text-on-primary font-sans font-bold">0</span>' +
            '      </a>' +
            '    </nav>' +
            '  </div>' +
            '  <div class="pt-6 border-t border-outline-variant/30 dark:border-outline/20 flex flex-col gap-4">' +
            '    <div class="bg-surface-container-low dark:bg-surface-container p-3.5 rounded-xl border border-outline-variant/30 text-xs text-on-surface-variant">' +
            '      <div class="font-semibold text-on-surface mb-1 flex items-center gap-1.5">' +
            '        <span class="material-symbols-outlined text-[16px] text-primary">verified</span>' +
            '        <span>The Flat Set Guarantee</span>' +
            '      </div>' +
            '      <p class="text-[11px] leading-relaxed text-outline">6 Flat Boxes · 60-Minute Assembly · 0 Screws · DDP Guaranteed Delivery.</p>' +
            '    </div>' +
            '    <div class="flex items-center justify-between text-xs text-outline">' +
            '      <button type="button" id="moduliv-drawer-privacy" class="hover:text-primary transition-colors cursor-pointer">Privacy Policy</button>' +
            '      <span>•</span>' +
            '      <button type="button" id="moduliv-drawer-terms" class="hover:text-primary transition-colors cursor-pointer">Terms & Conditions</button>' +
            '    </div>' +
            '    <div class="text-[11px] text-outline/80 text-center">' +
            '      © 2026 The Flat Set Inc.' +
            '    </div>' +
            '  </div>' +
            '</aside>';

        document.body.appendChild(drawer);

        var backdrop = document.getElementById('moduliv-drawer-backdrop');
        var panel = document.getElementById('moduliv-drawer-panel');
        var closeBtn = document.getElementById('moduliv-drawer-close');

        function openDrawer() {
            drawer.style.display = 'flex';
            drawer.classList.remove('hidden');
            var badge = drawer.querySelector('.drawer-cart-badge');
            if (badge && window.modulivCart) badge.textContent = window.modulivCart.count();
            setTimeout(function () {
                backdrop.classList.remove('opacity-0');
                backdrop.classList.add('opacity-100');
                panel.classList.remove('-translate-x-full');
                panel.classList.add('translate-x-0');
            }, 10);
            document.body.style.overflow = 'hidden';
            var trigger = document.getElementById('mobile-menu-trigger');
            if (trigger) trigger.setAttribute('aria-expanded', 'true');
        }

        function closeDrawer() {
            backdrop.classList.remove('opacity-100');
            backdrop.classList.add('opacity-0');
            panel.classList.remove('translate-x-0');
            panel.classList.add('-translate-x-full');
            setTimeout(function () {
                drawer.classList.add('hidden');
                drawer.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
            var trigger = document.getElementById('mobile-menu-trigger');
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
        }

        function toggleDrawer() {
            if (drawer.classList.contains('hidden') || drawer.style.display === 'none') {
                openDrawer();
            } else {
                closeDrawer();
            }
        }

        if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
        if (backdrop) backdrop.addEventListener('click', closeDrawer);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !drawer.classList.contains('hidden')) {
                closeDrawer();
            }
        });

        drawer.querySelectorAll('.drawer-nav-item').forEach(function (link) {
            link.addEventListener('click', closeDrawer);
        });

        var drawerSearchBtn = document.getElementById('moduliv-drawer-search-btn');
        if (drawerSearchBtn) {
            drawerSearchBtn.addEventListener('click', function () {
                closeDrawer();
                setTimeout(function () {
                    if (window.modulivOpenSearch) window.modulivOpenSearch();
                }, 200);
            });
        }

        // Privacy/Terms content live in the React <PolicyModal> component
        // (src/components/moduliv/PolicyModal.tsx); it opens itself via
        // window.modulivOpenPolicy(modalId), so this drawer just calls that
        // bridge instead of owning any modal markup itself.
        var drawerPrivacyBtn = document.getElementById('moduliv-drawer-privacy');
        if (drawerPrivacyBtn) {
            drawerPrivacyBtn.addEventListener('click', function () {
                closeDrawer();
                setTimeout(function () {
                    if (window.modulivOpenPolicy) window.modulivOpenPolicy('moduliv-privacy-modal');
                }, 200);
            });
        }

        var drawerTermsBtn = document.getElementById('moduliv-drawer-terms');
        if (drawerTermsBtn) {
            drawerTermsBtn.addEventListener('click', function () {
                closeDrawer();
                setTimeout(function () {
                    if (window.modulivOpenPolicy) window.modulivOpenPolicy('moduliv-terms-modal');
                }, 200);
            });
        }

        document.querySelectorAll('#mobile-menu-trigger, [data-drawer-trigger]').forEach(function (btn) {
            if (!btn.hasAttribute('data-drawer-wired')) {
                btn.setAttribute('data-drawer-wired', 'true');
                btn.setAttribute('aria-expanded', 'false');
                btn.setAttribute('aria-controls', 'moduliv-mobile-drawer');
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    toggleDrawer();
                });
            }
        });

        window.modulivDrawer = {
            open: openDrawer,
            close: closeDrawer,
            toggle: toggleDrawer
        };
    }

    function wireScrollReveal() {
        var els = document.querySelectorAll('.reveal');
        if (!els.length) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
            els.forEach(function (el) { el.classList.add('reveal--in'); });
        } else {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) {
                    if (en.isIntersecting) {
                        en.target.classList.add('reveal--in');
                        io.unobserve(en.target);
                    }
                });
            }, { threshold: 0.12 });
            els.forEach(function (el) { io.observe(el); });
        }
    }

    function escapeHtml(str) {
        return (str || '').replace(/[&<>"']/g, function (m) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
        });
    }

    /* ==========================================================================
       INITIALIZATION
       ========================================================================== */
    function ensureTailwindCompiled() {
        if (typeof window !== 'undefined' && window.tailwind && window.tailwind.config) {
            var probe = document.querySelector('.bg-on-background');
            if (probe && window.getComputedStyle(probe).backgroundColor === 'rgba(0, 0, 0, 0)') {
                window.tailwind.config = JSON.parse(JSON.stringify(window.tailwind.config));
            }
        }
    }

    function init() {
        ensureTailwindCompiled();
        setTimeout(ensureTailwindCompiled, 100);
        setTimeout(ensureTailwindCompiled, 500);
        paintCartBadges(false);
        wireSearchButtons();
        wireAnnouncementDismiss();
        initMobileDrawer();
        wireScrollReveal();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
