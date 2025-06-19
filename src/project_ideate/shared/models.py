# src/design_thinking_sim/shared/models.py
from pydantic import BaseModel
from typing import List

class UserInsight(BaseModel):
    observation: str
    implication: str
    source: str

class DesignConcept(BaseModel):
    title: str
    description: str
    feasibility_score: float = 0.0
    novelty_score: float = 0.0

# ... other models like DesignChallenge, FinalReport etc.