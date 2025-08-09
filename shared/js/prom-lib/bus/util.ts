export function uuidv7(): string {
  /* pluggable impl; use @lukeed/uuid or your own */ return crypto.randomUUID();
}
export function now(): number {
  return Date.now();
}
export function assignPartition(
  key: string | undefined,
  partitions = 1,
): number {
  if (!partitions || partitions <= 1) return 0;
  const k = key ?? `${Math.random()}`;
  let h = 0;
  for (let i = 0; i < k.length; i++) h = ((h << 5) - h + k.charCodeAt(i)) | 0;
  return Math.abs(h) % partitions;
}
