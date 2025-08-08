// src/static/js/finalize_app.js

import { initializeDomElements } from './ui/domElements.js';
import { initializeCommonEventListeners } from './ui/common_event_handlers.js';
import * as renderers from './ui/renderers.js';
import { loadState, saveState, clearState, getCurrentProjectId } from './core/state_manager.js';
import { dom } from './ui/domElements.js';
import { simulationFlow, phases } from './config/simulationFlow.js';
import { 
    startInterval,
    processScriptStep, 
    handlePhaseAdvance,
    refreshCurrentPhase,
    stopSimulation,
    currentSimulationState 
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

    const loadedState = await loadState(projectId);
    if (loadedState) {
        Object.assign(currentSimulationState, loadedState);
    } else {
        console.error("Failed to load project state. Redirecting to mission control.");
        window.location.href = '/mission-control';
        return;
    }

    if (currentSimulationState.collectedData.finalPitch) {
        dom.finalConceptContent.innerHTML = currentSimulationState.collectedData.finalPitch;
        dom.finalConceptCard.classList.remove('hidden');
    }

    const phaseIndex = phases.indexOf('Finalize');
    let startIndex = 0;
    for(let i=0; i < simulationFlow.length; i++){
        if(simulationFlow[i].type === 'phase' && simulationFlow[i].phase === phaseIndex) {
            startIndex = i;
            break;
        }
    }

    if (!currentSimulationState.isPaused) {
        if (currentSimulationState.scriptIndex < startIndex || currentSimulationState.currentPhase !== 'finalize') {
            currentSimulationState.scriptIndex = startIndex;
            currentSimulationState.currentPhase = 'finalize';
            await saveState(projectId, currentSimulationState);
        }
        dom.statusEl.textContent = 'Running...';
        dom.statusEl.className = 'font-semibold text-blue-400';
        startInterval();
    } else {
        dom.statusEl.textContent = 'Paused';
        dom.statusEl.className = 'font-semibold text-yellow-400';
        if (simulationFlow[currentSimulationState.scriptIndex]?.type === 'gate') {
            const nextPhaseIndex = phaseIndex + 1;
            let nextPhaseUrl = '';
            if (nextPhaseIndex < phases.length) {
                nextPhaseUrl = `/${phases[nextPhaseIndex].toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`;
            } else {
                nextPhaseUrl = '/';
            }
            renderers.renderPhaseActions(currentSimulationState.currentPhase, nextPhaseUrl);
        }
    }

    dom.missionControlPhase.textContent = phases[phaseIndex];

    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('next-phase-btn')) {
            handlePhaseAdvance();
        }
        if (e.target.classList.contains('refresh-phase-btn')) {
            refreshCurrentPhase();
        }
    });

    startInterval();
});
