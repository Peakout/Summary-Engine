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
        this.isAnimating = false;
        this.currentTab = null;
        this.completedTabs = new Set(); // Track which tabs have completed their flow
        
        this.init();
    }
    
    init() {
        console.log('WebflowMessagesFlow initialized');
    }
    
    // Main method to start messages flow for a tab
    startMessagesFlow(tabNumber) {
        console.log('WebflowMessagesFlow: startMessagesFlow called for tab:', tabNumber);
        
        if (this.isAnimating) {
            console.log('WebflowMessagesFlow: Already animating, skipping');
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
        
        // Dynamic tab - show messages with animation
        console.log('WebflowMessagesFlow: Dynamic tab, starting animation flow');
        this.currentTab = tabNumber;
        this.isAnimating = true;
        
        // Hide all messages initially
        this.hideAllMessages(tabPane);
        
        // Start the flow
        this.startFlow(tabPane);
    }
    
    // Show static content immediately
    showStaticContent(tabPane) {
        const messages = tabPane.querySelectorAll(`[summary-engine^="tab-${this.currentTab}-message-"]`);
        messages.forEach(message => {
            message.style.display = 'block';
            message.style.opacity = '1';
            message.style.transform = 'translateY(0)';
        });
    }
    
    // Show all messages immediately (for completed tabs)
    showAllMessages(tabPane) {
        const messages = tabPane.querySelectorAll(`[summary-engine^="tab-${this.currentTab}-message-"]`);
        messages.forEach(message => {
            // Remove all flow classes and add visible
            message.classList.remove('flow-hidden', 'flow-animating');
            message.classList.add('flow-visible');
            
            // Hide dots and show text in each message
            const dotsElement = message.querySelector('.summary-engine_message-dots');
            const textElement = message.querySelector('.summary-engine_company-message-text');
            if (dotsElement) {
                dotsElement.classList.remove('flow-visible');
                dotsElement.classList.add('flow-hidden');
            }
            if (textElement) {
                textElement.classList.remove('flow-hidden', 'flow-animating');
                textElement.classList.add('flow-visible');
            }
        });
    }
    
    // Hide all messages in a tab
    hideAllMessages(tabPane) {
        const messages = tabPane.querySelectorAll(`[summary-engine^="tab-${this.currentTab}-message-"]`);
        console.log('WebflowMessagesFlow: Hiding messages:', messages.length);
        messages.forEach(message => {
            // Remove all flow classes and add hidden
            message.classList.remove('flow-visible', 'flow-animating');
            message.classList.add('flow-hidden');
        });
    }
    
    // Start the message flow
    startFlow(tabPane) {
        const messages = tabPane.querySelectorAll(`[summary-engine^="tab-${this.currentTab}-message-"]`);
        console.log('WebflowMessagesFlow: Starting flow with messages:', messages.length);
        
        if (messages.length === 0) {
            console.log('WebflowMessagesFlow: No messages found, ending flow');
            this.isAnimating = false;
            return;
        }
        
        // Start with first message
        this.showMessageWithFlow(tabPane, messages, 0);
    }
    
    // Show message with dots animation flow
    showMessageWithFlow(tabPane, messages, messageIndex) {
        if (messageIndex >= messages.length) {
            // All messages shown, show questions if they exist
            this.showQuestions(tabPane);
            this.completedTabs.add(this.currentTab);
            this.isAnimating = false;
            return;
        }
        
        const currentMessage = messages[messageIndex];
        
        // Show dots animation first
        this.showDotsAnimation(currentMessage, () => {
            // Then show the message
            this.showMessage(currentMessage, () => {
                // Move to next message
                this.showMessageWithFlow(tabPane, messages, messageIndex + 1);
            });
        });
    }
    
    // Show dots animation using existing Webflow dots
    showDotsAnimation(currentMessage, callback) {
        const dotsElement = currentMessage.querySelector('.summary-engine_message-dots');
        const textElement = currentMessage.querySelector('.summary-engine_company-message-text');
        
        if (dotsElement && textElement) {
            // Show the message container with animation
            currentMessage.classList.remove('flow-hidden');
            currentMessage.classList.add('flow-animating');
            
            // Show dots, hide text
            dotsElement.classList.remove('flow-hidden');
            dotsElement.classList.add('flow-visible');
            textElement.classList.remove('flow-visible');
            textElement.classList.add('flow-hidden');
            
            // Animate message container in
            requestAnimationFrame(() => {
                currentMessage.classList.remove('flow-animating');
                currentMessage.classList.add('flow-visible');
            });
            
            // Hide dots after animation duration
            setTimeout(() => {
                dotsElement.classList.remove('flow-visible');
                dotsElement.classList.add('flow-hidden');
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
            // Hide dots, show text with animation
            dotsElement.classList.remove('flow-visible');
            dotsElement.classList.add('flow-hidden');
            
            textElement.classList.remove('flow-hidden');
            textElement.classList.add('flow-animating');
            
            // Animate text in
            requestAnimationFrame(() => {
                textElement.classList.remove('flow-animating');
                textElement.classList.add('flow-visible');
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
        return this.isAnimating;
    }
    
    // Get current tab
    getCurrentTab() {
        return this.currentTab;
    }
    
    // Reset completed tabs (call when window is closed)
    resetCompletedTabs() {
        this.completedTabs.clear();
        console.log('WebflowMessagesFlow: Reset completed tabs');
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
