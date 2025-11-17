// Frontend shim replacing @promethean-os/docops-frontend
// Provides minimal placeholders to keep server-side build green.
// Each function throws at runtime if invoked in this context.

export type GetFilesOptions = unknown;
export type GetStatusOptions = unknown;

function notImplemented(name: string): never {
  throw new Error(`${name} is a frontend-only API and is not available in @promethean-os/docops`);
}

export function getFiles(_opts?: GetFilesOptions): Promise<unknown> {
  return Promise.reject(notImplemented('getFiles'));
}

export function readFileText(_path: string): Promise<unknown> {
  return Promise.reject(notImplemented('readFileText'));
}

export function searchSemantic(_query: string): Promise<unknown> {
  return Promise.reject(notImplemented('searchSemantic'));
}

export function getStatus(_opts?: GetStatusOptions): Promise<unknown> {
  return Promise.reject(notImplemented('getStatus'));
}
