import type { JoinVoiceInput, JoinVoiceOutput, JoinVoiceScope } from './join-voice.scope.js';

export default async function run(scope: JoinVoiceScope, input: JoinVoiceInput): Promise<JoinVoiceOutput> {
    // For now, this action trusts policy to be applied at command level if needed.
    const doJoin = scope.join;
    return await doJoin(input);
}
