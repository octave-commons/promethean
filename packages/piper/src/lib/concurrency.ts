export function semaphore(n: number) {
  let cur = 0;
  const q: Array<() => void> = [];
  const take = () =>
    new Promise<void>((res) => {
      if (cur < n) {
        cur++;
        res();
      } else q.push(res);
    });
  const release = () => {
    cur--;
    const fn = q.shift();
    if (fn) fn();
  };
  return { take, release };
}
