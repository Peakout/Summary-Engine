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
            
            // Reset animation flag
            setTimeout(() => {
                this.isAnimating = false;
            }, 300);
        });
    }
    
    closeWindow() {
        if (this.isAnimating || !this.isOpen) return;
        
        this.isAnimating = true;
        this.isOpen = false;
        
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
