// src/static/js/mission_control_app.js

import { initializeDomElements } from './ui/domElements.js';
import { initializeCommonEventListeners } from './ui/common_event_handlers.js';
import { renderAgents } from './ui/renderers.js';
import { loadState, saveState, clearState, setCurrentProjectId, getCurrentProjectId, clearCurrentProjectId } from './core/state_manager.js';
import { createProject, listProjects, loadProject, deleteProject, callGemini } from './core/api.js';
import { dom } from './ui/domElements.js';
import { phases } from './config/simulationFlow.js';

let currentSimulationState;
let currentProjectId = getCurrentProjectId();

document.addEventListener('DOMContentLoaded', async () => {
    initializeDomElements();
    renderAgents(); // Renders the agent list for editing
    initializeCommonEventListeners(); // For hamburger menu etc.

    dom.missionControlPhase.textContent = 'Mission Control';
    dom.statusEl.textContent = 'Idle';
    dom.statusEl.className = 'font-semibold text-yellow-400';

    // Event Listeners for Project Management
    if (dom.createProjectBtn) {
        dom.createProjectBtn.addEventListener('click', handleCreateProject);
    }

    // Event Listener for Generate Challenge Button
    if (dom.generateChallengeBtn) {
        dom.generateChallengeBtn.addEventListener('click', generateChallengeHandler);
    }

    // Event Listener for Start Simulation (or Load Project) Button
    if (dom.startBtn) {
        dom.startBtn.textContent = 'Load Selected Project'; // Default text
        dom.startBtn.addEventListener('click', handleLoadProjectOrStartNew);
    }

    // Event listener for Reset button (now clears current project selection)
    if (dom.resetBtn) {
        dom.resetBtn.textContent = 'Clear Current Project';
        dom.resetBtn.addEventListener('click', handleClearCurrentProject);
    }

    await renderProjectList();

    // If a project is currently selected, display its challenge and disable new creation
    if (currentProjectId) {
        await displayCurrentProjectChallenge(currentProjectId);
    } else {
        dom.startBtn.textContent = 'Start New Simulation';
    }
});

async function renderProjectList() {
    if (!dom.projectListContainer) return;
    dom.projectListContainer.innerHTML = '<p class="text-gray-400">Loading projects...</p>';
    try {
        const response = await listProjects();
        const projects = response.projects;
        
        if (projects.length === 0) {
            dom.projectListContainer.innerHTML = '<p class="text-gray-400">No projects yet. Create one above!</p>';
            dom.startBtn.textContent = 'Start New Simulation'; // Ensure button text is correct
            dom.startBtn.disabled = false;
            dom.designChallengeTextarea.value = '';
            dom.newProjectNameInput.value = '';
            clearCurrentProjectId(); // No projects, so ensure no project is selected locally
            return;
        }

        dom.projectListContainer.innerHTML = ''; // Clear loading message
        projects.forEach(project => {
            const projectEl = document.createElement('div');
            projectEl.className = `p-3 rounded-md border ${project.id === currentProjectId ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 bg-gray-800'} flex flex-col`;
            projectEl.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <span class="font-semibold text-white">${project.projectName}</span>
                    <span class="text-xs text-gray-400">${project.lastUpdated ? new Date(project.lastUpdated).toLocaleString() : 'N/A'}</span>
                </div>
                <p class="text-sm text-gray-300 mb-3 line-clamp-2">${project.designChallenge}</p>
                <div class="flex justify-end space-x-2">
                    <button data-project-id="${project.id}" class="load-project-btn text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1 px-2 rounded-md transition">Load</button>
                    <button data-project-id="${project.id}" class="delete-project-btn text-xs bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-2 rounded-md transition">Delete</button>
                </div>
            `;
            dom.projectListContainer.appendChild(projectEl);

            // Add event listeners for dynamically created buttons
            projectEl.querySelector('.load-project-btn').addEventListener('click', () => handleLoadProject(project.id));
            projectEl.querySelector('.delete-project-btn').addEventListener('click', () => handleDeleteProject(project.id));
        });

        // Update start button based on whether a project is selected
        if (currentProjectId) {
            dom.startBtn.textContent = 'Start Simulation from Loaded Project';
            dom.startBtn.disabled = false;
        } else {
            dom.startBtn.textContent = 'Start New Simulation';
        }

    } catch (error) {
        console.error("Failed to list projects:", error);
        dom.projectListContainer.innerHTML = '<p class="text-red-400">Error loading projects. Please try again.</p>';
        dom.startBtn.disabled = true; // Disable start button on error
    }
}

async function handleCreateProject() {
    const projectName = dom.newProjectNameInput.value.trim();
    const designChallenge = dom.designChallengeTextarea.value.trim();

    if (!projectName || !designChallenge) {
        alert("Please enter both a project name and a design challenge.");
        return;
    }

    dom.createProjectBtn.disabled = true;
    dom.loadingSpinner.classList.remove('hidden');

    try {
        const response = await createProject(projectName, designChallenge);
        alert(`Project "${projectName}" created!`);
        dom.newProjectNameInput.value = '';
        dom.designChallengeTextarea.value = designChallenge; // Keep challenge for immediate use
        setCurrentProjectId(response.projectId); // Set the new project as current
        await renderProjectList(); // Re-render list to show new project
        dom.startBtn.textContent = 'Start Simulation from Loaded Project';
        // Now redirect to empathize, starting a new simulation with this project
        window.location.href = '/empathize'; 

    } catch (error) {
        console.error("Error creating project:", error);
        alert(`Failed to create project: ${error.message}`);
    } finally {
        dom.createProjectBtn.disabled = false;
        dom.loadingSpinner.classList.add('hidden');
    }
}

async function handleLoadProject(projectId) {
    dom.loadingSpinner.classList.remove('hidden');
    dom.startBtn.disabled = true;
    try {
        const response = await loadProject(projectId);
        currentSimulationState = response.project.simulationState; // Load the full state
        dom.designChallengeTextarea.value = currentSimulationState.designChallenge;
        setCurrentProjectId(projectId); // Set this project as current
        await renderProjectList(); // Re-render to highlight selected project
        alert(`Project "${response.project.projectName}" loaded. Click "Start Simulation from Loaded Project" to continue.`);
        dom.startBtn.textContent = 'Start Simulation from Loaded Project';
        dom.startBtn.disabled = false;
        // Do not redirect immediately; let user click start to resume simulation from loaded state.

    } catch (error) {
        console.error("Error loading project:", error);
        alert(`Failed to load project: ${error.message}`);
    } finally {
        dom.loadingSpinner.classList.add('hidden');
    }
}

async function handleDeleteProject(projectId) {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
        return;
    }
    dom.loadingSpinner.classList.remove('hidden');
    try {
        await deleteProject(projectId);
        alert("Project deleted successfully.");
        if (currentProjectId === projectId) {
            clearCurrentProjectId(); // Clear local storage if deleted project was current
            dom.designChallengeTextarea.value = ''; // Clear challenge if current was deleted
            dom.startBtn.textContent = 'Start New Simulation';
        }
        await renderProjectList(); // Re-render list
    } catch (error) {
        console.error("Error deleting project:", error);
        alert(`Failed to delete project: ${error.message}`);
    } finally {
        dom.loadingSpinner.classList.add('hidden');
    }
}

async function handleLoadProjectOrStartNew() {
    if (currentProjectId) {
        // If a project is loaded, redirect to the empathize phase to resume simulation
        window.location.href = '/empathize'; 
    } else {
        // If no project is loaded, it means start a brand new one (which first requires creating it)
        alert("Please create a new project or load an existing one to start a simulation.");
    }
}

async function generateChallengeHandler() {
    dom.loadingSpinner.classList.remove('hidden');
    dom.generateChallengeBtn.disabled = true;
    const keyword = dom.designChallengeTextarea.value.trim();
    const prompt = `You are a design thinking facilitator. Expand the following keyword into a rich, detailed, and inspiring design challenge. Make it specific and actionable. KEYWORD: "${keyword}"`;

    try {
        const response = await callGemini(prompt, false, false); 
        dom.designChallengeTextarea.value = response.text;
    } catch (error) {
        console.error("Error generating challenge:", error);
        alert(`Failed to generate challenge: ${error.message}`);
    } finally {
        dom.loadingSpinner.classList.add('hidden');
        dom.generateChallengeBtn.disabled = false;
    }
}

function handleClearCurrentProject() {
    clearCurrentProjectId();
    dom.designChallengeTextarea.value = '';
    dom.newProjectNameInput.value = '';
    dom.startBtn.textContent = 'Start New Simulation';
    dom.startBtn.disabled = false;
    renderProjectList(); // Re-render to clear selection highlight
    alert("Current project selection cleared. You can now create a new project or load another.");
}

// Initial check for authentication state on Mission Control page
// This should ideally be handled by Firebase auth listener on landing, and then redirection.
// If a user lands here without auth, they should be redirected by the backend require_auth on API calls.
// For now, rely on API calls to trigger auth redirect if token is missing/invalid.
