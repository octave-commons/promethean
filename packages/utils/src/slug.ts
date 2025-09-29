const isLowerAlphaNumeric = (char: string): boolean => {
  const code = char.codePointAt(0);
  if (code === undefined) {
    return false;
  }

  const isDigit = code >= 0x30 && code <= 0x39; // 0-9
  const isLower = code >= 0x61 && code <= 0x7a; // a-z

  return isDigit || isLower;
};

type SlugAccumulator = {
  readonly result: string;
  readonly pendingHyphen: boolean;
};

const appendSlugChar = (
  acc: SlugAccumulator,
  char: string,
): SlugAccumulator => {
  if (isLowerAlphaNumeric(char)) {
    const hyphen = acc.pendingHyphen ? "-" : "";
    return {
      result: `${acc.result}${hyphen}${char}`,
      pendingHyphen: false,
    };
  }

  if (acc.result.length === 0) {
    return acc;
  }

  return {
    result: acc.result,
    pendingHyphen: true,
  };
};

export function slug(s: string): string {
  const { result } = Array.from(s.trim().toLowerCase()).reduce<SlugAccumulator>(
    appendSlugChar,
    {
      result: "",
      pendingHyphen: false,
    },
  );

  return result;
}
