// SPDX-License-Identifier: GPL-3.0-only
export function extractCode(s: string) {
    const fence = s.match(/```[a-zA-Z-]*\n([\s\S]*?)```/);
    if (fence) return fence[1];
    const triple = s.split(/\n-{3,}\n/)[0];
    return triple.trim();
}
