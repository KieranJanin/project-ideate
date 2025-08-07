// src/js/core/directed_logic.js

import { agents } from '../config/agents.js';
import { phases } from '../config/simulationFlow.js';
import { getCollectedData, updateCollectedData, resetCollectedData } from '../state/appState.js';
import { dom } from '../ui/domElements.js';
import { switchView } from '../ui/viewManager.js';
import * as renderers from '../ui/renderers.js';
import { callGemini, saveDesignChallenge } from './api.js';

let currentPhase = 'empathize';
let availableTasks = [];

export async function startDirectedWorkflow() {
    const challengeText = dom.designChallengeTextarea.value.trim();
    if (challengeText === '') {
        alert("Please provide a design challenge before starting.");
        return;
    }

    await saveDesignChallenge(challengeText);

    resetDirectedWorkflow(true);
    dom.startBtn.disabled = true;
    dom.statusEl.textContent = 'In Progress';
    dom.statusEl.className = 'font-semibold text-blue-400';
    
    renderers.addMessageToFeed(null, `Starting the design thinking process.`, 'phase_marker');
    updateAvailableTasks();
    renderActionButtons();
}

function updateAvailableTasks() {
    const data = getCollectedData();
    availableTasks = [];

    switch (currentPhase) {
        case 'empathize':
            if (!data.persona) availableTasks.push({ agent: 'anthropologist', task: 'generate_persona' });
            if (data.persona && !data.quotes) availableTasks.push({ agent: 'anthropologist', task: 'generate_quotes' });
            if (data.persona && !data.hmw) availableTasks.push({ agent: 'anthropologist', task: 'generate_hmw' });
            break;
        case 'define':
            if (data.persona && !data.pov) availableTasks.push({ agent: 'director', task: 'generate_pov' });
            if (data.pov && !data.metrics) availableTasks.push({ agent: 'director', task: 'generate_metrics' });
            if (!data.scope) availableTasks.push({ agent: 'director', task: 'define_scope' });
            if (data.pov && !data.problemStatement) availableTasks.push({ agent: 'director', task: 'generate_problem_statement' });
            if (data.problemStatement && data.hmw && !data.refinedHmw) availableTasks.push({ agent: 'director', task: 'refine_hmw' });
            break;
        case 'ideate':
            if (data.refinedHmw && !data.ideas) availableTasks.push({ agent: 'cross_pollinator', task: 'analogous_brainstorm' });
            if (data.ideas && !data.evaluatedIdeas) availableTasks.push({ agent: 'collaborator', task: 'evaluate_effort_impact' });
            if (data.evaluatedIdeas && !data.winningConcept) availableTasks.push({ agent: 'director', task: 'select_winning_concept' });
            break;
        case 'prototype':
            if (data.winningConcept && !data.obstacles) availableTasks.push({ agent: 'hurdler', task: 'analyze_obstacles' });
            break;
        case 'finalize':
            if (data.winningConcept && !data.finalPitch) availableTasks.push({ agent: 'storyteller', task: 'finalize' });
            break;
    }

    if (availableTasks.length === 0) {
        dom.nextPhaseBtn.classList.remove('hidden');
    }
}

export function advancePhase() {
    const phaseKeys = Object.keys(phases);
    const currentPhaseIndex = phaseKeys.indexOf(currentPhase);

    if (currentPhaseIndex < phaseKeys.length - 1) {
        currentPhase = phaseKeys[currentPhaseIndex + 1];
        renderers.addMessageToFeed(null, `Entering ${phases[currentPhase]} Phase`, 'phase_marker');
        updateMissionControlPhase(currentPhase);
        switchView(`${phases[currentPhase].toLowerCase().replace(/ & /g, '-').replace(' ', '-')}-view`);
        updateAvailableTasks();
        renderActionButtons();
        dom.nextPhaseBtn.classList.add('hidden');
    } else {
        renderers.addMessageToFeed(null, 'Design thinking process complete!', 'phase_marker');
        dom.actionHub.classList.add('hidden');
        dom.statusEl.textContent = 'Completed';
        dom.statusEl.className = 'font-semibold text-green-400';
    }
}

function renderActionButtons() {
    dom.agentActionButtons.innerHTML = '';
    const activeAgents = Array.from(document.querySelectorAll('.agent-toggle:checked')).map(el => el.value);

    availableTasks.forEach(task => {
        if (activeAgents.includes(task.agent)) {
            const agent = agents.find(a => a.id === task.agent);
            const button = document.createElement('button');
            button.className = 'agent-action-btn bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full flex items-center justify-center transition';
            button.dataset.agent = task.agent;
            button.dataset.task = task.task;
            button.innerHTML = `<span class="text-2xl">${agent.avatar}</span>`;
            dom.agentActionButtons.appendChild(button);
        }
    });

    if (dom.agentActionButtons.children.length > 0) {
        dom.actionHub.classList.remove('hidden');
    } else {
        dom.actionHub.classList.add('hidden');
    }
}

export async function executeTask(agentId, taskId) {
    const challenge = dom.designChallengeTextarea.value;
    const agent = agents.find(a => a.id === agentId);

    await handleGeminiCall({ agent: agentId, task: taskId }, agent.name, challenge);

    updateAvailableTasks();
    renderActionButtons();
}

async function handleGeminiCall(step, agentName, challenge) {
    renderers.addMessageToFeed(step.agent, 'Thinking...', 'thought');
    const data = getCollectedData();
    let prompt = '';
    
    // Build prompt based on task
    switch (step.task) {
        case 'generate_persona':
            prompt = `You are the ${agentName}. Based on research for the challenge "${challenge}", create a single user persona. Respond in JSON format with fields: "name" (string), "bio" (string, 1-2 sentences), "goals" (array of 3 strings), and "frustrations" (array of 3 strings).`;
            break;
        case 'generate_quotes':
            if (!data.persona) { renderers.addMessageToFeed(step.agent, 'Skipping quotes, no persona available.', 'msg', true); return; }
            prompt = `You are the ${agentName}. To give life to our persona, ${data.persona.name}, write 3 powerful, emotive quotes that capture their key frustrations related to "${challenge}". Respond in a JSON array of strings.`;
            break;
         case 'generate_hmw':
            if (!data.persona) { renderers.addMessageToFeed(step.agent, 'Skipping HMWs, no persona available.', 'msg', true); return; }
            prompt = `You are the ${agentName}. Based on our persona's frustrations (${data.persona.frustrations.join(', ')}), generate 3 "How Might We..." questions. Respond in a JSON array of strings.`;
            break;
        case 'generate_pov':
            if (!data.persona) { renderers.addMessageToFeed(step.agent, 'Skipping POV, no persona available.', 'msg', true); return; }
            prompt = `You are the ${agentName}. Synthesize the persona (${data.persona.name}, who feels "${data.persona.frustrations.join(', ')}") into a Point of View statement. Respond in JSON with keys "user", "need", "insight".`;
            break;
        case 'generate_metrics':
            if (!data.pov) { renderers.addMessageToFeed(step.agent, 'Skipping metrics, no POV available.', 'msg', true); return; }
            prompt = `You are the ${agentName}. Based on our POV ("${data.pov.need}"), define 3 clear success metrics. Respond in a JSON array of strings.`;
            break;
        case 'define_scope':
            prompt = `You are the ${agentName}. For the challenge "${challenge}", define the project scope. Respond in JSON with keys "in_scope" (array of 3 strings) and "out_of_scope" (array of 3 strings).`;
            break;
        case 'generate_problem_statement':
            if (!data.pov) { renderers.addMessageToFeed(step.agent, 'Skipping problem statement, no POV available.', 'msg', true); return; }
            prompt = `You are the ${agentName}. Synthesize the POV ("${data.pov.user} needs ${data.pov.need} because ${data.pov.insight}") into a single, concise, and actionable problem statement. Respond with a single string in JSON: {"statement": "..."}`;
            break;
        case 'refine_hmw':
            if (!data.problemStatement || !data.hmw) { renderers.addMessageToFeed(step.agent, 'Skipping refined HMWs, problem or initial HMWs not available.', 'msg', true); return; }
            prompt = `You are the ${agentName}. Based on our final problem statement: "${data.problemStatement}", refine our initial 'How Might We' questions: "${data.hmw.join('; ')}" into a new, more focused set of 2-3 HMWs that will directly guide our brainstorming. Respond in a JSON array of strings.`;
            break;
        case 'analogous_brainstorm':
            if (!data.refinedHmw || data.refinedHmw.length === 0) { renderers.addMessageToFeed(step.agent, 'Skipping brainstorm, no refined HMWs.', 'msg', true); break; }
            prompt = `You are the ${agentName}. For the HMWs: "${data.refinedHmw.join('; ')}", generate 8 diverse ideas based on analogous inspiration from other industries. Respond in a JSON array of strings.`;
            break;
        case 'evaluate_effort_impact':
            if (!data.ideas) { renderers.addMessageToFeed(step.agent, 'Skipping evaluation, no ideas available.', 'msg', true); break; }
            prompt = `You are the ${agentName}. Evaluate these ideas: [${data.ideas.map(i => `"${i}"`).join(', ')}]. For each, assess its effort and impact. Respond with a JSON array of objects, each with keys "idea" (string), "effort" ("Low" or "High"), and "impact" ("Low" or "High").`;
            break;
        case 'select_winning_concept':
            if (!data.evaluatedIdeas) { renderers.addMessageToFeed(step.agent, 'Skipping selection, no evaluated ideas.', 'msg', true); break; }
            prompt = `You are the ${agentName}. From this list of evaluated ideas: ${JSON.stringify(data.evaluatedIdeas)}, select the single best concept to prototype. Prioritize "High Impact, Low Effort", then "High Impact, High Effort". Also, state its single riskiest assumption. Respond in JSON with keys "idea" (string) and "riskiest_assumption" (string).`;
            break;
        case 'analyze_obstacles':
            if (!data.winningConcept) { renderers.addMessageToFeed(step.agent, 'Skipping obstacle analysis, no winning concept.', 'msg', true); break; }
            prompt = `You are the ${agentName}. What are the top obstacles for our chosen concept: "${data.winningConcept.idea}"?`;
            break;
        case 'finalize':
            if (!data.winningConcept) { renderers.addMessageToFeed(step.agent, 'Skipping final pitch, no winning concept.', 'msg', true); break; }
            prompt = `You are the ${agentName}. Craft a final pitch for our solution concept: "${data.winningConcept.idea}".`;
            break;
    }
    
    const response = await callGemini(prompt, step.task.includes('generate') || step.task.includes('define') || step.task.includes('evaluate') || step.task.includes('select') || step.task.includes('refine'));
    
    // Process response
    if (response) {
        const keyMap = {
            generate_persona: 'persona',
            generate_quotes: 'quotes',
            generate_hmw: 'hmw', 
            generate_pov: 'pov',
            generate_metrics: 'metrics',
            define_scope: 'scope',
            generate_problem_statement: 'problemStatement',
            refine_hmw: 'refinedHmw',
            analogous_brainstorm: 'ideas',
            evaluate_effort_impact: 'evaluatedIdeas',
            select_winning_concept: 'winningConcept',
            analyze_obstacles: 'obstacles',
            finalize: 'finalPitch'
        };
        const stateKey = keyMap[step.task];
        if(stateKey) {
            updateCollectedData(stateKey, response.statement ? response.statement : response);
        }

        const rendererMap = {
            generate_persona: renderers.renderPersona,
            generate_quotes: renderers.renderKeyQuotes,
            generate_hmw: renderers.renderHMWs,
            generate_pov: renderers.renderPOV,
            generate_metrics: renderers.renderSuccessMetrics,
            define_scope: renderers.renderScope,
            generate_problem_statement: renderers.renderProblemStatement,
            refine_hmw: renderers.renderRefinedHMWs,
            analogous_brainstorm: renderers.renderAnalogousBrainstorm,
            evaluate_effort_impact: renderers.renderEffortImpactMatrix,
            select_winning_concept: renderers.renderWinningConcept,
        };

        const renderer = rendererMap[step.task];

        if (renderer) {
            renderer(response.statement ? response.statement : response);
            renderers.addMessageToFeed(step.agent, `I've completed my task. Check the whiteboard.`, 'msg', true);
        } else {
             renderers.addMessageToFeed(step.agent, response, 'msg', true);
        }
    } else {
        renderers.addMessageToFeed(step.agent, "I encountered a problem with my task and couldn't complete it.", 'msg', true);
    }
}

export function resetDirectedWorkflow(keepChallenge = false) {
    currentPhase = 'empathize';
    availableTasks = [];
    resetCollectedData();
    
    if (dom.feedEl) dom.feedEl.innerHTML = `<div class="text-center text-gray-500"><p>Workflow reset. Ready to begin.</p></div>`;
    if (!keepChallenge) dom.designChallengeTextarea.value = '';

    document.querySelectorAll('.whiteboard-grid > div').forEach(el => {
        el.innerHTML = '';
        el.classList.add('hidden');
        el.style.gridColumn = '';
    });
    
    renderers.renderAgents();
    dom.startBtn.disabled = false;
    dom.statusEl.textContent = 'Idle';
    dom.actionHub.classList.add('hidden');
    dom.nextPhaseBtn.classList.add('hidden');
    switchView('mission-control-view');
}

function updateMissionControlPhase(phaseKey) {
    dom.missionControlPhase.textContent = phases[phaseKey];
}
