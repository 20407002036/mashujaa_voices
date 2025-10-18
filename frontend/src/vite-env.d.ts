/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_GEMINI_MODEL: string
  readonly VITE_GEMINI_VISION_MODEL: string
  readonly VITE_GEMINI_TTS_MODEL: string
  readonly VITE_MAX_FILE_SIZE: string
  readonly VITE_SUPPORTED_FORMATS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}