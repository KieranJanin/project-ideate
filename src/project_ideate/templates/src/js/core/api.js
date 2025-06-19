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
        // Optionally wait here if already fetching, or just return
        if (isFetchingApiKey) {
            // A more robust approach would involve a promise that resolves when fetching is done
            // For now, we rely on the initial call in initializeApp.
            console.log("LOG: Waiting for API key fetch to complete...");
             // Simple waiting mechanism (consider improving with a promise)
             await new Promise(resolve => {
                 const checkInterval = setInterval(() => {
                     if (geminiApiKey) {
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
        // Use the relative path; assume backend is running on the same host/origin,
        // or use full URL http://localhost:5000/api/key if backend is on port 5000
        // and frontend on a different port (e.g., 8000) during development.
        // For production, a proxy is recommended.
        const response = await fetch('/api/key');

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
        alert("Failed to load application: Could not retrieve API key from the backend. Please ensure the backend server is running.");
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
        // Depending on your app's flow, you might want to throw an error
        // or return a specific value indicating failure.
        alert("Operation failed: API key not available. Please refresh."); // Notify user
        return isJson ? null : "Error: API key not loaded.";
     }

    isCallingAPI(true); // Show loading spinner
    console.log("LOG: Calling Gemini API with prompt:", prompt);

    // Use the fetched API key
    // Adjust the URL if your Flask backend runs on a different origin/port than npx serve
    // Example for Flask on 5000, npx serve on 8000:
    // const apiUrl = `http://localhost:5000/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
    // If using a proxy, the relative path is fine:
     const apiUrl = `/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`; // Assuming a proxy handles /v1beta requests


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

        // Improved error handling
        if (!response.ok) {
            const errorDetail = await response.text().catch(() => "No response body"); // Attempt to get error body
            console.error("API error response:", errorDetail);
            // Include status and statusText in the error message
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        // Check for errors within the API response body itself (common for AI APIs)
        if (result.error) {
             console.error("Gemini API returned an error:", result.error);
             throw new Error(`Gemini API error: ${result.error.message || 'Unknown API error'}`);
        }


        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            if (isJson) {
                // Robust JSON parsing
                try {
                    // Attempt to find and parse a JSON object or array within the text
                    const jsonMatch = text.match(/(\{.*\}|\[.*\])/s);
                    if (jsonMatch && jsonMatch[0]) {
                        let jsonString = jsonMatch[0];
                        // Clean common non-JSON characters often included by models (e.g., markdown code blocks)
                        jsonString = jsonString.replace(/```json\n|\n```/g, '').trim();
                        jsonString = jsonString.replace(/,\s*([}\]])/g, '$1'); // Remove trailing commas inside objects/arrays

                        return JSON.parse(jsonString);
                    }
                    console.error("Could not extract valid JSON object/array from string:", text);
                    // Fallback attempt after general cleaning if no clear block was found
                    try {
                         let cleanedText = text.replace(/```json\n|\n```/g, '').trim();
                         cleanedText = cleanedText.replace(/,\s*([}\]])/g, '$1');
                          return JSON.parse(cleanedText);
                     } catch (fallbackErr) {
                          console.error("Fallback JSON parsing failed:", fallbackErr);
                          return null; // Fallback failed too
                     }
                } catch (e) {
                    console.error("JSON Parsing Error:", e, "Original string:", text);
                    return null;
                }
            }
            return text; // Return plain text response
        }
        // No candidates or content found in a seemingly successful response
        return isJson ? null : "The model could not generate a response.";
    } catch (error) {
        console.error("Gemini API call failed:", error);
        // Return null or an informative string based on expected return type
        return isJson ? null : `Error during API call: ${error.message}`;
    } finally {
        isCallingAPI(false); // Hide loading spinner regardless of success or failure
    }
}

/**
 * Toggles the visibility of the global loading spinner.
 * Assumes `dom` is imported and contains a `loadingSpinner` element.
 * @param {boolean} isLoading - Whether the API call is in progress.
 */
function isCallingAPI(isLoading) {
    if (dom && dom.loadingSpinner) { // Check if dom and loadingSpinner exist
        if (isLoading) {
            dom.loadingSpinner.classList.remove('hidden');
        } else {
            dom.loadingSpinner.classList.add('hidden');
        }
    } else {
        console.warn("DOM element 'loadingSpinner' not found for isCallingAPI.");
    }
}
