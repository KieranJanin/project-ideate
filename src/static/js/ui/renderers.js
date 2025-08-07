// src/js/ui/renderers.js
import { dom } from './domElements.js';
import { agents } from '../config/agents.js';

// --- AGENT & FEED RENDERERS ---
export function renderAgents() {
    const groupedAgents = agents.reduce((acc, agent) => {
        acc[agent.category] = acc[agent.category] || [];
        acc[agent.category].push(agent);
        return acc;
    }, {});

    dom.agentListContainer.innerHTML = '';
    for (const category in groupedAgents) {
        const categoryDiv = document.createElement('div');
        categoryDiv.innerHTML = `<h3 class="text-md font-semibold text-gray-400 mb-2">${category} Personas</h3>`;
        const ul = document.createElement('ul');
        ul.className = 'space-y-3';
        groupedAgents[category].forEach(agent => {
            const li = document.createElement('li');
            li.className = 'flex items-center justify-between bg-gray-700/50 p-3 rounded-md';
            li.innerHTML = `
                <div class="flex items-center">
                    <div class="agent-avatar" style="background-color: ${agent.color};">${agent.avatar}</div>
                    <div class="ml-3">
                        <p class="font-semibold text-white">${agent.name}</p>
                        <p class="text-xs text-gray-400">${agent.role}</p>
                    </div>
                </div>
                <label class="switch">
                    <input type="checkbox" class="agent-toggle" value="${agent.id}" checked>
                    <span class="slider round"></span>
                </label>
            `;
            ul.appendChild(li);
        });
        categoryDiv.appendChild(ul);
        dom.agentListContainer.appendChild(categoryDiv);
    }
}

export function addMessageToFeed(agentId, content, type = 'msg', isAI = false) {
    const msgDiv = document.createElement('div');
    const agent = agentId ? agents.find(a => a.id === agentId) : null;

    let html = '';
    switch (type) {
        case 'phase_marker':
            html = `<div class="text-center my-4"><p class="text-sm font-semibold text-purple-400 bg-purple-900/50 rounded-full py-1 px-4 inline-block">${content}</p></div>`;
            break;
        case 'thought':
            html = `
                <div class="flex items-start gap-3">
                    <div class="agent-avatar text-2xl" style="background-color: ${agent.color};">${agent.avatar}</div>
                    <div class="bg-gray-700 p-4 rounded-lg rounded-tl-none">
                        <p class="text-sm text-gray-300 italic">${content}</p>
                    </div>
                </div>`;
            break;
        case 'msg':
        default:
            const bgColor = isAI ? 'bg-gray-700' : 'bg-indigo-600';
            const alignment = isAI ? 'items-start' : 'items-end';
            const rounded = isAI ? 'rounded-tl-none' : 'rounded-tr-none';
            const avatar = agent ? `<div class="agent-avatar text-2xl" style="background-color: ${agent.color};">${agent.avatar}</div>` : '';
            html = `
                <div class="flex ${alignment} gap-3">
                    ${isAI ? avatar : ''}
                    <div class="${bgColor} p-4 rounded-lg ${rounded}">
                        <p class="text-sm">${content}</p>
                    </div>
                    ${!isAI ? avatar : ''}
                </div>`;
            break;
    }
    msgDiv.innerHTML = html;
    dom.feedEl.appendChild(msgDiv);
    dom.feedEl.scrollTop = dom.feedEl.scrollHeight;
}

// --- WHITEBOARD RENDERERS ---

function createWhiteboardCard(title, content, container) {
    container.innerHTML = `
        <div class="bg-gray-800 p-4 rounded-lg h-full flex flex-col">
            <h4 class="font-semibold text-white mb-3">${title}</h4>
            <div class="text-sm text-gray-300 space-y-2 flex-grow">${content}</div>
        </div>
    `;
    container.classList.remove('hidden');
    container.style.gridColumn = '';
}

export function renderPhaseActions(phase) {
    const container = document.querySelector(`#${phase}-view .phase-actions`);
    if (container) {
        container.innerHTML = `
            <div class="flex justify-end gap-4">
                <button class="phase-action-btn refresh-phase-btn" data-phase="${phase}">Refresh Phase</button>
                <button class="phase-action-btn next-phase-btn" data-phase="${phase}">Next Phase</button>
            </div>
        `;
    }
}

export function renderPersona(persona) {
    const content = `
        <p class="text-lg font-bold text-yellow-300">${persona.name}</p>
        <p class="italic">"${persona.bio}"</p>
        <div class="mt-2">
            <p class="font-semibold">Goals:</p>
            <ul class="list-disc list-inside">
                ${persona.goals.map(g => `<li>${g}</li>`).join('')}
            </ul>
        </div>
        <div class="mt-2">
            <p class="font-semibold">Frustrations:</p>
            <ul class="list-disc list-inside">
                ${persona.frustrations.map(f => `<li>${f}</li>`).join('')}
            </ul>
        </div>
    `;
    createWhiteboardCard('❤️ User Persona', content, dom.personaContainer);
}

export function renderKeyQuotes(quotes) {
    const content = quotes.map(q => `<p class="border-l-4 border-yellow-500 pl-3 italic">"${q}"</p>`).join('');
    createWhiteboardCard('❤️ Key Quotes', content, dom.keyQuotesContainer);
}

export function renderHMWs(hmws) {
    const content = hmws.map(h => `<p>${h}</p>`).join('');
    createWhiteboardCard('❤️ How Might We...', content, dom.hmwContainer);
}

export function renderPOV(pov) {
    const content = `
        <p><span class="font-bold text-blue-300">${pov.user}</span> needs <span class="font-bold text-blue-300">${pov.need}</span> because <span class="font-bold text-blue-300">${pov.insight}</span>.</p>
    `;
    createWhiteboardCard('🎯 Point of View', content, dom.povStatementContainer);
}

export function renderSuccessMetrics(metrics) {
    const content = `<ul class="list-disc list-inside">${metrics.map(m => `<li>${m}</li>`).join('')}</ul>`;
    createWhiteboardCard('🎯 Success Metrics', content, dom.successMetricsContainer);
}

export function renderScope(scope) {
    const content = `
        <div>
            <p class="font-semibold text-green-400">In Scope:</p>
            <ul class="list-disc list-inside">${scope.in_scope.map(s => `<li>${s}</li>`).join('')}</ul>
        </div>
        <div>
            <p class="font-semibold text-red-400">Out of Scope:</p>
            <ul class="list-disc list-inside">${scope.out_of_scope.map(s => `<li>${s}</li>`).join('')}</ul>
        </div>
    `;
    createWhiteboardCard('🎯 Project Scope', content, dom.scopeContainer);
}

export function renderProblemStatement(statement) {
    const content = `<p class="text-lg font-semibold text-blue-300">${statement}</p>`;
    createWhiteboardCard('🎯 Final Problem Statement', content, dom.finalProblemStatementContainer);
    dom.finalProblemStatementContainer.style.gridColumn = 'span 2';
}

export function renderRefinedHMWs(hmws) {
    const content = hmws.map(h => `<p>${h}</p>`).join('');
    createWhiteboardCard('🎯 Refined How Might We...', content, dom.refinedHmwContainer);
}

export function renderAnalogousBrainstorm(ideas) {
    const content = `<ul class="list-disc list-inside grid grid-cols-2 gap-x-4">${ideas.map(i => `<li>${i}</li>`).join('')}</ul>`;
    createWhiteboardCard('✨ Analogous Brainstorming', content, dom.ideaParkingLotContainer);
    dom.ideaParkingLotContainer.classList.add('col-span-full');
}

export function renderEffortImpactMatrix(evaluatedIdeas) {
    const quadrants = {
        'High Impact, Low Effort': [],
        'High Impact, High Effort': [],
        'Low Impact, Low Effort': [],
        'Low Impact, High Effort': [],
    };

    evaluatedIdeas.forEach(idea => {
        const key = `${idea.impact} Impact, ${idea.effort} Effort`;
        if (quadrants[key]) {
            quadrants[key].push(idea.idea);
        }
    });

    const content = `
        <div class="grid grid-cols-2 grid-rows-2 gap-2 h-full">
            <div class="border p-2 rounded bg-green-900/50">
                <h5 class="font-bold text-green-300">High Impact, Low Effort</h5>
                <ul class="text-xs list-disc list-inside">${quadrants['High Impact, Low Effort'].map(i => `<li>${i}</li>`).join('')}</ul>
            </div>
            <div class="border p-2 rounded bg-yellow-900/50">
                <h5 class="font-bold text-yellow-300">High Impact, High Effort</h5>
                <ul class="text-xs list-disc list-inside">${quadrants['High Impact, High Effort'].map(i => `<li>${i}</li>`).join('')}</ul>
            </div>
            <div class="border p-2 rounded bg-gray-700/50">
                <h5 class="font-bold text-gray-400">Low Impact, Low Effort</h5>
                <ul class="text-xs list-disc list-inside">${quadrants['Low Impact, Low Effort'].map(i => `<li>${i}</li>`).join('')}</ul>
            </div>
            <div class="border p-2 rounded bg-red-900/50">
                <h5 class="font-bold text-red-400">Low Impact, High Effort</h5>
                <ul class="text-xs list-disc list-inside">${quadrants['Low Impact, High Effort'].map(i => `<li>${i}</li>`).join('')}</ul>
            </div>
        </div>
    `;
    createWhiteboardCard('✨ Effort/Impact Matrix', content, dom.effortImpactMatrixContainer);
    dom.effortImpactMatrixContainer.classList.add('col-span-full');
}

export function renderWinningConcept(concept) {
    const content = `
        <p class="text-lg font-semibold text-green-300">${concept.idea}</p>
        <p class="text-sm mt-2"><span class="font-bold">Riskiest Assumption:</span> ${concept.riskiest_assumption}</p>
    `;
    createWhiteboardCard('✨ Winning Concept', content, dom.winningConceptContainer);
    dom.winningConceptContainer.classList.add('col-span-full');
}
