// src/static/js/core/state_manager.js

import { loadProject, saveProject, deleteProject } from './api.js';

const LOCAL_PROJECT_ID_KEY = 'currentProjectId';
const FALLBACK_STATE_KEY = 'projectIdeateSimulationState_fallback'; // For unauthenticated or transient state

/**
 * Saves the simulation state for a given project to Firestore.
 * If no projectId is provided, it falls back to local storage (e.g., for unauthenticated usage, or initial mission control).
 * @param {string|null} projectId - The ID of the current project, or null for fallback local storage.
 * @param {object} state - The state object to save.
 */
export async function saveState(projectId, state) {
    try {
        if (projectId) {
            await saveProject(projectId, state);
            console.log(`State for project ${projectId} saved to Firestore.`);
        } else {
            // Fallback to local storage if no project ID (e.g., before project creation)
            localStorage.setItem(FALLBACK_STATE_KEY, JSON.stringify(state));
            console.log('Fallback state saved to localStorage.');
        }
    } catch (e) {
        console.error('Error saving state', e);
    }
}

/**
 * Loads the simulation state for a given project from Firestore.
 * If no projectId is provided, it attempts to load from fallback local storage.
 * @param {string|null} projectId - The ID of the project to load.
 * @returns {Promise<object|null>} The loaded state object, or null if not found/error.
 */
export async function loadState(projectId) {
    try {
        if (projectId) {
            const result = await loadProject(projectId);
            console.log(`State for project ${projectId} loaded from Firestore:`, result.project.simulationState);
            return result.project.simulationState; // Assuming simulationState is nested
        } else {
            // Fallback to local storage
            const serializedState = localStorage.getItem(FALLBACK_STATE_KEY);
            if (serializedState === null) {
                return null;
            }
            const state = JSON.parse(serializedState);
            console.log('Fallback state loaded from localStorage:', state);
            return state;
        }
    } catch (e) {
        console.error('Error loading state', e);
        return null;
    }
}

/**
 * Clears the simulation state.
 * If a projectId is provided, it deletes the project from Firestore.
 * If no projectId is provided, it clears the fallback local storage state.
 * @param {string|null} projectId - The ID of the project to delete, or null to clear fallback state.
 */
export async function clearState(projectId) {
    try {
        if (projectId) {
            await deleteProject(projectId);
            console.log(`Project ${projectId} deleted from Firestore.`);
            localStorage.removeItem(LOCAL_PROJECT_ID_KEY); // Also clear the local current project ID
        } else {
            localStorage.removeItem(FALLBACK_STATE_KEY);
            console.log('Fallback state cleared from localStorage.');
        }
    } catch (e) {
        console.error('Error clearing state', e);
    }
}

/**
 * Saves the current project ID to localStorage.
 * @param {string} projectId - The ID of the project to set as current.
 */
export function setCurrentProjectId(projectId) {
    localStorage.setItem(LOCAL_PROJECT_ID_KEY, projectId);
    console.log('Current project ID set:', projectId);
}

/**
 * Gets the current project ID from localStorage.
 * @returns {string|null} The current project ID, or null if not set.
 */
export function getCurrentProjectId() {
    return localStorage.getItem(LOCAL_PROJECT_ID_KEY);
}

/**
 * Clears the current project ID from localStorage.
 */
export function clearCurrentProjectId() {
    localStorage.removeItem(LOCAL_PROJECT_ID_KEY);
    console.log('Current project ID cleared.');
}
