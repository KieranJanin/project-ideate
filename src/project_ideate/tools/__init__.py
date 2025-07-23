import adk

# Import shared tools
from .shared.feasibility_analyzer import FeasibilityAnalyzer
from .shared.web_research import WebResearch

# Import persona-specific tools
from .anthropologist.observation_data_fetcher import ObservationDataFetcher
from .anthropologist.sentiment_analysis_tool import SentimentAnalysisTool
from .anthropologist.behavioral_pattern_recognizer import BehavioralPatternRecognizer

from .cross_pollinator.cross_industry_search_engine import CrossIndustrySearchEngine
from .cross_pollinator.analogy_generator import AnalogyGenerator
from .cross_pollinator.knowledge_graph_explorer import KnowledgeGraphExplorer

from .hurdler.constraint_identifier_analyzer import ConstraintIdentifierAnalyzer
from .hurdler.problem_solving_frameworks_advisor import ProblemSolvingFrameworksAdvisor
from .hurdler.risk_assessment_mitigation_planner import RiskAssessmentMitigationPlanner

from .experimenter.rapid_prototyping_simulator import RapidPrototypingSimulator
from .experimenter.ab_testing_data_analysis_tool import ABTestingDataAnalysisTool
from .experimenter.feedback_collection_synthesis_tool import FeedbackCollectionSynthesisTool

from .collaborator.team_communication_coordination_integrator import TeamCommunicationCoordinationIntegrator
from .collaborator.knowledge_sharing_platform_access import KnowledgeSharingPlatformAccess
from .collaborator.conflict_resolution_facilitation_guide import ConflictResolutionFacilitationGuide

from .director.team_performance_analytics import TeamPerformanceAnalytics
from .director.motivational_content_generator import MotivationalContentGenerator
from .director.strategic_alignment_checker import StrategicAlignmentChecker

from .experience_architect.user_journey_mapping_tool import UserJourneyMappingTool
from .experience_architect.sensory_design_prototyper import SensoryDesignPrototyper
from .experience_architect.empathy_builder_tool import EmpathyBuilderTool

from .set_designer.space_planning_visualization_tool import SpacePlanningVisualizationTool
from .set_designer.resource_allocation_manager import ResourceAllocationManager
from .set_designer.culture_environment_assessment import CultureEnvironmentAssessment

from .storyteller.narrative_structure_generator import NarrativeStructureGenerator
from .storyteller.audience_empathy_mapper import AudienceEmpathyMapper
from .storyteller.visual_storytelling_asset_creator import VisualStorytellingAssetCreator

from .caregiver.needs_anticipation_prediction import NeedsAnticipationPrediction
from .caregiver.personalized_support_content_generator import PersonalizedSupportContentGenerator
from .caregiver.feedback_loop_integrator import FeedbackLoopIntegrator

# Initialize a global tool registry
TOOL_REGISTRY = {
    "shared.feasibility_analyzer": FeasibilityAnalyzer(),
    "shared.web_research": WebResearch(),
    "anthropologist.observation_data_fetcher": ObservationDataFetcher(),
    "anthropologist.sentiment_analysis_tool": SentimentAnalysisTool(),
    "anthropologist.behavioral_pattern_recognizer": BehavioralPatternRecognizer(),
    "cross_pollinator.cross_industry_search_engine": CrossIndustrySearchEngine(),
    "cross_pollinator.analogy_generator": AnalogyGenerator(),
    "cross_pollinator.knowledge_graph_explorer": KnowledgeGraphExplorer(),
    "hurdler.constraint_identifier_analyzer": ConstraintIdentifierAnalyzer(),
    "hurdler.problem_solving_frameworks_advisor": ProblemSolvingFrameworksAdvisor(),
    "hurdler.risk_assessment_mitigation_planner": RiskAssessmentMitigationPlanner(),
    "experimenter.rapid_prototyping_simulator": RapidPrototypingSimulator(),
    "experimenter.ab_testing_data_analysis_tool": ABTestingDataAnalysisTool(),
    "experimenter.feedback_collection_synthesis_tool": FeedbackCollectionSynthesisTool(),
    "collaborator.team_communication_coordination_integrator": TeamCommunicationCoordinationIntegrator(),
    "collaborator.knowledge_sharing_platform_access": KnowledgeSharingPlatformAccess(),
    "collaborator.conflict_resolution_facilitation_guide": ConflictResolutionFacilitationGuide(),
    "director.team_performance_analytics": TeamPerformanceAnalytics(),
    "director.motivational_content_generator": MotivationalContentGenerator(),
    "director.strategic_alignment_checker": StrategicAlignmentChecker(),
    "experience_architect.user_journey_mapping_tool": UserJourneyMappingTool(),
    "experience_architect.sensory_design_prototyper": SensoryDesignPrototyper(),
    "experience_architect.empathy_builder_tool": EmpathyBuilderTool(),
    "set_designer.space_planning_visualization_tool": SpacePlanningVisualizationTool(),
    "set_designer.resource_allocation_manager": ResourceAllocationManager(),
    "set_designer.culture_environment_assessment": CultureEnvironmentAssessment(),
    "storyteller.narrative_structure_generator": NarrativeStructureGenerator(),
    "storyteller.audience_empathy_mapper": AudienceEmpathyMapper(),
    "storyteller.visual_storytelling_asset_creator": VisualStorytellingAssetCreator(),
    "caregiver.needs_anticipation_prediction": NeedsAnticipationPrediction(),
    "caregiver.personalized_support_content_generator": PersonalizedSupportContentGenerator(),
    "caregiver.feedback_loop_integrator": FeedbackLoopIntegrator()
}

# You can also define a function to retrieve tools
def get_tool(tool_id: str) -> adk.Tool:
    """Retrieves a tool from the registry by its ID."""
    tool = TOOL_REGISTRY.get(tool_id)
    if not tool:
        raise ValueError(f"Tool with ID '{tool_id}' not found in registry.")
    return tool
