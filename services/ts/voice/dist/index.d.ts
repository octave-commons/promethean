import { Client } from "discord.js";
import { VoiceSession } from "./voice-session";
export declare function createVoiceService(token?: string): {
    app: import("express-serve-static-core").Express;
    client: Client<boolean>;
    start: (port?: number) => Promise<unknown>;
    getSession: () => VoiceSession | null;
};
//# sourceMappingURL=index.d.ts.map