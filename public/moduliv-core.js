/**
 * MODULIV Core Shared Engine (Warm Japandi Editorial)
 * - Unified Shopping Cart State Machine & LocalStorage Persistence
 *
 * Global search and the mobile navigation drawer are now the React
 * <SearchModal> / <ModulivHeader> components (src/components/moduliv/) —
 * this file no longer builds any modal or drawer markup itself.
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
    var CART_ITEMS_KEY = 'moduliv-cart-items-v2'; // v1 held dollars; money is cents now

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
                    badge.getAnimations().forEach(function (animation) { animation.cancel(); });
                    badge.animate([
                        { transform: 'scale(.72)', opacity: .7 },
                        { transform: 'scale(1.16)', opacity: 1, offset: .58 },
                        { transform: 'scale(1)', opacity: 1 }
                    ], { duration: 320, easing: 'cubic-bezier(.16, 1, .3, 1)' });
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
       INITIALIZATION
       ========================================================================== */
    function init() {
        paintCartBadges(false);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
