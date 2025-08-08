// src/js/ui/common_event_handlers.js

import { dom } from './domElements.js';
import { callGemini } from '../core/api.js';
import { currentSimulationState } from '../core/simulation_core.js'; // Import currentSimulationState
import { agents } from '../config/agents.js';

export function initializeCommonEventListeners() {
    // Hamburger Menu Toggle
    if (dom.hamburgerMenu && dom.mainNav) {
        dom.hamburgerMenu.addEventListener('click', () => {
            const isCollapsed = dom.mainNav.classList.contains('nav-collapsed');
            if (isCollapsed) {
                // EXPAND
                dom.mainNav.classList.remove('lg:w-20', 'nav-collapsed');
                dom.mainNav.classList.add('lg:w-64');
                dom.projectTitle.classList.remove('hidden');
                dom.collapsedTitle.classList.add('hidden');
            } else {
                // COLLAPSE
                dom.mainNav.classList.add('lg:w-20', 'nav-collapsed');
                dom.mainNav.classList.remove('lg:w-64');
                dom.projectTitle.classList.add('hidden');
                dom.collapsedTitle.classList.remove('hidden');
            }
        });
    }

    // Removed click listener for projectTitle and collapsedTitle as they are now direct links in HTML

    // Event listeners for chat interactions (if applicable on this page)
    document.querySelectorAll('.chat-send-btn').forEach(btn => btn.addEventListener('click', handlePhaseInteraction));
    document.querySelectorAll('.chat-input').forEach(input => {
        input.addEventListener('keyup', (e) => { if (e.key === 'Enter') handlePhaseInteraction(e); });
    });

    // Event listeners for chat toggles per phase
    // These elements might not exist on all pages, so conditional checks are good.
    const phaseToggles = ['empathize', 'define', 'ideate', 'prototype', 'finalize'];
    for (const phaseKey of phaseToggles) {
        const toggle = dom[`${phaseKey}ChatToggle`];
        const container = dom[`${phaseKey}ChatContainer`];
        if (toggle && container) {
            toggle.addEventListener('click', () => container.classList.toggle('hidden'));
        }
    }

    // The navigation links (nav-link) now directly use Flask url_for in HTML,
    // so the JavaScript switchView is no longer needed for main navigation.
    // Keep the edit team and confirm team buttons for mission control if they exist.
    if (dom.editTeamBtn) {
        dom.editTeamBtn.addEventListener('click', () => {
            dom.agentEditPanel.classList.remove('hidden');
            dom.editTeamBtn.classList.add('hidden');
        });
    }

    if (dom.confirmTeamBtn) {
        dom.confirmTeamBtn.addEventListener('click', () => {
            dom.agentEditPanel.classList.add('hidden');
            dom.editTeamBtn.classList.remove('hidden');
        });
    }
}

async function handlePhaseInteraction(event) {
    const button = event.target.closest('.chat-send-btn');
    const input = button ? button.previousElementSibling : (event.target.tagName === 'INPUT' ? event.target : null);
    if (!input || (event.type === 'keyup' && event.key !== 'Enter')) return;

    const query = input.value.trim();
    if (!query) return;

    const phase = input.dataset.phase;
    const chatLogContainer = document.querySelector(`#${phase}-chat-log`);
    if (!chatLogContainer) { return; }

    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'p-3 rounded-lg bg-indigo-600 ml-auto text-right max-w-lg';
    userMsgDiv.textContent = query;
    chatLogContainer.appendChild(userMsgDiv);
    chatLogContainer.scrollTop = chatLogContainer.scrollHeight;
    input.value = '';

    let context = ''; 
    let agentForTask = 'collaborator';
    const collectedData = currentSimulationState.collectedData; // Use shared state

    if (phase === 'empathize') { 
        agentForTask = 'anthropologist'; 
        context = `Persona: ${collectedData.persona?.name}, Frustrations: ${collectedData.persona?.frustrations.join(', ')}`; 
    } else if (phase === 'define') { 
        agentForTask = 'director'; 
        context = `Problem Statement: ${collectedData.problemStatement}`; 
    } else if (phase === 'ideate') { 
        agentForTask = 'experience-architect'; // This might need adjustment based on who actually answers chat in ideate
        context = `Winning Concept: ${collectedData.winningConcept?.idea}`; 
    }
    // Add more phases as needed for chat interaction

    const prompt = `You are the ${agentForTask} agent. A user is interacting with you. Context: ${context}. User's request: "${query}". Provide a helpful, concise response.`;

    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'p-3 rounded-lg bg-gray-700 mr-auto max-w-lg flex items-center space-x-2';
    const agentData = agents.find(a => a.id === agentForTask) || {};
    thinkingDiv.innerHTML = `<span class="text-xl">${agentData.avatar}</span><span>Thinking...</span>`;
    chatLogContainer.appendChild(thinkingDiv);
    chatLogContainer.scrollTop = chatLogContainer.scrollHeight;
    
    const aiResponse = await callGemini(prompt);
    thinkingDiv.innerHTML = `<span class="text-xl">${agentData.avatar}</span><span>${aiResponse.replace(/\n/g, '<br>')}</span>`;
    chatLogContainer.scrollTop = chatLogContainer.scrollHeight;
}
