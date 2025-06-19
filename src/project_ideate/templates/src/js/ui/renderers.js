// src/js/ui/renderers.js
import { dom } from './domElements.js';
import { agents } from '../config/agents.js';
import { startInterval } from '../core/simulation.js';

// --- INITIAL UI SETUP ---
export function initializeAppUI() {
    dom.startBtn.innerHTML = `<i class="fas fa-play"></i>`;
    dom.pauseBtn.innerHTML = `<i class="fas fa-pause"></i>`;
    dom.resetBtn.innerHTML = `<i class="fas fa-redo"></i>`;
    Split(['#mc-setup-pane', '#mc-feed-pane'], { sizes: [33, 67], minSize: 300, gutterSize: 8 });
}

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
            li.className = 'flex items-center justify-between bg-gray-900 p-2 rounded-md';
            li.innerHTML = `
                <div class="flex items-center space-x-3">
                    <span class="text-xl">${agent.avatar}</span>
                    <span class="font-medium text-sm">${agent.name}</span>
                </div>
                <label class="inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="${agent.id}" class="sr-only peer agent-toggle" checked>
                    <div class="relative w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            `;
            ul.appendChild(li);
        });
        categoryDiv.appendChild(ul);
        dom.agentListContainer.appendChild(categoryDiv);
    }
}

export function addMessageToFeed(agentId, content, type = 'msg', isAI = false) {
    // ... function content from original file
}

// --- EMPATHIZE PHASE RENDERERS ---
export function renderPersona(persona) {
    dom.personaContainer.classList.remove('hidden');
    dom.personaContainer.innerHTML = `
        <div class="bg-gray-800 p-4 rounded-lg h-full">
            <h3 class="font-bold text-lg text-white mb-2">👤 User Persona</h3>
            <div class="text-center mb-4">
                <img src="https://placehold.co/100x100/4f46e5/ffffff?text=${persona.name.charAt(0)}" class="rounded-full mx-auto mb-2 border-2 border-indigo-400">
                <h4 class="font-semibold text-xl">${persona.name}</h4>
                <p class="text-sm text-gray-400">${persona.bio}</p>
            </div>
            <div>
                <h5 class="font-semibold mb-1 text-indigo-300">Goals</h5>
                <ul class="list-disc list-inside text-sm text-gray-300 space-y-1 mb-3">${persona.goals.map(g => `<li>${g}</li>`).join('')}</ul>
                <h5 class="font-semibold mb-1 text-red-300">Frustrations</h5>
                <ul class="list-disc list-inside text-sm text-gray-300 space-y-1">${persona.frustrations.map(f => `<li>${f}</li>`).join('')}</ul>
            </div>
        </div>`;
}
export function renderQuotes(quotes) {
    dom.keyQuotesContainer.classList.remove('hidden');
    dom.keyQuotesContainer.innerHTML = `
        <div class="bg-gray-800 p-4 rounded-lg h-full">
            <h3 class="font-bold text-lg text-white mb-3">💬 Key Quotes</h3>
            <div class="space-y-3">
                ${quotes.map(q => `<blockquote class="bg-gray-700/50 p-3 rounded-lg text-sm italic text-gray-300 border-l-4 border-yellow-400">"${q}"</blockquote>`).join('')}
            </div>
        </div>`;
}
export function renderHMWs(hmws) {
    dom.hmwContainer.classList.remove('hidden');
    dom.hmwContainer.innerHTML = `
        <div class="bg-gray-800 p-4 rounded-lg h-full">
             <h3 class="font-bold text-lg text-white mb-3">🤔 How Might We... (Initial)</h3>
             <div class="space-y-2">
                 ${hmws.map(h => `<div class="bg-gray-900/50 p-3 rounded-md text-sm font-medium text-gray-300">${h}</div>`).join('')}
             </div>
        </div>`;
}

// --- DEFINE PHASE RENDERERS ---
export function renderPOV(pov) {
    dom.povStatementContainer.classList.remove('hidden');
    dom.povStatementContainer.innerHTML = `
       <div class="bg-gray-800 p-4 rounded-lg h-full">
           <h3 class="font-bold text-lg text-white mb-3">🎯 Point of View</h3>
           <p class="text-gray-300">
               <span class="font-bold text-indigo-300">${pov.user}</span> needs 
               <span class="font-bold text-white">${pov.need}</span> because 
               <span class="font-bold text-yellow-300 italic">"${pov.insight}"</span>.
           </p>
       </div>`;
}
export function renderSuccessMetrics(metrics) {
    dom.successMetricsContainer.classList.remove('hidden');
    dom.successMetricsContainer.innerHTML = `
         <div class="bg-gray-800 p-4 rounded-lg h-full">
            <h3 class="font-bold text-lg text-white mb-3">✅ Success Metrics</h3>
            <ul class="list-disc list-inside text-sm text-gray-300 space-y-1">
                ${metrics.map(m => `<li>${m}</li>`).join('')}
            </ul>
        </div>`;
}
export function renderScope(scope) {
    dom.scopeContainer.classList.remove('hidden');
    dom.scopeContainer.innerHTML = `
         <div class="bg-gray-800 p-4 rounded-lg h-full">
            <h3 class="font-bold text-lg text-white mb-3">📌 Scope</h3>
            <div class="grid grid-cols-2 gap-4 mt-2">
                <div>
                    <h4 class="font-semibold text-green-400">In Scope</h4>
                    <ul class="list-disc list-inside text-xs text-gray-300 mt-1">${scope.in_scope.map(i => `<li>${i}</li>`).join('')}</ul>
                </div>
                <div>
                    <h4 class="font-semibold text-red-400">Out of Scope</h4>
                    <ul class="list-disc list-inside text-xs text-gray-300 mt-1">${scope.out_of_scope.map(o => `<li>${o}</li>`).join('')}</ul>
                </div>
            </div>
        </div>`;
}
export function renderProblemStatement(statement) {
    dom.finalProblemStatementContainer.classList.remove('hidden');
    dom.finalProblemStatementContainer.style.gridColumn = "1 / -1"; // Span full width
    dom.finalProblemStatementContainer.innerHTML = `
        <div class="bg-indigo-900/50 border-2 border-indigo-500 p-6 rounded-lg text-center">
            <h3 class="font-bold text-xl text-white mb-2">Problem Statement</h3>
            <p class="text-lg text-indigo-200 font-semibold">${statement}</p>
        </div>`;
}
export function renderRefinedHMWs(hmws) {
    dom.refinedHmwContainer.classList.remove('hidden');
    dom.refinedHmwContainer.innerHTML = `
        <div class="bg-green-900/30 border border-green-500 p-4 rounded-lg h-full">
             <h3 class="font-bold text-lg text-white mb-3">💡 How Might We... (Refined)</h3>
             <div class="space-y-2">
                 ${hmws.map(h => `<div class="bg-green-900/50 p-3 rounded-md text-sm font-semibold text-green-200">${h}</div>`).join('')}
             </div>
        </div>`;
}

// --- IDEATE PHASE RENDERERS ---
export function renderAnalogousBrainstorm(ideas) {
    dom.ideaParkingLotContainer.classList.remove('hidden');
    let html = ideas.map(idea => `
        <div class="bg-yellow-800/20 border border-yellow-600 p-3 rounded-md text-sm text-yellow-200">
            ${idea}
        </div>
    `).join('');
    dom.ideaParkingLotContainer.innerHTML = `<div class="bg-gray-800 p-4 rounded-lg"><h3 class="font-bold text-lg text-white mb-3">🅿️ Idea Parking Lot</h3><div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">${html}</div></div>`;
}
export function renderEffortImpactMatrix(evaluatedIdeas) {
    dom.effortImpactMatrixContainer.classList.remove('hidden');
    const quadrants = {
        high_impact_low_effort: [],
        high_impact_high_effort: [],
        low_impact_low_effort: [],
        low_impact_high_effort: []
    };

    evaluatedIdeas.forEach(item => {
        const key = `${item.impact.toLowerCase()}_impact_${item.effort.toLowerCase()}_effort`;
        if (quadrants[key]) {
            quadrants[key].push(item.idea);
        }
    });
    
    dom.effortImpactMatrixContainer.innerHTML = `
        <div class="bg-gray-800 p-4 rounded-lg">
            <h3 class="font-bold text-lg text-white mb-3">📊 Effort vs. Impact Matrix</h3>
            <div class="grid grid-cols-2 gap-px bg-gray-600 border border-gray-600 rounded-md">
                <div class="bg-gray-800 p-3">
                    <h4 class="font-semibold text-green-400">High Impact / Low Effort</h4>
                    <ul class="text-xs text-gray-300 mt-1 space-y-1">${quadrants.high_impact_low_effort.map(i => `<li>- ${i}</li>`).join('') || '<li class="text-gray-500">None</li>'}</ul>
                </div>
                 <div class="bg-gray-800 p-3">
                    <h4 class="font-semibold text-blue-400">High Impact / High Effort</h4>
                    <ul class="text-xs text-gray-300 mt-1 space-y-1">${quadrants.high_impact_high_effort.map(i => `<li>- ${i}</li>`).join('') || '<li class="text-gray-500">None</li>'}</ul>
                </div>
                 <div class="bg-gray-800 p-3">
                    <h4 class="font-semibold text-yellow-400">Low Impact / Low Effort</h4>
                    <ul class="text-xs text-gray-300 mt-1 space-y-1">${quadrants.low_impact_low_effort.map(i => `<li>- ${i}</li>`).join('') || '<li class="text-gray-500">None</li>'}</ul>
                </div>
                 <div class="bg-gray-800 p-3">
                    <h4 class="font-semibold text-red-400">Low Impact / High Effort</h4>
                    <ul class="text-xs text-gray-300 mt-1 space-y-1">${quadrants.low_impact_high_effort.map(i => `<li>- ${i}</li>`).join('') || '<li class="text-gray-500">None</li>'}</ul>
                </div>
            </div>
        </div>`;
}
export function renderWinningConcept(concept) {
    dom.winningConceptContainer.classList.remove('hidden');
     dom.winningConceptContainer.innerHTML = `
        <div class="bg-green-900/50 border-2 border-green-500 p-6 rounded-lg text-center">
            <h3 class="font-bold text-xl text-white mb-2">🏆 Winning Concept</h3>
            <p class="text-lg text-green-200 font-semibold">${concept.idea}</p>
            <p class="text-xs text-gray-400 mt-2">Riskiest Assumption: <span class="italic">${concept.riskiest_assumption}</span></p>
        </div>`;
}

// --- PROTOTYPE & FINALIZE RENDERERS ---
export function renderAnalyzeObstacles(analysisText) {
    dom.hurdlerCard.classList.remove('hidden');
    dom.hurdlerAnalysisText.innerHTML = analysisText.replace(/\n/g, '<br>');
}
export function renderFinalize(finalText) {
    dom.finalConceptCard.classList.remove('hidden');
    dom.finalConceptCard.style.gridColumn = "1 / -1";
    dom.finalConceptContent.innerHTML = finalText.replace(/\n/g, '<br>');
}


// --- GENERAL RENDERERS ---
export function renderContinueButton() {
    const button = document.createElement('button');
    button.innerHTML = `Continue to Next Phase <i class="fas fa-arrow-right ml-2"></i>`;
    button.className = 'w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105';
    button.addEventListener('click', () => {
        button.remove();
        startInterval();
    });
    dom.feedEl.appendChild(button);
    dom.feedEl.scrollTop = dom.feedEl.scrollHeight;
}
