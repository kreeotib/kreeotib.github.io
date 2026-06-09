const ToggleWrapper = (() => {
    const DEFAULTS = {
        wrapperSelector: '.toggle-wrapper',
        blockSelector: '.toggle-block',
        openClass: 'open',
        heightVar: '--toggle-height',
        transitionProperty: 'max-height',
    };

    let config = {...DEFAULTS};
    const resizeObservers = new WeakMap();
    const mutationObservers = new WeakMap();
    const transitionHandlers = new WeakMap();
    const registered = new WeakSet();

    function updateHeight(wrapper, block) {
        wrapper.style.setProperty(config.heightVar, block.scrollHeight + 'px');
    }

    function createTransitionHandler(wrapper) {
        return function (event) {
            if (event.target !== wrapper) return;
            if (event.propertyName !== config.transitionProperty) return;
            if (wrapper.classList.contains(config.openClass)) {
                wrapper.style.maxHeight = 'none';
            }
        };
    }

    function openWrapper(wrapper) {
        wrapper.style.maxHeight = '';
        void wrapper.offsetHeight;
    }

    function closeWrapper(wrapper, block) {
        wrapper.style.maxHeight = block.scrollHeight + 'px';
        void wrapper.offsetHeight;
        requestAnimationFrame(() => {
            wrapper.style.maxHeight = '';
        });
    }

    function observeClass(wrapper, block) {
        let wasOpen = wrapper.classList.contains(config.openClass);
        if (wasOpen) wrapper.style.maxHeight = 'none';

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type !== 'attributes' || mutation.attributeName !== 'class') continue;
                const isOpen = wrapper.classList.contains(config.openClass);
                if (isOpen === wasOpen) continue;
                if (isOpen) openWrapper(wrapper);
                else closeWrapper(wrapper, block);
                wasOpen = isOpen;
            }
        });

        observer.observe(wrapper, {attributes: true, attributeFilter: ['class']});
        mutationObservers.set(wrapper, observer);
    }

    function observeResize(wrapper, block) {
        const observer = new ResizeObserver(() => updateHeight(wrapper, block));
        observer.observe(block);
        resizeObservers.set(block, observer);
    }

    function initWrapper(wrapper) {
        if (registered.has(wrapper)) return;
        const block = wrapper.querySelector(':scope > ' + config.blockSelector);
        if (!block) return;

        registered.add(wrapper);
        updateHeight(wrapper, block);
        observeResize(wrapper, block);

        const handler = createTransitionHandler(wrapper);
        wrapper.addEventListener('transitionend', handler);
        transitionHandlers.set(wrapper, handler);

        observeClass(wrapper, block);
    }

    function init(container, options = {}) {
        config = {...DEFAULTS, ...options};
        const root = container || document;
        const wrappers = root.querySelectorAll(config.wrapperSelector);

        if (!wrappers.length) {
            console.warn('[ToggleWrapper] No wrappers found.');
            return;
        }

        wrappers.forEach(initWrapper);
    }

    function refresh(container) {
        const root = container || document;
        const wrappers = root.querySelectorAll(config.wrapperSelector);
        wrappers.forEach((wrapper) => {
            const block = wrapper.querySelector(':scope > ' + config.blockSelector);
            if (block) updateHeight(wrapper, block);
        });
    }

    function destroy(wrapper) {
        if (!registered.has(wrapper)) return;
        const block = wrapper.querySelector(':scope > ' + config.blockSelector);

        const resizeObserver = block && resizeObservers.get(block);
        if (resizeObserver) {
            resizeObserver.disconnect();
            resizeObservers.delete(block);
        }

        const mutationObserver = mutationObservers.get(wrapper);
        if (mutationObserver) {
            mutationObserver.disconnect();
            mutationObservers.delete(wrapper);
        }

        const handler = transitionHandlers.get(wrapper);
        if (handler) {
            wrapper.removeEventListener('transitionend', handler);
            transitionHandlers.delete(wrapper);
        }

        registered.delete(wrapper);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => init());
    } else {
        init();
    }

    return {init, refresh, destroy};
})();

window.ToggleWrapper = ToggleWrapper;

document.addEventListener('DOMContentLoaded', () => {
    ToggleWrapper.init();
});