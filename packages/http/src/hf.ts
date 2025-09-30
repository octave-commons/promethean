/**
 * HuggingFace HTTP client utilities for Promethean Node.js services
 */

import { request } from 'undici';

const DEFAULT_BASE_URL = 'https://api-inference.huggingface.co';

const createHeaders = (apiKey: string | undefined): Readonly<Record<string, string>> =>
    apiKey === undefined
        ? { 'Content-Type': 'application/json' }
        : {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
          };

const toReadonlyVector = (value: unknown): ReadonlyArray<number> => {
    if (!Array.isArray(value)) {
        throw new TypeError('HF embedding response must be an array of numbers');
    }

    const numbers = value.map((entry) => {
        if (typeof entry !== 'number' || Number.isNaN(entry)) {
            throw new TypeError('HF embedding response contains a non-numeric value');
        }

        return entry;
    });

    return Object.freeze(numbers);
};

const toReadonlyMatrix = (value: unknown): ReadonlyArray<ReadonlyArray<number>> => {
    const rows = Array.isArray(value) ? value : [value];
    const matrix = rows.map(toReadonlyVector);

    return Object.freeze(matrix);
};

export type HfApiConfig = {
    readonly apiKey?: string;
    readonly baseUrl?: string;
};

export class HuggingFaceClient {
    private readonly apiKey: string | undefined;
    private readonly baseUrl: string;

    constructor({ apiKey, baseUrl }: HfApiConfig = {}) {
        this.apiKey = apiKey ?? process.env.HF_API_KEY;
        this.baseUrl = baseUrl ?? DEFAULT_BASE_URL;
    }

    async inference(model: string, inputs: unknown): Promise<unknown> {
        const url = `${this.baseUrl}/models/${model}`;
        const response = await request(url, {
            method: 'POST',
            headers: createHeaders(this.apiKey),
            body: JSON.stringify({ inputs }),
        });

        if (response.statusCode !== 200) {
            throw new Error(`HF API error: ${response.statusCode}`);
        }

        return response.body.json();
    }

    async embeddings(
        model: string,
        texts: string | ReadonlyArray<string>,
    ): Promise<ReadonlyArray<ReadonlyArray<number>>> {
        const result = await this.inference(model, texts);
        return toReadonlyMatrix(result);
    }
}

export const createHfClient = (config?: HfApiConfig): HuggingFaceClient => new HuggingFaceClient(config);
