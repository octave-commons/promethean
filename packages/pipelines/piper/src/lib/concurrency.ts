export function semaphore(n: number) {
  let cur = 0;
  const q: Array<() => void> = [];

  const take = () =>
    new Promise<void>((res) => {
      if (cur < n) {
        cur++;
        res();
      } else {
        q.push(() => {
          cur++;
          res();
        });
      }
    });

  const release = () => {
    if (cur > 0) cur--;
    const fn = q.shift();
    if (fn) fn();
  };

  return { take, release };
}
