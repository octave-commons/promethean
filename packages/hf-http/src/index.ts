// SPDX-License-Identifier: GPL-3.0-only
/**
 * HuggingFace HTTP client utilities for Promethean Node.js services
 */

import { request } from 'undici';
import type { z } from 'zod';

export interface HfApiConfig {
    apiKey?: string;
    baseUrl?: string;
}

export class HuggingFaceClient {
    private apiKey?: string;
    private baseUrl: string;

    constructor(config: HfApiConfig = {}) {
        this.apiKey = config.apiKey || process.env.HF_API_KEY;
        this.baseUrl = config.baseUrl || 'https://api-inference.huggingface.co';
    }

    async inference(model: string, inputs: unknown): Promise<unknown> {
        const url = `${this.baseUrl}/models/${model}`;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        const response = await request(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({ inputs }),
        });

        if (response.statusCode !== 200) {
            throw new Error(`HF API error: ${response.statusCode}`);
        }

        return response.body.json();
    }

    async embeddings(model: string, texts: string | string[]): Promise<number[][]> {
        const result = await this.inference(model, texts);
        return Array.isArray(result) ? result : [result as number[]];
    }
}

export function createHfClient(config?: HfApiConfig): HuggingFaceClient {
    return new HuggingFaceClient(config);
}
