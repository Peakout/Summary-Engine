/**
 * Webflow Tabs Component
 * Custom tabs implementation in Webflow
 * 
 * This component handles tab switching for the summary-engine tabs structure
 * Usage: Initialize with new WebflowTabs()
 */

class WebflowTabs {
    constructor() {
        // Find the tabs container
        this.tabsContainer = document.querySelector('[summary-engine="tabs"]');
        
        if (!this.tabsContainer) {
            console.warn('WebflowTabs: No tabs container found with [summary-engine="tabs"]');
            return;
        }
        
        // Get tab links and panes
        this.tabLinks = this.tabsContainer.querySelectorAll('[summary-engine^="tab-link-"]');
        this.tabPanes = this.tabsContainer.querySelectorAll('[summary-engine^="tab-"][summary-engine$="-link"]:not([summary-engine^="tab-link-"])');
        
        // Also get panes by the pattern you showed
        this.tabPanes = this.tabsContainer.querySelectorAll('[summary-engine="tab-1"], [summary-engine="tab-2"], [summary-engine="tab-3"]');
        
        // State tracking
        this.activeTab = '1';
        this.isAnimating = false;
        this.totalTabs = this.tabLinks.length;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setInitialState();
    }
    
    bindEvents() {
        // Bind click events to tab links
        this.tabLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleTabClick(link);
            });
        });
        

    }
    
    setInitialState() {
        // Hide all tab panes except the first one
        this.tabPanes.forEach((pane, index) => {
            if (index === 0) {
                this.showTabPane(pane);
            } else {
                this.hideTabPane(pane);
            }
        });
        
        // Set first tab link as active
        if (this.tabLinks.length > 0) {
            this.setActiveTabLink(this.tabLinks[0]);
        }
    }
    
    handleTabClick(clickedLink) {
        if (this.isAnimating) return;
        
        // Get tab number from the link's summary-engine attribute
        const tabAttribute = clickedLink.getAttribute('summary-engine');
        const tabNumber = tabAttribute.replace('tab-link-', '');
        
        this.switchToTab(tabNumber);
    }
    
    switchToTab(tabNumber) {
        this.isAnimating = true;
        
        // Find the target tab pane
        const targetPane = this.tabsContainer.querySelector(`[summary-engine="tab-${tabNumber}"]`);
        const targetLink = this.tabsContainer.querySelector(`[summary-engine="tab-link-${tabNumber}"]`);
        
        if (!targetPane) {
            this.isAnimating = false;
            return;
        }
        
        // Hide all panes
        this.tabPanes.forEach(pane => {
            this.hideTabPane(pane);
        });
        
        // Remove active state from all links
        this.tabLinks.forEach(link => {
            this.removeActiveTabLink(link);
        });
        
        // Show target pane and set active link
        this.showTabPane(targetPane);
        if (targetLink) {
            this.setActiveTabLink(targetLink);
        }
        
        this.activeTab = tabNumber;
        
        // Reset animation flag after a short delay
        setTimeout(() => {
            this.isAnimating = false;
        }, 300);
    }
    
    showTabPane(pane) {
        // Remove hide class and add show class
        pane.classList.remove('hide');
        pane.style.display = 'block';
        pane.style.opacity = '0';
        pane.style.transform = 'translateY(10px)';
        pane.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
        
        // Trigger animation
        requestAnimationFrame(() => {
            pane.style.opacity = '1';
            pane.style.transform = 'translateY(0)';
        });
    }
    
    hideTabPane(pane) {
        // Add hide class and hide the pane
        pane.classList.add('hide');
        pane.style.display = 'none';
        pane.style.opacity = '';
        pane.style.transform = '';
        pane.style.transition = '';
    }
    
    setActiveTabLink(link) {
        // Add active class
        link.classList.add('is-active');
        
        // Animate background to this tab's position
        this.animateBackgroundToTab(link);
    }
    
    removeActiveTabLink(link) {
        // Remove active class
        link.classList.remove('is-active');
    }
    
    animateBackgroundToTab(activeLink) {
        // Get the tab number from the link
        const tabAttribute = activeLink.getAttribute('summary-engine');
        const tabNumber = parseInt(tabAttribute.replace('tab-link-', ''));
        
        // Find the background element
        const background = this.tabsContainer.querySelector('.summary-engine_tab-background');
        if (!background) return;
        
        // Calculate the X position dynamically
        const translateX = `${(tabNumber - 1) * 100}%`;
        
        // Apply the animation
        background.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        background.style.transform = `translateX(${translateX})`;
    }
    
    // Public method to programmatically switch tabs
    switchTab(tabNumber) {
        this.switchToTab(tabNumber);
    }
    
    // Public method to get current active tab
    getActiveTab() {
        return this.activeTab;
    }
    
    // Public method to get all available tabs
    getAvailableTabs() {
        return Array.from(this.tabPanes).map(pane => {
            const attr = pane.getAttribute('summary-engine');
            return attr.replace('tab-', '');
        });
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[summary-engine="tabs"]')) {
        window.webflowTabs = new WebflowTabs();
    }
});

// Export for manual initialization
window.WebflowTabs = WebflowTabs;
