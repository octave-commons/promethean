export type OllamaModel = Readonly<{
  name: string;
  size?: number;
  digest?: string;
  modified_at?: string;
  details?: {
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
  };
}>;
