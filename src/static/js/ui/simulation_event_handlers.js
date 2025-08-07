// src/js/ui/simulation_event_handlers.js

import { dom } from './domElements.js';
import { startSimulation, pauseSimulation, resetSimulation } from '../core/simulation_logic.js';

export function initializeSimulationEventListeners() {
    dom.startBtn.addEventListener('click', startSimulation);
    dom.pauseBtn.addEventListener('click', pauseSimulation);
    dom.resetBtn.addEventListener('click', () => resetSimulation(false));
}
