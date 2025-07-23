
# Project IDEATE: A Multi-Agent Design Thinking Simulator

**IDEATE**: **I**nteractive **D**esign **E**nsemble **A**gent-based **T**eam **E**xperiment

# Overview

Welcome to **Project IDEATE**, a web-based application that simulates a design thinking team to solve complex creative challenges. This project leverages a multi-agent system, where each AI agent embodies one of **Tom Kelley's "Ten Faces of Innovation."** The core purpose is to create a "Mission Control" dashboard where a user can define a design problem, assemble a team of specialist AI agents, and observe their collaborative (and sometimes conflicting) interactions as they work through the design thinking process.

This simulator is not just a tool for generating ideas; it's an interactive observation deck for studying the very human dynamics of teamwork, creativity, and problem-solving in a controlled, repeatable, AI-driven environment.

# Core Concepts

## 1. Agentic Systems & Team Dynamics

At its heart, this project explores how complex tasks can be accomplished by a team of autonomous agents. Each agent has:

* A distinct Persona (e.g., The Anthropologist, The Hurdler).
* A specific Goal (e.g., generate user insights, identify obstacles).
* A set of Tools (e.g., web search, feasibility analysis).

This mirrors real-world team management, where success depends on clear roles, effective communication, and a process that allows individual specialists to contribute to a collective goal. It's a simulation of a system built on autonomy and trust.

## 2. The Ten Faces of Innovation

The project operationalizes Tom Kelley's framework by modeling each "face" as a configurable agent. The team is grouped into three personas:Learning Personas: The Anthropologist, Experimenter, and Cross-Pollinator who gather information.Organizing Personas: The Director, Collaborator, and Hurdler who manage the process and resources.Building Personas: The Experience Architect, Set Designer, Caregiver, and Storyteller who bring the concepts to life.

## 3. The Design Thinking Process

The simulation is structured around the five classic phases of design thinking. The UI visualizes the team's progress through each stage:
1. Empathize: Understand the user's needs.
2. Define: Frame the core problem.
3. Ideate: Brainstorm potential solutions.
4. Prototype & Test: Analyze feasibility and gather feedback.
5. Finalize: Synthesize the final concept and pitch.

# Features

The application is a single-page web interface designed as a "Mission Control" dashboard:
* Interactive Controls: Start, pause, reset, and control the speed of the simulation.
* Dynamic Team Composition: Use toggles to select which of the "Ten Faces" will participate in a given simulation run, allowing you to experiment with different team structures.
* AI-Powered Generation: The Google Gemini API is integrated to:
    * Generate a detailed Design Challenge from a simple keyword.
    * Dynamically brainstorm unique ideas during the Ideate phase.
    * Synthesize a final, coherent Product Pitch at the end of the simulation.
* Live Interaction Feed: Observe the "conversation" between the agents in real-time, including their internal thoughts, messages to each other, and when they use their tools.
* Project Whiteboard: Track the tangible outputs of the simulation as they are created, including user insights, generated ideas, the final concept, and key performance metrics.

# Tech Stack

* Frontend: HTML, Tailwind CSS, and vanilla JavaScript for a responsive and interactive UI.
* Backend: A Python server built with the Flask web framework.
* Agent Framework: The backend is structured to use the Google Agent Development Kit (ADK) for orchestrating the multi-agent system.
* Core AI: The Google Gemini API provides the reasoning engine for all agents.

# Running the Application

## Prerequisites

* Git
* Conda
* Python 3.11+
* An active Google API Key with the Gemini API enabled.

### 1. Backend Setup

The backend is the Flask server that runs the agent logic.

```bash
# 1. Clone the repository
git clone [https://github.com/KieranJanin/project-ideate.git](https://github.com/KieranJanin/project-ideate.git)
cd project-ideate

# 2. Create and activate a virtual environment using conda
conda env create -f environment.yml
conda activate ideate-env

# 3. Set up your environment variables
# Create a new file named .env in the root directory
# and add your Google API key to it:
echo "GOOGLE_API_KEY='your_google_api_key_here'" > .env

# 4. Run the Flask server
python app.py
```

The backend server will now be running on http://127.0.0.1:5000.

### 2. Frontend Setup

The frontend is a single, self-contained HTML file.Make sure the backend Flask server is running.
* Open the `index.html` file in any modern web browser.
* The user interface will load, and its JavaScript will be able to communicate with your local backend server to power the AI features.