export class RouterLLM {
    providers;
    constructor(providers) {
        this.providers = providers;
    }
    async generate(io) {
        let lastErr;
        for (const p of this.providers) {
            try {
                return await p.generate(io);
            }
            catch (e) {
                lastErr = e;
            }
        }
        throw lastErr ?? new Error("No providers responded");
    }
}
