// SPDX-License-Identifier: GPL-3.0-only
export type Tool = {
    type: 'function';
    function: {
        name: string;
        description?: string;
        parameters: Record<string, any>;
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
