export type OllamaOptions = Readonly<{
  temperature?: number;
  top_p?: number;
  num_ctx?: number;
  num_predict?: number;
  stop?: readonly string[];
  format?: 'json' | object;
}>;
