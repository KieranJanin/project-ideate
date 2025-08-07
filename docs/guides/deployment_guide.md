# Deployment Guide

This guide outlines the steps required to deploy the Project IDEATE application. It covers both the backend Flask application and the frontend web interface, with a focus on deploying the frontend using Firebase Hosting.

## Prerequisites

-   A server or hosting environment capable of running Python applications (for the backend).
-   A Firebase project (for frontend hosting).
-   The Firebase CLI installed (see [docs/firebase_hosting_setup.md](/docs/firebase_hosting_setup.md)).
-   Python 3.11 or higher installed.
-   An active Google API Key with the Gemini API enabled.

## Backend Deployment

The backend is a Flask application. The deployment steps will vary depending on your chosen hosting environment (e.g., Heroku, AWS, Google Cloud Platform, a virtual private server). However, the general steps involve:

1.  **Clone the repository:** Clone the project repository onto your server.

