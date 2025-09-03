// SPDX-License-Identifier: GPL-3.0-only
type Msg = {
    role: "system" | "user" | "assistant";
    content: string;
};
export declare function chat({ model, messages, options, }: {
    model: string;
    messages: Msg[];
    options?: Record<string, any>;
}): Promise<string>;
export {};
//# sourceMappingURL=ollama.d.ts.map