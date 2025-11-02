declare module 'nbb' {
  interface NbbOptions {
    [key: string]: any;
  }

  function evalString(code: string, opts?: NbbOptions): Promise<any>;
  function loadFile(path: string, opts?: NbbOptions): Promise<any>;
  function loadString(code: string, opts?: NbbOptions): Promise<any>;

  const nbb: {
    evalString: typeof evalString;
    loadFile: typeof loadFile;
    loadString: typeof loadString;
  };

  export = nbb;
}
