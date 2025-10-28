import type crypto from "node:crypto";
type CryptoModule = Readonly<Pick<typeof crypto, "randomUUID" | "randomBytes">>;
type SessionIdGenerator = () => string;
export declare const createSessionIdGenerator: (cryptoModule: CryptoModule) => SessionIdGenerator;
export {};
//# sourceMappingURL=session-id.d.ts.map