declare module "esmock" {
  type ModuleShape = Record<string, unknown>;
  type MockMap = Record<string, unknown>;
  function esmock<T extends ModuleShape = ModuleShape>(
    specifier: string,
    mocks?: MockMap,
    globalMocks?: MockMap,
  ): Promise<T>;
  export default esmock;
}
