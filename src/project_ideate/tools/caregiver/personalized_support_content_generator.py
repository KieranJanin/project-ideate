import adk

class PersonalizedSupportContentGenerator(adk.Tool):
    """
    Tool to create tailored advice, FAQs, or troubleshooting steps based on individual user contexts.
    Simulates interaction with platforms like Intercom or Salesforce Service Cloud.
    """
    def __init__(self):
        super().__init__(
            name="Personalized Support Content Generator",
            description="Creates tailored advice, FAQs, or troubleshooting steps based on individual user contexts.",
            function=self.generate_support_content
        )

    def generate_support_content(self, user_query_context: str) -> str:
        """
        Simulates generating personalized support content.

        Args:
            user_query_context (str): The user's query and context (e.g., "user asking about billing on subscription plan").

        Returns:
            str: A simulated personalized support response.
        """
        print(f"Tool: PersonalizedSupportContentGenerator - Generating content for query: '{user_query_context}'")
        if "billing on subscription plan" in user_query_context.lower():
            return "Simulated: Personalized Support: 'For your Premium Plan, monthly billing occurs on the 15th. You can view past invoices in your dashboard under 'Billing History'. If you have a specific charge in mind, please provide the date.'"
        elif "troubleshooting login issue" in user_query_context.lower():
            return "Simulated: Personalized Support: 'It seems you're having trouble logging in. Please try resetting your password using the 'Forgot Password' link. If that doesn't work, ensure you're using the email address associated with your account.'"
        return "Simulated: No specific support content generated for the context."
