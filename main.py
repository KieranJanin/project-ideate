# src/main.py
from project_ideate.config import settings
from project_ideate.workflows.design_thinking_process import design_thinking_crew
from project_ideate.shared.models import DesignChallenge

def run_simulation():
    print("🚀 Starting Design Thinking Simulation...")
    # Load the design challenge from a file
    challenge = DesignChallenge.from_json("data/inputs/design_challenge.json")

    # Instantiate and run the main workflow agent (the crew)
    final_concept = design_thinking_crew.run(inputs={"challenge": challenge.prompt})

    # Save the output
    print("✅ Simulation complete. Final concept:")
    print(final_concept)
    # ... logic to save final_concept and logs to the /outputs directory ...

if __name__ == "__main__":
    run_simulation()