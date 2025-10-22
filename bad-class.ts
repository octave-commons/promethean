// This class intentionally violates common linting and best practice rules

class BadClass {
  public badField: any;
  private _privateWithUnderscore: string;
  protected protectedField: any;

  // Missing constructor types
  constructor(param1, param2) {
    this.badField = param1;
    this._privateWithUnderscore = param2;
  }

  // Method without return type
  badMethod(param) {
    return param + 'something';
  }

  // Unused parameter
  unusedParamMethod(a, b, c, d) {
    return a + b;
  }

  // Magic numbers in method
  calculateSomething() {
    const result = this.badField * 5000 + 100;
    return result / 3.14;
  }

  // Console logging in class method
  logSomething() {
    console.log("This shouldn't be here in production");
    console.error('Error logging');
  }

  // Empty method
  emptyMethod() {
    // Does nothing
  }

  // Method that's too complex
  complexMethod(x, y, z) {
    if (x > 0) {
      if (y > 0) {
        if (z > 0) {
          if (x > y) {
            if (y > z) {
              return x + y + z;
            } else {
              return x + z;
            }
          } else {
            if (x > z) {
              return y + z;
            } else {
              return y + x;
            }
          }
        } else {
          return x + y;
        }
      } else {
        return x + z;
      }
    } else {
      return y + z;
    }
  }

  // Method with side effects and no return
  sideEffectMethod() {
    this.badField = Math.random();
    this._privateWithUnderscore = 'changed';
    // No return statement
  }

  // Method that throws without proper error type
  throwMethod() {
    throw 'This should be an Error object';
  }

  // Method with inconsistent return types
  inconsistentReturn(input) {
    if (input > 10) {
      return 'string';
    } else if (input > 5) {
      return 42;
    } else {
      return { value: input };
    }
  }

  // Method with unused variables
  unusedVarsMethod() {
    const a = 1;
    const b = 2;
    const c = 3;
    const d = 4;
    const e = 5;
    return a;
  }

  // Getter with side effects
  get badGetter() {
    console.log('Getter called');
    this.badField = Math.random();
    return this.badField;
  }

  // Setter with validation but no error throwing
  set badSetter(value: any) {
    if (typeof value === 'string') {
      this._privateWithUnderscore = value;
    }
    // No error for invalid types
  }

  // Static method with instance access
  static badStatic() {
    return this.badField; // 'this' in static context
  }

  // Async method without proper error handling
  async badAsync() {
    const data = await fetch('invalid-url');
    return data.json(); // No error handling
  }

  // Method that modifies parameters
  modifyParam(obj: any) {
    obj.newProperty = 'added';
    obj.existing = 'modified';
    return obj;
  }

  // Method with eval
  evilMethod(code: string) {
    return eval(code);
  }

  // Method that uses deprecated APIs
  deprecatedMethod() {
    return new Date().toDateString();
  }

  // Method with potential XSS
  xssMethod(userInput: string) {
    return `<div>${userInput}</div>`;
  }

  // Method with SQL injection risk
  sqlInjection(userId: string) {
    return `SELECT * FROM users WHERE id = ${userId}`;
  }

  // Method that ignores promises
  ignorePromise() {
    this.someAsyncOperation();
    // No await or .then()
  }

  async someAsyncOperation() {
    return new Promise((resolve) => {
      setTimeout(() => resolve('done'), 1000);
    });
  }
}

// Class that extends but doesn't call super
class BadChild extends BadClass {
  constructor(param1, param2) {
    // Missing super() call
    this.badField = param1;
  }
}

// Class with too many responsibilities
class GodClass {
  // Database operations
  saveToDatabase(data: any) {
    /* ... */
  }
  loadFromDatabase(id: string) {
    /* ... */
  }

  // HTTP operations
  makeHttpRequest(url: string) {
    /* ... */
  }
  handleResponse(response: any) {
    /* ... */
  }

  // File operations
  readFile(path: string) {
    /* ... */
  }
  writeFile(path: string, content: string) {
    /* ... */
  }

  // UI operations
  createElement(tag: string) {
    /* ... */
  }
  renderElement(element: any) {
    /* ... */
  }

  // Business logic
  calculatePrice(base: number, tax: number) {
    /* ... */
  }
  validateEmail(email: string) {
    /* ... */
  }

  // Logging
  logInfo(message: string) {
    /* ... */
  }
  logError(error: any) {
    /* ... */
  }

  // Configuration
  loadConfig() {
    /* ... */
  }
  saveConfig() {
    /* ... */
  }
}

// Class with circular dependency
class CircularA {
  constructor(public b: CircularB) {}
}

class CircularB {
  constructor(public a: CircularA) {}
}

// Class with memory leak
class MemoryLeak {
  private listeners: Function[] = [];

  addListener(listener: Function) {
    this.listeners.push(listener);
    // Never removes listeners
  }

  trigger() {
    this.listeners.forEach((listener) => listener());
  }
}

export { BadClass, BadChild, GodClass, CircularA, CircularB, MemoryLeak };
