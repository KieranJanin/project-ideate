// src/js/state/appState.js

/**
 * This object holds the dynamic state of the simulation.
 * It's the "memory" of the application, storing all generated artifacts.
 */
let collectedData = {};

/**
 * Resets the application state to its initial, empty values.
 * This is called at the beginning of every simulation.
 */
export function resetCollectedData() {
    collectedData = { 
        persona: null, 
        quotes: [], 
        hmw: [], 
        pov: null, 
        metrics: [], 
        scope: null, 
        problemStatement: "", 
        refinedHmw: [], 
        ideas: [], 
        evaluatedIdeas: [], 
        winningConcept: null 
    };
}

/**
 * Returns the current state object.
 * @returns {object} The complete collectedData object.
 */
export function getCollectedData() {
    return collectedData;
}

/**
 * Updates a specific key in the state object.
 * @param {string} key - The key to update in the state.
 * @param {*} value - The new value for the key.
 */
export function updateCollectedData(key, value) {
    if (collectedData.hasOwnProperty(key)) {
        collectedData[key] = value;
    } else {
        console.warn(`Attempted to update non-existent state key: ${key}`);
    }
}
