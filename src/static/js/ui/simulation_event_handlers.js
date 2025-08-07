// src/js/ui/simulation_event_handlers.js

import { dom } from './domElements.js';
import { startSimulation, pauseSimulation, resetSimulation, advanceToNextPhase, refreshCurrentPhase } from '../core/simulation_logic.js';

export function initializeSimulationEventListeners() {
    dom.startBtn.addEventListener('click', startSimulation);
    dom.pauseBtn.addEventListener('click', pauseSimulation);
    dom.resetBtn.addEventListener('click', () => resetSimulation(false));

    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('next-phase-btn')) {
            advanceToNextPhase();
        }
        if (e.target.classList.contains('refresh-phase-btn')) {
            refreshCurrentPhase();
        }
    });
}
