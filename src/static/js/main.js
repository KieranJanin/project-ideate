// src/js/main.js
import { initializeCommonEventListeners } from './ui/common_event_handlers.js';
import { renderAgents } from './ui/renderers.js'; // Changed from initializeAppUI
import { resetSimulation } from './core/simulation_logic.js';
import { initializeDomElements } from './ui/domElements.js';

/**
 * Initializes the entire application.
 */
async function initializeApp() {
    initializeDomElements(); // Initialize DOM elements first
    renderAgents(); // Call renderAgents to initialize UI related to agents
    initializeCommonEventListeners();
    resetSimulation(); // Perform initial reset
}

// Start the application once the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', initializeApp);
