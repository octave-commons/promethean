class TestClass {
  private unusedVariable: string = 'test';

  constructor() {
    console.log('constructor without proper typing');
  }

  methodWithNoReturnType() {
    const x = 1;
    const y = 2;
    return x + y;
  }

  methodWithUnusedParameter(param: string) {
    return 'hello';
  }
}

const testInstance = new TestClass();
const unusedConst = 'this is never used';
