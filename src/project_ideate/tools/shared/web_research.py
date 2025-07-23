# Assuming 'Agent' and 'settings' are imported from your project's agent and config modules
from google.adk.agents import Agent
from project_ideate.config import settings

# Make sure you import the actual Google Search tool
# from Google Search import search as Google Search # Or however it's imported in your environment
# For this example, we'll use the provided tool definition directly.

# 1. Define the WebSearchAgent
# This agent will use the real Google Search tool and summarize results with Gemini.
web_search_agent = Agent(
    name="WebSearchAgent",
    model=settings.DEFAULT_MODEL,  # Use your default Gemini model
    instruction=(
        "You are a knowledgeable agent that can provide information on any topic "
        "in no more than a short paragraph. You will use web search to find information."
    ),
    # tools=[Google Search] # Using the actual Google Search tool
)

# 2. Adapt the search_web function to use the WebSearchAgent
def search_web(query: str) -> str:
    """
    Performs a web search by passing the query to a WebSearchAgent
    and returns a concise summary of the top results.
    """
    print(f"Tool Used: search_web(query='{query}') - Delegating to WebSearchAgent")
    
    # Run the WebSearchAgent with the given query
    # The agent will internally use the Google Search tool and summarize the findings.
    try:
        response = web_search_agent.run(query)
        # Assuming the agent's response is the summarized paragraph
        return response.text if hasattr(response, 'text') else str(response)
    except Exception as e:
        return f"An error occurred during web search via agent: {e}"