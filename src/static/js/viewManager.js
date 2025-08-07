// src/js/ui/viewManager.js

/**
 * Manages switching between different views in the main content area.
 * @param {string} viewId - The ID of the view element to make active.
 */
export function switchView(viewId) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.add('hidden');
    });
    
    // Deactivate all navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Activate the target view and its corresponding nav link
    const activeView = document.getElementById(viewId);
    const activeLink = document.querySelector(`.nav-link[data-view="${viewId}"]`);
    
    if (activeView) {
        activeView.classList.remove('hidden');
    }
    if (activeLink) {
        activeLink.classList.add('active');
    }
}
