/**
 * MODULIV Core Shared Engine (Warm Japandi Editorial)
 * - Unified shopping-cart state and localStorage persistence.
 * - Cart identity is always the canonical product slug + Payload variant ID
 *   (or the parent product for a genuinely non-configurable product).
 */

(function () {
    'use strict';

    var CART_COUNT_KEY = 'moduliv-cart-count';
    var CART_ITEMS_KEY = 'moduliv-cart-items-v3';
    var LEGACY_CART_ITEMS_KEY = 'moduliv-cart-items-v2';
    var MAX_ITEM_QUANTITY = 20;

    function normalizeQuantity(value, fallback) {
        var quantity = typeof value === 'number' && Number.isInteger(value) && value > 0
            ? value
            : (fallback || 1);
        return Math.min(MAX_ITEM_QUANTITY, Math.max(1, quantity));
    }

    function normalizeVariantOptions(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
        var normalized = {};
        if (['boucle', 'chenille', 'corduroy', 'techGrey'].indexOf(value.upholstery) !== -1) {
            normalized.upholstery = value.upholstery;
        }
        if (['oak', 'walnut'].indexOf(value.woodFinish) !== -1) {
            normalized.woodFinish = value.woodFinish;
        }
        if (['king', 'queen'].indexOf(value.bedSize) !== -1) {
            normalized.bedSize = value.bedSize;
        }
        return Object.keys(normalized).length ? normalized : null;
    }

    function normalizeItem(item, allowParentItems) {
        if (!item || typeof item !== 'object') return null;
        var id = item.id === 'bundle-1bed' ? '1-bedroom-kit' : item.id;
        var hasVariant = item.variantId !== undefined;
        if (
            typeof id !== 'string' || !id ||
            typeof item.name !== 'string' || !item.name ||
            !Number.isInteger(item.price) || item.price < 1 ||
            (hasVariant && (!Number.isInteger(item.variantId) || item.variantId < 1)) ||
            (!allowParentItems && !hasVariant)
        ) return null;

        var normalized = {
            id: id,
            name: item.name,
            price: item.price,
            qty: normalizeQuantity(item.qty)
        };
        if (hasVariant) normalized.variantId = item.variantId;
        if (typeof item.boxCount === 'number') normalized.boxCount = item.boxCount;
        if (typeof item.image === 'string') normalized.image = item.image;
        // Gallery rows only identify at most one option, never an exact SKU.
        normalized.imageIsRepresentative = true;
        if (typeof item.shippingWeightKg === 'number') normalized.shippingWeightKg = item.shippingWeightKg;
        if (typeof item.variant === 'string') normalized.variant = item.variant;
        var variantOptions = normalizeVariantOptions(item.variantOptions);
        if (variantOptions) normalized.variantOptions = variantOptions;
        return normalized;
    }

    function lineKey(item) {
        return item.id + '::' + (item.variantId === undefined ? 'parent' : item.variantId);
    }

    function normalizeItems(items, allowParentItems) {
        if (!Array.isArray(items)) return [];
        var byKey = new Map();
        items.forEach(function (candidate) {
            var item = normalizeItem(candidate, allowParentItems !== false);
            if (!item) return;
            var key = lineKey(item);
            var previous = byKey.get(key);
            if (previous) {
                previous.qty = normalizeQuantity(previous.qty + item.qty);
            } else {
                byKey.set(key, item);
            }
        });
        return Array.from(byKey.values());
    }

    function totalFor(items) {
        return items.reduce(function (total, item) {
            return total + normalizeQuantity(item.qty);
        }, 0);
    }

    function writeItems(items, clearLegacy) {
        try {
            localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(items));
            if (clearLegacy) localStorage.removeItem(LEGACY_CART_ITEMS_KEY);
            localStorage.setItem(CART_COUNT_KEY, String(totalFor(items)));
        } catch (e) {}
    }

    function getCount() {
        try {
            return totalFor(getItems());
        } catch (e) {
            return 0;
        }
    }

    function getItems() {
        var raw = localStorage.getItem(CART_ITEMS_KEY);
        var source = null;
        var fromLegacy = false;

        if (raw) {
            try {
                source = JSON.parse(raw);
                if (!Array.isArray(source)) source = null;
            } catch {
                source = null;
            }
        }

        if (!source) {
            fromLegacy = true;
            try {
                var legacyRaw = localStorage.getItem(LEGACY_CART_ITEMS_KEY);
                source = legacyRaw ? JSON.parse(legacyRaw) : [];
                if (!Array.isArray(source)) source = [];
            } catch {
                source = [];
            }
        }

        // v2 predated canonical variant IDs, so drop its parent-only rows
        // rather than guessing a configurable SKU. Current v3 parent rows
        // remain valid for truly non-configurable products.
        var normalized = normalizeItems(source, !fromLegacy);
        // Persist repair-only migrations so a malformed hand-crafted line
        // cannot return after the next browser refresh.
        if (fromLegacy || JSON.stringify(source) !== JSON.stringify(normalized)) {
            writeItems(normalized, fromLegacy);
        }
        return normalized;
    }

    function setItems(items) {
        var normalized = normalizeItems(items);
        writeItems(normalized, true);
        var totalCount = totalFor(normalized);
        paintCartBadges(false);
        window.dispatchEvent(new CustomEvent('moduliv:cart-updated', {
            detail: { count: totalCount, items: normalized }
        }));
        return totalCount;
    }

    function addToCart(qty, item) {
        var candidate = normalizeItem(Object.assign({}, item, { qty: qty }));
        if (!candidate) return getCount();

        var currentItems = getItems();
        var key = lineKey(candidate);
        var found = currentItems.find(function (current) { return lineKey(current) === key; });
        if (found) {
            found.qty = normalizeQuantity(found.qty + candidate.qty);
        } else {
            currentItems.push(candidate);
        }
        setItems(currentItems);
        paintCartBadges(true);
        return getCount();
    }

    // Non-additive by design: a direct PDP intent targets one SKU and cannot
    // duplicate an existing cart line. Deliberate Add to Cart remains additive.
    function upsertCartItem(qty, item) {
        var candidate = normalizeItem(Object.assign({}, item, { qty: qty }));
        if (!candidate) return getCount();

        var currentItems = getItems();
        var key = lineKey(candidate);
        var index = currentItems.findIndex(function (current) { return lineKey(current) === key; });
        if (index === -1) currentItems.push(candidate);
        else currentItems[index] = candidate;
        setItems(currentItems);
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
        add: addToCart,
        count: getCount,
        items: getItems,
        maxItemQuantity: MAX_ITEM_QUANTITY,
        paint: paintCartBadges,
        setItems: setItems,
        upsert: upsertCartItem
    };

    function init() {
        // Repair local storage and the legacy count as soon as the bridge loads.
        setItems(getItems());
        paintCartBadges(false);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
