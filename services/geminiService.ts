import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Character } from "../types";

// Helper to get the client - Re-instantiated to ensure latest key is used
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Audio Decoding Helpers
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// 1. Story Generation (Text + Audio)
export async function generateStoryWithAudio(character: Character) {
  const ai = getClient();
  
  // A. Generate Text Story
  const storyPrompt = `5-6 yaşındaki bir çocuk için, ana karakteri ${character.name} (${character.promptDesc}) olan, 3 cümleden oluşan, çok basit, öğretici ve eğlenceli kısa bir masal yaz. Türkçe olsun. Sadece masalı yaz, başlık veya ekstra metin olmasın.`;
  
  const textResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: storyPrompt,
  });
  
  const storyText = textResponse.text || "Bir varmış bir yokmuş...";

  // B. Generate Audio (TTS)
  const ttsResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: storyText }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore is usually good for storytelling
        },
      },
    },
  });

  const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  
  let audioBuffer: AudioBuffer | null = null;
  if (base64Audio) {
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    audioBuffer = await decodeAudioData(
      decode(base64Audio),
      outputAudioContext,
      24000,
      1,
    );
  }

  // C. Generate Illustration (Story Scene)
  const imageResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: `Çocuk kitabı illüstrasyonu, renkli, sevimli, vektör sanatı, düz arka plan: ${character.promptDesc} ormanda macera yaşıyor.`,
  });

  let imageUrl = "";
  for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }

  return { text: storyText, audioBuffer, imageUrl };
}

// 2. Logic Game Generation (Pattern Matching)
export async function generateLogicGame() {
  const ai = getClient();
  const prompt = `
    5-6 yaşındaki çocuklar için bir desen tamamlama (pattern matching) oyunu oluştur.
    Sadece JSON formatında yanıt ver.
    Sequence dizisinde emojiler olsun (meyveler, hayvanlar veya şekiller).
    Örnek desenler: A-B-A-? veya A-A-B-?
    'sequence' array'i soruyu içersin, kayıp parça yerine '?' olsun.
    'options' array'i 3 seçenek içersin (biri doğru cevap).
    'answer' doğru cevap olan emoji olsun.
    'question' çocuğa sorulacak soru metni olsun (Türkçe).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sequence: { type: Type.ARRAY, items: { type: Type.STRING } },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          answer: { type: Type.STRING },
          question: { type: Type.STRING }
        },
        required: ["sequence", "options", "answer", "question"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

// 3. Coloring Page Generation (Line Art)
export async function generateColoringPage(character: Character) {
  const ai = getClient();
  
  // Refined prompt for better line art
  const prompt = `
    High quality coloring page for kids.
    Subject: A simple, cute ${character.promptDesc}.
    Style: Clear thick black outlines, PURE WHITE background. 
    Important: The character inside must be white/empty for coloring. No shading.
    Single object centered.
  `;

  const imageResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: prompt,
  });

  let imageUrl = "";
  for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }
  return imageUrl;
}

// 4. Video Generation (Veo)
export async function generateCharacterVideo(character: Character) {
  const ai = getClient();
  
  const prompt = `A short, cute, 3D animated video for kids featuring ${character.promptDesc}. The character is happy and waving. High quality, colorful, plain background or simple nature background.`;

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!uri) throw new Error("Video generation failed");

  return `${uri}&key=${process.env.API_KEY}`;
}
