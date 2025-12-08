import { GoogleGenAI, Modality, Type } from "@google/genai";
import { StoryData, AudioState } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

// 1. Analyze Image and Generate Story
export const generateStory = async (
  imageBase64: string,
  userContext?: string
): Promise<StoryData> => {
  const ai = getClient();
  
  const prompt = `
    You are a knowledgeable historian and storyteller specializing in Kenyan history (Mashujaa). 
    Analyze the provided historical image. 
    ${userContext ? `The user provided this context: "${userContext}".` : ''}
    
    Identify the likely era, events, or cultural significance. 
    Write a short, engaging documentary-style story (approx 150-200 words) about what is happening in the image.
    Evoke pride and nostalgia.
    
    Return the response in JSON format.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64
          }
        },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A captivating title for the photo" },
          content: { type: Type.STRING, description: "The narrative story" },
          year: { type: Type.STRING, description: "Estimated year or decade" },
          region: { type: Type.STRING, description: "Estimated region in Kenya" },
        },
        required: ["title", "content"]
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as StoryData;
  }
  throw new Error("Failed to generate story text.");
};

// 2. Generate Audio from Story
export const generateSpeech = async (text: string): Promise<AudioState> => {
  const ai = getClient();
  
  // Clean text for speech (remove markdown bolding if any remains)
  const cleanText = text.replace(/\*\*/g, "").replace(/\*/g, "");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: cleanText }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore has a nice deep tone suitable for documentary
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!base64Audio) {
    throw new Error("Failed to generate audio.");
  }

  // Gemini TTS returns raw PCM (16-bit little-endian, 24kHz mono) without headers.
  // Standard decodeAudioData cannot handle raw PCM. We must manually decode it.
  
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
    sampleRate: 24000
  });

  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Convert Raw PCM (Int16) to Float32 AudioBuffer
  const pcm16 = new Int16Array(bytes.buffer);
  const audioBuffer = audioContext.createBuffer(1, pcm16.length, 24000);
  const channelData = audioBuffer.getChannelData(0);
  
  for (let i = 0; i < pcm16.length; i++) {
    // Normalize 16-bit integer to -1.0 to 1.0 float
    channelData[i] = pcm16[i] / 32768.0;
  }
  
  // Create WAV blob for download
  const wavBlob = bufferToWav(audioBuffer);
  const blobUrl = URL.createObjectURL(wavBlob);

  return {
    buffer: audioBuffer,
    blobUrl: blobUrl
  };
};

// Utility to convert AudioBuffer to WAV Blob for download
function bufferToWav(abuffer: AudioBuffer) {
  const numOfChan = abuffer.numberOfChannels;
  const len = abuffer.length;
  const length = len * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  setUint32(0x46464952);                         // "RIFF"
  setUint32(length - 8);                         // file length - 8
  setUint32(0x45564157);                         // "WAVE"

  setUint32(0x20746d66);                         // "fmt " chunk
  setUint32(16);                                 // length = 16
  setUint16(1);                                  // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2);                      // block-align
  setUint16(16);                                 // 16-bit (hardcoded in this example)

  setUint32(0x61746164);                         // "data" - chunk
  setUint32(length - pos - 4);                   // chunk length

  // write interleaved data
  for(i = 0; i < abuffer.numberOfChannels; i++)
    channels.push(abuffer.getChannelData(i));

  while(pos < abuffer.length) {
    for(i = 0; i < numOfChan; i++) {             // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][pos])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
      view.setInt16(offset, sample, true);          // write 16-bit sample
      offset += 2;
    }
    pos++;
  }

  return new Blob([buffer], {type: "audio/wav"});

  function setUint16(data: number) {
    view.setUint16(offset, data, true);
    offset += 2;
  }

  function setUint32(data: number) {
    view.setUint32(offset, data, true);
    offset += 4;
  }
}