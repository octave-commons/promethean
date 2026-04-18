export interface IConfigStore {
  init(): Promise<void>;
  getSnapshot(): Promise<Record<string, unknown>>;
}