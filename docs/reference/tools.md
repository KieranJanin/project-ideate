# Persona MCP tools

Here's a breakdown of potential tools for each of the "10 Faces of Innovation" personas, focusing on how they could leverage MCP (Micro-Agent Communication Protocol) to interact with various software solutions. The idea is that the agent, acting as a persona, would call these tools, and the tools, in turn, would interact with the specified software via APIs or other integration methods. 🛠️🤝

---

## 1. The Anthropologist 🧑‍🔬

* **Observation Data Fetcher** (MCP Integration: UserTesting.com / Dovetail)
    * Purpose: To programmatically access qualitative research data, user interviews, and ethnographic field notes.
    * MCP Interaction: The Anthropologist agent sends a query (e.g., "fetch recent user interview transcripts about X feature"). The tool, via MCP, calls the UserTesting.com or Dovetail API to retrieve relevant data.
* **Sentiment Analysis Tool** (MCP Integration: Brandwatch / Sprinklr)
    * Purpose: To analyze unstructured text data (social media, reviews) for emotional tones and opinions.
    * MCP Interaction: The Anthropologist agent provides text data. The tool, via MCP, sends this data to Brandwatch or Sprinklr's API, returning a sentiment score or detailed analysis.
* **Behavioral Pattern Recognizer** (MCP Integration: Google Analytics / Mixpanel)
    * Purpose: To identify recurring patterns or anomalies in large datasets of user interactions.
    * MCP Interaction: The Anthropologist agent requests a behavioral report (e.g., "identify common user flows leading to churn"). The tool, via MCP, queries Google Analytics or Mixpanel's API for aggregated behavioral data.

---

## 2. The Cross-Pollinator 🐝

* **Cross-Industry Search Engine** (MCP Integration: Scopus / Orbit Intelligence)
    * Purpose: To find analogous problems and solutions across disparate domains or industries.
    * MCP Interaction: The Cross-Pollinator agent provides a problem description. The tool, via MCP, executes a search across academic (Scopus) or patent (Orbit Intelligence) databases, returning summaries of relevant solutions from other fields.
* **Analogy Generator** (MCP Integration: Custom LLM / Knowledge Retrieval System)
    * Purpose: To suggest conceptual connections between seemingly unrelated concepts or fields.
    * MCP Interaction: The Cross-Pollinator agent provides a concept or problem. The tool, via MCP, queries a specialized LLM or knowledge retrieval system designed to identify and explain analogies.
* **Knowledge Graph Explorer** (MCP Integration: Neo4j / Wikidata Query Service)
    * Purpose: To traverse knowledge graphs to find indirect relationships or inspirations from diverse knowledge bases.
    * MCP Interaction: The Cross-Pollinator agent provides a starting concept. The tool, via MCP, executes a graph query against Neo4j or Wikidata, returning related concepts and their connections.

---

## 3. The Hurdler 🚧

* **Constraint Identifier & Analyzer** (MCP Integration: Jira / Asana)
    * Purpose: To systematically list and categorize project constraints, technical limitations, or regulatory hurdles.
    * MCP Interaction: The Hurdler agent requests current project blockers or limitations. The tool, via MCP, queries Jira or Asana APIs for issues tagged as "blocker," "impediment," or similar, along with their details.
* **Problem-Solving Frameworks Advisor** (MCP Integration: Confluence / Internal Knowledge Base)
    * Purpose: To access databases of known problem-solving methodologies (e.g., TRIZ, Root Cause Analysis) and tools to apply them.
    * MCP Interaction: The Hurdler agent describes a problem type. The tool, via MCP, searches Confluence or an internal knowledge base for relevant problem-solving frameworks and their application guidelines.
* **Risk Assessment & Mitigation Planner** (MCP Integration: Jira Risk Management Module / Custom Risk Software)
    * Purpose: To identify potential risks associated with obstacles and suggest mitigation strategies.
    * MCP Interaction: The Hurdler agent provides an identified obstacle. The tool, via MCP, interacts with a risk management module (e.g., in Jira) or a dedicated risk software to assess the obstacle's risk level and retrieve common mitigation strategies.

---

## 4. The Experimenter 🔬

* **Rapid Prototyping Simulator** (MCP Integration: Figma / Google Cloud Functions)
    * Purpose: To quickly generate virtual prototypes or models for initial testing.
    * MCP Interaction: The Experimenter agent provides design specifications or a feature idea. The tool, via MCP, can either generate a simplified interactive Figma prototype link or deploy a basic function on Google Cloud Functions for quick backend testing.
* **A/B Testing & Data Analysis Tool** (MCP Integration: Optimizely / VWO)
    * Purpose: To design, run, and interpret the results of experiments, providing statistical insights.
    * MCP Interaction: The Experimenter agent requests to set up an A/B test (e.g., "compare two landing page versions") or analyze results. The tool, via MCP, configures the test in Optimizely/VWO and later retrieves performance metrics.
* **Feedback Collection & Synthesis Tool** (MCP Integration: Qualtrics / SurveyMonkey)
    * Purpose: To gather user feedback from prototypes and summarize key insights.
    * MCP Interaction: The Experimenter agent requests a new survey or analysis of existing survey data. The tool, via MCP, creates a survey in Qualtrics/SurveyMonkey or pulls responses for synthesis.

---

## 5. The Collaborator 🤝

* **Team Communication & Coordination Integrator** (MCP Integration: Slack / Microsoft Teams / Asana)
    * Purpose: To bridge different communication platforms and help coordinate tasks.
    * MCP Interaction: The Collaborator agent can send messages to channels, create tasks, or set reminders. The tool, via MCP, interacts with Slack, Teams, or Asana APIs to perform these actions.
* **Knowledge Sharing Platform Access** (MCP Integration: Notion / SharePoint / Google Drive)
    * Purpose: To facilitate sharing of documents, ideas, and expertise across team members.
    * MCP Interaction: The Collaborator agent requests to share a document, find relevant information, or create a new shared page. The tool, via MCP, interacts with the respective platform's API (e.g., Google Drive API for file sharing).
* **Conflict Resolution & Facilitation Guide** (MCP Integration: Internal HR/Leadership Platform / Custom Knowledge Base)
    * Purpose: To provide resources or frameworks to help mediate discussions and foster consensus within diverse teams.
    * MCP Interaction: The Collaborator agent queries for advice on a specific team conflict scenario. The tool, via MCP, retrieves relevant guidelines or mediation techniques from an internal HR platform or knowledge base.

---

## 6. The Director 🎬

* **Team Performance Analytics** (MCP Integration: Jira / Asana / OKR Platforms like Lattice)
    * Purpose: To monitor project progress, individual contributions, and team well-being.
    * MCP Interaction: The Director agent requests a performance summary (e.g., "show progress on key initiatives"). The tool, via MCP, pulls data from Jira (task completion), Asana (project status), or Lattice (OKR progress).
* **Motivational Content Generator** (MCP Integration: Internal Communication Tool / Custom Content Service)
    * Purpose: To create inspiring messages, vision statements, or recognition narratives.
    * MCP Interaction: The Director agent provides context (e.g., "team achieved a milestone"). The tool, via MCP, generates a draft message and can potentially post it to an internal communication platform.
* **Strategic Alignment Checker** (MCP Integration: Lattice / Ally.io)
    * Purpose: To ensure that tasks and initiatives remain aligned with overall innovation goals.
    * MCP Interaction: The Director agent queries the alignment of a specific task or project. The tool, via MCP, checks the OKR platform (Lattice/Ally.io) to verify if the task contributes to defined objectives and key results.

---

## 7. The Experience Architect 🏗️

* **User Journey Mapping Tools** (MCP Integration: Miro / Lucidchart)
    * Purpose: To visualize and analyze user touchpoints, emotions, and pain points throughout an experience.
    * MCP Interaction: The Experience Architect agent requests to create or update a user journey map. The tool, via MCP, interacts with Miro or Lucidchart APIs to add elements, update flows, or extract journey insights.
* **Sensory Design Prototyper** (MCP Integration: Domain-Specific APIs for Sound/Haptics)
    * Purpose: To help design and simulate multi-sensory aspects of an experience.
    * MCP Interaction: The Experience Architect agent specifies a desired sensory output (e.g., "generate a calming soundscape for a waiting experience"). The tool, via MCP, calls an audio generation API or haptics simulation API to produce or describe the output.
* **Empathy Builder** (MCP Integration: Medallia / Qualtrics Customer Experience)
    * Purpose: To understand and internalize user perspectives and emotional states.
    * MCP Interaction: The Experience Architect agent requests aggregated customer feedback or specific customer stories related to emotional experiences. The tool, via MCP, queries Medallia or Qualtrics CX platforms for relevant data.

---

## 8. The Set Designer 🏞️

* **Space Planning & Visualization** (MCP Integration: AutoCAD API / SketchUp API)
    * Purpose: To design and visualize physical or virtual collaborative spaces.
    * MCP Interaction: The Set Designer agent provides layout requirements (e.g., "design a flexible brainstorming space for 8 people"). The tool, via MCP, interacts with AutoCAD or SketchUp APIs to generate a basic layout or provide design suggestions.
* **Resource Allocation Manager** (MCP Integration: Monday.com / Smartsheet)
    * Purpose: To track and optimize the use of physical or digital resources within an innovation environment.
    * MCP Interaction: The Set Designer agent queries resource availability or requests allocation (e.g., "find an available innovation lab next Tuesday"). The tool, via MCP, checks Monday.com or Smartsheet for resource schedules.
* **Culture & Environment Assessment** (MCP Integration: Culture Amp / Qualtrics Employee Experience)
    * Purpose: To gauge the current innovation culture and suggest interventions.
    * MCP Interaction: The Set Designer agent requests insights on team sentiment regarding the workspace. The tool, via MCP, pulls aggregated data from Culture Amp or Qualtrics EX surveys.

---

## 9. The Storyteller 🗣️

* **Narrative Structure Generator** (MCP Integration: Custom LLM / Jasper)
    * Purpose: To suggest compelling story arcs, character archetypes, or dramatic elements.
    * MCP Interaction: The Storyteller agent provides a core idea or message. The tool, via MCP, queries a generative AI model (like a fine-tuned LLM or Jasper) to suggest narrative structures or outlines.
* **Audience Empathy Mapper** (MCP Integration: Salesforce / HubSpot)
    * Purpose: To analyze target audiences and tailor messaging for maximum resonance.
    * MCP Interaction: The Storyteller agent provides an audience segment description. The tool, via MCP, retrieves audience demographics, preferences, and common pain points from Salesforce or HubSpot CRM data.
* **Visual Storytelling Asset Creator** (MCP Integration: Midjourney API / DALL-E API / Canva API)
    * Purpose: To generate or suggest visual aids (e.g., simple graphics, presentation outlines).
    * MCP Interaction: The Storyteller agent provides a visual concept or text prompt. The tool, via MCP, sends this to Midjourney or DALL-E to generate an image, or uses Canva's API to suggest presentation templates.

---

## 10. The Caregiver ❤️

* **Needs Anticipation & Prediction** (MCP Integration: Salesforce Service Cloud / Zendesk)
    * Purpose: To analyze user behavior or patterns to proactively identify potential needs or pain points.
    * MCP Interaction: The Caregiver agent requests a prediction of common user issues based on recent interactions. The tool, via MCP, analyzes historical data in Salesforce Service Cloud or Zendesk to identify predictive patterns.
* **Personalized Support Content Generator** (MCP Integration: Intercom / Salesforce Service Cloud)
    * Purpose: To create tailored advice, FAQs, or troubleshooting steps based on individual user contexts.
    * MCP Interaction: The Caregiver agent provides a user's query and context. The tool, via MCP, generates a personalized response or relevant FAQ article using Intercom or Salesforce Service Cloud's knowledge base.
* **Feedback Loop Integrator** (MCP Integration: Zendesk / Freshdesk)
    * Purpose: To collect and categorize customer/team feedback, ensuring concerns are addressed and trust is maintained.
    * MCP Interaction: The Caregiver agent requests to log new feedback or check the status of a previous feedback item. The tool, via MCP, interacts with Zendesk or Freshdesk APIs to create tickets or retrieve status updates, ensuring feedback is tracked.

---

This comprehensive list highlights how each persona, augmented by specialized tools and integrated via MCP, can contribute uniquely and effectively across the Design Thinking process.