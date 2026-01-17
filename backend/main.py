# file: backend/main.py
import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from openai import OpenAI
from google import genai
from google.genai import types
from io import BytesIO
from PIL import Image
import base64
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
# In production (Railway/Render), env vars are set directly
# In local dev, load from backend/.env file
env_path = Path(__file__).parent / '.env'
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    # Production: load from environment (Railway/Render sets these)
    load_dotenv()

# ====== CONFIG ======
FEATHERLESS_API_KEY = os.getenv("FEATHERLESS_API_KEY")
# Modèle 70B pour master prompt (meilleure qualité)
FEATHERLESS_MODEL = "meta-llama/Meta-Llama-3.1-70B-Instruct"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not FEATHERLESS_API_KEY:
    raise ValueError("FEATHERLESS_API_KEY is not set in environment variables")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in environment variables")

# Client Featherless (API compatible OpenAI)
featherless_client = OpenAI(
    api_key=FEATHERLESS_API_KEY,
    base_url="https://api.featherless.ai/v1"
)

# Gemini client (nouveau SDK)
gemini_client = genai.Client(api_key=GEMINI_API_KEY)

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


class GenerationResponse(BaseModel):
    master_prompt: str
    image_url: str
    caption: str


# ====== HELPER FUNCTIONS ======
def build_master_prompt(user_text: str, image_context: str = "") -> str:
    """
    Simple transformation of user text into image prompt (no complex optimization).
    Takes into account uploaded images.
    """
    system_message = (
        "Transforme le texte de l'utilisateur en un prompt simple pour génération d'image. "
        f"{image_context} " +
        "Garde le sens original, traduis en anglais si nécessaire, rends-le concis. "
        "Retourne UNIQUEMENT le prompt, sans guillemets, sans commentaires."
    )

    user_message = f"Texte utilisateur: {user_text}\nTransforme en prompt simple pour image."

    completion = featherless_client.chat.completions.create(
        model=FEATHERLESS_MODEL,
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message},
        ],
        temperature=0.5,
        max_tokens=150,
    )

    master_prompt = completion.choices[0].message.content.strip()
    return master_prompt


def generate_caption(user_text: str, format: str = "post", platforms: list = None) -> str:
    """
    Generates an engaging caption for social media content.
    """
    if platforms is None:
        platforms = ["instagram"]
    
    system_message = (
        "Tu es un expert en création de contenu pour réseaux sociaux (Instagram, TikTok, Facebook). "
        "Tu génères des captions engageantes, authentiques et adaptées au format et à la plateforme. "
        "Utilise des emojis pertinents, un ton naturel et des hooks accrocheurs. "
        "Retourne UNIQUEMENT la caption, sans guillemets, sans introduction."
    )

    format_description = {
        "post": "Post Instagram carré",
        "story": "Story Instagram",
        "reel": "Reel/TikTok"
    }.get(format, "Post Instagram carré")

    user_message = f"""
User request: {user_text}
Format: {format_description}
Platforms: {', '.join(platforms)}

Génère une caption parfaite pour ce contenu.
"""

    completion = featherless_client.chat.completions.create(
        model=FEATHERLESS_MODEL,
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message},
        ],
        temperature=0.8,
        max_tokens=500,
    )

    caption = completion.choices[0].message.content.strip()
    return caption


def generate_image_from_prompt(prompt: str, image_bytes: bytes) -> str:
    """
    Sends image input + master prompt to Gemini 2.5 Flash Image (edit mode).
    Returns edited image as base64 data URL.
    """
    try:
        # Prepare image part for Gemini (multimodal)
        image_part = types.Part.from_bytes(
            data=image_bytes,
            mime_type="image/jpeg",
        )

        # Call Gemini with image + text prompt
        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=[prompt, image_part],
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE"],
            ),
        )

        # Extract image from response
        generated_image_bytes = None
        for part in response.parts:
            if part.inline_data is not None:
                # part.inline_data.data contient les bytes bruts de l'image
                generated_image_bytes = part.inline_data.data
                break

        if generated_image_bytes is None:
            raise HTTPException(status_code=500, detail="No image generated by Gemini")

        # Convertir les bytes directement en base64 (pas besoin de PIL)
        img_base64 = base64.b64encode(generated_image_bytes).decode()

        return f"data:image/png;base64,{img_base64}"

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate image: {str(e)}"
        )



# ====== ROUTES ======
@app.get("/")
def root():
    return {"status": "ok", "message": "CreatorFlow AI - Backend API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.post("/api/v1/generate", response_model=GenerationResponse)
async def generate_endpoint(
    user_text: str = Form(...),
    file: UploadFile = File(...),
    product_file: UploadFile = File(None),
    format: str = Form("post"),
    platforms: str = Form("instagram")
):
    """
    Generate edited image and caption from user text + uploaded images.
    
    Usage:
    - user_text: "Ajoute moi une casquette gucci"
    - file: image.jpg (reference image - required)
    - product_file: product.jpg (product image - optional)
    - format: "post", "story", or "reel" (optional, default: "post")
    - platforms: comma-separated list like "instagram,tiktok" (optional, default: "instagram")
    """
    # Parse platforms
    platforms_list = [p.strip() for p in platforms.split(",")]
    
    # Check if product image was provided
    has_product_image = product_file is not None
    
    # 1) Generate simple prompt (taking into account uploaded images)
    image_context = "L'utilisateur a fourni deux images : référence (créateur) et produit." if has_product_image else "L'utilisateur a fourni une image de référence (créateur)."
    master_prompt = build_master_prompt(user_text=user_text, image_context=image_context)
    caption = generate_caption(user_text=user_text, format=format, platforms=platforms_list)

    # 2) Read uploaded image
    image_bytes = await file.read()

    # 3) Send to Gemini for editing
    image_url = generate_image_from_prompt(master_prompt, image_bytes)

    return GenerationResponse(
        master_prompt=master_prompt,
        image_url=image_url,
        caption=caption,
    )


# ====== TEST LOCAL (en bas du fichier) ======
if __name__ == "__main__":
    import sys

    # Usage: python main.py "text_here" path/to/image.jpg
    if len(sys.argv) < 3:
        print("Usage: python main.py '<user_text>' '<image_path>'")
        print("Example: python main.py 'Ajoute moi une casquette gucci' input.jpeg")
        sys.exit(1)

    user_text = sys.argv[1]
    image_path = sys.argv[2]

    print(f"\n=== CreatorFlow AI - Test Local ===")
    print(f"User text: {user_text}")
    print(f"Image path: {image_path}\n")

    # 1) Build master prompt
    print("📝 Building master prompt...")
    prompt = build_master_prompt(user_text)
    print(f"✓ Master Prompt:\n{prompt}\n")

    # 2) Load image
    print(f"📷 Loading image from {image_path}...")
    if not os.path.exists(image_path):
        print(f"❌ File not found: {image_path}")
        sys.exit(1)

    with open(image_path, "rb") as f:
        image_bytes = f.read()
    print(f"✓ Image loaded ({len(image_bytes)} bytes)\n")

    # 3) Generate edited image
    print("🎨 Generating edited image with Gemini...")
    image_data_url = generate_image_from_prompt(prompt, image_bytes)
    print(f"✓ Image generated\n")

    # 4) Save result
    print("💾 Saving result...")
    header, b64data = image_data_url.split(",", 1)
    img_bytes = base64.b64decode(b64data)

    output_path = "test_gucci.png"
    with open(output_path, "wb") as f:
        f.write(img_bytes)

    print(f"✓ Image saved to: {output_path}")
    print(f"✓ Size: {len(img_bytes)} bytes\n")
    print("=== Done ===\n")
