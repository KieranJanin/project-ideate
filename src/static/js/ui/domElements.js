// src/js/ui/domElements.js

/**
 * A centralized object to hold references to all DOM elements.
 * This is populated once the DOM is fully loaded.
 */
export const dom = {};

/**
 * Queries the DOM for all necessary elements and populates the `dom` object.
 * This should be called after the DOMContentLoaded event.
 */
export function initializeDomElements() {
    Object.assign(dom, {
        // Main Navigation
        mainNav: document.getElementById('main-nav'),
        hamburgerMenu: document.getElementById('hamburger-menu'),
        projectTitle: document.getElementById('project-title'),
        collapsedTitle: document.getElementById('collapsed-title'),
        
        // Mission Control
        agentListContainer: document.getElementById('agent-list-container'),
        editTeamBtn: document.getElementById('edit-team-btn'),
        agentEditPanel: document.getElementById('agent-edit-panel'),
        confirmTeamBtn: document.getElementById('confirm-team-btn'),
        startBtn: document.getElementById('start-btn'),
        resetBtn: document.getElementById('reset-btn'),
        missionControlPhase: document.getElementById('mission-control-phase'),
        statusEl: document.getElementById('sim-status'),
        feedEl: document.getElementById('live-feed'),
        generateChallengeBtn: document.getElementById('generate-challenge-btn'),
        designChallengeTextarea: document.getElementById('design-challenge'),
        loadingSpinner: document.getElementById('loading-spinner'),
        missionControlActions: document.getElementById('mission-control-actions'), // Added this line
        
        // Simulation controls
        pauseBtn: document.getElementById('pause-btn'),
        speedSlider: document.getElementById('speed-slider'),

        // Action Hub
        agentActionButtons: document.getElementById('agent-action-buttons'),
        actionHub: document.getElementById('action-hub'),

        // Empathize Phase
        empathizeChatToggle: document.getElementById('empathize-chat-toggle'),
        empathizeChatContainer: document.getElementById('empathize-chat-container'),
        personaContainer: document.getElementById('persona-container'),
        keyQuotesContainer: document.getElementById('key-quotes-container'),
        hmwContainer: document.getElementById('hmw-container'),
        
        // Define Phase
        defineChatToggle: document.getElementById('define-chat-toggle'),
        defineChatContainer: document.getElementById('define-chat-container'),
        povStatementContainer: document.getElementById('pov-statement-container'),
        successMetricsContainer: document.getElementById('success-metrics-container'),
        scopeContainer: document.getElementById('scope-container'),
        finalProblemStatementContainer: document.getElementById('final-problem-statement-container'),
        refinedHmwContainer: document.getElementById('refined-hmw-container'),
        
        // Ideate Phase
        ideateChatToggle: document.getElementById('ideate-chat-toggle'),
        ideateChatContainer: document.getElementById('ideate-chat-container'),
        ideaParkingLotContainer: document.getElementById('idea-parking-lot-container'),
        effortImpactMatrixContainer: document.getElementById('effort-impact-matrix-container'),
        winningConceptContainer: document.getElementById('winning-concept-container'),
        
        // Prototype Phase
        prototypeChatToggle: document.getElementById('prototype-chat-toggle'),
        prototypeChatContainer: document.getElementById('prototype-chat-container'),
        hurdlerCard: document.getElementById('hurdler-card'),
        hurdlerAnalysisText: document.getElementById('hurdler-analysis-text'),

        // Finalize Phase
        finalizeChatToggle: document.getElementById('finalize-chat-toggle'),
        finalizeChatContainer: document.getElementById('finalize-chat-container'),
        finalConceptCard: document.getElementById('final-concept-card'),
        finalConceptContent: document.getElementById('final-concept-content')
    });
}
