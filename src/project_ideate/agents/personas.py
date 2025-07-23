import adk
import os
from typing import Dict, Any

# --- 1. Foundation: Configure the LLM for all agents ---
# This setup is the "concrete mix design" for all our prefabricated agent elements.
# It ensures consistency and provides the core intelligence.

# Ensure your API key is set as an environment variable
# os.environ["GEMINI_API_KEY"] = "YOUR_API_KEY"

# We'll use a consistent model for all agents
LLM_MODEL = adk.Model("gemini-1.5-flash")


# --- 2. The Generic Persona Class ---
# This class inherits from adk.Agent and adds the specific properties
# and methods from your mathematical model document.

class Persona(adk.Agent):
    """
    Represents a generic agent persona that extends adk.Agent.
    It directly implements the properties from the formal model:
    A_i = <S_i, A_i, pi_i, U_i, B_i>
    """
    def __init__(self, name: str, icon: str, role: str, instructions: str, utility_weights: Dict[str, float]):
        """
        Initializes the Persona.

        Args:
            name (str): The name of the persona (e.g., "Anthropologist").
            icon (str): An emoji to visually represent the persona.
            role (str): A brief description of the persona's function.
            instructions (str): The core instructions for the LLM, defining the agent's Policy (pi_i).
            utility_weights (Dict[str, float]): The 'w_k' weights for the agent's utility function.
        """
        # Initialize the parent adk.Agent class
        super().__init__(name=f"{name} {icon}", model=LLM_MODEL, instructions=instructions)
        
        self.icon = icon
        self.role = role
        self.utility_weights = utility_weights

        # S_i: The State Space of the agent.
        self.state: Dict[str, Any] = {
            "tasks_completed": 0,
            "stress_level": 0.0,
            "current_utility": 0.0,
        }

        # B_i: The Belief State about other agents.
        self.beliefs: Dict[str, Dict[str, Any]] = {}

    def calculate_utility(self) -> float:
        """
        Calculates the agent's current utility based on its state and weights.
        This method directly implements the Utility Function (U_i).
        """
        utility = 0.0
        # This is a simplified calculation. A full implementation would use the
        # quantification methods (direct, model-based, heuristic) from your document.
        for key, weight in self.utility_weights.items():
            utility += self.state.get(key, 0.0) * weight
        
        self.state["current_utility"] = utility
        return utility

    def update_belief(self, agent_name: str, new_information: Dict[str, Any]):
        """Updates the agent's belief about another agent."""
        if agent_name not in self.beliefs:
            self.beliefs[agent_name] = {}
        self.beliefs[agent_name].update(new_information)
    
    def __repr__(self) -> str:
        """Provides a richer representation of the agent's status."""
        return f"{self.name} | Role: {self.role} | Utility: {self.state['current_utility']:.2f}"


# --- 3. Specialized Persona Implementations ---
# These classes inherit from our new Persona class and define the specific
# instructions and utility weights for each role.

# Learning Personas
class Anthropologist(Persona):
    def __init__(self):
        super().__init__(
            name="Anthropologist", icon="🧑", role="User Researcher",
            instructions="You are the Anthropologist. Your goal is to achieve the deepest possible understanding of the user. Observe the given situation, report facts without bias, and identify the underlying human needs and emotions.",
            utility_weights={"actionable_insights": 1.5, "user_centricity_score": 1.2, "research_time": -0.5}
        )

class Experimenter(Persona):
    def __init__(self):
        super().__init__(
            name="Experimenter", icon="🧪", role="Hypothesis Tester",
            instructions="You are the Experimenter. Your goal is to validate or invalidate hypotheses through rigorous testing. Propose clear, simple experiments to test assumptions and generate data-driven learnings.",
            utility_weights={"validated_learnings": 2.0, "cost_of_experiment": -1.0}
        )

class CrossPollinator(Persona):
    def __init__(self):
        super().__init__(
            name="Cross-Pollinator", icon="🐝", role="Creative Synthesizer",
            instructions="You are the Cross-Pollinator. Your goal is to introduce novel, unexpected ideas by drawing analogies from disparate fields. Connect concepts from different industries to spark innovation.",
            utility_weights={"novelty_of_ideas": 1.8, "diversity_of_sources": 1.2}
        )

# Organizing Personas
class Director(Persona):
    def __init__(self):
        super().__init__(
            name="Director", icon="🎬", role="Project Coordinator",
            instructions="You are the Director. Your goal is the successful completion of the project. Your role is to provide clear direction, delegate tasks, and synthesize information to move the team forward.",
            utility_weights={"Global_Project_Score": 2.0, "time_to_completion": -0.8, "resource_cost": -1.0}
        )

class Collaborator(Persona):
    def __init__(self):
        super().__init__(
            name="Collaborator", icon="🤝", role="Team Facilitator",
            instructions="You are the Collaborator. Your goal is to ensure smooth teamwork and high participation. You facilitate discussions, help build consensus, and ensure all voices are heard.",
            utility_weights={"team_alignment_score": 1.7, "participation_rate": 1.0, "unresolved_conflicts": -2.0}
        )

class Hurdler(Persona):
    def __init__(self):
        super().__init__(
            name="Hurdler", icon="🚧", role="Problem Solver",
            instructions="You are the Hurdler. Your goal is to make concepts viable by proactively solving problems. Analyze concepts for feasibility, identify obstacles, and propose concrete solutions.",
            utility_weights={"feasibility_score": 1.5, "solutions_generated": 1.5, "unmitigated_risks": -1.8}
        )

# Building Personas
class ExperienceArchitect(Persona):
    def __init__(self):
        super().__init__(
            name="Experience Architect", icon="🏗️", role="User Journey Designer",
            instructions="You are the Experience Architect. Your goal is to design a seamless and intuitive user journey. Based on insights, create a logical and coherent user flow that feels effortless.",
            utility_weights={"user_flow_coherence": 1.8, "ease_of_use_score": 1.5}
        )

class SetDesigner(Persona):
    def __init__(self):
        super().__init__(
            name="Set Designer", icon="🖼️", role="Environment Designer",
            instructions="You are the Set Designer. Your goal is to create the optimal physical or digital environment for the user experience. Ensure the solution fits perfectly into the user's context.",
            utility_weights={"environmental_alignment": 1.6, "contextual_relevance": 1.4}
        )

class Caregiver(Persona):
    def __init__(self):
        super().__init__(
            name="Caregiver", icon="♥️", role="Customer Advocate",
            instructions="You are the Caregiver. Your goal is to anticipate and support customer needs throughout their experience. You focus on service design, empathy, and long-term customer satisfaction.",
            utility_weights={"customer_satisfaction_score": 1.9, "service_quality": 1.3}
        )

class Storyteller(Persona):
    def __init__(self):
        super().__init__(
            name="Storyteller", icon="📜", role="Narrative Crafter",
            instructions="You are the Storyteller. Your goal is to create a compelling and emotionally resonant narrative. You craft a powerful message that communicates the 'why' behind the design.",
            utility_weights={"narrative_clarity": 1.7, "emotional_impact_score": 1.5}
        )


# --- 4. Simulation: The Structure in Action ---

def run_design_thinking_simulation():
    """
    Simulates a design thinking session using the specialized Persona classes.
    """
    print("--- 🎬 SIMULATION START ---")

    # 1. Instantiate the agents for this session
    director = Director()
    anthropologist = Anthropologist()
    storyteller = Storyteller()
    architect = ExperienceArchitect()

    design_challenge = "An unintuitive coffee machine"

    with adk.session() as s:
        # --- Empathize Phase ---
        print("\n--- PHASE: EMPATHIZE ---")
        director_prompt = f"Team, our challenge is: '{design_challenge}'. Anthropologist, please provide your observations."
        print(f"\n{director.name}: {director_prompt}")
        anthropologist_report = anthropologist.tell(director_prompt)
        print(f"\n{anthropologist.name}: {anthropologist_report}")
        
        # --- Define Phase ---
        print("\n--- PHASE: DEFINE ---")
        director_prompt_2 = f"Thank you. Storyteller, based on this report, please frame the core problem as a human-centered narrative."
        print(f"\n{director.name}: {director_prompt_2}")
        storyteller_narrative = storyteller.tell(director_prompt_2)
        print(f"\n{storyteller.name}: {storyteller_narrative}")

        # --- Ideate/Build Phase ---
        print("\n--- PHASE: BUILD ---")
        director_prompt_3 = f"A powerful narrative. Now, Experience Architect, based on that story, design a high-level user journey for a new, intuitive machine."
        print(f"\n{director.name}: {director_prompt_3}")
        architect_design = architect.tell(director_prompt_3)
        print(f"\n{architect.name}: {architect_design}")


    print("\n--- 🎬 SIMULATION END ---")


if __name__ == '__main__':
    # This block will only run when the script is executed directly.
    # To run this, you would need to have the 'adk' library installed
    # and your Google AI API key configured.
    print("This script provides the scaffolding for all 10 ADK-based personas.")
    print("The `run_design_thinking_simulation` function shows how they would interact.")
    # To make this runnable, you would uncomment the following line:
    # run_design_thinking_simulation()
