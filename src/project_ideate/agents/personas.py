import adk
import yaml
from pathlib import Path
from typing import Dict, Any, List, Optional

# Import the tool registry
from project_ideate.tools import get_tool

# --- 1. Foundation: Configure the LLM for all agents ---
LLM_MODEL = adk.Model("gemini-1.5-flash")

# --- 2. Persona Data Loading ---
def load_all_personas() -> Dict[str, Dict[str, Any]]:
    """Loads all agent persona definitions from the YAML file."""
    yaml_path = Path(__file__).parent / "personas.yaml"
    with open(yaml_path, 'r') as f:
        return yaml.safe_load(f)

# Load the data once when the module is imported
ALL_PERSONA_DATA = load_all_personas()


# --- 3. The Generic Persona Class ---
class Persona(adk.Agent):
    """
    A generic agent persona dynamically configured from loaded data.
    It directly implements the properties from the formal model:
    A_i = <S_i, A_i, pi_i, U_i, B_i>
    """\
    def __init__(self, name: str, role: str, backstory: str, goal: str, tools: Optional[List[str]] = None, **kwargs):
        """
        Initializes the Persona.

        Args:
            name (str): The name of the persona (e.g., "Anthropologist").
            role (str): A brief description of the persona's function.
            backstory (str): A detailed description of the agent's persona and expertise.
            goal (str): The specific objective this agent is trying to achieve.
            tools (Optional[List[str]]): A list of tool IDs that this persona can use.
        """
        # The 'instructions' for the adk.Agent are a combination of the persona's
        # backstory and their specific goal for the task.
        instructions = f"""{backstory}
Your current goal is: {goal}"""
        
        super().__init__(name=name, model=LLM_MODEL, instructions=instructions)
        
        self.role = role
        
        # Add tools to the agent if provided
        if tools:
            for tool_id in tools:
                self.add_tool(get_tool(tool_id))

        # S_i: The State Space of the agent.
        self.state: Dict[str, Any] = {
            "tasks_completed": 0,
            "stress_level": 0.0,
            "current_utility": 0.0,
        }

        # B_i: The Belief State about other agents.
        self.beliefs: Dict[str, Dict[str, Any]] = {}

    def __repr__(self) -> str:
        """Provides a richer representation of the agent's status."""
        return f"{self.name} | Role: {self.role}"


# --- 4. Persona Factory ---
def create_persona(agent_id: str) -> Persona:
    """
    Factory function to create a specific Persona instance by its ID.

    Args:
        agent_id (str): The key of the agent in the personas.yaml file (e.g., "anthropologist").

    Returns:
        An instance of the Persona class.
        
    Raises:
        ValueError: if the agent_id is not found in the loaded data.
    """
    persona_data = ALL_PERSONA_DATA.get(agent_id)
    if not persona_data:
        raise ValueError(f"No persona found for agent ID '{agent_id}'. Check personas.yaml.")

    # The name is the agent_id capitalized, which is a reasonable convention.
    # The YAML file contains 'role', 'backstory', 'goal', and now 'tools'.
    return Persona(
        name=agent_id.replace('_', ' ').title(),
        **persona_data
    )

# --- Example of how to use it ---
if __name__ == '__main__':
    print("This script provides the scaffolding for all ADK-based personas.")
    print("It dynamically loads agent definitions from 'personas.yaml'.")
    print("--- Available Personas ---")
    for agent_id in ALL_PERSONA_DATA.keys():
        print(f"- {agent_id}")
    
    print("--- Testing Persona Creation ---")
    try:
        # Create an instance of the Anthropologist (assuming it has tools in YAML)
        anthropologist = create_persona("anthropologist")
        print(f"Successfully created: {anthropologist}")
        print("Instructions for Anthropologist:")
        print(anthropologist.instructions)
        print(f"Tools for Anthropologist: {anthropologist.tools}") # Check if tools are added

        # Create an instance of the Storyteller
        storyteller = create_persona("storyteller")
        print(f"Successfully created: {storyteller}")
        print(f"Tools for Storyteller: {storyteller.tools}")


    except (ValueError, FileNotFoundError) as e:
        print(f"🔴 Error: {e}")
