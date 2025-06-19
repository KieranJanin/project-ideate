import { initializeEventListeners } from './ui/eventHandlers.js';
import { initializeAppUI } from './ui/renderers.js';
import { resetSimulation } from './core/simulation.js';

/**
 * Initializes the entire application.
 */
function initializeApp() {
    initializeAppUI();
    initializeEventListeners();
    resetSimulation(); // Perform initial reset
}

// Start the application once the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', initializeApp);
