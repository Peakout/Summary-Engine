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
            firstModalDelay: 5000,     // 5 seconds for first case study
            subsequentModalDelay: 10000, // 10 seconds for subsequent case studies
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
        
        // Main button click is handled by window.js
        // No need to duplicate the listener here
        
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
        console.log('🔍 [MODAL] Checking if modal should be displayed');
        console.log('🔍 [MODAL] Case study ID:', this.caseStudyId);
        
        if (!this.shouldShowModal()) {
            console.log('❌ [MODAL] Modal should not be shown');
            return;
        }
        
        const delay = this.getModalDelay();
        const dismissedCount = this.getSessionData('modal_dismissed_count', 0);
        console.log('✅ [MODAL] Modal will be shown after', delay, 'ms');
        console.log('🔍 [MODAL] Dismissed count:', dismissedCount, '- This is modal #', dismissedCount + 1);
        
        setTimeout(() => {
            // Check again before showing (user might have used summary in the meantime)
            if (this.shouldShowModal()) {
                this.showModal();
            } else {
                console.log('❌ [MODAL] Modal conditions changed, not showing');
            }
        }, delay);
    }
    
    shouldShowModal() {
        // Check all conditions
        const summaryUsed = this.getSessionData('summary_used', false);
        const dismissedCount = this.getSessionData('modal_dismissed_count', 0);
        const userActionTaken = this.getSessionData(`user_action_${this.caseStudyId}`, false);
        
        console.log('🔍 [MODAL] Checking conditions:', {
            summaryUsed,
            dismissedCount,
            userActionTaken
        });
        
        // User hasn't used summary feature
        if (summaryUsed) {
            console.log('❌ [MODAL] User already used summary feature');
            return false;
        }
        
        // User hasn't dismissed modal too many times
        if (dismissedCount >= this.config.maxDismissals) {
            console.log('❌ [MODAL] User dismissed modal too many times (', dismissedCount, '/', this.config.maxDismissals, ')');
            return false;
        }
        
        // User hasn't taken any action on this case study yet
        if (userActionTaken) {
            console.log('❌ [MODAL] User already took action on this case study');
            return false;
        }
        
        console.log('✅ [MODAL] All conditions met - modal will be shown');
        return true;
    }
    
    getModalDelay() {
        const dismissedCount = this.getSessionData('modal_dismissed_count', 0);
        return dismissedCount === 0 ? this.config.firstModalDelay : this.config.subsequentModalDelay;
    }
    
    showModal() {
        console.log('🚀 [MODAL] Showing modal');
        
        // Track modal display
        // Don't mark action as taken yet - wait for user interaction
        this.setSessionData('last_modal_timestamp', Date.now());
        
        // Show modal with smooth animation
        this.modal.style.display = 'flex';
        this.modal.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        this.modal.style.opacity = '0';
        this.modal.style.transform = 'scale(0.95)';
        
        // Force reflow to ensure transition is applied
        this.modal.offsetHeight;
        
        // Animate in
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
        
        // Mark user action as taken (negative action)
        this.setSessionData(`user_action_${this.caseStudyId}`, true);
        
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
        
        // Mark user action as taken (positive action)
        this.setSessionData(`user_action_${this.caseStudyId}`, true);
        
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
    
    // Check if modal should be shown (for external calls)
    shouldShowModalNow() {
        return this.shouldShowModal();
    }
    
    resetSession() {
        console.log('WebflowModal: Resetting session data');
        sessionStorage.removeItem('modal_dismissed_count');
        sessionStorage.removeItem('summary_used');
        sessionStorage.removeItem('last_modal_timestamp');
        
        // Remove all case study specific data
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('user_action_') || key.startsWith('summary_opened_')) {
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
