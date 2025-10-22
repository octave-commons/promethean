// Immediate no-class violations
// This should trigger the "no class" rule immediately as I type

// 1. Simple class declaration (should trigger no-restricted-syntax immediately)
class SimpleClass {
  constructor() {
    console.log('class created');
  }
}

// 2. Class with properties
class ClassWithProps {
  public prop1: string = 'value1';
  private prop2: number = 42;

  method(): void {
    console.log(this.prop1, this.prop2);
  }
}

// 3. Class expression (should trigger no-restricted-syntax immediately)
const classExpr = class {
  field: string = 'field';

  getField(): string {
    return this.field;
  }
};

// 4. Anonymous class
const anonymous = class {
  data: any[] = [];
};

// 5. Class with inheritance
class BaseClass {
  baseMethod(): string {
    return 'base';
  }
}

class DerivedClass extends BaseClass {
  derivedMethod(): string {
    return 'derived';
  }
}

// 6. Abstract class
abstract class AbstractClass {
  abstract abstractMethod(): string;
}

// 7. Class with static members
class StaticClass {
  static staticProp: string = 'static';
  static staticMethod(): string {
    return 'static method';
  }
}

// 8. Class implementing interface
interface TestInterface {
  test(): string;
}

class Implementation implements TestInterface {
  test(): string {
    return 'implemented';
  }
}

// 9. Generic class
class GenericClass<T> {
  constructor(private value: T) {}

  getValue(): T {
    return this.value;
  }
}

// 10. Class with decorators
@decorator
class DecoratedClass {
  @propertyDecorator
  decoratedProp: string = 'decorated';
}

function decorator(target: any): any {
  return target;
}

function propertyDecorator(target: any, propertyKey: string): any {
  console.log(`Decorating ${propertyKey}`);
}

// 11. Exported class
export class ExportedClass {
  exportMethod(): string {
    return 'exported';
  }
}

// 12. Default export class
export default class DefaultExportClass {
  defaultMethod(): string {
    return 'default export';
  }
}
