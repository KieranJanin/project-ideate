// src/js/config/simulationFlow.js

/**
 * Defines the names and order of the design thinking phases.
 */
export const phases = ['Empathize', 'Define', 'Ideate', 'Prototype & Test', 'Finalize'];

/**
 * The main script for the simulation. Each object represents a step.
 * - type: 'phase_marker' -> Displays a banner in the feed.
 * - type: 'phase' -> Switches the main view to the corresponding phase whiteboard.
 * - type: 'msg' -> A character delivers a message in the feed.
 * - type: 'call_gemini' -> An agent makes a call to the Gemini API to generate content.
 * - type: 'gate' -> Pauses the simulation and waits for user input to continue.
 * - type: 'end' -> Concludes the simulation.
 */
export const simulationFlow = [
    // Empathize
    { type: 'phase_marker', phase: 0 },
    { type: 'phase', phase: 0 },
    { type: 'msg', agent: 'director', content: (c) => `Alright team, mission: "${c}". Empathize phase begins now. Anthropologist, start research.` },
    { type: 'call_gemini', task: 'generate_persona', agent: 'anthropologist' },
    { type: 'call_gemini', task: 'generate_quotes', agent: 'storyteller' },
    { type: 'call_gemini', task: 'generate_hmw', agent: 'director' },
    { type: 'gate' },
    // Define
    { type: 'phase_marker', phase: 1 },
    { type: 'phase', phase: 1 },
    { type: 'call_gemini', task: 'generate_pov', agent: 'anthropologist' },
    { type: 'call_gemini', task: 'generate_metrics', agent: 'hurdler' },
    { type: 'call_gemini', task: 'define_scope', agent: 'director' },
    { type: 'call_gemini', task: 'generate_problem_statement', agent: 'director' },
    { type: 'msg', agent: 'director', thought: 'Now that the problem is crystal clear, I should refine our How Might We questions to be more targeted for the upcoming Ideation phase.'},
    { type: 'call_gemini', task: 'refine_hmw', agent: 'director'},
    { type: 'gate' },
    // Ideate
    { type: 'phase_marker', phase: 2 },
    { type: 'phase', phase: 2 },
    { type: 'msg', agent: 'director', content: "Time to ideate. Let's start with a wide brainstorm. Cross-Pollinator, get us started with some analogous inspiration." },
    { type: 'call_gemini', task: 'analogous_brainstorm', agent: 'cross-pollinator' },
    { type: 'msg', agent: 'hurdler', thought: 'Okay, a lot of raw ideas. I need to evaluate them for the Effort vs. Impact matrix so we can have a strategic discussion.' },
    { type: 'call_gemini', task: 'evaluate_effort_impact', agent: 'hurdler' },
    { type: 'msg', agent: 'director', thought: 'The matrix gives us clarity. Based on this, I will select the most promising concept to move forward.' },
    { type: 'call_gemini', task: 'select_winning_concept', agent: 'director' },
    { type: 'gate' },
    // Prototype & Test
    { type: 'phase_marker', phase: 3 },
    { type: 'phase', phase: 3 },
    { type: 'msg', agent: 'director', content: "Great work selecting a concept. Now, let's anticipate challenges. Hurdler, what obstacles do you foresee?" },
    { type: 'call_gemini', task: 'analyze_obstacles', agent: 'hurdler' },
    { type: 'gate' },
    // Finalize
    { type: 'phase_marker', phase: 4 },
    { type: 'phase', phase: 4 },
    { type: 'msg', agent: 'director', content: "Path is clear. Time to craft the final pitch. Storyteller, bring it home." },
    { type: 'call_gemini', task: 'finalize', agent: 'storyteller' },
    { type: 'end' }
];
