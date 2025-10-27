declare module '@nlpjs/basic' {
  export interface NlpManager {
    process(language: string, text: string): Promise<any>;
    addLanguage(language: string): void;
    addDocument(language: string, text: string): void;
    train(): Promise<void>;
  }
}
