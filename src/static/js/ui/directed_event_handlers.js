// src/js/ui/directed_event_handlers.js

import { dom } from './domElements.js';
import { startDirectedWorkflow, resetDirectedWorkflow, executeTask } from '../core/directed_logic.js';

export function initializeDirectedEventListeners() {
    dom.startBtn.addEventListener('click', startDirectedWorkflow);
    dom.resetBtn.addEventListener('click', () => resetDirectedWorkflow(false));

    // Event listener for the agent action buttons
    dom.agentActionButtons.addEventListener('click', (e) => {
        const button = e.target.closest('.agent-action-btn');
        if (button) {
            const agentId = button.dataset.agent;
            const taskId = button.dataset.task;
            executeTask(agentId, taskId);
        }
    });
}
