declare module "turndown" {
  export type TurndownOptions = {
    readonly headingStyle?: "setext" | "atx";
  };

  class TurndownService {
    constructor(options?: TurndownOptions);
    turndown(input: string): string;
  }

  export = TurndownService;
}
