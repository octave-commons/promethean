type Message = {
    readonly id: string;
    readonly role: string;
    readonly content: string;
    readonly timestamp?: number | string;
};
type CompileOptions = {
    readonly texts?: readonly string[];
    readonly recentLimit?: number;
    readonly queryLimit?: number;
    readonly limit?: number;
    readonly formatAssistantMessages?: boolean;
};
export declare function compileContext(textsOrOptions?: readonly string[] | CompileOptions, ...legacyArgs: readonly [number?, number?, number?, boolean?]): Promise<Message[]>;
export {};
//# sourceMappingURL=compileContext.d.ts.map