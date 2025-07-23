# src/main.py
from project_ideate.config import settings
from project_ideate.workflows.design_thinking_process import design_thinking_crew
from project_ideate.shared.models import DesignChallenge
import argparse
import sys


def run_simulation(challenge_file: str):
    """
    Runs the design thinking simulation.

    Args:
        challenge_file: The path to the JSON file containing the design challenge.
    """
    print("🚀 Starting Design Thinking Simulation...")
    try:
        challenge = DesignChallenge.from_json(challenge_file)
    except FileNotFoundError:
        print(f"🔴 Error: Input file not found at '{challenge_file}'")
        sys.exit(1)
    except Exception as e:
        print(f"🔴 Error: Could not parse the design challenge file. Details: {e}")
        sys.exit(1)


    # Instantiate and run the main workflow agent (the crew)
    final_concept = design_thinking_crew.run(inputs={"challenge": challenge.prompt})

    # Save the output
    print("✅ Simulation complete. Final concept:")
    print(final_concept)
    # ... logic to save final_concept and logs to the /outputs directory ...

if __name__ == "__main__":
    # Set up the command-line argument parser
    parser = argparse.ArgumentParser(
        description="Run the Project IDEATE design thinking simulation."
    )
    parser.add_argument(
        "challenge_file",
        type=str,
        help="Path to the JSON file containing the design challenge.",
        default="data/inputs/design_challenge.json",
        nargs="?",  # Makes the argument optional
    )
    args = parser.parse_args()

    # Pass the file path to the main function
    run_simulation(args.challenge_file)
