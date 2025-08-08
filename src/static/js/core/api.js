// src/js/core/api.js
import { dom } from '../ui/domElements.js';

/**
 * Makes a network request to the backend Gemini proxy.
 * Can handle both standard and streaming responses.
 * 
 * @param {string} prompt - The prompt to send to the language model.
 * @param {boolean} isJson - Whether to request a JSON response. (Not used for streaming).
 * @param {boolean} stream - Whether to request a streaming response.
 * @param {function} onStream - Callback function to handle incoming stream chunks.
 * @returns {Promise<object|string|null>} For non-streaming, the response. For streaming, a promise that resolves when the stream ends.
 */
export function callGemini(prompt, isJson = false, stream = false, onStream = null) {
    isCallingAPI(true);
    const backendApiUrl = 'http://localhost:5000/api/gemini-proxy';

    const payload = { 
        prompt: prompt,
        is_json: isJson,
        stream: stream
    };

    if (stream && onStream) {
        // --- Streaming Logic ---
        return new Promise((resolve, reject) => {
            const eventSource = new EventSource(`${backendApiUrl}?prompt=${encodeURIComponent(prompt)}`);
            
            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.event === 'EOS') {
                    eventSource.close();
                    isCallingAPI(false);
                    resolve();
                } else {
                    onStream(data.text);
                }
            };

            eventSource.onerror = (err) => {
                console.error("EventSource failed:", err);
                eventSource.close();
                isCallingAPI(false);
                reject(new Error("Stream failed"));
            };

            // We need to send the payload via a POST request to initiate the stream
            fetch(backendApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Failed to start stream');
                }
            }).catch(error => {
                console.error("Stream initiation failed:", error);
                isCallingAPI(false);
                reject(error);
            });
        });

    } else {
        // --- Standard (Non-Streaming) Logic ---
        return fetch(backendApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Unknown backend error'); });
            }
            return response.json();
        })
        .then(result => {
            if (isJson) {
                return result;
            }
            return result.text || result;
        })
        .catch(error => {
            console.error("Backend proxy call failed:", error);
            return isJson ? null : `Error during API call: ${error.message}`;
        })
        .finally(() => {
            isCallingAPI(false);
        });
    }
}

/**
 * Sends the design challenge to the backend for saving.
 * @param {string} challenge - The design challenge text.
 * @returns {Promise<object>} The response from the backend.
 */
export async function saveDesignChallenge(challenge) {
    isCallingAPI(true);
    try {
        const response = await fetch('http://localhost:5000/api/save-challenge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ challenge: challenge }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save design challenge.');
        }

        return await response.json();
    } catch (error) {
        console.error("Error saving design challenge:", error);
        throw error;
    } finally {
        isCallingAPI(false);
    }
}

/**
 * Toggles the visibility of the global loading spinner.
 * @param {boolean} isLoading - Whether the API call is in progress.
 */
function isCallingAPI(isLoading) {
    if (dom && dom.loadingSpinner) {
        dom.loadingSpinner.style.display = isLoading ? 'block' : 'none';
    }
}
