export type StoreSession = {
  id?: string;
  text: string;
  timestamp?: number | string | Date;
  [key: string]: unknown;
};
