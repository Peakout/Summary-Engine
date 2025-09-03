/**
 * Webflow Messages Flow Component
 * Handles the chatbot-style message flow using existing Webflow content
 * 
 * This component works with existing Webflow elements and controls the flow
 * Usage: Initialize with new WebflowMessagesFlow()
 */

class WebflowMessagesFlow {
    constructor() {
        // Find the tabs container
        this.tabsContainer = document.querySelector('[summary-engine="tabs"]');
        
        if (!this.tabsContainer) {
            console.warn('WebflowMessagesFlow: No tabs container found with [summary-engine="tabs"]');
            return;
        }
        
        // Configuration
        this.config = {
            typingDuration: 1500,           // Duration of typing animation (ms)
            messageAnimationDuration: 400,  // Duration of message slide-in animation (ms)
        };
        
        // State tracking
        this.animatingTabs = new Set(); // Track which tabs are currently animating
        this.completedTabs = new Set(); // Track which tabs have completed their flow
        this.lastCallTime = 0; // For debouncing
        this.windowIsOpen = false; // Track window state
        
        this.init();
    }
    
    init() {
        console.log('WebflowMessagesFlow initialized');
        this.initializeAllTabs();
    }
    
    // Initialize all tabs by hiding all messages
    initializeAllTabs() {
        const allTabPanes = this.tabsContainer.querySelectorAll('[summary-engine^="tab-"]');
        console.log('WebflowMessagesFlow: Found tab panes:', allTabPanes.length);
        
        allTabPanes.forEach(tabPane => {
            const tabNumber = tabPane.getAttribute('summary-engine').replace('tab-', '');
            const messages = tabPane.querySelectorAll(`[summary-engine^="tab-${tabNumber}-message-"]`);
            const tabType = tabPane.getAttribute('summary-tab');
            
            console.log(`WebflowMessagesFlow: Tab ${tabNumber} - Type: ${tabType}, Messages: ${messages.length}`);
            
            messages.forEach(message => {
                message.style.display = 'none';
                message.style.opacity = '0';
                message.style.transform = 'translateY(10px)';
                
                // Hide dots and text initially
                const dotsElement = message.querySelector('.summary-engine_message-dots');
                const textElement = message.querySelector('.summary-engine_company-message-text');
                if (dotsElement) dotsElement.style.display = 'none';
                if (textElement) textElement.style.display = 'none';
            });
        });
        
        console.log('WebflowMessagesFlow: All messages hidden initially');
    }
    
    // Main method to start messages flow for a tab
    startMessagesFlow(tabNumber) {
        const now = Date.now();
        console.log('WebflowMessagesFlow: startMessagesFlow called for tab:', tabNumber);
        
        // Don't start if window is not open
        if (!this.windowIsOpen) {
            console.log('WebflowMessagesFlow: Window not open, skipping');
            return;
        }
        
        // Debounce rapid calls (within 150ms)
        if (now - this.lastCallTime < 150) {
            console.log('WebflowMessagesFlow: Debouncing rapid calls');
            return;
        }
        this.lastCallTime = now;
        
        // If this tab is already completed, show all messages immediately
        if (this.completedTabs.has(tabNumber)) {
            console.log('WebflowMessagesFlow: Tab already completed, showing all messages');
            const tabPane = this.tabsContainer.querySelector(`[summary-engine="tab-${tabNumber}"]`);
            if (tabPane) {
                this.showAllMessages(tabPane);
            }
            return;
        }
        
        // If we're already animating this tab, don't interrupt
        if (this.animatingTabs.has(tabNumber)) {
            console.log('WebflowMessagesFlow: Already animating this tab, not interrupting');
            return;
        }
        
        // Each tab is independent - we can animate multiple tabs simultaneously
        // No need to wait for other tabs to complete
        
        // Only start animation if tab is actually visible
        if (!this.isTabVisible(tabNumber)) {
            console.log('WebflowMessagesFlow: Tab not visible, not starting animation');
            return;
        }
        
        const tabPane = this.tabsContainer.querySelector(`[summary-engine="tab-${tabNumber}"]`);
        if (!tabPane) {
            console.warn(`WebflowMessagesFlow: Tab ${tabNumber} not found`);
            return;
        }
        
        // Check if tab is dynamic or static
        const tabType = tabPane.getAttribute('summary-tab');
        console.log('WebflowMessagesFlow: Tab type:', tabType);
        console.log('WebflowMessagesFlow: Tab pane found:', !!tabPane);
        console.log('WebflowMessagesFlow: Tab number:', tabNumber);
        
        if (tabType === 'static') {
            // Static tab - show content immediately
            console.log('WebflowMessagesFlow: Static tab, showing content immediately');
            this.showStaticContent(tabPane);
            return;
        }
        
        // Check if this tab has already completed its flow
        if (this.completedTabs.has(tabNumber)) {
            console.log('WebflowMessagesFlow: Tab already completed, showing all messages');
            this.showAllMessages(tabPane);
            return;
        }
        
        // If switching to a different tab, just stop current animation
        // Each tab is independent - no need to stop other tabs
        
        // Dynamic tab - show messages with animation
        console.log('WebflowMessagesFlow: Dynamic tab, starting animation flow');
        this.animatingTabs.add(tabNumber);
        
        // Hide all messages initially
        this.hideAllMessages(tabPane);
        
        // Start the flow
        this.startFlow(tabPane, tabNumber);
    }
    
    // Show static content immediately
    showStaticContent(tabPane) {
        const tabNumber = tabPane.getAttribute('summary-engine').replace('tab-', '');
        const messages = tabPane.querySelectorAll(`[summary-engine^="tab-${tabNumber}-message-"]`);
        messages.forEach(message => {
            message.style.display = 'block';
            message.style.opacity = '1';
            message.style.transform = 'translateY(0)';
        });
    }
    
    // Show all messages immediately (for completed tabs)
    showAllMessages(tabPane) {
        const tabNumber = tabPane.getAttribute('summary-engine').replace('tab-', '');
        console.log('WebflowMessagesFlow: showAllMessages called for tab:', tabNumber);
        const messages = tabPane.querySelectorAll(`[summary-engine^="tab-${tabNumber}-message-"]`);
        console.log('WebflowMessagesFlow: Showing', messages.length, 'messages');
        
        messages.forEach((message, index) => {
            console.log(`WebflowMessagesFlow: Showing message ${index + 1}`);
            message.style.display = 'block';
            message.style.opacity = '1';
            message.style.transform = 'translateY(0)';
            
            // Hide dots and show text in each message
            const dotsElement = message.querySelector('.summary-engine_message-dots');
            const textElement = message.querySelector('.summary-engine_company-message-text');
            if (dotsElement) {
                dotsElement.style.display = 'none';
                console.log(`WebflowMessagesFlow: Hiding dots in message ${index + 1}`);
            }
            if (textElement) {
                textElement.style.display = 'block';
                console.log(`WebflowMessagesFlow: Showing text in message ${index + 1}`);
            }
        });
    }
    
    // Hide all messages in a tab
    hideAllMessages(tabPane) {
        const tabNumber = tabPane.getAttribute('summary-engine').replace('tab-', '');
        const messages = tabPane.querySelectorAll(`[summary-engine^="tab-${tabNumber}-message-"]`);
        console.log('WebflowMessagesFlow: Hiding messages:', messages.length);
        messages.forEach((message, index) => {
            console.log(`WebflowMessagesFlow: Hiding message ${index + 1}`);
            message.style.display = 'none';
            message.style.opacity = '0';
            message.style.transform = 'translateY(10px)';
        });
    }
    
    // Start the message flow
    startFlow(tabPane, tabNumber) {
        const messages = tabPane.querySelectorAll(`[summary-engine^="tab-${tabNumber}-message-"]`);
        console.log('WebflowMessagesFlow: Starting flow with messages:', messages.length);
        
        if (messages.length === 0) {
            console.log('WebflowMessagesFlow: No messages found, ending flow');
            this.animatingTabs.delete(tabNumber);
            return;
        }
        
        // Start with first message
        this.showMessageWithFlow(tabPane, messages, 0, tabNumber);
    }
    
    // Show message with dots animation flow
    showMessageWithFlow(tabPane, messages, messageIndex, tabNumber) {
        if (messageIndex >= messages.length) {
            // All messages shown, show questions if they exist
            this.showQuestions(tabPane);
            this.completedTabs.add(tabNumber);
            this.animatingTabs.delete(tabNumber);
            return;
        }
        
        const currentMessage = messages[messageIndex];
        
        // Show dots animation first
        this.showDotsAnimation(currentMessage, () => {
            // Then show the message
            this.showMessage(currentMessage, () => {
                // Move to next message
                this.showMessageWithFlow(tabPane, messages, messageIndex + 1, tabNumber);
            });
        });
    }
    
    // Show dots animation using existing Webflow dots
    showDotsAnimation(currentMessage, callback) {
        const dotsElement = currentMessage.querySelector('.summary-engine_message-dots');
        const textElement = currentMessage.querySelector('.summary-engine_company-message-text');
        
        if (dotsElement && textElement) {
            // Show the message container
            currentMessage.style.display = 'block';
            currentMessage.style.opacity = '0';
            currentMessage.style.transform = 'translateY(10px)';
            currentMessage.style.transition = 'all 0.4s ease-out';
            
            // Show dots, hide text
            dotsElement.style.display = 'flex';
            dotsElement.style.opacity = '1';
            textElement.style.display = 'none';
            
            // Animate message container in
            requestAnimationFrame(() => {
                currentMessage.style.opacity = '1';
                currentMessage.style.transform = 'translateY(0)';
            });
            
            // Hide dots after animation duration
            setTimeout(() => {
                dotsElement.style.display = 'none';
                if (callback) callback();
            }, this.config.typingDuration);
        } else {
            // No dots found, just wait
            setTimeout(() => {
                if (callback) callback();
            }, this.config.typingDuration);
        }
    }
    
    // Create temporary dots for animation
    createTemporaryDots(tabPane, callback) {
        const tempDots = document.createElement('div');
        tempDots.className = 'summary-engine_company-message';
        tempDots.innerHTML = `
            <div class="summary-engine_avatar">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 12 12" fill="none" class="summary-engine_avatar-icon">
                    <rect y="10.9352" width="15.465" height="1.5" transform="rotate(-45 0 10.9352)" fill="currentColor"></rect>
                    <rect y="0.000244141" width="10.935" height="1.5" fill="currentColor"></rect>
                    <path d="M10.5 12.0001V2.55762L12 4.05774V12.0001H10.5Z" fill="currentColor"></path>
                </svg>
            </div>
            <div class="summary-engine_company-message-wrapper">
                <div class="summary-engine_message-dots">
                    <div class="summary-engine_message-dot is-1"></div>
                    <div class="summary-engine_message-dot is-2"></div>
                    <div class="summary-engine_message-dot is-3"></div>
                </div>
            </div>
        `;
        
        tabPane.appendChild(tempDots);
        
        // Show dots animation
        requestAnimationFrame(() => {
            tempDots.style.animation = 'messageSlideIn 0.4s ease-out forwards';
        });
        
        // Remove after animation
        setTimeout(() => {
            tempDots.remove();
            if (callback) callback();
        }, this.config.typingDuration);
    }
    
    // Show a message with animation
    showMessage(messageElement, callback) {
        const dotsElement = messageElement.querySelector('.summary-engine_message-dots');
        const textElement = messageElement.querySelector('.summary-engine_company-message-text');
        
        if (dotsElement && textElement) {
            // Hide dots, show text
            dotsElement.style.display = 'none';
            textElement.style.display = 'block';
            textElement.style.opacity = '0';
            textElement.style.transform = 'translateY(10px)';
            textElement.style.transition = 'all 0.4s ease-out';
            
            // Animate text in
            requestAnimationFrame(() => {
                textElement.style.opacity = '1';
                textElement.style.transform = 'translateY(0)';
            });
        }
        
        if (callback) {
            setTimeout(callback, this.config.messageAnimationDuration);
        }
    }
    
    // Show questions (placeholder for now)
    showQuestions(tabPane) {
        const questionsElement = tabPane.querySelector(`[summary-engine="tab-${this.currentTab}-questions"]`);
        if (questionsElement) {
            questionsElement.style.display = 'block';
            questionsElement.style.opacity = '0';
            questionsElement.style.transform = 'translateY(10px)';
            questionsElement.style.transition = 'all 0.4s ease-out';
            
            requestAnimationFrame(() => {
                questionsElement.style.opacity = '1';
                questionsElement.style.transform = 'translateY(0)';
            });
        }
    }
    
    // Public method to start messages for a specific tab
    startTabMessages(tabNumber) {
        this.startMessagesFlow(tabNumber);
    }
    
    // Check if currently animating
    isCurrentlyAnimating() {
        return this.animatingTabs.size > 0;
    }
    
    // Get current animating tabs
    getAnimatingTabs() {
        return Array.from(this.animatingTabs);
    }
    
    // Reset completed tabs (call when window is closed)
    resetCompletedTabs() {
        this.completedTabs.clear();
        this.animatingTabs.clear();
        this.windowIsOpen = false;
        console.log('WebflowMessagesFlow: Reset completed tabs and window state');
    }
    
    // Set window open state
    setWindowOpen(isOpen) {
        this.windowIsOpen = isOpen;
        console.log('WebflowMessagesFlow: Window state set to:', isOpen);
    }
    
    // Check if a tab is currently visible
    isTabVisible(tabNumber) {
        const tabPane = this.tabsContainer.querySelector(`[summary-engine="tab-${tabNumber}"]`);
        if (!tabPane) return false;
        
        const style = window.getComputedStyle(tabPane);
        return style.display !== 'none' && style.opacity !== '0';
    }
    
    // Hide all messages immediately (no animation)
    hideAllMessagesImmediately() {
        console.log('WebflowMessagesFlow: Hiding all messages immediately');
        
        // Get tab panes directly from DOM
        const tabPanes = this.tabsContainer.querySelectorAll('[summary-engine^="tab-"]');
        
        // Hide all messages across all tabs
        tabPanes.forEach(tabPane => {
            const tabNumber = tabPane.getAttribute('summary-engine').replace('tab-', '');
            const messages = tabPane.querySelectorAll(`[summary-engine^="tab-${tabNumber}-message-"]`);
            
            messages.forEach(message => {
                const dots = message.querySelector('.summary-engine_message-dots');
                const text = message.querySelector('.summary-engine_company-message-text');
                
                if (dots) {
                    dots.style.display = 'flex';
                    dots.style.opacity = '1';
                }
                if (text) {
                    text.style.display = 'none';
                    text.style.opacity = '0';
                }
                message.style.display = 'none';
            });
        });
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[summary-engine="tabs"]')) {
        window.webflowMessagesFlow = new WebflowMessagesFlow();
    }
});

// Export for manual initialization
window.WebflowMessagesFlow = WebflowMessagesFlow;
