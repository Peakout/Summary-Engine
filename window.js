/**
 * Webflow Window Component
 * Handles opening and closing the summary engine window
 * 
 * This component manages the window state and animations
 * Usage: Initialize with new WebflowWindow()
 */

class WebflowWindow {
    constructor() {
        // Find the main component container
        this.component = document.querySelector('[summary-engine="component"]');
        
        if (!this.component) {
            console.warn('WebflowWindow: No component found with [summary-engine="component"]');
            return;
        }
        
        // Get window and button elements
        this.window = this.component.querySelector('[summary-engine="window"]');
        this.mainButton = this.component.querySelector('[summary-engine="main-button"]');
        this.closeButton = this.component.querySelector('[summary-engine="close"]');
        
        if (!this.window || !this.mainButton) {
            console.warn('WebflowWindow: Missing required elements (window or main-button)');
            return;
        }
        
        // State tracking
        this.isOpen = false;
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setInitialState();
    }
    
    bindEvents() {
        // Main button click - toggle window
        this.mainButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleWindow();
        });
        
        // Close button click
        if (this.closeButton) {
            this.closeButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeWindow();
            });
        }
        
        // Close when clicking outside the window
        document.addEventListener('click', (e) => {
            if (this.isOpen && 
                !this.window.contains(e.target) && 
                !this.mainButton.contains(e.target)) {
                this.closeWindow();
            }
        });
        
        // Close with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeWindow();
            }
        });
    }
    
    setInitialState() {
        // Ensure window starts closed
        this.window.style.display = 'none';
        this.window.style.opacity = '0';
        this.window.style.transform = 'translateY(20px) scale(0.95)';
        this.window.style.transition = 'none';
        
        // Set initial button state - use class instead of inline style
        this.mainButton.classList.remove('is-open');
        this.mainButton.style.transition = 'transform 0.3s ease';
    }
    
    openWindow() {
        if (this.isAnimating || this.isOpen) return;
        
        this.isAnimating = true;
        this.isOpen = true;
        
        // Close modal if it's open
        if (window.webflowModal && window.webflowModal.isModalVisible()) {
            console.log('WebflowWindow: Closing modal before opening window');
            window.webflowModal.dismissModal();
        }
        
        // Show the window
        this.window.style.display = 'block';
        
        // Animate button rotation using class
        this.mainButton.classList.add('is-open');
        
        // Set transition and trigger window animation
        this.window.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        // Trigger animation on next frame
        requestAnimationFrame(() => {
            this.window.style.opacity = '1';
            this.window.style.transform = 'translateY(0) scale(1)';
            
            // Reset animation flag and start initial messages flow
            setTimeout(() => {
                this.isAnimating = false;
                
                // Set window as open in messages flow
                if (window.webflowMessagesFlow) {
                    window.webflowMessagesFlow.setWindowOpen(true);
                    console.log('WebflowWindow: Starting messages flow for tab 1');
                    window.webflowMessagesFlow.startTabMessages('1');
                } else {
                    console.log('WebflowWindow: Messages flow not available');
                }
            }, 300);
        });
    }
    
    closeWindow() {
        if (this.isAnimating || !this.isOpen) return;
        
        this.isAnimating = true;
        this.isOpen = false;
        
        // Set window as closed in messages flow and stop all animations
        if (window.webflowMessagesFlow) {
            window.webflowMessagesFlow.setWindowOpen(false);
            window.webflowMessagesFlow.stopAllAnimations();
        }
        
        // Animate button rotation back using class
        this.mainButton.classList.remove('is-open');
        
        // Animate window out
        this.window.style.transition = 'all 0.2s ease-out';
        this.window.style.opacity = '0';
        this.window.style.transform = 'translateY(20px) scale(0.95)';
        
        // Hide window after animation but keep transition for next open
        setTimeout(() => {
            this.window.style.display = 'none';
            // Don't reset transition - keep it for smooth next open
            this.window.style.opacity = '0';
            this.window.style.transform = 'translateY(20px) scale(0.95)';
            this.isAnimating = false;
            
            // Don't reset messages flow - keep completed state for session
        }, 200);
    }
    
    // Toggle window open/close
    toggleWindow() {
        if (this.isOpen) {
            this.closeWindow();
        } else {
            this.openWindow();
        }
    }
    
    // Public methods for external control
    open() {
        this.openWindow();
    }
    
    close() {
        this.closeWindow();
    }
    
    toggle() {
        this.toggleWindow();
    }
    
    isWindowOpen() {
        return this.isOpen;
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[summary-engine="component"]')) {
        window.webflowWindow = new WebflowWindow();
    }
});

// Export for manual initialization
window.WebflowWindow = WebflowWindow;
