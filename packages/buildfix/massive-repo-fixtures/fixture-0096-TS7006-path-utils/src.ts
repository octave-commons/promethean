import * as path from "path";

const isNonEmpty = (value | undefined | null): value is string =>
  typeof value === "string" && value.length > 0;

const trimTrailingSeparators = (value) => {
  if (value.length === 0) {
    return value;
  }
  const code = value.charCodeAt(value.length - 1);
  if (code === 47 || code === 92) {
    return trimTrailingSeparators(value.slice(0, -1));
  }
  return value;
};

const trimLeadingDotsAndSeparators = (value) => {
  if (value.length === 0) {
    return value;
  }
  const code = value.charCodeAt(0);
  if (code === 46 || code === 47 || code === 92) {
    return trimLeadingDotsAndSeparators(value.slice(1));
  }
  return value;
};

const normalizeIgnoreSegments = (
  root,
  ignoreDirs?: Iterable<string>,
): ReadonlyArray<ReadonlyArray<string>> => {
  if (!ignoreDirs) {
    return [];
  }
  const directories = Array.from(ignoreDirs);
  return (
    directories
      .map((value) => value?.trim())
      .filter(isNonEmpty)
      .map(trimTrailingSeparators)
      //.map(trimTrailingSlashes)
      .filter(isNonEmpty)
      .map((value) =>
        path.isAbsolute(value) ? path.relative(root, value) : value,
      )
      .map(trimLeadingDotsAndSeparators)
      .filter(isNonEmpty)
      .map((value) => path.normalize(value))
      .filter((value) => value.length > 0 && !value.startsWith(".."))
      .map((value) => value.split(path.sep).filter(Boolean))
  );
};

export function normalizeExtensions(
  exts?: Iterable<string>,
): ReadonlyArray<string> {
  if (!exts) {
    return [];
  }
  return Array.from(exts)
    .map((raw) => raw?.trim())
    .filter(isNonEmpty)
    .map((value) =>
      value.startsWith(".") ? value.toLowerCase() : `.${value.toLowerCase()}`,
    );
}

export function createIgnorePredicate(
  root,
  ignoreDirs?: Iterable<string>,
): (filePath) => boolean {
  const segmentsList = normalizeIgnoreSegments(root, ignoreDirs);
  if (segmentsList.length === 0) {
    return () => false;
  }

  const nameSet = new Set(
    segmentsList
      .filter((segments) => segments.length === 1)
      .map((segments) => segments[0] ?? ""),
  );
  const pathSet = new Set(
    segmentsList
      .filter((segments) => segments.length > 1)
      .map((segments) => segments.join(path.sep)),
  );

  if (nameSet.size === 0 && pathSet.size === 0) {
    return () => false;
  }

  return (filePath) => {
    const relDir = path.relative(root, path.dirname(filePath));
    if (relDir.startsWith("..")) {
      return false;
    }

    const parts = relDir.split(path.sep).filter(Boolean);
    if (parts.length === 0) {
      return pathSet.has("");
    }

    return parts.some((_, index) => {
      const segment = parts[index] ?? "";
      const prefix = parts.slice(0, index + 1).join(path.sep);
      return nameSet.has(segment) || pathSet.has(prefix);
    });
  };
}
