document.addEventListener('DOMContentLoaded', () => {
    const headerOffset = 80;
    const navbar = document.querySelector('.navbar');
    const navbarToggle = document.querySelector('.navbar__toggle');
    const mobileMenu = document.getElementById('mobileMenu');

    const mobileCarouselMedia = window.matchMedia('(max-width: 767px)');
    const reduceMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');

    const closeMobileMenu = () => {
        if (!navbar || !navbarToggle || !mobileMenu) return;
        navbar.classList.remove('navbar--menu-open');
        navbarToggle.setAttribute('aria-expanded', 'false');
        navbarToggle.setAttribute('aria-label', 'Open menu');
        mobileMenu.hidden = true;
    };

    const openMobileMenu = () => {
        if (!navbar || !navbarToggle || !mobileMenu) return;
        navbar.classList.add('navbar--menu-open');
        navbarToggle.setAttribute('aria-expanded', 'true');
        navbarToggle.setAttribute('aria-label', 'Close menu');
        mobileMenu.hidden = false;
    };

    if (navbarToggle && navbar && mobileMenu) {
        navbarToggle.addEventListener('click', () => {
            const isOpen = navbar.classList.contains('navbar--menu-open');
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        mobileMenu.addEventListener('click', (event) => {
            if (event.target.closest('a')) {
                closeMobileMenu();
            }
        });

        document.addEventListener('click', (event) => {
            if (!navbar.classList.contains('navbar--menu-open')) return;
            if (navbar.contains(event.target)) return;
            closeMobileMenu();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeMobileMenu();
            }
        });
    }

    const initAutoSwipeCarousel = (carousel, itemSelector) => {
        const items = Array.from(carousel.querySelectorAll(itemSelector));
        if (items.length < 2) return () => {};

        let activeIndex = 0;
        let timerId = null;
        let indicators = [];

        const indicatorHost = (() => {
            const existing = carousel.nextElementSibling;
            if (existing && existing.classList.contains('carousel-indicators')) return existing;

            const node = document.createElement('div');
            node.className = 'carousel-indicators';
            carousel.insertAdjacentElement('afterend', node);
            return node;
        })();

        const setActiveIndicator = (index) => {
            indicators.forEach((dot, dotIndex) => {
                const isActive = dotIndex === index;
                dot.classList.toggle('carousel-indicator--active', isActive);
                dot.setAttribute('aria-current', isActive ? 'true' : 'false');
            });
        };

        const buildIndicators = () => {
            indicatorHost.innerHTML = '';
            indicators = items.map((_, index) => {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'carousel-indicator';
                dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
                dot.addEventListener('click', () => {
                    stopAutoSwipe();
                    scrollToIndex(index);
                    startAutoSwipe();
                });
                indicatorHost.appendChild(dot);
                return dot;
            });
            setActiveIndicator(activeIndex);
        };

        const setNearestActiveIndex = () => {
            const viewportCenter = carousel.scrollLeft + (carousel.clientWidth / 2);
            let nearestIndex = 0;
            let minDistance = Number.POSITIVE_INFINITY;

            items.forEach((item, index) => {
                const itemCenter = item.offsetLeft + (item.clientWidth / 2);
                const distance = Math.abs(itemCenter - viewportCenter);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestIndex = index;
                }
            });

            activeIndex = nearestIndex;
            setActiveIndicator(activeIndex);
        };

        const scrollToIndex = (index, behavior = 'smooth') => {
            const target = items[index];
            if (!target) return;

            const carouselRect = carousel.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            const targetCenter = (targetRect.left - carouselRect.left) + carousel.scrollLeft + (targetRect.width / 2);
            const targetLeft = targetCenter - (carousel.clientWidth / 2);

            carousel.scrollTo({ left: targetLeft, behavior });
            activeIndex = index;
            setActiveIndicator(activeIndex);
        };

        const stopAutoSwipe = () => {
            if (!timerId) return;
            clearInterval(timerId);
            timerId = null;
        };

        const startAutoSwipe = () => {
            if (timerId || reduceMotionMedia.matches || !mobileCarouselMedia.matches) return;

            timerId = setInterval(() => {
                const nextIndex = (activeIndex + 1) % items.length;
                scrollToIndex(nextIndex);
            }, 3600);
        };

        const handleInteractionStart = () => {
            setNearestActiveIndex();
            stopAutoSwipe();
        };

        const handleInteractionEnd = () => {
            setNearestActiveIndex();
            startAutoSwipe();
        };

        const handleMediaChange = () => {
            if (mobileCarouselMedia.matches && !reduceMotionMedia.matches) {
                startAutoSwipe();
            } else {
                stopAutoSwipe();
            }
        };

        carousel.addEventListener('scroll', setNearestActiveIndex, { passive: true });
        carousel.addEventListener('pointerdown', handleInteractionStart, { passive: true });
        carousel.addEventListener('pointerup', handleInteractionEnd, { passive: true });
        carousel.addEventListener('touchstart', handleInteractionStart, { passive: true });
        carousel.addEventListener('touchend', handleInteractionEnd, { passive: true });
        carousel.addEventListener('mouseenter', handleInteractionStart);
        carousel.addEventListener('mouseleave', handleInteractionEnd);
        carousel.addEventListener('focusin', handleInteractionStart);
        carousel.addEventListener('focusout', handleInteractionEnd);
        mobileCarouselMedia.addEventListener('change', handleMediaChange);
        reduceMotionMedia.addEventListener('change', handleMediaChange);

        buildIndicators();
        scrollToIndex(0, 'auto');
        handleMediaChange();

        return () => {
            stopAutoSwipe();
            carousel.removeEventListener('scroll', setNearestActiveIndex);
            carousel.removeEventListener('pointerdown', handleInteractionStart);
            carousel.removeEventListener('pointerup', handleInteractionEnd);
            carousel.removeEventListener('touchstart', handleInteractionStart);
            carousel.removeEventListener('touchend', handleInteractionEnd);
            carousel.removeEventListener('mouseenter', handleInteractionStart);
            carousel.removeEventListener('mouseleave', handleInteractionEnd);
            carousel.removeEventListener('focusin', handleInteractionStart);
            carousel.removeEventListener('focusout', handleInteractionEnd);
            mobileCarouselMedia.removeEventListener('change', handleMediaChange);
            reduceMotionMedia.removeEventListener('change', handleMediaChange);
        };
    };

    document.querySelectorAll('.gallery-grid, .reviews-grid').forEach((carousel) => {
        const itemSelector = carousel.classList.contains('gallery-grid')
            ? '.gallery-grid__item'
            : '.review-card';
        initAutoSwipeCarousel(carousel, itemSelector);
    });

    const initImageFadeIn = () => {
        const fadeImages = Array.from(document.querySelectorAll('img[data-fade-image]'));

        fadeImages.forEach((image) => {
            const markLoaded = () => {
                image.classList.remove('media-image--loading');
                image.classList.add('media-image--loaded');
            };

            if (image.complete) {
                markLoaded();
                return;
            }

            image.classList.add('media-image--loading');
            image.addEventListener('load', markLoaded, { once: true });
            image.addEventListener('error', markLoaded, { once: true });
        });
    };

    initImageFadeIn();

    const initScrollReveal = () => {
        const revealTargets = [];

        const addRevealTargets = (selector, direction = 'up', stagger = 70) => {
            const nodes = Array.from(document.querySelectorAll(selector));
            nodes.forEach((node, index) => {
                node.classList.add('reveal-on-scroll', `reveal--from-${direction}`);
                const delay = Math.min(index * stagger, 260);
                node.style.setProperty('--reveal-delay', `${delay}ms`);
                revealTargets.push(node);
            });
        };

        addRevealTargets('.hero__content', 'left', 0);
        addRevealTargets('.hero__visual', 'right', 0);
        addRevealTargets('#services .section-header', 'up', 0);
        addRevealTargets('.service-card__content', 'up', 80);
        addRevealTargets('#quote .section-header', 'up', 0);
        addRevealTargets('#quote .form', 'up', 0);
        addRevealTargets('#gallery .section-header', 'up', 0);
        addRevealTargets('#reviews .section-header', 'up', 0);
        addRevealTargets('.review-card', 'up', 65);
        addRevealTargets('.about-grid > *', 'up', 80);
        addRevealTargets('.footer__grid > *', 'up', 80);
        addRevealTargets('.footer__bottom', 'up', 0);

        if (reduceMotionMedia.matches || typeof IntersectionObserver === 'undefined') {
            revealTargets.forEach((target) => target.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver((entries, entryObserver) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                entryObserver.unobserve(entry.target);
            });
        }, {
            root: null,
            threshold: 0.14,
            rootMargin: '0px 0px -8% 0px'
        });

        revealTargets.forEach((target) => observer.observe(target));
    };

    initScrollReveal();

    // Delegate smooth scroll for internal anchors to avoid many listeners.
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        e.preventDefault();
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    });

    // Prevent Form Default Submission
    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
        const nameInput = quoteForm.querySelector('#name');
        const phoneInput = quoteForm.querySelector('#phone');
        const emailInput = quoteForm.querySelector('#email');
        const addressInput = quoteForm.querySelector('#address');
        const availabilitySelector = quoteForm.querySelector('#availabilitySelector');
        const availabilityCaption = quoteForm.querySelector('#availabilityCaption');
        const availabilityHiddenInput = quoteForm.querySelector('#availabilityDays');
        const dayButtons = availabilitySelector ? Array.from(availabilitySelector.querySelectorAll('.availability-selector__day')) : [];
        const serviceOptionItems = Array.from(quoteForm.querySelectorAll('.service-options__item'));
        const serviceOptionInputs = Array.from(quoteForm.querySelectorAll('.service-options__item input[type="checkbox"]'));

        const formatAvailabilityText = (selectedDayIndexes) => {
            if (selectedDayIndexes.length === 0) {
                return 'Please select your availability';
            }

            const tokens = [];
            const selectedSet = new Set(selectedDayIndexes);
            const hasWeekendPair = selectedSet.has(5) && selectedSet.has(6);
            const weekdayIndexes = selectedDayIndexes.filter((index) => index < 5);

            let cursor = 0;
            while (cursor < weekdayIndexes.length) {
                const start = weekdayIndexes[cursor];
                let end = start;

                while (
                    cursor + 1 < weekdayIndexes.length &&
                    weekdayIndexes[cursor + 1] === end + 1
                ) {
                    cursor += 1;
                    end = weekdayIndexes[cursor];
                }

                const rangeLength = end - start + 1;
                if (rangeLength >= 3) {
                    tokens.push(`${dayButtons[start].dataset.dayShort} - ${dayButtons[end].dataset.dayShort}`);
                } else {
                    for (let dayIndex = start; dayIndex <= end; dayIndex += 1) {
                        tokens.push(dayButtons[dayIndex].dataset.dayShort);
                    }
                }

                cursor += 1;
            }

            if (hasWeekendPair) {
                tokens.push('Weekends');
            } else {
                if (selectedSet.has(5)) {
                    tokens.push(dayButtons[5].dataset.dayShort);
                }
                if (selectedSet.has(6)) {
                    tokens.push(dayButtons[6].dataset.dayShort);
                }
            }

            return tokens.join(', ');
        };

        const getSelectedDayIndexes = () => dayButtons
            .map((button, index) => (button.classList.contains('availability-selector__day--active') ? index : -1))
            .filter((index) => index !== -1);

        const clearAvailabilityError = () => {
            if (!availabilitySelector || !availabilityCaption) return;
            availabilitySelector.classList.remove('availability-selector--error');
            availabilityCaption.classList.remove('form__availability-caption--error');
        };

        const updateAvailabilityUI = () => {
            if (!availabilityCaption || !availabilityHiddenInput) return;

            const selectedIndexes = getSelectedDayIndexes();
            const selectedDays = selectedIndexes.map((index) => dayButtons[index].dataset.day);

            availabilityHiddenInput.value = selectedDays.join(', ');
            availabilityCaption.textContent = formatAvailabilityText(selectedIndexes);

            if (selectedIndexes.length > 0) {
                clearAvailabilityError();
            }
        };

        const validateAvailability = () => {
            const hasSelection = getSelectedDayIndexes().length > 0;
            if (hasSelection) {
                clearAvailabilityError();
                return true;
            }

            if (availabilitySelector && availabilityCaption) {
                availabilitySelector.classList.add('availability-selector--error');
                availabilityCaption.classList.add('form__availability-caption--error');
                availabilityCaption.textContent = 'Please select at least one day you are available.';
            }
            return false;
        };

        const validateContactRequirement = () => {
            if (!phoneInput || !emailInput) return true;

            const hasPhone = phoneInput.value.trim().length > 0;
            const hasEmail = emailInput.value.trim().length > 0;
            const message = 'Please enter either a phone number or an email address so we can reach you.';

            if (!hasPhone && !hasEmail) {
                phoneInput.setCustomValidity(message);
                emailInput.setCustomValidity(message);
                return false;
            }

            phoneInput.setCustomValidity('');
            emailInput.setCustomValidity('');
            return true;
        };

        const updateServiceOptionsUI = () => {
            serviceOptionItems.forEach((item) => {
                const checkbox = item.querySelector('input[type="checkbox"]');
                if (!checkbox) return;
                item.classList.toggle('service-options__item--active', checkbox.checked);
            });
        };

        dayButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const isActive = button.classList.toggle('availability-selector__day--active');
                button.setAttribute('aria-pressed', String(isActive));
                updateAvailabilityUI();
            });
        });

        [phoneInput, emailInput].forEach((input) => {
            if (!input) return;
            input.addEventListener('input', () => {
                if (phoneInput) phoneInput.setCustomValidity('');
                if (emailInput) emailInput.setCustomValidity('');
                validateContactRequirement();
            });
        });

        serviceOptionInputs.forEach((input) => {
            input.addEventListener('change', updateServiceOptionsUI);
        });

        quoteForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const hasValidContact = validateContactRequirement();
            const hasValidAvailability = validateAvailability();

            if (!quoteForm.checkValidity() || !hasValidContact || !hasValidAvailability) {
                quoteForm.reportValidity();
                return;
            }

            const submitBtn = quoteForm.querySelector('button[type="submit"]');
            if (!submitBtn) return;
            
            // Mockup form behavior
            const originalText = submitBtn.textContent;
            submitBtn.textContent = "Request Sent! We'll be in touch soon.";
            submitBtn.classList.add('btn--success');
            
            quoteForm.reset();
            dayButtons.forEach((button) => {
                button.classList.remove('availability-selector__day--active');
                button.setAttribute('aria-pressed', 'false');
            });
            updateAvailabilityUI();
            updateServiceOptionsUI();
            
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.classList.remove('btn--success');
            }, 3000);
        });

        if (nameInput) nameInput.required = true;
        if (addressInput) addressInput.required = true;
        updateAvailabilityUI();
        updateServiceOptionsUI();
    }
});
