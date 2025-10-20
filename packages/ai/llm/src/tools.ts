export type Tool = {
    type: 'function';
    function: {
        name: string;
        description?: string;
        parameters: Record<string, unknown>;
    };
};

export type ToolCall = {
    id?: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;
    };
};
