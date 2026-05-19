interface ImportMetaEnv {
  readonly MODE: string
  readonly BASE_URL: string
  readonly PROD: boolean
  readonly DEV: boolean
  readonly SSR: boolean
  readonly [key: string]: unknown
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
