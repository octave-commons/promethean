import test from 'ava';
import { createSender } from '../src/backpressure.js';

class StubWS {
    public sent: string[] = [];
    constructor(public bufferedAmount: number) {}
    send(data: string) {
        this.sent.push(data);
    }
}

test('drops progress when buffer exceeded', (t) => {
    const ws = new StubWS(1024);
    const send = createSender(ws as any, 1);
    const ok = send({ method: 'tools/progress', params: {} });
    t.false(ok);
    t.is(ws.sent.length, 0);
});
