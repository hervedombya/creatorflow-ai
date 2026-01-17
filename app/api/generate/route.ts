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

    // 2. Build System Prompt
    const systemMsg = PromptArchitect.constructSystemPrompt({
      tone: payload.tone,
      visual_style: payload.visual_style,
      niche: payload.niche,
      sub_niche: payload.sub_niche
    });

    const userMsg = `User Request: ${payload.user_text}\n\nGenerate the optimized image prompt now.`;

    // 3. Generate Enhanced Prompt with Featherless (Llama)
    const completion = await featherless.chat.completions.create({
      model: "meta-llama/Meta-Llama-3.1-8B-Instruct",
      messages: [
        { role: "system", content: systemMsg },
        { role: "user", content: userMsg },
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const masterPrompt = completion.choices[0].message.content?.trim();
    if (!masterPrompt) throw new Error("Failed to generate prompt from Featherless");

    // 4. Generate Image using a stable image generation API
    // Using Pollinations AI (free, no API key needed) as alternative
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(masterPrompt)}?width=1024&height=1024&nologo=true`;

    return NextResponse.json({
      master_prompt: masterPrompt,
      image_url: imageUrl
    });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json(
        { detail: error.message || "Internal Server Error" }, 
        { status: 500 }
    );
  }
}
