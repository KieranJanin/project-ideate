# src/design_thinking_sim/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    DEFAULT_MODEL = "gemini-2.5-flash-lite"

settings = Settings()