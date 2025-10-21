// Mock data for testing
export const mockSessions = [
    {
        id: 'session-1',
        title: 'Project Planning Discussion',
        created_at: Date.now() - 86400000, // 1 day ago
        message_count: 5,
    },
    {
        id: 'session-2',
        title: 'Code Review Session',
        created_at: Date.now() - 172800000, // 2 days ago
        message_count: 8,
    },
    {
        id: 'session-3',
        title: 'Bug Troubleshooting',
        created_at: Date.now() - 259200000, // 3 days ago
        message_count: 12,
    },
];
export const mockMessages = {
    'session-1': [
        {
            id: 'msg-1-1',
            role: 'user',
            content: 'Can you help me plan a new project structure?',
            created_at: Date.now() - 86400000,
        },
        {
            id: 'msg-1-2',
            role: 'assistant',
            content: "I'd be happy to help you plan a project structure! What type of project are you working on?",
            created_at: Date.now() - 86300000,
        },
        {
            id: 'msg-1-3',
            role: 'user',
            content: "It's a web application with a frontend and backend API",
            created_at: Date.now() - 86200000,
        },
    ],
    'session-2': [
        {
            id: 'msg-2-1',
            role: 'user',
            content: 'Please review this code for any issues',
            created_at: Date.now() - 172800000,
        },
        {
            id: 'msg-2-2',
            role: 'assistant',
            content: "I'll help you review the code. Please share the code you'd like me to examine.",
            created_at: Date.now() - 172700000,
        },
    ],
    'session-3': [
        {
            id: 'msg-3-1',
            role: 'user',
            content: "I'm getting an error in my application",
            created_at: Date.now() - 259200000,
        },
        {
            id: 'msg-3-2',
            role: 'assistant',
            content: 'What error are you encountering? Can you share the error message and relevant code?',
            created_at: Date.now() - 259100000,
        },
    ],
};
