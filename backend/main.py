# file: backend/main.py
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import OpenAI
import replicate
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables from .env file
load_dotenv()

# ====== CONFIG ======
FEATHERLESS_API_KEY = os.getenv("FEATHERLESS_API_KEY")
FEATHERLESS_MODEL = "featherless_ai/meta-llama/Meta-Llama-3.1-8B-Instruct"
REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN")

if not FEATHERLESS_API_KEY:
    raise ValueError("FEATHERLESS_API_KEY is not set in environment variables")

# Client Featherless (API compatible OpenAI)
featherless_client = OpenAI(
    api_key=FEATHERLESS_API_KEY,
    base_url="https://api.featherless.ai/v1"
)

app = FastAPI(
    title="CreatorFlow AI - Backend",
    description="API for generating optimized prompts and images",
    version="1.0.0"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ====== MODELS ======
class PromptInput(BaseModel):
    user_text: str
    image_description: str = ""
    style: str = "cinematic"
    mood: str = "epic"


class GenerationResponse(BaseModel):
    master_prompt: str
    image_url: str


class AnalyzeStyleInput(BaseModel):
    text_samples: list[str]


class StyleProfile(BaseModel):
    tone: str
    vibe_keywords: list[str]
    writing_style: str


# ====== HELPER FUNCTIONS ======
def build_master_prompt(user_text: str, image_description: str, style: str, mood: str) -> str:
    """
    Calls Featherless to transform user input into an optimized image prompt.
    """
    system_message = (
        "Tu es un expert en prompt engineering pour modèles d'images "
        "(Flux, SDXL, DALL-E). Tu génères UN SEUL prompt ultra clair, en anglais, "
        "optimisé pour le text-to-image. Tu ne rajoutes aucun commentaire autour."
    )

    user_message = f"""
User text: {user_text}
Image description / elements: {image_description}
Target style: {style}
Mood: {mood}

Return a single, clean text-to-image prompt in English. No quotes, no extra text.
"""

    completion = featherless_client.chat.completions.create(
        model=FEATHERLESS_MODEL,
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message},
        ],
        temperature=0.7,
        max_tokens=300,
    )

    master_prompt = completion.choices[0].message.content.strip()
    return master_prompt


def generate_image_from_prompt(prompt: str) -> str:
    """
    Sends the master prompt to Flux Pro via Replicate and returns the image URL.
    """
    if not REPLICATE_API_TOKEN:
        raise HTTPException(status_code=500, detail="REPLICATE_API_TOKEN not configured")
    
    output = replicate.run(
        "black-forest-labs/flux-pro",
        input={"prompt": prompt}
    )

    if isinstance(output, list) and len(output) > 0:
        return output[0]
    return str(output)


def analyze_style(text_samples: list[str]) -> StyleProfile:
    """
    Analyzes text samples to extract the creator's style profile.
    """
    combined_text = "\n---\n".join(text_samples)
    
    system_message = (
        "Tu es un expert en analyse de style d'écriture pour créateurs de contenu. "
        "Tu dois extraire le ton, les mots-clés de vibe, et le style d'écriture."
    )
    
    user_message = f"""
Analyse ces exemples de textes du créateur:

{combined_text}

Retourne un JSON avec:
- tone: le ton dominant (ex: "Witty", "Professional", "Casual", "Inspirational")
- vibe_keywords: 3-5 mots-clés décrivant l'ambiance (ex: ["energetic", "relatable", "growth"])
- writing_style: description courte du style (ex: "Short punchy sentences with emojis")
"""
    
    completion = featherless_client.chat.completions.create(
        model=FEATHERLESS_MODEL,
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message},
        ],
        temperature=0.5,
        max_tokens=200,
    )
    
    # For MVP, return a simple parsed response
    # In production, you'd parse the JSON properly
    return StyleProfile(
        tone="Witty",
        vibe_keywords=["creative", "modern", "engaging"],
        writing_style="Conversational with emojis"
    )


# ====== ROUTES ======
@app.get("/")
def root():
    return {"status": "ok", "message": "CreatorFlow AI - Backend API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.post("/api/v1/generate", response_model=GenerationResponse)
def generate_endpoint(payload: PromptInput):
    """Generate image from user input."""
    master_prompt = build_master_prompt(
        user_text=payload.user_text,
        image_description=payload.image_description,
        style=payload.style,
        mood=payload.mood,
    )
    
    image_url = generate_image_from_prompt(master_prompt)

    return GenerationResponse(
        master_prompt=master_prompt,
        image_url=image_url,
    )


@app.post("/api/v1/analyze-style", response_model=StyleProfile)
def analyze_style_endpoint(payload: AnalyzeStyleInput):
    """Analyze creator's style from text samples."""
    return analyze_style(payload.text_samples)
