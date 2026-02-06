// Import types from existing modules
export type ExtractedWord = {
  language: string
  word: string
}

export type Translation = {
  language: string
  pronunciation: string
  translations: {
    partOfSpeech: string
    translation: string
  }[]
  examples: {
    example: string
    translation: string
  }[]
}

export type PositionOcrResult = {
  words_result: {
    words: string
    location: {
      top: number
      left: number
      width: number
      height: number
    }
  }[]
  words_result_num: number
  log_id: number
}

export type CharPosition = {
  char: string
  x: number
  y: number
  index: number
  wordBoxIndex: number
}

// Define update message type
export type TranslationUpdate =
  | { status: 'loading' }
  | { status: 'word-found'; data: ExtractedWord }
  | { status: 'complete'; data: ExtractedWord & { translation: Translation } }
  | { status: 'error'; error: string }
