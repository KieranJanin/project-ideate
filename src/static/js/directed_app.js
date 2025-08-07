// src/js/directed_app.js

import { initializeDomElements } from './ui/domElements.js';
import { initializeCommonEventListeners } from './ui/common_event_handlers.js';
import { initializeDirectedEventListeners } from './ui/directed_event_handlers.js';
import { renderAgents } from './ui/renderers.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeDomElements();
    renderAgents();
    initializeCommonEventListeners();
    initializeDirectedEventListeners();
});
