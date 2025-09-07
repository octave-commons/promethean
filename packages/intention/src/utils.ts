export function extractCode(s: string) {
    const fence = s.match(/```[a-zA-Z-]*\n([\s\S]*?)```/);
    if (fence && fence[1] !== undefined) return fence[1];
    const triple = s.split(/\n-{3,}\n/)[0] ?? s;
    return triple.trim();
}
