# file: main.py
import os
from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
import replicate
from fastapi.middleware.cors import CORSMiddleware

# ====== CONFIG (remplace par tes vraies clés ou mets-les dans .env) ======
FEATHERLESS_API_KEY = "rc_8aafbae07f90d1bd0bc81007de53f20942bba28cdf75f70ccb9b5697beff44a3"
FEATHERLESS_MODEL = "featherless_ai/meta-llama/Meta-Llama-3.1-8B-Instruct"  # modèle recommandé [web:5][web:12]
REPLICATE_API_TOKEN = "r8_xxx_ton_token_replicate"  # à mettre dans ton env [web:11]
os.environ["REPLICATE_API_TOKEN"] = REPLICATE_API_TOKEN

# Client Featherless (API compatible OpenAI) [web:5][web:9][web:12]
featherless_client = OpenAI(
    api_key=FEATHERLESS_API_KEY,
    base_url="https://api.featherless.ai/v1"
)

app = FastAPI(title="MasterPrompt → Image")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PromptInput(BaseModel):
    user_text: str              # petit texte de l'user
    image_description: str = "" # description de l’image / style
    style: str = "cinematic"
    mood: str = "epic"


class GenerationResponse(BaseModel):
    master_prompt: str
    image_url: str


def build_master_prompt(user_text: str, image_description: str, style: str, mood: str) -> str:
    """
    Appelle Featherless pour transformer l’input user en master prompt optimisé. [web:5][web:12]
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
    )  # [web:5][web:9][web:12]

    master_prompt = completion.choices[0].message.content.strip()
    return master_prompt


def generate_image_from_prompt(prompt: str) -> str:
    """
    Envoie le master prompt à Flux Pro via Replicate et renvoie l’URL de l’image. [web:11][web:17]
    """
    output = replicate.run(
        "black-forest-labs/flux-pro",  # modèle text→image [web:17]
        input={"prompt": prompt}
    )  # output = liste d’URLs ou chemins selon le modèle [web:11][web:17]

    # La plupart des intégrations Flux sur Replicate renvoient une liste d’URLs. [web:11]
    if isinstance(output, list) and len(output) > 0:
        return output[0]
    # fallback brut
    return str(output)


@app.post("/generate", response_model=GenerationResponse)
def generate_endpoint(payload: PromptInput):
    # 1) master prompt
    master_prompt = build_master_prompt(
        user_text=payload.user_text,
        image_description=payload.image_description,
        style=payload.style,
        mood=payload.mood,
    )

    # 2) génération image
    image_url = generate_image_from_prompt(master_prompt)

    return GenerationResponse(
        master_prompt=master_prompt,
        image_url=image_url,
    )


@app.get("/")
def root():
    return {"status": "ok", "message": "MasterPrompt → Image API"}
