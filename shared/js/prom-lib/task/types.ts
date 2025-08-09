export type Task<T = any> = {
  id: string;
  topic: string;
  payload: T;
  priority?: number;
};
