import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize Featherless client
const featherless = new OpenAI({
  apiKey: process.env.FEATHERLESS_API_KEY || '',
  baseURL: "https://api.featherless.ai/v1"
});

const FEATHERLESS_MODEL = "meta-llama/Meta-Llama-3.1-70B-Instruct";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    // 1. Validate API keys
    if (!process.env.FEATHERLESS_API_KEY) {
      return NextResponse.json(
        { detail: "FEATHERLESS_API_KEY is not configured" },
        { status: 500 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { detail: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // 2. Parse form data (multipart/form-data)
    const formData = await req.formData();
    const userText = formData.get('user_text') as string;
    const file = formData.get('file') as File;
    const format = (formData.get('format') as string) || 'post';
    const platforms = (formData.get('platforms') as string)?.split(',') || ['instagram'];

    if (!userText) {
      return NextResponse.json(
        { detail: "user_text is required" },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { detail: "file is required" },
        { status: 400 }
      );
    }

    // Validate file size (Vercel limit is ~4.5MB, but we enforce 2MB to be very safe)
    const maxFileSize = 2 * 1024 * 1024; // 2MB to be very safe
    if (file.size > maxFileSize) {
      return NextResponse.json(
        { detail: `File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 2MB. Please compress your image.` },
        { status: 413 }
      );
    }

    // 3. Generate simple prompt from user text (simple transformation, no complex optimization)
    const simplePromptSystem = 
      "Transforme le texte de l'utilisateur en un prompt simple et clair pour génération d'image. " +
      "Garde le sens original, traduis en anglais si nécessaire, et rends-le concis. " +
      "Retourne UNIQUEMENT le prompt, sans guillemets, sans commentaires.";

    const captionSystem = 
      "Tu es un expert en création de contenu pour réseaux sociaux (Instagram, TikTok, Facebook). " +
      "Tu génères des captions engageantes, authentiques et adaptées au format et à la plateforme. " +
      "Utilise des emojis pertinents, un ton naturel et des hooks accrocheurs. " +
      "Retourne UNIQUEMENT la caption, sans guillemets, sans introduction.";

    const formatDescription = format === 'post' ? 'Post Instagram carré' : format === 'story' ? 'Story Instagram' : 'Reel/TikTok';
    const captionMessage = `User request: ${userText}\nFormat: ${formatDescription}\nPlatforms: ${platforms.join(', ')}\n\nGénère une caption parfaite pour ce contenu.`;

    // Generate simple prompt and caption sequentially
    const simplePromptCompletion = await featherless.chat.completions.create({
      model: FEATHERLESS_MODEL,
      messages: [
        { role: "system", content: simplePromptSystem },
        { role: "user", content: `User text: ${userText}\nTransforme ce texte en un prompt simple pour génération d'image.` },
      ],
      temperature: 0.5,
      max_tokens: 200,
    });

    const captionCompletion = await featherless.chat.completions.create({
      model: FEATHERLESS_MODEL,
      messages: [
        { role: "system", content: captionSystem },
        { role: "user", content: captionMessage },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const masterPrompt = simplePromptCompletion.choices[0].message.content?.trim();
    const caption = captionCompletion.choices[0].message.content?.trim();

    if (!masterPrompt) {
      return NextResponse.json(
        { detail: "Failed to generate prompt" },
        { status: 500 }
      );
    }

    if (!caption) {
      return NextResponse.json(
        { detail: "Failed to generate caption" },
        { status: 500 }
      );
    }

    // 4. Convert file to base64 for Gemini
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';

    // 5. Generate image with Gemini using REST API (quickest solution)
    // Using REST API directly - works immediately on Vercel
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;
    
    const geminiPayload = {
      contents: [{
        parts: [
          { text: masterPrompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          }
        ]
      }],
      generationConfig: {
        responseMimeType: "image/png"
      }
    };

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiPayload),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      // Fallback: return original image if Gemini fails
      return NextResponse.json({
        master_prompt: masterPrompt,
        image_url: `data:${mimeType};base64,${base64Image}`,
        caption: caption || "Caption generation failed",
        warning: "Gemini image generation failed, returning original image"
      });
    }

    const geminiData = await geminiResponse.json();
    
    // Extract image from response
    let imageDataUrl: string | null = null;
    
    if (geminiData.candidates?.[0]?.content?.parts) {
      for (const part of geminiData.candidates[0].content.parts) {
        if (part.inlineData) {
          imageDataUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    // Fallback to original image if no image generated
    if (!imageDataUrl) {
      console.warn('No image in Gemini response, using original image');
      imageDataUrl = `data:${mimeType};base64,${base64Image}`;
    }

    return NextResponse.json({
      master_prompt: masterPrompt,
      image_url: imageDataUrl,
      caption: caption,
    });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { detail: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
