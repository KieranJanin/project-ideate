// src/js/core/api.js
import { dom } from '../ui/domElements.js';

/**
 * Helper to get the Firebase ID token from sessionStorage.
 * @returns {string|null} The ID token if available, otherwise null.
 */
function getIdToken() {
    return sessionStorage.getItem('idToken');
}

/**
 * Builds headers for API requests, including authorization token if available.
 * @returns {HeadersInit} The headers object.
 */
function getAuthHeaders() {
    const headers = {
        'Content-Type': 'application/json',
    };
    const idToken = getIdToken();
    if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
    }
    return headers;
}

/**
 * Handles common error responses from backend, including authentication redirects.
 * @param {Response} response - The fetch API response.
 * @returns {Promise<any>} The parsed JSON data or throws an error.
 */
async function handleResponse(response) {
    if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401 || response.status === 403) {
            console.warn("Authentication error, redirecting to landing.");
            sessionStorage.removeItem('idToken');
            window.location.href = '/'; 
        }
        throw new Error(errorData.error || response.statusText);
    }
    return response.json();
}

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
    const headers = getAuthHeaders();

    const payload = { 
        prompt: prompt,
        is_json: isJson,
        stream: stream
    };

    if (stream && onStream) {
        return new Promise((resolve, reject) => {
            fetch(backendApiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            })
            .then(handleResponse) // Use handleResponse for initial fetch, but it returns JSON, not stream directly.
            .then(() => {
                // If the initial POST was successful, proceed with EventSource.
                // Note: EventSource itself won't send custom headers, so the backend proxy route should either
                // not require auth for the SSE part, or use session-based auth if the initial POST established it.
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
            })
            .catch(error => {
                console.error("Stream initiation failed:", error);
                isCallingAPI(false);
                reject(error);
            });
        });

    } else {
        return fetch(backendApiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        })
        .then(handleResponse)
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
 * This is now replaced by saveProject.
 * @deprecated Use saveProject instead.
 */
export async function saveDesignChallenge(challenge) {
    console.warn("saveDesignChallenge is deprecated. Use saveProject instead.");
    // This function will eventually be removed or adapted to call saveProject with a default project ID.
}

// --- New Project API Calls ---

export async function createProject(projectName, designChallenge) {
    isCallingAPI(true);
    try {
        const response = await fetch('http://localhost:5000/api/projects/create', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ projectName, designChallenge }),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("Error creating project:", error);
        throw error;
    } finally {
        isCallingAPI(false);
    }
}

export async function listProjects() {
    isCallingAPI(true);
    try {
        const response = await fetch('http://localhost:5000/api/projects/list', {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("Error listing projects:", error);
        throw error;
    } finally {
        isCallingAPI(false);
    }
}

export async function loadProject(projectId) {
    isCallingAPI(true);
    try {
        const response = await fetch(`http://localhost:5000/api/projects/${projectId}/load`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error loading project ${projectId}:`, error);
        throw error;
    } finally {
        isCallingAPI(false);
    }
}

export async function saveProject(projectId, simulationState) {
    isCallingAPI(true);
    try {
        const response = await fetch(`http://localhost:5000/api/projects/${projectId}/save`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ simulationState }),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error saving project ${projectId}:`, error);
        throw error;
    } finally {
        isCallingAPI(false);
    }
}

export async function deleteProject(projectId) {
    isCallingAPI(true);
    try {
        const response = await fetch(`http://localhost:5000/api/projects/${projectId}/delete`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error deleting project ${projectId}:`, error);
        throw error;
    } finally {
        isCallingAPI(false);
    }
}

// --- Utility Functions ---

/**
 * Toggles the visibility of the global loading spinner.
 * @param {boolean} isLoading - Whether the API call is in progress.
 */
function isCallingAPI(isLoading) {
    if (dom && dom.loadingSpinner) {
        dom.loadingSpinner.style.display = isLoading ? 'block' : 'none';
    }
}
