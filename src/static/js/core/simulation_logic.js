// src/js/core/simulation_logic.js

import { agents } from '../config/agents.js';
import { phases, simulationFlow } from '../config/simulationFlow.js';
import { getCollectedData, updateCollectedData, resetCollectedData } from '../state/appState.js';
import { dom } from '../ui/domElements.js';
import { switchView } from '../ui/viewManager.js';
import * as renderers from '../ui/renderers.js';
import { callGemini, saveDesignChallenge } from './api.js';

let simInterval;
let scriptIndex = 0;
let isPaused = false;
let currentPhase = 'empathize';

export async function startSimulation() {
    renderers.addMessageToFeed(null, 'Attempting to start simulation...', 'msg'); // Added for debugging
    const challengeText = dom.designChallengeTextarea.value.trim();
    if (challengeText === '') {
        alert("Please provide a design challenge before starting.");
        return;
    }

    await saveDesignChallenge(challengeText);

    resetSimulation(true);
    dom.startBtn.disabled = true;
    dom.pauseBtn.disabled = false;
    isPaused = false;
    dom.statusEl.textContent = 'Running...';
    dom.statusEl.className = 'font-semibold text-blue-400';
    startInterval();
}

function startInterval() {
    const speed = (6 - dom.speedSlider.value) * 1200;
    simInterval = setInterval(processScriptStep, speed);
}

function stopInterval() {
    clearInterval(simInterval);
}

export function pauseSimulation() {
    isPaused = !isPaused;
    if (isPaused) {
        stopInterval();
        dom.pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        dom.statusEl.textContent = 'Paused';
        dom.statusEl.className = 'font-semibold text-yellow-400';
    } else {
        dom.statusEl.textContent = 'Running...';
        dom.statusEl.className = 'font-semibold text-blue-400';
        startInterval();
        dom.pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
}

async function processScriptStep() {
    if (isPaused || scriptIndex >= simulationFlow.length) {
        if (scriptIndex >= simulationFlow.length) stopSimulation();
        return;
    }

    const step = simulationFlow[scriptIndex];
    const activeAgents = Array.from(document.querySelectorAll('.agent-toggle:checked')).map(el => el.value);
    
    if (step.agent && !activeAgents.includes(step.agent) && step.agent !== 'director') {
        scriptIndex++;
        processScriptStep();
        return;
    }
    
    const challenge = dom.designChallengeTextarea.value;
    const agentName = step.agent ? agents.find(a => a.id === step.agent).name : '';

    switch (step.type) {
        case 'phase_marker':
            renderers.addMessageToFeed(null, `Entering ${phases[step.phase]} Phase`, 'phase_marker');
            updateMissionControlPhase(step.phase);
            break;
        case 'phase':
            currentPhase = step.phase;
            switchView(`${phases[currentPhase].toLowerCase().replace(/ & /g, '-').replace(' ', '-')}-view`);
            break;
        case 'msg':
            const content = typeof step.content === 'function' ? step.content(challenge, getCollectedData()) : step.content;
            renderers.addMessageToFeed(step.agent, content, step.thought ? 'thought' : 'msg');
            break;
        case 'gate':
            stopInterval();
            renderers.renderPhaseActions(currentPhase);
            break;
        case 'call_gemini':
            await handleGeminiCall(step, agentName, challenge);
            break;
        case 'end':
            stopSimulation();
            dom.statusEl.textContent = 'Completed';
            dom.statusEl.className = 'font-semibold text-green-400';
            break;
    }

    scriptIndex++;
}

export function advanceToNextPhase() {
    startInterval();
}

export function refreshCurrentPhase() {
    const phaseStartIndex = simulationFlow.findIndex(step => step.type === 'phase' && step.phase === currentPhase);
    scriptIndex = phaseStartIndex;
    
    // Clear the whiteboard for the current phase
    const view = document.getElementById(`${phases[currentPhase].toLowerCase().replace(/ & /g, '-').replace(' ', '-')}-view`);
    if (view) {
        const whiteboard = view.querySelector('.whiteboard-grid');
        if (whiteboard) {
            whiteboard.innerHTML = '';
        }
    }

    startInterval();
}

function stopSimulation() {
    stopInterval();
    dom.startBtn.disabled = true;
    dom.pauseBtn.disabled = true;
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

        let renderer;
        switch (step.task) {
            case 'generate_hmw':
                renderer = renderers['renderHMWs'];
                break;
            case 'generate_metrics':
                renderer = renderers['renderSuccessMetrics'];
                break;
            case 'refine_hmw':
                renderer = renderers['renderRefinedHMWs'];
                break;
            case 'generate_pov':
                renderer = renderers['renderPOV'];
                break;
            case 'define_scope':
                renderer = renderers['renderScope'];
                break;
            case 'generate_problem_statement':
                renderer = renderers['renderProblemStatement'];
                break;
            case 'analogous_brainstorm':
                renderer = renderers['renderAnalogousBrainstorm'];
                break;
            case 'evaluate_effort_impact':
                renderer = renderers['renderEffortImpactMatrix'];
                break;
            case 'select_winning_concept':
                renderer = renderers['renderWinningConcept'];
                break;
            default:
                // Fallback for other tasks if they follow a consistent naming convention
                renderer = renderers[`render${step.task.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('').replace('Generate', '').replace('Define', '').replace('Select', '').replace('Evaluate', '')}`];
                break;
        }

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

export function resetSimulation(keepChallenge = false) {
    stopInterval();
    scriptIndex = 0;
    isPaused = false;
    if (dom.pauseBtn) {
        dom.pauseBtn.disabled = true;
        dom.pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
    
    currentPhase = 'empathize';
    resetCollectedData();
    
    if (dom.feedEl) dom.feedEl.innerHTML = `<div class="text-center text-gray-500"><p>Simulation reset. Ready to begin.</p></div>`;
    if (!keepChallenge) dom.designChallengeTextarea.value = '';

    document.querySelectorAll('.whiteboard-grid > div').forEach(el => {
        el.innerHTML = '';
        el.classList.add('hidden');
        el.style.gridColumn = '';
    });
    
    renderers.renderAgents();
    dom.startBtn.disabled = false;
    dom.statusEl.textContent = 'Idle';

    switchView('mission-control-view');
}

function updateMissionControlPhase(phaseKey) {
    dom.missionControlPhase.textContent = phases[phaseKey];
}
