class WebflowModal {
    constructor() {
        this.modal = document.querySelector('[summary-engine="modal"]');
        this.closeButton = document.querySelector('[summary-engine="modal-close"]');
        this.openWindowButton = document.querySelector('[summary-engine="modal-open-window"]');
        this.mainButton = document.querySelector('[summary-engine="main-button"]');
        
        if (!this.modal) {
            console.warn('WebflowModal: No modal found');
            return;
        }
        
        this.config = {
            firstModalDelay: 15000,    // 15 seconds for first case study
            subsequentModalDelay: 20000, // 20 seconds for subsequent case studies
            rateLimitDelay: 30000,     // 30 seconds between modals
            maxDismissals: 2           // Maximum dismissals before stopping
        };
        
        this.caseStudyId = this.getCaseStudyId();
        this.init();
    }
    
    init() {
        console.log('WebflowModal initialized for case study:', this.caseStudyId);
        
        // Hide modal initially
        this.hideModal();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Check if we should show modal
        this.checkModalDisplay();
    }
    
    getCaseStudyId() {
        // Extract case study ID from URL or page
        const path = window.location.pathname;
        const segments = path.split('/').filter(segment => segment);
        
        // Try to find case study identifier in URL
        // This might need adjustment based on your URL structure
        const caseStudyId = segments[segments.length - 1] || 'default';
        console.log('WebflowModal: Case study ID detected:', caseStudyId);
        return caseStudyId;
    }
    
    setupEventListeners() {
        // Close modal button
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => {
                this.dismissModal();
            });
        }
        
        // Open window button
        if (this.openWindowButton) {
            this.openWindowButton.addEventListener('click', () => {
                this.openWindowAndCloseModal();
            });
        }
        
        // Main button (if clicked while modal is open)
        if (this.mainButton) {
            this.mainButton.addEventListener('click', () => {
                if (this.isModalVisible()) {
                    this.openWindowAndCloseModal();
                }
            });
        }
        
        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalVisible()) {
                this.dismissModal();
            }
        });
        
        // Close modal on backdrop click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.dismissModal();
            }
        });
    }
    
    checkModalDisplay() {
        console.log('WebflowModal: Checking if modal should be displayed');
        
        if (!this.shouldShowModal()) {
            console.log('WebflowModal: Modal should not be shown');
            return;
        }
        
        const delay = this.getModalDelay();
        console.log('WebflowModal: Showing modal after', delay, 'ms');
        
        setTimeout(() => {
            this.showModal();
        }, delay);
    }
    
    shouldShowModal() {
        // Check all conditions
        const summaryUsed = this.getSessionData('summary_used', false);
        const dismissedCount = this.getSessionData('modal_dismissed_count', 0);
        const modalShown = this.getSessionData(`modal_shown_${this.caseStudyId}`, false);
        const lastModalTime = this.getSessionData('last_modal_timestamp', 0);
        const now = Date.now();
        
        console.log('WebflowModal: Checking conditions:', {
            summaryUsed,
            dismissedCount,
            modalShown,
            timeSinceLastModal: now - lastModalTime
        });
        
        // User hasn't used summary feature
        if (summaryUsed) {
            console.log('WebflowModal: User already used summary feature');
            return false;
        }
        
        // User hasn't dismissed modal too many times
        if (dismissedCount >= this.config.maxDismissals) {
            console.log('WebflowModal: User dismissed modal too many times');
            return false;
        }
        
        // Modal not already shown on this case study
        if (modalShown) {
            console.log('WebflowModal: Modal already shown on this case study');
            return false;
        }
        
        // Rate limiting - at least 30 seconds since last modal
        if (lastModalTime > 0 && (now - lastModalTime) < this.config.rateLimitDelay) {
            console.log('WebflowModal: Rate limited - too soon since last modal');
            return false;
        }
        
        return true;
    }
    
    getModalDelay() {
        const dismissedCount = this.getSessionData('modal_dismissed_count', 0);
        return dismissedCount === 0 ? this.config.firstModalDelay : this.config.subsequentModalDelay;
    }
    
    showModal() {
        console.log('WebflowModal: Showing modal');
        
        // Track modal display
        this.setSessionData(`modal_shown_${this.caseStudyId}`, true);
        this.setSessionData('last_modal_timestamp', Date.now());
        
        // Show modal with animation
        this.modal.style.display = 'flex';
        this.modal.style.opacity = '0';
        this.modal.style.transform = 'scale(0.9)';
        this.modal.style.transition = 'all 0.3s ease-out';
        
        requestAnimationFrame(() => {
            this.modal.style.opacity = '1';
            this.modal.style.transform = 'scale(1)';
        });
    }
    
    hideModal() {
        this.modal.style.display = 'none';
        this.modal.style.opacity = '0';
        this.modal.style.transform = 'scale(0.9)';
    }
    
    isModalVisible() {
        return this.modal.style.display === 'flex' && this.modal.style.opacity === '1';
    }
    
    dismissModal() {
        console.log('WebflowModal: Dismissing modal');
        
        // Track dismissal
        const dismissedCount = this.getSessionData('modal_dismissed_count', 0);
        this.setSessionData('modal_dismissed_count', dismissedCount + 1);
        
        // Hide modal with animation
        this.modal.style.opacity = '0';
        this.modal.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            this.hideModal();
        }, 300);
    }
    
    openWindowAndCloseModal() {
        console.log('WebflowModal: Opening window and closing modal');
        
        // Track summary usage
        this.setSessionData('summary_used', true);
        this.setSessionData(`summary_opened_${this.caseStudyId}`, true);
        
        // Close modal
        this.dismissModal();
        
        // Open window if available
        if (window.webflowWindow) {
            setTimeout(() => {
                window.webflowWindow.openWindow();
            }, 300);
        }
    }
    
    // Session storage helpers
    getSessionData(key, defaultValue) {
        try {
            const value = sessionStorage.getItem(key);
            return value !== null ? JSON.parse(value) : defaultValue;
        } catch (e) {
            console.warn('WebflowModal: Error reading session data:', e);
            return defaultValue;
        }
    }
    
    setSessionData(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('WebflowModal: Error writing session data:', e);
        }
    }
    
    // Public methods for external use
    forceShowModal() {
        console.log('WebflowModal: Force showing modal');
        this.showModal();
    }
    
    resetSession() {
        console.log('WebflowModal: Resetting session data');
        sessionStorage.removeItem('modal_dismissed_count');
        sessionStorage.removeItem('summary_used');
        sessionStorage.removeItem('last_modal_timestamp');
        
        // Remove all case study specific data
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('modal_shown_') || key.startsWith('summary_opened_')) {
                sessionStorage.removeItem(key);
            }
        });
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[summary-engine="modal"]')) {
        window.webflowModal = new WebflowModal();
    }
});
