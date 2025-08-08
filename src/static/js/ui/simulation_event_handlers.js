// src/js/ui/simulation_event_handlers.js

import { dom } from './domElements.js';
import { startSimulation, pauseSimulation, resetSimulation, advanceToNextPhase, refreshCurrentPhase } from '../core/simulation_logic.js';

export function initializeSimulationEventListeners() {
    console.log('Initializing simulation event listeners...');
    console.log('dom.startBtn:', dom.startBtn);
    if (dom.startBtn) {
        dom.startBtn.addEventListener('click', startSimulation);
    } else {
        console.error('Start button not found in DOM elements.');
    }
    
    if (dom.pauseBtn) {
        dom.pauseBtn.addEventListener('click', pauseSimulation);
    } else {
        console.error('Pause button not found in DOM elements.');
    }

    if (dom.resetBtn) {
        dom.resetBtn.addEventListener('click', () => resetSimulation(false));
    } else {
        console.error('Reset button not found in DOM elements.');
    }

    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('next-phase-btn')) {
            advanceToNextPhase();
        }
        if (e.target.classList.contains('refresh-phase-btn')) {
            refreshCurrentPhase();
        }
    });
}
