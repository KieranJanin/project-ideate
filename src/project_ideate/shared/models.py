# src/project_ideate/shared/models.py
from pydantic import BaseModel
import json

# --- Core Input Models ---
# These models define the structure of data that typically serves as input
# to the simulation or core application processes.

class DesignChallenge(BaseModel):
    prompt: str

    @classmethod
    def from_json(cls, file_path: str):
        """
        Loads a DesignChallenge instance from a JSON file.
        """
        with open(file_path, 'r') as f:
            data = json.load(f)
        return cls(**data)


# --- Other potential core models (e.g., User, ProjectConfig) could go here ---
