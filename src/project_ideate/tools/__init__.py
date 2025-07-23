import adk
from .feasibility_analyzer import FeasibilityAnalyzer
from .web_research import WebResearch
from .observation_data_fetcher import ObservationDataFetcher
from .sentiment_analysis_tool import SentimentAnalysisTool
from .behavioral_pattern_recognizer import BehavioralPatternRecognizer
from .cross_industry_search_engine import CrossIndustrySearchEngine
from .analogy_generator import AnalogyGenerator
from .knowledge_graph_explorer import KnowledgeGraphExplorer
from .constraint_identifier_analyzer import ConstraintIdentifierAnalyzer
from .problem_solving_frameworks_advisor import ProblemSolvingFrameworksAdvisor
from .risk_assessment_mitigation_planner import RiskAssessmentMitigationPlanner
from .rapid_prototyping_simulator import RapidPrototypingSimulator
from .ab_testing_data_analysis_tool import ABTestingDataAnalysisTool
from .feedback_collection_synthesis_tool import FeedbackCollectionSynthesisTool
from .team_communication_coordination_integrator import TeamCommunicationCoordinationIntegrator
from .knowledge_sharing_platform_access import KnowledgeSharingPlatformAccess
from .conflict_resolution_facilitation_guide import ConflictResolutionFacilitationGuide
from .team_performance_analytics import TeamPerformanceAnalytics
from .motivational_content_generator import MotivationalContentGenerator
from .strategic_alignment_checker import StrategicAlignmentChecker
from .user_journey_mapping_tool import UserJourneyMappingTool
from .sensory_design_prototyper import SensoryDesignPrototyper
from .empathy_builder_tool import EmpathyBuilderTool
from .space_planning_visualization_tool import SpacePlanningVisualizationTool
from .resource_allocation_manager import ResourceAllocationManager
from .culture_environment_assessment import CultureEnvironmentAssessment
from .narrative_structure_generator import NarrativeStructureGenerator
from .audience_empathy_mapper import AudienceEmpathyMapper
from .visual_storytelling_asset_creator import VisualStorytellingAssetCreator
from .needs_anticipation_prediction import NeedsAnticipationPrediction
from .personalized_support_content_generator import PersonalizedSupportContentGenerator
from .feedback_loop_integrator import FeedbackLoopIntegrator

# Initialize a global tool registry
TOOL_REGISTRY = {
    "feasibility_analyzer": FeasibilityAnalyzer(),
    "web_research": WebResearch(),
    "observation_data_fetcher": ObservationDataFetcher(),
    "sentiment_analysis_tool": SentimentAnalysisTool(),
    "behavioral_pattern_recognizer": BehavioralPatternRecognizer(),
    "cross_industry_search_engine": CrossIndustrySearchEngine(),
    "analogy_generator": AnalogyGenerator(),
    "knowledge_graph_explorer": KnowledgeGraphExplorer(),
    "constraint_identifier_analyzer": ConstraintIdentifierAnalyzer(),
    "problem_solving_frameworks_advisor": ProblemSolvingFrameworksAdvisor(),
    "risk_assessment_mitigation_planner": RiskAssessmentMitigationPlanner(),
    "rapid_prototyping_simulator": RapidPrototypingSimulator(),
    "ab_testing_data_analysis_tool": ABTestingDataAnalysisTool(),
    "feedback_collection_synthesis_tool": FeedbackCollectionSynthesisTool(),
    "team_communication_coordination_integrator": TeamCommunicationCoordinationIntegrator(),
    "knowledge_sharing_platform_access": KnowledgeSharingPlatformAccess(),
    "conflict_resolution_facilitation_guide": ConflictResolutionFacilitationGuide(),
    "team_performance_analytics": TeamPerformanceAnalytics(),
    "motivational_content_generator": MotivationalContentGenerator(),
    "strategic_alignment_checker": StrategicAlignmentChecker(),
    "user_journey_mapping_tool": UserJourneyMappingTool(),
    "sensory_design_prototyper": SensoryDesignPrototyper(),
    "empathy_builder_tool": EmpathyBuilderTool(),
    "space_planning_visualization_tool": SpacePlanningVisualizationTool(),
    "resource_allocation_manager": ResourceAllocationManager(),
    "culture_environment_assessment": CultureEnvironmentAssessment(),
    "narrative_structure_generator": NarrativeStructureGenerator(),
    "audience_empathy_mapper": AudienceEmpathyMapper(),
    "visual_storytelling_asset_creator": VisualStorytellingAssetCreator(),
    "needs_anticipation_prediction": NeedsAnticipationPrediction(),
    "personalized_support_content_generator": PersonalizedSupportContentGenerator(),
    "feedback_loop_integrator": FeedbackLoopIntegrator()
}

# You can also define a function to retrieve tools
def get_tool(tool_id: str) -> adk.Tool:
    """Retrieves a tool from the registry by its ID."""
    tool = TOOL_REGISTRY.get(tool_id)
    if not tool:
        raise ValueError(f"Tool with ID '{tool_id}' not found in registry.")
    return tool
