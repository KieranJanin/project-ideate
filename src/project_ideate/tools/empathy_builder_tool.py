import adk

class EmpathyBuilderTool(adk.Tool):
    """
    Tool to understand and internalize user perspectives and emotional states.
    Simulates interaction with platforms like Medallia or Qualtrics Customer Experience.
    """
    def __init__(self):
        super().__init__(
            name="Empathy Builder",
            description="Helps to understand and internalize user perspectives and emotional states.",
            function=self.build_empathy
        )

    def build_empathy(self, query: str) -> str:
        """
        Simulates retrieving aggregated customer feedback or specific customer stories.

        Args:
            query (str): The query for empathy data (e.g., "aggregated feedback on post-purchase anxiety").

        Returns:
            str: A simulated summary of empathy-related data.
        """
        print(f"Tool: EmpathyBuilderTool - Building empathy with query: '{query}'")
        if "post-purchase anxiety" in query.lower():
            return "Simulated: Aggregated Feedback: Users often express anxiety during the post-purchase phase due to lack of clear shipping updates and uncertainty about return policies. Common emotion: helplessness."
        elif "customer stories on support" in query.lower():
            return "Simulated: Retrieved customer story: 'Sarah felt ignored when her support ticket went unanswered for days, leading to significant frustration.'"
        return "Simulated: No specific empathy data found for the query."
