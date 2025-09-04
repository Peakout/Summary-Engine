/**
 * Webflow Messages Flow Component
 * Handles the chatbot-style message flow using existing Webflow content
 */

class WebflowMessagesFlow {
    constructor() {
        this.tabsContainer = document.querySelector('[summary-engine="tabs"]');
        if (!this.tabsContainer) {
            console.warn('WebflowMessagesFlow: No tabs container found');
            return;
        }
        
        this.config = {
            typingDuration: 1500,
            messageAnimationDuration: 400,
        };
        
        this.animatingTabs = new Set();
        this.completedTabs = new Set();
        this.lastCallTime = 0;
        this.windowIsOpen = false;

        
        this.init();
    }
    
    init() {
        console.log('WebflowMessagesFlow initialized');
        this.initializeAllTabs();
    }
    
    // Hide all messages initially
    initializeAllTabs() {
        const allTabPanes = this.tabsContainer.querySelectorAll('[summary-engine^="tab-"]');
        allTabPanes.forEach(tabPane => {
            const tabNumber = tabPane.getAttribute('summary-engine').replace('tab-', '');
            const messages = tabPane.querySelectorAll(`[summary-engine^="tab-${tabNumber}-message-"]`);
            
            messages.forEach(message => {
                const dots = message.querySelector('[summary-engine="dots"]');
                const text = message.querySelector('[summary-engine="message-content"]');
                
                if (dots) dots.style.display = 'flex';
                if (text) text.style.display = 'none';
                message.style.display = 'none';
            });
        });
        console.log('WebflowMessagesFlow: All messages hidden initially');
    }
    
    // Main method to start messages flow for a tab
    startMessagesFlow(tabNumber) {
        const now = Date.now();
        console.log('WebflowMessagesFlow: startMessagesFlow called for tab:', tabNumber);
        
        if (!this.windowIsOpen) {
            console.log('WebflowMessagesFlow: Window not open, skipping');
            return;
        }
        
        if (now - this.lastCallTime < 150) {
            console.log('WebflowMessagesFlow: Debouncing rapid calls');
            return;
        }
        this.lastCallTime = now;
        
        // If already completed, show all messages
        if (this.completedTabs.has(tabNumber)) {
            console.log('WebflowMessagesFlow: Tab already completed, showing all messages');
            const tabPane = this.tabsContainer.querySelector(`[summary-engine="tab-${tabNumber}"]`);
            if (tabPane) this.showAllMessages(tabPane);
            return;
        }
        
        // If already animating, don't interrupt
        if (this.animatingTabs.has(tabNumber)) {
            console.log('WebflowMessagesFlow: Already animating this tab, not interrupting');
            return;
        }
        
        const tabPane = this.tabsContainer.querySelector(`[summary-engine="tab-${tabNumber}"]`);
        if (!tabPane) {
            console.warn(`WebflowMessagesFlow: Tab ${tabNumber} not found`);
            return;
        }
        
        const tabType = tabPane.getAttribute('summary-tab');
        console.log('WebflowMessagesFlow: Tab type:', tabType);
        
        if (tabType === 'static') {
            this.showStaticContent(tabPane);
        } else if (tabType === 'dynamic') {
            console.log('WebflowMessagesFlow: Dynamic tab, starting animation flow');
            this.animatingTabs.add(tabNumber);
            this.hideAllMessages(tabPane);
            this.startFlow(tabPane, tabNumber);
        }
    }
    
    // Show static content immediately
    showStaticContent(tabPane) {
        const tabNumber = tabPane.getAttribute('summary-engine').replace('tab-', '');
        const messages = tabPane.querySelectorAll(`[summary-engine^="tab-${tabNumber}-message-"]`);
        
        messages.forEach(message => {
            const dots = message.querySelector('[summary-engine="dots"]');
            const text = message.querySelector('[summary-engine="message-content"]');
            
            if (dots) dots.style.display = 'none';
            if (text) text.style.display = 'block';
            message.style.display = 'block';
        });
    }
    
    // Show all messages immediately (for completed tabs)
    showAllMessages(tabPane) {
        const tabNumber = tabPane.getAttribute('summary-engine').replace('tab-', '');
        const messages = tabPane.querySelectorAll(`[summary-engine^="tab-${tabNumber}-message-"]`);
        
        console.log('WebflowMessagesFlow: showAllMessages called for tab:', tabNumber);
        console.log('WebflowMessagesFlow: Showing', messages.length, 'messages');
        
        messages.forEach((message, index) => {
            console.log('WebflowMessagesFlow: Showing message', index + 1);
            const dots = message.querySelector('[summary-engine="dots"]');
            const text = message.querySelector('[summary-engine="message-content"]');
            
            if (dots) dots.style.display = 'none';
            if (text) text.style.display = 'block';
            message.style.display = 'block';
        });
    }
    
    // Hide all messages in a tab
    hideAllMessages(tabPane) {
        const tabNumber = tabPane.getAttribute('summary-engine').replace('tab-', '');
        const messages = tabPane.querySelectorAll(`[summary-engine^="tab-${tabNumber}-message-"]`);
        
        console.log('WebflowMessagesFlow: Hiding messages:', messages.length);
        messages.forEach((message, index) => {
            console.log('WebflowMessagesFlow: Hiding message', index + 1);
            const dots = message.querySelector('[summary-engine="dots"]');
            const text = message.querySelector('[summary-engine="message-content"]');
            
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
        
        this.showMessageWithFlow(tabPane, messages, 0, tabNumber);
    }
    
    // Show message with dots animation flow
    showMessageWithFlow(tabPane, messages, messageIndex, tabNumber) {
        if (messageIndex >= messages.length) {
            // All messages shown, mark as completed
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
    
    // Show dots animation
    showDotsAnimation(currentMessage, callback) {
        const dotsElement = currentMessage.querySelector('[summary-engine="dots"]');
        const textElement = currentMessage.querySelector('[summary-engine="message-content"]');
        
        if (dotsElement && textElement) {
            // Show message container
            currentMessage.style.display = 'block';
            
            // Show dots, hide text
            dotsElement.style.display = 'flex';
            dotsElement.style.opacity = '1';
            textElement.style.display = 'none';
            textElement.style.opacity = '0';
            
            // Start dots animation
            const dots = dotsElement.querySelectorAll('[summary-engine^="dot-"]');
            dots.forEach((dot, index) => {
                dot.style.animation = `typing 1.5s infinite ${index * 0.2}s`;
            });
            
            // Hide dots after animation duration
            setTimeout(() => {
                dots.forEach(dot => {
                    dot.style.animation = 'none';
                });
                if (callback) callback();
            }, this.config.typingDuration);
        }
    }
    
    // Show a message with animation
    showMessage(messageElement, callback) {
        const dotsElement = messageElement.querySelector('[summary-engine="dots"]');
        const textElement = messageElement.querySelector('[summary-engine="message-content"]');
        
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
    

    
    // Public methods
    startTabMessages(tabNumber) {
        this.startMessagesFlow(tabNumber);
    }
    
    setWindowOpen(isOpen) {
        this.windowIsOpen = isOpen;
        console.log('WebflowMessagesFlow: Window state set to:', isOpen);
    }
    
    resetCompletedTabs() {
        this.completedTabs.clear();
        this.animatingTabs.clear();
        this.windowIsOpen = false;
        console.log('WebflowMessagesFlow: Reset completed tabs and window state');
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[summary-engine="tabs"]')) {
        window.webflowMessagesFlow = new WebflowMessagesFlow();
    }
});
