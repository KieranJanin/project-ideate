// src/js/simulation_app.js

import { initializeCommonEventListeners } from './ui/common_event_handlers.js';
import { initializeSimulationEventListeners } from './ui/simulation_event_handlers.js';
import { renderAgents } from './ui/renderers.js';

document.addEventListener('DOMContentLoaded', () => {
    renderAgents();
    initializeCommonEventListeners();
    initializeSimulationEventListeners();
});
