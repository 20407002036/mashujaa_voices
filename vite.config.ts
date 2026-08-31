import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        watch: {
          ignored: [
            '**/tests/**',
            '**/Backend/**',
            '**/.git/**',
            '**/node_modules/**'
          ]
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_ANALYSIS_MODEL': JSON.stringify(env.GEMINI_ANALYSIS_MODEL || 'gemini-2.5-flash'),
        'process.env.GEMINI_TTS_MODEL': JSON.stringify(env.GEMINI_TTS_MODEL || 'gemini-2.5-flash-preview-tts'),
        'process.env.GEMINI_TTS_VOICE': JSON.stringify(env.GEMINI_TTS_VOICE || 'Kore'),
        'process.env.TTS_SAMPLE_RATE': JSON.stringify(env.TTS_SAMPLE_RATE || 24000)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
