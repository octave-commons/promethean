import test from 'ava';
import { runAgentOperations, runAgentRecommendations, } from '../lib/healing/agent-integration.js';
const integrationStatus = {
    kanban: { available: true, issues: [], version: '0.2.0' },
    mcp: { available: true, toolsEnabled: ['kanban-core'], issues: [] },
    agents: { available: true, activeAgents: ['kanban-board-enforcer'], issues: [] },
    git: { available: false, issues: ['git repository not detected'] },
};
const healingRequest = {
    id: 'heal-001',
    reason: 'Address WIP overage across core columns',
    options: { dryRun: true },
    requestedAt: new Date(),
    requestedBy: 'test-suite',
};
test('runAgentOperations returns pantheon-driven enforcement plan', async (t) => {
    const result = await runAgentOperations(healingRequest, integrationStatus);
    t.true(result.agentsInvoked.includes('kanban-board-enforcer'));
    t.true(result.recommendations.length > 0);
    t.true(result.enforcements.some((item) => item.toLowerCase().includes('dry-run')));
});
test('runAgentRecommendations highlights integration risks', async (t) => {
    const result = await runAgentRecommendations(healingRequest.reason, integrationStatus);
    t.true(result.recommendations.length > 0);
    t.true(result.criticalIssues.some((issue) => issue.type === 'git'));
});
//# sourceMappingURL=agent-integration.test.js.map