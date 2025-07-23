import adk

class ConstraintIdentifierAnalyzer(adk.Tool):
    """
    Tool to systematically list and categorize project constraints, technical limitations, or regulatory hurdles.
    Simulates interaction with platforms like Jira or Asana.
    """
    def __init__(self):
        super().__init__(
            name="Constraint Identifier & Analyzer",
            description="Lists and categorizes project constraints, technical limitations, or regulatory hurdles.",
            function=self.identify_constraints
        )

    def identify_constraints(self, project_context: str) -> str:
        """
        Simulates identifying project constraints.

        Args:
            project_context (str): The context of the project or problem.

        Returns:
            str: A simulated list of identified constraints.
        """
        print(f"Tool: ConstraintIdentifierAnalyzer - Identifying constraints for project: '{project_context[:50]}...'")
        if "mobile app" in project_context.lower():
            return "Simulated: Identified constraints: limited budget for backend infrastructure, strict app store review guidelines, need for offline functionality."
        elif "new product launch" in project_context.lower():
            return "Simulated: Identified constraints: 6-month time-to-market, reliance on third-party suppliers, environmental regulations for manufacturing."
        return "Simulated: No specific constraints identified for the project context."
