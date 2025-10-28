export type CliContext = Readonly<{
    readonly boardFile: string;
    readonly tasksDir: string;
    readonly argv: ReadonlyArray<string>;
}>;
export declare class CommandUsageError extends Error {
    constructor(message: string);
}
export declare class CommandNotFoundError extends Error {
    constructor(command: string);
}
export type CommandResult = unknown;
export type CommandHandler = (args: ReadonlyArray<string>, context: CliContext) => Promise<CommandResult>;
export declare const COMMAND_HANDLERS: Readonly<Record<string, CommandHandler>>;
export declare const AVAILABLE_COMMANDS: ReadonlyArray<string>;
export declare const REMOTE_COMMANDS: ReadonlyArray<string>;
export declare const executeCommand: (command: string, args: ReadonlyArray<string>, context: CliContext) => Promise<CommandResult>;
//# sourceMappingURL=command-handlers.d.ts.map