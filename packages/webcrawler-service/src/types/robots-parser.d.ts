declare module "robots-parser" {
  export type RobotsParser = {
    readonly isAllowed: (url: string, userAgent?: string) => boolean;
  };

  function createRobotsParser(robotsUrl: string, robotsTxt: string): RobotsParser;

  export = createRobotsParser;
}
