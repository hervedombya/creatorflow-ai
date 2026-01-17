import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize Clients
const featherless = new OpenAI({
  apiKey: process.env.FEATHERLESS_API_KEY || '',
  baseURL: "https://api.featherless.ai/v1"
});

// Prompt Architect Logic (Ported from Python)
class PromptArchitect {
  static constructSystemPrompt(context: any): string {
    const baseRole = "Tu es un directeur artistique IA expert en création de contenu viral.";
    
    // Safety checks for undefined/null arrays
    const styleInstruction = context.visual_style && context.visual_style.length > 0
      ? `Style Visuel Cible: ${context.visual_style.join(', ')}.` 
      : "";
      
    const toneInstruction = context.tone && context.tone.length > 0
      ? `Ton de communication: ${context.tone.join(', ')}.` 
      : "";
      
    const nicheInstruction = context.niche 
      ? `Niche: ${context.niche} ${context.sub_niche ? `(${context.sub_niche})` : ''}.` 
      : "";

    return `${baseRole}
${nicheInstruction}
${styleInstruction}
${toneInstruction}
TA MISSION: Convertir la demande utilisateur en un PROMPT IMAGE (Text-to-Image) ULTRA-DÉTAILLÉ et optimisé pour le modèle Imagen 3/Flux.
CONTRAINTES:
- Le prompt doit être EN ANGLAIS.
- Décris la scène, la lumière, la texture, l'angle de caméra.
- Intègre subtilement les éléments de style visuel demandés.
- Réponds UNIQUEMENT par le prompt, sans guillemets, sans introduction.`;
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    // 1. Validate Keys
    if (!process.env.FEATHERLESS_API_KEY) throw new Error("Missing FEATHERLESS_API_KEY");
    if (!process.env.GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

    // 2. Build System Prompt
    const systemMsg = PromptArchitect.constructSystemPrompt({
      tone: payload.tone,
      visual_style: payload.visual_style,
      niche: payload.niche,
      sub_niche: payload.sub_niche
    });

    const userMsg = `User Request: ${payload.user_text}\n\nGenerate the optimized image prompt now.`;

    // 3. Generate Enhanced Prompt with Featherless (Llama)
    // Using Llama 3.3 70B (replaces deprecated 3.1)
    const completion = await featherless.chat.completions.create({
      model: "meta-llama/Llama-3.3-70B-Instruct",
      messages: [
        { role: "system", content: systemMsg },
        { role: "user", content: userMsg },
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const masterPrompt = completion.choices[0].message.content?.trim();
    if (!masterPrompt) throw new Error("Failed to generate prompt from Featherless");

    // 4. Generate Image with Gemini (Imagen 3 REST API)
    // Using standard endpoint for key-based authentication
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${process.env.GEMINI_API_KEY}`;
    
    // Construct the payload for Imagen
    // Note: The specific shape for Imagen on this API might vary, using the standard 'predict' format.
    // If this fails, we might need 'generateContent' with tool configuration, but predict is standard for raw model access.
    const imagePayload = {
        instances: [
            { prompt: masterPrompt }
        ],
        parameters: {
            sampleCount: 1,
            aspectRatio: "1:1"
        }
    };

    const imageResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imagePayload)
    });

    if (!imageResponse.ok) {
        const errText = await imageResponse.text();
        console.error("Gemini API Error:", errText);
        throw new Error(`Gemini API Error: ${imageResponse.status} ${imageResponse.statusText}`);
    }

    const imageData = await imageResponse.json();
    
    // Extract base64 image
    // Response format typically: { predictions: [ { bytesBase64Encoded: "...", mimeType: "..." } ] }
    let base64Image = imageData.predictions?.[0]?.bytesBase64Encoded;
    
    if (!base64Image) {
         // Fallback check for different structure
         base64Image = imageData.predictions?.[0]?.structValue?.fields?.bytesBase64Encoded?.stringValue;
    }
    
    if (!base64Image) {
        console.error("Gemini Response Structure:", JSON.stringify(imageData).substring(0, 500));
        throw new Error("No image data found in Gemini response");
    }

    return NextResponse.json({
      master_prompt: masterPrompt,
      image_url: `data:image/png;base64,${base64Image}`
    });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json(
        { detail: error.message || "Internal Server Error" }, 
        { status: 500 }
    );
  }
}
