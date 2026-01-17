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

    // 3. Build master prompt with Featherless
    const systemMessage = 
      "Tu es un expert en prompt engineering pour modèles d'images " +
      "(Flux, SDXL, DALL-E, Gemini). Tu génères UN SEUL prompt ultra clair, en anglais, " +
      "optimisé pour le text-to-image. Tu ne rajoutes aucun commentaire autour.";

    const userMessage = `User text: ${userText}\nReturn a single, clean text-to-image prompt in English. No quotes, no extra text.`;

    const completion = await featherless.chat.completions.create({
      model: FEATHERLESS_MODEL,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const masterPrompt = completion.choices[0].message.content?.trim();
    if (!masterPrompt) {
      return NextResponse.json(
        { detail: "Failed to generate master prompt" },
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
    });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { detail: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
