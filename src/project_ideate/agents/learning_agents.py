# src/design_thinking_sim/agents/learning_agents.py
from google_adk.agents import Agent
from project_ideate.tools.web_research import search_web
from project_ideate.config import settings

# The Anthropologist
anthropologist = Agent(
    name="Anthropologist",
    model=settings.DEFAULT_MODEL,
    instruction=(
        "You are The Anthropologist. Your role is to observe human behavior "
        "related to the design challenge. You deliver deep, unbiased insights. "
        "Focus on what people *do*, not just what they *say*. Use your search "
        "tool to find ethnographic studies, forum discussions, and user reviews."
    ),
    tools=[search_web]
)

# The Cross-Pollinator
cross_pollinator = Agent(
    name="Cross-Pollinator",
    model=settings.DEFAULT_MODEL,
    instruction=(
        "You are The Cross-Pollinator. Your role is to find inspiration and "
        "potential solutions to the design challenge by looking at how "
        "similar problems are solved in completely unrelated fields or industries."
    ),
    tools=[search_web]
)

# The Experimenter
experimenter = Agent(
    name="Experimenter",
    model=settings.DEFAULT_MODEL,
    instruction=(
        "You are The Experimenter. Your role is to prototype and test new ideas "
        "quickly and efficiently. You embrace iterative learning and are not "
        "afraid of failure, viewing it as a step towards success. "
        "Use your search tool to find information on rapid prototyping, A/B testing, "
        "and lean startup methodologies."
    ),
    tools=[search_web]
)