// src/js/core/api.js
import { dom } from '../ui/domElements.js';

/**
 * Makes a network request to the Gemini API.
 * @param {string} prompt - The prompt to send to the language model.
 * @param {boolean} isJson - Whether to expect a JSON response.
 * @returns {Promise<object|string|null>} The parsed JSON object, text response, or null on failure.
 */
export async function callGemini(prompt, isJson = false) {
    // Show loading spinner
    isCallingAPI(true);
    console.log("LOG: Calling Gemini API with prompt:", prompt);
    const apiKey = ""; // API key is handled by the execution environment.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
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
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);
        
        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            if (isJson) {
                // Robust JSON parsing
                try {
                    const jsonMatch = text.match(/(\{.*\}|\[.*\])/s);
                    if (jsonMatch && jsonMatch[0]) {
                        let jsonString = jsonMatch[0];
                        jsonString = jsonString.replace(/[^\x20-\x7E\s]/g, ""); // Remove non-printable/non-ASCII chars
                        jsonString = jsonString.replace(/,\s*([}\]])/g, '$1'); // Remove trailing commas
                        return JSON.parse(jsonString);
                    }
                    console.error("Could not extract valid JSON from string:", text);
                    return null;
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
        return isJson ? null : `Error: Could not connect to the AI model. ${error.message}`;
    } finally {
        isCallingAPI(false);
    }
}

/**
 * Toggles the visibility of the global loading spinner.
 * @param {boolean} isLoading - Whether the API call is in progress.
 */
function isCallingAPI(isLoading) {
    if (isLoading) {
        dom.loadingSpinner.classList.remove('hidden');
    } else {
        dom.loadingSpinner.classList.add('hidden');
    }
}
