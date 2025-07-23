import adk

class MotivationalContentGenerator(adk.Tool):
    """
    Tool to create inspiring messages, vision statements, or recognition narratives.
    Simulates interaction with an Internal Communication Tool or Custom Content Service.
    """
    def __init__(self):
        super().__init__(
            name="Motivational Content Generator",
            description="Creates inspiring messages, vision statements, or recognition narratives.",
            function=self.generate_content
        )

    def generate_content(self, context: str) -> str:
        """
        Simulates generating motivational content.

        Args:
            context (str): The context for the content (e.g., "team achieved a milestone").

        Returns:
            str: A simulated motivational message.
        """
        print(f"Tool: MotivationalContentGenerator - Generating content for context: '{context}'")
        if "milestone" in context.lower():
            return "Simulated: Team, what an incredible achievement! Reaching this milestone is a testament to your relentless dedication and collaborative spirit. Let's carry this momentum forward!"
        elif "vision" in context.lower():
            return "Simulated: Vision Statement: 'To empower every individual to effortlessly transform complex challenges into delightful, human-centered solutions.'"
        return "Simulated: Could not generate specific motivational content for the context."
