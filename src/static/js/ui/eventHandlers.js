// src/js/ui/eventHandlers.js

import { dom } from './domElements.js';
import { switchView } from './viewManager.js';
import { startSimulation, pauseSimulation, resetSimulation } from '../core/simulation.js';
import { callGemini } from '../core/api.js';
import { getCollectedData } from '../state/appState.js';
import { agents } from '../config/agents.js';

/**
 * Sets up all the event listeners for the application.
 */
export function initializeEventListeners() {
    dom.generateChallengeBtn.addEventListener('click', handleGenerateChallenge);
            
    document.querySelectorAll('.chat-send-btn').forEach(btn => btn.addEventListener('click', handlePhaseInteraction));
    document.querySelectorAll('.chat-input').forEach(input => {
        input.addEventListener('keyup', (e) => { if (e.key === 'Enter') handlePhaseInteraction(e); });
    });

    for (const phaseKey of ['empathize', 'define', 'ideate', 'prototype', 'finalize']) {
        const toggle = dom[`${phaseKey}ChatToggle`];
        const container = dom[`${phaseKey}ChatContainer`];
        if (toggle && container) {
            toggle.addEventListener('click', () => container.classList.toggle('hidden'));
        }
    }

    dom.mainNav.addEventListener('click', (e) => {
        const link = e.target.closest('.nav-link');
        if (link) { e.preventDefault(); switchView(link.getAttribute('data-view')); }
    });
    dom.startBtn.addEventListener('click', startSimulation);
    dom.pauseBtn.addEventListener('click', pauseSimulation);
    dom.resetBtn.addEventListener('click', () => resetSimulation(false));
    dom.confirmTeamBtn.addEventListener('click', () => {
        dom.agentEditPanel.classList.add('hidden');
        dom.editTeamBtn.classList.remove('hidden');
    });
    dom.editTeamBtn.addEventListener('click', () => {
        dom.agentEditPanel.classList.remove('hidden');
        dom.editTeamBtn.classList.add('hidden');
    });
}

/**
 * Handles the "Generate" button click to create a new design challenge.
 */
export async function handleGenerateChallenge() {
    const keyword = dom.designChallengeTextarea.value.trim();
    if (!keyword) {
        alert("Please enter a keyword first (e.g., 'sustainable packaging').");
        return;
    }
    const prompt = `You are a design thinking facilitator. Expand the following keyword into a rich, detailed, and inspiring design challenge for a creative team. Make it specific and actionable. KEYWORD: "${keyword}"`;
    dom.designChallengeTextarea.value = "Generating challenge with AI...";
    dom.designChallengeTextarea.disabled = true;
    const result = await callGemini(prompt);
    dom.designChallengeTextarea.value = result;
    dom.designChallengeTextarea.disabled = false;
}

/**
 * Handles sending a message from any of the phase chat inputs.
 * @param {Event} event - The click or keyup event.
 */
export async function handlePhaseInteraction(event) {
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
    const collectedData = getCollectedData();

    if (phase === 'empathize') { 
        agentForTask = 'anthropologist'; 
        context = `Persona: ${collectedData.persona?.name}, Frustrations: ${collectedData.persona?.frustrations.join(', ')}`; 
    } else if (phase === 'define') { 
        agentForTask = 'director'; 
        context = `Problem Statement: ${collectedData.problemStatement}`; 
    } else if (phase === 'ideate') { 
        agentForTask = 'experience-architect'; 
        context = `Winning Concept: ${collectedData.winningConcept?.idea}`; 
    }

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
