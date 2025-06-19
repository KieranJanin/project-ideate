// src/project-ideate/templates/src/js/core/api.js
import { dom } from '../ui/domElements.js'; // Assuming dom is imported and contains loadingSpinner

// Variable to store the fetched API key
let geminiApiKey = null;
let isFetchingApiKey = false; // State to prevent multiple simultaneous fetches

/**
 * Fetches the API key from the backend.
 * This should be called once during application initialization.
 */
export async function fetchApiKey() {
    if (geminiApiKey || isFetchingApiKey) {
        console.log("LOG: API key already loaded or is being fetched.");
        if (isFetchingApiKey) {
             // Simple waiting mechanism (consider improving with a promise)
             await new Promise(resolve => {
                 const checkInterval = setInterval(() => {
                     if (geminiApiKey || !isFetchingApiKey) { // Also stop if fetching failed/stopped
                         clearInterval(checkInterval);
                         resolve();
                     }
                 }, 100); // Check every 100ms
             });
        }
        return; // Exit if already fetched or fetching
    }

    isFetchingApiKey = true;
    console.log("LOG: Attempting to fetch API key from backend...");
    try {
        // *** IMPORTANT CHANGE FOR DEVELOPMENT ***
        // Explicitly use the full URL for the backend server (Flask)
        // If your Flask app runs on a different port, change 5000 accordingly.
        const response = await fetch('http://localhost:5000/api/key');

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'No error details provided' }));
            throw new Error(`Failed to fetch API key: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
        }

        const data = await response.json();
        if (!data.apiKey) {
             throw new Error("API response did not contain 'apiKey'.");
        }
        geminiApiKey = data.apiKey;
        console.log("LOG: API key fetched successfully.");
    } catch (error) {
        console.error("Error fetching API key:", error);
        // Display a prominent error message to the user
        alert("Failed to load application: Could not retrieve API key from the backend. Please ensure the backend server is running on http://localhost:5000/.");
        // You might want to disable functionality that requires the API key here
    } finally {
        isFetchingApiKey = false;
    }
}


/**
 * Makes a network request to the Gemini API.
 * @param {string} prompt - The prompt to send to the language model.
 * @param {boolean} isJson - Whether to expect a JSON response.
 * @returns {Promise<object|string|null>} The parsed JSON object, text response, or null on failure.
 */
export async function callGemini(prompt, isJson = false) {
     if (!geminiApiKey) {
        console.error("Gemini API Key is not loaded. Ensure fetchApiKey was called and awaited during app initialization.");
        alert("Operation failed: API key not available. Please refresh."); // Notify user
        return isJson ? null : "Error: API key not loaded.";
     }

    isCallingAPI(true); // Show loading spinner
    console.log("LOG: Calling Gemini API with prompt:", prompt);

    // Use the fetched API key in the Gemini API URL
    // The Gemini API endpoint is NOT on your backend, it's Google's API.
    // We just use the fetched key in this URL.
     const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;


    const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };

    if (isJson) {
        payload.generationConfig = { responseMimeType: "application/json" };
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorDetail = await response.text().catch(() => "No response body");
            console.error("Gemini API error response:", errorDetail);
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        if (result.error) {
             console.error("Gemini API returned an error:", result.error);
             throw new Error(`Gemini API error: ${result.error.message || 'Unknown API error'}`);
        }


        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            if (isJson) {
                try {
                    const jsonMatch = text.match(/(\{.*\}|\[.*\])/s);
                    if (jsonMatch && jsonMatch[0]) {
                        let jsonString = jsonMatch[0];
                        jsonString = jsonString.replace(/```json\n|\n```/g, '').trim();
                        jsonString = jsonString.replace(/,\s*([}\]])/g, '$1');

                        return JSON.parse(jsonString);
                    }
                    console.error("Could not extract valid JSON object/array from string:", text);
                    try {
                         let cleanedText = text.replace(/```json\n|\n```/g, '').trim();
                         cleanedText = cleanedText.replace(/,\s*([}\]])/g, '$1');
                          return JSON.parse(cleanedText);
                     } catch (fallbackErr) {
                          console.error("Fallback JSON parsing failed:", fallbackErr);
                          return null;
                     }
                } catch (e) {
                    console.error("JSON Parsing Error:", e, "Original string:", text);
                    return null;
                }
            }
            return text;
        }
        return isJson ? null : "The model could not generate a response.";
    } catch (error) {
        console.error("Gemini API call failed:", error);
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
function isCallingAPI(isLoading) {
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
