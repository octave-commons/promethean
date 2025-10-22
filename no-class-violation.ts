// This file intentionally violates the "no class" rule
// to test the opencode diagnostic feature

class SimpleClass {
  constructor(public value: string) {}

  getValue(): string {
    return this.value;
  }
}

class AnotherClass extends SimpleClass {
  private count: number = 0;

  constructor(value: string, count: number) {
    super(value);
    this.count = count;
  }

  getCount(): number {
    return this.count;
  }
}

// Even more class violations
export class ExportedClass {
  static readonly CONSTANT = 'test';

  private method(): void {
    console.log('method');
  }
}

// Anonymous class expression
const anonymousClass = class {
  field: number = 42;
};

// Class with decorators
@decorator
class DecoratedClass {
  @propertyDecorator
  property: string = 'decorated';
}

function decorator(target: any) {
  return target;
}

function propertyDecorator(target: any, propertyKey: string) {
  console.log(`Decorating ${propertyKey}`);
}
