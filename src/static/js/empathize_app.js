// src/static/js/empathize_app.js

import { initializeDomElements } from './ui/domElements.js';
import { initializeCommonEventListeners } from './ui/common_event_handlers.js';
import * as renderers from './ui/renderers.js';
import { loadState, saveState, getCurrentProjectId } from './core/state_manager.js';
import { dom } from './ui/domElements.js';
import { simulationFlow, phases } from './config/simulationFlow.js';
import { 
    startInterval,
    processScriptStep, 
    handlePhaseAdvance,
    refreshCurrentPhase,
    stopSimulation,
    currentSimulationState // Import the shared state object from simulation_core
} from './core/simulation_core.js';



document.addEventListener('DOMContentLoaded', async () => {
    initializeDomElements();
    initializeCommonEventListeners();

    const projectId = getCurrentProjectId();
    if (!projectId) {
        console.error("No project ID found. Redirecting to mission control.");
        window.location.href = '/mission-control';
        return;
    }

    // Load the state for the current project
    const loadedState = await loadState(projectId);
    if (loadedState) {
        Object.assign(currentSimulationState, loadedState);
    } else {
        console.error("Failed to load project state. Redirecting to mission control.");
        window.location.href = '/mission-control';
        return;
    }

    // Render existing artifacts based on loaded state
    if (currentSimulationState.collectedData.persona) {
        renderers.renderPersona(currentSimulationState.collectedData.persona);
    }
    if (currentSimulationState.collectedData.quotes) {
        renderers.renderKeyQuotes(currentSimulationState.collectedData.quotes);
    }
    if (currentSimulationState.collectedData.hmw) {
        renderers.renderHMWs(currentSimulationState.collectedData.hmw);
    }

    // Determine starting point for this phase
    const phaseIndex = phases.indexOf('Empathize');
    let startIndex = 0;
    for(let i=0; i < simulationFlow.length; i++){
        if(simulationFlow[i].type === 'phase' && simulationFlow[i].phase === phaseIndex) {
            startIndex = i;
            break;
        }
    }

    // If simulation is not explicitly paused and we are entering this phase for the first time or resuming within it
    if (!currentSimulationState.isPaused) {
        // Only set scriptIndex if coming from a previous phase or fresh start for this phase
        if (currentSimulationState.scriptIndex < startIndex || currentSimulationState.currentPhase !== 'empathize') {
            currentSimulationState.scriptIndex = startIndex;
            currentSimulationState.currentPhase = 'empathize';
            await saveState(projectId, currentSimulationState); // Save immediately after setting new phase/index
        }
        dom.statusEl.textContent = 'Running...';
        dom.statusEl.className = 'font-semibold text-blue-400';
        startInterval(); // Start the interval for this page
    } else {
        // If paused, ensure UI reflects it and render phase actions if needed
        dom.statusEl.textContent = 'Paused';
        dom.statusEl.className = 'font-semibold text-yellow-400';
        // Check if the current step is a gate and render actions
        if (simulationFlow[currentSimulationState.scriptIndex]?.type === 'gate') {
            const nextPhaseIndex = phaseIndex + 1;
            let nextPhaseUrl = '';
            if (nextPhaseIndex < phases.length) {
                nextPhaseUrl = `/${phases[nextPhaseIndex].toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`;
            } else {
                nextPhaseUrl = '/'; // Redirect to landing or a final summary
            }
            renderers.renderPhaseActions(currentSimulationState.currentPhase, nextPhaseUrl);
        }
    }

    dom.missionControlPhase.textContent = phases[phaseIndex];

    // Attach event listeners for phase actions (next/refresh)
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('next-phase-btn')) {
            handlePhaseAdvance();
        }
        if (e.target.classList.contains('refresh-phase-btn')) {
            refreshCurrentPhase();
        }
    });
});
