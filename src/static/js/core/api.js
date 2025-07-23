// src/js/core/api.js
import { dom } from '../ui/domElements.js';

/**
 * Fetches the API key from the backend. This function is no longer needed on the frontend
 * as the backend will handle all direct calls to the Gemini API securely.
 * This function is kept as a placeholder if you decide to have a separate frontend API key check.
 */
export async function fetchApiKey() {
    console.log("Frontend fetchApiKey is deprecated. Backend handles API key securely.");
    // In a production app, you might still fetch a non-sensitive 'client_id'
    // or a session token from the backend for authentication.
}

/**
 * Makes a network request to your Flask backend's Gemini proxy endpoint.
 * The Flask backend will then securely call the actual Gemini API.
 * @param {string} prompt - The prompt to send to the language model.
 * @param {boolean} isJson - Whether to request a JSON response from the backend (for Gemini).
 * @returns {Promise<object|string|null>} The parsed JSON object, text response, or null on failure.
 */
export async function callGemini(prompt, isJson = false) {
    isCallingAPI(true); // Show loading spinner
    console.log("LOG: Sending prompt to backend for Gemini call:", prompt);

    // --- IMPORTANT CHANGE: Call YOUR Flask backend, not Google's API directly ---
    const backendApiUrl = 'http://localhost:5000/api/gemini-proxy'; // Your new Flask endpoint

    const payload = { 
        prompt: prompt,
        is_json: isJson // Pass this to backend to tell Gemini how to respond
    };

    try {
        const response = await fetch(backendApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorDetail = await response.json().catch(() => ({ error: 'No error details provided' }));
            console.error("Backend proxy error response:", errorDetail);
            throw new Error(`Backend proxy error: ${response.status} ${response.statusText} - ${errorDetail.error || 'Unknown error'}`);
        }

        const result = await response.json();
        
        // The backend should return the raw text or parsed JSON directly
        if (isJson) {
            // Backend should return already parsed JSON, so no need for regex match here.
            return result;
        }
        return result.text; // Assuming backend returns { text: "..." } for non-JSON

    } catch (error) {
        console.error("Backend proxy call failed:", error);
        return isJson ? null : `Error during API call: ${error.message}`;
    } finally {
        isCallingAPI(false);
    }
}

/**
 * Toggles the visibility of the global loading spinner.
 * Assumes `dom` is imported and contains a `loadingSpinner` element.
 * @param {boolean} isLoading - Whether the API call is in progress.
 */
export function isCallingAPI(isLoading) {
    if (dom && dom.loadingSpinner) {
        if (isLoading) {
            dom.loadingSpinner.classList.remove('hidden');
        } else {
            dom.loadingSpinner.classList.add('hidden');
        }
    } else {
        console.warn("DOM element 'loadingSpinner' not found for isCallingAPI.");
    }
}
