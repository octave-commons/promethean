export type LLM = {
    generate(opts: { system: string; prompt: string }): Promise<string>;
};

export class DummyLLM implements LLM {
    async generate({ prompt }: { system: string; prompt: string }): Promise<string> {
        if (prompt.includes('normalize2d') && prompt.includes('language=js')) {
            return 'export function normalize2d(x,y){const m=Math.hypot(x,y)||0;return {mag:m,nx:m?x/m:0,ny:m?y/m:0};}';
        }
        if (prompt.includes('normalize2d') && prompt.includes('language=py')) {
            return 'def normalize2d(x,y):\n    import math\n    m = math.hypot(x,y)\n    return {"mag":m,"nx":(x/m if m else 0),"ny":(y/m if m else 0)}\n';
        }
        return '// TODO: implement';
    }
}
