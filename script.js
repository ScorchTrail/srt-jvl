document.addEventListener('DOMContentLoaded', () => {
    const headerOffset = 80;

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
                availabilityCaption.textContent = 'Please select at least one available day';
            }
            return false;
        };

        const validateContactRequirement = () => {
            if (!phoneInput || !emailInput) return true;

            const hasPhone = phoneInput.value.trim().length > 0;
            const hasEmail = emailInput.value.trim().length > 0;
            const message = 'Please enter either a phone number or an email address.';

            if (!hasPhone && !hasEmail) {
                phoneInput.setCustomValidity(message);
                emailInput.setCustomValidity(message);
                return false;
            }

            phoneInput.setCustomValidity('');
            emailInput.setCustomValidity('');
            return true;
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
            submitBtn.textContent = 'Request Sent!';
            submitBtn.classList.add('btn--success');
            
            quoteForm.reset();
            dayButtons.forEach((button) => {
                button.classList.remove('availability-selector__day--active');
                button.setAttribute('aria-pressed', 'false');
            });
            updateAvailabilityUI();
            
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.classList.remove('btn--success');
            }, 3000);
        });

        if (nameInput) nameInput.required = true;
        if (addressInput) addressInput.required = true;
        updateAvailabilityUI();
    }
});
