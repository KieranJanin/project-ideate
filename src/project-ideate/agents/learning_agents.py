# src/design_thinking_sim/agents/learning_agents.py
from google_adk.agents import Agent
from design_thinking_sim.tools.web_research import search_web
from design_thinking_sim.config import settings

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
cross_pollinator = Agent(...)