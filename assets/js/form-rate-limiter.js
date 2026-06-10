// ================================================
// FORM RATE LIMITING UTILITY
// Prevents spam submissions on contact/inquiry forms
// ================================================

class FormRateLimiter {
    constructor(formId, limitMinutes = 2) {
        this.formId = formId;
        this.limitMinutes = limitMinutes;
        this.storageKey = `form_submit_${formId}`;
    }

    canSubmit() {
        const lastSubmit = localStorage.getItem(this.storageKey);
        if (!lastSubmit) return true;

        const lastSubmitTime = parseInt(lastSubmit);
        const now = Date.now();
        const timeDiff = now - lastSubmitTime;
        const minutesPassed = timeDiff / (1000 * 60);

        return minutesPassed >= this.limitMinutes;
    }

    getRemainingTime() {
        const lastSubmit = localStorage.getItem(this.storageKey);
        if (!lastSubmit) return 0;

        const lastSubmitTime = parseInt(lastSubmit);
        const now = Date.now();
        const timeDiff = now - lastSubmitTime;
        const minutesPassed = timeDiff / (1000 * 60);
        const remaining = this.limitMinutes - minutesPassed;

        return Math.max(0, Math.ceil(remaining));
    }

    recordSubmit() {
        localStorage.setItem(this.storageKey, Date.now().toString());
    }

    showRateLimitMessage(containerElement) {
        const remaining = this.getRemainingTime();
        const message = document.createElement('div');
        message.className = 'alert alert-warning mt-3';
        message.innerHTML = `
            <i class="fas fa-clock me-2"></i>
            <strong>Please wait ${remaining} minute${remaining > 1 ? 's' : ''}</strong> before submitting again.
        `;

        if (containerElement) {
            containerElement.appendChild(message);
            setTimeout(() => message.remove(), 5000);
        }

        return message;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormRateLimiter;
} else {
    window.FormRateLimiter = FormRateLimiter;
}
