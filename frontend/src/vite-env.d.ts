/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_API_URL: string
  readonly VITE_VIDEO_API_URL: string
  readonly VITE_USER_API_URL: string
  readonly VITE_STREAMING_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
