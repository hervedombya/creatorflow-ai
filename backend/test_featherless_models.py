# file: backend/test_featherless_models.py
"""
Test script to compare Featherless models for master prompt generation.
Runs the master prompt builder with different models and logs results.
"""

import os
import json
import time
from dotenv import load_dotenv
from openai import OpenAI


load_dotenv()


# ====== CONFIG ======
FEATHERLESS_API_KEY = os.getenv("FEATHERLESS_API_KEY")

if not FEATHERLESS_API_KEY:
    raise ValueError("FEATHERLESS_API_KEY is not set in environment variables")


# Client Featherless
featherless_client = OpenAI(
    api_key=FEATHERLESS_API_KEY,
    base_url="https://api.featherless.ai/v1"
)


# Models to test (popular on Featherless)
MODELS_TO_TEST = [
    "meta-llama/Meta-Llama-3.1-8B-Instruct",
    "meta-llama/Meta-Llama-3.1-70B-Instruct",
    "Qwen/Qwen2.5-7B-Instruct",
    "Qwen/Qwen2.5-32B-Instruct",
    "NousResearch/Hermes-3-Llama-3.1-8B",
]


# Test input
TEST_BRIEF = {
    "user_text": "Je veux une image de moi avec une casquette gucci",
}


def build_master_prompt(model: str, user_text: str) -> dict:
    """Test a specific model with the master prompt task."""
    
    system_message = (
        "Tu es un expert en prompt engineering pour modèles d'images "
        "(Flux, SDXL, DALL-E). Tu génères UN SEUL prompt ultra clair, en anglais, "
        "optimisé pour le text-to-image. Tu ne rajoutes aucun commentaire autour."
    )

    user_message = f"""
User text: {user_text}

Return a single, clean text-to-image prompt in English. No quotes, no extra text.
"""

    try:
        start_time = time.time()
        
        completion = featherless_client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message},
            ],
            temperature=0.7,
            max_tokens=300,
        )
        
        elapsed_time = time.time() - start_time
        master_prompt = completion.choices[0].message.content.strip()
        
        return {
            "status": "success",
            "model": model,
            "prompt": master_prompt,
            "elapsed_time": round(elapsed_time, 2),
            "tokens_used": completion.usage.total_tokens if completion.usage else "N/A",
        }
    
    except Exception as e:
        return {
            "status": "error",
            "model": model,
            "error": str(e),
        }


def test_all_models():
    """Run tests on all models and display results."""
    
    print("\n" + "="*80)
    print("FEATHERLESS MODELS TEST - Master Prompt Generation")
    print("="*80)
    print(f"\nTest Brief:")
    print(f"  User: {TEST_BRIEF['user_text']}")
    print(f"\n" + "="*80 + "\n")
    
    results = []
    
    for model in MODELS_TO_TEST:
        print(f"🔄 Testing: {model}...")
        result = build_master_prompt(
            model=model,
            user_text=TEST_BRIEF["user_text"],
        )
        results.append(result)
        
        if result["status"] == "success":
            print(f"✅ Success ({result['elapsed_time']}s)")
            print(f"   Tokens: {result['tokens_used']}")
            print(f"   Prompt: {result['prompt'][:100]}...")
        else:
            print(f"❌ Error: {result['error']}")
        print()
    
    # Summary table
    print("\n" + "="*80)
    print("SUMMARY TABLE")
    print("="*80 + "\n")
    
    print(f"{'Model':<45} {'Status':<10} {'Time (s)':<10} {'Tokens':<10}")
    print("-" * 80)
    
    for result in results:
        model_name = result["model"].split("/")[-1][:40]
        status = "✅ OK" if result["status"] == "success" else "❌ FAIL"
        elapsed = result.get("elapsed_time", "N/A")
        tokens = result.get("tokens_used", "N/A")
        print(f"{model_name:<45} {status:<10} {str(elapsed):<10} {str(tokens):<10}")
    
    # Save detailed results
    with open("test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n✨ Full results saved to: test_results.json\n")


def quick_test_single_model(model: str = "meta-llama/Meta-Llama-3.1-8B-Instruct"):
    """Quick test of a single model."""
    
    print(f"\n🚀 Quick Test: {model}\n")
    result = build_master_prompt(
        model=model,
        user_text=TEST_BRIEF["user_text"],
        image_description=TEST_BRIEF["image_description"],
        style=TEST_BRIEF["style"],
        mood=TEST_BRIEF["mood"],
    )
    
    if result["status"] == "success":
        print(f"✅ Generated prompt ({result['elapsed_time']}s):")
        print(f"\n{result['prompt']}\n")
    else:
        print(f"❌ Error: {result['error']}\n")


if __name__ == "__main__":
    import sys
    """
    if len(sys.argv) > 1 and sys.argv[1] == "quick":
        # Quick test of default model
        quick_test_single_model()
    else:
        # Full comparison
        test_all_models()
    """

    dico = test_all_models()
    print(dico)