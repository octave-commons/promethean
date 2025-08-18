import { World } from './ecs';

describe('ECS double-buffer semantics', () => {
  test('add is readable in-frame (new row prev seeded); set visible after endTick', () => {
    const w = new World();
    const Pos = w.defineComponent<{ x: number }>({ name: 'Pos' });
    const e = w.createEntity();

    // Add comp in a tick → prev is seeded for new rows; readable same frame
    w.beginTick();
    w.addComponent(e, Pos, { x: 1 });
    expect(w.get(e, Pos)).toEqual({ x: 1 });
    w.endTick();
    expect(w.get(e, Pos)).toEqual({ x: 1 });

    // Update in next tick, observe staged write is not visible until swap
    w.beginTick();
    w.set(e, Pos, { x: 2 });
    expect(w.get(e, Pos)).toEqual({ x: 1 }); // prev still
    w.endTick();
    expect(w.get(e, Pos)).toEqual({ x: 2 });
  });

  test('unwritten rows carry forward automatically across endTick', () => {
    const w = new World();
    const Pos = w.defineComponent<{ n: number }>({ name: 'Pos' });
    const e = w.createEntity();
    w.beginTick();
    w.addComponent(e, Pos, { n: 10 });
    w.endTick();
    expect(w.get(e, Pos)!.n).toBe(10);

    // No writes this frame → value should carry
    w.beginTick();
    w.endTick();
    expect(w.get(e, Pos)!.n).toBe(10);
  });

  test('changed mask flags rows written last tick', () => {
    const w = new World();
    const Pos = w.defineComponent<{ v: number }>({ name: 'Pos' });
    const e = w.createEntity();

    // frame 1: add
    w.beginTick();
    w.addComponent(e, Pos, { v: 1 });
    w.endTick();

    // frame 2: set
    w.beginTick();
    w.set(e, Pos, { v: 2 });
    w.endTick();

    // frame 3: query 'changed' should see the entity
    const q = w.makeQuery({ changed: [Pos], all: [Pos] });
    let seen = 0;
    for (const [_e] of w.iter(q)) seen++;
    expect(seen).toBe(1);
  });

  test('double write in same tick warns once and last write wins', () => {
    const w = new World();
    const Pos = w.defineComponent<{ n: number }>({ name: 'Pos' });
    const e = w.createEntity();
    w.beginTick();
    w.addComponent(e, Pos, { n: 0 });
    w.endTick();

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    w.beginTick();
    w.set(e, Pos, { n: 1 });
    w.set(e, Pos, { n: 2 });
    w.endTick();
    expect(warnSpy).toHaveBeenCalled();
    expect(w.get(e, Pos)!.n).toBe(2);
    warnSpy.mockRestore();
  });

  test('nested beginTick throws', () => {
    const w = new World();
    w.beginTick();
    expect(() => w.beginTick()).toThrow();
    w.endTick();
  });
});
