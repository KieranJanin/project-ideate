// src/project-ideate/templates/src/js/main.js
import { initializeEventListeners } from './ui/eventHandlers.js';
import { initializeAppUI } from './ui/renderers.js';
import { resetSimulation } from './core/simulation.js';
import { fetchApiKey } from './core/api.js'; // Import the new function

/**
 * Initializes the entire application.
 */
async function initializeApp() { // Made initializeApp async
    await fetchApiKey(); // *** Fetch the key FIRST and wait for it ***
    initializeAppUI();
    initializeEventListeners();
    resetSimulation(); // Perform initial reset
}

// Start the application once the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', initializeApp);
