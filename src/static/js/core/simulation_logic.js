// src/js/core/simulation_logic.js

import { agents } from '../config/agents.js';
import { phases, simulationFlow } from '../config/simulationFlow.js';
import { getCollectedData, updateCollectedData, resetCollectedData } from '../state/appState.js';
import { dom } from '../ui/domElements.js';
import { switchView } from '../ui/viewManager.js';
import * as renderers from '../ui/renderers.js';
import { callGemini, saveDesignChallenge, generateImage } from './api.js';

let simInterval;
let scriptIndex = 0;
let isPaused = false;
let currentPhase = 'empathize';

export async function startSimulation() {
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
    
    // Log for debugging
    console.log(`Script Index: ${scriptIndex}`);
    console.log(`Current Step Type: ${step.type}`);
    console.log(`Current Step Agent: ${step.agent}`);
    console.log(`Active Agents: ${activeAgents}`);
    console.log(`Is director: ${step.agent === 'director'}`);
    console.log(`Should skip: ${step.agent && !activeAgents.includes(step.agent) && step.agent !== 'director'}`);

    if (step.agent && !activeAgents.includes(step.agent) && step.agent !== 'director') {
        scriptIndex++;
        processScriptStep();
        return;
    }
    
    const challenge = dom.designChallengeTextarea.value;
    const agentName = step.agent ? agents.find(a => a.id === step.agent).name : '';

    switch (step.type) {
        case 'phase_marker':
            console.log(`Processing phase_marker: ${phases[step.phase]}`);
            renderers.addMessageToFeed(null, `Entering ${phases[step.phase]} Phase`, 'phase_marker');
            updateMissionControlPhase(step.phase);
            break;
        case 'phase':
            console.log(`Processing phase: ${phases[step.phase]}`);
            currentPhase = step.phase;
            switchView(`${phases[currentPhase].toLowerCase().replace(/ & /g, '-').replace(' ', '-')}-view`);
            break;
        case 'msg':
            console.log(`Processing msg from ${step.agent}`);
            const content = typeof step.content === 'function' ? step.content(challenge, getCollectedData()) : step.content;
            renderers.addMessageToFeed(step.agent, content, step.thought ? 'thought' : 'msg');
            break;
        case 'gate':
            console.log('Processing gate');
            stopInterval();
            isPaused = true; // Explicitly set paused state
            dom.pauseBtn.innerHTML = '<i class="fas fa-play"></i>'; // Show play icon
            dom.statusEl.textContent = 'Paused';
            dom.statusEl.className = 'font-semibold text-yellow-400';
            renderers.renderMissionControlPhaseActions(); // Render the new button
            break;
        case 'call_gemini':
            console.log(`Processing call_gemini for task: ${step.task} by agent: ${step.agent}`);
            await handleGeminiCall(step, agentName, challenge);
            break;
        case 'end':
            console.log('Processing end');
            stopSimulation();
            dom.statusEl.textContent = 'Completed';
            dom.statusEl.className = 'font-semibold text-green-400';
            break;
    }

    scriptIndex++;
}

export function advanceToNextPhase() {
    isPaused = false; // Set to not paused when continuing
    dom.pauseBtn.innerHTML = '<i class="fas fa-pause"></i>'; // Show pause icon again
    dom.statusEl.textContent = 'Running...';
    dom.statusEl.className = 'font-semibold text-blue-400';
    
    // Immediately process the next step after the gate
    processScriptStep();
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
            console.log('Generating persona. Current collected data:', data);
            prompt = `You are the ${agentName}. Based on research for the challenge "${challenge}", create a single user persona. Respond in JSON format with fields: "name" (string), "bio" (string, 1-2 sentences), "goals" (array of 3 strings), "frustrations" (array of 3 strings), and "image_prompt" (string, a concise description for image generation, e.g., "A young woman working on a laptop in a cafe, natural lighting").`;
            break;
        case 'generate_quotes':
            console.log('Generating quotes. Current collected data:', data);
            if (!data.personas || data.personas.length === 0) {
                const skipMsg = 'Skipping quotes, no persona available in collected data.';
                renderers.addMessageToFeed(step.agent, skipMsg, 'thought', true);
                console.warn(skipMsg); 
                return; 
            }
            // Use the last generated persona for quotes
            const latestPersonaForQuotes = data.personas[data.personas.length - 1];
            prompt = `You are the ${agentName}. To give life to our persona, ${latestPersonaForQuotes.name}, write 3 powerful, emotive quotes that capture their key frustrations related to "${challenge}". Respond in a JSON array of strings.`;
            break;
         case 'generate_hmw':
            console.log('Generating HMW. Current collected data:', data);
            if (!data.personas || data.personas.length === 0) {
                const skipMsg = 'Skipping HMWs, no persona available in collected data.';
                renderers.addMessageToFeed(step.agent, skipMsg, 'thought', true);
                console.warn(skipMsg); 
                return; 
            }
            // Use the last generated persona for HMWs
            const latestPersonaForHMW = data.personas[data.personas.length - 1];
            prompt = `You are the ${agentName}. Based on our persona's frustrations (${latestPersonaForHMW.frustrations.join(', ')}), generate 3 "How Might We..." questions. Respond in a JSON array of strings.`;
            break;
        case 'generate_pov':
            if (!data.pov) { renderers.addMessageToFeed(step.agent, 'Skipping POV, no POV available.', 'msg', true); return; }
            prompt = `You are the ${agentName}. Synthesize the persona (${data.pov.name}, who feels "${data.pov.frustrations.join(', ')}") into a Point of View statement. Respond in JSON with keys "user", "need", "insight".`;
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
    
    renderers.addMessageToFeed(step.agent, `Prompting Gemini with: <pre>${prompt}</pre>`, 'thought', true); // Display prompt
    const response = await callGemini(prompt, step.task.includes('generate') || step.task.includes('define') || step.task.includes('evaluate') || step.task.includes('select') || step.task.includes('refine'));
    renderers.addMessageToFeed(step.agent, `Gemini responded with: <pre>${JSON.stringify(response, null, 2)}</pre>`, 'thought', true); // Display raw response

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
            let dataToStore = response.statement ? response.statement : response;
            
            // Special handling for persona to generate image
            if (step.task === 'generate_persona' && response.image_prompt) {
                const imageUrl = await generateImage(response.image_prompt);
                if (imageUrl) {
                    dataToStore = { ...response, imageUrl };
                } else {
                    console.warn("Image generation failed for persona.", response);
                }
            }
            console.log(`Updating collected data for ${stateKey}:`, dataToStore);
            updateCollectedData(stateKey, dataToStore);
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
            case 'generate_persona':
                // For persona, we render the individual persona as it's added to the array
                renderer = renderers['renderPersona'];
                // Pass the single, newly generated persona object
                if (stateKey === 'persona' && dataToStore) {
                    renderers.renderPersona(dataToStore);
                } else {
                     console.log(`No specific renderer for ${step.task}, adding raw response to feed.`);
                     renderers.addMessageToFeed(step.agent, response, 'msg', true);
                }
                return; // Return here as renderPersona is called directly
            default:
                // Fallback for other tasks if they follow a consistent naming convention
                renderer = renderers[`render${step.task.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('').replace('Generate', '').replace('Define', '').replace('Select', '').replace('Evaluate', '')}`];
                break;
        }

        if (renderer) {
            console.log(`Rendering ${step.task} with response:`, response);
            renderer(response.statement ? response.statement : response);
            renderers.addMessageToFeed(step.agent, `I've completed my task. Check the whiteboard.`, 'msg', true);
        } else {
             console.log(`No specific renderer for ${step.task}, adding raw response to feed.`);
             renderers.addMessageToFeed(step.agent, response, 'msg', true);
        }
    } else {
        console.error(`Gemini call for ${step.task} returned no response or an error.`);
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
    
    // Clear carousel track and indicators on reset
    if (dom.personaCarouselTrack) dom.personaCarouselTrack.innerHTML = '';
    if (dom.personaCarouselIndicators) dom.personaCarouselIndicators.innerHTML = '';
    
    renderers.renderAgents();
    dom.startBtn.disabled = false;
    dom.statusEl.textContent = 'Idle';

    switchView('mission-control-view');
}

function updateMissionControlPhase(phaseKey) {
    dom.missionControlPhase.textContent = phases[phaseKey];
}
