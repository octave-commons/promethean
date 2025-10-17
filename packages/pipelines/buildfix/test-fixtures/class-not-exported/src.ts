class Helper {
  static format(text: string) {
    return text.trim();
  }
}

export function formatText(text: string) {
  return Helper.format(text);
}