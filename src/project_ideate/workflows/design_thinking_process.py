# src/design_thinking_sim/workflows/design_thinking_process.py
from google.adk.agents import SequentialAgent
from project_ideate.agents.learning_agents import anthropologist, experience_architect, storyteller
from project_ideate.agents.building_agents import 
from project_ideate.agents.organizing_agents import director, hurdler

# This SequentialAgent IS the entire design thinking process
design_thinking_crew = SequentialAgent(
    name="DesignThinkingCrew",
    # The Director agent manages the overall process
    sub_agents=[
        # Step 1: Empathize
        anthropologist,
        # Step 2: Define (Could be another agent)
        # Step 3: Ideate (Could be a ParallelAgent for brainstorming)
        # Step 4: Prototype/Test
        hurdler,
        # Final Step: Report
        director, 
    ],
    # The Director's instruction guides the entire workflow
    instruction=(
        "You are the Director. Your goal is to guide the team through the design "
        "thinking process to solve the user's challenge. Delegate tasks to your "
        "sub-agents in sequence. Start with the Anthropologist for research, then "
        "move to ideation, and finally to the Hurdler for feasibility. Synthesize "
        "all findings into a final report."
    )
)