import adk

class FeedbackCollectionSynthesisTool(adk.Tool):
    """
    Tool to gather user feedback from prototypes and summarize key insights.
    Simulates interaction with platforms like Qualtrics or SurveyMonkey.
    """
    def __init__(self):
        super().__init__(
            name="Feedback Collection & Synthesis Tool",
            description="Gathers user feedback from prototypes and summarizes key insights.",
            function=self.collect_and_synthesize_feedback
        )

    def collect_and_synthesize_feedback(self, feedback_context: str) -> str:
        """
        Simulates collecting and synthesizing user feedback.

        Args:
            feedback_context (str): The context for feedback (e.g., "feedback on new signup flow").

        Returns:
            str: A simulated summary of user feedback.
        """
        print(f"Tool: FeedbackCollectionSynthesisTool - Collecting and synthesizing feedback for: '{feedback_context[:50]}...'")
        if "signup flow" in feedback_context.lower():
            return "Simulated: Synthesized Feedback: 80% of users found the new signup flow intuitive, but 20% expressed confusion regarding the password requirements. Key quotes: 'It was fast!', 'What's with the symbols?'"
        elif "new feature" in feedback_context.lower():
            return "Simulated: Synthesized Feedback: Users generally liked the new feature's concept but found the navigation to it unintuitive. Suggestion: improve discoverability."
        return "Simulated: No specific feedback or synthesis available for the context."
