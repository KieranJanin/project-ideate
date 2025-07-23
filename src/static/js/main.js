// src/js/main.js
import { initializeEventListeners } from './ui/eventHandlers.js';
import { initializeAppUI } from './ui/renderers.js';
import { resetSimulation } from './core/simulation.js';
// The fetchApiKey function is no longer needed on the frontend as the backend handles API keys securely.
// import { fetchApiKey } from './core/api.js'; 

/**
 * Initializes the entire application.
 */
async function initializeApp() {
    // No longer need to fetch API key directly on the frontend.
    // await fetchApiKey(); 
    initializeAppUI();
    initializeEventListeners();
    resetSimulation(); // Perform initial reset
}

// Start the application once the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', initializeApp);
