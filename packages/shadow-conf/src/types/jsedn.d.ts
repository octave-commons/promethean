/* eslint-disable import/no-default-export */
declare module "jsedn" {
  type JsEdn = {
    readonly parse: (input: string) => unknown;
    readonly toJS: (value: unknown) => unknown;
  };
  const edn: JsEdn;
  export default edn;
}
