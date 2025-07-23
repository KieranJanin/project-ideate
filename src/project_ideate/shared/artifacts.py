# src/project_ideate/shared/artifacts.py
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# --- Shared Base Models for common elements ---
class BaseArtifact(BaseModel):
    description: str
    primary_creator: str # Persona ID (e.g., "anthropologist")
    contributors: Optional[List[str]] = None # List of persona IDs

# --- Phase 1: Empathize Artifacts 🧭 ---
class EthnographicFieldNotes(BaseArtifact):
    raw_observations: str
    key_quotes: Optional[List[str]] = None
    sketches_or_media_references: Optional[List[str]] = None # URLs or descriptions

class StakeholderInterviewTranscripts(BaseArtifact):
    interviewer: str
    interviewee: str
    transcript_summary: str # Could be full transcript or summary
    key_insights_extracted: Optional[List[str]] = None

class UserJourneyMapAsIs(BaseArtifact):
    map_title: str
    user_persona_name: str
    steps: List[Dict[str, Any]] # e.g., [{"action": "...", "thoughts": "...", "feelings": "...", "touchpoints": "..."}]
    pain_points_identified: Optional[List[str]] = None
    emotional_arc: Optional[List[str]] = None

class CompetitiveAnalysisReport(BaseArtifact):
    report_title: str
    competitors_reviewed: List[str]
    strengths_identified: List[str]
    weaknesses_identified: List[str]
    key_features_comparison: Optional[Dict[str, Any]] = None # e.g., {"competitor_x": ["feature1", "feature2"]}
    overall_summary: str

class DayInTheLifeNarrative(BaseArtifact):
    narrative_title: str
    persona_name: str
    story: str
    challenges_highlighted: Optional[List[str]] = None


# --- Phase 2: Define Artifacts 🎯 ---
class UserPersona(BaseArtifact): # Primary Creator: Storyteller 📜
    name: str
    bio: str
    goals: List[str]
    frustrations: List[str]
    archetype_name: Optional[str] = None # If this persona represents an archetype

class HowMightWeStatements(BaseArtifact): # Renamed for clarity vs. refined HMWs
    questions: List[str]

class EmpathyMap(BaseArtifact):
    user_name: str
    says: List[str]
    thinks: List[str]
    does: List[str]
    feels: List[str]
    synthesized_insights: Optional[List[str]] = None

class ValuePropositionCanvas(BaseArtifact):
    customer_jobs: List[str]
    customer_pains: List[str]
    customer_gains: List[str]
    products_services: List[str]
    pain_relievers: List[str]
    gain_creators: List[str]

class SystemMap(BaseArtifact):
    map_title: str
    actors: List[str]
    systems: List[str]
    environmental_factors: Optional[List[str]] = None
    key_interactions_flow: Optional[Dict[str, Any]] = None # e.g., {"actor1_to_systemA": "..."}

class ProblemStatement(BaseArtifact):
    statement: str

class RefinedHowMightWe(BaseArtifact):
    questions: List[str] = Field(..., alias="refinedHmw") # Matches JS key 'refinedHmw'


# --- Phase 3: Ideate Artifacts ✨ ---
class BrainstormingSessionLog(BaseArtifact):
    session_title: str
    date: str
    participants: List[str]
    generated_ideas: List[str]
    key_themes: Optional[List[str]] = None

class SolutionConceptBrief(BaseArtifact):
    concept_title: str
    brief_summary: str
    narrative: str
    metaphor: Optional[str] = None
    key_benefits: List[str]

class AnalogousInspirationMoodboard(BaseArtifact):
    theme: str
    inspirations: List[Dict[str, Any]] # e.g., [{"source": "nature", "description": "how ant colonies self-organize"}]

class Storyboard(BaseArtifact):
    storyboard_title: str
    user_persona_name: str
    scenes: List[Dict[str, Any]] # e.g., [{"scene_number": 1, "description": "...", "visual_description": "..."}]

class IdeaPrioritizationMatrix(BaseArtifact): # Replaces EvaluatedIdeas for full matrix
    matrix_title: str
    quadrants: Dict[str, List[str]] # e.g., {"high_impact_low_effort": ["idea1", "idea2"]}
    # Keeping old EvaluatedIdea structure for compatibility, can be removed later if not needed
    # evaluated_ideas_list: List[EvaluatedIdea] = Field(..., alias="evaluatedIdeas")

class EvaluatedIdea(BaseModel): # Kept for list items within matrix
    idea: str
    effort: str # e.g., "Low", "High"
    impact: str # e.g., "Low", "High"

class WinningConcept(BaseArtifact):
    idea: str
    riskiest_assumption: str


# --- Phase 4: Prototype Artifacts 🏗️ ---
class InteractiveMockupWireframes(BaseArtifact):
    prototype_name: str
    tool_used: Optional[str] = None # e.g., "Figma", "InVision"
    link_to_prototype: Optional[str] = None # URL
    key_user_flows: Optional[List[str]] = None # Descriptions of flows demonstrated

class RolePlayingServiceScenario(BaseArtifact):
    scenario_title: str
    roles_involved: List[str]
    script_summary: str
    expected_learnings: Optional[List[str]] = None

class PaperPrototype(BaseArtifact):
    prototype_name: str
    description_of_interaction: str
    pages_or_screens_sketched: List[str] # Descriptions or references to sketches

class WizardOfOzPrototypePlan(BaseArtifact):
    plan_title: str
    user_tasks: List[str]
    human_powered_roles: Dict[str, str] # e.g., {"OZ_agent": "Simulates AI response"}
    hidden_mechanisms_description: str

class VideoPrototype(BaseArtifact):
    video_title: str
    main_message: str
    target_audience: str
    link_to_video: Optional[str] = None

class PhysicalModelMockup(BaseArtifact):
    model_name: str
    materials_used: List[str]
    description_of_functionality: str
    image_references: Optional[List[str]] = None # URLs or descriptions of images

class LegoPrototype(BaseArtifact):
    prototype_name: str
    description_of_process_or_product: str
    key_insights_from_build: Optional[List[str]] = None

class StopMotionAnimation(BaseArtifact):
    animation_title: str
    process_demonstrated: str
    key_message: Optional[str] = None
    link_to_animation: Optional[str] = None # URL


# --- Phase 5: Test Artifacts ✅ ---
class UserTestingPlanScript(BaseArtifact):
    plan_name: str
    testing_goals: List[str]
    tasks_for_users: List[str]
    questions_for_users: List[str]
    target_user_profile: str

class SynthesizedLearningsIterationPlan(BaseArtifact):
    report_title: str
    key_findings: List[str]
    recommended_changes: List[str]
    prioritized_next_steps: List[str]

class ABTestResultsAnalysis(BaseArtifact):
    test_name: str
    version_a_description: str
    version_b_description: str
    metric_measured: str
    results_summary: Dict[str, Any] # e.g., {"version_a_conversion": "10%", "version_b_conversion": "12%"}
    conclusion: str

class UsabilityHeuristicEvaluation(BaseArtifact):
    evaluation_title: str
    heuristics_applied: List[str] # e.g., "Visibility of system status"
    findings_by_heuristic: Dict[str, List[str]] # e.g., {"heuristic_name": ["issue1", "issue2"]}
    severity_ratings_summary: Optional[Dict[str, Any]] = None # e.g., {"critical": 2, "major": 5}

class UserFeedbackDatabase(BaseArtifact):
    database_name: str
    feedback_entries: List[Dict[str, Any]] # e.g., [{"user_id": "...", "feedback_text": "...", "sentiment": "..."}]

class ConciergeMVPPlan(BaseArtifact):
    plan_name: str
    service_description: str
    manual_steps_involved: List[str]
    target_first_users: str
    expected_learnings: Optional[List[str]] = None

class DesirabilityTestingReport(BaseArtifact):
    report_title: str
    prototype_tested: str
    adjectives_chosen: Dict[str, int] # e.g., {"innovative": 10, "confusing": 3}
    qualitative_summary: str

class CustomerEffortScoreReport(BaseArtifact):
    report_title: str
    task_evaluated: str
    ces_score: float
    key_factors_contributing_to_score: Optional[List[str]] = None
    qualitative_feedback_summary: Optional[str] = None

# Final Concept model from before, still relevant for the very end of the process
class FinalConcept(BaseModel):
    title: str
    narrative: str
    key_features: List[Dict[str, Any]] # More detailed structure could be added later if needed
    feasibility_score: float
    novelty_score: float
