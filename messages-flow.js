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
        
        this.init();
    }
    
    init() {
        console.log('WebflowMessagesFlow initialized');
    }
    
    // Main method to start messages flow for a tab
    startMessagesFlow(tabNumber) {
        if (this.isAnimating) return;
        
        const tabPane = this.tabsContainer.querySelector(`[summary-engine="tab-${tabNumber}"]`);
        if (!tabPane) {
            console.warn(`WebflowMessagesFlow: Tab ${tabNumber} not found`);
            return;
        }
        
        // Check if tab is dynamic or static
        const tabType = tabPane.getAttribute('summary-tab');
        
        if (tabType === 'static') {
            // Static tab - show content immediately
            this.showStaticContent(tabPane);
            return;
        }
        
        // Dynamic tab - show messages with animation
        this.currentTab = tabNumber;
        this.isAnimating = true;
        
        // Hide all messages initially
        this.hideAllMessages(tabPane);
        
        // Start the flow
        this.startFlow(tabPane);
    }
    
    // Show static content immediately
    showStaticContent(tabPane) {
        const messages = tabPane.querySelectorAll('[summary-engine^="tab-1-message-"]');
        messages.forEach(message => {
            message.style.display = 'block';
            message.style.opacity = '1';
            message.style.transform = 'translateY(0)';
        });
    }
    
    // Hide all messages in a tab
    hideAllMessages(tabPane) {
        const messages = tabPane.querySelectorAll('[summary-engine^="tab-1-message-"]');
        messages.forEach(message => {
            message.style.display = 'none';
            message.style.opacity = '0';
            message.style.transform = 'translateY(10px)';
        });
    }
    
    // Start the message flow
    startFlow(tabPane) {
        const messages = tabPane.querySelectorAll(`[summary-engine^="tab-${this.currentTab}-message-"]`);
        
        if (messages.length === 0) {
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
            this.isAnimating = false;
            return;
        }
        
        const currentMessage = messages[messageIndex];
        
        // Show dots animation first
        this.showDotsAnimation(tabPane, () => {
            // Then show the message
            this.showMessage(currentMessage, () => {
                // Move to next message
                this.showMessageWithFlow(tabPane, messages, messageIndex + 1);
            });
        });
    }
    
    // Show dots animation using existing Webflow dots
    showDotsAnimation(tabPane, callback) {
        // Find the dots element in the current message
        const currentMessage = tabPane.querySelector(`[summary-engine^="tab-${this.currentTab}-message-"]:not([style*="display: none"])`);
        if (!currentMessage) {
            // If no current message, create a temporary dots element
            this.createTemporaryDots(tabPane, callback);
            return;
        }
        
        const dotsElement = currentMessage.querySelector('.summary-engine_message-dots');
        if (dotsElement) {
            // Show dots animation
            dotsElement.style.display = 'flex';
            dotsElement.style.opacity = '1';
            
            // Hide after animation duration
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
        // Hide dots in this message
        const dotsElement = messageElement.querySelector('.summary-engine_message-dots');
        if (dotsElement) {
            dotsElement.style.display = 'none';
        }
        
        // Show the message
        messageElement.style.display = 'block';
        messageElement.style.transition = 'all 0.4s ease-out';
        
        requestAnimationFrame(() => {
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        });
        
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
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[summary-engine="tabs"]')) {
        window.webflowMessagesFlow = new WebflowMessagesFlow();
    }
});

// Export for manual initialization
window.WebflowMessagesFlow = WebflowMessagesFlow;
